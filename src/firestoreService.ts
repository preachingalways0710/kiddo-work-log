import { db } from "./firebaseConfig";
import { collection, addDoc, getDocs, query, orderBy, limit } from "firebase/firestore";

// Add a work session
export async function addWorkSession(workSession: any) {
  await addDoc(collection(db, "work_sessions"), workSession);
}

// Fetch latest work sessions
export async function fetchWorkSessions() {
  const workSessionsRef = collection(db, "work_sessions");
  const q = query(workSessionsRef, orderBy("start_time", "desc"), limit(10));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Add an attendance record
export async function addAttendance(attendance: any) {
  await addDoc(collection(db, "attendance"), attendance);
}

// Fetch latest attendance records
export async function fetchAttendanceRecords() {
  const attendanceRef = collection(db, "attendance");
  const q = query(attendanceRef, orderBy("date", "desc"), limit(30));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
