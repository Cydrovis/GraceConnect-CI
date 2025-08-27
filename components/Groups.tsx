

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { UserGroupIcon, PlusIcon, UsersIcon, CalendarDaysIcon, UserCircleIcon, XMarkIcon, TrashIcon, DocumentArrowDownIcon, ChevronDownIcon } from './icons/HeroIcons';
import { Group, Member, BureauMember } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ConfirmationModal from './ConfirmationModal';

// Modal for managing group members
const ManageGroupModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (groupId: string, memberIds: string[], bureau: BureauMember[]) => void;
    group: Group | null;
    allMembers: Member[];
}> = ({ isOpen, onClose, onSave, group, allMembers }) => {
    const [activeTab, setActiveTab] = useState<'members' | 'bureau'>('members');
    const [currentMemberIds, setCurrentMemberIds] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedForAddition, setSelectedForAddition] = useState<Set<string>>(new Set());

    // Bureau state
    const [currentBureau, setCurrentBureau] = useState<BureauMember[]>([]);
    const [newBureauMemberId, setNewBureauMemberId] = useState('');
    const [newBureauFonction, setNewBureauFonction] = useState('');
    
    // Export dropdown state
    const [bureauExportOpen, setBureauExportOpen] = useState(false);
    const bureauExportRef = useRef<HTMLDivElement>(null);
    const [membersExportOpen, setMembersExportOpen] = useState(false);
    const membersExportRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        if (group) {
            setCurrentMemberIds(new Set(group.memberIds));
            setCurrentBureau(group.bureau || []);
            setSelectedForAddition(new Set());
            setSearchTerm('');
            setActiveTab('members');
            setNewBureauMemberId('');
            setNewBureauFonction('');
        }
    }, [group]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (bureauExportRef.current && !bureauExportRef.current.contains(event.target as Node)) {
                setBureauExportOpen(false);
            }
            if (membersExportRef.current && !membersExportRef.current.contains(event.target as Node)) {
                setMembersExportOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [bureauExportRef, membersExportRef]);


    if (!isOpen || !group) return null;

    const groupMembers = allMembers.filter(m => currentMemberIds.has(m.id));
    
    const availableMembers = allMembers
        .filter(m => !currentMemberIds.has(m.id))
        .filter(m => `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()));

    const removeMember = (memberId: string) => {
        if (memberId === group.leaderId) {
            alert("Le responsable ne peut pas être retiré du département.");
            return;
        }
        if (currentBureau.some(b => b.memberId === memberId)) {
            alert("Ce membre fait partie du bureau. Veuillez d'abord le retirer du bureau avant de le retirer du département.");
            return;
        }
        const newIds = new Set(currentMemberIds);
        newIds.delete(memberId);
        setCurrentMemberIds(newIds);
    };

    const handleSave = () => {
        onSave(group.id, Array.from(currentMemberIds), currentBureau);
    };

    const handleToggleSelection = (memberId: string) => {
        setSelectedForAddition(prev => {
            const newSet = new Set(prev);
            if (newSet.has(memberId)) {
                newSet.delete(memberId);
            } else {
                newSet.add(memberId);
            }
            return newSet;
        });
    };

    const handleSelectAllAvailable = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedForAddition(new Set(availableMembers.map(m => m.id)));
        } else {
            setSelectedForAddition(new Set());
        }
    };
    
    const addSelectedMembers = () => {
        setCurrentMemberIds(prev => {
            const newSet = new Set(prev);
            selectedForAddition.forEach(id => newSet.add(id));
            return newSet;
        });
        setSelectedForAddition(new Set());
    };
    
    const isAllAvailableSelected = availableMembers.length > 0 && availableMembers.every(m => selectedForAddition.has(m.id));

    const noAvailableMembersMessage = searchTerm
    ? 'Aucun membre ne correspond à votre recherche.'
    : allMembers.length === groupMembers.length
        ? 'Tous les membres sont déjà dans ce département.'
        : 'Aucun membre à ajouter.';

    // Bureau handlers
    const handleAddBureauMember = () => {
        if (!newBureauMemberId || !newBureauFonction) {
            alert('Veuillez sélectionner un membre et définir une fonction.');
            return;
        }
        const member = allMembers.find(m => m.id === newBureauMemberId);
        if (member) {
            const newBureauMember: BureauMember = {
                memberId: member.id,
                name: `${member.firstName} ${member.lastName}`,
                phone: member.phone,
                fonction: newBureauFonction,
            };
            setCurrentBureau(prev => [...prev, newBureauMember]);
            setNewBureauMemberId('');
            setNewBureauFonction('');
        }
    };
    
    const handleRemoveBureauMember = (memberId: string) => {
        if (memberId === group.leaderId) {
            alert('Le responsable ne peut pas être retiré du bureau.');
            return;
        }
        setCurrentBureau(prev => prev.filter(b => b.memberId !== memberId));
    };

    const handleBureauExport = (format: 'csv' | 'pdf' | 'word') => {
        setBureauExportOpen(false);
        if (!group || currentBureau.length === 0) {
            alert("Le bureau est vide, rien à exporter.");
            return;
        }

        const safeGroupName = group.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const date = new Date().toISOString().split('T')[0];
        const filename = `bureau_${safeGroupName}_${date}`;

        if (format === 'csv') {
            const headers = ['Nom & Prénom', 'Fonction', 'Téléphone'];
            const escapeCsvCell = (cell: string) => `"${cell.replace(/"/g, '""')}"`;
            const rows = currentBureau.map(member => [
                escapeCsvCell(member.name),
                escapeCsvCell(member.fonction),
                escapeCsvCell(member.phone)
            ].join(','));
            const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
            const link = document.createElement("a");
            link.setAttribute("href", encodeURI(csvContent));
            link.setAttribute("download", `${filename}.csv`);
            link.click();
        } else if (format === 'pdf') {
            const doc = new jsPDF();
            doc.text(`Bureau du département: ${group.name}`, 14, 15);
            autoTable(doc, {
                head: [['Nom & Prénom', 'Fonction', 'Téléphone']],
                body: currentBureau.map(m => [m.name, m.fonction, m.phone]),
                startY: 20
            });
            doc.save(`${filename}.pdf`);
        } else if (format === 'word') {
             const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export Bureau</title></head><body><h2>Bureau: ${group.name}</h2>`;
            const tableHeader = '<table><thead><tr><th>Nom & Prénom</th><th>Fonction</th><th>Téléphone</th></tr></thead><tbody>';
            const tableRows = currentBureau.map(m => `<tr><td>${m.name}</td><td>${m.fonction}</td><td>${m.phone}</td></tr>`).join('');
            const footer = '</tbody></table></body></html>';
            const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(header + tableHeader + tableRows + footer);
            const link = document.createElement("a");
            link.href = source;
            link.download = `${filename}.doc`;
            link.click();
        }
    };

    const handleMembersExport = (format: 'csv' | 'pdf' | 'word') => {
        setMembersExportOpen(false);
        if (!group || groupMembers.length === 0) {
            alert("Ce département n'a aucun membre à exporter.");
            return;
        }
    
        const safeGroupName = group.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const date = new Date().toISOString().split('T')[0];
        const filename = `membres_${safeGroupName}_${date}`;
        const membersToExport = groupMembers.map(m => ({
            name: `${m.firstName} ${m.lastName}`,
            phone: m.phone,
            memberType: m.memberType
        }));
    
        if (format === 'csv') {
            const headers = ['Nom & Prénom', 'Téléphone', 'Type'];
            const escapeCsvCell = (cell: string) => `"${cell.replace(/"/g, '""')}"`;
            const rows = membersToExport.map(member => [
                escapeCsvCell(member.name),
                escapeCsvCell(member.phone),
                escapeCsvCell(member.memberType)
            ].join(','));
            const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
            const link = document.createElement("a");
            link.setAttribute("href", encodeURI(csvContent));
            link.setAttribute("download", `${filename}.csv`);
            link.click();
        } else if (format === 'pdf') {
            const doc = new jsPDF();
            doc.text(`Membres du département: ${group.name}`, 14, 15);
            autoTable(doc, {
                head: [['Nom & Prénom', 'Téléphone', 'Type']],
                body: membersToExport.map(m => [m.name, m.phone, m.memberType]),
                startY: 20
            });
            doc.save(`${filename}.pdf`);
        } else if (format === 'word') {
            const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export Membres</title></head><body><h2>Membres: ${group.name}</h2>`;
            const tableHeader = '<table><thead><tr><th>Nom & Prénom</th><th>Téléphone</th><th>Type</th></tr></thead><tbody>';
            const tableRows = membersToExport.map(m => `<tr><td>${m.name}</td><td>${m.phone}</td><td>${m.memberType}</td></tr>`).join('');
            const footer = '</tbody></table></body></html>';
            const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(header + tableHeader + tableRows + footer);
            const link = document.createElement("a");
            link.href = source;
            link.download = `${filename}.doc`;
            link.click();
        }
    };

    const availableForBureau = groupMembers.filter(m => !currentBureau.some(b => b.memberId === m.id));
    const selectedMemberForBureau = allMembers.find(m => m.id === newBureauMemberId);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-theme-card rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-theme-border bg-theme-table-header rounded-t-xl">
                    <h2 className="text-xl font-bold text-theme-text-base">Gérer le département : {group.name}</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-theme-text-muted hover:bg-slate-200"><XMarkIcon className="w-6 h-6" /></button>
                </header>
                <nav className="flex gap-2 p-2 bg-theme-bg border-b border-theme-border">
                     <button onClick={() => setActiveTab('members')} className={`px-4 py-2 text-sm font-semibold rounded-md ${activeTab === 'members' ? 'bg-theme-card shadow' : 'text-theme-text-muted'}`}>Gérer les membres</button>
                     <button onClick={() => setActiveTab('bureau')} className={`px-4 py-2 text-sm font-semibold rounded-md ${activeTab === 'bureau' ? 'bg-theme-card shadow' : 'text-theme-text-muted'}`}>Configurer le bureau</button>
                </nav>
                {activeTab === 'members' && (
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto flex-grow">
                        {/* Members in group */}
                        <div className="flex flex-col space-y-3">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-theme-text-base">Membres actuels ({groupMembers.length})</h3>
                                {groupMembers.length > 0 && (
                                    <div className="relative" ref={membersExportRef}>
                                        <button
                                            onClick={() => setMembersExportOpen(prev => !prev)}
                                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-theme-text-base bg-theme-card border border-theme-border rounded-lg hover:bg-slate-100"
                                        >
                                            <DocumentArrowDownIcon className="w-4 h-4" />
                                            Exporter
                                            <ChevronDownIcon className="w-4 h-4" />
                                        </button>
                                        {membersExportOpen && (
                                            <div className="absolute right-0 mt-2 w-48 bg-theme-card border border-theme-border rounded-md shadow-lg py-1 z-20 ring-1 ring-black ring-opacity-5">
                                                <a href="#" onClick={(e) => { e.preventDefault(); handleMembersExport('pdf'); }} className="block px-4 py-2 text-sm text-theme-text-base hover:bg-slate-100">Exporter en PDF</a>
                                                <a href="#" onClick={(e) => { e.preventDefault(); handleMembersExport('csv'); }} className="block px-4 py-2 text-sm text-theme-text-base hover:bg-slate-100">Exporter en Excel (CSV)</a>
                                                <a href="#" onClick={(e) => { e.preventDefault(); handleMembersExport('word'); }} className="block px-4 py-2 text-sm text-theme-text-base hover:bg-slate-100">Exporter en Word</a>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="bg-theme-bg border border-theme-border rounded-lg p-2 flex-grow overflow-y-auto">
                                {groupMembers.length > 0 ? (
                                    <ul className="divide-y divide-theme-border">
                                        {groupMembers.map(member => (
                                            <li key={member.id} className="p-2 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <img src={member.photoUrl} alt={member.firstName} className="w-8 h-8 rounded-full object-cover" />
                                                    <span className="text-sm font-medium text-theme-text-base">{member.firstName} {member.lastName}</span>
                                                </div>
                                                {member.id !== group.leaderId ? (
                                                    <button onClick={() => removeMember(member.id)} className="text-red-500 hover:text-red-700 text-sm font-semibold">Retirer</button>
                                                ) : (
                                                    <span className="text-xs text-yellow-800 font-semibold px-2 py-1 bg-yellow-100 rounded-full">Responsable</span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-center text-sm text-theme-text-muted p-4">Aucun membre dans ce département.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Available members */}
                        <div className="flex flex-col space-y-3">
                            <h3 className="text-lg font-semibold text-theme-text-base">Ajouter des membres</h3>
                            <input
                                type="text"
                                placeholder="Rechercher pour filtrer..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full"
                            />
                            <div className="bg-theme-bg border border-theme-border rounded-lg p-2 flex-grow overflow-y-auto">
                                {availableMembers.length > 0 ? (
                                    <div>
                                        <div className="px-2 py-1 border-b border-theme-border flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                id="select-all-available"
                                                className="h-4 w-4 text-church-dark-blue rounded border-theme-border focus:ring-church-light-teal"
                                                onChange={handleSelectAllAvailable}
                                                checked={isAllAvailableSelected}
                                            />
                                            <label htmlFor="select-all-available" className="text-sm font-medium text-theme-text-muted cursor-pointer">Tout sélectionner</label>
                                        </div>
                                        <ul className="divide-y divide-theme-border">
                                            {availableMembers.map(member => (
                                                <li key={member.id} className="p-2 flex items-center justify-between">
                                                    <label htmlFor={`add-member-${member.id}`} className="flex items-center gap-3 cursor-pointer w-full">
                                                        <input
                                                            type="checkbox"
                                                            id={`add-member-${member.id}`}
                                                            className="h-4 w-4 text-church-dark-blue rounded border-theme-border focus:ring-church-light-teal"
                                                            checked={selectedForAddition.has(member.id)}
                                                            onChange={() => handleToggleSelection(member.id)}
                                                        />
                                                        <img src={member.photoUrl} alt={member.firstName} className="w-8 h-8 rounded-full object-cover" />
                                                        <span className="text-sm font-medium text-theme-text-base">{member.firstName} {member.lastName}</span>
                                                    </label>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-center text-sm text-theme-text-muted p-4">{noAvailableMembersMessage}</p>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={addSelectedMembers}
                                disabled={selectedForAddition.size === 0}
                                className="w-full bg-green-600 text-white px-4 py-2 rounded-md shadow hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                <PlusIcon className="w-5 h-5"/>
                                Ajouter les membres sélectionnés ({selectedForAddition.size})
                            </button>
                        </div>
                    </div>
                )}
                 {activeTab === 'bureau' && (
                    <div className="p-6 overflow-y-auto flex-grow">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold text-theme-text-base">Membres du bureau ({currentBureau.length})</h3>
                            {currentBureau.length > 0 && (
                                <div className="relative" ref={bureauExportRef}>
                                    <button
                                        onClick={() => setBureauExportOpen(prev => !prev)}
                                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-theme-text-base bg-theme-card border border-theme-border rounded-lg hover:bg-slate-100"
                                    >
                                        <DocumentArrowDownIcon className="w-4 h-4" />
                                        Exporter
                                        <ChevronDownIcon className="w-4 h-4" />
                                    </button>
                                    {bureauExportOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-theme-card border border-theme-border rounded-md shadow-lg py-1 z-20 ring-1 ring-black ring-opacity-5">
                                            <a href="#" onClick={(e) => { e.preventDefault(); handleBureauExport('pdf'); }} className="block px-4 py-2 text-sm text-theme-text-base hover:bg-slate-100">Exporter en PDF</a>
                                            <a href="#" onClick={(e) => { e.preventDefault(); handleBureauExport('csv'); }} className="block px-4 py-2 text-sm text-theme-text-base hover:bg-slate-100">Exporter en Excel (CSV)</a>
                                            <a href="#" onClick={(e) => { e.preventDefault(); handleBureauExport('word'); }} className="block px-4 py-2 text-sm text-theme-text-base hover:bg-slate-100">Exporter en Word</a>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="bg-theme-bg border border-theme-border rounded-lg mb-6">
                           {currentBureau.length > 0 ? (
                            <ul className="divide-y divide-theme-border">
                                {currentBureau.map(bureauMember => (
                                    <li key={bureauMember.memberId} className="p-3 flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-theme-text-base">{bureauMember.name} <span className="font-normal text-theme-text-muted">- {bureauMember.phone}</span></p>
                                            <p className="text-sm text-theme-accent">{bureauMember.fonction}</p>
                                        </div>
                                        {bureauMember.memberId !== group.leaderId ? (
                                            <button onClick={() => handleRemoveBureauMember(bureauMember.memberId)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                                        ) : (
                                            <span className="text-xs text-yellow-800 font-semibold px-2 py-1 bg-yellow-100 rounded-full">Responsable</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                           ) : <p className="text-center text-sm text-theme-text-muted p-4">Le bureau n'est pas encore configuré.</p>}
                        </div>

                        <div className="border-t border-theme-border pt-4">
                             <h3 className="text-lg font-semibold text-theme-text-base mb-2">Ajouter au bureau</h3>
                             <div className="space-y-4 p-4 border border-theme-border rounded-lg bg-theme-bg">
                                <div>
                                    <label className="block text-sm font-medium mb-1">1. Choisir un membre</label>
                                    <select value={newBureauMemberId} onChange={e => setNewBureauMemberId(e.target.value)} className="w-full">
                                        <option value="">-- Sélectionner un membre du département --</option>
                                        {availableForBureau.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <p className="block text-sm font-medium mb-1">2. Numéro</p>
                                    <p className="w-full p-2 border border-theme-border rounded-md bg-theme-table-header text-theme-text-muted">{selectedMemberForBureau?.phone || '...'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">3. Fonction</label>
                                    <input value={newBureauFonction} onChange={e => setNewBureauFonction(e.target.value)} placeholder="Ex: Secrétaire, Trésorier" className="w-full" />
                                </div>
                                <button type="button" onClick={handleAddBureauMember} className="w-full bg-green-600 text-white px-4 py-2 rounded-md shadow hover:bg-green-700 flex items-center justify-center gap-2">
                                   <PlusIcon className="w-5 h-5"/> Ajouter au bureau
                                </button>
                             </div>
                        </div>
                    </div>
                )}
                 <footer className="flex justify-end items-center p-4 bg-theme-table-header rounded-b-xl space-x-3 border-t border-theme-border">
                    <button type="button" onClick={onClose} className="px-4 py-2 border border-theme-border rounded-md text-theme-text-base bg-theme-card hover:bg-slate-100">Annuler</button>
                    <button type="button" onClick={handleSave} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-church-dark-blue hover:bg-blue-900">Enregistrer</button>
                </footer>
            </div>
        </div>
    );
};

// Modal for creating a new group
const CreateGroupModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { name: string; description: string; leaderId: string }) => void;
    members: Member[];
}> = ({ isOpen, onClose, onSave, members }) => {
    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const data = {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            leaderId: formData.get('leaderId') as string,
        };
        if (data.name && data.leaderId) {
            onSave(data);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-theme-card rounded-xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-theme-border bg-theme-table-header rounded-t-xl">
                    <h2 className="text-xl font-bold text-theme-text-base">Créer un nouveau département</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-theme-text-muted hover:bg-slate-200">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </header>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium mb-1">Nom du département</label>
                            <input type="text" name="name" id="name" required className="w-full" placeholder="Ex: Musique, Intercession..." />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
                            <textarea name="description" id="description" rows={3} className="w-full" placeholder="Courte description des objectifs et activités du département."></textarea>
                        </div>
                        <div>
                            <label htmlFor="leaderId" className="block text-sm font-medium mb-1">Responsable</label>
                            <select name="leaderId" id="leaderId" required className="w-full" defaultValue="">
                                <option value="" disabled>-- Choisir un responsable --</option>
                                {members.map(member => (
                                    <option key={member.id} value={member.id}>{member.firstName} {member.lastName}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <footer className="flex justify-end items-center p-4 bg-theme-table-header rounded-b-xl space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-theme-border rounded-md text-theme-text-base bg-theme-card hover:bg-slate-100">
                            Annuler
                        </button>
                        <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-church-dark-blue hover:bg-blue-900">
                            Créer le département
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};


// Card for displaying a single group
const GroupCard: React.FC<{
    group: Group;
    leader?: Member;
    members: Member[];
    onManage: (group: Group) => void;
    onDelete: (group: Group) => void;
}> = ({ group, leader, members, onManage, onDelete }) => {
    const groupMembers = useMemo(() => {
        return group.memberIds.map(id => members.find(m => m.id === id)).filter(Boolean) as Member[];
    }, [group.memberIds, members]);

    return (
        <div className="bg-theme-card rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <div className="p-5 flex-grow">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-theme-accent">{group.name}</h3>
                    <button onClick={() => onDelete(group)} className="p-1 text-theme-text-muted hover:text-red-600 hover:bg-red-50 rounded-full" title="Supprimer le département">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
                <p className="text-sm text-theme-text-muted mt-1 h-10 truncate">{group.description}</p>

                <div className="mt-4 pt-4 border-t border-theme-border">
                    <div className="flex items-center gap-3">
                        <UserCircleIcon className="w-5 h-5 text-theme-text-muted" />
                        <span className="text-sm font-medium text-theme-text-base">Responsable: {leader ? `${leader.firstName} ${leader.lastName}` : 'Non assigné'}</span>
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm text-theme-text-muted">
                    <div className="flex items-center gap-2">
                        <UsersIcon className="w-5 h-5 text-theme-accent" />
                        <span>{group.memberIds.length} Membre(s)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CalendarDaysIcon className="w-5 h-5 text-theme-accent" />
                        <span>{group.activities.length} Activité(s)</span>
                    </div>
                </div>

                <div className="mt-4">
                    <p className="text-xs font-semibold text-theme-text-muted mb-2">Membres :</p>
                    <div className="flex items-center -space-x-2">
                        {groupMembers.slice(0, 5).map(member => (
                            <img key={member.id} src={member.photoUrl} alt={member.firstName} className="w-8 h-8 rounded-full border-2 border-theme-card object-cover" title={`${member.firstName} ${member.lastName}`} />
                        ))}
                        {groupMembers.length > 5 && (
                            <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-theme-card flex items-center justify-center text-xs font-semibold text-theme-text-base">
                                +{groupMembers.length - 5}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="bg-theme-table-header p-3 rounded-b-lg mt-auto">
                <button
                    onClick={() => onManage(group)}
                    className="w-full text-center px-4 py-2 text-sm font-semibold text-theme-accent hover:bg-blue-100 rounded-md transition-colors"
                >
                    Gérer les membres & le bureau
                </button>
            </div>
        </div>
    );
};

interface GroupsProps {
    groups: Group[];
    members: Member[];
    onSaveGroup: (groupData: Omit<Group, 'id' | 'memberIds' | 'activities' | 'bureau'> & { leaderId: string }) => void;
    onUpdateGroupMembers: (groupId: string, memberIds: string[], bureau: BureauMember[]) => void;
    onDeleteGroup: (groupId: string) => void;
}

const Groups: React.FC<GroupsProps> = ({ groups, members, onSaveGroup, onUpdateGroupMembers, onDeleteGroup }) => {
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isManageModalOpen, setManageModalOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);


    const handleOpenManageModal = (group: Group) => {
        setSelectedGroup(group);
        setManageModalOpen(true);
    };

    const handleSaveGroup = (data: Omit<Group, 'id' | 'memberIds' | 'activities' | 'bureau'> & { leaderId: string }) => {
        onSaveGroup(data);
        setCreateModalOpen(false);
    };

    const handleUpdateMembers = (groupId: string, memberIds: string[], bureau: BureauMember[]) => {
        onUpdateGroupMembers(groupId, memberIds, bureau);
        setManageModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-theme-text-base">Gestion des départements / ministères</h2>
                    <p className="mt-1 text-theme-text-muted">Créez, modifiez et gérez les membres de chaque département.</p>
                </div>
                <button
                    onClick={() => setCreateModalOpen(true)}
                    className="bg-church-dark-teal text-white px-4 py-2 rounded-md shadow hover:bg-church-teal transition-colors flex items-center justify-center gap-2 w-full md:w-auto">
                    <PlusIcon className="w-5 h-5" />
                    Nouveau département
                </button>
            </div>

            {groups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.map(group => {
                        const leader = members.find(m => m.id === group.leaderId);
                        return (
                            <GroupCard
                                key={group.id}
                                group={group}
                                leader={leader}
                                members={members}
                                onManage={handleOpenManageModal}
                                onDelete={setGroupToDelete}
                            />
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16 bg-theme-card rounded-lg shadow-md">
                    <UserGroupIcon className="w-16 h-16 mx-auto text-gray-300" />
                    <h3 className="mt-4 text-lg font-semibold text-theme-text-base">Aucun département créé.</h3>
                    <p className="mt-1 text-sm text-theme-text-muted">Commencez par ajouter votre premier département ou ministère.</p>
                </div>
            )}
            
            <CreateGroupModal
                isOpen={isCreateModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSave={handleSaveGroup}
                members={members}
            />

            <ManageGroupModal
                isOpen={isManageModalOpen}
                onClose={() => setManageModalOpen(false)}
                onSave={handleUpdateMembers}
                group={selectedGroup}
                allMembers={members}
            />
            
            <ConfirmationModal
                isOpen={!!groupToDelete}
                onClose={() => setGroupToDelete(null)}
                onConfirm={() => {
                    if(groupToDelete) {
                        onDeleteGroup(groupToDelete.id);
                        setGroupToDelete(null);
                    }
                }}
                title="Supprimer le département"
                message={`Êtes-vous sûr de vouloir supprimer le département "${groupToDelete?.name}" ? Ses membres ne seront pas supprimés mais ne seront plus affectés.`}
            />
        </div>
    );
};

export default Groups;