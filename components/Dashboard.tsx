
import React, { useEffect, useState } from 'react';
import { Transaction, TransactionType } from '../types';
import { getTransactions, updateTransactionStatus } from '../services/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, Legend, ResponsiveContainer } from 'recharts';
import { Wallet, TrendingUp, TrendingDown, Bell, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pendingTxs, setPendingTxs] = useState<Transaction[]>([]);

  useEffect(() => {
    const txs = getTransactions();
    setTransactions(txs);
    setPendingTxs(txs.filter(t => t.status === 'PENDING'));
  }, []);

  const handleApprove = (id: string) => {
      updateTransactionStatus(id, 'APPROVED');
      const txs = getTransactions();
      setTransactions(txs);
      setPendingTxs(txs.filter(t => t.status === 'PENDING'));
  };

  const handleReject = (id: string) => {
      if(confirm('Reject and delete this entry?')) {
        updateTransactionStatus(id, 'REJECTED'); // Deletes it in mock logic
        const txs = getTransactions();
        setTransactions(txs);
        setPendingTxs(txs.filter(t => t.status === 'PENDING'));
      }
  };

  // Stats Logic (Only Approved)
  const approved = transactions.filter(t => t.status === 'APPROVED');
  const totalIncome = approved.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = approved.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Approvals Widget */}
      {pendingTxs.length > 0 && (
          <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 shadow-lg shadow-amber-100/50">
              <h3 className="text-amber-800 font-black text-lg flex items-center gap-2 mb-4"><Bell className="animate-bounce"/> Pending Approvals ({pendingTxs.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingTxs.map(t => {
                      const base = t.amount;
                      const net = base + (t.extraAmount || 0) - (t.discountAmount || 0);
                      return (
                          <div key={t.id} className="bg-white p-4 rounded-xl shadow-sm border border-amber-100">
                              <div className="flex justify-between items-start mb-2">
                                  <span className="text-xs font-bold text-slate-500 uppercase">{t.type}</span>
                                  <span className="font-bold text-slate-400 line-through text-xs decoration-red-400 decoration-2">{t.amount.toLocaleString()} Base</span>
                              </div>
                              <div className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-2">
                                  {net.toLocaleString()} <span className="text-xs font-medium text-slate-400">SAR (Net)</span>
                              </div>
                              <p className="text-sm text-slate-600 mb-1">{t.details}</p>
                              <div className="text-xs text-slate-400 mb-3">By: {t.createdByName}</div>
                              
                              <div className="flex flex-col gap-1 mb-3 text-[10px] font-bold">
                                  {t.extraAmount ? <span className="text-blue-600">+ {t.extraAmount} Extra</span> : null}
                                  {t.discountAmount ? <span className="text-emerald-600">- {t.discountAmount} Discount</span> : null}
                              </div>

                              <div className="flex gap-2 mt-2">
                                  <button onClick={() => handleApprove(t.id)} className="flex-1 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-200">Approve</button>
                                  <button onClick={() => handleReject(t.id)} className="flex-1 py-2 bg-rose-100 text-rose-700 rounded-lg text-xs font-bold hover:bg-rose-200">Reject</button>
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-200">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-100">Total Income</p>
            <h3 className="text-3xl font-black mt-2">{totalIncome.toLocaleString()} SAR</h3>
        </div>
        <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-xl shadow-rose-200">
            <p className="text-xs font-bold uppercase tracking-wider text-rose-100">Total Expenses</p>
            <h3 className="text-3xl font-black mt-2">{totalExpense.toLocaleString()} SAR</h3>
        </div>
        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-xl shadow-indigo-200">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-100">Net Profit</p>
            <h3 className="text-3xl font-black mt-2">{(totalIncome - totalExpense).toLocaleString()} SAR</h3>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
