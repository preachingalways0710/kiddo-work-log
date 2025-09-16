import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Edit, Trash2, GripVertical, Archive } from 'lucide-react';
import { Job } from '@/services/database';

interface SortableJobItemProps {
  job: Job;
  onEdit: (job: Job) => void;
  onDelete: (id: string) => void;
  onToggleCategory: (id: string, category: 'active' | 'later') => void;
  formatMinutesToTime: (minutes: number) => string;
  getStatusColor: (status: Job['status']) => string;
  getPriorityColor: (priority: Job['priority']) => string;
}

export const SortableJobItem = ({
  job,
  onEdit,
  onDelete,
  onToggleCategory,
  formatMinutesToTime,
  getStatusColor,
  getPriorityColor
}: SortableJobItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className={isDragging ? 'z-50' : ''}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div
              {...attributes}
              {...listeners}
              className="mt-1 cursor-grab active:cursor-grabbing hover:bg-muted rounded p-1"
            >
              <GripVertical className="w-4 h-4 text-muted-foreground" />
            </div>
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
              {job.assigned_days && job.assigned_days.length > 0 && (
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
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleCategory(job.id, job.category === 'active' ? 'later' : 'active')}
              title={job.category === 'active' ? 'Move to Later' : 'Move to Active'}
            >
              <Archive className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(job)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(job.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};