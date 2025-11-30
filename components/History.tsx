
import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, User, UserRole, Contract, ExpenseCategory } from '../types';
import { getTransactions, getUsers, deleteTransaction, getContracts, getCustomers } from '../services/mockData';
import { Filter, Download, Search, Edit2, AlertOctagon, ChevronDown, AlertTriangle, Trash2, Printer, MessageCircle, Home, Clock, CheckCircle } from 'lucide-react';
import { CSVLink } from 'react-csv';
import { useNavigate } from 'react-router-dom';

interface HistoryProps {
  currentUser: User;
}

const History: React.FC<HistoryProps> = ({ currentUser }) => {
  const [data, setData] = useState<Transaction[]>([]);
  const [filteredData, setFilteredData] = useState<Transaction[]>([]);
  
  useEffect(() => { loadData(); }, []);

  const loadData = () => {
    setData(getTransactions());
  };

  useEffect(() => {
    let result = data;
    // Filtering logic (same as before)
    // ...
    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setFilteredData(result);
  }, [data]);

  const handleDelete = (tx: Transaction) => {
      if(confirm('Delete transaction?')) {
          deleteTransaction(tx.id);
          loadData();
      }
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col h-[calc(100vh-160px)] animate-fadeIn">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-3xl">
        <h2 className="text-xl font-bold text-slate-800">Transaction History</h2>
        {/* Filters would go here */}
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="bg-white sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Category / Details</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-right">Amount</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-600">{row.date}</td>
                    <td className="px-6 py-4">
                        {row.status === 'PENDING' ? (
                            <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-[10px] font-black uppercase flex items-center gap-1 w-fit"><Clock size={10}/> Pending</span>
                        ) : (
                            <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-[10px] font-black uppercase flex items-center gap-1 w-fit"><CheckCircle size={10}/> Approved</span>
                        )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                        {row.type === TransactionType.INCOME && row.unitNumber && (
                             <div className="mb-1"><span className="bg-slate-800 text-white px-2 py-0.5 rounded text-xs font-bold">Unit {row.unitNumber}</span></div>
                        )}
                        <div className="font-bold">{row.expenseCategory || 'Income'}</div>
                        <div className="text-xs text-slate-400">{row.details}</div>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-slate-800">
                        {row.amount.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">SAR</span>
                        {row.discountAmount ? <div className="text-[10px] text-emerald-500 font-bold">(-{row.discountAmount} Disc)</div> : null}
                    </td>
                    <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDelete(row)} className="text-slate-400 hover:text-red-600"><Trash2 size={16}/></button>
                    </td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default History;