
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ClipboardDocumentListIcon, PlusIcon, XMarkIcon, PencilIcon, TrashIcon, UserCircleIcon, MagnifyingGlassIcon, FunnelIcon, DocumentArrowDownIcon, ChevronDownIcon, ArrowPathIcon, EllipsisVerticalIcon } from './icons/HeroIcons';
import { Assignment, Member, Group } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


const findMemberById = (id: string, members: Member[]): Member | undefined => members.find(m => m.id === id);
const findGroupById = (id: string, groups: Group[]): Group | undefined => groups.find(g => g.id === id);

const getStatusChip = (status: Assignment['status']) => {
    const baseClasses = 'px-2 py-0.5 text-xs font-semibold rounded-full inline-block';
    switch (status) {
        case 'Actif': return `${baseClasses} bg-green-100 text-green-800`;
        case 'Terminé': return `${baseClasses} bg-gray-200 text-gray-700`;
        default: return baseClasses;
    }
};

const AssignmentModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<Assignment, 'status'> & { id?: string }) => void;
    members: Member[];
    groups: Group[];
    assignmentToEdit?: Assignment | null;
}> = ({ isOpen, onClose, onSave, members, groups, assignmentToEdit }) => {
    if (!isOpen) return null;

    const isEditMode = !!assignmentToEdit;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        
        // In edit mode, the memberId comes from the assignmentToEdit object,
        // as the dropdown is disabled. In create mode, it comes from the form.
        const memberId = isEditMode ? assignmentToEdit?.memberId : formData.get('memberId') as string;

        const data = {
            id: assignmentToEdit?.id,
            memberId: memberId,
            role: formData.get('role') as string,
            departmentId: formData.get('departmentId') as string,
            startDate: formData.get('startDate') as string,
            endDate: formData.get('endDate') as string || undefined,
        };
        
        if (data.memberId && data.role && data.departmentId && data.startDate) {
            onSave(data as Omit<Assignment, 'status'> & { id?: string });
        } else {
            alert("Veuillez remplir tous les champs obligatoires.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-theme-card rounded-xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-theme-border bg-theme-table-header rounded-t-xl">
                    <h2 className="text-xl font-bold text-theme-text-base">{isEditMode ? "Modifier l'affectation" : 'Nouvelle Affectation'}</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-theme-text-muted hover:bg-slate-200 dark:hover:bg-slate-600"><XMarkIcon className="w-6 h-6" /></button>
                </header>
                <form onSubmit={handleSubmit} key={assignmentToEdit?.id || 'new'}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Membre</label>
                            <select name="memberId" required className="w-full" defaultValue={assignmentToEdit?.memberId || ""} disabled={isEditMode}>
                                <option value="" disabled>-- Choisir un membre --</option>
                                {members.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
                            </select>
                             {isEditMode && <p className="text-xs text-theme-text-muted mt-1">Le membre ne peut pas être changé. Pour affecter une autre personne, créez une nouvelle affectation.</p>}
                        </div>
                         <div>
                            <label className="block text-sm font-medium mb-1">Rôle / Poste</label>
                            <input name="role" required placeholder="Ex: Ancien, Choriste, Trésorier..." defaultValue={assignmentToEdit?.role} className="w-full" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Département / Ministère</label>
                            <select name="departmentId" required className="w-full" defaultValue={assignmentToEdit?.departmentId || ""}>
                                <option value="" disabled>-- Choisir un département --</option>
                                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                                <label className="block text-sm font-medium mb-1">Date de début</label>
                                <input type="date" name="startDate" required defaultValue={assignmentToEdit?.startDate} className="w-full" />
                           </div>
                           <div>
                                <label className="block text-sm font-medium mb-1">Date de fin (Optionnel)</label>
                               <input type="date" name="endDate" defaultValue={assignmentToEdit?.endDate} className="w-full" />
                           </div>
                        </div>
                    </div>
                    <footer className="flex justify-end items-center p-4 bg-theme-table-header rounded-b-xl space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-theme-border rounded-md text-theme-text-base bg-theme-card hover:bg-theme-bg">Annuler</button>
                        <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-church-dark-blue hover:bg-blue-900">{isEditMode ? 'Enregistrer les modifications' : 'Enregistrer'}</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

interface AssignmentsProps {
    assignments: Assignment[];
    members: Member[];
    groups: Group[];
    onViewMember: (member: Member) => void;
    onSaveAssignment: (data: Omit<Assignment, 'status'> & { id?: string }) => void;
    onDeleteAssignment: (id: string) => void;
}

const Assignments: React.FC<AssignmentsProps> = ({ assignments, members, groups, onViewMember, onSaveAssignment, onDeleteAssignment }) => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
    const [exportOpen, setExportOpen] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);
    const exportRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setFilterDropdownOpen(false);
            }
            if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
                setExportOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleOpenCreateModal = () => {
        setEditingAssignment(null);
        setModalOpen(true);
    };

    const handleOpenEditModal = (assignment: Assignment) => {
        setEditingAssignment(assignment);
        setModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setEditingAssignment(null);
        setModalOpen(false);
    };
    
    const handleSaveAndClose = (data: Omit<Assignment, 'status'> & { id?: string }) => {
        onSaveAssignment(data);
        handleCloseModal();
    }


    const filteredAssignments = useMemo(() => {
        const filtered = assignments.filter(assignment => {
            const member = findMemberById(assignment.memberId, members);
            const group = findGroupById(assignment.departmentId, groups);
            const lowerSearchTerm = searchTerm.toLowerCase();

            const searchMatch = !searchTerm ||
                (member && `${member.firstName} ${member.lastName}`.toLowerCase().includes(lowerSearchTerm)) ||
                assignment.role.toLowerCase().includes(lowerSearchTerm) ||
                (group && group.name.toLowerCase().includes(lowerSearchTerm));

            const statusMatch = statusFilter === 'all' || assignment.status === statusFilter;
            const departmentMatch = departmentFilter === 'all' || assignment.departmentId === departmentFilter;

            return searchMatch && statusMatch && departmentMatch;
        });

        return [...filtered].sort((a,b) => (a.status === 'Terminé' ? 1 : -1) - (b.status === 'Terminé' ? 1 : -1) || new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    }, [assignments, members, groups, searchTerm, statusFilter, departmentFilter]);
    
    const handleResetFilters = () => {
        setStatusFilter('all');
        setDepartmentFilter('all');
        setFilterDropdownOpen(false);
    };
    
    const handleExport = (format: 'csv' | 'pdf' | 'word') => {
        setExportOpen(false);
        if (filteredAssignments.length === 0) {
            alert("Aucune affectation à exporter pour les filtres actuels.");
            return;
        }
    
        const dataToExport = filteredAssignments.map(assignment => {
            const member = findMemberById(assignment.memberId, members);
            const group = findGroupById(assignment.departmentId, groups);
            return {
                memberName: member ? `${member.firstName} ${member.lastName}` : 'N/A',
                role: assignment.role,
                departmentName: group ? group.name : 'N/A',
                period: `${new Date(assignment.startDate).toLocaleDateString('fr-FR')} - ${assignment.endDate ? new Date(assignment.endDate).toLocaleDateString('fr-FR') : 'Présent'}`,
                status: assignment.status
            };
        });
    
        const date = new Date().toISOString().split('T')[0];
        const filename = `affectations_${date}`;
        const headers = ['Membre', 'Rôle / Poste', 'Département', 'Période de service', 'Statut'];
    
        if (format === 'csv') {
            const escapeCsvCell = (cell: string) => `"${String(cell || '').replace(/"/g, '""')}"`;
            const rows = dataToExport.map(item => Object.values(item).map(escapeCsvCell).join(','));
            const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `${filename}.csv`);
            link.click();
        } else if (format === 'pdf') {
            const doc = new jsPDF();
            doc.text("Liste des Affectations", 14, 15);
            autoTable(doc, {
                head: [headers],
                body: dataToExport.map(item => Object.values(item)),
                startY: 20
            });
            doc.save(`${filename}.pdf`);
        } else if (format === 'word') {
            const headerHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export Affectations</title></head><body><h2>Liste des Affectations</h2>`;
            const tableHeader = `<table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>`;
            const tableRows = dataToExport.map(item => `<tr>${Object.values(item).map(val => `<td>${val}</td>`).join('')}</tr>`).join('');
            const footer = '</tbody></table></body></html>';
            const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(headerHtml + tableHeader + tableRows + footer);
            const link = document.createElement("a");
            link.href = source;
            link.download = `${filename}.doc`;
            link.click();
        }
    };
  
    return (
        <div className="space-y-6">
            <div className="bg-theme-card p-6 rounded-lg shadow-md">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-theme-border pb-4 mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-theme-text-base">Gestion des affectations et responsabilités</h2>
                        <p className="mt-1 text-theme-text-muted">Attribuez les postes et suivez l'historique des responsabilités de chaque membre.</p>
                    </div>
                    <button
                        onClick={handleOpenCreateModal}
                        className="bg-church-dark-teal text-white px-4 py-2 rounded-md shadow hover:bg-church-teal transition-colors flex items-center justify-center gap-2 w-full md:w-auto shrink-0">
                        <PlusIcon className="w-5 h-5" />
                        Nouvelle Affectation
                    </button>
                </div>

                <div className="bg-theme-card rounded-lg">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                         <div className="relative w-full md:w-1/3">
                            <MagnifyingGlassIcon className="w-5 h-5 text-theme-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Rechercher (nom, rôle, département)..."
                                className="w-full pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                         </div>
                         <div className="flex items-center gap-2">
                            <div className="relative" ref={filterRef}>
                                <button onClick={() => setFilterDropdownOpen(prev => !prev)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-theme-text-base bg-theme-card border border-theme-border rounded-lg hover:bg-theme-bg">
                                    <FunnelIcon className="w-4 h-4" />
                                    Filtres
                                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${filterDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {filterDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-72 bg-theme-card rounded-md shadow-lg p-4 z-20 ring-1 ring-black ring-opacity-5 space-y-4 border border-theme-border">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Statut</label>
                                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full">
                                                <option value="all">Tous les statuts</option>
                                                <option value="Actif">Actif</option>
                                                <option value="Terminé">Terminé</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Département</label>
                                            <select value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)} className="w-full">
                                                <option value="all">Tous les départements</option>
                                                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                            </select>
                                        </div>
                                        <button onClick={handleResetFilters} className="w-full flex items-center justify-center gap-1.5 px-4 py-2 text-sm text-theme-text-base bg-theme-card border border-theme-border rounded-lg hover:bg-theme-bg">
                                            <ArrowPathIcon className="w-4 h-4" /> Réinitialiser
                                        </button>
                                    </div>
                                )}
                            </div>
                             <div className="relative" ref={exportRef}>
                                <button
                                    onClick={() => setExportOpen(prev => !prev)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-theme-text-base bg-theme-card border border-theme-border rounded-lg hover:bg-theme-bg"
                                >
                                    <DocumentArrowDownIcon className="w-4 h-4" />
                                    Exporter
                                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${exportOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {exportOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-theme-card rounded-md shadow-lg py-1 z-20 ring-1 ring-black ring-opacity-5 border border-theme-border">
                                        <a href="#" onClick={(e) => { e.preventDefault(); handleExport('pdf'); }} className="block px-4 py-2 text-sm text-theme-text-base hover:bg-theme-bg">Exporter en PDF</a>
                                        <a href="#" onClick={(e) => { e.preventDefault(); handleExport('csv'); }} className="block px-4 py-2 text-sm text-theme-text-base hover:bg-theme-bg">Exporter en CSV/Excel</a>
                                        <a href="#" onClick={(e) => { e.preventDefault(); handleExport('word'); }} className="block px-4 py-2 text-sm text-theme-text-base hover:bg-theme-bg">Exporter en Word</a>
                                    </div>
                                )}
                            </div>
                         </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-theme-text-base mb-4">Liste des affectations</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-theme-text-muted">
                            <thead className="text-xs text-theme-text-base uppercase bg-theme-table-header">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Membre</th>
                                    <th scope="col" className="px-6 py-3">Rôle / Poste</th>
                                    <th scope="col" className="px-6 py-3">Département</th>
                                    <th scope="col" className="px-6 py-3">Période de service</th>
                                    <th scope="col" className="px-6 py-3">Statut</th>
                                    <th scope="col" className="px-6 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAssignments.map(assignment => {
                                    const member = findMemberById(assignment.memberId, members);
                                    const group = findGroupById(assignment.departmentId, groups);
                                    return (
                                    <tr key={assignment.id} className="bg-theme-card border-b border-theme-border hover:bg-theme-bg">
                                        <td className="px-6 py-4">
                                            {member ? (
                                                <button onClick={() => onViewMember(member)} className="flex items-center gap-3 text-left w-full group">
                                                    <img src={member.photoUrl} alt={`${member.firstName} ${member.lastName}`} className="w-8 h-8 rounded-full object-cover" />
                                                    <div className="font-medium text-theme-text-base group-hover:text-theme-accent transition-colors">{member.firstName} {member.lastName}</div>
                                                </button>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <UserCircleIcon className="w-8 h-8 text-theme-text-muted" />
                                                    <span className="font-medium text-theme-text-muted italic">Membre introuvable</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-theme-text-base">{assignment.role}</td>
                                        <td className="px-6 py-4">{group?.name || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            {new Date(assignment.startDate).toLocaleDateString('fr-FR')} - {assignment.endDate ? new Date(assignment.endDate).toLocaleDateString('fr-FR') : 'Présent'}
                                        </td>
                                        <td className="px-6 py-4"><span className={getStatusChip(assignment.status)}>{assignment.status}</span></td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => { handleOpenEditModal(assignment); }} className="p-2 text-theme-text-muted hover:text-blue-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                                                    <PencilIcon className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => { onDeleteAssignment(assignment.id); }} className="p-2 text-theme-text-muted hover:text-red-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {filteredAssignments.length === 0 && (
                        <div className="text-center py-10">
                            <ClipboardDocumentListIcon className="w-12 h-12 mx-auto text-theme-text-muted opacity-50" />
                            <h3 className="mt-2 text-md font-semibold text-theme-text-base">Aucune affectation trouvée.</h3>
                            <p className="mt-1 text-sm text-theme-text-muted">Essayez de modifier vos filtres ou d'ajouter une nouvelle affectation.</p>
                        </div>
                    )}
                </div>
            </div>
            
            <AssignmentModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveAndClose}
                members={members}
                groups={groups}
                assignmentToEdit={editingAssignment}
            />
        </div>
    );
};

export default Assignments;