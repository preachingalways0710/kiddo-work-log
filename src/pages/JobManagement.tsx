import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Plus, Clock, Trash2, Edit, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Job {
  id: string;
  title: string;
  description: string | null;
  estimated_time: number; // in minutes
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  assigned_days: string[];
  created_at: string;
}

const JobManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    estimatedTime: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    assigned_days: [] as string[]
  });
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Sort by priority: high -> medium -> low
      const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
      const sortedData = (data || []).sort((a, b) => {
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 3;
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 3;
        return aPriority - bPriority;
      });

      if (error) throw error;
      setJobs(sortedData.map(job => ({
        ...job,
        status: job.status as 'pending' | 'in_progress' | 'completed',
        priority: job.priority as 'high' | 'medium' | 'low',
        assigned_days: job.assigned_days || []
      })));
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        title: "Error",
        description: "Failed to load jobs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async () => {
    if (jobForm.title && jobForm.estimatedTime) {
      const estimatedMinutes = parseTimeToMinutes(jobForm.estimatedTime);
      
      try {
        if (editingJob) {
          // Update existing job
          const { error } = await supabase
            .from('jobs')
            .update({
              title: jobForm.title,
              description: jobForm.description || null,
              estimated_time: estimatedMinutes,
              priority: jobForm.priority,
              assigned_days: jobForm.assigned_days
            })
            .eq('id', editingJob.id);

          if (error) throw error;
          toast({
            title: "Success",
            description: "Job updated successfully"
          });
        } else {
          // Create new job
          const { error } = await supabase
            .from('jobs')
            .insert({
              title: jobForm.title,
              description: jobForm.description || null,
              estimated_time: estimatedMinutes,
              status: 'pending',
              priority: jobForm.priority,
              assigned_days: jobForm.assigned_days
            });

          if (error) throw error;
          toast({
            title: "Success",
            description: "Job created successfully"
          });
        }
        
        resetForm();
        fetchJobs();
      } catch (error) {
        console.error('Error saving job:', error);
        toast({
          title: "Error",
          description: "Failed to save job",
          variant: "destructive"
        });
      }
    }
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setJobForm({
      title: job.title,
      description: job.description || '',
      estimatedTime: formatMinutesToTime(job.estimated_time),
      priority: job.priority,
      assigned_days: job.assigned_days
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setJobForm({ title: '', description: '', estimatedTime: '', priority: 'medium', assigned_days: [] });
    setEditingJob(null);
    setIsDialogOpen(false);
  };

  const handleDeleteJob = async (id: string) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Job deleted successfully"
      });
      fetchJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive"
      });
    }
  };

  // Helper functions
  const parseTimeToMinutes = (timeStr: string): number => {
    const hours = timeStr.match(/(\d+(?:\.\d+)?)\s*h/i);
    const minutes = timeStr.match(/(\d+)\s*m/i);
    
    let totalMinutes = 0;
    if (hours) totalMinutes += parseFloat(hours[1]) * 60;
    if (minutes) totalMinutes += parseInt(minutes[1]);
    
    return totalMinutes || 60; // Default to 60 minutes if parsing fails
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

  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'in_progress':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'completed':
        return 'bg-success/10 text-success border-success/20';
      default:
        return 'bg-muted text-muted-foreground';
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

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleDayToggle = (day: string, checked: boolean) => {
    if (checked) {
      setJobForm({ ...jobForm, assigned_days: [...jobForm.assigned_days, day] });
    } else {
      setJobForm({ ...jobForm, assigned_days: jobForm.assigned_days.filter(d => d !== day) });
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
                  <label className="text-sm font-medium">Description (Optional)</label>
                  <Textarea
                    value={jobForm.description}
                    onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                    placeholder="Detailed description of what needs to be done (optional)"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={jobForm.priority} onValueChange={(value: 'high' | 'medium' | 'low') => setJobForm({ ...jobForm, priority: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-destructive" />
                          High Priority
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-warning" />
                          Medium Priority
                        </div>
                      </SelectItem>
                      <SelectItem value="low">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-success" />
                          Low Priority
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Assigned Days</label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {daysOfWeek.map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={day}
                          checked={jobForm.assigned_days.includes(day)}
                          onCheckedChange={(checked) => handleDayToggle(day, checked as boolean)}
                        />
                        <label htmlFor={day} className="text-sm">{day}</label>
                      </div>
                    ))}
                  </div>
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
                    disabled={!jobForm.title || !jobForm.estimatedTime}
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
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Loading jobs...</p>
              </CardContent>
            </Card>
          ) : jobs.map((job) => (
            <Card key={job.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{job.title}</h3>
                      <Badge className={getStatusColor(job.status)}>
                        {job.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={getPriorityColor(job.priority)}>
                        {job.priority} priority
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{job.description || 'No description provided'}</p>
                    {job.assigned_days.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {job.assigned_days.map((day) => (
                          <Badge key={day} variant="outline" className="text-xs">
                            {day.slice(0, 3)}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatMinutesToTime(job.estimated_time)}
                      </div>
                      <span>Created: {new Date(job.created_at).toLocaleDateString()}</span>
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