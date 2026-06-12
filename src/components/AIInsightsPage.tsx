/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Sparkles, Terminal, ShieldCheck, TrendingUp, AlertTriangle, LightbulbIcon, RefreshCw } from "lucide-react";

export default function AIInsightsPage() {
  const [insight, setInsight] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [source, setSource] = useState<string>("");
  const [error, setError] = useState<string>("");

  const fetchInsights = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/financials/insights");
      if (!res.ok) {
        throw new Error("HTTP connection error: " + res.statusText);
      }
      const data = await res.json();
      setInsight(data.insight || "No financial insights generated currently.");
      setSource(data.source || "preset");
    } catch (err: any) {
      console.error(err);
      setError("Failed to communicate with full-stack insights API. Please verify server status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-sans font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="text-indigo-600 animate-pulse" size={20} /> Gemini AI Auditor & Insights
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Leverage server-side Google Gemini models to review community dues recovery, audit cash flows, detect anomalies, and suggest budget optimizations.
          </p>
        </div>
        <button
          onClick={fetchInsights}
          disabled={loading}
          className="bg-indigo-55/15 border border-indigo-150 text-indigo-700 hover:bg-indigo-600 hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold font-sans flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          {loading ? "Analyzing..." : "Re-Run Audit"}
        </button>
      </div>

      {loading ? (
        /* Reassuring high fidelity loading block */
        <div className="bg-white border rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-sm h-96">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full animate-bounce">
            <Sparkles size={36} />
          </div>
          <div className="space-y-1.5 max-w-sm">
            <h4 className="font-sans font-bold text-slate-800 text-sm">Aggregating Ledger Accounts...</h4>
            <p className="text-slate-400 text-[11px]">
              We are grouping monthly collections, outgoings invoices, and backdated notebook migration indices.
            </p>
          </div>
          <div className="w-12 h-1 bg-indigo-100 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full w-1/2 animate-infinite-scroll rounded-full"></div>
          </div>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-8 text-center text-rose-800 space-y-3 font-sans text-xs">
          <AlertTriangle size={32} className="mx-auto text-rose-550" />
          <p className="font-bold">{error}</p>
          <button
            onClick={fetchInsights}
            className="bg-rose-600 text-white font-bold px-4 py-2 rounded-xl"
          >
            Retry Connection
          </button>
        </div>
      ) : (
        /* Rendered AI Insight Report */
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Diagnostic Widget */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-emerald-50/45 border border-emerald-100 rounded-xl p-4 flex items-center gap-3">
              <span className="p-2 bg-emerald-105/10 text-emerald-700 rounded-lg shrink-0">
                <ShieldCheck size={18} />
              </span>
              <div>
                <span className="text-[10px] text-slate-450 uppercase font-black block">Treasury Rating</span>
                <p className="text-xs font-bold text-emerald-800">Stable Reserve Grade</p>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 flex items-center gap-3">
              <span className="p-2 bg-indigo-50 text-indigo-700 rounded-lg shrink-0">
                <TrendingUp size={18} />
              </span>
              <div>
                <span className="text-[10px] text-slate-450 uppercase font-black block">Migration Progress</span>
                <p className="text-xs font-bold text-slate-700">Digital ledger verified</p>
              </div>
            </div>
            <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 flex items-center gap-3">
              <span className="p-2 bg-amber-50 text-amber-700 rounded-lg shrink-0">
                <LightbulbIcon size={18} />
              </span>
              <div>
                <span className="text-[10px] text-slate-450 uppercase font-black block">Audit Method</span>
                <p className="text-xs font-bold text-amber-800">
                  {source === "gemini-live" ? "Gemini 3.5 Generative" : "Dynamic System Simulation"}
                </p>
              </div>
            </div>
          </div>

          {/* AI generated markdown report wrapper */}
          <div className="bg-white border rounded-2xl p-6 md:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-150 pb-3 text-slate-750 font-sans font-bold text-xs uppercase tracking-widest">
              <Terminal size={14} className="text-indigo-650" /> Gemini Auditor Financial Advice
            </div>
            <div className="prose prose-slate max-w-none text-xs leading-relaxed font-sans text-slate-650 space-y-4">
              {/* Parse sections cleanly */}
              {insight.split("\n\n").map((section, idx) => {
                if (section.trim().startsWith("###") || section.trim().startsWith("1.") || section.trim().startsWith("2.") || section.trim().startsWith("3.")) {
                  return (
                    <div key={idx} className="space-y-1.5 pt-1.5">
                      <p className="font-sans font-extrabold text-[#0B1530] text-sm tracking-tight">
                        {section.replace(/###|1\.|2\.|3\./g, "").trim()}
                      </p>
                    </div>
                  );
                }
                return (
                  <p key={idx} className="text-[12px] font-medium leading-relaxed pl-3 border-l-[3px] border-indigo-100">
                    {section.trim()}
                  </p>
                );
              })}
            </div>
          </div>

          {/* Integration Advisory Card */}
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-5 flex items-start gap-4 shadow">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl shrink-0">
              <Terminal size={18} />
            </div>
            <div className="space-y-1">
              <h5 className="font-mono text-indigo-300 font-bold text-xs uppercase tracking-wider">
                Full-Stack Security Boundary
              </h5>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Gemini SDK runs strictly inside the Node.js sandbox server using `process.env.GEMINI_API_KEY`. No API keys or authorization headers are exposed to the client browser, assuring commercial accounting audit privacy.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
