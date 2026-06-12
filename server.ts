/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { 
  UserRole, 
  OccupancyStatus, 
  CollectionType, 
  PaymentStatus, 
  PaymentMethod, 
  ExpenseCategory 
} from "./src/types";

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "database.json");

// Middleware to parse json payloads
app.use(express.json({ limit: "50mb" }));

// Initialize local JSON database with comprehensive structural seed data
const initialData = {
  users: [
    { id: "u-admin", email: "admin@avaasa.com", name: "Ramanathan Iyer", role: UserRole.ADMIN },
    { id: "u-res1", email: "resident@avaasa.com", name: "Anish Kapadia", role: UserRole.RESIDENT, flatId: "f-101" },
    { id: "u-res2", email: "priya@avaasa.com", name: "Priya Sharma", role: UserRole.RESIDENT, flatId: "f-102" },
    { id: "u-res3", email: "krishnan@avaasa.com", name: "Krishnan Nair", role: UserRole.RESIDENT, flatId: "f-103" }
  ],
  flats: [
    {
      id: "f-101",
      block: "Tower A",
      number: "A-101",
      ownerName: "Anish Kapadia",
      ownerPhone: "+91 98450 12345",
      ownerEmail: "resident@avaasa.com",
      occupancyStatus: OccupancyStatus.OCCUPIED_OWNER,
      monthlyMaintenanceCharge: 3500,
      monthlyRentCharge: 0
    },
    {
      id: "f-102",
      block: "Tower A",
      number: "A-102",
      ownerName: "Priya Sharma",
      ownerPhone: "+91 99800 67890",
      ownerEmail: "priya@avaasa.com",
      occupancyStatus: OccupancyStatus.OCCUPIED_OWNER,
      monthlyMaintenanceCharge: 3500,
      monthlyRentCharge: 0
    },
    {
      id: "f-103",
      block: "Tower A",
      number: "A-103",
      ownerName: "Dr. Rajesh Kurup",
      ownerPhone: "+91 94470 54321",
      ownerEmail: "rajesh@avaasa.com",
      tenantName: "Arun Kumar",
      tenantPhone: "+91 88910 22334",
      occupancyStatus: OccupancyStatus.OCCUPIED_TENANT,
      monthlyMaintenanceCharge: 3500,
      monthlyRentCharge: 18000
    },
    {
      id: "f-201",
      block: "Tower B",
      number: "B-201",
      ownerName: "Siddharth Malhotra",
      ownerPhone: "+91 98110 99887",
      ownerEmail: "siddharth@avaasa.com",
      occupancyStatus: OccupancyStatus.VACANT,
      monthlyMaintenanceCharge: 3000,
      monthlyRentCharge: 0
    }
  ],
  transactions: [
    {
      id: "t-1",
      flatId: "f-101",
      flatNumber: "A-101",
      residentName: "Anish Kapadia",
      type: CollectionType.MAINTENANCE,
      amount: 3500,
      dueDate: "2026-05-01",
      paidDate: "2026-05-03",
      status: PaymentStatus.PAID,
      paymentMethod: PaymentMethod.UPI,
      paymentReference: "UPI-HEXA981240-AP",
      isMigrated: false,
      createdAt: "2026-05-01T10:00:00Z"
    },
    {
      id: "t-2",
      flatId: "f-102",
      flatNumber: "A-102",
      residentName: "Priya Sharma",
      type: CollectionType.MAINTENANCE,
      amount: 3500,
      dueDate: "2026-05-01",
      paidDate: "2026-05-04",
      status: PaymentStatus.PAID,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      paymentReference: "NEFT-HDFC-99120",
      isMigrated: false,
      createdAt: "2026-05-01T10:05:00Z"
    },
    // Migrated historical old records from manual notebooks (Legacy data digitized)
    {
      id: "t-hist-1",
      flatId: "f-101",
      flatNumber: "A-101",
      residentName: "Anish Kapadia",
      type: CollectionType.MAINTENANCE,
      amount: 3200,
      dueDate: "2025-11-01",
      paidDate: "2025-11-02",
      status: PaymentStatus.PAID,
      paymentMethod: PaymentMethod.CASH,
      paymentReference: "NBOOK-P55",
      isMigrated: true,
      migratedNotes: "Migrated from Legacy Register Notebook - Page 55. Checked and signed by Ramanathan Iyer.",
      createdAt: "2026-05-10T12:00:00Z"
    },
    {
      id: "t-hist-2",
      flatId: "f-102",
      flatNumber: "A-102",
      residentName: "Priya Sharma",
      type: CollectionType.MAINTENANCE,
      amount: 3200,
      dueDate: "2025-11-01",
      paidDate: "2025-11-05",
      status: PaymentStatus.PAID,
      paymentMethod: PaymentMethod.CASH,
      paymentReference: "NBOOK-P56",
      isMigrated: true,
      migratedNotes: "Migrated from Legacy Register Notebook - Page 56.",
      createdAt: "2026-05-10T12:15:00Z"
    },
    {
      id: "t-3",
      flatId: "f-103",
      flatNumber: "A-103",
      residentName: "Arun Kumar",
      type: CollectionType.MAINTENANCE,
      amount: 3500,
      dueDate: "2026-06-01",
      paidDate: "2026-06-02",
      status: PaymentStatus.PAID,
      paymentMethod: PaymentMethod.UPI,
      paymentReference: "UPI-KPGPAY-82103",
      isMigrated: false,
      createdAt: "2026-06-01T09:00:00Z"
    },
    {
      id: "t-4",
      flatId: "f-101",
      flatNumber: "A-101",
      residentName: "Anish Kapadia",
      type: CollectionType.MAINTENANCE,
      amount: 3500,
      dueDate: "2026-06-01",
      status: PaymentStatus.OVERDUE,
      isMigrated: false,
      createdAt: "2026-06-01T00:00:00Z"
    },
    {
      id: "t-5",
      flatId: "f-102",
      flatNumber: "A-102",
      residentName: "Priya Sharma",
      type: CollectionType.MAINTENANCE,
      amount: 3500,
      dueDate: "2026-06-01",
      status: PaymentStatus.PENDING,
      isMigrated: false,
      createdAt: "2026-06-01T00:00:00Z"
    },
    {
      id: "t-6",
      flatId: "f-201",
      flatNumber: "B-201",
      residentName: "Siddharth Malhotra",
      type: CollectionType.MAINTENANCE,
      amount: 3000,
      dueDate: "2026-06-01",
      status: PaymentStatus.PENDING,
      isMigrated: false,
      createdAt: "2026-06-01T00:00:00Z"
    }
  ],
  expenses: [
    {
      id: "exp-1",
      title: "May Month Guard Salaries",
      description: "Salaries for 2 Security Guards working morning and night shifts.",
      date: "2026-05-28",
      category: ExpenseCategory.SECURITY,
      amount: 22000,
      vendorName: "Delta Security Agency",
      vendorContact: "98765 00011",
      approvedBy: "Ramanathan Iyer",
      approvalDate: "2026-05-28",
      isMigrated: false,
      supportingDocument: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='40'><rect width='100' height='40' fill='%23ccc'/><text x='10' y='25' font-size='12'>APPROVED SECURITY BILL</text></svg>",
      documentName: "security_bill_may.png",
      createdAt: "2026-05-28T15:00:00Z"
    },
    {
      id: "exp-2",
      title: "Waste Water Tank Cleaning",
      description: "Hydraulic jet tank washing and disinfecting service.",
      date: "2026-05-15",
      category: ExpenseCategory.WATER,
      amount: 4500,
      vendorName: "Metro Water Tank Cleaners",
      vendorContact: "94440 99221",
      approvedBy: "Ramanathan Iyer",
      approvalDate: "2026-05-15",
      isMigrated: false,
      supportingDocument: "",
      createdAt: "2026-05-15T10:00:00Z"
    },
    {
      id: "exp-hist-1",
      title: "Lift Cable Lubrication & Repair",
      description: "Digitized from notebook Page 49. Cable safety oiling and balancing.",
      date: "2025-10-10",
      category: ExpenseCategory.LIFT_MAINTENANCE,
      amount: 8500,
      vendorName: "Otis India Liftech",
      approvedBy: "Ramanathan Iyer",
      isMigrated: true,
      createdAt: "2026-05-10T14:00:00Z"
    }
  ],
  announcements: [
    {
      id: "ann-1",
      title: "Water Supply Disruption This Saturday",
      content: "Dear Residents, due to major civic water pipeline repairs, water supply will be restricted on Saturday (June 13) between 9:00 AM and 5:00 PM. Please conserve water accordingly.",
      date: "2026-06-11",
      postedBy: "Ramanathan Iyer (Admin)",
      isUrgent: true
    },
    {
      id: "ann-2",
      title: "Regular Garbage Segregation Mandates",
      content: "Please ensure wet waste and dry waste are segregated into green and blue bins respectively before handing them to the housekeeping staff at 8:30 AM daily.",
      date: "2026-06-08",
      postedBy: "Ramanathan Iyer (Admin)",
      isUrgent: false
    }
  ]
};

