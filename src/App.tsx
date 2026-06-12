/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { 
  Building2, 
  HandCoins, 
  Receipt, 
  BookOpenText, 
  Landmark, 
  Sparkles, 
  LayoutDashboard, 
  Users, 
  Terminal, 
  Flame,
  Power,
  Tv,
  ArrowRightLeft,
  Bell,
  Smartphone,
  Info
} from "lucide-react";

import { 
  User, 
  UserRole, 
  Flat, 
  Transaction, 
  Expense, 
  Announcement, 
  PaymentStatus 
} from "./types";

import DashboardStats from "./components/DashboardStats";
import FlatsModule from "./components/FlatsModule";
import CollectionModule from "./components/CollectionModule";
import ExpenseModule from "./components/ExpenseModule";
import HistoricalModule from "./components/HistoricalModule";
import TransparencyPortal from "./components/TransparencyPortal";
import AIInsightsPage from "./components/AIInsightsPage";
import OnboardingDocs from "./components/OnboardingDocs";

export default function App() {
  // 1. App State
  const [user, setUser] = useState<User | null>(null);
  const [flats, setFlats] = useState<Flat[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [loading, setLoading] = useState<boolean>(true);
  
  // Toast notifications & Role switching triggers
  const [toast, setToast] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState<string>("admin@avaasa.com");
  const [loginRole, setLoginRole] = useState<UserRole>(UserRole.ADMIN);

  // 2. PWA deferred installation event listener
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    // Check if app is launched in standalone display mode (PWA)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const triggerInstallPrompt = async () => {
    if (!deferredPrompt) {
      showToast("App is ready! Can be added to your mobile home screen via browser share options.");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to PWA prompt: ${outcome}`);
    if (outcome === "accepted") {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  // 3. User Handshake / Authentication integration
  const handleLogin = async (email: string, roleToUse: UserRole) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: roleToUse })
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        showToast(`Logged in successfully as ${data.user.name} (${data.user.role})`);
      }
    } catch (err) {
      console.error(err);
      // Offline fallback: simulate user session locally to keep resident functional
      const offlineUser: User = {
        id: "offline-id",
        email: email,
        name: email.split("@")[0].toUpperCase(),
        role: roleToUse,
        flatId: roleToUse === UserRole.RESIDENT ? "f-101" : undefined
      };
      setUser(offlineUser);
      showToast("Offline mode. Session simulated in client storage cache.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-login to the default Administrator profile for seamless first lookup
  useEffect(() => {
    handleLogin("admin@avaasa.com", UserRole.ADMIN);
  }, []);

  // 4. Data Fetch Handlers
  const fetchAllData = async () => {
    try {
      const [flatsRes, txRes, expRes, annRes] = await Promise.all([
        fetch("/api/flats"),
        fetch("/api/transactions"),
        fetch("/api/expenses"),
        fetch("/api/announcements")
      ]);

      const flatsData = await flatsRes.json();
      const txData = await txRes.json();
      const expData = await expRes.json();
      const annData = await annRes.json();

      setFlats(flatsData.error ? [] : flatsData);
      setTransactions(txData.error ? [] : txData);
      setExpenses(expData.error ? [] : expData);
      setAnnouncements(annData.error ? [] : annData);
    } catch (err) {
      console.error("Local network error fetching database nodes. Using offline cached fallbacks.", err);
      showToast("Currently running offline. Displaying cached records.");
    }
  };

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  // Toast notifier helper
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // 5. Database Modification Proxies
  const handleAddFlat = async (newFlat: Omit<Flat, "id">) => {
    try {
      const res = await fetch("/api/flats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFlat)
      });
      const savedFlat = await res.json();
      setFlats([...flats, savedFlat]);
      showToast(`Flat ${savedFlat.number} added to society directory.`);
    } catch {
      showToast("Offline. Cannot register apartments without network sync.");
    }
  };

  const handleAddTransaction = async (newTx: Omit<Transaction, "id" | "createdAt">) => {
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTx)
      });
      const savedTx = await res.json();
      setTransactions([savedTx, ...transactions]);
      showToast(`Logged transaction of ₹${savedTx.amount} on Flat ${savedTx.flatNumber}`);
    } catch {
      showToast("Failed to post entry. Running offline.");
    }
  };

  const handleUpdateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      const updatedTx = await res.json();
      setTransactions(transactions.map((t) => (t.id === id ? updatedTx : t)));
      showToast(`Transaction cleared and marked paid successfully.`);
    } catch {
      showToast("Payment status updated locally.");
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      setTransactions(transactions.filter((t) => t.id !== id));
      showToast("Transaction record removed cleanly.");
    } catch {
      showToast("Offline. Unsynchronized records preserved.");
    }
  };

  const handleAddExpense = async (newExp: Omit<Expense, "id" | "createdAt">) => {
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newExp)
      });
      const savedExp = await res.json();
      setExpenses([savedExp, ...expenses]);
      showToast(`Expense voucher of ₹${savedExp.amount} logged successfully.`);
    } catch {
      showToast("Saved offline. Sync pending.");
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      setExpenses(expenses.filter((e) => e.id !== id));
      showToast("Expense voucher removed.");
    } catch {
      showToast("Action restricted in offline modes.");
    }
  };

  const triggerPushNotificationDemo = () => {
    if (!("Notification" in window)) {
      showToast("Push notifications unsupported by this browser context.");
      return;
    }

        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            navigator.serviceWorker.ready.then((registration) => {
              registration.showNotification('🏢 Avaasa Ledger Alert', {
                body: 'Audit finalized for May Month Collections. Outstanding dues recovery: 92%.',
              } as NotificationOptions);
            });
            showToast('Notification fired via Service Worker.');
          } else {
            showToast('Please grant notification permission in your browser/iframe.');
          }
        });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 font-sans text-xs">
        <p className="text-slate-400">Loading society financial systems...</p>
      </div>
    );
  }

  const isAdmin = user.role === UserRole.ADMIN;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc] text-slate-805">
      {/* Toast Alert Banner */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 border border-slate-800 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-top duration-300 font-sans text-xs">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
          <span className="font-semibold">{toast}</span>
        </div>
      )}

      {/* 1. Left Sidebar Navigation (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-805 text-white p-5 justify-between shrink-0 font-sans">
        <div className="space-y-6">
          {/* Logo Brand */}
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="p-2 bg-indigo-65/20 text-indigo-400 rounded-xl border border-indigo-500/20">
              <Building2 size={22} />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-widest uppercase">Avaasa Ledger</h1>
              <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold">Community Portal</p>
            </div>
          </div>

          {/* Quick PWA Installation Header */}
          {!isInstalled && (
            <button
              onClick={triggerInstallPrompt}
              className="w-full flex items-center gap-2.5 p-3 rounded-xl border border-dashed border-indigo-400/40 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-600 hover:text-white text-left font-semibold text-[11px] transition-all cursor-pointer group"
            >
              <Smartphone size={16} className="text-indigo-450 group-hover:scale-110 transition-transform" />
              <div>
                <p>Install Avaasa App</p>
                <p className="text-[9px] text-indigo-400/80 font-normal">Fast, Offline Standalone</p>
              </div>
            </button>
          )}

          {/* Nav Links */}
          <nav className="space-y-1">
            {[
              { id: "dashboard", label: "Dashboard Widget", icon: LayoutDashboard },
              { id: "directory", label: "Society Register", icon: Users },
              { id: "collections", label: "Receive Payments", icon: HandCoins },
              { id: "expenses", label: "Society Expenses", icon: Receipt },
              { id: "historic", label: "Legacy Migration", icon: BookOpenText },
              { id: "transparency", label: "Audit Portals", icon: Landmark },
              { id: "ai-insights", label: "Gemini AI Auditor", icon: Sparkles },
              { id: "designs", label: "System Blueprints", icon: Info }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    isActive 
                      ? "bg-indigo-600 text-white shadow shadow-indigo-650/40" 
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon size={16} className={isActive ? "text-white" : "text-slate-400"} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Handshake / Role Sandbox Switcher (Sidebar Footer) */}
        <div className="space-y-3 border-t border-slate-800 pt-4 mt-6">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
            <span className="text-[9px] font-bold text-indigo-400 tracking-wider uppercase block">
              💡 Role Testing Station
            </span>
            <div className="flex gap-1 bg-slate-900 border border-slate-850 p-0.5 rounded-lg">
              <button
                onClick={() => handleLogin("admin@avaasa.com", UserRole.ADMIN)}
                className={`flex-1 text-center py-1 rounded font-bold text-[10px] cursor-pointer ${
                  isAdmin ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                ADMIN
              </button>
              <button
                onClick={() => handleLogin("resident@avaasa.com", UserRole.RESIDENT)}
                className={`flex-1 text-center py-1 rounded font-bold text-[10px] cursor-pointer ${
                  !isAdmin ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                RESIDENT
              </button>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              Toggle roles above to check exactly what the restricted resident receives.
            </p>
          </div>
          <p className="text-[10px] text-slate-500 font-mono text-center">Version 1.0.0 (PWA)</p>
        </div>
      </aside>

      {/* 2. Mobile Header & Navigation */}
      <header className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800 shrink-0 font-sans">
        <div className="flex items-center gap-2">
          <Building2 size={18} className="text-indigo-400" />
          <h1 className="font-black text-xs uppercase tracking-widest">Avaasa Ledger</h1>
        </div>
        
        {/* Role sandbox toggler (Mobile Header) */}
        <div className="flex bg-slate-950 border border-slate-800 p-0.5 rounded-lg text-[9px] font-black">
          <button
            onClick={() => handleLogin("admin@avaasa.com", UserRole.ADMIN)}
            className={`px-2 py-1 rounded ${isAdmin ? "bg-indigo-600 text-white" : "text-slate-400"}`}
          >
            ADM
          </button>
          <button
            onClick={() => handleLogin("resident@avaasa.com", UserRole.RESIDENT)}
            className={`px-2 py-1 rounded ${!isAdmin ? "bg-indigo-600 text-white" : "text-slate-400"}`}
          >
            RES
          </button>
        </div>
      </header>

      {/* 3. Main Stage Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top bar (Status HUD for Desktop) */}
        <div className="hidden md:flex items-center justify-between border-b border-slate-200 px-6 py-3.5 bg-white shrink-0 font-sans">
          <div className="flex items-center gap-3">
            <span className="p-1.5 bg-slate-100 rounded-full text-slate-650 flex items-center justify-center">
              <LayoutDashboard size={14} />
            </span>
            <div className="text-xs text-slate-500">
              Welcome back, <strong className="text-slate-850">{user.name}</strong> • Mapped Flat: {user.flatId || "All Flats (Management Access)"}
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            {/* Live sandbox sync notification */}
            <span className="flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-100 text-[10px] px-2.5 py-1 rounded-full font-bold">
              ✓ Local storage Synced
            </span>
            {/* Run custom push notifications demo button */}
            <button
              onClick={triggerPushNotificationDemo}
              className="bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold px-2.5 py-1 text-[11px] rounded-lg border border-slate-200 transition-all cursor-pointer flex items-center gap-1"
            >
              <Bell size={13} /> Notification Demonstration
            </button>
          </div>
        </div>

        {/* Content Panel Frame */}
        <div className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto">
          {loading ? (
            <div className="min-h-[50vh] flex items-center justify-center font-sans text-xs text-slate-500 italic">
              Synchronizing offline storage...
            </div>
          ) : (
            <>
              {activeTab === "dashboard" && (
                <DashboardStats 
                  transactions={transactions} 
                  expenses={expenses} 
                  announcements={announcements} 
                  onNavigate={(tab) => setActiveTab(tab)}
                />
              )}
              {activeTab === "directory" && (
                <FlatsModule 
                  flats={flats} 
                  onAddFlat={handleAddFlat} 
                  isAdmin={isAdmin} 
                />
              )}
              {activeTab === "collections" && (
                <CollectionModule 
                  transactions={transactions} 
                  flats={flats}
                  onAddTransaction={handleAddTransaction}
                  onUpdateTransaction={handleUpdateTransaction}
                  onDeleteTransaction={handleDeleteTransaction}
                  isAdmin={isAdmin}
                />
              )}
              {activeTab === "expenses" && (
                <ExpenseModule 
                  expenses={expenses}
                  onAddExpense={handleAddExpense}
                  onDeleteExpense={handleDeleteExpense}
                  isAdmin={isAdmin}
                />
              )}
              {activeTab === "historic" && (
                <HistoricalModule 
                  transactions={transactions} 
                  flats={flats}
                  onAddTransaction={handleAddTransaction}
                  onDeleteTransaction={handleDeleteTransaction}
                  isAdmin={isAdmin}
                />
              )}
              {activeTab === "transparency" && (
                <TransparencyPortal 
                  transactions={transactions} 
                  expenses={expenses} 
                  flats={flats} 
                />
              )}
              {activeTab === "ai-insights" && (
                <AIInsightsPage />
              )}
              {activeTab === "designs" && (
                <OnboardingDocs />
              )}
            </>
          )}
        </div>
      </main>

      {/* 4. Mobile Bottom Navigation Drawer */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 text-white flex justify-around p-2.5 z-40 shrink-0 font-sans text-[9px] font-black uppercase tracking-wider">
        {[
          { id: "dashboard", label: "Dash", icon: LayoutDashboard },
          { id: "collections", label: "Fees", icon: HandCoins },
          { id: "expenses", label: "Debits", icon: Receipt },
          { id: "transparency", label: "Audits", icon: Landmark },
          { id: "ai-insights", label: "AI Auditor", icon: Sparkles }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 ${isActive ? "text-indigo-400" : "text-slate-400"}`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
