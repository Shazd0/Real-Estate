

import React, { useState, useEffect } from 'react';
import { Vendor } from '../types';
import { getVendors, saveVendor, deleteVendor } from '../services/mockData';
import { Briefcase, Plus, Phone, Trash2, Search } from 'lucide-react';

const VendorManager: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<Vendor>({
      id: '',
      name: '',
      serviceType: '',
      phone: '',
      notes: ''
  });

  useEffect(() => {
    setVendors(getVendors());
  }, []);

  const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      const newVendor = {
          ...formData,
          id: formData.id || crypto.randomUUID()
      };
      saveVendor(newVendor);
      setVendors(getVendors());
      setIsFormOpen(false);
      setFormData({ id: '', name: '', serviceType: '', phone: '', notes: '' });
  };

  const handleDelete = (id: string) => {
      if(confirm('Delete this vendor?')) {
          deleteVendor(id);
          setVendors(getVendors());
      }
  };

  const filtered = vendors.filter(v => v.name.toLowerCase().includes(searchTerm.toLowerCase()) || v.serviceType.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-white/20 min-h-[600px] animate-fadeIn">
       <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-white">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-200">
                <Briefcase className="text-white" size={24} /> 
            </div>
            Vendor Database
            </h2>
            <p className="text-slate-500 text-sm mt-1 ml-14">Manage Suppliers, Plumbers, Electricians</p>
        </div>
        <button 
            onClick={() => setIsFormOpen(true)}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
        >
            <Plus size={18} /> Add Vendor
        </button>
      </div>

      <div className="p-6">
          {isFormOpen && (
              <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 animate-slideUp">
                  <h3 className="font-bold text-slate-700 mb-4">Add / Edit Vendor</h3>
                  <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input 
                        type="text" required placeholder="Name / Company" 
                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                        className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input 
                        type="text" required placeholder="Service Type (e.g. Plumber)" 
                        value={formData.serviceType} onChange={e => setFormData({...formData, serviceType: e.target.value})}
                        className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input 
                        type="text" required placeholder="Phone Number" 
                        value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input 
                        type="text" placeholder="Notes (Optional)" 
                        value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
                        className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <div className="col-span-2 flex gap-2 justify-end mt-2">
                          <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-200 rounded-lg">Cancel</button>
                          <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">Save</button>
                      </div>
                  </form>
              </div>
          )}

          <div className="mb-6 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
                type="text" 
                placeholder="Search vendors..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(v => (
                  <div key={v.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group relative">
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleDelete(v.id)} className="text-slate-300 hover:text-red-500">
                              <Trash2 size={16} />
                          </button>
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                             {v.serviceType.toLowerCase().includes('plumb') ? '🔧' : v.serviceType.toLowerCase().includes('elect') ? '⚡' : '🛠️'}
                          </div>
                          <div>
                              <h4 className="font-bold text-slate-800">{v.name}</h4>
                              <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider">{v.serviceType}</p>
                          </div>
                      </div>
                      <div className="text-sm text-slate-600 flex items-center gap-2 bg-slate-50 p-2 rounded-lg mb-2">
                          <Phone size={14} className="text-slate-400" /> {v.phone}
                      </div>
                      {v.notes && <p className="text-xs text-slate-400 italic">{v.notes}</p>}
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};

export default VendorManager;