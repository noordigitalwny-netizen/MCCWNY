"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Transaction,
  Member,
  Student,
  getStoredTransactions,
  saveStoredTransactions,
  getStoredMembers,
  getStoredStudents,
} from "@/lib/data-store";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Receipt,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  Calendar,
  X,
  CreditCard,
  Trash2,
  AlertTriangle,
  FileCheck,
} from "lucide-react";

export default function TransactionsPage() {
  const supabase = createClient();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [reconciledFilter, setReconciledFilter] = useState<string>("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);
  
  // Notification Toast State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [formData, setFormData] = useState({
    type: "general_donation" as Transaction["type"],
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    payment_method: "Zelle",
    memberName: "",
    member_id: "",
    student_id: "",
  });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Transactions directly from Supabase Database
  const fetchTransactionsData = async () => {
    setLoading(true);
    try {
      const [txRes, memRes, stuRes] = await Promise.all([
        supabase.from("transactions").select("*").order("date", { ascending: false }),
        supabase.from("members").select("*"),
        supabase.from("students").select("*"),
      ]);

      if (txRes.error) throw txRes.error;
      if (memRes.data) setMembers(memRes.data as Member[]);
      if (stuRes.data) setStudents(stuRes.data as Student[]);

      if (txRes.data) {
        setTransactions(txRes.data as Transaction[]);
        saveStoredTransactions(txRes.data as Transaction[]);
      }
    } catch (err: any) {
      console.error("Supabase fetch error:", err);
      // Fallback to local stored state
      setTransactions(getStoredTransactions());
      setMembers(getStoredMembers());
      setStudents(getStoredStudents());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactionsData();
    window.addEventListener("focus", fetchTransactionsData);
    return () => window.removeEventListener("focus", fetchTransactionsData);
  }, []);

  // Toggle Reconciled in Supabase
  const toggleReconciled = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("transactions")
        .update({ is_reconciled: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      showToast(`Transaction reconciliation status updated.`);
      fetchTransactionsData();
    } catch (err: any) {
      showToast(err.message || "Failed to update reconciliation status.", "error");
    }
  };

  // Delete Transaction from Supabase
  const handleDeleteTransaction = async () => {
    if (!deletingTx) return;

    try {
      const { error } = await supabase.from("transactions").delete().eq("id", deletingTx.id);
      if (error) throw error;

      showToast(`Transaction "${deletingTx.description}" deleted.`);
      setDeletingTx(null);
      fetchTransactionsData();
    } catch (err: any) {
      showToast(err.message || "Failed to delete transaction.", "error");
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.memberName && tx.memberName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      tx.payment_method.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "all" || tx.type === typeFilter;
    const matchesReconciled =
      reconciledFilter === "all" ||
      (reconciledFilter === "reconciled" && tx.is_reconciled) ||
      (reconciledFilter === "pending" && !tx.is_reconciled);

    return matchesSearch && matchesType && matchesReconciled;
  });

  // Record New Transaction directly in Supabase (Omitting 'id' so database default gen_random_uuid() triggers)
  const handleRecordTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) {
      showToast("Please enter transaction amount and description.", "error");
      return;
    }

    const newTx = {
      type: formData.type,
      amount: parseFloat(formData.amount),
      date: formData.date,
      description: formData.description,
      member_id: formData.member_id || null,
      student_id: formData.student_id || null,
      payment_method: formData.payment_method,
      is_reconciled: true,
      memberName: formData.memberName || "Community Member / Vendor",
    };

    try {
      const { error } = await supabase.from("transactions").insert([newTx]);
      if (error) throw error;

      showToast(`Transaction of ${formatCurrency(newTx.amount)} saved to database.`);
      setIsModalOpen(false);
      setFormData({
        type: "general_donation",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        description: "",
        payment_method: "Zelle",
        memberName: "",
        member_id: "",
        student_id: "",
      });
      fetchTransactionsData();
    } catch (err: any) {
      showToast(err.message || "Failed to save transaction to database.", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Financial Transactions Ledger
            </h1>
            <p className="text-xs text-slate-500">
              Live ledger entries directly connected to Supabase public.transactions
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md shadow-emerald-900/20 flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Transaction</span>
        </button>
      </div>

      {/* Toast Notification */}
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

      {/* Filter and Control Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search description, member..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Type Filter */}
          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
            >
              <option value="all">All Transaction Types</option>
              <option value="member_fee">Member Fee</option>
              <option value="class_payment">Class Payment</option>
              <option value="general_donation">General Donation</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          {/* Reconciliation Filter */}
          <select
            value={reconciledFilter}
            onChange={(e) => setReconciledFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
          >
            <option value="all">All Reconciliation Status</option>
            <option value="reconciled">Reconciled Only</option>
            <option value="pending">Pending Only</option>
          </select>
        </div>
      </div>

      {/* Transactions Ledger Table / Empty State */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Loading financial ledger from Supabase...
          </div>
        ) : filteredTransactions.length === 0 ? (
          /* Clean Empty State */
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center border border-slate-200 dark:border-slate-700">
              <FileCheck className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="max-w-xs mx-auto">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                No transactions found
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {searchTerm
                  ? "No transaction matching your filter criteria was found."
                  : "Your financial ledger is currently empty. Click 'Record New Transaction' or 'Generate Receipt' to log your first transaction."}
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-md"
            >
              Record First Transaction
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Member / Payer</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Reconciled</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDate(tx.date)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
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
                    <td className="px-6 py-4 text-slate-900 dark:text-slate-100 font-medium">
                      {tx.description}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {tx.memberName || "—"}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                        <span>{tx.payment_method}</span>
                      </div>
                    </td>
                    <td
                      className={`px-6 py-4 font-bold ${
                        tx.type === "expense"
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {tx.type === "expense" ? "-" : "+"}
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleReconciled(tx.id, tx.is_reconciled)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all border ${
                          tx.is_reconciled
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 hover:bg-emerald-100"
                            : "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800 hover:bg-amber-100"
                        }`}
                      >
                        {tx.is_reconciled ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Reconciled
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5" /> Mark Reconciled
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setDeletingTx(tx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                        title="Delete Transaction"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Record Financial Transaction
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Enter details to save directly into Supabase public.transactions table.
            </p>

            <form onSubmit={handleRecordTransaction} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Transaction Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as Transaction["type"] })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="general_donation">General Donation</option>
                  <option value="member_fee">Member Fee</option>
                  <option value="class_payment">Class Payment</option>
                  <option value="expense">Expense</option>
                </select>
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
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="150.00"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Q3 Weekend School Tuition"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payer / Member / Vendor Name
                </label>
                <input
                  type="text"
                  value={formData.memberName}
                  onChange={(e) => setFormData({ ...formData, memberName: e.target.value })}
                  placeholder="Tariq Mansoor"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Method
                </label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Zelle">Zelle</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Check">Check</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                </select>
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
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md"
                >
                  Log Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTx && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Delete Transaction?
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Are you sure you want to delete <strong className="text-slate-800 dark:text-slate-200">{deletingTx.description} ({formatCurrency(deletingTx.amount)})</strong> from Supabase?
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeletingTx(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs w-full"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTransaction}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md w-full"
              >
                Delete Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
