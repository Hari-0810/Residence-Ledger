/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import { ArrowUpRight, ArrowDownRight, IndianRupee, ShieldAlert, CheckCircle, Flame, Target, MessageSquareCode, Sparkles, Building2, BookOpenText } from "lucide-react";
import { Transaction, Expense, Announcement, PaymentStatus, CollectionType } from "../types";

interface DashboardStatsProps {
  transactions: Transaction[];
  expenses: Expense[];
  announcements: Announcement[];
  onNavigate: (tab: string) => void;
}

export default function DashboardStats({ transactions, expenses, announcements, onNavigate }: DashboardStatsProps) {
  // 1. Calculate main financials
  const paidTx = transactions.filter((t) => t.status === PaymentStatus.PAID);
  const overdueTx = transactions.filter((t) => t.status === PaymentStatus.OVERDUE);
  const pendingTx = transactions.filter((t) => t.status === PaymentStatus.PENDING);

  const totalCollected = paidTx.reduce((sum, t) => sum + t.amount, 0);
  const totalOutstanding = [...overdueTx, ...pendingTx].reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netSavings = totalCollected - totalExpenses;

  // 2. Collection Target Progress
  const totalTargetAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const collectionPercentage = totalTargetAmount > 0 ? Math.round((totalCollected / totalTargetAmount) * 100) : 0;

  // 3. Recharts - Monthly Operations Cash Flow Data Mock
  const cashFlowData = [
    { name: "Jan", Inflow: 32000, Outflow: 18000 },
    { name: "Feb", Inflow: 28000, Outflow: 14000 },
    { name: "Mar", Inflow: 35000, Outflow: 19500 },
    { name: "Apr", Inflow: 41000, Outflow: 25000 },
    { name: "May", Inflow: 38500, Outflow: 26500 },
    { name: "Jun (Current)", Inflow: totalCollected, Outflow: totalExpenses }
  ];

  // 4. Recharts - Pie Chart Category Breakdown
  const expenseCatMap: Record<string, number> = {};
  expenses.forEach((e) => {
    expenseCatMap[e.category] = (expenseCatMap[e.category] || 0) + e.amount;
  });

  const pieColors = ["#3B82F6", "#10B981", "#EF4444", "#F59E0B", "#8B5CF6", "#EC4899", "#14B8A6", "#64748B"];
  const pieData = Object.entries(expenseCatMap).map(([name, value]) => ({
    name,
    value
  }));

  // Render dashboard
  return (
    <div className="space-y-6">
      {/* Financial Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Completed Collections */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between relative overflow-hidden">
          <div className="space-y-2">
            <p className="text-slate-400 text-xs font-medium tracking-wide uppercase">Collections Completed</p>
            <h3 className="text-2xl font-bold font-mono text-slate-900">₹{totalCollected.toLocaleString("en-IN")}</h3>
            <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
              <ArrowUpRight size={14} />
              <span>Includes notebook data</span>
            </div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <IndianRupee size={20} />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500"></div>
        </div>

        {/* Card 2: Total Expenses */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between relative overflow-hidden">
          <div className="space-y-2">
            <p className="text-slate-400 text-xs font-medium tracking-wide uppercase">Community Expenses</p>
            <h3 className="text-2xl font-bold font-mono text-slate-900">₹{totalExpenses.toLocaleString("en-IN")}</h3>
            <div className="flex items-center gap-1 text-rose-600 text-xs font-semibold">
              <ArrowDownRight size={14} />
              <span>Bills filed transparently</span>
            </div>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <ArrowDownRight size={20} />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500"></div>
        </div>

        {/* Card 3: Net Cash Reserve */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between relative overflow-hidden">
          <div className="space-y-2">
            <p className="text-slate-400 text-xs font-medium tracking-wide uppercase">Operating Cash Reserve</p>
            <h3 className={`text-2xl font-bold font-mono ${netSavings >= 0 ? "text-indigo-950" : "text-rose-700"}`}>
              ₹{netSavings.toLocaleString("en-IN")}
            </h3>
            <div className="flex items-center gap-1 text-indigo-600 text-xs font-semibold">
              <CheckCircle size={12} strokeWidth={2.5} />
              <span>Net surplus handbooks</span>
            </div>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Building2 size={20} />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600"></div>
        </div>

        {/* Card 4: Uncollected Dues */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between relative overflow-hidden">
          <div className="space-y-2">
            <p className="text-slate-400 text-xs font-medium tracking-wide uppercase">Outstanding Dues</p>
            <h3 className="text-2xl font-bold font-mono text-amber-700">₹{totalOutstanding.toLocaleString("en-IN")}</h3>
            <div className="flex items-center gap-1 text-amber-600 text-xs font-semibold">
              <ShieldAlert size={14} />
              <span>Pending collections</span>
            </div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
            <Target size={20} />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500"></div>
        </div>
      </div>

      {/* Target Progress Meter */}
      <div className="bg-indigo-900 text-white rounded-2xl p-5 shadow-sm border border-indigo-950 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-indigo-200 font-medium text-xs tracking-wider uppercase">
            <Target size={14} /> Monthly Collection Target
          </div>
          <h4 className="text-lg font-bold font-sans">
            Collected <span className="font-mono text-emerald-400 font-black">₹{totalCollected.toLocaleString("en-IN")}</span> out of ₹{totalTargetAmount.toLocaleString("en-IN")}
          </h4>
          <p className="text-indigo-200 text-xs">
            Help complete standard community collections by issuing notifications and recording payments.
          </p>
        </div>
        <div className="w-full md:w-64 space-y-2">
          <div className="flex items-center justify-between font-mono text-xs font-semibold">
            <span>Progress Meter</span>
            <span className="text-emerald-300">{collectionPercentage}% Achieved</span>
          </div>
          <div className="w-full bg-indigo-950/40 h-3.5 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div 
              className="bg-gradient-to-r from-emerald-400 to-teal-400 h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(collectionPercentage, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Quick Launchpad & AI Advice */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Core Quick Links Dashboard */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <h4 className="text-sm font-sans font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">
            ⚡ Quick Actions
          </h4>
          <div className="grid grid-cols-1 gap-2">
            <button 
              onClick={() => onNavigate("collections")} 
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-150 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/20 text-left font-sans text-sm font-semibold text-slate-700 hover:text-indigo-900 transition-all cursor-pointer group"
            >
              <span className="flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-600" />
                Record Maintenance Fees
              </span>
              <ArrowUpRight size={14} className="text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
            <button 
              onClick={() => onNavigate("expenses")} 
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-150 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/20 text-left font-sans text-sm font-semibold text-slate-700 hover:text-indigo-900 transition-all cursor-pointer group"
            >
              <span className="flex items-center gap-2">
                <ArrowDownRight size={16} className="text-rose-600" />
                Record Community Expense
              </span>
              <ArrowUpRight size={14} className="text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
            <button 
              onClick={() => onNavigate("historic")} 
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/30 hover:bg-indigo-50 text-left font-sans text-sm font-semibold text-indigo-900 hover:border-indigo-300 transition-all cursor-pointer group"
            >
              <span className="flex items-center gap-2">
                <BookOpenText size={16} className="text-indigo-600" />
                Digitize Legacy Register
              </span>
              <ArrowUpRight size={14} className="text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
            <button 
              onClick={() => onNavigate("ai-insights")} 
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-teal-100 bg-emerald-50/30 hover:bg-emerald-50 text-left font-sans text-sm font-bold text-teal-900 hover:border-teal-300 transition-all cursor-pointer group"
            >
              <span className="flex items-center gap-2">
                <Sparkles size={16} className="text-teal-600 animate-pulse" />
                Run Gemini AI Auditor
              </span>
              <ArrowUpRight size={14} className="text-teal-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Recharts Monthly Analysis Chart */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm md:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="text-sm font-sans font-black text-slate-800 uppercase tracking-widest">
              📈 Operations Cash Flow
            </h4>
            <div className="flex gap-4 text-[10px] font-semibold text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></span> Collections</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-rose-500 rounded-sm"></span> Outflow/Expenses</span>
            </div>
          </div>
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip 
                  formatter={(value: any) => [`₹${value.toLocaleString()}`, ""]} 
                  contentStyle={{ backgroundColor: "#1e293b", color: "#f8fafc", borderRadius: 12, border: "none" }}
                />
                <Bar dataKey="Inflow" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={14} />
                <Bar dataKey="Outflow" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Expense Pie Breakdown & Society Board announcements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pie chart */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4 md:col-span-1">
          <h4 className="text-sm font-sans font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">
            🎨 Expense Allocation
          </h4>
          {pieData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400 text-xs italic">
              No outgoings logged. Write a debit receipt to view breakdown.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-full h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => `₹${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-sans">
                {pieData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1.5 truncate">
                    <span 
                      className="w-2.5 h-2.5 rounded-sm shrink-0" 
                      style={{ backgroundColor: pieColors[index % pieColors.length] }}
                    ></span>
                    <span className="text-slate-600 truncate font-semibold">
                      {entry.name}: <span className="font-mono text-slate-800 font-bold">₹{entry.value.toLocaleString()}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Active Board Announcements */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4 md:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="text-sm font-sans font-black text-slate-800 uppercase tracking-widest">
              📢 Active Association Board
            </h4>
            <span className="bg-slate-100 text-slate-700 text-[10px] px-2.5 py-1 rounded-full font-bold">
              {announcements.length} Published
            </span>
          </div>
          <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
            {announcements.length === 0 ? (
              <p className="text-slate-400 text-xs italic text-center py-8">No society announcements posted.</p>
            ) : (
              announcements.map((ann) => (
                <div key={ann.id} className="p-3 bg-slate-50 border border-slate-200/50 rounded-xl space-y-1.5 hover:border-slate-300 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h5 className="font-sans font-bold text-xs text-slate-900">{ann.title}</h5>
                      {ann.isUrgent && (
                        <span className="bg-rose-100 text-rose-700 text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase flex items-center gap-0.5">
                          <Flame size={8} fill="currentColor" /> Urgent
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{ann.date}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-sans leading-relaxed">{ann.content}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-1 text-right">By {ann.postedBy}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
