import { Building, Contract, Customer, Transaction, User, UserRole, Vendor, Task, Bank, TransactionType, PaymentMethod, TransactionStatus } from "../types";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- STORAGE KEYS ---
const KEYS = {
    TRANSACTIONS: 'prop_mgr_transactions',
    CUSTOMERS: 'prop_mgr_customers',
    BUILDINGS: 'prop_mgr_buildings',
    USERS: 'prop_mgr_users',
    CONTRACTS: 'prop_mgr_contracts',
    VENDORS: 'prop_mgr_vendors',
    TASKS: 'prop_mgr_tasks',
    BANKS: 'prop_mgr_banks'
};

// --- RICH MOCK DATA INIT ---

// Helper function to generate unique IDs
const generateId = (prefix: string, index: number) => `${prefix}${String(index).padStart(2, '0')}`;
const today = new Date();
const formatDate = (date: Date) => date.toISOString().split('T')[0];

// --- 1. USERS: +5 Users (Total 7) ---
const EXTRA_USERS: User[] = [
    { id: 'emp02', name: 'Fatima Al-Harbi', role: UserRole.EMPLOYEE, password: '123', email: 'fatima@company.com', status: 'Active', joinedDate: '2023-08-01', baseSalary: 4800 },
    { id: 'emp03', name: 'Khaled bin Saud', role: UserRole.EMPLOYEE, password: '123', email: 'khaled@company.com', status: 'Active', joinedDate: '2024-01-20', baseSalary: 5200 },
    { id: 'emp04', name: 'Laila Muneer', role: UserRole.EMPLOYEE, password: '123', email: 'laila@company.com', status: 'On Leave', joinedDate: '2023-03-10', baseSalary: 4200 },
    { id: 'mgr01', name: 'Omar Al-Jabr', role: UserRole.MANAGER, password: '123', email: 'omar@company.com', status: 'Active', joinedDate: '2022-10-01', baseSalary: 8500 },
    { id: 'sec01', name: 'Noura Hassan', role: UserRole.EMPLOYEE, password: '123', email: 'noura@company.com', status: 'Active', joinedDate: '2024-05-01', baseSalary: 4000 },
];
const INITIAL_USERS: User[] = [
    { id: 'admin', name: 'System Administrator', role: UserRole.ADMIN, password: 'admin', email: 'admin@system.com', status: 'Active', joinedDate: '2023-01-01', baseSalary: 12000 },
    { id: 'emp01', name: 'Ahmed Al-Rashid', role: UserRole.EMPLOYEE, password: '123', email: 'ahmed@company.com', status: 'Active', joinedDate: '2023-05-15', baseSalary: 4500 },
    ...EXTRA_USERS
];

// --- 2. BUILDINGS: +4 Buildings (Total 7) ---
const EXTRA_BUILDINGS: Building[] = [
    { 
        id: 'b4', 
        name: 'Dammam Commercial Center', 
        units: [
            { name: 'Office-A', defaultRent: 80000 }, { name: 'Office-B', defaultRent: 85000 }, 
            { name: 'Store-1', defaultRent: 50000 }
        ] 
    },
    { 
        id: 'b5', 
        name: 'Makkah Residential Block', 
        units: [
            { name: '10A', defaultRent: 25000 }, { name: '10B', defaultRent: 26000 }, { name: '20A', defaultRent: 28000 }
        ] 
    },
    { 
        id: 'b6', 
        name: 'Riyadh Compound Villas', 
        units: [
            { name: 'Villa-1', defaultRent: 180000 }, { name: 'Villa-2', defaultRent: 195000 }
        ] 
    },
    {
        id: 'b7',
        name: 'Al Khobar Towers',
        units: [
            { name: 'Unit 301', defaultRent: 55000 }, { name: 'Unit 302', defaultRent: 52000 },
            { name: 'Unit 401', defaultRent: 55000 }, { name: 'Unit 402', defaultRent: 52000 },
            { name: 'Unit 501', defaultRent: 58000 }
        ]
    }
];
const INITIAL_BUILDINGS: Building[] = [
    { 
        id: 'b1', 
        name: 'Al Olaya Tower (Res)', 
        units: [
            { name: '101', defaultRent: 45000 }, { name: '102', defaultRent: 45000 }, { name: '103', defaultRent: 48000 },
            { name: '201', defaultRent: 45000 }, { name: '202', defaultRent: 45000 }
        ] 
    },
    { 
        id: 'b2', 
        name: 'Jeddah Corniche Plaza', 
        units: [
            { name: 'Shop-A', defaultRent: 120000 }, { name: 'Shop-B', defaultRent: 110000 }, { name: 'Office-1', defaultRent: 35000 }
        ] 
    },
    {
        id: 'b3',
        name: 'King Road Apartments',
        units: [ { name: 'A-1', defaultRent: 30000 }, { name: 'A-2', defaultRent: 32000 } ] 
    },
    ...EXTRA_BUILDINGS
];