// Ensure database file exists, or seed it
function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf8");
      return initialData;
    }
    const dataStr = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(dataStr);
  } catch (error) {
    console.error("Database reading error:", error);
    return initialData;
  }
}

function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Database writing error:", error);
  }
}

// Ensure the DB is initialized upon boot
readDB();

// API ROUTES: Authenticate, Read and Write financial documents

// 1. JWT / Simple Authentication Proxy
app.post("/api/auth/login", (req, res) => {
  const { email, role } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const db = readDB();
  let user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    // Auto-register user during preview for seamless onboarding
    const newId = "u-" + Date.now();
    const name = email.split("@")[0].toUpperCase();
    user = {
      id: newId,
      email: email,
      name: name,
      role: role || UserRole.RESIDENT,
      flatId: role === UserRole.RESIDENT ? "f-101" : undefined
    };
    db.users.push(user);
    writeDB(db);
  }

  // Set the specific role requested if inputted during development preview toggling
  if (role && user.role !== role) {
    user.role = role;
    if (role === UserRole.RESIDENT && !user.flatId) {
      user.flatId = "f-101"; // Assign to standard flat for demo
    }
    writeDB(db);
  }

  res.json({ user, token: `mock-jwt-token-for-${user.id}` });
});

// 2. Flats Management
app.get("/api/flats", (req, res) => {
  const db = readDB();
  res.json(db.flats);
});

