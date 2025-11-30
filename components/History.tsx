
import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, User, UserRole, TransactionType, ExpenseCategory, PaymentMethod } from '../types';
import { getTransactions, deleteTransaction, updateTransactionStatus, getContracts, getCustomers } from '../services/mockData';
import { Filter, Download, Search, Edit2, AlertOctagon, ChevronDown, AlertTriangle, Trash2, Printer, MessageCircle, Home, X, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HistoryProps {
  currentUser: User;
}

const History: React.FC<HistoryProps> = ({ currentUser }) => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const [filterMethod, setFilterMethod] = useState('ALL');
    
    // Deletion State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);

    // Load Data
    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setTransactions(getTransactions());
    };

    const handleEdit = (tx: Transaction) => {
        navigate('/entry', { state: { transaction: tx } });
    };

    const handleDeleteStart = (tx: Transaction) => {
        setTxToDelete(tx);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = () => {
        if (txToDelete) {
            deleteTransaction(txToDelete.id);
            loadData();
            setShowDeleteModal(false);
            setTxToDelete(null);
        }
    };

    const handlePrintReceipt = (tx: Transaction) => {
        const printWindow = window.open('', 'PRINT', 'height=800,width=800');
        if (!printWindow) return;

        printWindow.document.write(`
          <html>
            <head>
              <title>Receipt ${tx.id.substring(0,8)}</title>
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');
                body { font-family: 'Courier Prime', 'Courier New', Courier, monospace; padding: 40px; }
                .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
                .title { font-size: 24px; font-weight: bold; text-transform: uppercase; }
                .row { display: flex; justify-content: space-between; margin-bottom: 15px; }
                .box { border: 2px solid #000; padding: 15px; margin: 20px 0; font-weight: bold; font-size: 22px; text-align: center; background: #f0f0f0; }
                .footer { margin-top: 50px; display: flex; justify-content: space-around; }
                .sign { border-top: 1px solid #000; width: 250px; text-align: center; padding-top: 10px; font-size: 14px; }
                strong { font-weight: 700; }
                @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="title">Al-Amlak Property Manager</div>
                <div style="font-size: 16px;">RECEIPT VOUCHER / سند قبض</div>
                <div style="margin-top:20px; font-size: 14px;"><strong>Date:</strong> ${tx.date}</div>
                <div style="font-size: 14px;"><strong>Receipt #:</strong> ${tx.id.substring(0,8).toUpperCase()}</div>
              </div>
              <div class="box">AMOUNT RECEIVED: ${tx.amount.toLocaleString('en-US')} SAR</div>
              <div style="line-height: 2.5; font-size: 15px; padding: 0 20px;">
                <div class="row"><span><strong>Received From:</strong> ....................................................................................</span></div>
                <div class="row"><span><strong>For:</strong> ${tx.buildingName || 'N/A'} ${tx.unitNumber ? `- Unit ${tx.unitNumber}` : ''}</span></div>
                <div class="row"><span><strong>Payment Method:</strong> ${tx.paymentMethod} ${tx.bankName ? ` (${tx.bankName})` : ''}</span></div>
                <div class="row"><span><strong>Description:</strong> ${tx.details}</span></div>
                <div class="row"><span><strong>Category:</strong> ${tx.expenseCategory || 'Rent Income'}</span></div>
              </div>
              <div class="footer">
                 <div class="sign">Accountant Signature</div>
                 <div class="sign">Receiver Signature</div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
    };

    const handleWhatsApp = (tx: Transaction) => {
        let mobile = '';
        const contracts = getContracts();
        const customers = getCustomers();
        
        const contract = contracts.find(c => c.id === tx.contractId);
        if (contract) {
             const customer = customers.find(c => c.id === contract.customerId);
             if (customer) mobile = customer.mobileNo;
        }
        
        if (mobile) {
            mobile = mobile.replace(/\D/g, '');
            if (mobile.startsWith('05')) mobile = '966' + mobile.substring(1);
            else if (mobile.startsWith('5')) mobile = '966' + mobile;
            
            const message = `Dear Customer,%0A%0APayment Received: ${tx.amount.toLocaleString()} SAR%0AFor: ${tx.buildingName} - ${tx.unitNumber}%0ADate: ${tx.date}%0A%0AThank you,%0AAl-Amlak Management`;
            window.open(`https://wa.me/${mobile}?text=${message}`, '_blank');
        } else {
            alert('No mobile number found linked to this transaction.');
        }
    };

    // Filter Logic
    const filteredData = useMemo(() => {
        let result = transactions;

        // Role Filter (Staff see own, Admin sees all)
        if (currentUser.role !== UserRole.ADMIN && currentUser.role !== 'MANAGER') {
            result = result.filter(t => t.createdBy === currentUser.id);
        }

        // Search Filter
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(t => 
                t.details.toLowerCase().includes(lower) || 
                t.amount.toString().includes(lower) ||
                (t.buildingName && t.buildingName.toLowerCase().includes(lower)) ||
                (t.unitNumber && t.unitNumber.toLowerCase().includes(lower)) ||
                (t.createdByName && t.createdByName.toLowerCase().includes(lower))
            );
        }

        if (filterType !== 'ALL') {
            result = result.filter(t => t.type === filterType);
        }

        if (filterMethod !== 'ALL') {
            result = result.filter(t => t.paymentMethod === filterMethod);
        }

        return result;
    }, [transactions, searchTerm, filterType, filterMethod, currentUser]);

    // CSV Export
    const handleExportCSV = () => {
        const headers = ["Date", "Type", "Amount", "Category", "Building", "Unit", "Details", "Status", "By"];
        const rows = filteredData.map(t => [
            t.date, t.type, t.amount, t.expenseCategory || 'Rent', 
            t.buildingName || '-', t.unitNumber || '-', t.details, t.status || 'APPROVED', t.createdByName
        ]);
        
        const csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
            
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "transactions.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const canEdit = (tx: Transaction) => {
        if (currentUser.role === UserRole.ADMIN) return true;
        // Staff can edit within 5 days
        const diff = Date.now() - (tx.createdAt || 0);
        return diff < (5 * 24 * 60 * 60 * 1000); 
    };

    return (
        <div className="p-4 sm:p-8 animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col h-[calc(100vh-140px)]">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex flex-col xl:flex-row gap-4 justify-between items-center bg-slate-50/50 rounded-t-3xl">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Filter size={24} className="text-violet-600" />
                        Transaction History
                    </h2>

                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" size={18} />
                            <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none w-48 shadow-sm"
                            />
                        </div>

                        <select value={filterType} onChange={e => setFilterType(e.target.value)}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none shadow-sm cursor-pointer hover:bg-slate-50"
                        >
                            <option value="ALL">All Types</option>
                            <option value={TransactionType.INCOME}>Income</option>
                            <option value={TransactionType.EXPENSE}>Expense</option>
                        </select>

                        <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-900 transition-all shadow-lg">
                            <Download size={16} /> Export
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-white sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Details</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Method</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Amount</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {filteredData.map((row) => {
                                const dueAmount = (row.expectedAmount || 0) - row.amount;
                                const isUnderpaid = row.type === TransactionType.INCOME && dueAmount > 0;
                                const isPending = row.status === 'PENDING';

                                return (
                                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-6 py-4 text-sm text-slate-600 font-mono">{row.date}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wide border ${
                                                row.type === TransactionType.INCOME 
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                                : 'bg-rose-50 text-rose-600 border-rose-100'
                                            }`}>
                                                {row.type}
                                            </span>
                                            {isPending && <div className="mt-1 text-[9px] font-bold text-amber-500 uppercase">Pending Approval</div>}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-700">
                                            {row.unitNumber && (
                                                <div className="mb-1">
                                                    <span className="bg-slate-900 text-amber-400 px-2 py-0.5 rounded text-xs font-black tracking-wide border border-slate-700">
                                                        UNIT {row.unitNumber}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="font-bold text-slate-800">{row.expenseCategory || row.buildingName}</div>
                                            <div className="text-xs text-slate-500 truncate max-w-[200px]">{row.details}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            <div className="font-bold text-xs">{row.paymentMethod}</div>
                                            {row.bankName && <div className="text-[10px] text-violet-600">{row.bankName}</div>}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className={`font-black text-sm ${row.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-slate-800'}`}>
                                                {row.amount.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">SAR</span>
                                            </div>
                                            {isUnderpaid && (
                                                <div className="text-[10px] text-rose-600 font-bold flex items-center justify-end gap-1 mt-1">
                                                    <AlertTriangle size={10} /> Left: {dueAmount.toLocaleString()}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                                             {row.type === TransactionType.INCOME && (
                                                <>
                                                    <button onClick={() => handlePrintReceipt(row)} className="p-2 text-slate-400 hover:text-slate-800 bg-slate-50 rounded-lg hover:bg-slate-200" title="Print"><Printer size={16}/></button>
                                                    <button onClick={() => handleWhatsApp(row)} className="p-2 text-emerald-400 hover:text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100" title="WhatsApp"><MessageCircle size={16}/></button>
                                                </>
                                             )}
                                             {canEdit(row) ? (
                                                <>
                                                    <button onClick={() => handleEdit(row)} className="p-2 text-blue-400 hover:text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100" title="Edit"><Edit2 size={16}/></button>
                                                    <button onClick={() => handleDeleteStart(row)} className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete"><Trash2 size={16}/></button>
                                                </>
                                             ) : (
                                                 <span className="p-2 text-slate-300"><AlertOctagon size={16} /></span>
                                             )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Delete Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-shake">
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Confirm Deletion</h3>
                            <p className="text-slate-500 text-sm mb-6">Are you sure you want to permanently delete this transaction record?</p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50">Cancel</button>
                                <button onClick={handleDeleteConfirm} className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 shadow-lg shadow-rose-200">Delete</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default History;
