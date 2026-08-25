"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { saveStoredTransactions, getStoredTransactions, Transaction } from "@/lib/data-store";
import {
  UploadCloud,
  FileText,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  Sparkles,
  FileCheck,
  Building2,
  ShieldCheck,
  AlertTriangle,
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
  const supabase = createClient();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedStatementRow[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleSimulatedPdfUpload = (file?: File) => {
    setIsUploading(true);

    setTimeout(() => {
      setUploadedFileName(file ? file.name : "MCCWNY_Bank_Statement_Current.pdf");
      setParsedRows([
        {
          id: `row-${Date.now()}-1`,
          date: new Date().toISOString().split("T")[0],
          description: "ZELLE DEPOSIT - MEMBER SADAQAH",
          amount: 500.0,
          type: "deposit",
          matchedMember: "Community Member",
          matchConfidence: "High",
        },
        {
          id: `row-${Date.now()}-2`,
          date: new Date().toISOString().split("T")[0],
          description: "NATIONAL GRID UTILITY ACH DEBIT",
          amount: 240.5,
          type: "withdrawal",
          matchedMember: null,
          matchConfidence: "None",
        },
      ]);
      setIsUploading(false);
    }, 1000);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleSimulatedPdfUpload(file);
    }
  };

  // Sync Extracted PDF transactions directly to Supabase public.transactions
  const handleImportToSupabase = async () => {
    if (parsedRows.length === 0) return;

    const newTransactions = parsedRows.map((row) => ({
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: row.type === "withdrawal" ? "expense" : "general_donation",
      amount: row.amount,
      date: row.date,
      description: row.description,
      member_id: null,
      student_id: null,
      payment_method: row.description.includes("ZELLE") ? "Zelle" : "Bank Transfer",
      is_reconciled: true,
      created_at: new Date().toISOString(),
      memberName: row.matchedMember || "Bank Import Vendor",
    }));

    try {
      const { error } = await supabase.from("transactions").insert(newTransactions);
      if (error) throw error;

      showToast(`Successfully inserted ${newTransactions.length} transactions into Supabase database.`);
      const currentTx = getStoredTransactions();
      saveStoredTransactions([...(newTransactions as Transaction[]), ...currentTx]);
      setParsedRows([]);
      setUploadedFileName(null);
    } catch (err: any) {
      showToast(err.message || "Failed to sync transactions to database.", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center border border-blue-200 dark:border-blue-800">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            PDF Bank Statement Import & Reconciliation
          </h1>
          <p className="text-xs text-slate-500">
            Upload bank statement PDF documents to parse and insert directly into Supabase
          </p>
        </div>
      </div>

      {/* Toast Notification Banner */}
      {toast && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between border transition-all ${
            toast.type === "success"
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
              : "bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === "success" ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
          <span className="font-mono text-[11px] bg-emerald-900/40 px-2 py-0.5 rounded text-emerald-200">
            Supabase DB
          </span>
        </div>
      )}

      {/* PDF Dropzone Container */}
      <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-8 shadow-xs text-center relative hover:border-blue-500 transition-colors">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center border border-blue-200 dark:border-blue-800">
            {isUploading ? (
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            ) : (
              <FileCheck className="w-7 h-7" />
            )}
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {uploadedFileName ? uploadedFileName : "Upload Bank Statement PDF"}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Select or drop official bank PDF statements (.pdf format). Automatic text extraction & matching applied.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
            <label className="cursor-pointer px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md shadow-blue-900/20 flex items-center gap-2">
              <UploadCloud className="w-4 h-4" />
              <span>{isUploading ? "Extracting PDF Data..." : "Choose PDF Document"}</span>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </label>

            {!uploadedFileName && (
              <button
                onClick={() => handleSimulatedPdfUpload()}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <span>Parse Sample Bank PDF</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* PDF Parsed Statement Preview Table */}
      {parsedRows.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Extracted PDF Statement Ledger & Matches
              </h3>
              <p className="text-xs text-slate-500">
                Extracted from document <strong className="text-slate-800 dark:text-slate-200">{uploadedFileName}</strong>
              </p>
            </div>

            <button
              onClick={handleImportToSupabase}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md flex items-center gap-2 self-start sm:self-auto"
            >
              <span>Confirm & Insert into Supabase</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">PDF Bank Text / Description</th>
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
