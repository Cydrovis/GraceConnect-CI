
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { PlusIcon, UserIcon, MagnifyingGlassIcon, DocumentArrowDownIcon, PrinterIcon, ChevronDownIcon, XMarkIcon, PencilIcon, TrashIcon, EllipsisVerticalIcon } from './icons/HeroIcons';
import { AppUser } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getActiveRoles, getPrimaryRole } from '../constants';
import ConfirmationModal from './ConfirmationModal';

interface AssignPersonnelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (userIds: string[]) => void;
    allUsers: AppUser[];
    groupName: string;
}

const AssignPersonnelModal: React.FC<AssignPersonnelModalProps> = ({ isOpen, onClose, onSave, allUsers, groupName }) => {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    
    useEffect(() => {
        if (isOpen) {
            setSelectedIds(new Set());
            setSearchTerm('');
        }
    }, [isOpen]);

    const availableUsers = useMemo(() => {
        return allUsers
            .filter(u => {
                if (u.groupeAdministratif === groupName) return false;
                const userActiveRoles = getActiveRoles(u);
                if (userActiveRoles.includes('Administrateur principal')) return false;
                return true;
            })
            .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [allUsers, groupName, searchTerm]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (selectedIds.size === 0) {
            alert("Veuillez sélectionner au moins un utilisateur.");
            return;
        }
        onSave(Array.from(selectedIds));
    };

    const toggleSelection = (userId: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(userId)) {
                newSet.delete(userId);
            } else {
                newSet.add(userId);
            }
            return newSet;
        });
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(new Set(availableUsers.map(u => u.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-xl">
                    <h2 className="text-xl font-bold text-gray-800">Affecter au groupe: {groupName}</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200"><XMarkIcon className="w-6 h-6" /></button>
                </header>
                <div className="p-6 overflow-y-auto">
                    <div className="relative mb-2">
                        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Rechercher un utilisateur..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-church-dark-teal focus:border-church-dark-teal"
                        />
                    </div>
                    <div className="h-64 border rounded-md overflow-y-auto bg-white flex flex-col">
                        <div className="p-2 border-b bg-gray-50 sticky top-0 z-10">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" onChange={handleSelectAll} className="h-4 w-4 text-church-dark-blue rounded border-gray-300 focus:ring-church-light-teal" />
                                <span className="font-medium text-sm">Tout sélectionner</span>
                            </label>
                        </div>
                        <div className="overflow-y-auto flex-grow">
                            {availableUsers.length > 0 ? availableUsers.map(user => (
                                <label key={user.id} className="flex items-center gap-3 p-2 border-b cursor-pointer hover:bg-gray-50">
                                    <input type="checkbox" checked={selectedIds.has(user.id)} onChange={() => toggleSelection(user.id)} className="h-4 w-4 text-church-dark-blue rounded border-gray-300 focus:ring-church-light-teal" />
                                    <img src={user.photoUrl} alt={user.name} className="w-8 h-8 rounded-full" />
                                    <div>
                                        <span>{user.name}</span>
                                        <p className="text-xs text-gray-500">Groupe actuel: {user.groupeAdministratif}</p>
                                    </div>
                                </label>
                            )) : (
                               <p className="text-center text-gray-500 p-4">Aucun utilisateur disponible.</p> 
                            )}
                        </div>
                    </div>
                </div>
                <footer className="flex justify-end items-center p-4 bg-gray-50 rounded-b-xl space-x-3 border-t">
                    <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md">Annuler</button>
                    <button type="button" onClick={handleSave} className="px-4 py-2 border-transparent rounded-md text-white bg-church-dark-blue">Affecter ({selectedIds.size})</button>
                </footer>
            </div>
        </div>
    );
};


interface PersonnelProps {
    users: AppUser[];
    onAddUser: (group: string) => void;
    onEditUser: (user: AppUser) => void;
    onDeleteUser: (userId: string) => void;
    onAssignUsers: (userIds: string[], groupName: string) => void;
}

const Personnel: React.FC<PersonnelProps> = ({ users, onAddUser, onEditUser, onDeleteUser, onAssignUsers }) => {
    const [activeTab, setActiveTab] = useState('ADMINISTRATIF');
    const [searchTerm, setSearchTerm] = useState('');
    const [actionsDropdownOpen, setActionsDropdownOpen] = useState(false);
    const actionsDropdownRef = useRef<HTMLDivElement>(null);
    const [isAssignModalOpen, setAssignModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<AppUser | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (actionsDropdownRef.current && !actionsDropdownRef.current.contains(target)) {
                setActionsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const tabs = ['ADMINISTRATIF', 'DIACONAT', 'ANCIEN', 'PASTEUR PRINCIPAUX', 'RESPONSABLE DE DEPARTEMENT'];
    
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const searchMatch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.identifiant.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.contact.toLowerCase().includes(searchTerm.toLowerCase());

            const tabMatch = user.groupeAdministratif === activeTab;
            
            return searchMatch && tabMatch;
        });
    }, [users, searchTerm, activeTab]);

    
    const handlePrint = () => {
        window.print();
        setActionsDropdownOpen(false);
    }

    const handleExportPDF = () => {
        if (filteredUsers.length === 0) {
            alert("Aucune donnée à exporter.");
            return;
        }

        const doc = new jsPDF({ orientation: 'landscape' });
        doc.setFontSize(16);
        doc.text(`Liste du personnel: ${activeTab}`, 14, 15);

        const tableColumn = ["Nom", "Identifiant", "Rôle", "Département", "Contact", "Date d'adhésion", "Statut Matrimonial", "Statut"];
        const tableRows: any[][] = [];

        filteredUsers.forEach(user => {
            const userData = [
                user.name,
                user.identifiant,
                getPrimaryRole(user),
                user.department,
                user.contact,
                new Date(user.joinDate).toLocaleDateString('fr-FR'),
                user.maritalStatus,
                user.status,
            ];
            tableRows.push(userData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 20,
            theme: 'grid',
            headStyles: { fillColor: [243, 244, 246], textColor: 51 },
        });
        
        const date = new Date().toISOString().split('T')[0];
        doc.save(`personnel_${activeTab.toLowerCase().replace(/ /g, '_')}_${date}.pdf`);
        setActionsDropdownOpen(false);
    };


    const handleExportExcel = () => {
        if (filteredUsers.length === 0) {
            alert("Aucune donnée à exporter.");
            return;
        }

        const usersToExport = filteredUsers;
        const headers = ["Nom", "Identifiant", "Rôle", "Département", "Contact", "Date d'adhésion", "Statut Matrimonial", "Statut"];
        
        const escapeCsvCell = (cell: any) => {
            if (cell === null || cell === undefined) {
                return '';
            }
            const str = String(cell);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        const rows = usersToExport.map(u => [
            escapeCsvCell(u.name),
            escapeCsvCell(u.identifiant),
            escapeCsvCell(getPrimaryRole(u)),
            escapeCsvCell(u.department),
            escapeCsvCell(u.contact),
            escapeCsvCell(new Date(u.joinDate).toLocaleDateString('fr-FR')),
            escapeCsvCell(u.maritalStatus),
            escapeCsvCell(u.status),
        ].join(','));

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        const date = new Date().toISOString().split('T')[0];
        link.setAttribute("download", `personnel_${activeTab.toLowerCase().replace(/ /g, '_')}_${date}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setActionsDropdownOpen(false);
    };

    const handleAssignUsers = (userIds: string[]) => {
        onAssignUsers(userIds, activeTab);
        setAssignModalOpen(false);
    };

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold text-theme-text-base">Gestion du personnel</h1>

            <div className="bg-theme-card rounded-lg shadow-md p-4">
                <div className="border-b border-theme-border">
                    <nav className="-mb-px flex space-x-6 overflow-x-auto">
                        {tabs.map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${ activeTab === tab ? 'border-theme-accent text-theme-accent' : 'border-transparent text-theme-text-muted hover:text-theme-text-base hover:border-slate-300'}`}>
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>
                
                <div className="pt-4">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-theme-text-base">Liste du personnel {activeTab.toLowerCase()}</h2>
                        <div className="flex items-center gap-2 mt-2 md:mt-0">
                            <button onClick={() => setAssignModalOpen(true)} className="btn btn-secondary">
                                <UserIcon className="w-4 h-4"/>
                                Affecter du personnel
                            </button>
                            <button onClick={() => onAddUser(activeTab)} className="btn btn-primary">
                                <PlusIcon className="w-4 h-4"/>
                                Créer un profil
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                        <div className="flex items-center gap-2">
                           <select className="text-sm"><option>10</option></select>
                        </div>
                        <div className="flex items-center gap-2">
                            <label htmlFor="search" className="text-sm font-medium">Recherche:</label>
                            <input id="search" type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="text-sm w-48"/>
                        </div>
                         <div className="relative" ref={actionsDropdownRef}>
                            <button onClick={() => setActionsDropdownOpen(prev => !prev)} className="btn btn-secondary">
                                <DocumentArrowDownIcon className="w-4 h-4" />
                                Actions
                                <ChevronDownIcon className="w-4 h-4" />
                            </button>
                            {actionsDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-theme-card rounded-md shadow-lg py-1 z-20 ring-1 ring-black ring-opacity-5 border border-theme-border">
                                    <a href="#" onClick={(e) => { e.preventDefault(); handlePrint(); }} className="flex items-center gap-2 px-4 py-2 text-sm text-theme-text-base hover:bg-theme-bg"><PrinterIcon className="w-4 h-4" /> Imprimer</a>
                                    <a href="#" onClick={(e) => { e.preventDefault(); handleExportPDF(); }} className="flex items-center gap-2 px-4 py-2 text-sm text-theme-text-base hover:bg-theme-bg"><DocumentArrowDownIcon className="w-4 h-4" /> Exporter en PDF</a>
                                    <a href="#" onClick={(e) => { e.preventDefault(); handleExportExcel(); }} className="flex items-center gap-2 px-4 py-2 text-sm text-theme-text-base hover:bg-theme-bg"><DocumentArrowDownIcon className="w-4 h-4" /> Exporter en Excel</a>
                                </div>
                            )}
                        </div>
                    </div>

                    <div id="personnel-printable-area" className="overflow-x-auto">
                        <h2 className="print-title">Liste du personnel: ${activeTab}</h2>
                         <div className="border border-theme-border rounded-lg">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="text-xs text-theme-text-base uppercase bg-theme-table-header">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Nom</th>
                                        <th className="px-4 py-3 font-semibold">Identifiant</th>
                                        <th className="px-4 py-3 font-semibold">Rôle</th>
                                        <th className="px-4 py-3 font-semibold">Département</th>
                                        <th className="px-4 py-3 font-semibold">Contact</th>
                                        <th className="px-4 py-3 font-semibold">Date d'adhésion</th>
                                        <th className="px-4 py-3 font-semibold">Statut Matrimonial</th>
                                        <th className="px-4 py-3 font-semibold text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map((user) => (
                                            <tr key={user.id} className="hover:bg-theme-bg bg-theme-card">
                                                <td className="px-4 py-2 border-b border-theme-border text-theme-text-base whitespace-nowrap">{user.name}</td>
                                                <td className="px-4 py-2 border-b border-theme-border text-theme-text-base">{user.identifiant}</td>
                                                <td className="px-4 py-2 border-b border-theme-border text-theme-text-base">{getPrimaryRole(user)}</td>
                                                <td className="px-4 py-2 border-b border-theme-border text-theme-text-base">{user.department}</td>
                                                <td className="px-4 py-2 border-b border-theme-border text-theme-text-base">{user.contact}</td>
                                                <td className="px-4 py-2 border-b border-theme-border text-theme-text-base">{new Date(user.joinDate).toLocaleDateString('fr-FR')}</td>
                                                <td className="px-4 py-2 border-b border-theme-border text-theme-text-base">{user.maritalStatus}</td>
                                                <td className="px-4 py-2 border-b border-theme-border text-theme-text-base text-center whitespace-nowrap">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button onClick={() => { onEditUser(user); }} className="p-2 text-theme-text-muted hover:text-blue-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" title="Modifier">
                                                            <PencilIcon className="w-5 h-5" />
                                                        </button>
                                                        <button onClick={() => { setUserToDelete(user); }} className="p-2 text-theme-text-muted hover:text-red-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" title="Supprimer">
                                                            <TrashIcon className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={8} className="text-center py-10 text-theme-text-muted border-b border-theme-border">
                                                Aucun utilisateur trouvé pour cette catégorie.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <AssignPersonnelModal 
                isOpen={isAssignModalOpen}
                onClose={() => setAssignModalOpen(false)}
                onSave={handleAssignUsers}
                allUsers={users}
                groupName={activeTab}
            />
            <ConfirmationModal
                isOpen={!!userToDelete}
                onClose={() => setUserToDelete(null)}
                onConfirm={() => {
                    if (userToDelete) {
                        onDeleteUser(userToDelete.id);
                        setUserToDelete(null);
                    }
                }}
                title="Supprimer le personnel"
                message={`Êtes-vous sûr de vouloir supprimer le profil de ${userToDelete?.name} ? Cette action est irréversible.`}
            />
        </div>
    );
};

export default Personnel;