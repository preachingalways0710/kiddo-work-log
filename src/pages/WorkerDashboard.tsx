import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, PlayCircle, PauseCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Job {
  id: string;
  title: string;
  description: string | null;
  estimated_time: number; // in minutes
  status: 'pending' | 'in_progress' | 'completed';
}

const WorkerDashboard = () => {
  const [isWorking, setIsWorking] = useState(false);
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [workDescription, setWorkDescription] = useState('');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAvailableJobs();
  }, []);

  const fetchAvailableJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAvailableJobs((data || []).map(job => ({
        ...job,
        status: job.status as 'pending' | 'in_progress' | 'completed'
      })));
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

  const handleCheckIn = async (job: Job) => {
    try {
      // Update job status to in_progress
      const { error } = await supabase
        .from('jobs')
        .update({ status: 'in_progress' })
        .eq('id', job.id);

      if (error) throw error;

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

  const handleCheckOut = async () => {
    if (workDescription.trim() && currentJob && startTime) {
      const endTime = new Date();
      const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

      try {
        // Create work session record
        const { error: sessionError } = await supabase
          .from('work_sessions')
          .insert({
            job_id: currentJob.id,
            job_title: currentJob.title,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            description: workDescription,
            duration: durationMinutes
          });

        if (sessionError) throw sessionError;

        // Update job status to completed
        const { error: jobError } = await supabase
          .from('jobs')
          .update({ status: 'completed' })
          .eq('id', currentJob.id);

        if (jobError) throw jobError;

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
            <p className="text-muted-foreground">Track your work and complete jobs</p>
          </div>
        </div>

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
                    <h3 className="font-semibold text-lg">{currentJob?.title}</h3>
                    <p className="text-muted-foreground">{currentJob?.description}</p>
                    <Badge variant="secondary" className="mt-2">
                      <Clock className="w-3 h-3 mr-1" />
                      {currentJob ? formatMinutesToTime(currentJob.estimated_time) : ''}
                    </Badge>
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
                    onClick={handleCheckOut}
                    disabled={!workDescription.trim()}
                    className="w-full bg-gradient-to-r from-success to-success/80 hover:from-success/90 hover:to-success/70"
                  >
                    <PauseCircle className="w-4 h-4 mr-2" />
                    Check Out & Complete Job
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
                              <h3 className="font-semibold">{job.title}</h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                {job.description}
                              </p>
                              <Badge variant="outline">
                                <Clock className="w-3 h-3 mr-1" />
                                {formatMinutesToTime(job.estimated_time)}
                              </Badge>
                            </div>
                            <Button
                              onClick={() => handleCheckIn(job)}
                              className="bg-gradient-to-r from-primary to-primary/80"
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