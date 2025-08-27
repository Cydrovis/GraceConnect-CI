import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CurrencyDollarIcon, ArrowUpCircleIcon, ArrowDownCircleIcon, PlusIcon, PencilIcon, TrashIcon, ReceiptRefundIcon, XMarkIcon, DocumentArrowDownIcon, ChevronDownIcon, MagnifyingGlassIcon, EllipsisVerticalIcon } from './icons/HeroIcons';
import { Transaction, Member } from '../types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useChurch, useUI } from '../contexts';

const findMemberById = (id: string, members: Member[]): Member | undefined => members.find(m => m.id === id);

const getCategoryChip = (category: Transaction['category']) => {
    const baseClasses = 'px-2 py-0.5 text-xs font-semibold rounded-full inline-block';
    switch (category) {
        case 'Dîme': return `${baseClasses} bg-green-100 text-green-800`;
        case 'Offrande': return `${baseClasses} bg-lime-100 text-lime-800`;
        case 'Quête': return `${baseClasses} bg-cyan-100 text-cyan-800`;
        case 'Don spécial': return `${baseClasses} bg-emerald-100 text-emerald-800`;
        case 'Contribution projet': return `${baseClasses} bg-teal-100 text-teal-800`;
        case 'Salaire': return `${baseClasses} bg-red-100 text-red-800`;
        case 'Facture': return `${baseClasses} bg-orange-100 text-orange-800`;
        case 'Construction': return `${baseClasses} bg-amber-100 text-amber-800`;
        default: return `${baseClasses} bg-gray-200 text-gray-700`;
    }
};


const TransactionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (transaction: Omit<Transaction, 'receiptGenerated'> & { id?: string }) => void;
    members: Member[];
    transactionToEdit?: Transaction | null;
    initialType?: 'income' | 'expense';
    currency: string;
}> = ({ isOpen, onClose, onSave, members, transactionToEdit, initialType = 'income', currency }) => {
    const isEditMode = !!transactionToEdit;
    const type = isEditMode ? transactionToEdit.type : initialType;
    
    const incomeCategories: Transaction['category'][] = ['Dîme', 'Offrande', 'Quête', 'Don spécial', 'Contribution projet', 'Autre revenu'];
    const expenseCategories: Transaction['category'][] = ['Facture', 'Salaire', 'Construction', 'Autre dépense'];
    
    const [selectedCategory, setSelectedCategory] = useState<Transaction['category']>(
        transactionToEdit?.category || (type === 'income' ? incomeCategories[0] : expenseCategories[0])
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const transactionData: Omit<Transaction, 'receiptGenerated'> & {id?: string} = {
            id: transactionToEdit?.id,
            date: formData.get('date') as string,
            type: type,
            category: formData.get('category') as Transaction['category'],
            amount: parseFloat(formData.get('amount') as string),
            description: formData.get('description') as string,
            memberId: formData.get('memberId') as string || undefined,
            period: type === 'income' ? (formData.get('period') as string || undefined) : undefined,
            categoryDetail: formData.get('categoryDetail') as string || undefined,
        };
        if (transactionData.date && transactionData.category && !isNaN(transactionData.amount)) {
            onSave(transactionData);
        }
    };
    
    return (
        <div className={`fixed inset-0 bg-black bg-opacity-60 z-50 justify-center items-center p-4 ${isOpen ? 'flex' : 'hidden'}`} onClick={onClose}>
            <div className="bg-theme-card rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-theme-border bg-theme-table-header rounded-t-xl">
                    <h2 className="text-xl font-bold text-theme-text-base">{isEditMode ? 'Modifier la transaction' : (type === 'income' ? 'Nouvelle Entrée' : 'Nouvelle Dépense')}</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-theme-text-muted hover:bg-slate-200"><XMarkIcon className="w-6 h-6" /></button>
                </header>
                <form key={transactionToEdit?.id || 'new'} onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="date" className="block text-sm font-medium mb-1">Date de la transaction</label>
                                <input type="date" name="date" id="date" defaultValue={transactionToEdit?.date || new Date().toISOString().substring(0, 10)} required className="w-full" />
                            </div>
                            <div>
                                <label htmlFor="amount" className="block text-sm font-medium mb-1">Montant ({currency})</label>
                                <input type="number" name="amount" id="amount" step="0.01" required placeholder="0.00" defaultValue={transactionToEdit?.amount} className="w-full" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium mb-1">Catégorie</label>
                            <select name="category" id="category" required value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value as Transaction['category'])} className="w-full">
                                {(type === 'income' ? incomeCategories : expenseCategories).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        {['Autre revenu', 'Autre dépense'].includes(selectedCategory) && (
                             <div>
                                <label htmlFor="categoryDetail" className="block text-sm font-medium mb-1">Préciser</label>
                                <input 
                                    type="text" 
                                    name="categoryDetail" 
                                    id="categoryDetail" 
                                    defaultValue={transactionToEdit?.categoryDetail} 
                                    placeholder="Ex: Vente de gâteaux, collecte spéciale..." 
                                    className="w-full"
                                />
                            </div>
                        )}
                        {type === 'income' && (
                             <>
                                <div>
                                    <label htmlFor="period" className="block text-sm font-medium mb-1">Date Optionnel</label>
                                    <input type="date" name="period" id="period" defaultValue={transactionToEdit?.period} className="w-full" />
                                </div>
                                <div>
                                    <label htmlFor="memberId" className="block text-sm font-medium mb-1">Membre (Optionnel)</label>
                                    <select name="memberId" id="memberId" defaultValue={transactionToEdit?.memberId} className="w-full">
                                        <option value="">-- Anonyme --</option>
                                        {members.map(member => <option key={member.id} value={member.id}>{member.firstName} {member.lastName}</option>)}
                                    </select>
                                </div>
                             </>
                        )}
                         <div>
                            <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
                            <textarea name="description" id="description" rows={3} required defaultValue={transactionToEdit?.description} className="w-full" placeholder="Détails de la transaction..."></textarea>
                        </div>
                    </div>
                    <footer className="flex justify-end items-center p-4 bg-theme-table-header rounded-b-xl space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-theme-border rounded-md text-theme-text-base bg-theme-card hover:bg-slate-100">Annuler</button>
                        <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-church-dark-blue hover:bg-blue-900">Enregistrer</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

const TransactionDetailModal: React.FC<{
    transaction: Transaction | null;
    onClose: () => void;
    onEdit: (t: Transaction) => void;
    onDelete: (id: string) => void;
    members: Member[];
    currency: string;
}> = ({ transaction, onClose, onEdit, onDelete, members, currency }) => {

    const member = useMemo(() => {
        if (!transaction?.memberId) return null;
        return findMemberById(transaction.memberId, members)
    }, [transaction, members]);
    
    if (!transaction) return null;

    const isIncome = transaction.type === 'income';

    const handleEditClick = () => {
        onEdit(transaction);
    };

    const handleDeleteClick = () => {
        onDelete(transaction.id);
    };

    return (
         <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-theme-card rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-theme-border bg-theme-table-header rounded-t-xl">
                    <h2 className="text-xl font-bold text-theme-text-base">Détails de la transaction</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-theme-text-muted hover:bg-slate-200"><XMarkIcon className="w-6 h-6" /></button>
                </header>
                <div className="p-6 space-y-4">
                    <div className="text-center pb-4 border-b border-theme-border">
                        <p className={`text-4xl font-bold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                            {isIncome ? '+' : '-'} {transaction.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {currency}
                        </p>
                        <div className="mt-2 inline-block">
                            <span className={getCategoryChip(transaction.category)}>{transaction.category}</span>
                            {transaction.categoryDetail && <span className="text-sm text-theme-text-muted ml-2">({transaction.categoryDetail})</span>}
                        </div>
                    </div>
                    <div>
                       <p className="text-sm font-medium text-theme-text-muted">Description</p>
                       <p className="text-theme-text-base mt-1">{transaction.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-theme-border">
                         <div>
                            <p className="text-sm font-medium text-theme-text-muted">Date</p>
                            <p className="text-theme-text-base mt-1">{new Date(transaction.date).toLocaleDateString('fr-FR')}</p>
                        </div>
                         {transaction.period && (
                            <div>
                                <p className="text-sm font-medium text-theme-text-muted">Date de référence</p>
                                <p className="text-theme-text-base mt-1">{new Date(transaction.period).toLocaleDateString('fr-FR')}</p>
                            </div>
                        )}
                    </div>
                    {member && (
                       <div className="pt-4 border-t border-theme-border">
                            <p className="text-sm font-medium text-theme-text-muted mb-2">Contributeur</p>
                            <div className="flex items-center gap-3">
                                <img src={member.photoUrl} alt={member.firstName} className="w-10 h-10 rounded-full object-cover" />
                                <span className="font-semibold text-theme-text-base">{member.firstName} {member.lastName}</span>
                            </div>
                       </div>
                    )}
                    <div className="pt-4 border-t border-theme-border">
                        <p className="text-sm font-medium text-theme-text-muted">Reçu généré</p>
                        <p className={`mt-1 font-semibold ${transaction.receiptGenerated ? 'text-green-600' : 'text-theme-text-muted'}`}>
                            {transaction.receiptGenerated ? 'Oui' : 'Non'}
                        </p>
                    </div>
                </div>
                <footer className="flex justify-end items-center p-4 bg-theme-table-header rounded-b-xl space-x-3">
                    <button type="button" onClick={handleDeleteClick} className="px-4 py-2 border border-theme-border rounded-md text-sm text-red-600 bg-theme-card hover:bg-red-50">Supprimer</button>
                    <button type="button" onClick={() => onEdit(transaction)} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm text-white bg-church-dark-blue hover:bg-blue-900">Modifier</button>
                </footer>
            </div>
        </div>
    );
};

const ReceiptModal: React.FC<{
    transaction: Transaction | null;
    onClose: () => void;
    member: Member | null;
    currency: string;
}> = ({ transaction, onClose, member, currency }) => {
    if (!transaction || !member) return null;

    const handleExportJPEG = () => {
        const receiptElement = document.getElementById('receipt-printable-area');
        if (receiptElement) {
            html2canvas(receiptElement, { scale: 2, useCORS: true }).then(canvas => {
                const image = canvas.toDataURL('image/jpeg', 1.0);
                const link = document.createElement('a');
                link.href = image;
                const safeName = `${member.firstName}_${member.lastName}`.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                link.download = `recu_don_${transaction.id.toUpperCase().substring(0, 8)}_${safeName}.jpeg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-theme-card rounded-xl shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <div id="receipt-printable-area" className="p-8 bg-white text-slate-900">
                    <header className="flex justify-between items-start border-b-2 border-gray-800 pb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-church-dark-teal">Grace Connect</h1>
                            <p className="text-gray-600">Reçu Officiel de Don</p>
                        </div>
                        <div className="text-right">
                            <p className="font-semibold text-gray-800">Reçu N°: {transaction.id.toUpperCase().substring(0, 8)}</p>
                            <p className="text-sm text-gray-500">Date: {new Date().toLocaleDateString('fr-FR')}</p>
                        </div>
                    </header>
                    <main className="mt-8 space-y-6">
                        <div className="grid grid-cols-2 gap-8">
                           <div>
                                <p className="text-sm text-gray-500 uppercase tracking-wider">Reçu de</p>
                                <p className="font-semibold text-lg text-gray-800">{member.firstName} {member.lastName}</p>
                                <p className="text-sm text-gray-600">{member.address}</p>
                                <p className="text-sm text-gray-600">{member.email}</p>
                           </div>
                           <div className="bg-gray-100 p-4 rounded-lg text-center flex flex-col justify-center">
                               <p className="text-sm text-gray-500 uppercase tracking-wider">Montant du Don</p>
                               <p className="text-4xl font-bold text-green-600">{transaction.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {currency}</p>
                           </div>
                        </div>
                         <div>
                            <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">Détails de la transaction</p>
                            <table className="w-full text-sm">
                                <tbody>
                                    <tr className="border-b"><td className="py-2 font-medium text-gray-700">Date de transaction</td><td className="py-2 text-right">{new Date(transaction.date).toLocaleDateString('fr-FR')}</td></tr>
                                    <tr className="border-b"><td className="py-2 font-medium text-gray-700">Catégorie</td><td className="py-2 text-right">{transaction.category}{transaction.categoryDetail ? ` (${transaction.categoryDetail})` : ''}</td></tr>
                                    {transaction.period && (<tr className="border-b"><td className="py-2 font-medium text-gray-700">Date de référence</td><td className="py-2 text-right">{new Date(transaction.period).toLocaleDateString('fr-FR')}</td></tr>)}
                                     <tr><td className="py-2 font-medium text-gray-700">Description</td><td className="py-2 text-right">{transaction.description}</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="text-xs text-gray-500 text-center pt-4 border-t mt-8"> Merci pour votre générosité et votre soutien continu. Que Dieu vous bénisse abondamment. </p>
                    </main>
                     <footer className="mt-16 flex justify-end">
                        <div className="w-1/3 text-center"><p className="border-t-2 border-gray-400 pt-2 text-sm text-gray-600">Signature du Trésorier</p></div>
                    </footer>
                </div>
                <div className="p-4 bg-theme-table-header rounded-b-xl flex justify-end gap-3 no-print">
                    <button onClick={onClose} className="btn btn-secondary">Fermer</button>
                    <button onClick={handleExportJPEG} className="btn btn-primary">Exporter JPEG</button>
                </div>
            </div>
        </div>
    );
};

const Card: React.FC<{ title: string; value: string; icon: React.ReactNode; }> = ({ title, value, icon }) => (
    <div className="bg-theme-card p-6 rounded-lg shadow flex items-center justify-between hover:shadow-lg transition-shadow">
      <div>
        <p className="text-sm font-medium text-theme-text-muted">{title}</p>
        <p className="text-3xl font-bold text-theme-text-base mt-1">{value}</p>
      </div>
      <div className="bg-slate-100 p-4 rounded-full">{icon}</div>
    </div>
);

const Finances: React.FC = () => {
    const { currentChurch, handleSaveTransaction, handleDeleteTransaction } = useChurch();
    const { transactions, members, settings } = currentChurch.data;
    const currency = settings.currency || 'FCFA';

    const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
    const [filterDate, setFilterDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [viewingTransaction, setViewingTransaction] = useState<Transaction | null>(null);
    const [receiptTransaction, setReceiptTransaction] = useState<Transaction | null>(null);
    const [creationType, setCreationType] = useState<'income' | 'expense'>('income');
    const [exportOpen, setExportOpen] = useState(false);
    const exportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportRef.current && !exportRef.current.contains(event.target as Node)) setExportOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const { totalIncome, totalExpenses, balance } = useMemo(() => {
        const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        return { totalIncome: income, totalExpenses: expenses, balance: income - expenses };
    }, [transactions]);
    
    const filteredTransactions = useMemo(() => {
        return transactions
            .filter(t => filterType === 'all' || t.type === filterType)
            .filter(t => !filterDate || t.date === filterDate)
            .filter(t => {
                if (!searchTerm) return true;
                const lowerSearchTerm = searchTerm.toLowerCase();
                const descriptionMatch = t.description.toLowerCase().includes(lowerSearchTerm);
                let memberMatch = false;
                if (t.memberId) {
                    const member = findMemberById(t.memberId, members);
                    if (member) memberMatch = `${member.firstName} ${member.lastName}`.toLowerCase().includes(lowerSearchTerm);
                }
                const categoryMatch = t.category.toLowerCase().includes(lowerSearchTerm);
                const categoryDetailMatch = t.categoryDetail ? t.categoryDetail.toLowerCase().includes(lowerSearchTerm) : false;
                return descriptionMatch || memberMatch || categoryMatch || categoryDetailMatch;
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, filterType, filterDate, searchTerm, members]);

    const handleOpenModal = (type: 'income' | 'expense') => {
        setEditingTransaction(null);
        setCreationType(type);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingTransaction(null);
    };
    
    const handleSaveAndClose = (transaction: Omit<Transaction, 'receiptGenerated'> & { id?: string }) => {
        handleSaveTransaction(transaction);
        handleCloseModal();
    };

    const handleEditTransaction = (transaction: Transaction) => {
        setViewingTransaction(null);
        setEditingTransaction(transaction);
        setModalOpen(true);
    };

    const handleDeleteClick = (transactionId: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette transaction ? Cette action est irréversible.")) {
            handleDeleteTransaction(transactionId);
            if (viewingTransaction?.id === transactionId) setViewingTransaction(null);
        }
    };
    
    const handleViewTransaction = (transaction: Transaction) => setViewingTransaction(transaction);

    const handleExport = (format: 'pdf' | 'csv' | 'word') => {
        setExportOpen(false);
        if (filteredTransactions.length === 0) {
            alert("Aucune transaction à exporter pour les filtres actuels.");
            return;
        }

        const dataToExport = filteredTransactions.map(t => {
            const member = t.memberId ? findMemberById(t.memberId, members) : null;
            return {
                date: new Date(t.date).toLocaleDateString('fr-FR'), description: t.description,
                category: t.categoryDetail ? `${t.category} (${t.categoryDetail})` : t.category,
                member: member ? `${member.firstName} ${member.lastName}` : 'Anonyme',
                amountFormatted: `${t.type === 'income' ? '+' : '-'} ${t.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} ${currency}`,
                amountRaw: t.type === 'income' ? t.amount : -t.amount
            };
        });
        const date = new Date().toISOString().split('T')[0];
        const filename = `transactions_${date}`;

        if (format === 'pdf') {
            const doc = new jsPDF();
            doc.text("Rapport des Transactions", 14, 15);
            autoTable(doc, {
                head: [['Date', 'Description', 'Catégorie', 'Membre', 'Montant']],
                body: dataToExport.map(item => [item.date, item.description, item.category, item.member, item.amountFormatted]),
                startY: 20
            });
            doc.save(`${filename}.pdf`);
        } else if (format === 'csv') {
            const headers = ['Date', 'Description', 'Catégorie', 'Membre', 'Montant'];
            const escapeCsvCell = (cell: string) => `"${cell.replace(/"/g, '""')}"`;
            const rows = dataToExport.map(item => [escapeCsvCell(item.date), escapeCsvCell(item.description), escapeCsvCell(item.category), escapeCsvCell(item.member), escapeCsvCell(String(item.amountRaw))].join(','));
            const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
            const link = document.createElement("a");
            link.setAttribute("href", encodeURI(csvContent));
            link.setAttribute("download", `${filename}.csv`);
            link.click();
        } else if (format === 'word') {
            const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export Transactions</title></head><body><h2>Rapport des Transactions</h2>`;
            const tableHeader = '<table><thead><tr><th>Date</th><th>Description</th><th>Catégorie</th><th>Membre</th><th>Montant</th></tr></thead><tbody>';
            const tableRows = dataToExport.map(item => `<tr><td>${item.date}</td><td>${item.description}</td><td>${item.category}</td><td>${item.member}</td><td>${item.amountFormatted}</td></tr>`).join('');
            const footer = '</tbody></table></body></html>';
            const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(header + tableHeader + tableRows + footer);
            const link = document.createElement("a");
            link.href = source;
            link.download = `${filename}.doc`;
            link.click();
        }
    };

    return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-theme-text-base">Gestion des finances</h2>
            <p className="mt-1 text-theme-text-muted">Suivez les entrées, les sorties et générez des rapports.</p>
        </div>
        <div className="flex items-center space-x-2 w-full md:w-auto">
           <button onClick={() => handleOpenModal('income')} className="flex-1 btn btn-success">
                <PlusIcon className="w-5 h-5" />Nouvelle Entrée
            </button>
             <button onClick={() => handleOpenModal('expense')} className="flex-1 btn btn-danger">
                <PlusIcon className="w-5 h-5" />Nouvelle Dépense
            </button>
             <div className="relative" ref={exportRef}>
                <button onClick={() => setExportOpen(prev => !prev)} className="btn btn-secondary">
                    <DocumentArrowDownIcon className="w-5 h-5" /> Exporter <ChevronDownIcon className={`w-4 h-4 transition-transform ${exportOpen ? 'rotate-180' : ''}`} />
                </button>
                {exportOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-theme-card rounded-md shadow-lg py-1 z-20 ring-1 ring-black ring-opacity-5 border border-theme-border">
                        <a href="#" onClick={(e) => { e.preventDefault(); handleExport('pdf'); }} className="block px-4 py-2 text-sm text-theme-text-base hover:bg-slate-100">Exporter en PDF</a>
                        <a href="#" onClick={(e) => { e.preventDefault(); handleExport('csv'); }} className="block px-4 py-2 text-sm text-theme-text-base hover:bg-slate-100">Exporter en Excel (CSV)</a>
                        <a href="#" onClick={(e) => { e.preventDefault(); handleExport('word'); }} className="block px-4 py-2 text-sm text-theme-text-base hover:bg-slate-100">Exporter en Word</a>
                    </div>
                )}
            </div>
        </div>
      </div>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="Recettes Totales" value={`${totalIncome.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} ${currency}`} icon={<ArrowUpCircleIcon className="w-8 h-8 text-green-500" />} />
        <Card title="Dépenses Totales" value={`${totalExpenses.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} ${currency}`} icon={<ArrowDownCircleIcon className="w-8 h-8 text-red-500" />} />
        <Card title="Solde Actuel" value={`${balance.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} ${currency}`} icon={<CurrencyDollarIcon className="w-8 h-8 text-blue-500" />} />
      </div>

       <div className="bg-theme-card p-4 rounded-lg shadow-md mt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
            <h3 className="text-lg font-semibold text-theme-text-base">Transactions Récentes</h3>
            <div className="flex items-center gap-2">
                 <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="text-sm" />
                 <div className="relative">
                    <MagnifyingGlassIcon className="w-4 h-4 text-theme-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="text" placeholder="Description, nom, catégorie..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-1.5 text-sm" style={{minWidth: '200px'}}/>
                 </div>
                 <select value={filterType} onChange={e => setFilterType(e.target.value as any)} className="text-sm">
                    <option value="all">Toutes</option><option value="income">Entrées</option><option value="expense">Dépenses</option>
                 </select>
            </div>
          </div>
           <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-theme-text-muted">
                    <thead className="text-xs text-theme-text-base uppercase bg-theme-table-header">
                        <tr>
                            <th scope="col" className="px-6 py-3">Date</th><th scope="col" className="px-6 py-3">Description</th><th scope="col" className="px-6 py-3">Catégorie</th>
                            <th scope="col" className="px-6 py-3 text-right">Montant</th><th scope="col" className="px-6 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions.map((t) => {
                            const member = t.memberId ? findMemberById(t.memberId, members) : null;
                            const isIncome = t.type === 'income';
                            return (
                            <tr key={t.id} className="bg-theme-card border-b border-theme-border hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">{new Date(t.date).toLocaleDateString('fr-FR')}</td>
                                <td className="px-6 py-4 cursor-pointer hover:text-theme-accent transition-colors" onClick={() => handleViewTransaction(t)}>
                                    <p className="font-medium text-theme-text-base">{t.description}</p>
                                    {member && <p className="text-xs text-theme-text-muted">De: {member.firstName} {member.lastName}</p>}
                                    {t.period && <p className="text-xs text-theme-text-muted mt-1">Date réf.: {new Date(t.period).toLocaleDateString('fr-FR')}</p>}
                                </td>
                                <td className="px-6 py-4"><span className={getCategoryChip(t.category)}>{t.category}</span>{t.categoryDetail && <span className="text-xs text-theme-text-muted block italic">({t.categoryDetail})</span>}</td>
                                <td className={`px-6 py-4 text-right font-bold ${isIncome ? 'text-green-600' : 'text-red-600'}`}> {isIncome ? '+' : '-'} {t.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {currency}</td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button onClick={() => { handleEditTransaction(t); }} className="p-2 text-theme-text-muted hover:text-blue-600 rounded-full hover:bg-slate-100" title="Modifier">
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                        {isIncome && t.memberId && (
                                            <button onClick={() => { setReceiptTransaction(t); }} className="p-2 text-theme-text-muted hover:text-green-600 rounded-full hover:bg-slate-100" title="Générer un reçu">
                                                <ReceiptRefundIcon className="w-5 h-5" />
                                            </button>
                                        )}
                                        <button onClick={() => { handleDeleteClick(t.id); }} className="p-2 text-theme-text-muted hover:text-red-600 rounded-full hover:bg-slate-100" title="Supprimer">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )})}
                    </tbody>
                </table>
            </div>
             {filteredTransactions.length === 0 && <p className="text-center text-theme-text-muted py-8">Aucune transaction à afficher pour les filtres sélectionnés.</p>}
      </div>

       <TransactionModal 
            isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSaveAndClose}
            members={members} transactionToEdit={editingTransaction} initialType={creationType}
            currency={currency}
        />
       <TransactionDetailModal
            transaction={viewingTransaction} onClose={() => setViewingTransaction(null)} onEdit={handleEditTransaction}
            onDelete={handleDeleteClick} members={members} currency={currency}
       />
       <ReceiptModal
            transaction={receiptTransaction} onClose={() => setReceiptTransaction(null)}
            member={receiptTransaction ? findMemberById(receiptTransaction.memberId || '', members) : null}
            currency={currency}
        />
    </div>
  );
};

export default Finances;