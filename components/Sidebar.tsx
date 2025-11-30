import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  Users, 
  Settings, 
  LogOut,
  Building,
  UserCheck,
  FileSignature,
  CalendarDays,
  Briefcase,
  ClipboardList,
  PieChart
} from 'lucide-react';
import { User, UserRole } from '../types';

interface SidebarProps {
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onLogout }) => {
  const isAdmin = user.role === UserRole.ADMIN;

  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all mb-2 duration-300 group relative overflow-hidden ${
          isActive 
            ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-200 translate-x-1' 
            : 'text-slate-500 hover:bg-white hover:shadow-md hover:text-primary-600 hover:translate-x-1'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={20} className={`relative z-10 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary-500'}`} />
          <span className="relative z-10 font-bold text-sm tracking-wide">{label}</span>
          {!isActive && <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity z-0" />}
        </>
      )}
    </NavLink>
  );

  return (
    <div className="w-72 h-screen flex flex-col fixed left-0 top-0 z-30 font-sans glass-panel border-r-0 shadow-2xl shadow-slate-300/50">
      <div className="p-8 pb-6 flex items-center gap-4">
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-3 rounded-2xl shadow-xl shadow-primary-300 transform rotate-3">
          <Building className="text-white h-7 w-7" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Al-Amlak</h1>
          <p className="text-[10px] font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-2 py-0.5 rounded-full inline-block mt-1">Premium</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-2 custom-scrollbar">
        <div className="mb-3 text-[10px] font-black text-slate-300 uppercase tracking-widest px-4 mt-2">Main Menu</div>
        <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
        <NavItem to="/tasks" icon={ClipboardList} label="My Tasks" />
        <NavItem to="/calendar" icon={CalendarDays} label="Calendar" />
        <NavItem to="/contracts" icon={FileSignature} label="Rent Contract" />
        <NavItem to="/entry" icon={PlusCircle} label="New Entry" />
        <NavItem to="/history" icon={History} label="Transactions" />

        <div className="mb-3 text-[10px] font-black text-slate-300 uppercase tracking-widest px-4 mt-8">Database</div>
        <NavItem to="/customers" icon={Users} label="Customers" />
        <NavItem to="/properties" icon={Building} label="Properties" />
        <NavItem to="/vendors" icon={Briefcase} label="Vendors" />
        
        <div className="mb-3 text-[10px] font-black text-slate-300 uppercase tracking-widest px-4 mt-8">Analytics</div>
        <NavItem to="/reports" icon={PieChart} label="Financial Reports" />

        {isAdmin && (
           <>
             <div className="mb-3 text-[10px] font-black text-slate-300 uppercase tracking-widest px-4 mt-8">Administration</div>
             <NavItem to="/admin/employees" icon={UserCheck} label="Staff Management" />
             <NavItem to="/admin/settings" icon={Settings} label="System Settings" />
           </>
        )}
      </div>

      <div className="p-5 mx-2 mb-2">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 shadow-xl text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
            
            <div className="flex items-center gap-3 mb-3 relative z-10">
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-white font-bold backdrop-blur-md border border-white/10">
                    {user.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-bold truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{user.role}</p>
                </div>
            </div>
            
            <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 text-xs font-bold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 py-2.5 rounded-xl transition-all border border-white/5"
            >
            <LogOut size={14} />
            Sign Out
            </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;