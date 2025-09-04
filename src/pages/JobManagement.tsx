import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Clock, Trash2, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Job {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: string;
}

const JobManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    estimatedTime: ''
  });

  // Mock data - will be replaced with Supabase data
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: '1',
      title: 'Clean the garage',
      description: 'Organize tools and sweep the floor',
      estimatedTime: '2 hours',
      status: 'pending',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      title: 'Yard work',
      description: 'Rake leaves and trim bushes',
      estimatedTime: '1.5 hours',
      status: 'pending',
      createdAt: '2024-01-14'
    },
    {
      id: '3',
      title: 'Wash car',
      description: 'Wash and vacuum the family car',
      estimatedTime: '45 minutes',
      status: 'completed',
      createdAt: '2024-01-13'
    }
  ]);

  const handleCreateJob = () => {
    if (jobForm.title && jobForm.description && jobForm.estimatedTime) {
      if (editingJob) {
        // Update existing job
        setJobs(jobs.map(job => 
          job.id === editingJob.id 
            ? { ...job, title: jobForm.title, description: jobForm.description, estimatedTime: jobForm.estimatedTime }
            : job
        ));
      } else {
        // Create new job
        const job: Job = {
          id: Date.now().toString(),
          title: jobForm.title,
          description: jobForm.description,
          estimatedTime: jobForm.estimatedTime,
          status: 'pending',
          createdAt: new Date().toISOString().split('T')[0]
        };
        setJobs([job, ...jobs]);
      }
      resetForm();
      // Here you would save to Supabase
    }
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setJobForm({
      title: job.title,
      description: job.description,
      estimatedTime: job.estimatedTime
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setJobForm({ title: '', description: '', estimatedTime: '' });
    setEditingJob(null);
    setIsDialogOpen(false);
  };

  const handleDeleteJob = (id: string) => {
    setJobs(jobs.filter(job => job.id !== id));
    // Here you would delete from Supabase
  };

  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'in-progress':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'completed':
        return 'bg-success/10 text-success border-success/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Job Management</h1>
              <p className="text-muted-foreground">Create and manage jobs for your worker</p>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-primary/80">
                <Plus className="w-4 h-4 mr-2" />
                Add New Job
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingJob ? 'Edit Job' : 'Create New Job'}</DialogTitle>
                <DialogDescription>
                  {editingJob ? 'Update the job details below.' : 'Add a new job for your worker to complete.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Job Title</label>
                  <Input
                    value={jobForm.title}
                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                    placeholder="e.g., Clean the garage"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={jobForm.description}
                    onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                    placeholder="Detailed description of what needs to be done"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Estimated Time</label>
                  <Input
                    value={jobForm.estimatedTime}
                    onChange={(e) => setJobForm({ ...jobForm, estimatedTime: e.target.value })}
                    placeholder="e.g., 2 hours, 45 minutes"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleCreateJob}
                    disabled={!jobForm.title || !jobForm.description || !jobForm.estimatedTime}
                    className="flex-1 bg-gradient-to-r from-primary to-primary/80"
                  >
                    {editingJob ? 'Update Job' : 'Create Job'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{job.title}</h3>
                      <Badge className={getStatusColor(job.status)}>
                        {job.status.replace('-', ' ')}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{job.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {job.estimatedTime}
                      </div>
                      <span>Created: {new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditJob(job)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteJob(job.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {jobs.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No jobs created yet.</p>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-gradient-to-r from-primary to-primary/80"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Job
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default JobManagement;