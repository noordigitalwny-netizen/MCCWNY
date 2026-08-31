export interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
}

export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  parent_name: string;
  phone_number: string;
  address: string;
  grade_level: string;
  gender?: "Boy" | "Girl" | string;
  member_parent_id: string | null;
  created_at: string;
}

export interface Attendance {
  id: string;
  student_id: string;
  date: string;
  status: "Present" | "Absent";
  created_at: string;
}

export interface Transaction {
  id: string;
  type: "member_fee" | "class_payment" | "general_donation" | "expense";
  amount: number;
  date: string;
  description: string;
  member_id: string | null;
  student_id: string | null;
  payment_method: string;
  is_reconciled: boolean;
  created_at: string;
  memberName?: string;
}

// Clean Slate: No Mock Seed Data
export const initialMembers: Member[] = [];
export const initialStudents: Student[] = [];
export const initialTransactions: Transaction[] = [];

// Helper to push store updates to server API & Supabase
async function pushToServer(key: string, data: any) {
  if (typeof window === "undefined") return;
  try {
    await fetch("/api/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: data }),
    });
  } catch (e) {
    console.error("Server sync error:", e);
  }
}

// Data Store Helpers for Members
export function getStoredMembers(): Member[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem("mccwny_members");
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error("Error loading members from storage:", e);
  }
  return [];
}

export function saveStoredMembers(members: Member[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("mccwny_members", JSON.stringify(members));
  } catch (e) {
    console.error("Error saving members to storage:", e);
  }
  pushToServer("members", members);
}

// Data Store Helpers for Students
export function getStoredStudents(): Student[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem("mccwny_students");
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error("Error loading students from storage:", e);
  }
  return [];
}

export function saveStoredStudents(students: Student[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("mccwny_students", JSON.stringify(students));
  } catch (e) {
    console.error("Error saving students to storage:", e);
  }
  pushToServer("students", students);
}

// Data Store Helpers for Transactions
export function getStoredTransactions(): Transaction[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem("mccwny_transactions");
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error("Error loading transactions from storage:", e);
  }
  return [];
}

export function saveStoredTransactions(transactions: Transaction[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("mccwny_transactions", JSON.stringify(transactions));
  } catch (e) {
    console.error("Error saving transactions to storage:", e);
  }
  pushToServer("transactions", transactions);
}
