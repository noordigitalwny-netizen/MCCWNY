"use client";

import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { saveStoredTransactions, getStoredTransactions, Transaction } from "@/lib/data-store";
import {
  FileCheck2,
  Printer,
  Save,
  RotateCw,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  HeartHandshake,
  BadgeCheck,
} from "lucide-react";

const donationTypes = [
  "Sadaqah",
  "General Donation",
  "Zakat",
  "Mosque",
  "Imam",
];

const paymentMethods = ["Zelle", "Cash", "Check", "Credit Card", "Bank Transfer"];

const generateReceiptNo = () => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `MCC-${year}-${randomNum}`;
};

export default function GenerateReceiptPage() {
  const [receiptNo, setReceiptNo] = useState(generateReceiptNo());
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [donationType, setDonationType] = useState("General Donation");
  const [amount, setAmount] = useState<string>("100");
  const [paymentMethod, setPaymentMethod] = useState("Zelle");
  const [notes, setNotes] = useState("");

  const [savedSuccess, setSavedSuccess] = useState(false);

  const numericAmount = parseFloat(amount) || 0;

  const handleRegenerateNo = () => {
    setReceiptNo(generateReceiptNo());
  };

  const handleSaveToLedger = () => {
    if (!fullName || numericAmount <= 0) {
      alert("Please enter donor full name and a valid donation amount.");
      return;
    }

    const currentTx = getStoredTransactions();
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      date: date,
      type: donationType === "General Donation" ? "general_donation" : "member_fee",
      amount: numericAmount,
      description: `${donationType} - Receipt #${receiptNo}${notes ? ` (${notes})` : ""}`,
      member_id: null,
      student_id: null,
      payment_method: paymentMethod,
      is_reconciled: true,
      created_at: new Date().toISOString(),
      memberName: fullName,
    };

    saveStoredTransactions([newTx, ...currentTx]);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div className="space-y-8">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Generate Official Donation Receipt
            </h1>
            <p className="text-xs text-slate-500">
              Create, print, and log tax-deductible donation receipts for community members
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveToLedger}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-all flex items-center gap-1.5 border border-slate-700 shadow-xs"
          >
            <Save className="w-3.5 h-3.5 text-emerald-400" />
            <span>Save to Transactions</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Download PDF</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 print:hidden">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Receipt <strong>{receiptNo}</strong> successfully recorded into the financial transactions ledger!</span>
        </div>
      )}

      {/* Main Grid: Form Inputs & Live Receipt Document */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Inputs Panel (Hidden on Print) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5 print:hidden">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-emerald-600" /> Donor & Payment Details
            </h2>
            <span className="text-[10px] font-mono bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800">
              Form Entry
            </span>
          </div>

          {/* Receipt No & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Receipt No.
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={receiptNo}
                  onChange={(e) => setReceiptNo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleRegenerateNo}
                  title="Generate new receipt number"
                  className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-500"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Receipt Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Donor Information */}
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Tariq Mansoor"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="(716) 555-0142"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="tariq@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Address
              </label>
              <input
                type="text"
                placeholder="452 Amherst St, Buffalo, NY 14207"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Donation Classification & Amount */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Donation Type *
              </label>
              <select
                value={donationType}
                onChange={(e) => setDonationType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
              >
                {donationTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Amount ($) *
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                >
                  {paymentMethods.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Notes / Specific Purpose
              </label>
              <input
                type="text"
                placeholder="e.g. Sadaqah Collection"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Live Official Printable Receipt Document */}
        <div className="lg:col-span-7 bg-white text-slate-900 border border-slate-300 rounded-3xl p-8 shadow-xl relative overflow-hidden print:border-none print:shadow-none print:p-0 print:m-0 print:w-full">
          {/* Top Decorative Border */}
          <div className="h-3 bg-linear-to-r from-emerald-800 via-emerald-600 to-emerald-900 -mx-8 -mt-8 mb-6 print:hidden" />

          {/* Receipt Header Branding */}
          <div className="flex items-start justify-between pb-6 border-b-2 border-emerald-900/20 gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 shrink-0 rounded-full border-2 border-emerald-700 overflow-hidden shadow-xs">
                {/* MCCWNY Attached Official Seal Logo */}
                <img
                  src="/logo.jpg"
                  alt="Muslim Community Center of West New York Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-emerald-950 tracking-tight leading-tight">
                  Muslim Community Center of West New York
                </h2>
                <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mt-0.5">
                  94 Meridian St, Depew, NY 14043
                </p>
                <p className="text-[11px] text-slate-600 mt-1">
                  (716) 327-5286
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-900 text-xs font-black rounded-lg uppercase tracking-widest border border-emerald-300">
                Official Receipt
              </span>
              <p className="text-xs font-mono font-bold text-slate-800 mt-2">
                No: <span className="text-emerald-800">{receiptNo}</span>
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                Date: {formatDate(date)}
              </p>
            </div>
          </div>

          {/* Donor Information Box */}
          <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Received From (Donor):
              </p>
              <p className="text-sm font-bold text-slate-900 mt-1">
                {fullName || "Donor Full Name"}
              </p>
              {address && (
                <p className="text-slate-600 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" /> {address}
                </p>
              )}
            </div>

            <div className="space-y-1">
              {phone && (
                <p className="text-slate-600 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {phone}
                </p>
              )}
              {email && (
                <p className="text-slate-600 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {email}
                </p>
              )}
              <p className="text-slate-600">
                Payment Method: <span className="font-semibold text-slate-800">{paymentMethod}</span>
              </p>
            </div>
          </div>

          {/* Receipt Particulars Table */}
          <div className="my-6 overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-emerald-900 text-white uppercase font-bold text-[11px]">
                <tr>
                  <th className="px-4 py-3">Donation Classification</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Notes / Purpose</th>
                  <th className="px-4 py-3 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr className="bg-white">
                  <td className="px-4 py-3.5 font-bold text-emerald-900">
                    {donationType}
                  </td>
                  <td className="px-4 py-3.5 text-slate-700">{paymentMethod}</td>
                  <td className="px-4 py-3.5 text-slate-600">
                    {notes || "Community Support"}
                  </td>
                  <td className="px-4 py-3.5 text-right font-black text-sm text-emerald-900">
                    {formatCurrency(numericAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total Amount Box */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 border border-emerald-200 my-6">
            <div>
              <p className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                Total Donation Received:
              </p>
              <p className="text-[11px] text-emerald-800 italic mt-0.5">
                May Allah (SWT) reward your generosity abundantly in this life and the hereafter.
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-emerald-900">
                {formatCurrency(numericAmount)}
              </p>
            </div>
          </div>

          {/* Disclaimer Notice */}
          <div className="text-[11px] text-slate-500 leading-relaxed border-t border-slate-200 pt-4 space-y-1">
            <p className="font-semibold text-slate-700 flex items-center gap-1">
              <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />  Note:
            </p>
            <p>
            </p>
          </div>

          {/* Signature & Seal Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex items-end justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-800">Muslim Community Center of WNY</p>
              <p className="text-[10px] text-slate-500">Authorized Treasury Signature</p>
            </div>

            <div className="text-center">
              <div className="w-36 border-b-2 border-slate-800 mb-1" />
              <p className="text-[10px] font-semibold text-slate-600">Authorized Representative</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
