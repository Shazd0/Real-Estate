
import React, { useState, useEffect } from 'react';
import { Customer } from '../types';
import { getCustomers, saveCustomer, deleteCustomer } from '../services/mockData';
import { Save, UserPlus, Search, Briefcase, Phone, CreditCard, Trash2 } from 'lucide-react';

const CustomerManager: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [view, setView] = useState<'LIST' | 'FORM'>('LIST');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State matching the updated requirements
  const [formData, setFormData] = useState<Partial<Customer>>({
    nameAr: '',
    nameEn: '',
    nationality: 'Saudi Arabia',
    workAddress: '',
    idNo: '',
    idSource: 'Riyadh',
    idType: 'National ID',
    mobileNo: '',
    isBlacklisted: false,
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const data = getCustomers();
    setCustomers(data);
    setFilteredCustomers(data);
  };

  useEffect(() => {
    if (!searchTerm) {
        setFilteredCustomers(customers);
    } else {
        const lower = searchTerm.toLowerCase();
        setFilteredCustomers(customers.filter(c => 
            (c.nameEn?.toLowerCase() || '').includes(lower) ||
            (c.nameAr || '').includes(lower) ||
            (c.mobileNo || '').includes(lower) ||
            (c.idNo || '').includes(lower) ||
            (c.code || '').toString().includes(lower)
        ));
    }
  }, [searchTerm, customers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCustomer: Customer = {
      ...formData as Customer,
      id: formData.id || crypto.randomUUID(),
      code: formData.code || '0' // Will be overwritten by backend logic if new
    };
    saveCustomer(newCustomer);
    
    // Refresh
    loadData();
    
    setView('LIST');
    setFormData({
        nameAr: '', nameEn: '', nationality: 'Saudi Arabia', workAddress: '', idNo: '', idSource: 'Riyadh', idType: 'National ID', mobileNo: '', isBlacklisted: false, notes: ''
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete customer "${name}"? This cannot be undone.`)) {
        deleteCustomer(id);
        loadData();
    }
  };

  const handleInputChange = (field: keyof Customer, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-white/20 min-h-[600px] animate-fadeIn">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-emerald-50 to-white">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-lg shadow-lg shadow-emerald-200">
                <UserPlus className="text-white" size={24} /> 
            </div>
            {view === 'LIST' ? 'Customer Database' : 'New Customer Profile'}
            </h2>
        </div>
        
        {view === 'LIST' && (
          <button 
            onClick={() => setView('FORM')}
            className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all text-sm font-bold flex items-center gap-2 transform hover:-translate-y-0.5"
          >
            <UserPlus size={18} /> Add Customer
          </button>
        )}
        {view === 'FORM' && (
          <button 
            onClick={() => setView('LIST')}
            className="text-slate-500 hover:text-slate-800 text-sm font-medium px-4 py-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel & Back
          </button>
        )}
      </div>

      <div className="p-6">
        {view === 'LIST' ? (
          <>
            {/* Search Bar */}
            <div className="mb-6 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                    type="text" 
                    placeholder="Filter by Name, ID, Mobile, or Code..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none shadow-sm transition-all"
                />
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-100 shadow-sm">
                <table className="w-full text-left">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider"># Code</th>
                    <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Customer Name</th>
                    <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider">ID Details</th>
                    <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredCustomers.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4 text-sm font-mono text-slate-500">#{c.code}</td>
                        <td className="px-6 py-4">
                            <div className="font-bold text-slate-800">{c.nameEn}</div>
                            <div className="text-xs text-slate-500 font-arabic">{c.nameAr}</div>
                        </td>
                        <td className="px-6 py-4">
                            {c.isBlacklisted ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    Blacklisted
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                    Active
                                </span>
                            )}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                                <CreditCard size={14} className="text-slate-400" />
                                {c.idNo}
                            </div>
                            <div className="text-xs text-slate-400 pl-6">{c.idType}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                                <Phone size={14} className="text-slate-400" />
                                {c.mobileNo}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <button 
                             onClick={() => handleDelete(c.id, c.nameEn)}
                             className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                             title="Delete Customer"
                           >
                              <Trash2 size={16} />
                           </button>
                        </td>
                    </tr>
                    ))}
                    {filteredCustomers.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                No customers found matching "{searchTerm}"
                            </td>
                        </tr>
                    )}
                </tbody>
                </table>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto animate-slideUp">
             
             {/* Info Banner */}
             <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 text-blue-700 text-sm">
                <Briefcase size={20} />
                <p>Customer Code will be generated automatically (Sequence: 1, 2, 3...) upon saving.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Section 1: Identity */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase text-slate-400 tracking-wider mb-2 border-b pb-2">Basic Info</h3>
                    
                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Name (English)</label>
                        <input type="text" required value={formData.nameEn} onChange={e => handleInputChange('nameEn', e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 ring-emerald-500 outline-none transition-all" />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Name (Arabic)</label>
                        <input type="text" required value={formData.nameAr} onChange={e => handleInputChange('nameAr', e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 ring-emerald-500 outline-none text-right font-arabic" dir="rtl" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Nationality</label>
                            <select value={formData.nationality} onChange={e => handleInputChange('nationality', e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg bg-white focus:ring-2 ring-emerald-500 outline-none">
                                <option>Saudi Arabia</option>
                                <option>Egypt</option>
                                <option>Pakistan</option>
                                <option>India</option>
                                <option>Philippines</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-slate-600 mb-1">Mobile No</label>
                             <input type="text" value={formData.mobileNo} onChange={e => handleInputChange('mobileNo', e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 ring-emerald-500 outline-none" />
                        </div>
                    </div>
                    
                    <div>
                         <label className="block text-xs font-bold text-slate-600 mb-1">Work Address</label>
                         <input type="text" value={formData.workAddress} onChange={e => handleInputChange('workAddress', e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 ring-emerald-500 outline-none" />
                    </div>
                </div>

                {/* Section 2: ID Details */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase text-slate-400 tracking-wider mb-2 border-b pb-2">Official ID</h3>

                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">ID Number</label>
                            <input type="text" value={formData.idNo} onChange={e => handleInputChange('idNo', e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 ring-emerald-500 outline-none" placeholder="National ID / Iqama / CR" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">ID Type</label>
                                <select value={formData.idType} onChange={e => handleInputChange('idType', e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg bg-white">
                                    <option>National ID</option>
                                    <option>Iqama</option>
                                    <option>Passport</option>
                                    <option>Commercial Reg (CR)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">ID Source</label>
                                <input type="text" value={formData.idSource} onChange={e => handleInputChange('idSource', e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg" />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <label className="flex items-center gap-3 p-4 border border-red-200 bg-red-50 rounded-lg cursor-pointer transition-colors hover:bg-red-100">
                            <input type="checkbox" checked={formData.isBlacklisted} onChange={e => handleInputChange('isBlacklisted', e.target.checked)} className="w-5 h-5 rounded text-red-600 focus:ring-red-500" />
                            <span className="text-red-700 font-bold">Add to Blacklist</span>
                        </label>
                        <p className="text-xs text-red-400 mt-1 ml-1">Blacklisted customers will be flagged in system.</p>
                    </div>
                </div>
             </div>

             <div className="pt-6 border-t border-slate-100 flex justify-end gap-4">
                 <button type="button" onClick={() => setView('LIST')} className="px-8 py-3 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-50">
                     Cancel
                 </button>
                 <button type="submit" className="px-8 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all flex items-center gap-2">
                     <Save size={18} /> Save Record
                 </button>
             </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CustomerManager;
