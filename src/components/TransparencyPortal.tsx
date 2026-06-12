/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { ShieldCheck, Search, FileText, FileCheck, Landmark, CheckCircle, Flame, Target, ArrowDownRight, ArrowUpRight, Scale, Eye } from "lucide-react";
import { Transaction, Expense, Flat, PaymentStatus, CollectionType } from "../types";

interface TransparencyPortalProps {
  transactions: Transaction[];
  expenses: Expense[];
  flats: Flat[];
}

export default function TransparencyPortal({ transactions, expenses, flats }: TransparencyPortalProps) {
  const [subTab, setSubTab] = useState<"summary" | "inflows" | "outflows" | "delinquency">("summary");
  const [search, setSearch] = useState("");

  // Attachment preview
  const [viewDoc, setViewDoc] = useState<{ doc: string; name: string } | null>(null);

  // Stats calculation
  const totalCollected = transactions
    .filter((t) => t.status === PaymentStatus.PAID)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOutflow = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netCushion = totalCollected - totalOutflow;

  const totalOutstanding = transactions
    .filter((t) => t.status === PaymentStatus.OVERDUE || t.status === PaymentStatus.PENDING)
    .reduce((sum, t) => sum + t.amount, 0);

  // Peer accountability stats
  const paidFlatsCount = flats.filter((f) => {
    // A flat is fully paid if it has no overdue/pending collections in the transaction list
    const flatTx = transactions.filter((t) => t.flatId === f.id);
    const hasUnpaid = flatTx.some((t) => t.status === PaymentStatus.OVERDUE || t.status === PaymentStatus.PENDING);
    return flatTx.length > 0 && !hasUnpaid;
  }).length;

  return (
    <div className="space-y-6">
      {/* Transparency Header */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 border border-slate-800 text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="space-y-1.5 relative z-10">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-black tracking-widest text-emerald-400 uppercase">
            <ShieldCheck size={14} /> Resident Transparency Portal
          </div>
          <h2 className="text-xl md:text-2xl font-sans font-black tracking-tight uppercase">
            Society Auditing Transparency Deck
          </h2>
          <p className="text-slate-400 text-xs max-w-xl leading-relaxed">
            As a resident, enjoy read-only auditing clearance. View real-time treasury balances, search contractor invoice files, verify backdated registers, and inspect peer maintenance indices instantly.
          </p>
        </div>
        <div className="relative z-10 flex gap-4 shrink-0 font-sans">
          <div className="bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-center px-4 py-3 rounded-xl min-w-[120px]">
            <span className="text-[9px] uppercase tracking-wider text-slate-450 block">Audited Reserve</span>
            <p className="font-mono text-base font-black text-emerald-400 mt-1">
              ₹{netCushion.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
        {/* Visual Background Stamp */}
        <div className="absolute right-0 bottom-[-30px] opacity-10 text-white select-none pointer-events-none">
          <Scale size={180} />
        </div>
      </div>

      {/* Sub tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto pb-0.5">
        {[
          { id: "summary", label: "Financial Summary", icon: Landmark },
          { id: "inflows", label: "Monthly Collections", icon: ArrowUpRight },
          { id: "outflows", label: "Contractor Bills", icon: ArrowDownRight },
          { id: "delinquency", label: "Outstanding Flats status", icon: Target }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setSubTab(tab.id as any);
                setSearch("");
              }}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                subTab === tab.id
                  ? "border-indigo-600 text-indigo-900"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Interactive HUD Contents */}
      {subTab === "summary" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Certificate Stamp */}
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4">
            <span className="p-3 bg-emerald-100 text-emerald-800 rounded-full">
              <ShieldCheck size={26} />
            </span>
            <div className="text-center sm:text-left space-y-1">
              <h4 className="font-sans font-bold text-slate-800 text-sm">
                Society Ledger Audit Vetted & Cleared
              </h4>
              <p className="text-slate-500 text-xs">
                All monthly outgoings and backdated register balances are backed by contractor invoices, receipts proofs, and physical verifications. Checked by management auditors on <strong>2026-06-11</strong>.
              </p>
            </div>
            <span className="ml-auto bg-emerald-600 text-white font-mono text-[9px] font-black px-3 py-1 rounded shadow-sm tracking-widest uppercase">
              APPROVED
            </span>
          </div>

          {/* Key summaries indices */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-3">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-sans block">TOTAL REVENUE (IN)</span>
              <h3 className="text-xl font-mono font-black text-emerald-600">₹{totalCollected.toLocaleString("en-IN")}</h3>
              <p className="text-slate-500 text-xs">
                Cumulative of all paid maintenance slips, rent records, and backdated notebook items transcribed successfully.
              </p>
            </div>
            <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-3">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-sans block">TOTAL PAYMENT VOUCHERS (OUT)</span>
              <h3 className="text-xl font-mono font-black text-rose-600">₹{totalOutflow.toLocaleString("en-IN")}</h3>
              <p className="text-slate-500 text-xs">
                Combined outgoings disbursed for security Shifts, Lift maintenance retainers, housekeeping diesel, and water supplies.
              </p>
            </div>
            <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-3">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-sans block">SOCIETY COLLECTIVE DELINQUENCY</span>
              <h3 className="text-xl font-mono font-black text-amber-700">₹{totalOutstanding.toLocaleString("en-IN")}</h3>
              <p className="text-slate-500 text-xs">
                Money currently locked in pending peer invoices. Uncollected funds restrict community park and security enhancements.
              </p>
            </div>
          </div>
        </div>
      )}

      {subTab === "inflows" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-4 border border-slate-100 flex items-center">
            <Search className="text-slate-400 shrink-0 mr-3" size={16} />
            <input
              type="text"
              placeholder="Filter payments by flat number, owner, or UTR reference..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left font-sans text-xs">
              <thead className="bg-[#f8fafc] border-b text-slate-450 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-4">Flat Info</th>
                  <th className="p-4">Billing classification</th>
                  <th className="p-4">Amount Paid</th>
                  <th className="p-4">Settled date</th>
                  <th className="p-4">Receipt Stamp</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-650">
                {transactions
                  .filter((t) => t.status === PaymentStatus.PAID)
                  .filter((t) => t.flatNumber.toLowerCase().includes(search.toLowerCase()) || t.residentName.toLowerCase().includes(search.toLowerCase()))
                  .map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/50">
                      <td className="p-4">
                        <span className="font-bold text-slate-900 block">Flat {t.flatNumber}</span>
                        <span className="text-[10px] text-slate-400">{t.residentName}</span>
                      </td>
                      <td className="p-4 font-semibold text-slate-600">{t.type}</td>
                      <td className="p-4 font-mono font-black text-slate-900">₹{t.amount.toLocaleString("en-IN")}</td>
                      <td className="p-4 font-mono text-slate-500">{t.paidDate || t.dueDate}</td>
                      <td className="p-4">
                        <span className="bg-emerald-50 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-extrabold uppercase">
                          VERIFIED SLA
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === "outflows" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-4 border border-slate-105 flex items-center">
            <Search className="text-slate-400 shrink-0 mr-3" size={16} />
            <input
              type="text"
              placeholder="Search expenses by category, vendor name, approved authorizers..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {expenses
              .filter((e) => e.title.toLowerCase().includes(search.toLowerCase()) || e.vendorName.toLowerCase().includes(search.toLowerCase()))
              .map((e) => (
                <div key={e.id} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3.5 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="bg-slate-100 text-slate-700 text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                        {e.category}
                      </span>
                      <h4 className="font-sans font-black text-slate-900 mt-1">{e.title}</h4>
                    </div>
                    <span className="font-mono text-rose-700 font-extrabold text-sm">
                      ₹{e.amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs leading-relaxed">{e.description}</p>
                  <div className="font-sans text-[11px] text-slate-500 bg-slate-50 p-2 border rounded-lg space-y-1">
                    <div className="flex justify-between"><span className="text-slate-400">Vendor:</span> <strong className="text-slate-700">{e.vendorName}</strong></div>
                    <div className="flex justify-between"><span className="text-slate-400">Voucher date:</span> <span>{e.date}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Auditor verified:</span> <span>{e.approvedBy}</span></div>
                  </div>
                  {e.supportingDocument ? (
                    <button
                      onClick={() => setViewDoc({ doc: e.supportingDocument!, name: e.documentName || "Invoice" })}
                      className="bg-indigo-50 border border-indigo-150 text-indigo-700 px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 cursor-pointer hover:bg-indigo-100 transition-colors"
                    >
                      <Eye size={12} /> Inspect Filed Bill Receipt
                    </button>
                  ) : (
                    <p className="text-[10px] text-slate-400 italic">No contractor receipt filed for this outgoings voucher.</p>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {subTab === "delinquency" && (
        <div className="space-y-4 animate-in fade-in duration-200 font-sans">
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-xs text-amber-800 space-y-1">
            <h4 className="font-bold flex items-center gap-1">
              <Flame size={14} fill="currentColor" /> peer-to-peer accountability mandate
            </h4>
            <p className="leading-relaxed">
              To guarantee seamless water supplies and block security shifts, all apartments are encouraged to audit dues collectively. Clear dues punctually to restrict delinquency percentages.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {flats.map((flat) => {
              // Analyze unpaid list
              const unpaidTx = transactions.filter((t) => t.flatId === flat.id && t.status !== PaymentStatus.PAID);
              const isFullyPaid = unpaidTx.length === 0;

              return (
                <div
                  key={flat.id}
                  className={`p-4 rounded-xl border ${
                    isFullyPaid ? "bg-emerald-50/20 border-emerald-100" : "bg-rose-50/10 border-rose-100"
                  } shadow-sm space-y-3`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">Flat {flat.number}</span>
                    <span
                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                        isFullyPaid ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800 animate-pulse"
                      }`}
                    >
                      {isFullyPaid ? "FULLY PAID" : "OUTSTANDINGS"}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    <p className="font-semibold text-slate-700">{flat.ownerName}</p>
                    <p className="text-[10px] text-slate-400">Monthly Contribution: ₹{flat.monthlyMaintenanceCharge}</p>
                  </div>
                  {!isFullyPaid && (
                    <div className="pt-2 border-t border-rose-100 text-[10px] text-rose-700 space-y-1">
                      <p className="font-bold uppercase tracking-wide">Pending items:</p>
                      {unpaidTx.map((tx) => (
                        <div key={tx.id} className="flex justify-between font-mono font-semibold">
                          <span>{tx.type}</span>
                          <span className="font-bold text-rose-805">₹{tx.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View Attachment receipt */}
      {viewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl p-6 flex flex-col items-center space-y-4 animate-in duration-200">
            <div className="w-full flex items-center justify-between border-b pb-3 border-slate-100">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase">{viewDoc.name}</span>
              <button
                onClick={() => setViewDoc(null)}
                className="text-slate-400 hover:text-slate-800 text-xs border rounded px-2.5 py-1 cursor-pointer font-sans font-semibold"
              >
                Close Receipt
              </button>
            </div>
            {viewDoc.doc.startsWith("data:image/") ? (
              <img src={viewDoc.doc} alt={viewDoc.name} className="max-h-[50vh] max-w-full rounded-xl object-contain border" />
            ) : (
              <div className="w-full h-40 bg-slate-50 rounded-xl flex flex-col items-center justify-center border border-dashed text-slate-400 text-center p-4">
                <FileCheck size={36} className="text-indigo-600 mb-1" />
                <p className="font-bold text-xs text-slate-700">{viewDoc.name}</p>
                <p className="text-[10px] text-slate-405 mt-1">Contractor document resides in local database binary store.</p>
              </div>
            )}
            <a
              href={viewDoc.doc}
              download={viewDoc.name}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-slate-900 text-white font-semibold font-sans text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              Raw File Download
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
