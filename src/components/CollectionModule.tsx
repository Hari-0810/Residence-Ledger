/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { HandCoins, Plus, Search, CheckCircle, Clock, ShieldAlert, FileText, Download, IndianRupee, Trash, ArrowUpRight } from "lucide-react";
import { Transaction, PaymentStatus, CollectionType, PaymentMethod, Flat } from "../types";

interface CollectionModuleProps {
  transactions: Transaction[];
  flats: Flat[];
  onAddTransaction: (tx: Omit<Transaction, "id" | "createdAt">) => void;
  onUpdateTransaction: (id: string, updates: Partial<Transaction>) => void;
  onDeleteTransaction: (id: string) => void;
  isAdmin: boolean;
}

export default function CollectionModule({
  transactions,
  flats,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  isAdmin
}: CollectionModuleProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");

  // Form overlay toggle
  const [isOpen, setIsOpen] = useState(false);

  // New Transaction form fields
  const [flatId, setFlatId] = useState("");
  const [type, setType] = useState<CollectionType>(CollectionType.MAINTENANCE);
  const [amount, setAmount] = useState(3500);
  const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0]);
  const [paidDate, setPaidDate] = useState("");
  const [status, setStatus] = useState<PaymentStatus>(PaymentStatus.PAID);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.UPI);
  const [paymentReference, setPaymentReference] = useState("");

  // Print slip state
  const [printTx, setPrintTx] = useState<Transaction | null>(null);

  // Handle flat selection helper
  const handleFlatChange = (selectedId: string) => {
    setFlatId(selectedId);
    const flat = flats.find((f) => f.id === selectedId);
    if (flat) {
      if (type === CollectionType.MAINTENANCE) {
        setAmount(flat.monthlyMaintenanceCharge);
      } else if (type === CollectionType.RENT) {
        setAmount(flat.monthlyRentCharge || 0);
      }
    }
  };

  const handleTypeChange = (selectedType: CollectionType) => {
    setType(selectedType);
    const flat = flats.find((f) => f.id === flatId);
    if (flat) {
      if (selectedType === CollectionType.MAINTENANCE) {
        setAmount(flat.monthlyMaintenanceCharge);
      } else if (selectedType === CollectionType.RENT) {
        setAmount(flat.monthlyRentCharge || 0);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flatId) {
      alert("Please select a flat first");
      return;
    }

    const flat = flats.find((f) => f.id === flatId);
    if (!flat) return;

    onAddTransaction({
      flatId,
      flatNumber: flat.number,
      residentName: flat.occupancyStatus === "Tenant Occupied" ? (flat.tenantName || flat.ownerName) : flat.ownerName,
      type,
      amount,
      dueDate,
      paidDate: status === PaymentStatus.PAID ? (paidDate || dueDate) : undefined,
      status,
      paymentMethod: status === PaymentStatus.PAID ? paymentMethod : undefined,
      paymentReference: status === PaymentStatus.PAID ? paymentReference : undefined,
      isMigrated: false
    });

    // Reset Form
    setFlatId("");
    setAmount(3500);
    setPaidDate("");
    setPaymentReference("");
    setIsOpen(false);
  };

  // Filter out transaction registry
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.flatNumber.toLowerCase().includes(search.toLowerCase()) ||
      tx.residentName.toLowerCase().includes(search.toLowerCase()) ||
      (tx.paymentReference && tx.paymentReference.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "All" || tx.status === statusFilter;
    const matchesType = typeFilter === "All" || tx.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Title bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-sans font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
            <HandCoins className="text-indigo-600" size={20} /> Rent & Maintenance Ledger
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time accounts receivable dashboard. Issue monthly billing, track payments, monitor late dues and review audit histories.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => {
              if (flats.length > 0) {
                setFlatId(flats[0].id);
                setAmount(flats[0].monthlyMaintenanceCharge);
              }
              setIsOpen(true);
            }}
            className="bg-indigo-600 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Plus size={15} /> Collect Dues
          </button>
        )}
      </div>

      {/* Filters HUD */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search flats, payees, Tx references..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex bg-slate-100 rounded-xl p-0.5 border border-slate-250">
          {["All", PaymentStatus.PAID, PaymentStatus.PENDING, PaymentStatus.OVERDUE].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                statusFilter === status ? "bg-white text-indigo-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {status === "All" ? "All Bills" : status}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-250 text-slate-450 uppercase font-bold tracking-widest text-[10px]">
                <th className="p-4">Flat Info</th>
                <th className="p-4">Billing Category</th>
                <th className="p-4">Settled Amount</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Status</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4">Reference No.</th>
                <th className="p-4 text-center">Receipt</th>
                {isAdmin && <th className="p-4 text-right">Edit</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400 italic">
                    No transactions captured inside selection tags.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">Flat {tx.flatNumber}</div>
                      <div className="text-[10px] text-slate-400">{tx.residentName}</div>
                    </td>
                    <td className="p-4 font-semibold text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${tx.type === CollectionType.MAINTENANCE ? "bg-indigo-500" : "bg-teal-500"}`}></span>
                        {tx.type}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-950">₹{tx.amount.toLocaleString("en-IN")}</td>
                    <td className="p-4 font-mono text-slate-500">
                      {tx.dueDate}
                      {tx.paidDate && <div className="text-[10px] text-emerald-600">Paid: {tx.paidDate}</div>}
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          tx.status === PaymentStatus.PAID
                            ? "bg-emerald-50 text-emerald-800"
                            : tx.status === PaymentStatus.OVERDUE
                            ? "bg-rose-50 text-rose-800 animate-pulse"
                            : "bg-amber-50 text-amber-800"
                        }`}
                      >
                        {tx.status}
                      </span>
                      {tx.isMigrated && (
                        <span className="block mt-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                          Notebook Digitized
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-semibold text-slate-500">{tx.paymentMethod || "—"}</td>
                    <td className="p-4 font-mono text-slate-400 truncate max-w-[120px]" title={tx.paymentReference}>
                      {tx.paymentReference || "—"}
                    </td>
                    <td className="p-4 text-center">
                      {tx.status === PaymentStatus.PAID ? (
                        <button
                          onClick={() => setPrintTx(tx)}
                          className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors cursor-pointer"
                          title="Generate Receipt PDF"
                        >
                          <FileText size={16} />
                        </button>
                      ) : (
                        <span className="text-slate-310 text-[10px]">Unpaid</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="p-4 text-right space-x-1 whitespace-nowrap">
                        {tx.status !== PaymentStatus.PAID && (
                          <button
                            onClick={() => {
                              onUpdateTransaction(tx.id, {
                                status: PaymentStatus.PAID,
                                paidDate: new Date().toISOString().split("T")[0],
                                paymentMethod: PaymentMethod.UPI,
                                paymentReference: `UPI-RECOVERED-${Date.now().toString().slice(-6)}`
                              });
                            }}
                            className="bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg transition-all border border-emerald-100 cursor-pointer"
                          >
                            Mark Paid
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm("Delete this billing log entry permanently?")) {
                              onDeleteTransaction(tx.id);
                            }
                          }}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer align-middle"
                        >
                          <Trash size={14} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collect Dues Form overlay Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in scale-in duration-150">
            <div className="bg-slate-950 p-5 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="text-xs font-mono font-black text-indigo-300 uppercase tracking-widest">
                Collect Resident Dues
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
                  Select Apartment *
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
                    Charge Type
                  </label>
                  <select
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                    value={type}
                    onChange={(e) => handleTypeChange(e.target.value as CollectionType)}
                  >
                    <option value={CollectionType.MAINTENANCE}>Maintenance Fee</option>
                    <option value={CollectionType.RENT}>Rent Collection</option>
                    <option value={CollectionType.OTHER}>Other Contribution</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-550 uppercase tracking-wide mb-1">
                    Amount Collected (INR) *
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
                    Billing Due Date
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-550 uppercase tracking-wide mb-1">
                    Payment Status
                  </label>
                  <select
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as PaymentStatus)}
                  >
                    <option value={PaymentStatus.PAID}>Paid & Cleared</option>
                    <option value={PaymentStatus.PENDING}>Pending / Invoice Sent</option>
                    <option value={PaymentStatus.OVERDUE}>Overdue / Warning</option>
                  </select>
                </div>
              </div>

              {status === PaymentStatus.PAID && (
                <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-3.5">
                  <h4 className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
                    Required Clearing Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-medium text-slate-500 mb-1">Payment Method</label>
                      <select
                        className="w-full px-2 py-1.5 bg-white border border-slate-250 rounded-lg text-xs"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      >
                        <option value={PaymentMethod.UPI}>UPI (Gpay/PhonPe)</option>
                        <option value={PaymentMethod.BANK_TRANSFER}>Bank Transfer (NEFT)</option>
                        <option value={PaymentMethod.CASH}>Hard Cash Handover</option>
                        <option value={PaymentMethod.CHEQUE}>Cheque Deposit</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-slate-500 mb-1">Paid Date</label>
                      <input
                        type="date"
                        className="w-full px-2 py-1.5 bg-white border border-slate-250 rounded-lg text-xs"
                        value={paidDate}
                        onChange={(e) => setPaidDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1">Transaction Ref No./Receipt No.</label>
                    <input
                      type="text"
                      placeholder="e.g. UPI-992140-BBA"
                      className="w-full px-3.5 py-2 bg-white border border-slate-250 rounded-lg text-xs"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                    />
                  </div>
                </div>
              )}

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
                  className="bg-indigo-600 hover:bg-slate-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Record Payment Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* high fidelity Print receipt Slip Modal */}
      {printTx && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-200/85 shadow-2xl relative font-sans text-xs space-y-5 animate-in fade-in duration-200">
            {/* Stamp Logo */}
            <div className="text-center space-y-1.5">
              <span className="inline-flex p-3 bg-indigo-55/15 text-indigo-700 rounded-full border border-indigo-100">
                <HandCoins size={24} />
              </span>
              <h3 className="text-sm font-sans font-black tracking-widest text-slate-900 uppercase">
                Avaasa Society Ledger
              </h3>
              <p className="text-[10px] text-indigo-600 uppercase font-mono font-bold tracking-wider">
                Official Clearing Receipt
              </p>
            </div>

            <hr className="border-dashed border-slate-250" />

            {/* Receipt Table Details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Receipt Voucher</span>
                <span className="font-mono text-slate-800 font-semibold uppercase">{printTx.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Apartment flat</span>
                <span className="font-bold text-slate-800">Flat {printTx.flatNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Payer Name</span>
                <span className="font-semibold text-slate-800">{printTx.residentName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Allocation Tag</span>
                <span className="font-bold text-indigo-850">{printTx.type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Settled Date</span>
                <span className="font-mono text-slate-800">{printTx.paidDate || printTx.dueDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Payment Channel</span>
                <span className="font-semibold text-slate-700">{printTx.paymentMethod}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">UTR / Reference No</span>
                <span className="font-mono text-slate-500 text-[10px] truncate max-w-[150px]" title={printTx.paymentReference}>
                  {printTx.paymentReference || "—"}
                </span>
              </div>
              {printTx.isMigrated && (
                <div className="bg-slate-50 p-2 border border-slate-200 rounded-lg text-[10px] text-slate-500 italic leading-relaxed text-center">
                  * Hand-transfer digitized from physical manual records ledger registers.
                </div>
              )}
            </div>

            <hr className="border-dashed border-slate-250" />

            {/* Total cleared amount */}
            <div className="flex items-center justify-between bg-slate-900 text-white rounded-xl p-3.5 shadow-sm">
              <span className="font-sans font-bold text-[10px] uppercase tracking-wide">Net Amount Paid</span>
              <span className="font-mono font-black text-base text-emerald-400">
                ₹{printTx.amount.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Print trigger button controls */}
            <div className="flex items-center justify-between gap-4 mt-3">
              <button
                onClick={() => setPrintTx(null)}
                className="w-full py-2 border border-slate-200 text-slate-500 font-bold hover:text-slate-800 rounded-xl transition-all cursor-pointer text-center text-[11px]"
              >
                Close Slip
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="w-full py-2 bg-indigo-600 hover:bg-slate-900 text-white font-bold rounded-xl shadow transition-all cursor-pointer text-center text-[11px] flex items-center justify-center gap-1"
              >
                <Download size={12} /> Save PDF / Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
