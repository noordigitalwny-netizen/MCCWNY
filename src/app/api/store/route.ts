import { NextResponse } from "next/server";
import {
  initialMembers,
  initialStudents,
  initialTransactions,
  Member,
  Student,
  Transaction,
} from "@/lib/data-store";

// Global server memory store so incognito & cross-device sessions share data
let globalStore = {
  members: initialMembers as Member[],
  students: initialStudents as Student[],
  transactions: initialTransactions as Transaction[],
};

export async function GET() {
  return NextResponse.json(globalStore);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.members) globalStore.members = body.members;
    if (body.students) globalStore.students = body.students;
    if (body.transactions) globalStore.transactions = body.transactions;
    return NextResponse.json({ success: true, store: globalStore });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update store" }, { status: 500 });
  }
}
