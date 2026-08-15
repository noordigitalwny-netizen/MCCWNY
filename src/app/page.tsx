"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getStoredTransactions,
  getStoredMembers,
  getStoredStudents,
  Transaction,
  Member,
  Student,
} from "@/lib/data-store";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  DollarSign,
  TrendingDown,
  Users,
  GraduationCap,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ChevronRight,
  Building2,
  BadgeCheck,
  Calendar,
} from "lucide-react";

const monthsList = [
  { value: "all", label: "All Months" },
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const yearsList = [
  { value: "all", label: "All Years" },
  { value: "2026", label: "2026" },
  { value: "2025", label: "2025" },
  { value: "2024", label: "2024" },
];

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [selectedMonth, setSelectedMonth] = useState<string>("08"); // Default to August
  const [selectedYear, setSelectedYear] = useState<string>("2026"); // Default to 2026

  // Dynamically sync with persistent data store on load & focus
  useEffect(() => {
    const loadData = () => {
      setTransactions(getStoredTransactions());
      setMembers(getStoredMembers());
      setStudents(getStoredStudents());
    };

    loadData();
    window.addEventListener("focus", loadData);
    return () => window.removeEventListener("focus", loadData);
  }, []);

  // Filter transactions by selected Month and Year
  const filteredTransactions = transactions.filter((t) => {
    if (!t.date) return true;
    const [year, month] = t.date.split("-");
    const matchesMonth = selectedMonth === "all" || month === selectedMonth;
    const matchesYear = selectedYear === "all" || year === selectedYear;
    return matchesMonth && matchesYear;
  });

  // Compute live dynamic financial & community totals for selected period
  const totalDonations = filteredTransactions
    .filter((t) => t.type !== "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const selectedMonthLabel =
    monthsList.find((m) => m.value === selectedMonth)?.label || "All Months";
  const selectedYearLabel =
    yearsList.find((y) => y.value === selectedYear)?.label || "All Years";

  const metrics = [
    {
      title: `Donations (${selectedMonthLabel})`,
      value: formatCurrency(totalDonations),
      trend: `${filteredTransactions.filter((t) => t.type !== "expense").length} entries`,
      isPositive: true,
      subtitle: "Sadaqah, dues & tuition",
      icon: DollarSign,
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    {
      title: `Expenses (${selectedMonthLabel})`,
      value: formatCurrency(totalExpenses),
      trend: `${filteredTransactions.filter((t) => t.type === "expense").length} entries`,
      isPositive: false,
      subtitle: "Utilities & operational costs",
      icon: TrendingDown,
      iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    {
      title: "Active Members",
      value: members.length.toString(),
      trend: "Directory",
      isPositive: true,
      subtitle: "Active MCCWNY members",
      icon: Users,
      iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    },
    {
      title: "Enrolled Students",
      value: students.length.toString(),
      trend: "Academy Roster",
      isPositive: true,
      subtitle: "Sunday & Quran Academy students",
      icon: GraduationCap,
      iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    },
  ];

  const recentTransactions = filteredTransactions.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="relative rounded-3xl bg-linear-to-r from-emerald-900 via-emerald-800 to-slate-900 text-white p-8 overflow-hidden shadow-xl border border-emerald-700/40">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
              <BadgeCheck className="w-3.5 h-3.5" /> Official Admin Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Assalamu Alaikum, Administrator
            </h1>
            <p className="text-emerald-100/80 text-sm leading-relaxed">
              Welcome to the Muslim Community Center of WNY management hub. Select month and year to view period totals and ledger metrics.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/transactions"
              className="px-4 py-2.5 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 font-semibold text-xs transition-all shadow-md flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-emerald-700" />
              <span>Record Transaction</span>
            </Link>
            <Link
              href="/bank-upload"
              className="px-4 py-2.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-white font-semibold text-xs transition-all border border-emerald-600/60 flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Bank PDF</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Month & Year Selection Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
          <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Dashboard Filter Period:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Month Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Month:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            >
              {monthsList.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Year Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            >
              {yearsList.map((y) => (
                <option key={y.value} value={y.value}>
                  {y.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {metrics.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {card.title}
                </p>
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border ${card.iconBg}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {card.value}
                </h3>
                <div className="flex items-center gap-1.5 mt-2">
                  <span
                    className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-md ${
                      card.isPositive
                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
                        : "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400"
                    }`}
                  >
                    {card.isPositive ? (
                      <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                    )}
                    {card.trend}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {card.subtitle}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Layout: Recent Activity & Quick Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions Ledger Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Period Financial Activity ({selectedMonthLabel} {selectedYearLabel})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Latest member dues, class payments, and community Sadaqah for selected period
              </p>
            </div>
            <Link
              href="/transactions"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Date</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Member / Note</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3.5 font-medium text-slate-700 dark:text-slate-300">
                      {formatDate(tx.date)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                          tx.type === "general_donation"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
                            : tx.type === "member_fee"
                            ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
                            : tx.type === "class_payment"
                            ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800"
                            : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800"
                        }`}
                      >
                        {tx.type.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {tx.memberName || "Community Member"}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate max-w-[200px]">
                        {tx.description}
                      </p>
                    </td>
                    <td
                      className={`px-4 py-3.5 font-bold ${
                        tx.type === "expense"
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {tx.type === "expense" ? "-" : "+"}
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="px-4 py-3.5">
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
                {recentTransactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                      No transactions found for {selectedMonthLabel} {selectedYearLabel}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Operations & Community Notice Box */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Quick Administrative Tasks
            </h3>
            <div className="space-y-2.5">
              <Link
                href="/members"
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700/60 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                      Register New Member
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Add household contact info
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/students"
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-slate-200 dark:border-slate-700/60 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                      Enroll New Student
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Weekend & Quran classes
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/bank-upload"
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700/60 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                    <UploadCloud className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                      Import Bank PDF Statement
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Reconcile monthly ledger
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Center Info Notice Box */}
          <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-2xl p-5 text-emerald-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold text-emerald-300 text-sm">
              <Building2 className="w-4 h-4" /> Muslim Community Center of WNY
            </div>
            <p className="leading-relaxed text-emerald-200/80">
              Database schema is configured with active Row Level Security (RLS) on <code className="bg-emerald-900/60 px-1 py-0.5 rounded text-emerald-100 font-mono">members</code>, <code className="bg-emerald-900/60 px-1 py-0.5 rounded text-emerald-100 font-mono">students</code>, and <code className="bg-emerald-900/60 px-1 py-0.5 rounded text-emerald-100 font-mono">transactions</code> tables.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