app.post("/api/flats", (req, res) => {
  const db = readDB();
  const newFlat = {
    id: "f-" + Date.now(),
    ...req.body
  };
  db.flats.push(newFlat);
  writeDB(db);
  res.status(201).json(newFlat);
});

app.put("/api/flats/:id", (req, res) => {
  const db = readDB();
  const flatIndex = db.flats.findIndex((f: any) => f.id === req.params.id);
  if (flatIndex === -1) return res.status(404).json({ error: "Flat not found" });

  db.flats[flatIndex] = { ...db.flats[flatIndex], ...req.body };
  writeDB(db);
  res.json(db.flats[flatIndex]);
});

// 3. Transactions Retrieval & Updates
app.get("/api/transactions", (req, res) => {
  const db = readDB();
  res.json(db.transactions);
});

app.post("/api/transactions", (req, res) => {
  const db = readDB();
  const newTx = {
    id: "t-" + Date.now(),
    createdAt: new Date().toISOString(),
    isMigrated: req.body.isMigrated || false,
    ...req.body
  };
  db.transactions.push(newTx);
  writeDB(db);
  res.status(201).json(newTx);
});

app.put("/api/transactions/:id", (req, res) => {
  const db = readDB();
  const txIndex = db.transactions.findIndex((t: any) => t.id === req.params.id);
  if (txIndex === -1) return res.status(404).json({ error: "Transaction not found" });

  db.transactions[txIndex] = { ...db.transactions[txIndex], ...req.body };
  writeDB(db);
  res.json(db.transactions[txIndex]);
});

// Delete endpoint to clean up demo items
app.delete("/api/transactions/:id", (req, res) => {
  const db = readDB();
  db.transactions = db.transactions.filter((t: any) => t.id !== req.params.id);
  writeDB(db);
  res.json({ success: true });
});

// 4. Expenses Retrieval & Updates
app.get("/api/expenses", (req, res) => {
  const db = readDB();
  res.json(db.expenses);
});

app.post("/api/expenses", (req, res) => {
  const db = readDB();
  const newExp = {
    id: "exp-" + Date.now(),
    createdAt: new Date().toISOString(),
    isMigrated: req.body.isMigrated || false,
    ...req.body
  };
  db.expenses.push(newExp);
  writeDB(db);
  res.status(201).json(newExp);
});

app.delete("/api/expenses/:id", (req, res) => {
  const db = readDB();
  db.expenses = db.expenses.filter((e: any) => e.id !== req.params.id);
  writeDB(db);
  res.json({ success: true });
});

// 5. Announcements Retrieval & Updates
app.get("/api/announcements", (req, res) => {
  const db = readDB();
  res.json(db.announcements);
});

app.post("/api/announcements", (req, res) => {
  const db = readDB();
  const newAnn = {
    id: "ann-" + Date.now(),
    date: new Date().toISOString().split("T")[0],
    ...req.body
  };
  db.announcements.unshift(newAnn); // Put newest announcements on top
  writeDB(db);
  res.status(201).json(newAnn);
});

