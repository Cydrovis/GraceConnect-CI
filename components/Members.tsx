
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { UserPlusIcon, FunnelIcon, MagnifyingGlassIcon, UserGroupIcon, EnvelopeIcon, DevicePhoneMobileIcon, DocumentArrowDownIcon, UsersIcon, PencilIcon, TrashIcon, ArrowPathIcon, ChevronDownIcon, EllipsisVerticalIcon, ChatBubbleBottomCenterTextIcon } from './icons/HeroIcons';
import { Member, Group } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth, useChurch, useUI } from '../contexts';
import ConfirmationModal from './ConfirmationModal';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-theme-card p-4 rounded-lg shadow flex items-center gap-4">
        <div className="bg-slate-100 p-3 rounded-full">{icon}</div>
        <div>
            <p className="text-3xl font-bold text-theme-text-base">{value}</p>
            <p className="text-sm font-medium text-theme-text-muted">{title}</p>
        </div>
    </div>
);


const Members: React.FC = () => {
    const { currentUserActiveRoles: userRoles } = useAuth();
    const { currentChurch, handleDeleteMember, handleDeleteMultipleMembers } = useChurch();
    const { members, groups } = currentChurch.data;
    const { openRegistrationForm, setViewingMember, setEditingMember, openFollowUpModal } = useUI();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [exportOpen, setExportOpen] = useState(false);
    const exportRef = useRef<HTMLDivElement>(null);
    const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
    const [membersToDelete, setMembersToDelete] = useState<string[] | null>(null);

    const handleDeleteSelected = () => {
        if (selectedIds.size === 0) return;
        setMembersToDelete(Array.from(selectedIds));
    };

    const canModifyMembers = useMemo(() => {
        const modificationRoles = ['Administrateur principal', 'Pasteur général', 'Secrétaire'];
        return userRoles.some(role => modificationRoles.includes(role));
    }, [userRoles]);

    const stats = useMemo(() => {
        const newThisMonth = members.filter(m => m.status === 'Nouveau').length;
        const unassigned = members.filter(m => !m.department || m.department.trim() === '').length;
        const absent = members.filter(m => m.status === 'Inactif').length;
        return { total: members.length, newThisMonth, unassigned, absent };
    }, [members]);

    const departments = useMemo(() => ['all', ...new Set(groups.map(g => g.name))], [groups]);
    const statuses: Array<Member['status'] | 'all'> = ['all', 'Actif', 'Nouveau', 'À suivre', 'Inactif'];

    const filteredMembers = useMemo(() => {
        return members.filter(member => {
            const searchMatch = !searchTerm || `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || member.phone.includes(searchTerm) || member.email.toLowerCase().includes(searchTerm.toLowerCase()) || member.id.toLowerCase().includes(searchTerm.toLowerCase());
            const statusMatch = statusFilter === 'all' || member.status === statusFilter;
            const departmentMatch = departmentFilter === 'all' || member.department === departmentFilter;
            return searchMatch && statusMatch && departmentMatch;
        });
    }, [members, searchTerm, statusFilter, departmentFilter]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportRef.current && !exportRef.current.contains(event.target as Node)) setExportOpen(false);
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) setFilterDropdownOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
    const handleResetFilters = () => {
        setStatusFilter('all');
        setDepartmentFilter('all');
        setFilterDropdownOpen(false);
    };

    const handleExport = (format: 'csv' | 'pdf' | 'word') => {
        setExportOpen(false);
        if (filteredMembers.length === 0) {
            alert("Aucun membre à exporter pour les filtres actuels.");
            return;
        }
        const membersToExport = filteredMembers;
        const date = new Date().toISOString().split('T')[0];
        const filename = `membres_grace_connect_${date}`;
    
        if (format === 'csv') {
            const headers = ['Nom & Prénom', 'Téléphone', 'Téléphone 2', 'Département', 'Statut', 'Baptisé', 'Situation Matrimoniale', 'Type'];
            const escapeCsvCell = (cell: string | undefined | null) => `"${String(cell || '').replace(/"/g, '""')}"`;
            const rows = membersToExport.map(m => [ escapeCsvCell(`${m.firstName} ${m.lastName}`), escapeCsvCell(m.phone), escapeCsvCell(m.phone2), escapeCsvCell(m.department), escapeCsvCell(m.status), escapeCsvCell(m.baptismDate ? 'Oui' : 'Non'), escapeCsvCell(m.maritalStatus), escapeCsvCell(m.memberType) ].join(','));
            const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `${filename}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else if (format === 'pdf') {
            const doc = new jsPDF({ orientation: 'landscape' });
            doc.text("Liste des Membres", 14, 15);
            autoTable(doc, {
                head: [['Nom & Prénom', 'Téléphone', 'Téléphone 2', 'Département', 'Statut', 'Baptisé', 'Situation Matrimoniale', 'Type']],
                body: membersToExport.map(m => [ `${m.firstName} ${m.lastName}`, m.phone, m.phone2 || '', m.department, m.status, m.baptismDate ? 'Oui' : 'Non', m.maritalStatus, m.memberType ]),
                startY: 20
            });
            doc.save(`${filename}.pdf`);
        } else if (format === 'word') {
            const headers = ['Nom & Prénom', 'Téléphone', 'Téléphone 2', 'Département', 'Statut', 'Baptisé', 'Situation Matrimoniale', 'Type'];
            const headerHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export Members</title></head><body><h2>Liste des Membres</h2>`;
            const tableHeader = `<table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>`;
            const tableRows = membersToExport.map(m => `<tr><td>${m.firstName} ${m.lastName}</td><td>${m.phone}</td><td>${m.phone2 || ''}</td><td>${m.department}</td><td>${m.status}</td><td>${m.baptismDate ? 'Oui' : 'Non'}</td><td>${m.maritalStatus}</td><td>${m.memberType}</td></tr>`).join('');
            const footer = '</tbody></table></body></html>';
            const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(headerHtml + tableHeader + tableRows + footer);
            const link = document.createElement("a");
            link.href = source;
            link.download = `${filename}.doc`;
            link.click();
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) setSelectedIds(new Set(filteredMembers.map(m => m.id)));
        else setSelectedIds(new Set());
    };

    const handleSelectOne = (id: string) => {
        const newSelectedIds = new Set(selectedIds);
        if (newSelectedIds.has(id)) newSelectedIds.delete(id);
        else newSelectedIds.add(id);
        setSelectedIds(newSelectedIds);
    };
    
    const getStatusChip = (status: Member['status']) => {
        const baseClasses = 'px-2 py-0.5 text-xs font-semibold rounded-full inline-block';
        switch (status) {
            case 'Actif': return `${baseClasses} bg-green-100 text-green-800`;
            case 'Nouveau': return `${baseClasses} bg-blue-100 text-blue-800`;
            case 'À suivre': return `${baseClasses} bg-yellow-100 text-yellow-800`;
            case 'Inactif': return `${baseClasses} bg-gray-200 text-gray-700`;
            default: return baseClasses;
        }
    };

    const handleDeleteClick = (member: Member) => {
        setMemberToDelete(member);
    };

    const handleFollowUpClick = () => {
        if (selectedIds.size !== 1) return;
        const selectedId = Array.from(selectedIds)[0];
        const memberToFollowUp = members.find(m => m.id === selectedId);
        if (memberToFollowUp) openFollowUpModal(memberToFollowUp);
    };
    
    return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total de membres" value={stats.total} icon={<UsersIcon className="w-6 h-6 text-blue-500"/>} />
            <StatCard title="Nouveaux ce mois" value={stats.newThisMonth} icon={<UserPlusIcon className="w-6 h-6 text-green-500"/>} />
            <StatCard title="Non affectés à un groupe" value={stats.unassigned} icon={<UserGroupIcon className="w-6 h-6 text-orange-500"/>} />
            <StatCard title="Absents depuis +1 mois" value={stats.absent} icon={<UsersIcon className="w-6 h-6 text-red-500"/>} />
        </div>

        <div className="bg-theme-card p-4 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                 <div className="relative w-full md:w-1/3">
                    <MagnifyingGlassIcon className="w-5 h-5 text-theme-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="text" placeholder="Rechercher un membre..." className="w-full pl-10 pr-4 py-2 border border-theme-border rounded-lg focus:ring-theme-accent focus:border-theme-accent bg-theme-card" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="relative" ref={filterRef}>
                        <button onClick={() => setFilterDropdownOpen(prev => !prev)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-theme-text-base bg-theme-card border border-theme-border rounded-lg hover:bg-slate-100">
                            <FunnelIcon className="w-4 h-4" /> Filtres <ChevronDownIcon className={`w-4 h-4 transition-transform ${filterDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {filterDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-80 bg-theme-card rounded-md shadow-lg p-4 z-20 ring-1 ring-black ring-opacity-5 space-y-4 border border-theme-border">
                                <div>
                                    <label htmlFor="statusFilter" className="block text-sm font-medium text-theme-text-base mb-1">Filtrer par statut</label>
                                    <select id="statusFilter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-3 py-2 border border-theme-border rounded-md shadow-sm bg-theme-card text-theme-text-base focus:ring-theme-accent focus:border-theme-accent">
                                        {statuses.map(s => <option key={s} value={s}>{s === 'all' ? 'Tous les statuts' : s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="departmentFilter" className="block text-sm font-medium text-theme-text-base mb-1">Filtrer par département</label>
                                    <select id="departmentFilter" value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className="w-full px-3 py-2 border border-theme-border rounded-md shadow-sm bg-theme-card text-theme-text-base focus:ring-theme-accent focus:border-theme-accent">
                                        {departments.map(d => <option key={d} value={d}>{d === 'all' ? 'Tous les départements' : d}</option>)}
                                    </select>
                                </div>
                                <button onClick={handleResetFilters} className="w-full flex items-center gap-1.5 px-4 py-2 text-sm text-theme-text-base bg-theme-card border border-theme-border rounded-lg hover:bg-slate-100 justify-center">
                                    <ArrowPathIcon className="w-4 h-4" /> Réinitialiser les filtres
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="relative" ref={exportRef}>
                        <button onClick={() => setExportOpen(prev => !prev)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-theme-text-base bg-theme-card border border-theme-border rounded-lg hover:bg-slate-100">
                            <DocumentArrowDownIcon className="w-4 h-4" /> Exporter <ChevronDownIcon className={`w-4 h-4 transition-transform ${exportOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {exportOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-theme-card rounded-md shadow-lg py-1 z-20 ring-1 ring-black ring-opacity-5 border border-theme-border">
                                <a href="#" onClick={(e) => { e.preventDefault(); handleExport('pdf'); }} className="block px-4 py-2 text-sm text-theme-text-base hover:bg-slate-100">Exporter en PDF</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); handleExport('csv'); }} className="block px-4 py-2 text-sm text-theme-text-base hover:bg-slate-100">Exporter en CSV/Excel</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); handleExport('word'); }} className="block px-4 py-2 text-sm text-theme-text-base hover:bg-slate-100">Exporter en Word</a>
                            </div>
                        )}
                    </div>
                    {canModifyMembers && (
                      <>
                        <button onClick={handleFollowUpClick} disabled={selectedIds.size !== 1} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-church-teal rounded-lg hover:bg-church-light-teal shadow disabled:bg-gray-400 disabled:cursor-not-allowed">
                            <ChatBubbleBottomCenterTextIcon className="w-4 h-4" /> Suivi de membre
                        </button>
                        <button onClick={openRegistrationForm} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-church-dark-blue rounded-lg hover:bg-blue-900 shadow">
                            <UserPlusIcon className="w-4 h-4" /> Ajouter
                        </button>
                      </>
                    )}
                 </div>
            </div>

            {selectedIds.size > 0 && (
                <div className="bg-slate-100 p-2 rounded-lg mb-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-theme-text-base">{selectedIds.size} membre(s) sélectionné(s)</span>
                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-theme-text-base bg-theme-card rounded-md border border-theme-border hover:bg-slate-100"><UserGroupIcon className="w-4 h-4"/>Affecter</button>
                        {canModifyMembers && (
                            <button onClick={handleDeleteSelected} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 bg-theme-card rounded-md border border-red-200 hover:bg-red-50">
                                <TrashIcon className="w-4 h-4"/>Supprimer
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-theme-text-muted">
                    <thead className="text-xs text-theme-text-base uppercase bg-theme-table-header">
                        <tr>
                            <th scope="col" className="p-4"><input type="checkbox" className="w-4 h-4 text-church-dark-blue bg-gray-100 border-gray-300 rounded focus:ring-church-light-teal" onChange={handleSelectAll} checked={selectedIds.size > 0 && selectedIds.size === filteredMembers.length && filteredMembers.length > 0} /></th>
                            <th scope="col" className="px-6 py-3">Nom & Prénom</th>
                            <th scope="col" className="px-6 py-3">Téléphone</th>
                            <th scope="col" className="px-6 py-3">Baptisé</th>
                            <th scope="col" className="px-6 py-3">Situation Matrimoniale</th>
                            <th scope="col" className="px-6 py-3">Enfants</th>
                            <th scope="col" className="px-6 py-3">Département</th>
                            <th scope="col" className="px-6 py-3">Statut</th>
                            <th scope="col" className="px-6 py-3">Type</th>
                            {canModifyMembers && <th scope="col" className="px-6 py-3 text-center">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMembers.map((member) => (
                            <tr key={member.id} className="bg-theme-card border-b border-theme-border hover:bg-slate-50 transition-colors">
                                <td className="w-4 p-4"><input type="checkbox" className="w-4 h-4 text-church-dark-blue bg-gray-100 border-gray-300 rounded focus:ring-church-light-teal" checked={selectedIds.has(member.id)} onChange={() => handleSelectOne(member.id)} /></td>
                                <td className="px-6 py-4">
                                    <button onClick={() => setViewingMember(member)} className="font-medium text-theme-text-base whitespace-nowrap flex items-center gap-3 text-left w-full hover:text-theme-accent transition-colors">
                                        <img className="w-10 h-10 rounded-full object-cover" src={member.photoUrl} alt={`${member.firstName} ${member.lastName}`} />
                                        <div>
                                            <div className="font-semibold">{member.firstName} {member.lastName}</div>
                                            <div className="text-xs text-theme-text-muted">{member.email}</div>
                                        </div>
                                    </button>
                                </td>
                                <td className="px-6 py-4"><div className="font-medium text-theme-text-base">{member.phone}</div>{member.phone2 && <div className="text-xs text-theme-text-muted">{member.phone2}</div>}</td>
                                <td className="px-6 py-4">{member.baptismDate ? 'Oui' : 'Non'}</td>
                                <td className="px-6 py-4">{member.maritalStatus}</td>
                                <td className="px-6 py-4">{member.hasChildren ? 'Oui' : 'Non'}</td>
                                <td className="px-6 py-4">{member.department}</td>
                                <td className="px-6 py-4"><span className={getStatusChip(member.status)}>{member.status}</span></td>
                                <td className="px-6 py-4 font-medium">{member.memberType}</td>
                                {canModifyMembers && (
                                  <td className="px-6 py-4 text-center">
                                      <div className="flex items-center justify-center gap-2">
                                          <button 
                                              onClick={() => openFollowUpModal(member)}
                                              className="p-2 text-gray-500 hover:text-teal-600 rounded-full hover:bg-gray-100 transition-colors"
                                              title="Suivi du membre"
                                          >
                                              <ChatBubbleBottomCenterTextIcon className="w-5 h-5" />
                                          </button>
                                          <button 
                                              onClick={() => { setEditingMember(member); openRegistrationForm(); }}
                                              className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 transition-colors"
                                              title="Modifier"
                                          >
                                              <PencilIcon className="w-5 h-5" />
                                          </button>
                                          <button 
                                              onClick={() => handleDeleteClick(member)}
                                              className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100 transition-colors"
                                              title="Supprimer"
                                          >
                                              <TrashIcon className="w-5 h-5" />
                                          </button>
                                      </div>
                                  </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-between items-center pt-4">
                <span className="text-sm text-theme-text-muted">Affiche 1 à {filteredMembers.length} sur {members.length} membres</span>
                <div className="flex gap-1">
                    <button className="px-3 py-1 border border-theme-border rounded-md text-sm hover:bg-slate-100 text-theme-text-base">Précédent</button>
                    <button className="px-3 py-1 border border-theme-border rounded-md text-sm hover:bg-slate-100 text-theme-text-base">Suivant</button>
                </div>
            </div>
        </div>

        {memberToDelete && (
            <ConfirmationModal
                isOpen={!!memberToDelete}
                onClose={() => setMemberToDelete(null)}
                onConfirm={() => {
                    handleDeleteMember(memberToDelete.id);
                    setMemberToDelete(null);
                }}
                title="Supprimer le membre"
                message={`Êtes-vous sûr de vouloir supprimer ${memberToDelete.firstName} ${memberToDelete.lastName} ? Cette action est irréversible.`}
            />
        )}
         {membersToDelete && (
            <ConfirmationModal
                isOpen={!!membersToDelete}
                onClose={() => setMembersToDelete(null)}
                onConfirm={() => {
                    handleDeleteMultipleMembers(membersToDelete);
                    setMembersToDelete(null);
                    setSelectedIds(new Set());
                }}
                title={`Supprimer ${membersToDelete.length} membres`}
                message={`Êtes-vous sûr de vouloir supprimer les ${membersToDelete.length} membres sélectionnés ? Cette action est irréversible.`}
            />
        )}
    </div>
    );
};

export default Members;
