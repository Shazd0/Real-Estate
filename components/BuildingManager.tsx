
import React, { useState, useEffect } from 'react';
import { Building, BuildingUnit } from '../types';
import { getBuildings, saveBuilding, deleteBuilding } from '../services/mockData';
import { Building as BuildingIcon, Plus, Trash2, Home, Save, Edit2, X, AlertCircle, PlusCircle } from 'lucide-react';

const BuildingManager: React.FC = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [view, setView] = useState<'LIST' | 'EDIT'>('LIST');
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  
  // New Building State
  const [newBuildingName, setNewBuildingName] = useState('');
  
  // Unit Form State
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitRent, setNewUnitRent] = useState<number>(0);

  useEffect(() => {
    loadBuildings();
  }, []);

  const loadBuildings = () => {
    setBuildings(getBuildings());
  };

  const handleAddBuilding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBuildingName.trim()) return;
    
    const newBuilding: Building = {
      id: crypto.randomUUID(),
      name: newBuildingName,
      units: []
    };
    
    saveBuilding(newBuilding);
    setNewBuildingName('');
    loadBuildings();
  };

  const handleDeleteBuilding = (id: string) => {
    if (window.confirm('Are you sure? This will delete the building and all its units.')) {
      deleteBuilding(id);
      loadBuildings();
      if (editingBuilding?.id === id) {
          setView('LIST');
          setEditingBuilding(null);
      }
    }
  };

  const startEdit = (b: Building) => {
    setEditingBuilding({ ...b });
    setView('EDIT');
  };

  const handleAddUnit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingBuilding || !newUnitName.trim()) return;

      const updatedUnits = [...editingBuilding.units, { name: newUnitName, defaultRent: newUnitRent }];
      const updatedBuilding = { ...editingBuilding, units: updatedUnits };
      
      setEditingBuilding(updatedBuilding);
      saveBuilding(updatedBuilding); // Auto-save on add
      setNewUnitName('');
      setNewUnitRent(0);
      loadBuildings(); // Sync main list
  };

  const handleDeleteUnit = (unitName: string) => {
      if (!editingBuilding) return;
      if (!window.confirm(`Delete Unit ${unitName}?`)) return;

      const updatedUnits = editingBuilding.units.filter(u => u.name !== unitName);
      const updatedBuilding = { ...editingBuilding, units: updatedUnits };
      
      setEditingBuilding(updatedBuilding);
      saveBuilding(updatedBuilding);
      loadBuildings();
  };

  return (
    <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-white/20 min-h-[600px] animate-fadeIn">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-white">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-200">
                <BuildingIcon className="text-white" size={24} /> 
            </div>
            Property Management
            </h2>
            <p className="text-slate-500 text-sm mt-1 ml-14">Add Buildings, Shops, and Manage Units</p>
        </div>
        
        {view === 'EDIT' && (
             <button 
             onClick={() => setView('LIST')}
             className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors"
           >
             Back to List
           </button>
        )}
      </div>

      <div className="p-8">
        {view === 'LIST' ? (
          <div className="space-y-8">
             {/* Add Building Bar */}
             <form onSubmit={handleAddBuilding} className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 items-end">
                <div className="flex-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">New Building / Complex Name</label>
                    <input 
                       type="text" 
                       value={newBuildingName}
                       onChange={e => setNewBuildingName(e.target.value)}
                       placeholder="e.g. Olaya Center"
                       className="w-full mt-1 px-4 py-3 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2">
                    <Plus size={20} /> Add Building
                </button>
             </form>

             {/* Buildings Grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {buildings.map(b => (
                    <div key={b.id} onClick={() => startEdit(b)} className="group cursor-pointer bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:border-blue-300 transition-all duration-300 relative">
                        <div className="flex justify-between items-start mb-4">
                             <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                 <BuildingIcon size={24} />
                             </div>
                             <div className="flex gap-2">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteBuilding(b.id); }}
                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                             </div>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">{b.name}</h3>
                        <p className="text-sm text-slate-500 font-medium">{b.units.length} Units / Rooms</p>
                        
                        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity">
                            Manage Units <Edit2 size={12} />
                        </div>
                    </div>
                ))}
             </div>
          </div>
        ) : (
          <div className="animate-slideUp max-w-4xl mx-auto">
             {editingBuilding && (
                 <div className="space-y-8">
                     <div className="flex items-center justify-between">
                         <div>
                             <h3 className="text-xl font-bold text-slate-800">{editingBuilding.name}</h3>
                             <p className="text-slate-500 text-sm">Managing Units & Rents</p>
                         </div>
                         <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-lg font-mono font-bold text-sm">
                             {editingBuilding.units.length} Total Units
                         </div>
                     </div>

                     {/* Add Unit Form */}
                     <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                         <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                             <PlusCircle size={16} className="text-blue-500"/> Add New Unit
                         </h4>
                         <form onSubmit={handleAddUnit} className="flex gap-4 items-end">
                             <div className="flex-[2]">
                                 <label className="text-xs font-bold text-slate-400 mb-1 block">Unit / Room No.</label>
                                 <input 
                                    type="text" 
                                    required
                                    value={newUnitName}
                                    onChange={e => setNewUnitName(e.target.value)}
                                    placeholder="e.g. Flat 101, Shop A"
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                                 />
                             </div>
                             <div className="flex-1">
                                 <label className="text-xs font-bold text-slate-400 mb-1 block">Default Rent (SAR)</label>
                                 <input 
                                    type="number" 
                                    required
                                    min="0"
                                    value={newUnitRent || ''}
                                    onChange={e => setNewUnitRent(parseFloat(e.target.value))}
                                    placeholder="0.00"
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                                 />
                             </div>
                             <button type="submit" className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors">
                                 Add
                             </button>
                         </form>
                     </div>

                     {/* Units Table */}
                     <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                         <table className="w-full text-left">
                             <thead className="bg-slate-50 border-b border-slate-200">
                                 <tr>
                                     <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Unit Name</th>
                                     <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Default Rent</th>
                                     <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                                 </tr>
                             </thead>
                             <tbody className="divide-y divide-slate-100">
                                 {editingBuilding.units.map((u, idx) => (
                                     <tr key={idx} className="hover:bg-slate-50">
                                         <td className="px-6 py-4 text-sm font-bold text-slate-700 flex items-center gap-2">
                                             <Home size={14} className="text-slate-400" /> {u.name}
                                         </td>
                                         <td className="px-6 py-4 text-sm font-medium text-emerald-600">
                                             {u.defaultRent.toLocaleString()} <span className="text-xs text-slate-400">SAR</span>
                                         </td>
                                         <td className="px-6 py-4 text-right">
                                             <button 
                                                onClick={() => handleDeleteUnit(u.name)}
                                                className="text-slate-400 hover:text-red-600 transition-colors p-2"
                                                title="Remove Unit"
                                             >
                                                 <Trash2 size={16} />
                                             </button>
                                         </td>
                                     </tr>
                                 ))}
                                 {editingBuilding.units.length === 0 && (
                                     <tr>
                                         <td colSpan={3} className="px-6 py-12 text-center text-slate-400">
                                             <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
                                             No units added yet. Use the form above.
                                         </td>
                                     </tr>
                                 )}
                             </tbody>
                         </table>
                     </div>
                 </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuildingManager;