// --- 3. CUSTOMERS: +10 Customers (Total 13) ---
const EXTRA_CUSTOMERS: Customer[] = [
    { id: 'c4', code: '1004', nameAr: 'مؤسسة الرياض للمقاولات', nameEn: 'Riyadh Contracting Est.', nationality: 'Saudi', workAddress: 'Dammam', idNo: '7009876543', idSource: 'MOI', idType: 'CR', mobileNo: '0533333333', isBlacklisted: false },
    { id: 'c5', code: '1005', nameAr: 'شركة البناء الجديد', nameEn: 'New Construction Co.', nationality: 'Saudi', workAddress: 'Riyadh', idNo: '7001122334', idSource: 'Riyadh', idType: 'CR', mobileNo: '0501111111', isBlacklisted: false },
    { id: 'c6', code: '1006', nameAr: 'فهد السالم', nameEn: 'Fahad Al-Salem', nationality: 'Saudi', workAddress: 'Makkah', idNo: '1023456789', idSource: 'MOI', idType: 'National ID', mobileNo: '0551234567', isBlacklisted: false },
    { id: 'c7', code: '1007', nameAr: 'علياء منصور', nameEn: 'Alia Mansour', nationality: 'Jordan', workAddress: 'Jeddah', idNo: '2112233445', idSource: 'MOI', idType: 'Iqama', mobileNo: '0569876543', isBlacklisted: false },
    { id: 'c8', code: '1008', nameAr: 'شركة الأفق للتجارة', nameEn: 'Horizon Trading Co.', nationality: 'Saudi', workAddress: 'Al Khobar', idNo: '7005544332', idSource: 'Dammam', idType: 'CR', mobileNo: '0508765432', isBlacklisted: false },
    { id: 'c9', code: '1009', nameAr: 'نورة خالد', nameEn: 'Noura Khalid', nationality: 'Saudi', workAddress: 'Riyadh', idNo: '1034567890', idSource: 'MOI', idType: 'National ID', mobileNo: '0554443332', isBlacklisted: true },
    { id: 'c10', code: '1010', nameAr: 'شركة التقنية الرائدة', nameEn: 'Leading Tech Co.', nationality: 'Saudi', workAddress: 'Riyadh', idNo: '7009988776', idSource: 'Riyadh', idType: 'CR', mobileNo: '0502221110', isBlacklisted: false },
    { id: 'c11', code: '1011', nameAr: 'خالد ناصر', nameEn: 'Khalid Nasser', nationality: 'Yemen', workAddress: 'Makkah', idNo: '2987654321', idSource: 'MOI', idType: 'Iqama', mobileNo: '0561122334', isBlacklisted: false },
    { id: 'c12', code: '1012', nameAr: 'مؤسسة الخدمات السريعة', nameEn: 'Quick Services Est.', nationality: 'Saudi', workAddress: 'Dammam', idNo: '7004455667', idSource: 'MOI', idType: 'CR', mobileNo: '0535566778', isBlacklisted: false },
    { id: 'c13', code: '1013', nameAr: 'منال قاسم', nameEn: 'Manal Qasim', nationality: 'Saudi', workAddress: 'Jeddah', idNo: '1045678901', idSource: 'MOI', idType: 'National ID', mobileNo: '0559988776', isBlacklisted: false },
];
const INITIAL_CUSTOMERS: Customer[] = [
    { id: 'c1', code: '1001', nameAr: 'شركة المنسوجات الحديثة', nameEn: 'Modern Textile Co.', nationality: 'Saudi', workAddress: 'Riyadh', idNo: '7001234567', idSource: 'Riyadh', idType: 'CR', mobileNo: '0501234567', isBlacklisted: false },
    { id: 'c2', code: '1002', nameAr: 'محمد عبدالله', nameEn: 'Mohammed Abdullah', nationality: 'Saudi', workAddress: 'Riyadh', idNo: '1012345678', idSource: 'MOI', idType: 'National ID', mobileNo: '0555555555', isBlacklisted: false },
    { id: 'c3', code: '1003', nameAr: 'سارة احمد', nameEn: 'Sara Ahmed', nationality: 'Egypt', workAddress: 'Jeddah', idNo: '2456789012', idSource: 'MOI', idType: 'Iqama', mobileNo: '0567890123', isBlacklisted: false },
    ...EXTRA_CUSTOMERS
];

// --- 4. VENDORS: +5 Vendors (Total 5) ---
const INITIAL_VENDORS: Vendor[] = [
    { id: 'v1', name: 'Al-Haqq Maintenance', contact: '0501111111', services: 'Plumbing, Electrical', status: 'Active' },
    { id: 'v2', name: 'Jeddah Cleaning Services', contact: '0552222222', services: 'General Cleaning', status: 'Active' },
    { id: 'v3', name: 'Riyadh Security Company', contact: '0533333333', services: 'Security Guarding', status: 'Active' },
    { id: 'v4', name: 'AC Fix Solutions', contact: '0564444444', services: 'HVAC Maintenance', status: 'Active' },
    { id: 'v5', name: 'Al Khobar Paint & Decor', contact: '0505555555', services: 'Painting', status: 'Inactive' },
];

// --- 5. BANKS: +1 Bank (Total 3) ---
const INITIAL_BANKS: Bank[] = [
    { name: 'Al Rajhi Bank', iban: 'SA29 8000 0000 0000 0000 0000' },
    { name: 'NCB (AlAhli)', iban: 'SA10 1000 0000 0000 0000 0000' },
    { name: 'Riyad Bank', iban: 'SA03 4000 0000 0000 0000 0000' }
];

// --- 6. CONTRACTS: +10 Contracts (Total 12) ---
// Helper to calculate fees
const calculateContractValues = (rentValue: number) => {
    const waterFee = Math.round(rentValue * 0.01);
    const insuranceFee = Math.round(rentValue * 0.02);
    const serviceFee = Math.round(rentValue * 0.015);
    const officePercent = 2.5;
    const officeFeeAmount = Math.round(rentValue * (officePercent / 100));
    const totalValue = rentValue + waterFee + insuranceFee + serviceFee;
    const totalWithOffice = totalValue + officeFeeAmount;

    // Installment logic (simple 2 installments)
    const installmentCount = 2;
    const firstInstallment = Math.ceil(totalWithOffice / installmentCount);
    const otherInstallment = totalWithOffice - firstInstallment; // remaining balance
    
    return {
        rentValue, waterFee, insuranceFee, serviceFee, officePercent, officeFeeAmount, 
        otherDeduction: 0, otherAmount: 0, totalValue: totalWithOffice, 
        installmentCount, firstInstallment, otherInstallment, periodMonths: 12
    };
};

const EXTRA_CONTRACTS: Contract[] = [
    // Active Contracts (2024)
    {
        id: 'cnt3', contractNo: '1003', contractDate: '2024-03-01', status: 'Active',
        buildingId: 'b3', buildingName: 'King Road Apartments', unitName: 'A-1',
        customerId: 'c3', customerName: 'Sara Ahmed',
        ...calculateContractValues(30000), fromDate: '2024-03-01', toDate: '2025-02-28', notes: 'Residential contract', createdBy: 'emp01'
    },
    {
        id: 'cnt4', contractNo: '1004', contractDate: '2024-04-15', status: 'Active',
        buildingId: 'b4', buildingName: 'Dammam Commercial Center', unitName: 'Office-A',
        customerId: 'c4', customerName: 'Riyadh Contracting Est.',
        ...calculateContractValues(80000), installmentCount: 4, firstInstallment: 28000, otherInstallment: 24000, 
        fromDate: '2024-04-15', toDate: '2025-04-14', notes: 'Commercial office, quarterly payments', createdBy: 'mgr01'
    },
    {
        id: 'cnt5', contractNo: '1005', contractDate: '2024-05-01', status: 'Active',
        buildingId: 'b1', buildingName: 'Al Olaya Tower (Res)', unitName: '201',
        customerId: 'c6', customerName: 'Fahad Al-Salem',
        ...calculateContractValues(45000), installmentCount: 1, firstInstallment: 48125, otherInstallment: 0,
        fromDate: '2024-05-01', toDate: '2025-04-30', notes: 'Full payment upfront', createdBy: 'emp02'
    },
    {
        id: 'cnt6', contractNo: '1006', contractDate: '2024-07-01', status: 'Active',
        buildingId: 'b7', buildingName: 'Al Khobar Towers', unitName: 'Unit 301',
        customerId: 'c8', customerName: 'Horizon Trading Co.',
        ...calculateContractValues(55000), fromDate: '2024-07-01', toDate: '2025-06-30', createdBy: 'admin'
    },
    // Expired/Past Contracts (2023)
    {
        id: 'cnt7', contractNo: '1007', contractDate: '2023-05-01', status: 'Expired',
        buildingId: 'b5', buildingName: 'Makkah Residential Block', unitName: '10A',
        customerId: 'c11', customerName: 'Khalid Nasser',
        ...calculateContractValues(25000), fromDate: '2023-05-01', toDate: '2024-04-30', notes: 'Expired last year', createdBy: 'emp01'
    },
    {
        id: 'cnt8', contractNo: '1008', contractDate: '2023-01-01', status: 'Expired',
        buildingId: 'b6', buildingName: 'Riyadh Compound Villas', unitName: 'Villa-1',
        customerId: 'c5', customerName: 'New Construction Co.',
        ...calculateContractValues(180000), fromDate: '2023-01-01', toDate: '2023-12-31', notes: 'High value expired contract', createdBy: 'mgr01'
    },
    // New/Future Contract
    {
        id: 'cnt9', contractNo: '1009', contractDate: formatDate(new Date(today.getFullYear() + 1, 0, 1)), status: 'Pending',
        buildingId: 'b1', buildingName: 'Al Olaya Tower (Res)', unitName: '102',
        customerId: 'c13', customerName: 'Manal Qasim',
        ...calculateContractValues(45000), fromDate: formatDate(new Date(today.getFullYear() + 1, 0, 1)), toDate: formatDate(new Date(today.getFullYear() + 1, 11, 31)), notes: 'Future contract starting next year', createdBy: 'admin'
    },
    // Other Contracts (Active)
    {
        id: 'cnt10', contractNo: '1010', contractDate: '2024-01-01', status: 'Active',
        buildingId: 'b2', buildingName: 'Jeddah Corniche Plaza', unitName: 'Shop-B',
        customerId: 'c10', customerName: 'Leading Tech Co.',
        ...calculateContractValues(110000), installmentCount: 4, firstInstallment: 36000, otherInstallment: 30000,
        fromDate: '2024-01-01', toDate: '2024-12-31', notes: 'Quarterly payment', createdBy: 'emp03'
    },
    {
        id: 'cnt11', contractNo: '1011', contractDate: '2024-06-01', status: 'Active',
        buildingId: 'b7', buildingName: 'Al Khobar Towers', unitName: 'Unit 401',
        customerId: 'c7', customerName: 'Alia Mansour',
        ...calculateContractValues(55000), fromDate: '2024-06-01', toDate: '2025-05-31', createdBy: 'emp01'
    },
    {
        id: 'cnt12', contractNo: '1012', contractDate: '2024-02-01', status: 'Active',
        buildingId: 'b3', buildingName: 'King Road Apartments', unitName: 'A-2',
        customerId: 'c12', customerName: 'Quick Services Est.',
        ...calculateContractValues(32000), installmentCount: 1, firstInstallment: 34120, otherInstallment: 0,
        fromDate: '2024-02-01', toDate: '2025-01-31', notes: 'Annual payment', createdBy: 'emp03'
    },
];

const INITIAL_CONTRACTS: Contract[] = [
    {
        id: 'cnt1', contractNo: '1001', contractDate: '2024-01-01', status: 'Active',
        buildingId: 'b1', buildingName: 'Al Olaya Tower (Res)', unitName: '101',
        customerId: 'c2', customerName: 'Mohammed Abdullah',
        rentValue: 45000, waterFee: 500, insuranceFee: 1000, serviceFee: 500, officePercent: 2.5, officeFeeAmount: 1125, otherDeduction: 0, otherAmount: 0,
        totalValue: 48125, installmentCount: 2, firstInstallment: 25625, otherInstallment: 22500, // 22500 rent share + 3125 fees
        periodMonths: 12, fromDate: '2024-01-01', toDate: '2024-12-31', notes: 'Standard contract', createdBy: 'admin'
    },
    {
        id: 'cnt2', contractNo: '1002', contractDate: '2023-01-01', status: 'Expired',
        buildingId: 'b2', buildingName: 'Jeddah Corniche Plaza', unitName: 'Shop-A',
        customerId: 'c1', customerName: 'Modern Textile Co.',
        rentValue: 120000, waterFee: 2000, insuranceFee: 5000, serviceFee: 2000, officePercent: 2.5, officeFeeAmount: 3000, otherDeduction: 0, otherAmount: 0,
        totalValue: 132000, installmentCount: 4, firstInstallment: 42000, otherInstallment: 30000,
        periodMonths: 12, fromDate: '2023-01-01', toDate: '2023-12-31', notes: 'Commercial shop', createdBy: 'admin'
    },
    ...EXTRA_CONTRACTS
];

// --- 7. TRANSACTIONS: +55 Transactions (Total 58) ---
const EXTRA_TRANSACTIONS: Transaction[] = [
    // Income Transactions (Contract Payments)
    { id: 'tx4', date: '2024-03-01', type: TransactionType.INCOME, amount: 16000, paymentMethod: PaymentMethod.BANK, bankName: 'NCB (AlAhli)', buildingId: 'b3', buildingName: 'King Road Apartments', unitNumber: 'A-1', expenseCategory: 'Rent', details: '1st Installment (cnt3)', createdBy: 'emp01', createdByName: 'Ahmed Al-Rashid', createdAt: Date.now() + 1, contractId: 'cnt3', expectedAmount: 16000, status: 'APPROVED' },
    { id: 'tx5', date: '2024-08-01', type: TransactionType.INCOME, amount: 15500, paymentMethod: PaymentMethod.BANK, bankName: 'NCB (AlAhli)', buildingId: 'b3', buildingName: 'King Road Apartments', unitNumber: 'A-1', expenseCategory: 'Rent', details: '2nd Installment (cnt3)', createdBy: 'emp01', createdByName: 'Ahmed Al-Rashid', createdAt: Date.now() + 2, contractId: 'cnt3', expectedAmount: 15500, status: 'APPROVED' },
    { id: 'tx6', date: '2024-04-15', type: TransactionType.INCOME, amount: 28000, paymentMethod: PaymentMethod.BANK, bankName: 'Riyad Bank', buildingId: 'b4', buildingName: 'Dammam Commercial Center', unitNumber: 'Office-A', expenseCategory: 'Rent', details: '1st Installment (cnt4)', createdBy: 'mgr01', createdByName: 'Omar Al-Jabr', createdAt: Date.now() + 3, contractId: 'cnt4', expectedAmount: 28000, status: 'APPROVED' },
    { id: 'tx7', date: '2024-05-01', type: TransactionType.INCOME, amount: 48125, paymentMethod: PaymentMethod.BANK, bankName: 'Al Rajhi Bank', buildingId: 'b1', buildingName: 'Al Olaya Tower (Res)', unitNumber: '201', expenseCategory: 'Rent', details: 'Full Payment (cnt5)', createdBy: 'emp02', createdByName: 'Fatima Al-Harbi', createdAt: Date.now() + 4, contractId: 'cnt5', expectedAmount: 48125, status: 'APPROVED' },
    { id: 'tx8', date: '2024-01-01', type: TransactionType.INCOME, amount: 36000, paymentMethod: PaymentMethod.BANK, bankName: 'Al Rajhi Bank', buildingId: 'b2', buildingName: 'Jeddah Corniche Plaza', unitNumber: 'Shop-B', expenseCategory: 'Rent', details: '1st Installment (cnt10)', createdBy: 'emp03', createdByName: 'Khaled bin Saud', createdAt: Date.now() + 5, contractId: 'cnt10', expectedAmount: 36000, status: 'APPROVED' },
    { id: 'tx9', date: '2024-04-01', type: TransactionType.INCOME, amount: 30000, paymentMethod: PaymentMethod.BANK, bankName: 'Al Rajhi Bank', buildingId: 'b2', buildingName: 'Jeddah Corniche Plaza', unitNumber: 'Shop-B', expenseCategory: 'Rent', details: '2nd Installment (cnt10)', createdBy: 'emp03', createdByName: 'Khaled bin Saud', createdAt: Date.now() + 6, contractId: 'cnt10', expectedAmount: 30000, status: 'APPROVED' },
    { id: 'tx10', date: '2024-07-01', type: TransactionType.INCOME, amount: 30000, paymentMethod: PaymentMethod.BANK, bankName: 'Al Rajhi Bank', buildingId: 'b2', buildingName: 'Jeddah Corniche Plaza', unitNumber: 'Shop-B', expenseCategory: 'Rent', details: '3rd Installment (cnt10)', createdBy: 'emp03', createdByName: 'Khaled bin Saud', createdAt: Date.now() + 7, contractId: 'cnt10', expectedAmount: 30000, status: 'APPROVED' },
    { id: 'tx11', date: '2024-02-01', type: TransactionType.INCOME, amount: 34120, paymentMethod: PaymentMethod.BANK, bankName: 'NCB (AlAhli)', buildingId: 'b3', buildingName: 'King Road Apartments', unitNumber: 'A-2', expenseCategory: 'Rent', details: 'Full Payment (cnt12)', createdBy: 'emp03', createdByName: 'Khaled bin Saud', createdAt: Date.now() + 8, contractId: 'cnt12', expectedAmount: 34120, status: 'APPROVED' },
    
    // Past Year Income (cnt2 - Expired)
    { id: 'tx12', date: '2023-01-01', type: TransactionType.INCOME, amount: 42000, paymentMethod: PaymentMethod.BANK, bankName: 'Al Rajhi Bank', buildingId: 'b2', buildingName: 'Jeddah Corniche Plaza', unitNumber: 'Shop-A', expenseCategory: 'Rent', details: '1st Installment (cnt2)', createdBy: 'admin', createdByName: 'System Administrator', createdAt: Date.now() + 9, contractId: 'cnt2', expectedAmount: 42000, status: 'APPROVED' },
    { id: 'tx13', date: '2023-04-01', type: TransactionType.INCOME, amount: 30000, paymentMethod: PaymentMethod.BANK, bankName: 'Al Rajhi Bank', buildingId: 'b2', buildingName: 'Jeddah Corniche Plaza', unitNumber: 'Shop-A', expenseCategory: 'Rent', details: '2nd Installment (cnt2)', createdBy: 'admin', createdByName: 'System Administrator', createdAt: Date.now() + 10, contractId: 'cnt2', expectedAmount: 30000, status: 'APPROVED' },
    { id: 'tx14', date: '2023-07-01', type: TransactionType.INCOME, amount: 30000, paymentMethod: PaymentMethod.BANK, bankName: 'Al Rajhi Bank', buildingId: 'b2', buildingName: 'Jeddah Corniche Plaza', unitNumber: 'Shop-A', expenseCategory: 'Rent', details: '3rd Installment (cnt2)', createdBy: 'admin', createdByName: 'System Administrator', createdAt: Date.now() + 11, contractId: 'cnt2', expectedAmount: 30000, status: 'APPROVED' },
    { id: 'tx15', date: '2023-10-01', type: TransactionType.INCOME, amount: 30000, paymentMethod: PaymentMethod.BANK, bankName: 'Al Rajhi Bank', buildingId: 'b2', buildingName: 'Jeddah Corniche Plaza', unitNumber: 'Shop-A', expenseCategory: 'Rent', details: '4th Installment (cnt2)', createdBy: 'admin', createdByName: 'System Administrator', createdAt: Date.now() + 12, contractId: 'cnt2', expectedAmount: 30000, status: 'APPROVED' },

    // Expense Transactions
    { id: 'tx16', date: '2024-03-05', type: TransactionType.EXPENSE, amount: 1500, paymentMethod: PaymentMethod.BANK, bankName: 'Al Rajhi Bank', expenseCategory: 'Maintenance', vendorName: 'Al-Haqq Maintenance', details: 'B1 - Unit 103 AC Repair', createdBy: 'emp01', createdByName: 'Ahmed Al-Rashid', createdAt: Date.now() + 13, status: 'APPROVED' },
    { id: 'tx17', date: '2024-04-10', type: TransactionType.EXPENSE, amount: 800, paymentMethod: PaymentMethod.CASH, expenseCategory: 'Cleaning', vendorName: 'Jeddah Cleaning Services', details: 'B2 - Common Area Cleaning', createdBy: 'emp02', createdByName: 'Fatima Al-Harbi', createdAt: Date.now() + 14, status: 'APPROVED' },
    { id: 'tx18', date: '2024-05-20', type: TransactionType.EXPENSE, amount: 5000, paymentMethod: PaymentMethod.BANK, bankName: 'Riyad Bank', expenseCategory: 'Security', vendorName: 'Riyadh Security Company', details: 'B4 - Monthly Security Fee', createdBy: 'mgr01', createdByName: 'Omar Al-Jabr', createdAt: Date.now() + 15, status: 'APPROVED' },
    { id: 'tx19', date: '2024-06-01', type: TransactionType.EXPENSE, amount: 4500, paymentMethod: PaymentMethod.BANK, expenseCategory: 'Salary', details: 'Emp01 Monthly Salary', createdBy: 'admin', createdByName: 'System Administrator', createdAt: Date.now() + 16, status: 'APPROVED' },
    { id: 'tx20', date: '2024-06-01', type: TransactionType.EXPENSE, amount: 4800, paymentMethod: PaymentMethod.BANK, expenseCategory: 'Salary', details: 'Emp02 Monthly Salary', createdBy: 'admin', createdByName: 'System Administrator', createdAt: Date.now() + 17, status: 'APPROVED' },
    { id: 'tx21', date: '2024-07-15', type: TransactionType.EXPENSE, amount: 900, paymentMethod: PaymentMethod.CASH, expenseCategory: 'Maintenance', vendorName: 'AC Fix Solutions', details: 'B7 - AC Service Unit 402', createdBy: 'emp03', createdByName: 'Khaled bin Saud', createdAt: Date.now() + 18, status: 'PENDING' },
    { id: 'tx22', date: '2024-07-20', type: TransactionType.EXPENSE, amount: 1200, paymentMethod: PaymentMethod.BANK, bankName: 'NCB (AlAhli)', expenseCategory: 'Utilities', details: 'B1 - Electricity Bill', createdBy: 'emp02', createdByName: 'Fatima Al-Harbi', createdAt: Date.now() + 19, status: 'APPROVED' },
    { id: 'tx23', date: '2024-08-01', type: TransactionType.EXPENSE, amount: 8500, paymentMethod: PaymentMethod.BANK, expenseCategory: 'Salary', details: 'Mgr01 Monthly Salary', createdBy: 'admin', createdByName: 'System Administrator', createdAt: Date.now() + 20, status: 'APPROVED' },
    { id: 'tx24', date: '2024-08-10', type: TransactionType.EXPENSE, amount: 300, paymentMethod: PaymentMethod.CASH, expenseCategory: 'General', details: 'Office Supplies', createdBy: 'sec01', createdByName: 'Noura Hassan', createdAt: Date.now() + 21, status: 'PENDING' },
    { id: 'tx25', date: '2023-11-01', type: TransactionType.EXPENSE, amount: 2500, paymentMethod: PaymentMethod.BANK, bankName: 'Al Rajhi Bank', expenseCategory: 'Maintenance', vendorName: 'Al Khobar Paint & Decor', details: 'B6 - Villa-2 Repainting', createdBy: 'mgr01', createdByName: 'Omar Al-Jabr', createdAt: Date.now() + 22, status: 'APPROVED' },
    
    // More Generic Income/Expense to hit 55+
    ...Array.from({ length: 35 }).map((_, i): Transaction => {
        const index = i + 26;
        const isIncome = index % 3 === 0;
        const amount = isIncome ? (index * 100 + 5000) : (index * 50 + 200);
        const type = isIncome ? TransactionType.INCOME : TransactionType.EXPENSE;
        const userIndex = (index % 5) + 1;
        const createdBy = userIndex === 1 ? 'emp01' : (userIndex === 2 ? 'emp02' : (userIndex === 3 ? 'emp03' : (userIndex === 4 ? 'mgr01' : 'sec01')));
        const createdByName = INITIAL_USERS.find(u => u.id === createdBy)!.name;
        const buildingIndex = (index % 7) + 1;
        const buildingId = `b${buildingIndex}`;
        const buildingName = INITIAL_BUILDINGS.find(b => b.id === buildingId)!.name;
        const unitName = INITIAL_BUILDINGS.find(b => b.id === buildingId)!.units[0].name;

        const date = new Date();
        date.setDate(today.getDate() - index);
        const dateStr = formatDate(date);
        
        return {
            id: `tx${index}`,
            date: dateStr,
            type,
            amount,
            paymentMethod: index % 4 === 0 ? PaymentMethod.CASH : PaymentMethod.BANK,
            bankName: index % 4 !== 0 ? (index % 2 === 0 ? 'Al Rajhi Bank' : 'NCB (AlAhli)') : undefined,
            buildingId: isIncome ? buildingId : undefined,
            buildingName: isIncome ? buildingName : undefined,
            unitNumber: isIncome ? unitName : undefined,
            expenseCategory: isIncome ? 'Rent' : (index % 5 === 0 ? 'Maintenance' : 'General'),
            details: `${isIncome ? 'Misc Income' : 'Misc Expense'} #${index}`,
            createdBy,
            createdByName,
            createdAt: Date.now() + 100 + index,
            status: index % 7 === 0 ? 'PENDING' : 'APPROVED' // Some PENDING transactions
        };
    })
];
const INITIAL_TRANSACTIONS: Transaction[] = [
    { id: 'tx1', date: '2024-01-01', type: TransactionType.INCOME, amount: 25625, paymentMethod: PaymentMethod.BANK, bankName: 'Al Rajhi Bank', buildingId: 'b1', buildingName: 'Al Olaya Tower (Res)', unitNumber: '101', expenseCategory: 'Rent', details: '1st Installment', createdBy: 'admin', createdByName: 'System Administrator', createdAt: Date.now(), contractId: 'cnt1', expectedAmount: 25625, status: 'APPROVED' },
    { id: 'tx2', date: '2024-06-01', type: TransactionType.INCOME, amount: 22500, paymentMethod: PaymentMethod.BANK, bankName: 'Al Rajhi Bank', buildingId: 'b1', buildingName: 'Al Olaya Tower (Res)', unitNumber: '101', expenseCategory: 'Rent', details: '2nd Installment', createdBy: 'admin', createdByName: 'System Administrator', createdAt: Date.now(), contractId: 'cnt1', expectedAmount: 22500, status: 'APPROVED' },
    { id: 'tx3', date: '2024-02-15', type: TransactionType.EXPENSE, amount: 450, paymentMethod: PaymentMethod.CASH, expenseCategory: 'Maintenance', details: 'Plumbing Repair Unit 102', createdBy: 'emp01', createdByName: 'Ahmed Al-Rashid', createdAt: Date.now(), status: 'APPROVED' },
    ...EXTRA_TRANSACTIONS
];

// --- 8. TASKS: +10 Tasks (Total 10) ---
const INITIAL_TASKS: Task[] = [
    // For emp01 (Ahmed Al-Rashid)
    { id: 't1', userId: 'emp01', title: 'Follow up on cnt1 renewal', description: 'Contact Mohammed Abdullah about contract cnt1 for b1-101. Expires EOY.', status: 'Pending', dueDate: '2024-11-30', createdBy: 'admin', createdAt: Date.now() },
    { id: 't2', userId: 'emp01', title: 'Inspect B3 units', description: 'Perform visual inspection on King Road Apartments (b3) units A-1 and A-2.', status: 'Completed', dueDate: '2024-10-01', createdBy: 'mgr01', createdAt: Date.now() - 86400000 * 30 },
    // For emp02 (Fatima Al-Harbi)
    { id: 't3', userId: 'emp02', title: 'Process Tx21 approval', description: 'Review the PENDING expense transaction tx21 for AC Fix Solutions and approve/reject.', status: 'Pending', dueDate: '2024-07-25', createdBy: 'admin', createdAt: Date.now() + 1 },
    { id: 't4', userId: 'emp02', title: 'Collect payment from c4', description: 'Follow up on 2nd installment for cnt4 (Dammam Commercial Center).', status: 'Pending', dueDate: '2024-09-15', createdBy: 'mgr01', createdAt: Date.now() + 2 },
    // For emp03 (Khaled bin Saud)
    { id: 't5', userId: 'emp03', title: 'File paperwork for cnt12', description: 'Complete the physical filing for Quick Services Est. contract.', status: 'Completed', dueDate: '2024-02-15', createdBy: 'admin', createdAt: Date.now() + 3 },
    { id: 't6', userId: 'emp03', title: 'Get quotes for B5 exterior paint', description: 'Contact 3 vendors for quotes to repaint Makkah Residential Block (b5) exterior.', status: 'Pending', dueDate: '2024-12-15', createdBy: 'mgr01', createdAt: Date.now() + 4 },
    // For mgr01 (Omar Al-Jabr)
    { id: 't7', userId: 'mgr01', title: 'Review monthly financial report', description: 'Generate and review the financial summary for August.', status: 'Completed', dueDate: '2024-09-05', createdBy: 'admin', createdAt: Date.now() + 5 },
    { id: 't8', userId: 'mgr01', title: 'Blacklist c9 customer', description: 'Ensure customer Noura Khalid (c9) is correctly marked as blacklisted.', status: 'Completed', dueDate: '2024-06-01', createdBy: 'admin', createdAt: Date.now() + 6 },
    // For sec01 (Noura Hassan)
    { id: 't9', userId: 'sec01', title: 'Process Tx24 approval', description: 'Review the PENDING expense transaction tx24 for office supplies.', status: 'Pending', dueDate: '2024-08-15', createdBy: 'mgr01', createdAt: Date.now() + 7 },
    { id: 't10', userId: 'sec01', title: 'Update vendor V5 status', description: 'Change vendor Al Khobar Paint & Decor (v5) status to "Active".', status: 'Pending', dueDate: '2024-11-01', createdBy: 'emp01', createdAt: Date.now() + 8 },
];

// --- CORE FUNCTIONS (Unchanged logic, updated initial data) ---

// This helper is for initialization only. The actual getContracts contains auto-expire logic.
const getInitialContracts = (): Contract[] => {
    const data = localStorage.getItem(KEYS.CONTRACTS);
    if (data) return JSON.parse(data);

    // Auto expire check for initial data
    const now = new Date();
    return INITIAL_CONTRACTS.map((c: Contract) => {
        if (c.status === 'Active' && new Date(c.toDate) < now) {
            return { ...c, status: 'Expired' };
        }
        return c;
    });
};

// --- HELPERS ---

export const isUnitOccupied = (buildingId: string, unitName: string): boolean => {
    const contracts = getContracts();
    // Check if there is any Active contract for this unit
    return contracts.some(c => 
        c.buildingId === buildingId && 
        c.unitName === unitName && 
        c.status === 'Active'
    );
};

// --- CRUD ---

export const getContracts = (): Contract[] => {
    const data = localStorage.getItem(KEYS.CONTRACTS);
    let contracts = data ? JSON.parse(data) : getInitialContracts(); // Use helper to load default and check for auto-expire at init
    
    // Auto expire check for all subsequent loads
    const now = new Date();
    let changed = false;
    contracts = contracts.map((c: Contract) => {
        if (c.status === 'Active' && new Date(c.toDate) < now) {
            changed = true;
            return { ...c, status: 'Expired' };
        }
        return c;
    });
    
    // Save updated contracts back if any status changed.
    if(changed && !data) localStorage.setItem(KEYS.CONTRACTS, JSON.stringify(contracts)); // Only save if we loaded default
    else if (changed && data) localStorage.setItem(KEYS.CONTRACTS, JSON.stringify(contracts));

    return contracts;
};

export const saveContract = (contract: Contract): void => {
    const contracts = getContracts();
    const index = contracts.findIndex(c => c.id === contract.id);
    if (index >= 0) contracts[index] = contract;
    else contracts.push(contract);
    localStorage.setItem(KEYS.CONTRACTS, JSON.stringify(contracts));
};

export const getActiveContract = (buildingId: string, unitName: string): Contract | undefined => {
    return getContracts().find(c => c.buildingId === buildingId && c.unitName === unitName && c.status === 'Active');
};

export const getTransactions = (): Transaction[] => {
    const data = localStorage.getItem(KEYS.TRANSACTIONS);
    // Sort transactions by date (newest first) for better display/use
    const transactions = data ? JSON.parse(data) : INITIAL_TRANSACTIONS;
    return transactions.sort((a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const saveTransaction = (transaction: Transaction): void => {
    const transactions = getTransactions();
    // Logic for Pending status if not admin and has extra fields handled in component or here
    // But Component handles logic primarily. Here we just ensure status exists
    if (!transaction.status) transaction.status = 'APPROVED';
    if (!transaction.createdAt) transaction.createdAt = Date.now();

    const index = transactions.findIndex(t => t.id === transaction.id);
    if (index >= 0) transactions[index] = { ...transaction, lastModifiedAt: Date.now() };
    else transactions.push(transaction);
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
};

export const updateTransactionStatus = (id: string, status: TransactionStatus): void => {
    const transactions = getTransactions();
    const index = transactions.findIndex(t => t.id === id);
    if (index >= 0) {
        if (status === 'REJECTED') {
            transactions.splice(index, 1);
        } else {
            transactions[index].status = status;
        }
        localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
    }
};

export const deleteTransaction = (id: string): void => {
    const transactions = getTransactions().filter(t => t.id !== id);
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
};

// ... Standard Getters for other entities ...
export const getBuildings = () => {
    const d = localStorage.getItem(KEYS.BUILDINGS);
    return d ? JSON.parse(d) : INITIAL_BUILDINGS;
};
export const saveBuilding = (b: Building) => {
    const list = getBuildings();
    const idx = list.findIndex((x: Building) => x.id === b.id);
    if(idx >= 0) list[idx] = b; else list.push(b);
    localStorage.setItem(KEYS.BUILDINGS, JSON.stringify(list));
};
export const deleteBuilding = (id: string) => {
    const list = getBuildings().filter((b: Building) => b.id !== id);
    localStorage.setItem(KEYS.BUILDINGS, JSON.stringify(list));
}

export const getCustomers = () => {
    const d = localStorage.getItem(KEYS.CUSTOMERS);
    return d ? JSON.parse(d) : INITIAL_CUSTOMERS;
};
export const saveCustomer = (c: Customer) => {
    const list = getCustomers();
    if (!c.id || c.code === '0' || !c.code) {
        const max = list.reduce((m: number, cust: Customer) => Math.max(m, parseInt(cust.code) || 1000), 1000);
        c.code = (max + 1).toString();
        if(!c.id) c.id = crypto.randomUUID();
    }
    const idx = list.findIndex((x: Customer) => x.id === c.id);
    if(idx >= 0) list[idx] = c; else list.push(c);
    localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(list));
};
export const deleteCustomer = (id: string) => {
    const list = getCustomers().filter((c: Customer) => c.id !== id);
    localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(list));
}

export const getUsers = () => {
    const d = localStorage.getItem(KEYS.USERS);
    return d ? JSON.parse(d) : INITIAL_USERS;
};
export const saveUser = (u: User) => {
    const list = getUsers();
    const idx = list.findIndex((x: User) => x.id === u.id);
    if(idx >= 0) list[idx] = u; else list.push(u);
    localStorage.setItem(KEYS.USERS, JSON.stringify(list));
};
export const deleteUser = (id: string) => {
    const list = getUsers().filter((u: User) => u.id !== id);
    localStorage.setItem(KEYS.USERS, JSON.stringify(list));
};
export const mockLogin = async (id: string, pass: string) => {
    await delay(500);
    return getUsers().find((u: User) => u.id === id && u.password === pass);
};

export const getBanks = () => {
    const d = localStorage.getItem(KEYS.BANKS);
    return d ? JSON.parse(d) : INITIAL_BANKS;
}
export const saveBank = (b: Bank) => {
    const list = getBanks();
    const idx = list.findIndex((x: Bank) => x.name === b.name);
    if(idx >= 0) list[idx] = b; else list.push(b);
    localStorage.setItem(KEYS.BANKS, JSON.stringify(list));
}

export const getVendors = (): Vendor[] => {
    const d = localStorage.getItem(KEYS.VENDORS);
    return d ? JSON.parse(d) : INITIAL_VENDORS;
}
export const saveVendor = (v: Vendor) => {
    const list = getVendors();
    if(!v.id) v.id = crypto.randomUUID();
    const idx = list.findIndex((x: Vendor) => x.id === v.id);
    if(idx >= 0) list[idx] = v; else list.push(v);
    localStorage.setItem(KEYS.VENDORS, JSON.stringify(list));
}
export const deleteVendor = (id: string) => {
    const list = getVendors().filter((v: Vendor) => v.id !== id);
    localStorage.setItem(KEYS.VENDORS, JSON.stringify(list));
}

// Tasks now also use INITIAL_TASKS
export const getTasks = (userId: string): Task[] => {
    const d = localStorage.getItem(KEYS.TASKS);
    const all = d ? JSON.parse(d) : INITIAL_TASKS;
    return all.filter((t: Task) => t.userId === userId);
}
export const saveTask = (t: Task) => {
    const d = localStorage.getItem(KEYS.TASKS);
    const list = d ? JSON.parse(d) : INITIAL_TASKS;
    if(!t.id) t.id = crypto.randomUUID();
    const idx = list.findIndex((x: Task) => x.id === t.id);
    if(idx >= 0) list[idx] = t; else list.push(t);
    localStorage.setItem(KEYS.TASKS, JSON.stringify(list));
}
export const deleteTask = (id: string) => {
    const d = localStorage.getItem(KEYS.TASKS);
    const list = d ? JSON.parse(d) : INITIAL_TASKS;
    localStorage.setItem(KEYS.TASKS, JSON.stringify(list.filter((t: Task) => t.id !== id)));
}