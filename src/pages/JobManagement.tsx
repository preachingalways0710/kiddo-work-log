import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Plus, Clock, Trash2, Edit, AlertCircle, Archive } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableJobItem } from '@/components/SortableJobItem';

interface Job {
  id: string;
  title: string;
  description: string | null;
  estimated_time: number; // in minutes
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  assigned_days: string[];
  created_at: string;
  category: 'active' | 'later';
  display_order: number;
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs((data || []).map(job => ({
        ...job,
        status: job.status as 'pending' | 'in_progress' | 'completed',
        priority: job.priority as 'high' | 'medium' | 'low',
        assigned_days: job.assigned_days || [],
        category: (job.category as 'active' | 'later') || 'active',
        display_order: job.display_order || 0
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
          const maxOrder = Math.max(0, ...jobs.map(job => job.display_order));
          const { error } = await supabase
            .from('jobs')
            .insert({
              title: jobForm.title,
              description: jobForm.description || null,
              estimated_time: estimatedMinutes,
              status: 'pending',
              priority: jobForm.priority,
              assigned_days: jobForm.assigned_days,
              category: 'active',
              display_order: maxOrder + 1
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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const activeJob = jobs.find(job => job.id === active.id);
      const overJob = jobs.find(job => job.id === over?.id);
      
      if (activeJob && overJob && activeJob.category === overJob.category) {
        const categoryJobs = jobs.filter(job => job.category === activeJob.category);
        const oldIndex = categoryJobs.findIndex(job => job.id === active.id);
        const newIndex = categoryJobs.findIndex(job => job.id === over?.id);
        
        const reorderedJobs = arrayMove(categoryJobs, oldIndex, newIndex);
        
        // Update display_order and priority based on position
        const updates = reorderedJobs.map((job, index) => {
          const priorityMap: { [key: number]: 'high' | 'medium' | 'low' } = {
            0: 'high',
            1: index < Math.ceil(reorderedJobs.length / 3) ? 'high' : 'medium',
            2: 'medium'
          };
          
          const priority = index === 0 ? 'high' : 
                          index < Math.ceil(reorderedJobs.length / 2) ? 'medium' : 'low';
          
          return {
            id: job.id,
            display_order: index,
            priority: priority
          };
        });

        // Update local state immediately for better UX
        setJobs(prevJobs => {
          const newJobs = [...prevJobs];
          const updatedJobsMap = new Map(updates.map(u => [u.id, u]));
          
          return newJobs.map(job => {
            const update = updatedJobsMap.get(job.id);
            if (update) {
              return { ...job, display_order: update.display_order, priority: update.priority as 'high' | 'medium' | 'low' };
            }
            return job;
          });
        });

        // Update database
        try {
          for (const update of updates) {
            await supabase
              .from('jobs')
              .update({ 
                display_order: update.display_order,
                priority: update.priority
              })
              .eq('id', update.id);
          }
          
          toast({
            title: "Success",
            description: "Job order and priorities updated"
          });
        } catch (error) {
          console.error('Error updating job order:', error);
          toast({
            title: "Error",
            description: "Failed to update job order",
            variant: "destructive"
          });
          // Refresh to get correct state
          fetchJobs();
        }
      }
    }
  };

  const handleToggleCategory = async (id: string, newCategory: 'active' | 'later') => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ category: newCategory })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Job moved to ${newCategory}`
      });
      fetchJobs();
    } catch (error) {
      console.error('Error updating job category:', error);
      toast({
        title: "Error",
        description: "Failed to update job category",
        variant: "destructive"
      });
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

        {loading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Loading jobs...</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Active Jobs */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Active Jobs</h2>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={jobs.filter(job => job.category === 'active').map(job => job.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {jobs
                      .filter(job => job.category === 'active')
                      .sort((a, b) => a.display_order - b.display_order)
                      .map((job) => (
                        <SortableJobItem
                          key={job.id}
                          job={job}
                          onEdit={handleEditJob}
                          onDelete={handleDeleteJob}
                          onToggleCategory={handleToggleCategory}
                          formatMinutesToTime={formatMinutesToTime}
                          getStatusColor={getStatusColor}
                          getPriorityColor={getPriorityColor}
                        />
                      ))}
                  </div>
                </SortableContext>
              </DndContext>
              
              {jobs.filter(job => job.category === 'active').length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground mb-4">No active jobs.</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Later/Someday Jobs */}
            {jobs.filter(job => job.category === 'later').length > 0 && (
              <div className="space-y-4 mt-8 pt-8 border-t">
                <div className="flex items-center gap-2">
                  <Archive className="w-5 h-5 text-muted-foreground" />
                  <h2 className="text-2xl font-semibold text-muted-foreground">Later / Someday</h2>
                </div>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={jobs.filter(job => job.category === 'later').map(job => job.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {jobs
                        .filter(job => job.category === 'later')
                        .sort((a, b) => a.display_order - b.display_order)
                        .map((job) => (
                          <SortableJobItem
                            key={job.id}
                            job={job}
                            onEdit={handleEditJob}
                            onDelete={handleDeleteJob}
                            onToggleCategory={handleToggleCategory}
                            formatMinutesToTime={formatMinutesToTime}
                            getStatusColor={getStatusColor}
                            getPriorityColor={getPriorityColor}
                          />
                        ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            )}
          </>
        )}

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