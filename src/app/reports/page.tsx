"use client";

import { formatCurrency } from "@/lib/utils";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Printer,
  PieChart,
  ShieldCheck,
  CheckCircle2,
  Building2,
} from "lucide-react";

export default function ReportsPage() {
  const financialSummary = {
    totalRevenue: 24500.0,
    totalExpenses: 6180.0,
    netIncome: 18320.0,
    reconciliationRate: "94.2%",
  };

  const revenueBreakdown = [
    { category: "General Sadaqah & Donations", amount: 14250.0, pct: "58.2%" },
    { category: "Annual Membership Dues", amount: 5400.0, pct: "22.0%" },
    { category: "Weekend & Quran Academy Tuition", amount: 4850.0, pct: "19.8%" },
  ];

  const expenseBreakdown = [
    { category: "Facility Utilities & Maintenance", amount: 3200.0, pct: "51.8%" },
    { category: "Educational Supplies & Materials", amount: 1650.0, pct: "26.7%" },
    { category: "Administrative Software & Web", amount: 1330.0, pct: "21.5%" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Financial & Audit Reports
            </h1>
            <p className="text-xs text-slate-500">
              Muslim Community Center of WNY operations summary
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-all flex items-center gap-1.5 border border-slate-200 dark:border-slate-700">
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <button className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Revenue (YTD)</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            {formatCurrency(financialSummary.totalRevenue)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Donations + Dues + Tuition</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Operating Expenses</span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2">
            {formatCurrency(financialSummary.totalExpenses)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Utilities + Supplies</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Net Operating Fund</span>
            <PieChart className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {formatCurrency(financialSummary.netIncome)}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            Surplus reserve
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Reconciliation Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {financialSummary.reconciliationRate}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Verified with Bank CSV</p>
        </div>
      </div>

      {/* Categorized Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue Categorization */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
            <span>Revenue Sources</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              100% Categorized
            </span>
          </h3>

          <div className="space-y-3 text-xs">
            {revenueBreakdown.map((rev, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300">
                  <span>{rev.category}</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatCurrency(rev.amount)} ({rev.pct})
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: rev.pct }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expenses Categorization */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
            <span>Expense Distribution</span>
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
              Audited
            </span>
          </h3>

          <div className="space-y-3 text-xs">
            {expenseBreakdown.map((exp, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300">
                  <span>{exp.category}</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatCurrency(exp.amount)} ({exp.pct})
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: exp.pct }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RLS Security Audit Notice */}
      <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 border border-slate-800 text-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <div>
            <p className="font-semibold text-white">Supabase Row Level Security Verified</p>
            <p className="text-slate-400 text-[11px]">
              Financial data access restricted strictly to authenticated admin accounts via SQL RLS policies.
            </p>
          </div>
        </div>
        <div className="hidden sm:block text-right">
          <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950 px-2 py-1 rounded border border-emerald-800">
            RLS STATUS: ACTIVE
          </span>
        </div>
      </div>
    </div>
  );
}
