"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Student, Member, Transaction } from "@/lib/data-store";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  GraduationCap,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Receipt,
  CheckCircle2,
  Clock,
  CreditCard,
  User,
  BookOpen,
  Link2,
  ShieldCheck,
} from "lucide-react";

export default function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const studentId = resolvedParams.id;
  const supabase = createClient();

  const [student, setStudent] = useState<Student | null>(null);
  const [linkedMember, setLinkedMember] = useState<Member | null>(null);
  const [classPayments, setClassPayments] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudentDetail() {
      setLoading(true);
      try {
        const [stuRes, txRes] = await Promise.all([
          supabase.from("students").select("*").eq("id", studentId).single(),
          supabase.from("transactions").select("*").eq("student_id", studentId),
        ]);

        if (stuRes.data) {
          const stuData = stuRes.data as Student;
          setStudent(stuData);

          if (stuData.member_parent_id) {
            const { data: memData } = await supabase
              .from("members")
              .select("*")
              .eq("id", stuData.member_parent_id)
              .single();
            if (memData) setLinkedMember(memData as Member);
          }
        }

        if (txRes.data) {
          setClassPayments(
            (txRes.data as Transaction[]).filter((t) => t.type === "class_payment")
          );
        }
      } catch (err) {
        console.error("Error loading student detail from Supabase:", err);
      } finally {
        setLoading(false);
      }
    }

    loadStudentDetail();
  }, [studentId]);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-400">
        Loading student record from Supabase...
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Student Not Found
        </h2>
        <p className="text-xs text-slate-500">
          The requested student record (ID: {studentId}) does not exist in your database.
        </p>
        <Link
          href="/students"
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl shadow-md"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Roster
        </Link>
      </div>
    );
  }

  const totalTuitionPaid = classPayments.reduce(
    (acc, curr) => acc + curr.amount,
    0
  );

  return (
    <div className="space-y-8">
      {/* Back Button & Header */}
      <div>
        <Link
          href="/students"
          className="inline-flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Students Roster</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white font-extrabold text-xl flex items-center justify-center shadow-lg shadow-purple-900/30">
              {student.first_name?.[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {student.first_name} {student.last_name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800 text-xs font-semibold">
                  {student.grade_level || "Grade 1"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                Student ID: {student.id}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Student Details Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Info Card */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            Student & Guardian Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                Parent / Guardian Name
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {student.parent_name}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                Linked Member Profile
              </span>
              {linkedMember ? (
                <p className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5" />
                  <Link href={`/members/${linkedMember.id}`} className="hover:underline">
                    {linkedMember.first_name} {linkedMember.last_name} ({linkedMember.id})
                  </Link>
                </p>
              ) : (
                <p className="text-slate-400 italic">No Member Profile Linked</p>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                Guardian Phone Number
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {student.phone_number || "—"}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                Grade Level & Program
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                {student.grade_level || "Grade 1"} - Weekend Academy
              </p>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                Home Address
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {student.address || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Tuition Summary Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <DollarSign className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Tuition Summary
            </h2>
            <div className="mt-4">
              <span className="text-xs text-slate-500">Total Class Payments Recorded</span>
              <p className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 tracking-tight mt-1">
                {formatCurrency(totalTuitionPaid)}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {classPayments.length} recorded tuition payments
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 text-xs flex items-center gap-2 border border-purple-200 dark:border-purple-800">
            <ShieldCheck className="w-4 h-4 shrink-0 text-purple-600 dark:text-purple-400" />
            <span>RLS Protected Record</span>
          </div>
        </div>
      </div>

      {/* Sub-table of Student Class Payments */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Class Payment History
            </h3>
            <p className="text-xs text-slate-500">
              Sub-table of class_payment records for {student.first_name} {student.last_name}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Payment Date</th>
                <th className="px-6 py-3.5">Class / Description</th>
                <th className="px-6 py-3.5">Payment Method</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5">Reconciliation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {classPayments.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                    {formatDate(tx.date)}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                    {tx.description}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                      <span>{tx.payment_method}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-purple-600 dark:text-purple-400">
                    +{formatCurrency(tx.amount)}
                  </td>
                  <td className="px-6 py-4">
                    {tx.is_reconciled ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Reconciled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold text-[11px]">
                        <Clock className="w-3.5 h-3.5" /> Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {classPayments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No class_payment records found for this student.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
