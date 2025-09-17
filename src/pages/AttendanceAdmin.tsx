import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Save, X, Clock, Calendar, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { attendanceService, AttendanceRecord } from '@/services/database';
import { useToast } from '@/hooks/use-toast';

const AttendanceAdmin = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    check_in_time: '',
    check_out_time: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  const fetchAttendanceRecords = async () => {
    try {
      const data = await attendanceService.getRecent(30);
      setAttendanceRecords(data || []);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTimeForInput = (date: Date | null): string => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
  };

  const startEdit = (record: AttendanceRecord) => {
    setEditingId(record.id);
    setEditForm({
      check_in_time: formatDateTimeForInput(record.check_in_time),
      check_out_time: formatDateTimeForInput(record.check_out_time)
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ check_in_time: '', check_out_time: '' });
  };

  const saveEdit = async (recordId: string) => {
    try {
      const updateData: Partial<AttendanceRecord> = {};
      
      if (editForm.check_in_time) {
        updateData.check_in_time = new Date(editForm.check_in_time);
      }
      
      if (editForm.check_out_time) {
        updateData.check_out_time = new Date(editForm.check_out_time);
      } else {
        updateData.check_out_time = null;
      }

      await attendanceService.update(recordId, updateData);
      
      toast({
        title: "Success",
        description: "Attendance record updated successfully"
      });
      
      fetchAttendanceRecords();
      cancelEdit();
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast({
        title: "Error",
        description: "Failed to update attendance record",
        variant: "destructive"
      });
    }
  };

  const addCheckOut = async (recordId: string) => {
    try {
      const now = new Date();
      await attendanceService.update(recordId, {
        check_out_time: now,
        is_early_check_out: now.getHours() < 18
      });
      
      toast({
        title: "Success",
        description: "Check-out time added"
      });
      
      fetchAttendanceRecords();
    } catch (error) {
      console.error('Error adding check-out:', error);
      toast({
        title: "Error",
        description: "Failed to add check-out time",
        variant: "destructive"
      });
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
            <h1 className="text-3xl font-bold">Attendance Admin</h1>
            <p className="text-muted-foreground">Edit and manage attendance records</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Attendance Records
            </CardTitle>
            <CardDescription>
              Edit check-in and check-out times, add missing check-outs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading attendance records...</p>
                </div>
              ) : attendanceRecords.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No attendance records found.</p>
                </div>
              ) : (
                attendanceRecords.map((record) => (
                  <Card key={record.id} className="bg-muted/20">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{record.worker_name}</h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {record.date.toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!record.check_out_time && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Missing Check-out
                            </Badge>
                          )}
                          {record.is_late_check_in && (
                            <Badge variant="destructive" className="text-xs">Late Check-in</Badge>
                          )}
                          {record.is_early_check_out && (
                            <Badge variant="destructive" className="text-xs">Early Check-out</Badge>
                          )}
                        </div>
                      </div>

                      {editingId === record.id ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="check_in_time">Check-in Time</Label>
                              <Input
                                id="check_in_time"
                                type="datetime-local"
                                value={editForm.check_in_time}
                                onChange={(e) => setEditForm(prev => ({ ...prev, check_in_time: e.target.value }))}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="check_out_time">Check-out Time</Label>
                              <Input
                                id="check_out_time"
                                type="datetime-local"
                                value={editForm.check_out_time}
                                onChange={(e) => setEditForm(prev => ({ ...prev, check_out_time: e.target.value }))}
                                className="mt-1"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => saveEdit(record.id)}
                              size="sm"
                              className="bg-gradient-to-r from-success to-success/80"
                            >
                              <Save className="w-4 h-4 mr-2" />
                              Save Changes
                            </Button>
                            <Button
                              onClick={cancelEdit}
                              variant="outline"
                              size="sm"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Check-in:</span>{' '}
                              {record.check_in_time ? (
                                <span>
                                  {record.check_in_time.toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">Not recorded</span>
                              )}
                            </div>
                            <div>
                              <span className="font-medium">Check-out:</span>{' '}
                              {record.check_out_time ? (
                                <span>
                                  {record.check_out_time.toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">Not recorded</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button
                              onClick={() => startEdit(record)}
                              variant="outline"
                              size="sm"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Times
                            </Button>
                            {!record.check_out_time && (
                              <Button
                                onClick={() => addCheckOut(record.id)}
                                variant="outline"
                                size="sm"
                                className="border-success text-success hover:bg-success hover:text-success-foreground"
                              >
                                <Clock className="w-4 h-4 mr-2" />
                                Add Check-out Now
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
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

export default AttendanceAdmin;