app.delete("/api/announcements/:id", (req, res) => {
  const db = readDB();
  db.announcements = db.announcements.filter((a: any) => a.id !== req.params.id);
  writeDB(db);
  res.json({ success: true });
});

// 6. Server-Side AI Financial Insights (Using @google/genai SDK strictly server-side)
app.get("/api/financials/insights", async (req, res) => {
  const db = readDB();

  // Aggregate current system data for the prompt
  const paidTx = db.transactions.filter((t: any) => t.status === PaymentStatus.PAID);
  const duesTx = db.transactions.filter((t: any) => t.status === PaymentStatus.OVERDUE || t.status === PaymentStatus.PENDING);
  const histTx = db.transactions.filter((t: any) => t.isMigrated === true);

  const totalCollected = paidTx.reduce((sum: number, t: any) => sum + t.amount, 0);
  const totalOutstanding = duesTx.reduce((sum: number, t: any) => sum + t.amount, 0);
  const totalExpenses = db.expenses.reduce((sum: number, e: any) => sum + e.amount, 0);
  const netSavings = totalCollected - totalExpenses;

  // Compile expense categories summary
  const expenseCatMap: Record<string, number> = {};
  db.expenses.forEach((e: any) => {
    expenseCatMap[e.category] = (expenseCatMap[e.category] || 0) + e.amount;
  });

  const expenseBreakdownStr = Object.entries(expenseCatMap)
    .map(([cat, amt]) => `- ${cat}: ₹${amt}`)
    .join("\n");

  const prompt = `You are the master financial auditor and smart apartment advisor for "AVAASA LEDGER", a premium community management SaaS.
Review these community financial figures:
- Total Collections Completed: ₹${totalCollected} (including historical notebooks)
- Total Outgoings / Expenses: ₹${totalExpenses}
- Net Cash Cushion: ₹${netSavings}
- Uncollected Dues outstanding from flats: ₹${totalOutstanding}
- Exp Breakdowns:
${expenseBreakdownStr || 'No expenses recorded yet.'}

Provide a short, extremely professional, and actionable financial audit in Markdown. 
Limit it to 3 specific sections:
1. **Financial Strength Diagnosis**: Assessment of cash reserve health.
2. **Expense Management Critique**: Note key spending sectors (e.g. Security, repairs) and cost-cutting opportunities.
3. **Optimized Recovery Strategy**: Actionable suggestion to collect dues from delinquent properties and safely migrate older registers.

Write with premium Commercial SaaS gravitas. Be highly concise (maximum 200 words total). Keep the report realistic, humble, and practical for residential managers. Do not invent details not present.`;

  // Check if GEMINI_API_KEY environment variable is present
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    // Generate a beautiful, structured advisory report with high-fidelity analytics if api key is mock/blank
    const offlineReport = `### 🏢 Avaasa Financial Advisor Report

1. **Financial Strength Diagnosis**
The current cash cushion stands at **₹${netSavings.toLocaleString('en-IN')}** (Total Collected: ₹${totalCollected.toLocaleString('en-IN')}). While reserves are positive, the high ratio of outstanding receivables (**₹${totalOutstanding.toLocaleString('en-IN')}**) creates a bottleneck for essential lift, housekeeping, and emergency generator upgrades.

2. **Expense Management Critique**
- **Security Salaries** constitute the largest portion of outgoings. 
- Disburse plumbing, electrics, and landscaping into a retainer model rather than casual one-off invoicing. 
- *Legacy ledger migration check*: Digitized legacy entries represent older notebook records cleanly, establishing strong internal audit controls.

3. **Optimized Recovery Strategy**
- Execute automatic WhatsApp notification triggers on the **5th of every month** for pending maintenance invoices.
- Charge a standardized **₹100 per day late fee** on payments delayed past 15 days of due alignment to incentivize digital UPI adoption.
- *Tip*: Set your real **GEMINI_API_KEY** under **Settings > Secrets** to enable direct, live generative audits personalized for your community.`;

    return res.json({ insight: offlineReport, source: "system-preset" });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const reportText = response.text || "No AI feedback generated.";
    res.json({ insight: reportText, source: "gemini-live" });
  } catch (error: any) {
    console.error("Gemini API server-side generation failed:", error);
    res.status(500).json({ error: "Failed to generate AI insights: " + error?.message });
  }
});

// START EXPRESS + VITE MULTI-ENVIRONMENT PLATFORM SERVICE
async function startServer() {
  // Integrate Vite dynamically during local sandboxed developer turns
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static frontend build assets if in Production environment
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🏢 AVAASA LEDGER active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
