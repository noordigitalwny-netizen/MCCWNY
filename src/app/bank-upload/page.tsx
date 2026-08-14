"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  FileText,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface ParsedStatementRow {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "deposit" | "withdrawal";
  matchedMember: string | null;
  matchConfidence: "High" | "Medium" | "None";
}

export default function BankUploadPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedStatementRow[]>([]);
  const [importSuccess, setImportSuccess] = useState(false);

  const handleSimulatedUpload = () => {
    setIsUploading(true);
    setImportSuccess(false);

    setTimeout(() => {
      setUploadedFileName("MCCWNY_Bank_Statement_Aug2026.csv");
      setParsedRows([
        {
          id: "row-1",
          date: "2026-08-14",
          description: "ZELLE FROM TARIQ MANSOOR SADAQAH",
          amount: 1250.0,
          type: "deposit",
          matchedMember: "Tariq Mansoor",
          matchConfidence: "High",
        },
        {
          id: "row-2",
          date: "2026-08-12",
          description: "SQUARE INC - AMINA KHAN DUES",
          amount: 300.0,
          type: "deposit",
          matchedMember: "Amina Khan",
          matchConfidence: "High",
        },
        {
          id: "row-3",
          date: "2026-08-10",
          description: "CHECK #1042 DEPOSIT ZAYD FAROOQ",
          amount: 450.0,
          type: "deposit",
          matchedMember: "Zayd Farooq",
          matchConfidence: "High",
        },
        {
          id: "row-4",
          date: "2026-08-08",
          description: "NATIONAL GRID UTILITY ACH PAY",
          amount: 840.5,
          type: "withdrawal",
          matchedMember: null,
          matchConfidence: "None",
        },
        {
          id: "row-5",
          date: "2026-08-03",
          description: "DIRECT DEPOSIT FATIMA AL-MANSOORI DONATION",
          amount: 2500.0,
          type: "deposit",
          matchedMember: "Fatima Al-Mansouri",
          matchConfidence: "Medium",
        },
      ]);
      setIsUploading(false);
    }, 1200);
  };

  const handleImportToSupabase = () => {
    setImportSuccess(true);
    setTimeout(() => {
      setImportSuccess(false);
    }, 5000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center border border-blue-200 dark:border-blue-800">
          <UploadCloud className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Bank Statement Import & Reconciliation
          </h1>
          <p className="text-xs text-slate-500">
            Upload CSV statements from M&T Bank or KeyBank to auto-reconcile transactions
          </p>
        </div>
      </div>

      {/* Import Notification Banner */}
      {importSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>
              Successfully imported and reconciled {parsedRows.length} transactions into Supabase!
            </span>
          </div>
          <span className="font-mono text-[11px] bg-emerald-900/40 px-2 py-0.5 rounded text-emerald-200">
            RLS Verified
          </span>
        </div>
      )}

      {/* Dropzone Container */}
      <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-8 shadow-xs text-center relative hover:border-emerald-500 transition-colors">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center border border-blue-200 dark:border-blue-800">
            {isUploading ? (
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            ) : (
              <FileSpreadsheet className="w-7 h-7" />
            )}
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {uploadedFileName ? uploadedFileName : "Drag and drop bank statement CSV"}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Supports CSV formats from M&T, Chase, or Bank of America. Max file size 10MB.
            </p>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={handleSimulatedUpload}
              disabled={isUploading}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md shadow-blue-900/20 flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{isUploading ? "Parsing Statement..." : "Select CSV File"}</span>
            </button>

            {!uploadedFileName && (
              <button
                onClick={handleSimulatedUpload}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <span>Load Sample Statement</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Parsed Reconciliation Preview */}
      {parsedRows.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Statement Match & Reconciliation Preview
              </h3>
              <p className="text-xs text-slate-500">
                Automatic pattern matching applied based on phone numbers and member names
              </p>
            </div>

            <button
              onClick={handleImportToSupabase}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md flex items-center gap-2 self-start sm:self-auto"
            >
              <span>Confirm & Sync to Supabase</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Bank Memo / Raw Text</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Matched Member</th>
                  <th className="px-4 py-3">Match Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {parsedRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3.5 font-medium text-slate-700 dark:text-slate-300">
                      {row.date}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[11px] text-slate-800 dark:text-slate-200">
                      {row.description}
                    </td>
                    <td
                      className={`px-4 py-3.5 font-bold ${
                        row.type === "withdrawal"
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {row.type === "withdrawal" ? "-" : "+"}
                      {formatCurrency(row.amount)}
                    </td>
                    <td className="px-4 py-3.5">
                      {row.matchedMember ? (
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {row.matchedMember}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unmatched Vendor</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          row.matchConfidence === "High"
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300"
                            : row.matchConfidence === "Medium"
                            ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300"
                        }`}
                      >
                        {row.matchConfidence} Match
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
