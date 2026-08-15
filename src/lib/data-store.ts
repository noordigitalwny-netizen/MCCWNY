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
  member_parent_id: string | null;
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

// Initial Mock Seed Data
export const initialMembers: Member[] = [
  {
    id: "mem-001",
    first_name: "Tariq",
    last_name: "Mansoor",
    email: "tariq.mansoor@example.com",
    phone: "(716) 555-0182",
    address: "142 Amherst St, Buffalo, NY 14207",
    created_at: "2026-01-15T10:30:00Z",
  },
  {
    id: "mem-002",
    first_name: "Amina",
    last_name: "Khan",
    email: "amina.khan@example.com",
    phone: "(716) 555-0194",
    address: "88 Niagara Falls Blvd, Williamsville, NY 14221",
    created_at: "2026-02-01T14:15:00Z",
  },
  {
    id: "mem-003",
    first_name: "Zayd",
    last_name: "Farooq",
    email: "zayd.farooq@example.com",
    phone: "(716) 555-0210",
    address: "55 Main St, Cheektowaga, NY 14225",
    created_at: "2026-03-10T09:45:00Z",
  },
  {
    id: "mem-004",
    first_name: "Fatima",
    last_name: "Al-Mansouri",
    email: "fatima.al@example.com",
    phone: "(716) 555-0341",
    address: "312 Delaware Ave, Buffalo, NY 14202",
    created_at: "2026-04-05T11:20:00Z",
  },
  {
    id: "mem-005",
    first_name: "Bilal",
    last_name: "Hassan",
    email: "bilal.hassan@example.com",
    phone: "(716) 555-0489",
    address: "77 Sheridan Dr, Tonawanda, NY 14150",
    created_at: "2026-05-18T16:00:00Z",
  },
];

export const initialStudents: Student[] = [
  {
    id: "stu-001",
    first_name: "Yousef",
    last_name: "Mansoor",
    parent_name: "Tariq Mansoor",
    phone_number: "(716) 555-0182",
    address: "142 Amherst St, Buffalo, NY 14207",
    grade_level: "Grade 4",
    member_parent_id: "mem-001",
    created_at: "2026-01-20T10:00:00Z",
  },
  {
    id: "stu-002",
    first_name: "Zainab",
    last_name: "Khan",
    parent_name: "Amina Khan",
    phone_number: "(716) 555-0194",
    address: "88 Niagara Falls Blvd, Williamsville, NY 14221",
    grade_level: "Grade 6",
    member_parent_id: "mem-002",
    created_at: "2026-02-05T12:30:00Z",
  },
  {
    id: "stu-003",
    first_name: "Ibrahim",
    last_name: "Farooq",
    parent_name: "Zayd Farooq",
    phone_number: "(716) 555-0210",
    address: "55 Main St, Cheektowaga, NY 14225",
    grade_level: "Grade 2",
    member_parent_id: "mem-003",
    created_at: "2026-03-12T14:20:00Z",
  },
  {
    id: "stu-004",
    first_name: "Maryam",
    last_name: "Al-Mansouri",
    parent_name: "Fatima Al-Mansouri",
    phone_number: "(716) 555-0341",
    address: "312 Delaware Ave, Buffalo, NY 14202",
    grade_level: "Grade 8",
    member_parent_id: "mem-004",
    created_at: "2026-04-10T15:45:00Z",
  },
];

export const initialTransactions: Transaction[] = [
  {
    id: "tx-001",
    type: "general_donation",
    amount: 1250.0,
    date: "2026-08-14",
    description: "Friday Community Sadaqah Collection",
    member_id: "mem-001",
    student_id: null,
    payment_method: "Zelle",
    is_reconciled: true,
    created_at: "2026-08-14T12:00:00Z",
    memberName: "Tariq Mansoor",
  },
  {
    id: "tx-002",
    type: "member_fee",
    amount: 300.0,
    date: "2026-08-12",
    description: "Annual Family Membership Dues 2026",
    member_id: "mem-002",
    student_id: null,
    payment_method: "Credit Card",
    is_reconciled: true,
    created_at: "2026-08-12T14:30:00Z",
    memberName: "Amina Khan",
  },
  {
    id: "tx-003",
    type: "class_payment",
    amount: 450.0,
    date: "2026-08-10",
    description: "Weekend Quran Academy Tuition - Q3",
    member_id: "mem-003",
    student_id: "stu-003",
    payment_method: "Check (#1042)",
    is_reconciled: false,
    created_at: "2026-08-10T09:15:00Z",
    memberName: "Zayd Farooq",
  },
  {
    id: "tx-004",
    type: "expense",
    amount: 840.5,
    date: "2026-08-08",
    description: "Facility Utility Payment - National Grid",
    member_id: null,
    student_id: null,
    payment_method: "Bank Transfer",
    is_reconciled: true,
    created_at: "2026-08-08T16:20:00Z",
    memberName: "National Grid",
  },
  {
    id: "tx-005",
    type: "general_donation",
    amount: 2500.0,
    date: "2026-08-05",
    description: "Building Renovation Fund Contribution",
    member_id: "mem-004",
    student_id: null,
    payment_method: "Bank Wire",
    is_reconciled: true,
    created_at: "2026-08-05T11:00:00Z",
    memberName: "Fatima Al-Mansouri",
  },
];

// Persistent LocalStorage Helpers for Members
export function getStoredMembers(): Member[] {
  if (typeof window === "undefined") return initialMembers;
  try {
    const data = localStorage.getItem("mccwny_members");
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error("Error loading members from storage:", e);
  }
  return initialMembers;
}

export function saveStoredMembers(members: Member[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("mccwny_members", JSON.stringify(members));
  } catch (e) {
    console.error("Error saving members to storage:", e);
  }
}

// Persistent LocalStorage Helpers for Students
export function getStoredStudents(): Student[] {
  if (typeof window === "undefined") return initialStudents;
  try {
    const data = localStorage.getItem("mccwny_students");
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error("Error loading students from storage:", e);
  }
  return initialStudents;
}

export function saveStoredStudents(students: Student[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("mccwny_students", JSON.stringify(students));
  } catch (e) {
    console.error("Error saving students to storage:", e);
  }
}

// Persistent LocalStorage Helpers for Transactions
export function getStoredTransactions(): Transaction[] {
  if (typeof window === "undefined") return initialTransactions;
  try {
    const data = localStorage.getItem("mccwny_transactions");
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error("Error loading transactions from storage:", e);
  }
  return initialTransactions;
}

export function saveStoredTransactions(transactions: Transaction[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("mccwny_transactions", JSON.stringify(transactions));
  } catch (e) {
    console.error("Error saving transactions to storage:", e);
  }
}
