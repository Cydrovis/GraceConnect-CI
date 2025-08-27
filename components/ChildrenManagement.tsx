
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Member, Child } from '../types';
import { AcademicCapIcon, MagnifyingGlassIcon, FunnelIcon, ArrowPathIcon, PlusIcon, DocumentArrowDownIcon, ChevronDownIcon, PencilIcon, TrashIcon } from './icons/HeroIcons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useChurch } from '../contexts';
import ConfirmationModal from './ConfirmationModal';
import { getAge } from '../constants';


interface ChildrenManagementProps {
    members: Member[];
    onViewMember: (member: Member) => void;
    onOpenChildRegistrationForm: () => void;
    onViewChild: (child: Child, parent: Member) => void;
    onEditChild: (child: Child, parentId: string) => void;
}

const ChildrenManagement: React.FC<ChildrenManagementProps> = ({ members, onViewMember, onOpenChildRegistrationForm, onViewChild, onEditChild }) => {
    const { handleDeleteChild } = useChurch();
    
    // Flatten children data with parent info
    const allChildren = useMemo(() => {
        const childrenList: { child: Child; parent: Member }[] = [];
        members.forEach(member => {
            if (member.children) {
                member.children.forEach(child => {
                    childrenList.push({ child, parent: member });
                });
            }
        });
        return childrenList;
    }, [members]);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
    const [exportOpen, setExportOpen] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);
    const exportRef = useRef<HTMLDivElement>(null);

    const [ageFilter, setAgeFilter] = useState('all');
    const [genderFilter, setGenderFilter] = useState<'all' | 'Garçon' | 'Fille'>('all');
    const [schoolFilter, setSchoolFilter] = useState<'all' | 'true' | 'false'>('all');
    const [sundaySchoolFilter, setSundaySchoolFilter] = useState<'all' | 'true' | 'false'>('all');
    const [childToDelete, setChildToDelete] = useState<{ child: Child; parent: Member } | null>(null);
    
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
    }, [filterRef, exportRef]);

    const filteredChildren = useMemo(() => {
        return allChildren.filter(({ child, parent }) => {
            // Search filter
            const childName = child.name.toLowerCase();
            const parentName = `${parent.firstName} ${parent.lastName}`.toLowerCase();
            const term = searchTerm.toLowerCase();
            const searchMatch = childName.includes(term) || parentName.includes(term);

            // Age filter
            const age = getAge(child.birthDate);
            const ageMatch = ageFilter === 'all' ||
                (ageFilter === '0-5' && age !== null && age >= 0 && age <= 5) ||
                (ageFilter === '6-11' && age !== null && age >= 6 && age <= 11) ||
                (ageFilter === '12-17' && age !== null && age >= 12 && age <= 17);

            // Gender filter
            const genderMatch = genderFilter === 'all' || child.gender === genderFilter;

            // School filter
            const schoolMatch = schoolFilter === 'all' || String(child.attendsSchool) === schoolFilter;
            
            // Sunday School filter
            const sundaySchoolMatch = sundaySchoolFilter === 'all' || String(child.attendsSundaySchool) === sundaySchoolFilter;
            
            return searchMatch && ageMatch && genderMatch && schoolMatch && sundaySchoolMatch;
        });
    }, [allChildren, searchTerm, ageFilter, genderFilter, schoolFilter, sundaySchoolFilter]);

    const handleResetFilters = () => {
        setAgeFilter('all');
        setGenderFilter('all');
        setSchoolFilter('all');
        setSundaySchoolFilter('all');
        setFilterDropdownOpen(false);
    };

    const handleExport = (format: 'csv' | 'pdf' | 'word') => {
        setExportOpen(false);
        if (filteredChildren.length === 0) {
            alert("Aucun enfant à exporter pour les filtres actuels.");
            return;
        }
    
        const dataToExport = filteredChildren.map(({ child, parent }) => {
            const age = getAge(child.birthDate);
            return {
                childName: child.name,
                age: age !== null ? `${age} ans` : 'N/A',
                parentName: `${parent.firstName} ${parent.lastName}`,
                attendsSchool: child.attendsSchool ? 'Oui' : 'Non',
                schoolClass: child.schoolClass || '',
                schoolName: child.schoolName || '',
                attendsSundaySchool: child.attendsSundaySchool ? 'Oui' : 'Non',
                remainsInChurch: child.remainsInChurch ? 'Oui' : 'Non',
                reasonForLeaving: child.reasonForLeaving || ''
            };
        });
    
        const date = new Date().toISOString().split('T')[0];
        const filename = `liste_enfants_${date}`;
        const headers = ['Nom de l\'enfant', 'Âge', 'Parent(s)', 'Scolarisé', 'Classe', 'Établissement', 'École du Dimanche', 'Reste à l\'église', 'Raison du départ'];
    
        if (format === 'csv') {
            const escapeCsvCell = (cell: string) => `"${String(cell || '').replace(/"/g, '""')}"`;
            const rows = dataToExport.map(item => [
                escapeCsvCell(item.childName),
                escapeCsvCell(item.age),
                escapeCsvCell(item.parentName),
                escapeCsvCell(item.attendsSchool),
                escapeCsvCell(item.schoolClass),
                escapeCsvCell(item.schoolName),
                escapeCsvCell(item.attendsSundaySchool),
                escapeCsvCell(item.remainsInChurch),
                escapeCsvCell(item.reasonForLeaving)
            ].join(','));
    
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
            doc.text("Liste des Enfants", 14, 15);
            autoTable(doc, {
                head: [headers],
                body: dataToExport.map(item => Object.values(item)),
                startY: 20
            });
            doc.save(`${filename}.pdf`);
        } else if (format === 'word') {
            const headerHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export Children</title></head><body><h2>Liste des Enfants</h2>`;
            const tableHeader = `<table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>`;
            const tableRows = dataToExport.map(item => `
                <tr>
                    <td>${item.childName}</td>
                    <td>${item.age}</td>
                    <td>${item.parentName}</td>
                    <td>${item.attendsSchool}</td>
                    <td>${item.schoolClass}</td>
                    <td>${item.schoolName}</td>
                    <td>${item.attendsSundaySchool}</td>
                    <td>${item.remainsInChurch}</td>
                    <td>${item.reasonForLeaving}</td>
                </tr>
            `).join('');
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-theme-text-base">Gestion des Enfants</h2>
                    <p className="mt-1 text-theme-text-muted">Liste complète de tous les enfants des membres de l'église.</p>
                </div>
                <button onClick={onOpenChildRegistrationForm} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-church-dark-blue rounded-lg hover:bg-blue-900 shadow">
                    <PlusIcon className="w-4 h-4" />
                    Ajouter un enfant
                </button>
            </div>

            <div className="bg-theme-card p-4 rounded-lg shadow-md">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                    <div className="relative w-full md:w-1/3">
                        <MagnifyingGlassIcon className="w-5 h-5 text-theme-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Rechercher un enfant ou un parent..."
                            className="w-full pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                     <div className="flex items-center gap-2">
                        <div className="relative" ref={filterRef}>
                            <button onClick={() => setFilterDropdownOpen(prev => !prev)} className="btn btn-secondary">
                                <FunnelIcon className="w-4 h-4" />
                                Filtres
                                <ChevronDownIcon className={`w-4 h-4 transition-transform ${filterDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {filterDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-80 bg-theme-card rounded-md shadow-lg p-4 z-20 ring-1 ring-black ring-opacity-5 space-y-4 border border-theme-border">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Âge</label>
                                        <select value={ageFilter} onChange={e => setAgeFilter(e.target.value)} className="w-full">
                                            <option value="all">Tous les âges</option>
                                            <option value="0-5">0 - 5 ans</option>
                                            <option value="6-11">6 - 11 ans</option>
                                            <option value="12-17">12 - 17 ans</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Sexe</label>
                                        <select value={genderFilter} onChange={e => setGenderFilter(e.target.value as any)} className="w-full">
                                            <option value="all">Tous</option>
                                            <option value="Garçon">Garçon</option>
                                            <option value="Fille">Fille</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Scolarisé</label>
                                        <select value={schoolFilter} onChange={e => setSchoolFilter(e.target.value as any)} className="w-full">
                                            <option value="all">Tous</option>
                                            <option value="true">Oui</option>
                                            <option value="false">Non</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">École du Dim.</label>
                                        <select value={sundaySchoolFilter} onChange={e => setSundaySchoolFilter(e.target.value as any)} className="w-full">
                                            <option value="all">Tous</option>
                                            <option value="true">Oui</option>
                                            <option value="false">Non</option>
                                        </select>
                                    </div>
                                    <button onClick={handleResetFilters} className="btn btn-secondary w-full justify-center">
                                        <ArrowPathIcon className="w-4 h-4" /> Réinitialiser
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="relative" ref={exportRef}>
                            <button
                                onClick={() => setExportOpen(prev => !prev)}
                                className="btn btn-secondary"
                            >
                                <DocumentArrowDownIcon className="w-4 h-4" />
                                Exporter
                                <ChevronDownIcon className={`w-4 h-4 transition-transform ${exportOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {exportOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-theme-card rounded-md shadow-lg py-1 z-20 ring-1 ring-black ring-opacity-5 border border-theme-border">
                                    <a href="#" onClick={(e) => { e.preventDefault(); handleExport('pdf'); }} className="block px-4 py-2 text-sm text-theme-text-base hover:bg-theme-bg">Exporter en PDF</a>
                                    <a href="#" onClick={(e) => { e.preventDefault(); handleExport('csv'); }} className="block px-4 py-2 text-sm text-theme-text-base hover:bg-theme-bg">Exporter en CSV/Excel</a>
                                    <a href="#" onClick={(e) => { e.preventDefault(); handleExport('word'); }} className="block px-4 py-2 text-sm text-theme-text-base hover:bg-theme-bg">Exporter en Word</a>
                                </div>
                            )}
                        </div>
                     </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-theme-text-muted">
                        <thead className="text-xs text-theme-text-base uppercase bg-theme-table-header">
                            <tr>
                                <th scope="col" className="px-6 py-3">Nom de l'enfant</th>
                                <th scope="col" className="px-6 py-3">Âge</th>
                                <th scope="col" className="px-6 py-3">Parent(s)</th>
                                <th scope="col" className="px-6 py-3">Scolarisé</th>
                                <th scope="col" className="px-6 py-3">École du Dimanche</th>
                                <th scope="col" className="px-6 py-3">Reste à l'église</th>
                                <th scope="col" className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredChildren.map(({ child, parent }) => {
                                const age = getAge(child.birthDate);
                                return (
                                <tr key={child.id} className="bg-theme-card border-b border-theme-border hover:bg-theme-bg">
                                    <td className="px-6 py-4 font-medium text-theme-text-base">
                                        <button onClick={() => onViewChild(child, parent)} className="hover:text-theme-accent transition-colors text-left w-full">
                                            {child.name}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">{age !== null ? `${age} ans` : 'N/A'}</td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => onViewMember(parent)} className="flex items-center gap-2 text-left hover:text-theme-accent transition-colors">
                                            <img src={parent.photoUrl} alt="parent" className="w-6 h-6 rounded-full"/>
                                            <span>{parent.firstName} {parent.lastName}</span>
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">{child.attendsSchool ? `Oui (${child.schoolClass || 'Classe non précisée'})` : 'Non'}</td>
                                    <td className="px-6 py-4">{child.attendsSundaySchool ? 'Oui' : 'Non'}</td>
                                    <td className="px-6 py-4">{child.remainsInChurch ? 'Oui' : `Non (${child.reasonForLeaving || 'Raison non précisée'})`}</td>
                                    <td className="px-6 py-4 text-center">
                                      <div className="flex items-center justify-center gap-2">
                                          <button 
                                            onClick={() => onEditChild(child, parent.id)} 
                                            className="p-2 text-theme-text-muted hover:text-blue-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                            title="Modifier les informations de l'enfant"
                                          >
                                              <PencilIcon className="w-5 h-5" />
                                          </button>
                                          <button 
                                            onClick={() => setChildToDelete({ child, parent })} 
                                            className="p-2 text-theme-text-muted hover:text-red-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                            title="Supprimer la fiche de l'enfant"
                                          >
                                              <TrashIcon className="w-5 h-5" />
                                          </button>
                                      </div>
                                  </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>

                <ConfirmationModal
                    isOpen={!!childToDelete}
                    onClose={() => setChildToDelete(null)}
                    onConfirm={() => {
                        if (childToDelete) {
                            handleDeleteChild(childToDelete.parent.id, childToDelete.child.id);
                            setChildToDelete(null);
                        }
                    }}
                    title="Supprimer l'enfant"
                    message={`Êtes-vous sûr de vouloir supprimer la fiche de ${childToDelete?.child.name} ? Cette action est irréversible.`}
                />
            </div>
        </div>
    );
};

export default ChildrenManagement;