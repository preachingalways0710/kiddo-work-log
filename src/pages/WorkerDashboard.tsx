import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, PlayCircle, PauseCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Job {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  status: 'pending' | 'in-progress' | 'completed';
}

const WorkerDashboard = () => {
  const [isWorking, setIsWorking] = useState(false);
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [workDescription, setWorkDescription] = useState('');
  const [startTime, setStartTime] = useState<Date | null>(null);

  // Mock data - will be replaced with Supabase data
  const [availableJobs] = useState<Job[]>([
    {
      id: '1',
      title: 'Clean the garage',
      description: 'Organize tools and sweep the floor',
      estimatedTime: '2 hours',
      status: 'pending'
    },
    {
      id: '2',
      title: 'Yard work',
      description: 'Rake leaves and trim bushes',
      estimatedTime: '1.5 hours',
      status: 'pending'
    },
    {
      id: '3',
      title: 'Wash car',
      description: 'Wash and vacuum the family car',
      estimatedTime: '45 minutes',
      status: 'pending'
    }
  ]);

  const handleCheckIn = (job: Job) => {
    setCurrentJob(job);
    setIsWorking(true);
    setStartTime(new Date());
    setWorkDescription('');
  };

  const handleCheckOut = () => {
    if (workDescription.trim()) {
      // Here you would save to Supabase
      console.log('Work completed:', {
        job: currentJob,
        description: workDescription,
        startTime,
        endTime: new Date()
      });
      setIsWorking(false);
      setCurrentJob(null);
      setWorkDescription('');
      setStartTime(null);
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
                      {currentJob?.estimatedTime}
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
                  {availableJobs.map((job) => (
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
                              {job.estimatedTime}
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
                  ))}
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