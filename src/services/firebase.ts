import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  DocumentData
} from "firebase/firestore";
import { db } from "../firebase.js";

// Job interface
export interface Job {
  id: string;
  title: string;
  description?: string;
  estimated_time: number;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assigned_days?: string[];
  category?: 'active' | 'later';
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

// Work session interface
export interface WorkSession {
  id?: string;
  job_id?: string;
  job_title: string;
  start_time: Date;
  end_time?: Date;
  duration?: number;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}

// Attendance interface
export interface AttendanceRecord {
  id?: string;
  worker_name: string;
  check_in_time?: Date;
  check_out_time?: Date;
  date: Date;
  is_late_check_in?: boolean;
  is_early_check_out?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

// Jobs service
export const jobsService = {
  async getAll(): Promise<Job[]> {
    const querySnapshot = await getDocs(collection(db, "jobs"));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate()?.toISOString(),
      updated_at: doc.data().updated_at?.toDate()?.toISOString()
    } as Job));
  },

  async getActive(): Promise<Job[]> {
    const q = query(
      collection(db, "jobs"),
      where("status", "==", "pending"),
      where("category", "==", "active"),
      orderBy("display_order", "asc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate(),
      updated_at: doc.data().updated_at?.toDate()
    } as Job));
  },

  async create(job: Omit<Job, 'id'>): Promise<string> {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, "jobs"), {
      ...job,
      created_at: now,
      updated_at: now
    });
    return docRef.id;
  },

  async update(id: string, updates: Partial<Job>): Promise<void> {
    const jobRef = doc(db, "jobs", id);
    await updateDoc(jobRef, {
      ...updates,
      updated_at: Timestamp.now()
    });
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, "jobs", id));
  }
};

// Work sessions service
export const workSessionsService = {
  async getRecent(limitCount: number = 10): Promise<WorkSession[]> {
    const q = query(
      collection(db, "work_sessions"),
      orderBy("created_at", "desc"),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      start_time: doc.data().start_time?.toDate(),
      end_time: doc.data().end_time?.toDate(),
      created_at: doc.data().created_at?.toDate(),
      updated_at: doc.data().updated_at?.toDate()
    } as WorkSession));
  },

  async create(session: Omit<WorkSession, 'id'>): Promise<string> {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, "work_sessions"), {
      ...session,
      start_time: Timestamp.fromDate(session.start_time),
      end_time: session.end_time ? Timestamp.fromDate(session.end_time) : null,
      created_at: now,
      updated_at: now
    });
    return docRef.id;
  }
};

// Attendance service
export const attendanceService = {
  async getTodayRecord(workerName: string): Promise<AttendanceRecord | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const q = query(
      collection(db, "attendance"),
      where("worker_name", "==", workerName),
      where("date", ">=", Timestamp.fromDate(today)),
      where("date", "<", Timestamp.fromDate(tomorrow))
    );
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate(),
      check_in_time: doc.data().check_in_time?.toDate(),
      check_out_time: doc.data().check_out_time?.toDate(),
      created_at: doc.data().created_at?.toDate(),
      updated_at: doc.data().updated_at?.toDate()
    } as AttendanceRecord;
  },

  async getRecent(limitCount: number = 10): Promise<AttendanceRecord[]> {
    const q = query(
      collection(db, "attendance"),
      orderBy("date", "desc"),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate(),
      check_in_time: doc.data().check_in_time?.toDate(),
      check_out_time: doc.data().check_out_time?.toDate(),
      created_at: doc.data().created_at?.toDate(),
      updated_at: doc.data().updated_at?.toDate()
    } as AttendanceRecord));
  },

  async create(record: Omit<AttendanceRecord, 'id'>): Promise<string> {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, "attendance"), {
      ...record,
      date: Timestamp.fromDate(record.date),
      check_in_time: record.check_in_time ? Timestamp.fromDate(record.check_in_time) : null,
      check_out_time: record.check_out_time ? Timestamp.fromDate(record.check_out_time) : null,
      created_at: now,
      updated_at: now
    });
    return docRef.id;
  },

  async update(id: string, updates: Partial<AttendanceRecord>): Promise<void> {
    const attendanceRef = doc(db, "attendance", id);
    const updateData: any = {
      ...updates,
      updated_at: Timestamp.now()
    };
    
    // Convert dates to Timestamps if present
    if (updates.check_in_time) {
      updateData.check_in_time = Timestamp.fromDate(updates.check_in_time);
    }
    if (updates.check_out_time) {
      updateData.check_out_time = Timestamp.fromDate(updates.check_out_time);
    }
    
    await updateDoc(attendanceRef, updateData);
  }
};