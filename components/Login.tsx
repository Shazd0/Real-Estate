import React, { useState } from 'react';
import { User } from '../types';
import { mockLogin } from '../services/mockData';
import { Building2, ArrowRight, Lock, User as UserIcon } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const user = await mockLogin(id, password);
      if (user) {
        if(user.status === 'Inactive') {
            setError('Account is inactive. Contact Admin.');
        } else {
            onLogin(user);
        }
      } else {
        setError('Invalid ID or Password');
      }
    } catch (e) {
      setError('System error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
         <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-500/20 blur-3xl animate-pulse"></div>
         <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] rounded-full bg-gradient-to-tr from-blue-400/20 to-indigo-500/20 blur-3xl"></div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl max-w-md w-full rounded-3xl shadow-2xl border border-white/50 overflow-hidden z-10">
        <div className="bg-slate-900 p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
             <Building2 size={200} className="text-white transform translate-x-10 translate-y-10" />
          </div>
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-emerald-900/50 relative z-10 transform rotate-3">
             <Building2 size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white relative z-10 tracking-tight">Al-Amlak</h1>
          <p className="text-slate-400 text-sm mt-2 relative z-10 font-medium uppercase tracking-widest">Management System</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">User ID</label>
              <div className="relative group">
                 <UserIcon className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                 <input 
                    type="text" 
                    required
                    value={id}
                    onChange={e => setId(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all font-medium text-slate-800"
                    placeholder="Enter ID"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all font-medium text-slate-800"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="text-rose-600 text-sm bg-rose-50 p-4 rounded-xl text-center font-bold border border-rose-100 animate-shake">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 transform hover:-translate-y-0.5"
            >
              {loading ? 'Verifying...' : 'Access Dashboard'}
              {!loading && <ArrowRight size={20} className="text-emerald-400" />}
            </button>
            
            <div className="text-center mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-2">Demo Credentials</p>
              <div className="flex justify-center gap-4 text-xs text-slate-600 font-mono">
                 <span>Admin: admin / admin</span>
                 <span>Staff: emp01 / 123</span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;