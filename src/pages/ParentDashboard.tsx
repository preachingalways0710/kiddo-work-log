import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, CheckCircle, User, Calendar, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface WorkSession {
  id: string;
  jobTitle: string;
  startTime: string;
  endTime: string;
  description: string;
  duration: string;
}

const ParentDashboard = () => {
  // Mock data - will be replaced with Supabase data
  const workSessions: WorkSession[] = [
    {
      id: '1',
      jobTitle: 'Clean the garage',
      startTime: '2024-01-15 09:00',
      endTime: '2024-01-15 11:30',
      description: 'Organized all the tools on the pegboard, swept the entire floor, and put away summer items in storage boxes.',
      duration: '2h 30m'
    },
    {
      id: '2',
      jobTitle: 'Yard work',
      startTime: '2024-01-14 14:00',
      endTime: '2024-01-14 15:45',
      description: 'Raked all the leaves from the front yard, trimmed the hedge by the driveway, and bagged everything for pickup.',
      duration: '1h 45m'
    },
    {
      id: '3',
      jobTitle: 'Wash car',
      startTime: '2024-01-13 10:00',
      endTime: '2024-01-13 11:00',
      description: 'Washed exterior, cleaned windows inside and out, vacuumed seats and floor mats.',
      duration: '1h 0m'
    }
  ];

  const totalHoursThisWeek = '5h 15m';
  const jobsCompleted = 3;
  const averageJobTime = '1h 45m';

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
              <div className="text-2xl font-bold text-primary">{totalHoursThisWeek}</div>
              <p className="text-xs text-muted-foreground">
                +2h from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jobs Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{jobsCompleted}</div>
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
              <div className="text-2xl font-bold text-primary">{averageJobTime}</div>
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
              {workSessions.map((session) => (
                <Card key={session.id} className="bg-muted/20">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{session.jobTitle}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(session.startTime).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                            {new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                        {session.duration}
                      </Badge>
                    </div>
                    <div className="bg-background p-3 rounded-md border">
                      <p className="text-sm leading-relaxed">{session.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ParentDashboard;