/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Receipt, Plus, Search, Eye, Download, FileCheck, IndianRupee, Trash, ArrowDownRight, Paperclip, CheckCircle } from "lucide-react";
import { Expense, ExpenseCategory } from "../types";

interface ExpenseModuleProps {
  expenses: Expense[];
  onAddExpense: (exp: Omit<Expense, "id" | "createdAt">) => void;
  onDeleteExpense: (id: string) => void;
  isAdmin: boolean;
}

export default function ExpenseModule({ expenses, onAddExpense, onDeleteExpense, isAdmin }: ExpenseModuleProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Form toggle status
  const [isOpen, setIsOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [category, setCategory] = useState<ExpenseCategory>(ExpenseCategory.ELECTRICITY);
  const [amount, setAmount] = useState(500);
  const [vendorName, setVendorName] = useState("");
  const [vendorContact, setVendorContact] = useState("");
  const [approvedBy, setApprovedBy] = useState("Ramanathan Iyer");
  const [supportingDocument, setSupportingDocument] = useState("");
  const [documentName, setDocumentName] = useState("");

  // Viewing attachment image modal
  const [viewDoc, setViewDoc] = useState<{ doc: string; name: string } | null>(null);

  // Read upload file as clean standard base64 URI
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocumentName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSupportingDocument(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !vendorName) {
      alert("Please fill in outstanding required fields");
      return;
    }

    onAddExpense({
      title,
      description,
      date,
      category,
      amount,
      vendorName,
      vendorContact: vendorContact || undefined,
      approvedBy,
      approvalDate: date,
      supportingDocument: supportingDocument || undefined,
      documentName: documentName || undefined,
      isMigrated: false
    });

    // Reset fields
    setTitle("");
    setDescription("");
    setAmount(500);
    setVendorName("");
    setVendorContact("");
    setSupportingDocument("");
    setDocumentName("");
    setIsOpen(false);
  };

  // Filter listings
  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch =
      exp.title.toLowerCase().includes(search.toLowerCase()) ||
      exp.description.toLowerCase().includes(search.toLowerCase()) ||
      exp.vendorName.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = selectedCategory === "All" || exp.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-sans font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
            <Receipt className="text-indigo-600" size={20} /> Community Expense & Bills
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Accounts payable register. Record outgoings, housekeeping retainers, lift repairs, security shifts, and upload audit bills.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsOpen(true)}
            className="bg-indigo-600 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Plus size={15} /> Record Expense
          </button>
        )}
      </div>

      {/* Filters bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search expense titles, vendors, descriptors..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-550 transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium font-sans">Filter Category:</span>
          <select
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-semibold focus:outline-none"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            {Object.values(ExpenseCategory).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Outgoings ledger list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredExpenses.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 text-xs italic bg-white rounded-2xl border border-slate-200">
            No community outgoings captured inside selected filter tags.
          </div>
        ) : (
          filteredExpenses.map((exp) => (
            <div
              key={exp.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-1">
                <div className="flex items-start justify-between">
                  <span className="bg-rose-50 border border-rose-100 text-rose-700 uppercase font-mono text-[9px] font-extrabold px-2.5 py-0.5 rounded-full">
                    {exp.category}
                  </span>
                  <span className="font-mono text-[10px] text-slate-450">{exp.date}</span>
                </div>
                <h3 className="text-sm font-sans font-black text-slate-900 mt-1">{exp.title}</h3>
                <p className="text-slate-500 font-sans text-xs leading-relaxed">{exp.description}</p>
                {exp.isMigrated && (
                  <span className="inline-block mt-1 text-[9px] font-bold text-slate-450 uppercase tracking-widest leading-none">
                    Notebook Digitized
                  </span>
                )}
              </div>

              {/* Vendor & Auditor details */}
              <div className="bg-slate-100/50 p-3 rounded-xl border border-slate-200/30 text-xs space-y-1.5 font-sans text-slate-600">
                <div className="flex justify-between">
                  <span>Vendor:</span>
                  <strong className="text-slate-800">{exp.vendorName}</strong>
                </div>
                {exp.vendorContact && (
                  <div className="flex justify-between font-mono text-[11px]">
                    <span>Contact:</span>
                    <span>{exp.vendorContact}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Auditor / Approved:</span>
                  <span className="font-medium text-slate-700">{exp.approvedBy}</span>
                </div>
              </div>

              {/* Base price & Billings upload checks */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 mt-2">
                <div className="flex items-center gap-2">
                  {exp.supportingDocument ? (
                    <button
                      onClick={() => setViewDoc({ doc: exp.supportingDocument!, name: exp.documentName || "Invoice" })}
                      className="bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white px-2.5 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1 transition-all cursor-pointer border border-indigo-100"
                    >
                      <Eye size={12} /> View Bill Receipt
                    </button>
                  ) : (
                    <span className="text-slate-400 text-[10px] italic">No receipt attached</span>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-mono font-black text-rose-700 text-base">
                    ₹{exp.amount.toLocaleString("en-IN")}
                  </span>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        if (confirm("Delete this expense logs record?")) {
                          onDeleteExpense(exp.id);
                        }
                      }}
                      className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Record Expense Modal overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in duration-150">
            <div className="bg-slate-950 p-5 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="text-xs font-mono font-black text-indigo-300 uppercase tracking-widest">
                File Community Expense
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white text-xs border border-slate-800 rounded px-2 py-1"
              >
                Esc
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 font-sans text-xs max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-550 uppercase tracking-wide mb-1">
                  Expense Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Generator Diesel Refill"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-550 uppercase tracking-wide mb-1">
                  Detailed Voucher Description
                </label>
                <textarea
                  placeholder="Review specifications or reasons for outgoings..."
                  rows={2}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-550 uppercase tracking-wide mb-1">
                    Expense Category
                  </label>
                  <select
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  >
                    {Object.values(ExpenseCategory).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-550 uppercase tracking-wide mb-1">
                    Debit Amount (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono text-rose-700"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-550 uppercase tracking-wide mb-1">
                    Expense Date *
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-550 uppercase tracking-wide mb-1">
                    Approved / Certified By
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
                    value={approvedBy}
                    onChange={(e) => setApprovedBy(e.target.value)}
                  />
                </div>
              </div>

              {/* Vendor profiles details */}
              <div className="space-y-3.5 border-t border-slate-150 pt-3.5">
                <h4 className="text-xs font-bold text-slate-650 uppercase tracking-wider">Vendor Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Vendor/Agency Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Otis Lift Corp"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      value={vendorName}
                      onChange={(e) => setVendorName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Vendor Contact No</label>
                    <input
                      type="text"
                      placeholder="98XXXXXX"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      value={vendorContact}
                      onChange={(e) => setVendorContact(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Digital receipts upload proof */}
              <div className="space-y-2 border-t border-slate-150 pt-3.5">
                <h4 className="text-xs font-bold text-indigo-750 uppercase tracking-widest flex items-center gap-1">
                  <Paperclip size={13} /> Upload Supporting Document
                </h4>
                <div className="flex items-center gap-3 bg-indigo-50/20 border border-indigo-100 p-3 rounded-xl">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="text-xs text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 file:cursor-pointer"
                    onChange={handleFileChange}
                  />
                </div>
                {documentName && (
                  <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-1 animate-pulse">
                    <CheckCircle size={10} /> {documentName} loaded successfully
                  </p>
                )}
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
                  Record Outflow Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Attachment image Modal */}
      {viewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in duration-150 p-6 flex flex-col items-center space-y-4">
            <div className="w-full flex items-center justify-between border-b pb-3 border-slate-100">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase">{viewDoc.name}</span>
              <button
                onClick={() => setViewDoc(null)}
                className="text-slate-400 hover:text-slate-800 text-xs border rounded px-2.5 py-1 cursor-pointer"
              >
                Close View
              </button>
            </div>
            {viewDoc.doc.startsWith("data:image/") ? (
              <img
                src={viewDoc.doc}
                alt={viewDoc.name}
                referrerPolicy="no-referrer"
                className="max-h-[50vh] max-w-full rounded-xl object-contain border border-slate-150"
              />
            ) : (
              <div className="w-full h-48 bg-slate-50 rounded-xl flex flex-col items-center justify-center border border-dashed border-slate-300 text-slate-500 text-center p-4">
                <FileCheck size={36} className="text-indigo-600 mb-2" />
                <p className="font-bold text-xs text-slate-700">{viewDoc.name}</p>
                <p className="text-[10px] text-slate-400 mt-1">PDF or raw file is embedded. Download to check contents locally.</p>
              </div>
            )}
            <a
              href={viewDoc.doc}
              download={viewDoc.name}
              className="px-5 py-2 bg-indigo-600 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
            >
              Download Original File
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
