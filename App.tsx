
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import EntryForm from './components/EntryForm';
import History from './components/History';
import CustomerManager from './components/CustomerManager';
import EmployeeManager from './components/EmployeeManager';
import ContractForm from './components/ContractForm';
import BuildingManager from './components/BuildingManager';
import CalendarView from './components/CalendarView';
import VendorManager from './components/VendorManager';
import TaskManager from './components/TaskManager';
import Reports from './components/Reports';
import { User, UserRole } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  // Check session on load
  useEffect(() => {
    const saved = localStorage.getItem('prop_mgr_session');
    if (saved) {
      setUser(JSON.parse(saved));
    }
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('prop_mgr_session', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('prop_mgr_session');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <HashRouter>
      <div className="flex min-h-screen bg-[#f8fcfb] font-sans text-slate-900">
        <Sidebar user={user} onLogout={handleLogout} />
        
        <main className="flex-1 ml-72 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <header className="mb-8 flex justify-between items-end">
               <div>
                  <h1 className="text-3xl font-black text-slate-800 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                    Welcome back, {user.name.split(' ')[0]}
                  </h1>
                  <p className="text-slate-500 font-medium mt-1">Property Overview & Management Dashboard</p>
               </div>
               <div className="text-right">
                  <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider inline-block">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
               </div>
            </header>

            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/calendar" element={<CalendarView />} />
              <Route path="/entry" element={<EntryForm currentUser={user} />} />
              <Route path="/contracts" element={<ContractForm currentUser={user} />} />
              <Route path="/history" element={<History currentUser={user} />} />
              <Route path="/customers" element={<CustomerManager />} />
              <Route path="/properties" element={<BuildingManager />} />
              <Route path="/vendors" element={<VendorManager />} />
              <Route path="/tasks" element={<TaskManager currentUser={user} />} />
              <Route path="/reports" element={<Reports />} />
              
              {user.role === UserRole.ADMIN && (
                <Route path="/admin/employees" element={<EmployeeManager />} />
              )}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
