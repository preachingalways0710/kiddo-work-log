import { supabase } from "@/integrations/supabase/client";

// Job interface matching the Supabase schema
export interface Job {
  id: string;
  title: string;
  description?: string | null;
  estimated_time: number;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assigned_days?: string[] | null;
  category?: 'active' | 'later' | null;
  display_order?: number | null;
  created_at: string;
  updated_at: string;
}

// Work session interface
export interface WorkSession {
  id?: string;
  job_id?: string | null;
  job_title: string;
  start_time: Date;
  end_time?: Date | null;
  duration?: number | null;
  description?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

// Attendance interface
export interface AttendanceRecord {
  id?: string;
  worker_name: string;
  check_in_time?: Date | null;
  check_out_time?: Date | null;
  date: Date;
  is_late_check_in?: boolean | null;
  is_early_check_out?: boolean | null;
  created_at?: Date;
  updated_at?: Date;
}

// Jobs service
export const jobsService = {
  async getAll(): Promise<Job[]> {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getActive(): Promise<Job[]> {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'pending')
      .eq('category', 'active')
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async create(job: Omit<Job, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const { data, error } = await supabase
      .from('jobs')
      .insert(job)
      .select('id')
      .single();
    
    if (error) throw error;
    return data.id;
  },

  async update(id: string, updates: Partial<Job>): Promise<void> {
    const { error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', id);
    
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Work sessions service
export const workSessionsService = {
  async getRecent(limitCount: number = 10): Promise<WorkSession[]> {
    const { data, error } = await supabase
      .from('work_sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limitCount);
    
    if (error) throw error;
    
    return (data || []).map(session => ({
      ...session,
      start_time: new Date(session.start_time),
      end_time: session.end_time ? new Date(session.end_time) : null,
      created_at: session.created_at ? new Date(session.created_at) : undefined,
      updated_at: session.updated_at ? new Date(session.updated_at) : undefined
    }));
  },

  async create(session: Omit<WorkSession, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const { data, error } = await supabase
      .from('work_sessions')
      .insert({
        ...session,
        start_time: session.start_time.toISOString(),
        end_time: session.end_time ? session.end_time.toISOString() : null
      })
      .select('id')
      .single();
    
    if (error) throw error;
    return data.id;
  }
};

// Attendance service
export const attendanceService = {
  async getTodayRecord(workerName: string): Promise<AttendanceRecord | null> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('worker_name', workerName)
      .eq('date', today)
      .maybeSingle();
    
    if (error) throw error;
    
    if (!data) return null;
    
    return {
      ...data,
      date: new Date(data.date),
      check_in_time: data.check_in_time ? new Date(data.check_in_time) : null,
      check_out_time: data.check_out_time ? new Date(data.check_out_time) : null,
      created_at: data.created_at ? new Date(data.created_at) : undefined,
      updated_at: data.updated_at ? new Date(data.updated_at) : undefined
    };
  },

  async getRecent(limitCount: number = 10): Promise<AttendanceRecord[]> {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .order('date', { ascending: false })
      .limit(limitCount);
    
    if (error) throw error;
    
    return (data || []).map(record => ({
      ...record,
      date: new Date(record.date),
      check_in_time: record.check_in_time ? new Date(record.check_in_time) : null,
      check_out_time: record.check_out_time ? new Date(record.check_out_time) : null,
      created_at: record.created_at ? new Date(record.created_at) : undefined,
      updated_at: record.updated_at ? new Date(record.updated_at) : undefined
    }));
  },

  async create(record: Omit<AttendanceRecord, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const { data, error } = await supabase
      .from('attendance')
      .insert({
        ...record,
        date: record.date.toISOString().split('T')[0],
        check_in_time: record.check_in_time ? record.check_in_time.toISOString() : null,
        check_out_time: record.check_out_time ? record.check_out_time.toISOString() : null
      })
      .select('id')
      .single();
    
    if (error) throw error;
    return data.id;
  },

  async update(id: string, updates: Partial<AttendanceRecord>): Promise<void> {
    const updateData: any = { ...updates };
    
    // Convert dates to ISO strings if present
    if (updates.check_in_time) {
      updateData.check_in_time = updates.check_in_time.toISOString();
    }
    if (updates.check_out_time) {
      updateData.check_out_time = updates.check_out_time.toISOString();
    }
    
    const { error } = await supabase
      .from('attendance')
      .update(updateData)
      .eq('id', id);
    
    if (error) throw error;
  }
};