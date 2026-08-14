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
}

// Initial Mock Members matching schema
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
  {
    id: "mem-006",
    first_name: "Rashid",
    last_name: "Siddiqui",
    email: "rashid.siddiqui@example.com",
    phone: "(716) 555-0592",
    address: "204 Elmwood Ave, Buffalo, NY 14222",
    created_at: "2026-06-01T08:30:00Z",
  },
  {
    id: "mem-007",
    first_name: "Sumaya",
    last_name: "Osman",
    email: "sumaya.osman@example.com",
    phone: "(716) 555-0674",
    address: "15 French Rd, Depew, NY 14043",
    created_at: "2026-06-20T13:40:00Z",
  },
  {
    id: "mem-008",
    first_name: "Kahlil",
    last_name: "Nasser",
    email: "kahlil.nasser@example.com",
    phone: "(716) 555-0711",
    address: "99 Transit Rd, Lancaster, NY 14086",
    created_at: "2026-07-04T15:10:00Z",
  },
];

// Initial Mock Students matching schema
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
  {
    id: "stu-005",
    first_name: "Harun",
    last_name: "Hassan",
    parent_name: "Bilal Hassan",
    phone_number: "(716) 555-0489",
    address: "77 Sheridan Dr, Tonawanda, NY 14150",
    grade_level: "Grade 3",
    member_parent_id: "mem-005",
    created_at: "2026-05-20T11:15:00Z",
  },
  {
    id: "stu-006",
    first_name: "Aisha",
    last_name: "Siddiqui",
    parent_name: "Rashid Siddiqui",
    phone_number: "(716) 555-0592",
    address: "204 Elmwood Ave, Buffalo, NY 14222",
    grade_level: "Grade 5",
    member_parent_id: "mem-006",
    created_at: "2026-06-05T09:00:00Z",
  },
  {
    id: "stu-007",
    first_name: "Omar",
    last_name: "Osman",
    parent_name: "Sumaya Osman",
    phone_number: "(716) 555-0674",
    address: "15 French Rd, Depew, NY 14043",
    grade_level: "Kindergarten",
    member_parent_id: "mem-007",
    created_at: "2026-06-25T14:30:00Z",
  },
];

// Initial Transactions (member fees & class payments)
export const initialTransactions: Transaction[] = [
  {
    id: "tx-m01",
    type: "member_fee",
    amount: 300.0,
    date: "2026-08-12",
    description: "Annual Family Membership Dues 2026",
    member_id: "mem-001",
    student_id: null,
    payment_method: "Credit Card",
    is_reconciled: true,
    created_at: "2026-08-12T14:30:00Z",
  },
  {
    id: "tx-m02",
    type: "member_fee",
    amount: 300.0,
    date: "2026-08-01",
    description: "Annual Individual Membership Fee",
    member_id: "mem-002",
    student_id: null,
    payment_method: "Zelle",
    is_reconciled: true,
    created_at: "2026-08-01T10:00:00Z",
  },
  {
    id: "tx-m03",
    type: "member_fee",
    amount: 250.0,
    date: "2026-07-15",
    description: "Building Renovation Special Dues",
    member_id: "mem-003",
    student_id: null,
    payment_method: "Check (#1042)",
    is_reconciled: true,
    created_at: "2026-07-15T11:20:00Z",
  },
  {
    id: "tx-m04",
    type: "member_fee",
    amount: 500.0,
    date: "2026-06-30",
    description: "Sustainers Circle Membership Fee",
    member_id: "mem-004",
    student_id: null,
    payment_method: "Bank Transfer",
    is_reconciled: true,
    created_at: "2026-06-30T16:00:00Z",
  },
  {
    id: "tx-c01",
    type: "class_payment",
    amount: 450.0,
    date: "2026-08-10",
    description: "Weekend Quran Academy Tuition - Q3",
    member_id: "mem-001",
    student_id: "stu-001",
    payment_method: "Check (#1042)",
    is_reconciled: false,
    created_at: "2026-08-10T09:15:00Z",
  },
  {
    id: "tx-c02",
    type: "class_payment",
    amount: 450.0,
    date: "2026-07-28",
    description: "Sunday Islamic School Tuition - Fall Term",
    member_id: "mem-002",
    student_id: "stu-002",
    payment_method: "Zelle",
    is_reconciled: true,
    created_at: "2026-07-28T13:45:00Z",
  },
  {
    id: "tx-c03",
    type: "class_payment",
    amount: 350.0,
    date: "2026-07-10",
    description: "Tajweed & Hifz Class Registration",
    member_id: "mem-003",
    student_id: "stu-003",
    payment_method: "Credit Card",
    is_reconciled: true,
    created_at: "2026-07-10T15:20:00Z",
  },
  {
    id: "tx-c04",
    type: "class_payment",
    amount: 450.0,
    date: "2026-06-14",
    description: "Summer Youth Intensive Tuition",
    member_id: "mem-004",
    student_id: "stu-004",
    payment_method: "Cash",
    is_reconciled: true,
    created_at: "2026-06-14T10:00:00Z",
  },
];
