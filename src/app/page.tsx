"use client";

import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
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
} from "lucide-react";

export default function DashboardPage() {
  // Placeholder Metrics for MCCWNY Admin Dashboard
  const metrics = [
    {
      title: "Total Monthly Donations",
      value: formatCurrency(14250.0),
      trend: "+12.5%",
      isPositive: true,
      subtitle: "vs. previous month ($12,660)",
      icon: DollarSign,
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    {
      title: "Total Monthly Expenses",
      value: formatCurrency(6180.0),
      trend: "-4.2%",
      isPositive: true,
      subtitle: "vs. previous month ($6,450)",
      icon: TrendingDown,
      iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    {
      title: "Active Members",
      value: "142",
      trend: "+8 new",
      isPositive: true,
      subtitle: "Active MCCWNY members",
      icon: Users,
      iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    },
    {
      title: "Enrolled Students",
      value: "88",
      trend: "+5 new",
      isPositive: true,
      subtitle: "Sunday & Quran Academy students",
      icon: GraduationCap,
      iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    },
  ];

  // Placeholder recent transactions
  const recentTransactions = [
    {
      id: "tx-101",
      date: "Aug 14, 2026",
      type: "general_donation",
      label: "General Donation",
      description: "Friday Community Sadaqah Collection",
      amount: 1250.0,
      payment_method: "Zelle",
      status: "Reconciled",
      member: "Tariq Mansoor",
    },
    {
      id: "tx-102",
      date: "Aug 12, 2026",
      type: "member_fee",
      label: "Member Fee",
      description: "Annual Family Membership Dues",
      amount: 300.0,
      payment_method: "Credit Card",
      status: "Reconciled",
      member: "Amina Khan",
    },
    {
      id: "tx-103",
      date: "Aug 10, 2026",
      type: "class_payment",
      label: "Class Payment",
      description: "Weekend Quran Academy Tuition - Q3",
      amount: 450.0,
      payment_method: "Check (#1042)",
      status: "Pending",
      member: "Zayd Farooq",
    },
    {
      id: "tx-104",
      date: "Aug 08, 2026",
      type: "expense",
      label: "Expense",
      description: "Facility Utility Payment - National Grid",
      amount: 840.5,
      payment_method: "Bank Transfer",
      status: "Reconciled",
      member: "Vendor / Operating",
    },
  ];

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
              Welcome to the Muslim Community Center of WNY management hub. Monitor membership dues, student enrollments, and reconcile bank transactions efficiently.
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
              <span>Upload Bank CSV</span>
            </Link>
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
                Recent Financial Activity
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Latest member dues, class payments, and community Sadaqah
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
                      {tx.date}
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
                            : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
                        }`}
                      >
                        {tx.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {tx.member}
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
                      {tx.status === "Reconciled" ? (
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
                      Import Bank Statement
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
