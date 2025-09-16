import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Clock, CheckCircle, PlayCircle, PauseCircle, ArrowLeft, UserCheck, UserX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { jobsService, workSessionsService, attendanceService, Job, AttendanceRecord } from '@/services/database';
import { useToast } from '@/hooks/use-toast';

const WorkerDashboard = () => {
  const [isWorking, setIsWorking] = useState(false);
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [workDescription, setWorkDescription] = useState('');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [workerName, setWorkerName] = useState('');
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAvailableJobs();
    checkTodayAttendance();
    
    // Get worker name from localStorage or prompt
    const savedName = localStorage.getItem('workerName');
    if (savedName) {
      setWorkerName(savedName);
    }
  }, []);

  const checkTodayAttendance = async () => {
    try {
      const savedName = localStorage.getItem('workerName') || 'Worker';
      const data = await attendanceService.getTodayRecord(savedName);
      
      if (data) {
        setTodayAttendance(data);
        setIsCheckedIn(!!data.check_in_time && !data.check_out_time);
      }
    } catch (error) {
      console.error('Error checking today attendance:', error);
    }
  };

  const fetchAvailableJobs = async () => {
    try {
      const data = await jobsService.getActive();
      
      // Get current day name
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      
      // Filter jobs for today or jobs without assigned days
      const filteredJobs = (data || []).filter(job => {
        const assignedDays = job.assigned_days || [];
        return assignedDays.length === 0 || assignedDays.includes(today);
      });
      
      setAvailableJobs(filteredJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        title: "Error",
        description: "Failed to load available jobs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatMinutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0 && remainingMinutes > 0) {
      return `${hours}h ${remainingMinutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${remainingMinutes}m`;
    }
  };

  const getPriorityColor = (priority: Job['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'low':
        return 'bg-success/10 text-success border-success/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const handleCheckIn = async () => {
    if (!workerName.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name first",
        variant: "destructive"
      });
      return;
    }

    try {
      const now = new Date();
      const isLate = now.getHours() > 16; // After 4 PM

      localStorage.setItem('workerName', workerName);

      const recordId = await attendanceService.create({
        worker_name: workerName,
        date: new Date(),
        check_in_time: now,
        is_late_check_in: isLate
      });

      const newRecord = await attendanceService.getTodayRecord(workerName);
      setTodayAttendance(newRecord);
      setIsCheckedIn(true);
      
      toast({
        title: isLate ? "Checked in (Late)" : "Checked in",
        description: isLate ? "Note: Check-in after 4 PM" : `Checked in at ${now.toLocaleTimeString()}`,
        variant: isLate ? "destructive" : "default"
      });
    } catch (error) {
      console.error('Error checking in:', error);
      toast({
        title: "Error",
        description: "Failed to check in",
        variant: "destructive"
      });
    }
  };

  const handleCheckOut = async () => {
    if (!todayAttendance || !isCheckedIn) return;

    try {
      const now = new Date();
      const isEarly = now.getHours() < 18; // Before 6 PM

      if (todayAttendance.id) {
        await attendanceService.update(todayAttendance.id, {
          check_out_time: now,
          is_early_check_out: isEarly
        });
      }

      const updatedRecord = await attendanceService.getTodayRecord(workerName);
      setTodayAttendance(updatedRecord);
      setIsCheckedIn(false);
      
      toast({
        title: isEarly ? "Checked out (Early)" : "Checked out",
        description: isEarly ? "Note: Check-out before 6 PM" : `Checked out at ${now.toLocaleTimeString()}`,
        variant: isEarly ? "destructive" : "default"
      });
    } catch (error) {
      console.error('Error checking out:', error);
      toast({
        title: "Error",
        description: "Failed to check out",
        variant: "destructive"
      });
    }
  };

  const handleStartJob = async (job: Job) => {
    if (!isCheckedIn) {
      toast({
        title: "Error",
        description: "You must check in first before starting a job",
        variant: "destructive"
      });
      return;
    }

    try {
      // Update job status to in_progress
      if (job.id) {
        await jobsService.update(job.id, { status: 'in_progress' });
      }

      setCurrentJob(job);
      setIsWorking(true);
      setStartTime(new Date());
      setWorkDescription('');
      
      toast({
        title: "Started working",
        description: `Started working on: ${job.title}`
      });
    } catch (error) {
      console.error('Error starting job:', error);
      toast({
        title: "Error",
        description: "Failed to start job",
        variant: "destructive"
      });
    }
  };

  const handleCompleteJob = async () => {
    if (workDescription.trim() && currentJob && startTime) {
      const endTime = new Date();
      const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

      try {
        // Create work session record
        await workSessionsService.create({
          job_id: currentJob.id,
          job_title: currentJob.title,
          start_time: startTime,
          end_time: endTime,
          description: workDescription,
          duration: durationMinutes
        });

        // Update job status to completed
        if (currentJob.id) {
          await jobsService.update(currentJob.id, { status: 'completed' });
        }

        toast({
          title: "Job completed!",
          description: `Successfully completed: ${currentJob.title}`
        });

        setIsWorking(false);
        setCurrentJob(null);
        setWorkDescription('');
        setStartTime(null);
        fetchAvailableJobs(); // Refresh the job list
      } catch (error) {
        console.error('Error completing job:', error);
        toast({
          title: "Error",
          description: "Failed to complete job",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Work Dashboard</h1>
            <p className="text-muted-foreground">Check in/out and complete assigned jobs</p>
          </div>
        </div>

        {/* Check-in/Check-out Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isCheckedIn ? (
                <UserCheck className="w-5 h-5 text-success" />
              ) : (
                <UserX className="w-5 h-5 text-muted-foreground" />
              )}
              Daily Attendance
            </CardTitle>
            <CardDescription>
              Work hours: 4:00 PM - 6:00 PM
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isCheckedIn && (
              <div>
                <label className="text-sm font-medium">Your Name</label>
                <Input
                  value={workerName}
                  onChange={(e) => setWorkerName(e.target.value)}
                  placeholder="Enter your name"
                  className="mt-1"
                />
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div>
                {todayAttendance?.check_in_time && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">{todayAttendance.worker_name}</span> checked in: {todayAttendance.check_in_time.toLocaleTimeString()}
                    {todayAttendance.is_late_check_in && (
                      <Badge variant="destructive" className="ml-2">Late</Badge>
                    )}
                  </p>
                )}
                {todayAttendance?.check_out_time && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">{todayAttendance.worker_name}</span> checked out: {todayAttendance.check_out_time.toLocaleTimeString()}
                    {todayAttendance.is_early_check_out && (
                      <Badge variant="destructive" className="ml-2">Early</Badge>
                    )}
                  </p>
                )}
              </div>
              
              <div className="flex gap-2">
                {!isCheckedIn ? (
                  <Button
                    onClick={handleCheckIn}
                    disabled={!workerName.trim() || !!todayAttendance?.check_out_time}
                    className="bg-gradient-to-r from-success to-success/80"
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Check In
                  </Button>
                ) : (
                  <Button
                    onClick={handleCheckOut}
                    variant="outline"
                    className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <UserX className="w-4 h-4 mr-2" />
                    Check Out
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {isWorking ? (
          <div className="space-y-6">
            <Card className="border-success bg-success/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-success" />
                  <CardTitle className="text-success">Currently Working</CardTitle>
                </div>
                <CardDescription>
                  Started at {startTime?.toLocaleTimeString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{currentJob?.title}</h3>
                      {currentJob && (
                        <Badge className={getPriorityColor(currentJob.priority)}>
                          {currentJob.priority} priority
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground">{currentJob?.description || 'No description provided'}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">
                        <Clock className="w-3 h-3 mr-1" />
                        {currentJob ? formatMinutesToTime(currentJob.estimated_time) : ''}
                      </Badge>
                      {currentJob && currentJob.assigned_days && currentJob.assigned_days.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {currentJob.assigned_days.map((day) => (
                            <Badge key={day} variant="outline" className="text-xs">
                              {day.slice(0, 3)}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      What did you do? (Required to check out)
                    </label>
                    <Textarea
                      value={workDescription}
                      onChange={(e) => setWorkDescription(e.target.value)}
                      placeholder="Describe what you accomplished during this work session..."
                      className="min-h-[100px]"
                    />
                  </div>
                  <Button
                    onClick={handleCompleteJob}
                    disabled={!workDescription.trim()}
                    className="w-full bg-gradient-to-r from-success to-success/80 hover:from-success/90 hover:to-success/70"
                  >
                    <PauseCircle className="w-4 h-4 mr-2" />
                    Complete Job
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Jobs</CardTitle>
                <CardDescription>
                  Choose a job to start working on
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Loading available jobs...</p>
                    </div>
                  ) : availableJobs.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No jobs available right now.</p>
                    </div>
                  ) : (
                    availableJobs.map((job) => (
                      <Card key={job.id} className="relative">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg">{job.title}</h3>
                                <Badge className={getPriorityColor(job.priority)}>
                                  {job.priority} priority
                                </Badge>
                              </div>
                              <p className="text-muted-foreground mb-3">{job.description || 'No description provided'}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {formatMinutesToTime(job.estimated_time)}
                                </Badge>
                                {job.assigned_days && job.assigned_days.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {job.assigned_days.map((day) => (
                                      <Badge key={day} variant="outline" className="text-xs">
                                        {day.slice(0, 3)}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <Button
                              onClick={() => handleStartJob(job)}
                              disabled={!isCheckedIn}
                              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                            >
                              <PlayCircle className="w-4 h-4 mr-2" />
                              Start Job
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerDashboard;