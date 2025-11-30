
import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, PaymentMethod, ExpenseCategory, User, Building, UserRole, Contract, Vendor, Bank } from '../types';
import { getBuildings, getUsers, saveTransaction, getActiveContract, getVendors, getBanks, saveBank, getTransactions } from '../services/mockData';
import { Save, RefreshCw, CheckCircle, ArrowRight, Home, Banknote, Calendar, AlertTriangle, Plus, Briefcase, User as UserIcon, Lock, Percent, TrendingUp } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface EntryFormProps {
  currentUser: User;
}

const EntryForm: React.FC<EntryFormProps> = ({ currentUser }) => {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  
  // Data
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  
  // Form State
  const [id, setId] = useState<string | null>(null); // For Edit Mode
  const [type, setType] = useState<TransactionType>(TransactionType.INCOME);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [buildingId, setBuildingId] = useState('');
  const [unitNumber, setUnitNumber] = useState('');
  const [amount, setAmount] = useState<string>('');
  
  // Adjustments
  const [extraAmount, setExtraAmount] = useState<string>('0');
  const [discountAmount, setDiscountAmount] = useState<string>('0');

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.BANK);
  const [bankName, setBankName] = useState('');
  
  // New Bank State
  const [newBankName, setNewBankName] = useState('');
  const [newBankIban, setNewBankIban] = useState('');
  const [showAddBank, setShowAddBank] = useState(false);
  
  const [applyVat, setApplyVat] = useState(false);
  
  // Contract Logic
  const [activeContract, setActiveContract] = useState<Contract | undefined>(undefined);
  const [expectedAmount, setExpectedAmount] = useState<number>(0);
  const [remainingContractBalance, setRemainingContractBalance] = useState(0);
  const [overpaymentWarning, setOverpaymentWarning] = useState('');
  
  // Expense/Salary
  const [expenseCategory, setExpenseCategory] = useState<string>(ExpenseCategory.GENERAL);
  const [targetEmployeeId, setTargetEmployeeId] = useState('');
  const [targetVendorId, setTargetVendorId] = useState('');
  const [details, setDetails] = useState('');
  const [bonus, setBonus] = useState<string>('0');
  const [deduction, setDeduction] = useState<string>('0');

  useEffect(() => {
    setBuildings(getBuildings());
    setEmployees(getUsers().filter(u => u.role !== UserRole.ADMIN));
    setVendors(getVendors());
    setBanks(getBanks());
    setAllTransactions(getTransactions());
  }, []);

  // EDIT MODE: Check if transaction passed via navigation
  useEffect(() => {
    if (location.state && location.state.transaction) {
      const tx = location.state.transaction as Transaction;
      setId(tx.id); // Set ID to update existing
      setType(tx.type);
      setDate(tx.date);
      setAmount(tx.amount.toString());
      setDetails(tx.details);
      setPaymentMethod(tx.paymentMethod);
      if (tx.bankName) setBankName(tx.bankName);
      
      if (tx.type === TransactionType.INCOME) {
          if (tx.buildingId) setBuildingId(tx.buildingId);
          if (tx.unitNumber) setUnitNumber(tx.unitNumber);
      } else {
          if (tx.expenseCategory) setExpenseCategory(tx.expenseCategory);
          if (tx.employeeId) setTargetEmployeeId(tx.employeeId);
          if (tx.vendorId) setTargetVendorId(tx.vendorId);
          if (tx.bonusAmount) setBonus(tx.bonusAmount.toString());
          if (tx.deductionAmount) setDeduction(tx.deductionAmount.toString());
      }
      
      if (tx.extraAmount) setExtraAmount(tx.extraAmount.toString());
      if (tx.discountAmount) setDiscountAmount(tx.discountAmount.toString());
      
      // Clear state so we don't re-trigger
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const selectedBuilding = buildings.find(b => b.id === buildingId);

  // Auto-fill logic based on Contract (Only if NOT in edit mode to avoid overwriting)
  useEffect(() => {
    if (!id && type === TransactionType.INCOME && buildingId && unitNumber) {
        const contract = getActiveContract(buildingId, unitNumber);
        setActiveContract(contract);
        setOverpaymentWarning('');
        
        if (contract) {
             const prevPayments = allTransactions.filter(t => t.contractId === contract.id && t.status !== 'REJECTED');
             const totalPaid = prevPayments.reduce((sum, t) => sum + t.amount, 0);
             const remaining = contract.totalValue - totalPaid;
             setRemainingContractBalance(remaining);

             // Installment Logic: 1st vs Others
             const isFirstPayment = prevPayments.length === 0;
             const autoAmount = isFirstPayment ? contract.firstInstallment : contract.otherInstallment;
             
             // Cap at remaining
             const finalAuto = Math.min(autoAmount, remaining);
             setAmount(finalAuto.toString());
             setExpectedAmount(finalAuto);
             
             if (!details) {
                 setDetails(isFirstPayment 
                    ? `1st Installment (Rent+Water+Fees) - Contract #${contract.contractNo}` 
                    : `Installment - Contract #${contract.contractNo}`);
             }
        }
    }
  }, [buildingId, unitNumber, type, id]); 

  const handleAddBank = () => {
      if(newBankName && newBankIban) {
          saveBank({ name: newBankName, iban: newBankIban });
          setBanks(getBanks());
          setBankName(newBankName);
          setNewBankName(''); setNewBankIban(''); setShowAddBank(false);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const baseAmount = parseFloat(amount) || 0;
    const ext = parseFloat(extraAmount) || 0;
    const disc = parseFloat(discountAmount) || 0;
    const netAmount = baseAmount + ext - disc;
    
    const vatVal = applyVat ? netAmount * 0.15 : 0;
    
    // Status Logic
    // If Staff enters Adjustments, it is PENDING.
    // If Admin enters Adjustments, it is APPROVED immediately.
    const hasAdjustments = ext > 0 || disc > 0;
    const isAdmin = currentUser.role === UserRole.ADMIN || currentUser.role === 'MANAGER';
    const status = (hasAdjustments && !isAdmin) ? 'PENDING' : 'APPROVED';

    // IMPORTANT: If PENDING, we save the BASE amount. 
    // The "Net Amount" will be calculated and saved only when Approved.
    // If APPROVED (Admin), we save the Net Amount immediately.
    const savedAmount = status === 'PENDING' ? baseAmount : netAmount;

    const newTx: Transaction = {
      id: id || crypto.randomUUID(),
      date,
      type,
      amount: savedAmount,
      vatAmount: vatVal,
      totalWithVat: savedAmount + vatVal, // For pending, VAT is calc on base? Or should display N/A? Let's keep consistent.
      paymentMethod,
      bankName: paymentMethod === PaymentMethod.BANK ? bankName : undefined,
      buildingId: type === TransactionType.INCOME ? buildingId : undefined,
      buildingName: type === TransactionType.INCOME ? selectedBuilding?.name : undefined,
      unitNumber: type === TransactionType.INCOME ? unitNumber : undefined,
      expenseCategory: type === TransactionType.EXPENSE ? expenseCategory : undefined,
      employeeId: expenseCategory === ExpenseCategory.SALARY ? targetEmployeeId : undefined,
      employeeName: expenseCategory === ExpenseCategory.SALARY ? employees.find(u => u.id === targetEmployeeId)?.name : undefined,
      bonusAmount: expenseCategory === ExpenseCategory.SALARY ? parseFloat(bonus) : undefined,
      deductionAmount: expenseCategory === ExpenseCategory.SALARY ? parseFloat(deduction) : undefined,
      vendorId: targetVendorId || undefined,
      vendorName: vendors.find(v => v.id === targetVendorId)?.name,
      extraAmount: ext,
      discountAmount: disc,
      details,
      createdAt: Date.now(),
      createdBy: currentUser.id,
      createdByName: currentUser.name,
      contractId: activeContract?.id,
      expectedAmount: activeContract && type === TransactionType.INCOME ? expectedAmount : undefined,
      status
    };

    setTimeout(() => {
      saveTransaction(newTx);
      setLoading(false);
      setSuccessMsg(id ? 'Transaction Updated' : (status === 'PENDING' ? 'Submitted for Approval' : 'Entry Recorded'));
      setTimeout(() => { 
          if(id) navigate('/history'); 
          else {
            setSuccessMsg(''); setAmount(''); setDetails(''); setExtraAmount('0'); setDiscountAmount('0'); setId(null); 
          }
      }, 1500);
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn pb-20">
      <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-8 space-y-8 shadow-xl shadow-slate-200/50 relative">
        {loading && <div className="absolute inset-0 bg-white/60 z-50 flex items-center justify-center rounded-3xl"><RefreshCw className="animate-spin text-violet-600" size={40} /></div>}

        <div className="flex justify-between items-center pb-6 border-b border-slate-100/50">
           <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                  {id ? <RefreshCw className="text-blue-500"/> : <Plus className="text-violet-500"/>} 
                  {id ? 'Edit Transaction' : 'New Transaction'}
              </h2>
              <p className="text-sm font-medium text-slate-500">{id ? 'Update financial record details' : 'Record a new financial entry'}</p>
           </div>
           <div className="flex bg-slate-100/80 p-1.5 rounded-xl">
              <button type="button" onClick={() => setType(TransactionType.INCOME)} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${type === TransactionType.INCOME ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-500'}`}>Income</button>
              <button type="button" onClick={() => setType(TransactionType.EXPENSE)} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${type === TransactionType.EXPENSE ? 'bg-white text-rose-600 shadow-md' : 'text-slate-500'}`}>Expense</button>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div>
                   <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Date</label>
                   <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-violet-500/10 font-bold text-slate-700" />
                </div>

                {type === TransactionType.INCOME ? (
                    <div className="grid grid-cols-2 gap-4">
                           <div>
                               <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Building</label>
                               <select value={buildingId} onChange={e => {setBuildingId(e.target.value); setUnitNumber('');}} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700">
                                   <option value="">Select...</option>
                                   {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                               </select>
                           </div>
                           <div>
                               <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Unit</label>
                               <select value={unitNumber} onChange={e => setUnitNumber(e.target.value)} disabled={!buildingId} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700">
                                  <option value="">Select...</option>
                                  {selectedBuilding?.units.map(u => <option key={u.name} value={u.name}>{u.name}</option>)}
                               </select>
                           </div>
                    </div>
                ) : (
                    <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Category</label>
                        <select value={expenseCategory} onChange={e => setExpenseCategory(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700">
                            {Object.values(ExpenseCategory).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                )}
            </div>

            <div className="space-y-6">
                <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Base Amount (SAR)</label>
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 text-xl font-black text-slate-800" placeholder="0.00" />
                </div>
                
                {/* Adjustments */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1"><Plus size={10}/> Extra</label>
                        <input type="number" value={extraAmount} onChange={e => setExtraAmount(e.target.value)} className="w-full p-2 rounded-lg border border-slate-200 text-sm" />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1"><Percent size={10}/> Discount</label>
                        <input type="number" value={discountAmount} onChange={e => setDiscountAmount(e.target.value)} className="w-full p-2 rounded-lg border border-slate-200 text-sm" />
                    </div>
                    {(parseFloat(extraAmount) > 0 || parseFloat(discountAmount) > 0) && currentUser.role !== UserRole.ADMIN && (
                        <div className="col-span-2 text-[10px] text-amber-600 font-bold bg-amber-50 p-2 rounded border border-amber-100 flex items-center gap-2">
                            <AlertTriangle size={12}/> Approval Required (Base Amount saved until approved)
                        </div>
                    )}
                </div>

                <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Payment Method</label>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <button type="button" onClick={() => setPaymentMethod(PaymentMethod.CASH)} className={`py-2.5 rounded-xl text-sm font-bold border ${paymentMethod === PaymentMethod.CASH ? 'bg-slate-800 text-white' : 'bg-white text-slate-500'}`}>Cash</button>
                        <button type="button" onClick={() => setPaymentMethod(PaymentMethod.BANK)} className={`py-2.5 rounded-xl text-sm font-bold border ${paymentMethod === PaymentMethod.BANK ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500'}`}>Bank</button>
                    </div>
                    {paymentMethod === PaymentMethod.BANK && (
                         <div className="space-y-2">
                             <div className="flex gap-2">
                                <select value={bankName} onChange={e => setBankName(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-sm">
                                    <option value="">Select Bank...</option>
                                    {banks.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
                                </select>
                                <button type="button" onClick={() => setShowAddBank(!showAddBank)} className="px-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600"><Plus size={16}/></button>
                             </div>
                             {showAddBank && (
                                 <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 animate-fadeIn">
                                     <input type="text" placeholder="Bank Name" value={newBankName} onChange={e => setNewBankName(e.target.value)} className="w-full p-2 text-xs rounded border" />
                                     <input type="text" placeholder="IBAN" value={newBankIban} onChange={e => setNewBankIban(e.target.value)} className="w-full p-2 text-xs rounded border" />
                                     <button type="button" onClick={handleAddBank} className="w-full py-1 bg-slate-800 text-white text-xs font-bold rounded">Add Bank</button>
                                 </div>
                             )}
                             {/* Show IBAN if selected */}
                             {bankName && banks.find(b => b.name === bankName)?.iban && (
                                 <div className="text-[10px] font-mono text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                                     IBAN: {banks.find(b => b.name === bankName)?.iban}
                                 </div>
                             )}
                         </div>
                    )}
                </div>
            </div>
        </div>

        <div className="pt-2">
            <textarea value={details} onChange={e => setDetails(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium" placeholder="Description / Notes" />
        </div>

        <div className="pt-4 border-t border-slate-100/50 flex justify-end gap-3">
             {id && <button type="button" onClick={() => navigate('/history')} className="px-6 py-4 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Cancel</button>}
             <button type="submit" disabled={loading} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-lg font-bold px-12 py-4 rounded-xl shadow-xl flex items-center gap-3">
                {loading ? <RefreshCw className="animate-spin" /> : <Save />} {id ? 'Update Record' : 'Confirm Entry'}
             </button>
        </div>
        
        {successMsg && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 text-white px-8 py-6 rounded-3xl shadow-2xl flex flex-col items-center gap-3 animate-fadeIn z-50">
                <CheckCircle size={48} className="text-emerald-400" />
                <span className="text-xl font-bold">{successMsg}</span>
            </div>
        )}
      </form>
    </div>
  );
};

export default EntryForm;
