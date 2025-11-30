
import React, { useState, useEffect } from 'react';
import { getContracts, getTransactions } from '../services/mockData';
import { Contract, Transaction, TransactionType } from '../types';
import { ChevronLeft, ChevronRight, Calendar, AlertCircle, CheckCircle } from 'lucide-react';

const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  const loadEvents = () => {
    const contracts = getContracts();
    const transactions = getTransactions();
    const loadedEvents: any[] = [];

    // 1. Contract Expiries
    contracts.forEach(c => {
      loadedEvents.push({
        date: c.toDate,
        title: `Exp: #${c.contractNo}`,
        type: 'EXPIRY',
        detail: `${c.unitName} - ${c.customerName}`,
        color: 'bg-rose-100 text-rose-700 border-rose-200'
      });
    });

    // 2. Income Recorded
    transactions.filter(t => t.type === TransactionType.INCOME).forEach(t => {
       loadedEvents.push({
          date: t.date,
          title: `Inc: ${t.amount} SAR`,
          type: 'INCOME',
          detail: t.details || `Unit ${t.unitNumber}`,
          color: 'bg-emerald-100 text-emerald-700 border-emerald-200'
       });
    });

    setEvents(loadedEvents);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    setCurrentDate(newDate);
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 bg-slate-50/50 border border-slate-100"></div>);
    }

    // Days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = events.filter(e => e.date === dateStr);
      const isToday = new Date().toISOString().split('T')[0] === dateStr;

      days.push(
        <div key={day} className={`min-h-[120px] bg-white border border-slate-100 p-2 relative group hover:shadow-lg transition-all ${isToday ? 'ring-2 ring-emerald-500 z-10' : ''}`}>
          <div className="flex justify-between items-start mb-2">
            <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-emerald-600 text-white' : 'text-slate-500 group-hover:bg-slate-100'}`}>
              {day}
            </span>
          </div>
          
          <div className="space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar">
            {dayEvents.map((evt, idx) => (
              <div key={idx} className={`text-[10px] px-1.5 py-1 rounded border ${evt.color} font-bold truncate cursor-help`} title={evt.detail}>
                 {evt.title}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-fadeIn">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
         <div className="flex items-center gap-4">
             <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                 <Calendar size={24} />
             </div>
             <div>
                 <h2 className="text-2xl font-black text-slate-800">
                     {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                 </h2>
                 <p className="text-sm text-slate-500 font-medium">Events & Expiries</p>
             </div>
         </div>
         <div className="flex gap-2">
             <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
                 <ChevronLeft />
             </button>
             <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-sm font-bold bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors">
                 Today
             </button>
             <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
                 <ChevronRight />
             </button>
         </div>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {d}
              </div>
          ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 bg-slate-100 gap-px">
          {renderCalendarDays()}
      </div>

      {/* Legend */}
      <div className="p-4 bg-white border-t border-slate-100 flex gap-6 justify-center">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span> Contract Expired
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Income Received
          </div>
      </div>
    </div>
  );
};

export default CalendarView;
