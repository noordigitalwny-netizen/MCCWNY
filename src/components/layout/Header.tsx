"use client";

import { usePathname } from "next/navigation";
import { Calendar, Bell, Search, UserCheck } from "lucide-react";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/": {
    title: "Admin Dashboard",
    subtitle: "Overview of Muslim Community Center of WNY operations & metrics",
  },
  "/members": {
    title: "Members Management",
    subtitle: "Directory, contact info, and membership history",
  },
  "/students": {
    title: "Students Roster",
    subtitle: "Educational programs, grade levels, and guardian contacts",
  },
  "/transactions": {
    title: "Financial Transactions Ledger",
    subtitle: "Dues, tuition payments, donations, and expense reconciliations",
  },
  "/bank-upload": {
    title: "Bank Statement Upload",
    subtitle: "Import CSV bank statements & match transactions",
  },
  "/reports": {
    title: "Financial & Membership Reports",
    subtitle: "Analytical insights, balance sheets, and audit statements",
  },
};

export default function Header() {
  const pathname = usePathname();
  const pageInfo = pageTitles[pathname] || {
    title: "Muslim Community Center of WNY",
    subtitle: "Admin Management Portal",
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Title Section */}
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {pageInfo.title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {pageInfo.subtitle}
          </p>
        </div>

        {/* Action Widgets */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Quick Search */}
          <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-300">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search records...</span>
            <kbd className="px-1.5 py-0.5 text-[10px] bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-slate-400 font-mono">
              ⌘K
            </kbd>
          </div>

          {/* Date Widget */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 text-xs font-medium">
            <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{currentDate}</span>
          </div>

          {/* Admin User Badge */}
          <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-semibold text-xs flex items-center justify-center border border-emerald-300 dark:border-emerald-700">
              AD
            </div>
            <div className="hidden xl:block text-xs">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                System Administrator
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                MCCWNY Admin
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
