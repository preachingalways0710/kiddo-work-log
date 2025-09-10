import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, CheckCircle, User, Calendar, TrendingUp, AlertTriangle, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface WorkSession {
  id: string;
  job_title: string;
  start_time: string;
  end_time: string | null;
  description: string | null;
  duration: number | null; // in minutes
}

interface AttendanceRecord {
  id: string;
  worker_name: string;
  check_in_time: string | null;
  check_out_time: string | null;
  date: string;
  is_late_check_in: boolean;
  is_early_check_out: boolean;
}

const ParentDashboard = () => {
  const [workSessions, setWorkSessions] = useState<WorkSession[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalHoursThisWeek: '0h 0m',
    jobsCompleted: 0,
    averageJobTime: '0h 0m',
    punctualityScore: 100,
    lateCheckIns: 0,
    earlyCheckOuts: 0
  });

  useEffect(() => {
    fetchWorkSessions();
    fetchAttendanceRecords();
  }, []);

  const fetchWorkSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('work_sessions')
        .select('*')
        .not('end_time', 'is', null)
        .order('start_time', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      setWorkSessions(data || []);
    } catch (error) {
      console.error('Error fetching work sessions:', error);
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .order('date', { ascending: false })
        .limit(30); // Last 30 days

      if (error) throw error;
      
      setAttendanceRecords(data || []);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workSessions.length > 0 && attendanceRecords.length > 0) {
      calculateStats();
    }
  }, [workSessions, attendanceRecords]);

  const calculateStats = () => {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    weekStart.setHours(0, 0, 0, 0);

    const thisWeekSessions = workSessions.filter(session => 
      new Date(session.start_time) >= weekStart
    );

    const totalMinutes = thisWeekSessions.reduce((sum, session) => 
      sum + (session.duration || 0), 0
    );

    const completedJobs = thisWeekSessions.length;
    const avgMinutes = completedJobs > 0 ? Math.round(totalMinutes / completedJobs) : 0;

    // Calculate punctuality stats
    const thisWeekAttendance = attendanceRecords.filter(record => 
      new Date(record.date) >= weekStart
    );

    const lateCheckIns = thisWeekAttendance.filter(record => record.is_late_check_in).length;
    const earlyCheckOuts = thisWeekAttendance.filter(record => record.is_early_check_out).length;
    const totalAttendanceDays = thisWeekAttendance.length;
    
    const punctualityScore = totalAttendanceDays > 0 
      ? Math.round(((totalAttendanceDays - lateCheckIns - earlyCheckOuts) / totalAttendanceDays) * 100)
      : 100;

    setStats({
      totalHoursThisWeek: formatMinutesToTime(totalMinutes),
      jobsCompleted: completedJobs,
      averageJobTime: formatMinutesToTime(avgMinutes),
      punctualityScore,
      lateCheckIns,
      earlyCheckOuts
    });
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

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Parent Dashboard</h1>
            <p className="text-muted-foreground">Overview of work activity and progress</p>
          </div>
        </div>

        {/* Stats Overview */}
        {(workSessions.length > 0 || attendanceRecords.length > 0) && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hours This Week</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalHoursThisWeek}</div>
              <p className="text-xs text-muted-foreground">
                This week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jobs Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.jobsCompleted}</div>
              <p className="text-xs text-muted-foreground">
                This week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Job Time</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.averageJobTime}</div>
              <p className="text-xs text-muted-foreground">
                Per completed job
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Punctuality Score</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.punctualityScore}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.lateCheckIns + stats.earlyCheckOuts} violations this week
              </p>
            </CardContent>
          </Card>
          </div>
        )}

        {/* Punctuality Tracking */}
        {attendanceRecords.length > 0 && stats.lateCheckIns + stats.earlyCheckOuts > 0 && (
          <Card className="mb-6 border-warning bg-warning/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-warning">
                <AlertTriangle className="w-5 h-5" />
                Punctuality Alerts
              </CardTitle>
              <CardDescription>
                Issues requiring attention for performance reviews
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {attendanceRecords
                  .filter(record => record.is_late_check_in || record.is_early_check_out)
                  .slice(0, 5)
                  .map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-background rounded-md border">
                      <div>
                        <p className="font-medium">{record.worker_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(record.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {record.is_late_check_in && (
                          <Badge variant="destructive" className="text-xs">
                            Late Check-in: {record.check_in_time ? new Date(record.check_in_time).toLocaleTimeString() : 'N/A'}
                          </Badge>
                        )}
                        {record.is_early_check_out && (
                          <Badge variant="destructive" className="text-xs">
                            Early Check-out: {record.check_out_time ? new Date(record.check_out_time).toLocaleTimeString() : 'N/A'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Work Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Recent Work Sessions
            </CardTitle>
            <CardDescription>
              Latest work activity and descriptions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading work sessions...</p>
                </div>
              ) : workSessions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No work sessions completed yet.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Work sessions will appear here after jobs are completed.
                  </p>
                </div>
              ) : (
                workSessions.map((session) => (
                  <Card key={session.id} className="bg-muted/20">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{session.job_title}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(session.start_time).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                              {session.end_time ? new Date(session.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'In Progress'}
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                          {session.duration ? formatMinutesToTime(session.duration) : 'In Progress'}
                        </Badge>
                      </div>
                      <div className="bg-background p-3 rounded-md border">
                        <p className="text-sm leading-relaxed">{session.description || 'No description provided'}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ParentDashboard;