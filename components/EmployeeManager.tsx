
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { getUsers, saveUser, deleteUser } from '../services/mockData';
import { UserCheck, Plus, Trash2, Edit, Save, X } from 'lucide-react';

const EmployeeManager: React.FC = () => {
  const [employees, setEmployees] = useState<User[]>([]);
  const [view, setView] = useState<'LIST' | 'FORM'>('LIST');
  const [formData, setFormData] = useState<Partial<User>>({
    id: '',
    name: '',
    password: '',
    role: UserRole.EMPLOYEE,
    email: '',
    status: 'Active',
    joinedDate: new Date().toISOString().split('T')[0],
    baseSalary: 0
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = () => {
    setEmployees(getUsers().filter(u => u.role === UserRole.EMPLOYEE));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.name || !formData.password) {
        alert("Please fill all required fields");
        return;
    }

    const newUser: User = {
      ...formData as User,
      role: UserRole.EMPLOYEE // Ensure always employee
    };
    
    saveUser(newUser);
    loadEmployees();
    setView('LIST');
    setFormData({
        id: '', name: '', password: '', role: UserRole.EMPLOYEE, email: '', status: 'Active', joinedDate: new Date().toISOString().split('T')[0], baseSalary: 0
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this employee?')) {
        deleteUser(id);
        loadEmployees();
    }
  };

  const handleEdit = (user: User) => {
    setFormData(user);
    setView('FORM');
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden min-h-[600px] animate-fadeIn">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-violet-50 to-white">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-violet-600 rounded-lg shadow-lg shadow-violet-200">
                <UserCheck className="text-white" size={24} /> 
            </div>
            Employee Management
            </h2>
            <p className="text-slate-500 text-sm mt-1 ml-14">Manage access and team members</p>
        </div>
        
        {view === 'LIST' && (
          <button 
            onClick={() => {
                setFormData({id: '', name: '', password: '', role: UserRole.EMPLOYEE, email: '', status: 'Active', joinedDate: new Date().toISOString().split('T')[0], baseSalary: 0});
                setView('FORM');
            }}
            className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-violet-200 flex items-center gap-2 font-medium transition-all transform hover:-translate-y-0.5"
          >
            <Plus size={18} /> Add Employee
          </button>
        )}
      </div>

      <div className="p-8">
        {view === 'LIST' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map(emp => (
                <div key={emp.id} className="group bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:border-violet-200 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <button onClick={() => handleEdit(emp)} className="p-2 bg-slate-100 hover:bg-violet-50 text-slate-600 hover:text-violet-600 rounded-full transition-colors">
                            <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(emp.id)} className="p-2 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-full transition-colors">
                            <Trash2 size={16} />
                        </button>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
                            {emp.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">{emp.name}</h3>
                            <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-xs font-medium">
                                {emp.status || 'Active'}
                            </span>
                        </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-slate-500">
                        <div className="flex justify-between border-b border-slate-50 pb-2">
                            <span>User ID</span>
                            <span className="font-mono text-slate-700">{emp.id}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-50 pb-2">
                            <span>Salary</span>
                            <span className="font-mono text-emerald-600 font-bold">{emp.baseSalary?.toLocaleString()} SAR</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Joined</span>
                            <span className="text-slate-700">{emp.joinedDate}</span>
                        </div>
                    </div>
                </div>
            ))}
            {employees.length === 0 && (
                <div className="col-span-full text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-medium">No employees found. Click "Add Employee" to start.</p>
                </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto animate-slideUp">
             <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 shadow-inner">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Employee Name</label>
                        <input 
                            type="text" 
                            required 
                            value={formData.name} 
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                            placeholder="Full Name"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Login ID (Username)</label>
                        <input 
                            type="text" 
                            required 
                            value={formData.id} 
                            onChange={e => setFormData({...formData, id: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-violet-500 outline-none"
                            placeholder="e.g. johndoe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Login Password</label>
                        <input 
                            type="text" 
                            required 
                            value={formData.password} 
                            onChange={e => setFormData({...formData, password: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-violet-500 outline-none"
                            placeholder="Secret password"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Email (Optional)</label>
                        <input 
                            type="email" 
                            value={formData.email} 
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-violet-500 outline-none"
                            placeholder="email@company.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Base Salary (SAR)</label>
                        <input 
                            type="number" 
                            min="0"
                            value={formData.baseSalary} 
                            onChange={e => setFormData({...formData, baseSalary: parseFloat(e.target.value)})}
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-violet-500 outline-none"
                            placeholder="0.00"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                        <select 
                            value={formData.status}
                            onChange={e => setFormData({...formData, status: e.target.value as 'Active' | 'Inactive'})}
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-violet-500 outline-none"
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive (Access Revoked)</option>
                        </select>
                    </div>
                </div>

                <div className="flex gap-4 mt-8 pt-6 border-t border-slate-200">
                    <button 
                        type="button"
                        onClick={() => setView('LIST')}
                        className="flex-1 py-3 px-6 rounded-xl border border-slate-300 text-slate-600 font-semibold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                    >
                        <X size={18} /> Cancel
                    </button>
                    <button 
                        type="submit"
                        className="flex-1 py-3 px-6 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 shadow-lg shadow-violet-200 transition-all flex items-center justify-center gap-2"
                    >
                        <Save size={18} /> Save Employee
                    </button>
                </div>
             </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EmployeeManager;
