/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { BookOpenText, Plus, Search, HelpCircle, HardDriveDownload, Sparkles, CheckSquare, Trash, CornerDownRight } from "lucide-react";
import { Transaction, PaymentStatus, CollectionType, PaymentMethod, Flat } from "../types";

interface HistoricalModuleProps {
  transactions: Transaction[];
  flats: Flat[];
  onAddTransaction: (tx: Omit<Transaction, "id" | "createdAt">) => void;
  onDeleteTransaction: (id: string) => void;
  isAdmin: boolean;
}

export default function HistoricalModule({
  transactions,
  flats,
  onAddTransaction,
  onDeleteTransaction,
  isAdmin
}: HistoricalModuleProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Form states
  const [flatId, setFlatId] = useState("");
  const [type, setType] = useState<CollectionType>(CollectionType.MAINTENANCE);
  const [amount, setAmount] = useState(3200); // Historical custom rates differ
  const [backDate, setBackDate] = useState("2025-11-01");
  const [legacyRef, setLegacyRef] = useState("REGISTER-NBOOK-P57");
  const [migratedNotes, setMigratedNotes] = useState("");

  const handleFlatChange = (selectedId: string) => {
    setFlatId(selectedId);
    const flat = flats.find((f) => f.id === selectedId);
    if (flat) {
      // Seed slightly lower rates for older periods (historical inflation)
      setAmount(flat.monthlyMaintenanceCharge - 300);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flatId) {
      alert("Please select a flat to allocate the historical record.");
      return;
    }

    const flat = flats.find((f) => f.id === flatId);
    if (!flat) return;

    onAddTransaction({
      flatId,
      flatNumber: flat.number,
      residentName: flat.ownerName,
      type,
      amount,
      dueDate: backDate,
      paidDate: backDate,
      status: PaymentStatus.PAID,
      paymentMethod: PaymentMethod.CASH,
      paymentReference: legacyRef,
      isMigrated: true,
      migratedNotes: migratedNotes || `Digitized legacy manual ledger register record. Verified by Ramanathan Iyer. Ref: ${legacyRef}`
    });

    // Reset and Close
    setFlatId("");
    setLegacyRef("REGISTER-NBOOK-P" + Math.floor(Math.random() * 100));
    setMigratedNotes("");
    setIsOpen(false);
  };

  // Only show migrated transactions
  const migratedTx = transactions.filter((t) => t.isMigrated === true);
  const cumulativeMigratedSum = migratedTx.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Module Banner Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-md">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1 text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase">
            <BookOpenText size={12} /> Paper-to-Cloud Migration
          </div>
          <h2 className="text-xl md:text-2xl font-sans font-bold tracking-tight">
            Historical Ledger Digitization Console
          </h2>
          <p className="text-slate-400 text-xs max-w-xl leading-relaxed">
            Society administrators can digitalise old manually written notebook-based registers, continue accounting with zero interruptions, and maintain absolute audits longevity recursively.
          </p>
        </div>
        <div>
          <div className="bg-slate-950 px-4 py-3 rounded-xl border border-slate-800 text-center space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">Migrated Sum</span>
            <p className="font-mono text-lg font-black text-emerald-400">
              ₹{cumulativeMigratedSum.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>

      {/* Migration guidelines */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-slate-200 bg-white rounded-xl p-4 text-xs text-slate-600 space-y-2">
          <h4 className="font-bold text-slate-800 flex items-center gap-1">
            <CheckSquare size={14} className="text-indigo-600" />
            1. Transcribe Register Lines
          </h4>
          <p className="text-slate-500 leading-relaxed">
            Record physical billing, maintenance amounts, backdates, and old ledger index references directly into digital logs.
          </p>
        </div>
        <div className="border border-slate-200 bg-white rounded-xl p-4 text-xs text-slate-600 space-y-2">
          <h4 className="font-bold text-slate-800 flex items-center gap-1">
            <HelpCircle size={14} className="text-indigo-600" />
            2. Match Prior Payments
          </h4>
          <p className="text-slate-500 leading-relaxed">
            Assign the exact cash or cheque receipts clearing timestamp so the financial charts and trends maintain pristine chronology.
          </p>
        </div>
        <div className="border border-slate-200 bg-white rounded-xl p-4 text-xs text-slate-600 space-y-2">
          <h4 className="font-bold text-slate-800 flex items-center gap-1">
            <Sparkles size={14} className="text-indigo-600" />
            3. Transparency Stamp
          </h4>
          <p className="text-slate-500 leading-relaxed">
            Migrated items automatically inherit a dedicated visibility tag, assuring residents that past records were vetted correctly.
          </p>
        </div>
      </div>

      {/* Section Controls */}
      <div className="flex items-center justify-between border-t border-slate-250 pt-4">
        <div>
          <h3 className="text-sm font-sans font-black text-slate-800 uppercase tracking-widest">
            📂 Migrated Register Entries ({migratedTx.length})
          </h3>
          <p className="text-[11px] text-slate-400">Past register books transcribed into digital database rows.</p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              if (flats.length > 0) {
                setFlatId(flats[0].id);
                setAmount(flats[0].monthlyMaintenanceCharge - 300);
              }
              setIsOpen(true);
            }}
            className="bg-indigo-600 hover:bg-slate-900 border border-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1 shadow-sm transition-all cursor-pointer"
          >
            <Plus size={14} /> Digitize Old Record
          </button>
        )}
      </div>

      {/* Migrated Ledger List */}
      <div className="space-y-3.5">
        {migratedTx.length === 0 ? (
          <div className="py-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 text-xs italic">
            No old physical notebook entries transcribed yet. Click "Digitize Old Record" to begin.
          </div>
        ) : (
          migratedTx.map((tx) => (
            <div
              key={tx.id}
              className="bg-white rounded-xl border border-dashed border-slate-320 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1 font-sans">
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-50 border border-indigo-150 text-indigo-700 font-mono text-[9px] font-black px-2 py-0.5 rounded">
                    MIGRATED LEDGER ENTRY
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 font-medium">Tx Ref: {tx.paymentReference}</span>
                </div>
                <h4 className="font-bold text-slate-800 text-xs">
                  Flat {tx.flatNumber} — {tx.residentName} ({tx.type})
                </h4>
                <p className="text-slate-500 text-[11px] leading-relaxed flex items-center gap-0.5 pl-2 border-l-2 border-indigo-100">
                  <CornerDownRight size={10} className="text-slate-400 shrink-0" />
                  {tx.migratedNotes}
                </p>
                <div className="text-[10px] text-slate-400 font-mono">
                  Recorded Backdate: <span className="font-bold text-slate-600">{tx.dueDate}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wide">Migrated Amount</span>
                  <span className="font-mono text-slate-950 font-black text-sm">
                    ₹{tx.amount.toLocaleString("en-IN")}
                  </span>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => {
                      if (confirm("Delete this physical registration copy logs record?")) {
                        onDeleteTransaction(tx.id);
                      }
                    }}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all border border-transparent hover:border-rose-100 cursor-pointer"
                  >
                    <Trash size={14} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Migration Form Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in scale-in duration-150">
            <div className="bg-slate-950 p-5 text-white flex items-center justify-between border-b border-slate-700">
              <h3 className="text-xs font-mono font-black text-indigo-300 uppercase tracking-widest">
                Digitize Legacy Ledger Record
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white text-xs border border-slate-800 rounded px-2 py-1"
              >
                Esc
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 font-sans text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-550 uppercase tracking-wide mb-1">
                  Apartment Flat Code *
                </label>
                <select
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                  value={flatId}
                  onChange={(e) => handleFlatChange(e.target.value)}
                >
                  <option value="" disabled>Select flat location</option>
                  {flats.map((f) => (
                    <option key={f.id} value={f.id}>
                      Flat {f.number} ({f.ownerName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-550 uppercase tracking-wide mb-1">
                    Historical Record Category
                  </label>
                  <select
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                    value={type}
                    onChange={(e) => setType(e.target.value as CollectionType)}
                  >
                    <option value={CollectionType.MAINTENANCE}>Maintenance Collection</option>
                    <option value={CollectionType.RENT}>Rent Collection</option>
                    <option value={CollectionType.OTHER}>Other Society contribution</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-550 uppercase tracking-wide mb-1">
                    Migrated Amount (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono text-indigo-900"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-550 uppercase tracking-wide mb-1">
                    Historical Backdate *
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
                    value={backDate}
                    onChange={(e) => setBackDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-550 uppercase tracking-wide mb-1">
                    Notebook Reference No. *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NBOOK-P55"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    value={legacyRef}
                    onChange={(e) => setLegacyRef(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-550 uppercase tracking-wide mb-1">
                  Auditor Verification Notes
                </label>
                <textarea
                  placeholder="e.g. Cleared by cash handover to Ramanathan Iyer on Nov 2nd, 2025."
                  rows={3}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                  value={migratedNotes}
                  onChange={(e) => setMigratedNotes(e.target.value)}
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3.5 border-t border-slate-150 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-slate-500 hover:text-slate-800 font-bold text-xs cursor-pointer focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-slate-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow cursor-pointer"
                >
                  Confirm Cloud Digitization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
