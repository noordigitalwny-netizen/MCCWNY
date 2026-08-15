import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  initialMembers,
  initialStudents,
  initialTransactions,
  Member,
  Student,
  Transaction,
} from "@/lib/data-store";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ziugkjvrxnkxkjvhpqyq.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppdWdranZyeG5reGtqdmhwcXlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NDc0MjMsImV4cCI6MjEwMjMyMzQyM30.NhpdGb0ff9cR5rebN06SeAdEgk6Bm_nYHI-pyLgczdI";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Memory fallback store
let memoryStore = {
  members: initialMembers as Member[],
  students: initialStudents as Student[],
  transactions: initialTransactions as Transaction[],
};

export async function GET() {
  try {
    const [memRes, stuRes, txRes] = await Promise.all([
      supabase.from("members").select("*"),
      supabase.from("students").select("*"),
      supabase.from("transactions").select("*"),
    ]);

    if (memRes.data && memRes.data.length > 0) {
      memoryStore.members = memRes.data;
    }
    if (stuRes.data && stuRes.data.length > 0) {
      memoryStore.students = stuRes.data;
    }
    if (txRes.data && txRes.data.length > 0) {
      memoryStore.transactions = txRes.data;
    }

    return NextResponse.json(memoryStore);
  } catch (error) {
    return NextResponse.json(memoryStore);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.members) {
      memoryStore.members = body.members;
      // Upsert into Supabase members table
      await supabase.from("members").upsert(body.members);
    }
    if (body.students) {
      memoryStore.students = body.students;
      // Upsert into Supabase students table
      await supabase.from("students").upsert(body.students);
    }
    if (body.transactions) {
      memoryStore.transactions = body.transactions;
      // Upsert into Supabase transactions table
      await supabase.from("transactions").upsert(body.transactions);
    }

    return NextResponse.json({ success: true, store: memoryStore });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update store" }, { status: 500 });
  }
}
