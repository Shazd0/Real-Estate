
import React, { useState, useEffect } from 'react';
import { User, Building, Customer, Contract, Task, TaskStatus } from '../types';
import { getBuildings, getCustomers, saveContract, getContracts, isUnitOccupied, saveTask } from '../services/mockData';
import { Save, RefreshCw, Calculator, CalendarClock, Building2, User as UserIcon, List, PlusCircle, Search, AlertTriangle, Archive, RotateCcw, CheckCircle, Info, Lock } from 'lucide-react';

interface ContractFormProps {
  currentUser: User;
}

const ContractForm: React.FC<ContractFormProps> = ({ currentUser }) => {
  const [view, setView] = useState<'FORM' | 'LIST'>('FORM');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Data
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [existingContracts, setExistingContracts] = useState<Contract[]>([]);
  const [nextContractNo, setNextContractNo] = useState('');
  
  // Form State
  const [contractDate, setContractDate] = useState(new Date().toISOString().split('T')[0]);
  const [buildingId, setBuildingId] = useState('');
  const [unitName, setUnitName] = useState('');
  const [customerId, setCustomerId] = useState('');
  
  // Financials
  const [rentValue, setRentValue] = useState<number>(0); // Total Yearly Rent
  const [waterFee, setWaterFee] = useState<number>(0);   // Total Water
  const [officePercent, setOfficePercent] = useState<number>(2.5); // Default 2.5%
  const [insuranceFee, setInsuranceFee] = useState<number>(0);
  const [serviceFee, setServiceFee] = useState<number>(0);
  const [otherDeduction, setOtherDeduction] = useState<number>(0); 
  const [otherAmount, setOtherAmount] = useState<number>(0);
  
  // Installments
  const [installmentCount, setInstallmentCount] = useState<number>(2); // Default 2
  
  // Period
  const [periodMonths, setPeriodMonths] = useState<number>(12);
  const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState('');
  const [notes, setNotes] = useState('');
  
  // Renewal State
  const [renewalSourceId, setRenewalSourceId] = useState<string | null>(null);

  // Computed Values
  // Office Fee = Rent * 2.5%
  const officeFeeAmount = (rentValue * (officePercent / 100));
  
  // Total Contract Value
  const totalValue = (rentValue + waterFee + insuranceFee + serviceFee + officeFeeAmount + otherAmount) - otherDeduction;

  // Installment Logic:
  // Water Fee is now divided across ALL installments.
  // First Installment = (Rent/Count) + (Water/Count) + Fees + Office - Deductions
  // Other Installments = (Rent/Count) + (Water/Count)
  
  const count = installmentCount || 1;
  const rentPerInstallment = rentValue / count;
  const waterPerInstallment = waterFee / count;
  
  const otherInstallment = Math.round(rentPerInstallment + waterPerInstallment);
  const firstInstallment = Math.round((rentPerInstallment + waterPerInstallment) + insuranceFee + serviceFee + officeFeeAmount + otherAmount - otherDeduction);

  useEffect(() => {
    setBuildings(getBuildings());
    setCustomers(getCustomers());
    refreshContracts();
  }, []);

  const refreshContracts = () => {
    const all = getContracts();
    setExistingContracts([...all]);
    const max = all.reduce((m, c) => Math.max(m, parseInt(c.contractNo) || 0), 1000);
    setNextContractNo((max + 1).toString());
  }

  useEffect(() => {
    if (buildingId && unitName && !renewalSourceId) {
      const b = buildings.find(b => b.id === buildingId);
      const u = b?.units.find(u => u.name === unitName);
      if (u) {
        setRentValue(u.defaultRent);
      }
    }
  }, [buildingId, unitName, buildings, renewalSourceId]);

  useEffect(() => {
    if (fromDate && periodMonths) {
      const d = new Date(fromDate);
      d.setMonth(d.getMonth() + periodMonths);
      d.setDate(d.getDate() - 1);
      setToDate(d.toISOString().split('T')[0]);
    }
  }, [fromDate, periodMonths]);

  const generateTasks = (contract: Contract) => {
      if (!contract.installmentCount || contract.installmentCount <= 0) return;
      const start = new Date(contract.fromDate);
      const end = new Date(contract.toDate);
      const intervalMonths = Math.floor(contract.periodMonths / contract.installmentCount);
      let current = new Date(start);
      for (let i = 1; i <= contract.installmentCount; i++) {
          if (current > end) break;
          const task: Task = {
              id: crypto.randomUUID(),
              userId: currentUser.id, 
              title: `Rent Due (${i}/${contract.installmentCount}): ${contract.unitName}`,
              description: `Installment #${i}. Expected: ${i === 1 ? contract.firstInstallment : contract.otherInstallment} SAR`,
              status: TaskStatus.TODO,
              createdAt: Date.now(),
              dueDate: current.toISOString().split('T')[0]
          };
          saveTask(task);
          current.setMonth(current.getMonth() + intervalMonths);
      }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!buildingId || !unitName || !customerId) {
      alert("Please fill in Building, Unit, and Customer.");
      return;
    }
    
    // Duplicate Check: If not renewing, check if occupied
    if (!renewalSourceId && isUnitOccupied(buildingId, unitName)) {
        setErrorMsg(`Unit ${unitName} has an ACTIVE contract. Please finalize/terminate it first.`);
        return;
    }

    setLoading(true);
    
    const building = buildings.find(b => b.id === buildingId);
    const customer = customers.find(c => c.id === customerId);

    const newContract: Contract = {
      id: crypto.randomUUID(),
      contractNo: nextContractNo,
      contractDate,
      status: 'Active',
      buildingId,
      buildingName: building?.name || '',
      unitName,
      customerId,
      customerName: customer?.nameEn || '',
      rentValue,
      waterFee,
      insuranceFee,
      serviceFee,
      officePercent,
      officeFeeAmount,
      otherDeduction,
      otherAmount,
      totalValue,
      installmentCount,
      firstInstallment,
      otherInstallment,
      periodMonths,
      fromDate,
      toDate,
      notes,
      createdBy: currentUser.id
    };

    setTimeout(() => {
      saveContract(newContract);
      generateTasks(newContract);
      setLoading(false);
      setSuccess('Contract Saved Successfully');
      setTimeout(() => setSuccess(''), 3000);
      resetForm();
      refreshContracts();
    }, 600);
  };

  const resetForm = () => {
    setBuildingId('');
    setUnitName('');
    setCustomerId('');
    setRentValue(0);
    setWaterFee(0);
    setInsuranceFee(0);
    setServiceFee(0);
    setOfficePercent(2.5);
    setOtherDeduction(0);
    setOtherAmount(0);
    setInstallmentCount(2);
    setRenewalSourceId(null);
    setErrorMsg('');
  };

  // --- FINALIZATION FIX ---
  const handleFinalize = (e: React.MouseEvent, c: Contract) => {
    e.stopPropagation(); // Stop propagation
    e.preventDefault();
    if (window.confirm(`Are you sure you want to FINALIZE Contract #${c.contractNo}? This will mark it as Terminated.`)) {
       const updated: Contract = { ...c, status: 'Terminated' };
       saveContract(updated);
       // Force update local state to reflect change immediately
       setExistingContracts(prev => prev.map(item => item.id === c.id ? updated : item));
    }
  };

  const handleRenew = (e: React.MouseEvent, c: Contract) => {
    e.stopPropagation();
    e.preventDefault();
    setRenewalSourceId(c.id);
    setBuildingId(c.buildingId);
    setUnitName(c.unitName);
    setCustomerId(c.customerId);
    setRentValue(c.rentValue);
    setWaterFee(c.waterFee);
    setOfficePercent(c.officePercent);
    setInsuranceFee(c.insuranceFee);
    setServiceFee(c.serviceFee);
    setOtherDeduction(c.otherDeduction);
    setOtherAmount(c.otherAmount || 0);
    setInstallmentCount(c.installmentCount || 2);
    
    // New Date = Old ToDate + 1 Day
    const oldEndDate = new Date(c.toDate);
    oldEndDate.setDate(oldEndDate.getDate() + 1);
    setFromDate(oldEndDate.toISOString().split('T')[0]);
    
    setView('FORM');
  };

  const InputField = ({ label, value, setter, type = "number", readonly = false, prefix = "" }: any) => (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{label}</label>
      <div className="relative group">
         {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">{prefix}</span>}
         <input 
          type={type}
          value={value}
          readOnly={readonly}
          onChange={(e) => setter && setter(type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
          className={`w-full ${prefix ? 'pl-10' : 'pl-4'} pr-4 py-3 border ${readonly ? 'bg-slate-50 text-slate-500 border-slate-200' : 'bg-white border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10'} rounded-xl outline-none transition-all text-sm font-bold text-slate-900 shadow-sm`}
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn pb-12">
      <div className="glass-panel rounded-t-3xl p-2 flex gap-2 mb-0 border-b-0">
         <button onClick={() => { setView('FORM'); resetForm(); }} className={`flex-1 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${view === 'FORM' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
           <PlusCircle size={18} /> New Contract
         </button>
         <button onClick={() => setView('LIST')} className={`flex-1 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${view === 'LIST' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
           <List size={18} /> All Contracts
         </button>
      </div>

      {view === 'FORM' ? (
        <form onSubmit={handleSubmit} className="glass-panel border-t-0 rounded-b-3xl p-10 space-y-10 animate-slideUp relative">
           {errorMsg && (
               <div className="absolute top-6 left-0 right-0 mx-auto w-max z-50 bg-rose-600 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-shake font-bold">
                   <AlertTriangle /> {errorMsg}
                   <button type="button" onClick={() => setErrorMsg('')}><Archive size={16} /></button>
               </div>
           )}

           <div className="flex justify-between items-center pb-6 border-b border-slate-100/50">
               <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">Contract Entry</h2>
                  <p className="text-sm font-medium text-slate-500">Create a new legal rent agreement</p>
               </div>
               <div className="bg-violet-50 text-violet-700 px-4 py-1.5 rounded-xl text-xs font-bold border border-violet-100">
                   Drafting #{nextContractNo}
               </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 bg-white/50 p-6 rounded-3xl border border-white/50 shadow-inner">
               <InputField label="Contract No" value={nextContractNo} readonly={true} type="text" prefix="#" />
               <InputField label="Contract Date" value={contractDate} setter={setContractDate} type="date" />
               <div className="lg:col-span-2 space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                      <UserIcon size={12} className="text-violet-500" /> Customer / Tenant
                  </label>
                  <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="w-full pl-4 pr-8 py-3 bg-white border border-slate-200 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none text-sm font-bold text-slate-900 shadow-sm">
                        <option value="">Select Tenant...</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.nameEn} - {c.mobileNo}</option>)}
                  </select>
               </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-8">
                  <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Building2 size={20} /></div>
                      <h3 className="text-lg font-black text-slate-800 tracking-tight">Property & Terms</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-5">
                      <div className="col-span-2 space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Building</label>
                          <select value={buildingId} onChange={(e) => {setBuildingId(e.target.value); setUnitName(''); setRentValue(0);}} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none text-sm font-bold text-slate-900 shadow-sm">
                              <option value="">Select Building...</option>
                              {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                          </select>
                      </div>
                      <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Unit</label>
                          <select value={unitName} onChange={(e) => setUnitName(e.target.value)} disabled={!buildingId} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none text-sm font-bold text-slate-900 disabled:bg-slate-50 shadow-sm">
                              <option value="">Select Unit...</option>
                              {buildings.find(b => b.id === buildingId)?.units.map(u => <option key={u.name} value={u.name}>{u.name}</option>)}
                          </select>
                      </div>
                      <InputField label="Total Yearly Rent" value={rentValue} setter={setRentValue} prefix="SAR" />
                  </div>

                  <div className="flex items-center gap-3 mb-2 pt-6 border-t border-slate-100/50">
                      <div className="p-2 bg-purple-50 text-purple-600 rounded-xl"><CalendarClock size={20} /></div>
                      <h3 className="text-lg font-black text-slate-800 tracking-tight">Duration & Schedule</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-5">
                      <InputField label="Duration (Mo)" value={periodMonths} setter={setPeriodMonths} />
                      <InputField label="From Date" value={fromDate} setter={setFromDate} type="date" />
                      <InputField label="To Date" value={toDate} readonly={true} type="date" />
                      <div className="col-span-3 pt-2">
                         <InputField label="Installments (No. of payments)" value={installmentCount} setter={setInstallmentCount} />
                      </div>
                  </div>
              </div>

              <div className="bg-slate-50/80 backdrop-blur-sm rounded-3xl p-8 border border-slate-200 shadow-inner">
                   <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200/50">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Calculator size={20} /></div>
                      <h3 className="text-lg font-black text-slate-800 tracking-tight">Financial Breakdown</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-x-5 gap-y-5">
                      <InputField label="Water Fee (Total)" value={waterFee} setter={setWaterFee} prefix="SAR" />
                      
                      <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Office Charge (2.5%)</label>
                          <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">SAR</span>
                              <input type="number" value={officeFeeAmount} readOnly className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl outline-none text-sm font-bold text-slate-500 shadow-sm" />
                          </div>
                      </div>
                      
                      <InputField label="Insurance" value={insuranceFee} setter={setInsuranceFee} prefix="SAR" />
                      <InputField label="Service Fee" value={serviceFee} setter={setServiceFee} prefix="SAR" />
                      <InputField label="Other Fees (+)" value={otherAmount} setter={setOtherAmount} prefix="SAR" />
                      <InputField label="Deduction (-)" value={otherDeduction} setter={setOtherDeduction} prefix="SAR" />

                      <div className="col-span-2 mt-6 bg-slate-900 p-6 rounded-2xl text-white shadow-2xl shadow-slate-400/50 relative overflow-hidden group">
                          <div className="flex justify-between items-center mb-4 relative z-10">
                             <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Value</span>
                             <div className="text-3xl font-black tracking-tight">{totalValue.toLocaleString()} <span className="text-lg font-medium text-slate-400">SAR</span></div>
                          </div>
                          <div className="pt-4 border-t border-slate-700/50 grid grid-cols-2 gap-6 relative z-10">
                              <div>
                                  <div className="text-[10px] text-emerald-400 uppercase font-black mb-1">1st Installment</div>
                                  <div className="text-xl font-bold text-white">{firstInstallment.toLocaleString()}</div>
                                  <div className="text-[9px] text-slate-400 mt-0.5">Rent/N + Water/N + All Fees</div>
                              </div>
                              <div>
                                  <div className="text-[10px] text-blue-400 uppercase font-black mb-1">Other Installments</div>
                                  <div className="text-xl font-bold text-white">{otherInstallment.toLocaleString()}</div>
                                  <div className="text-[9px] text-slate-400 mt-0.5">Rent/N + Water/N</div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
           </div>

           <div className="pt-8 border-t border-slate-100/50 flex justify-end gap-4">
              <button type="button" onClick={resetForm} className="px-8 py-4 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">Reset Form</button>
              <button type="submit" disabled={loading} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-lg font-bold px-12 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all flex items-center gap-3">
                  {loading ? <RefreshCw className="animate-spin" /> : <Save />} Save Contract
              </button>
           </div>
           
           {success && (
              <div className="fixed bottom-10 right-10 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl animate-slideUp font-bold flex items-center gap-3 z-50">
                  <CheckCircle className="text-emerald-200" /> {success}
              </div>
           )}
        </form>
      ) : (
        <div className="glass-panel border-t-0 rounded-b-3xl shadow-xl p-0 overflow-hidden animate-slideUp min-h-[500px]">
           <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <Search size={18} className="text-slate-400" />
              <input type="text" placeholder="Search contracts..." className="bg-transparent border-none outline-none text-sm font-medium w-full" />
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead>
                 <tr className="bg-slate-50/80 border-b border-slate-200">
                    <th className="px-6 py-4 font-black text-slate-400 text-[10px] uppercase">Contract #</th>
                    <th className="px-6 py-4 font-black text-slate-400 text-[10px] uppercase">Tenant</th>
                    <th className="px-6 py-4 font-black text-slate-400 text-[10px] uppercase">Value</th>
                    <th className="px-6 py-4 font-black text-slate-400 text-[10px] uppercase">Progress</th>
                    <th className="px-6 py-4 font-black text-slate-400 text-[10px] uppercase">Status</th>
                    <th className="px-6 py-4 font-black text-slate-400 text-[10px] uppercase text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {existingContracts.map(c => (
                   <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-violet-600">#{c.contractNo}</td>
                      <td className="px-6 py-4">
                          <div className="text-sm font-bold text-slate-800">{c.customerName}</div>
                          <div className="text-[10px] text-slate-500 font-bold">{c.unitName} - {c.buildingName}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-black text-emerald-600">{c.totalValue.toLocaleString()}</td>
                      <td className="px-6 py-4">
                         <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                             {/* Mock progress bar for now */}
                             <div className="h-full bg-indigo-500 w-1/3"></div>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${c.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : (c.status === 'Terminated' ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-rose-50 text-rose-600 border-rose-100')}`}>
                           {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                          <button onClick={(e) => handleRenew(e, c)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100" title="Renew"><RotateCcw size={16}/></button>
                          <button onClick={(e) => handleFinalize(e, c)} className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-rose-50 hover:text-rose-600" title="Finalize / Terminate"><Archive size={16}/></button>
                      </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      )}
    </div>
  );
};

export default ContractForm;
