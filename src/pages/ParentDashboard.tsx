import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, CheckCircle, User, Calendar, TrendingUp } from 'lucide-react';
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

const ParentDashboard = () => {
  const [workSessions, setWorkSessions] = useState<WorkSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalHoursThisWeek: '0h 0m',
    jobsCompleted: 0,
    averageJobTime: '0h 0m'
  });

  useEffect(() => {
    fetchWorkSessions();
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
      calculateStats(data || []);
    } catch (error) {
      console.error('Error fetching work sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (sessions: WorkSession[]) => {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    weekStart.setHours(0, 0, 0, 0);

    const thisWeekSessions = sessions.filter(session => 
      new Date(session.start_time) >= weekStart
    );

    const totalMinutes = thisWeekSessions.reduce((sum, session) => 
      sum + (session.duration || 0), 0
    );

    const completedJobs = thisWeekSessions.length;
    const avgMinutes = completedJobs > 0 ? Math.round(totalMinutes / completedJobs) : 0;

    setStats({
      totalHoursThisWeek: formatMinutesToTime(totalMinutes),
      jobsCompleted: completedJobs,
      averageJobTime: formatMinutesToTime(avgMinutes)
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
        </div>

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