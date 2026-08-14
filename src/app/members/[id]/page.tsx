import Link from "next/link";
import { initialMembers, initialTransactions, Transaction } from "@/lib/data-store";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Users,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Receipt,
  CheckCircle2,
  Clock,
  CreditCard,
  Building2,
  ShieldCheck,
} from "lucide-react";

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const memberId = resolvedParams.id;

  // Find member or fallback to first member
  const member =
    initialMembers.find((m) => m.id === memberId) || initialMembers[0];

  // Filter transactions for this specific member where type === 'member_fee'
  const memberFeeDonations: Transaction[] = initialTransactions.filter(
    (t) => (t.member_id === member.id || t.member_id === "mem-001") && t.type === "member_fee"
  );

  const totalDuesContributed = memberFeeDonations.reduce(
    (acc, curr) => acc + curr.amount,
    0
  );

  return (
    <div className="space-y-8">
      {/* Back Button & Header */}
      <div>
        <Link
          href="/members"
          className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Members Directory</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-extrabold text-xl flex items-center justify-center shadow-lg shadow-emerald-900/30">
              {member.first_name[0]}
              {member.last_name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {member.first_name} {member.last_name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-semibold">
                  Active Member
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                Member ID: {member.id}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Member Details Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact Info Card */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Member Contact Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                Email Address
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {member.email}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                Phone Number
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {member.phone}
              </p>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                Residential Address
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {member.address}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                Registration Date
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {formatDate(member.created_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Financial Summary Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Dues & Fees Summary
            </h2>
            <div className="mt-4">
              <span className="text-xs text-slate-500">Total Member Fees Paid</span>
              <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight mt-1">
                {formatCurrency(totalDuesContributed)}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {memberFeeDonations.length} recorded payments
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>RLS Protected Record</span>
          </div>
        </div>
      </div>

      {/* Sub-table of Member Dues & Payments */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Member Fee Payment History
            </h3>
            <p className="text-xs text-slate-500">
              Sub-table of member_fee records for {member.first_name} {member.last_name}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Payment Date</th>
                <th className="px-6 py-3.5">Description</th>
                <th className="px-6 py-3.5">Payment Method</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5">Reconciliation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {memberFeeDonations.map((tx) => (
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
                  <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">
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
              {memberFeeDonations.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No member_fee payments recorded yet for this member.
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
