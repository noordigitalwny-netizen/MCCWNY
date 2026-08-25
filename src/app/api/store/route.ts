import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Member, Student, Transaction } from "@/lib/data-store";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ziugkjvrxnkxkjvhpqyq.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppdWdranZyeG5reGtqdmhwcXlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NDc0MjMsImV4cCI6MjEwMjMyMzQyM30.NhpdGb0ff9cR5rebN06SeAdEgk6Bm_nYHI-pyLgczdI";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

let memoryStore = {
  members: [] as Member[],
  students: [] as Student[],
  transactions: [] as Transaction[],
};

export async function GET() {
  try {
    const [memRes, stuRes, txRes] = await Promise.all([
      supabase.from("members").select("*").order("created_at", { ascending: false }),
      supabase.from("students").select("*").order("created_at", { ascending: false }),
      supabase.from("transactions").select("*").order("date", { ascending: false }),
    ]);

    if (memRes.data) memoryStore.members = memRes.data;
    if (stuRes.data) memoryStore.students = stuRes.data;
    if (txRes.data) memoryStore.transactions = txRes.data;

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
      if (body.members.length > 0) {
        await supabase.from("members").upsert(body.members);
      }
    }
    if (body.students) {
      memoryStore.students = body.students;
      if (body.students.length > 0) {
        await supabase.from("students").upsert(body.students);
      }
    }
    if (body.transactions) {
      memoryStore.transactions = body.transactions;
      if (body.transactions.length > 0) {
        await supabase.from("transactions").upsert(body.transactions);
      }
    }

    return NextResponse.json({ success: true, store: memoryStore });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update store" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get("table");
    const id = searchParams.get("id");

    if (table && id) {
      await supabase.from(table).delete().eq("id", id);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete record" }, { status: 500 });
  }
}
