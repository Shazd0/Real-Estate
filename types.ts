
export enum UserRole {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
  MANAGER = 'MANAGER'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  password?: string;
  email?: string;
  joinedDate?: string;
  status?: 'Active' | 'Inactive';
  baseSalary?: number;
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export enum ExpenseCategory {
  GENERAL = 'General Expense',
  SALARY = 'Salary',
  BORROWING = 'Borrowing',
  MAINTENANCE = 'Maintenance',
  UTILITIES = 'Utilities',
  VENDOR_PAYMENT = 'Vendor Payment'
}

export enum PaymentMethod {
  CASH = 'CASH',
  BANK = 'BANK'
}

export type TransactionStatus = 'APPROVED' | 'PENDING' | 'REJECTED';

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  amount: number;
  paymentMethod: PaymentMethod;
  bankName?: string;
  
  // Income specific
  buildingId?: string;
  buildingName?: string;
  unitNumber?: string;
  contractId?: string;
  expectedAmount?: number; // For tracking debt
  vatAmount?: number;
  totalWithVat?: number;
  
  // Expense specific
  expenseCategory?: string;
  employeeId?: string; // For Salary
  employeeName?: string;
  bonusAmount?: number;
  deductionAmount?: number;
  vendorId?: string;
  vendorName?: string;

  // Adjustments & Approval
  discountAmount?: number;
  extraAmount?: number;
  status?: TransactionStatus;

  details: string;
  createdAt: number;
  createdBy: string; // User ID
  createdByName: string;
  lastModifiedAt?: number;
}

export interface Customer {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  nationality: string;
  workAddress: string;
  idNo: string;
  idSource: string;
  idType: string;
  mobileNo: string;
  isBlacklisted: boolean;
  notes?: string;
}

export interface Contract {
  id: string;
  contractNo: string;
  contractDate: string;
  status: 'Active' | 'Expired' | 'Terminated';
  
  buildingId: string;
  buildingName: string;
  unitName: string;
  
  customerId: string;
  customerName: string;
  
  // Financials
  rentValue: number; // Yearly Total
  waterFee: number;
  insuranceFee: number;
  serviceFee: number;
  officePercent: number; // e.g. 2.5
  officeFeeAmount: number; // Calculated
  otherDeduction: number;
  otherAmount: number;
  
  totalValue: number;
  
  // Installments
  installmentCount: number;
  firstInstallment: number;
  otherInstallment: number;
  
  // Schedule
  periodMonths: number;
  fromDate: string;
  toDate: string;
  
  notes?: string;
  createdBy: string;
}

export interface BuildingUnit {
    name: string;
    defaultRent: number;
}

export interface Building {
    id: string;
    name: string;
    units: BuildingUnit[];
}

export interface Bank {
    name: string;
    iban: string;
}

export interface Vendor {
    id: string;
    name: string;
    serviceType: string;
    contactName?: string;
    mobileNo?: string;
    phone: string;
    email?: string;
    contractStartDate?: string;
    status?: 'Active' | 'Inactive';
    notes?: string;
}

export enum TaskStatus {
    TODO = 'TODO',
    IN_PROGRESS = 'IN_PROGRESS',
    DONE = 'DONE'
}

export interface Task {
    id: string;
    userId: string;
    title: string;
    description?: string;
    status: TaskStatus;
    createdAt: number;
    dueDate?: string;
}