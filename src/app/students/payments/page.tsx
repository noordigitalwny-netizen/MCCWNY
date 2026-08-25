"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Student, Transaction } from "@/lib/data-store";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  GraduationCap,
  CreditCard,
  Search,
  Plus,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  X,
  Calendar,
  Filter,
  DollarSign,
  UserCheck,
  UserX,
  PlusCircle,
  Eye,
  Building2,
  ChevronLeft,
  ChevronRight,
  Receipt,
  FileSpreadsheet,
} from "lucide-react";

const monthsList = [
  { code: "01", name: "January", short: "Jan" },
  { code: "02", name: "February", short: "Feb" },
  { code: "03", name: "March", short: "Mar" },
  { code: "04", name: "April", short: "Apr" },
  { code: "05", name: "May", short: "May" },
  { code: "06", name: "June", short: "Jun" },
  { code: "07", name: "July", short: "Jul" },
  { code: "08", name: "August", short: "Aug" },
  { code: "09", name: "September", short: "Sep" },
  { code: "10", name: "October", short: "Oct" },
  { code: "11", name: "November", short: "Nov" },
  { code: "12", name: "December", short: "Dec" },
];

const yearsList = ["2026", "2025", "2024"];

export default function StudentPaymentsPage() {
  const supabase = createClient();
  const [students, setStudents] = useState<Student[]>([]);
  const [classTransactions, setClassTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("2026");
  const [selectedMonth, setSelectedMonth] = useState<string>("08"); // Default August

  // Quick-Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [modalData, setModalData] = useState({
    student_id: "",
    month: "08",
    year: "2026",
    date: new Date().toISOString().split("T")[0],
    amount: "40.00",
    payment_method: "Zelle",
    description: "",
  });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Students & Class Payments directly from Supabase
  const fetchData = async () => {
    setLoading(true);
    try {
      const [stuRes, txRes] = await Promise.all([
        supabase.from("students").select("*").order("first_name", { ascending: true }),
        supabase
          .from("transactions")
          .select("*")
          .eq("type", "class_payment")
          .order("date", { ascending: false }),
      ]);

      if (stuRes.error) throw stuRes.error;
      if (txRes.error) throw txRes.error;

      if (stuRes.data) setStudents(stuRes.data as Student[]);
      if (txRes.data) setClassTransactions(txRes.data);
    } catch (err: any) {
      console.error("Supabase fetch error:", err);
      showToast(err.message || "Failed to load payment data from Supabase.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    window.addEventListener("focus", fetchData);
    return () => window.removeEventListener("focus", fetchData);
  }, []);

  // Filter students based on search term
  const filteredStudents = students.filter(
    (s) =>
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.parent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.phone_number && s.phone_number.includes(searchTerm)) ||
      (s.grade_level && s.grade_level.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Index transactions by student_id and YYYY-MM
  const paymentMap: Record<string, Record<string, any[]>> = {};
  classTransactions.forEach((tx) => {
    if (!tx.student_id || !tx.date) return;
    const [y, m] = tx.date.split("-");
    const ymKey = `${y}-${m}`;

    if (!paymentMap[tx.student_id]) {
      paymentMap[tx.student_id] = {};
    }
    if (!paymentMap[tx.student_id][ymKey]) {
      paymentMap[tx.student_id][ymKey] = [];
    }
    paymentMap[tx.student_id][ymKey].push(tx);
  });

  // Calculate Summary Metrics for selected Month & Year
  const targetYM = `${selectedYear}-${selectedMonth}`;
  const targetMonthTx = classTransactions.filter((tx) => tx.date && tx.date.startsWith(targetYM));
  
  const totalCollectedThisMonth = targetMonthTx.reduce((sum, tx) => sum + (tx.amount || 0), 0);

  const paidStudentIds = new Set(targetMonthTx.map((tx) => tx.student_id).filter(Boolean));
  const paidCount = students.filter((s) => paidStudentIds.has(s.id)).length;
  const unpaidCount = Math.max(0, students.length - paidCount);

  const targetMonthName = monthsList.find((m) => m.code === selectedMonth)?.name || "Selected Month";

  // Open modal for a specific student and month
  const handleOpenAddModal = (studentId: string = "", monthCode: string = selectedMonth) => {
    const student = students.find((s) => s.id === studentId);
    const mName = monthsList.find((m) => m.code === monthCode)?.name || "";

    setModalData({
      student_id: studentId || (students[0]?.id || ""),
      month: monthCode,
      year: selectedYear,
      date: `${selectedYear}-${monthCode}-01`,
      amount: "40.00",
      payment_method: "Zelle",
      description: student
        ? `${mName} ${selectedYear} Tuition Fee - ${student.first_name} ${student.last_name}`
        : `${mName} ${selectedYear} Tuition Fee`,
    });
    setIsModalOpen(true);
  };

  // Submit Class Payment directly to Supabase
  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!modalData.student_id) {
      showToast("Please select a student.", "error");
      return;
    }

    const numAmount = parseFloat(modalData.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      showToast("Please enter a valid payment amount.", "error");
      return;
    }

    const targetStudent = students.find((s) => s.id === modalData.student_id);
    const mName = monthsList.find((m) => m.code === modalData.month)?.name || "";
    const desc = modalData.description || `Class Payment - ${mName} ${modalData.year}`;

    // Database payload (only schema columns)
    const dbPayload = {
      type: "class_payment",
      amount: numAmount,
      date: modalData.date,
      description: desc,
      student_id: modalData.student_id,
      member_id: targetStudent?.member_parent_id || null,
      payment_method: modalData.payment_method,
      is_reconciled: true,
    };

    try {
      const { error } = await supabase.from("transactions").insert([dbPayload]);
      if (error) throw error;

      showToast(
        `Class payment of ${formatCurrency(numAmount)} recorded for ${
          targetStudent ? `${targetStudent.first_name} ${targetStudent.last_name}` : "Student"
        }.`
      );
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      showToast(err.message || "Failed to record payment in database.", "error");
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/students"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Students Roster
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center border border-purple-200 dark:border-purple-800">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Student Monthly Class Payments Tracker
              </h1>
              <p className="text-xs text-slate-500">
                Track fee payments & balances for Sunday School & Quran Academy
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => handleOpenAddModal("", selectedMonth)}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-md shadow-purple-900/20 flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record Class Payment</span>
        </button>
      </div>

      {/* Notification Toast */}
      {toast && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 border transition-all ${
            toast.type === "success"
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
              : "bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-300"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Executive Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Fees Collected ({targetMonthName} {selectedYear})
            </p>
            <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {formatCurrency(totalCollectedThisMonth)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              {targetMonthTx.length} payments recorded
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Paid Students ({targetMonthName})
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {paidCount} <span className="text-xs text-slate-400 font-normal">/ {students.length}</span>
            </h3>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              {students.length > 0 ? Math.round((paidCount / students.length) * 100) : 0}% collection rate
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Unpaid Students ({targetMonthName})
            </p>
            <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
              {unpaidCount} <span className="text-xs text-slate-400 font-normal">pending</span>
            </h3>
            <p className="text-[11px] text-rose-500 mt-1">Outstanding tuition balances</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-800">
            <UserX className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Control Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search student, parent, phone..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Month & Year Selectors */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">Highlight Month:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-purple-700 dark:text-purple-300"
            >
              {monthsList.map((m) => (
                <option key={m.code} value={m.code}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
            >
              {yearsList.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Student Payment Grid Matrix */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Loading student payment matrix from Supabase...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <GraduationCap className="w-10 h-10 text-purple-500 mx-auto" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              No students found
            </h3>
            <p className="text-xs text-slate-500">
              {searchTerm
                ? "No student matched your search query."
                : "Enroll students in the Students tab to track class fee payments."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-4 min-w-[200px] sticky left-0 bg-slate-50 dark:bg-slate-800 z-10 border-r border-slate-200 dark:border-slate-800">
                    Student Details
                  </th>
                  <th className="px-3 py-4 min-w-[100px]">Grade</th>
                  {monthsList.map((m) => (
                    <th
                      key={m.code}
                      className={`px-3 py-4 text-center min-w-[105px] border-l border-slate-200/60 dark:border-slate-800/60 ${
                        m.code === selectedMonth
                          ? "bg-purple-100/60 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200"
                          : ""
                      }`}
                    >
                      {m.short}
                    </th>
                  ))}
                  <th className="px-4 py-4 text-right min-w-[100px] border-l border-slate-200 dark:border-slate-800">
                    Quick Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredStudents.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Sticky Student info cell */}
                    <td className="px-4 py-3.5 sticky left-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-10">
                      <div>
                        <Link
                          href={`/students/${s.id}`}
                          className="font-bold text-slate-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 hover:underline"
                        >
                          {s.first_name} {s.last_name}
                        </Link>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Parent: <span className="font-semibold text-slate-700 dark:text-slate-300">{s.parent_name}</span>
                        </p>
                        {s.phone_number && (
                          <p className="text-[10px] text-slate-400 font-mono">
                            {s.phone_number}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Grade Level */}
                    <td className="px-3 py-3.5 text-slate-600 dark:text-slate-300">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {s.grade_level || "Grade 1"}
                      </span>
                    </td>

                    {/* 12 Months Status Columns */}
                    {monthsList.map((m) => {
                      const ymKey = `${selectedYear}-${m.code}`;
                      const studentTxList = paymentMap[s.id]?.[ymKey] || [];
                      const isPaid = studentTxList.length > 0;
                      const totalPaidForMonth = studentTxList.reduce(
                        (sum, t) => sum + (t.amount || 0),
                        0
                      );
                      const paymentMethodStr = studentTxList[0]?.payment_method || "Paid";

                      return (
                        <td
                          key={m.code}
                          className={`px-2 py-3 text-center border-l border-slate-100 dark:border-slate-800/60 ${
                            m.code === selectedMonth
                              ? "bg-purple-50/30 dark:bg-purple-950/20"
                              : ""
                          }`}
                        >
                          {isPaid ? (
                            <button
                              onClick={() => handleOpenAddModal(s.id, m.code)}
                              title={`Click to record additional payment for ${m.name}`}
                              className="w-full px-2 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 transition-all flex flex-col items-center justify-center gap-0.5"
                            >
                              <div className="flex items-center gap-1 font-bold text-[11px]">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span>{formatCurrency(totalPaidForMonth)}</span>
                              </div>
                              <span className="text-[9px] opacity-75 font-medium truncate max-w-[80px]">
                                ({paymentMethodStr})
                              </span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenAddModal(s.id, m.code)}
                              title={`Record payment for ${s.first_name} (${m.name})`}
                              className="w-full px-2 py-1 rounded-xl bg-slate-100 hover:bg-purple-100 text-slate-500 hover:text-purple-700 dark:bg-slate-800/60 dark:hover:bg-purple-950 dark:hover:text-purple-300 transition-all text-[11px] font-semibold flex items-center justify-center gap-1 border border-transparent hover:border-purple-300"
                            >
                              <span className="text-rose-600 dark:text-rose-400 font-bold">Unpaid</span>
                              <Plus className="w-3 h-3 opacity-60" />
                            </button>
                          )}
                        </td>
                      );
                    })}

                    {/* Quick Action Button */}
                    <td className="px-4 py-3.5 text-right border-l border-slate-200 dark:border-slate-800">
                      <button
                        onClick={() => handleOpenAddModal(s.id, selectedMonth)}
                        className="px-2.5 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-950 hover:bg-purple-200 dark:hover:bg-purple-900 text-purple-800 dark:text-purple-200 font-semibold text-[11px] inline-flex items-center gap-1 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Fee</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Class Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 flex items-center justify-center border border-purple-200 dark:border-purple-800">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Record Class Fee Payment
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Logs a class_payment directly into Supabase transactions table.
            </p>

            <form onSubmit={handleSavePayment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Student *
                </label>
                <select
                  required
                  value={modalData.student_id}
                  onChange={(e) => {
                    const sId = e.target.value;
                    const st = students.find((s) => s.id === sId);
                    const mName = monthsList.find((m) => m.code === modalData.month)?.name || "";
                    setModalData({
                      ...modalData,
                      student_id: sId,
                      description: st
                        ? `${mName} ${modalData.year} Tuition Fee - ${st.first_name} ${st.last_name}`
                        : `${mName} ${modalData.year} Tuition Fee`,
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 font-semibold"
                >
                  <option value="">-- Choose Student --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.first_name} {s.last_name} ({s.parent_name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Month & Year *
                  </label>
                  <select
                    value={modalData.month}
                    onChange={(e) => {
                      const mCode = e.target.value;
                      const mName = monthsList.find((m) => m.code === mCode)?.name || "";
                      const st = students.find((s) => s.id === modalData.student_id);
                      setModalData({
                        ...modalData,
                        month: mCode,
                        date: `${modalData.year}-${mCode}-01`,
                        description: st
                          ? `${mName} ${modalData.year} Tuition Fee - ${st.first_name} ${st.last_name}`
                          : `${mName} ${modalData.year} Tuition Fee`,
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 font-semibold"
                  >
                    {monthsList.map((m) => (
                      <option key={m.code} value={m.code}>
                        {m.name} {modalData.year}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={modalData.date}
                    onChange={(e) => setModalData({ ...modalData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Amount ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={modalData.amount}
                    onChange={(e) => setModalData({ ...modalData, amount: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold text-emerald-600 focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={modalData.payment_method}
                    onChange={(e) => setModalData({ ...modalData, payment_method: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Zelle">Zelle</option>
                    <option value="Cash">Cash</option>
                    <option value="Check">Check</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Note
                </label>
                <input
                  type="text"
                  value={modalData.description}
                  onChange={(e) => setModalData({ ...modalData, description: e.target.value })}
                  placeholder="e.g., August 2026 Tuition"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-md"
                >
                  Save Class Fee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
