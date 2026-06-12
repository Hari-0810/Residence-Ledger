/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  ADMIN = "ADMIN",
  RESIDENT = "RESIDENT",
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  flatId?: string; // Optional links for RESIDENT role
}

export enum OccupancyStatus {
  OCCUPIED_OWNER = "Owner Occupied",
  OCCUPIED_TENANT = "Tenant Occupied",
  VACANT = "Vacant",
}

export interface Flat {
  id: string;
  block: string;
  number: string; // e.g. "A-101"
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  tenantName?: string;
  tenantPhone?: string;
  occupancyStatus: OccupancyStatus;
  monthlyMaintenanceCharge: number;
  monthlyRentCharge?: number;
}

export enum CollectionType {
  MAINTENANCE = "Maintenance Collection",
  RENT = "Rent Tracking",
  OTHER = "Other Contribution",
}

export enum PaymentStatus {
  PAID = "Paid",
  PENDING = "Pending",
  OVERDUE = "Overdue",
}

export enum PaymentMethod {
  CASH = "Cash",
  BANK_TRANSFER = "Bank Transfer",
  UPI = "UPI",
  CHEQUE = "Cheque",
}

export interface Transaction {
  id: string;
  flatId: string;
  flatNumber: string;
  residentName: string;
  type: CollectionType;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  paidDate?: string; // YYYY-MM-DD
  status: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentReference?: string; // Txn ID, Receipt No.
  billDocumentUrl?: string; // Supporting Receipt upload (base64 or local URL)
  isMigrated: boolean; // Flag to identify digitized historical entries
  migratedNotes?: string; // Details of legacy notebooks
  createdAt: string;
}

export enum ExpenseCategory {
  ELECTRICITY = "Electricity",
  WATER = "Water",
  SECURITY = "Security",
  HOUSEKEEPING = "Housekeeping",
  LIFT_MAINTENANCE = "Lift Maintenance",
  GENERATOR_MAINTENANCE = "Generator Maintenance",
  PLUMBING = "Plumbing",
  REPAIRS = "Repairs",
  GARDENING = "Gardening",
  ADMINISTRATIVE = "Administrative Expenses",
  MISCELLANEOUS = "Miscellaneous",
}

export interface Expense {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  category: ExpenseCategory;
  amount: number;
  vendorName: string;
  vendorContact?: string;
  approvedBy: string; // Administrator name
  approvalDate?: string;
  supportingDocument?: string; // image base64, PDF, or file URL
  documentName?: string; // filename e.g. "invoice.pdf"
  isMigrated: boolean; // Flag to identify legacy spreadsheet or notebook digitization
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string; // YYYY-MM-DD
  postedBy: string;
  isUrgent: boolean;
}

export interface FinancialSummary {
  totalCollections: number;
  totalExpenses: number;
  netCashFlow: number;
  outstandingDues: number;
  historicalCollectionSum: number;
  historicalExpenseSum: number;
}
