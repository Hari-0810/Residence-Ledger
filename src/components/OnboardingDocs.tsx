/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Info, Database, Send, Terminal, Settings2, ShieldCheck, Share2 } from "lucide-react";

export default function OnboardingDocs() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white rounded-2xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 text-indigo-400 font-mono tracking-widest text-xs uppercase">
            <Terminal size={14} /> Blueprints & System Design
          </div>
          <h1 className="text-2xl md:text-3xl font-sans font-bold tracking-tight text-white">
            Architecture Specifications
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-xl font-sans">
            Comprehensive system documentation, database schemas, PWA installation flows, and offline sync strategies for Avaasa Ledger.
          </p>
        </div>
        <div className="bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs px-4 py-3 rounded-xl font-mono space-y-1">
          <p>● PWA Core State: Ready</p>
          <p>● Service Worker: Active</p>
          <p>● Database Schema: PostgreSQL standard</p>
        </div>
      </div>

      {/* Grid of specifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Schema */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-slate-800 font-sans font-bold text-lg border-b border-slate-100 pb-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Database size={18} />
            </div>
            1. Relational Database Schema
          </div>
          <div className="font-mono text-xs text-slate-600 bg-slate-900 text-slate-300 p-4 rounded-xl overflow-x-auto max-h-72 space-y-2">
            <span className="text-yellow-400"># Entities structured for PostgreSQL:</span>
            <p className="text-green-400">TABLE users (</p>
            <p className="pl-4">id VARCHAR(50) PRIMARY KEY,</p>
            <p className="pl-4">email VARCHAR(100) UNIQUE NOT NULL,</p>
            <p className="pl-4">name VARCHAR(100) NOT NULL,</p>
            <p className="pl-4">role VARCHAR(20) DEFAULT 'RESIDENT'</p>
            <p className="text-green-400">);</p>
            
            <p className="text-green-400">TABLE flats (</p>
            <p className="pl-4">id VARCHAR(50) PRIMARY KEY,</p>
            <p className="pl-4">block VARCHAR(50) NOT NULL,</p>
            <p className="pl-4">number VARCHAR(20) UNIQUE NOT NULL,</p>
            <p className="pl-4">owner_details JSONB,</p>
            <p className="pl-4">occupancy VARCHAR(30),</p>
            <p className="pl-4">maintenance_charge NUMERIC(10,2)</p>
            <p className="text-green-400">);</p>

            <p className="text-green-400">TABLE transactions (</p>
            <p className="pl-4">id VARCHAR(50) PRIMARY KEY,</p>
            <p className="pl-4">flat_id VARCHAR(50) REFERENCES flats(id),</p>
            <p className="pl-4">amount NUMERIC(10,2) NOT NULL,</p>
            <p className="pl-4">type VARCHAR(40) NOT NULL,</p>
            <p className="pl-4">due_date DATE,</p>
            <p className="pl-4">paid_date DATE DEFAULT NULL,</p>
            <p className="pl-4">status VARCHAR(20),</p>
            <p className="pl-4">payment_ref VARCHAR(100),</p>
            <p className="pl-4">is_migrated BOOLEAN DEFAULT FALSE</p>
            <p className="text-green-400">);</p>
          </div>
          <p className="text-slate-500 text-xs font-sans">
            * Note: Seamlessly supports migrating retro paper transactions via backdated timestamp injection.
          </p>
        </div>

        {/* API Design */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-slate-800 font-sans font-bold text-lg border-b border-slate-100 pb-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Send size={18} />
            </div>
            2. REST API Specifications
          </div>
          <div className="space-y-3 font-sans text-sm text-slate-600">
            <div className="flex gap-2 items-start">
              <span className="bg-blue-100 text-blue-700 font-mono text-[10px] px-2 py-0.5 rounded uppercase font-bold">POST</span>
              <div>
                <p className="font-mono text-slate-800 font-semibold text-xs">/api/auth/login</p>
                <p className="text-slate-500 text-xs">JWT-based user/role handshake</p>
              </div>
            </div>
            <div className="flex gap-2 items-start">
              <span className="bg-green-100 text-green-700 font-mono text-[10px] px-2 py-0.5 rounded uppercase font-bold">GET</span>
              <div>
                <p className="font-mono text-slate-800 font-semibold text-xs">/api/transactions</p>
                <p className="text-slate-500 text-xs">Returns payments registry with migration stamps</p>
              </div>
            </div>
            <div className="flex gap-2 items-start">
              <span className="bg-blue-100 text-blue-700 font-mono text-[10px] px-2 py-0.5 rounded uppercase font-bold">POST</span>
              <div>
                <p className="font-mono text-slate-800 font-semibold text-xs">/api/expenses</p>
                <p className="text-slate-500 text-xs">Creates expense and binds documents/receipt base64</p>
              </div>
            </div>
            <div className="flex gap-2 items-start">
              <span className="bg-green-100 text-green-700 font-mono text-[10px] px-2 py-0.5 rounded uppercase font-bold">GET</span>
              <div>
                <p className="font-mono text-slate-800 font-semibold text-xs">/api/financials/insights</p>
                <p className="text-slate-500 text-xs">Server-side Gemini AI auditor review</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-500">
            <strong>Security Boundary:</strong> All third-party secrets like Gemini Keys remain hidden server-side.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Service Worker strategy */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-slate-800 font-sans font-bold text-lg border-b border-slate-100 pb-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Settings2 size={18} />
            </div>
            3. PWA Offline & Service Worker
          </div>
          <div className="space-y-3 font-sans text-sm text-slate-600">
            <div>
              <p className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-400">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span> Asset Caching
              </p>
              <p className="text-slate-500 text-xs mt-0.5 pl-3">
                Pre-caches core CSS, index.html, static vectors during registration. Automatically upgrades app components using a stale-while-revalidate model.
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-400">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Dynamic Data Synchronization
              </p>
              <p className="text-slate-500 text-xs mt-0.5 pl-3">
                Fulfills API requests directly. On cellular/WiFi dropouts, triggers client-side local cache mirroring to display previously retrieved transaction indices.
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-400">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span> Install Triggers
              </p>
              <p className="text-slate-500 text-xs mt-0.5 pl-3">
                Configures responsive banner prompt hooks natively for Android Chrome, standard Apple Safari bookmark tutorials, and Desktop layout launch buttons.
              </p>
            </div>
          </div>
        </div>

        {/* Development Roadmap */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-slate-800 font-sans font-bold text-lg border-b border-slate-100 pb-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <ShieldCheck size={18} />
            </div>
            4. Future Commercial Roadmap
          </div>
          <div className="space-y-3 font-sans text-sm text-slate-600">
            <div className="flex gap-3 items-center">
              <span className="w-6 h-6 bg-emerald-100 text-emerald-800 text-[10px] rounded-full flex items-center justify-center font-bold font-mono">Q3</span>
              <div>
                <p className="text-xs font-semibold text-slate-800">Automated UPI Scanning & Payees</p>
                <p className="text-slate-500 text-[11px]">Generate unique static UPI Gpay/PhonPe QR codes per flat representing exact maintenance amounts.</p>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <span className="w-6 h-6 bg-slate-100 text-slate-600 text-[10px] rounded-full flex items-center justify-center font-bold font-mono">Q4</span>
              <div>
                <p className="text-xs font-semibold text-slate-700">Multi-Apartment Gated Access Control</p>
                <p className="text-slate-500 text-[11px]">Expand the REST architecture with multi-tenant subdomains to host multiple distinct societies under Avaasa.</p>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <span className="w-6 h-6 bg-slate-100 text-slate-600 text-[10px] rounded-full flex items-center justify-center font-bold font-mono">H2</span>
              <div>
                <p className="text-xs font-semibold text-slate-700">OCR Receipt Scanning and Autofills</p>
                <p className="text-slate-500 text-[11px]">Process utility receipts (electricity/water) automatically using Google Vision/Gemini OCR.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wireframe Mockup Preview */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3 text-slate-800 font-sans font-bold text-lg border-b border-slate-100 pb-3 mb-4">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <Share2 size={18} />
          </div>
          5. High-Fidelity UI Layout & Color Palette
        </div>
        <div className="font-sans text-sm text-slate-600 space-y-4">
          <p>
            The interface employs a premium **Commercial SaaS Minimalist Aesthetic** comprising deep navy sidebars matched to emerald greens for money movements. Check out the responsive touchpoints mapping:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div className="border border-slate-200 bg-slate-50 p-3 rounded-xl font-medium">
              <div className="w-full h-8 bg-slate-900 rounded-lg mb-2 flex items-center justify-center text-indigo-300 font-mono text-[10px]">#0F172A</div>
              Deep Navy Slate
              <p className="text-[10px] text-slate-400">Sidebar & Focus</p>
            </div>
            <div className="border border-slate-200 bg-slate-50 p-3 rounded-xl font-medium">
              <div className="w-full h-8 bg-blue-600 rounded-lg mb-2 flex items-center justify-center text-white font-mono text-[10px]">#2563EB</div>
              Royal Accent
              <p className="text-[10px] text-slate-400">Interactions</p>
            </div>
            <div className="border border-slate-200 bg-slate-50 p-3 rounded-xl font-medium">
              <div className="w-full h-8 bg-emerald-600 rounded-lg mb-2 flex items-center justify-center text-white font-mono text-[10px]">#059669</div>
              Emerald Green
              <p className="text-[10px] text-slate-400">Success / Inflow</p>
            </div>
            <div className="border border-slate-200 bg-slate-50 p-3 rounded-xl font-medium">
              <div className="w-full h-8 bg-rose-600 rounded-lg mb-2 flex items-center justify-center text-white font-mono text-[10px]">#E11D48</div>
              Crimson Rose
              <p className="text-[10px] text-slate-400">Outflow / Alert</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
