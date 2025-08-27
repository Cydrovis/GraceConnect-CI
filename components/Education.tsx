import React, { useState, useMemo, useRef, useEffect } from 'react';
import { AcademicCapIcon, PlusIcon, XMarkIcon, UserCircleIcon, CalendarDaysIcon, BookOpenIcon, UsersIcon, CheckCircleIcon, XCircleIcon, DocumentTextIcon, MagnifyingGlassIcon, FunnelIcon, DocumentArrowDownIcon, ChevronDownIcon, ArrowPathIcon, PencilIcon, TrashIcon, EllipsisVerticalIcon } from './icons/HeroIcons';
import { Member, SpiritualPathway, TrainingCourse, TrainingSession } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const findDataById = <T extends { id: string }>(id: string, data: T[]): T | undefined => data.find(item => item.id === id);

const getStatusChip = (status: TrainingCourse['status']) => {
    const baseClasses = 'px-2 py-0.5 text-xs font-bold rounded-full inline-block';
    switch (status) {
        case 'En cours': return `${baseClasses} bg-green-100 text-green-800`;
        case 'Planifié': return `${baseClasses} bg-blue-100 text-blue-800`;
        case 'Terminé': return `${baseClasses} bg-gray-200 text-gray-700`;
        default: return baseClasses;
    }
};

const AddParticipantToCourseModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (courseId: string, memberIdsToAdd: string[]) => void;
    course: TrainingCourse;
    members: Member[];
}> = ({ isOpen, onClose, onSave, course, members }) => {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const selectAllCheckboxRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        if (isOpen) {
            setSelectedIds(new Set());
            setSearchTerm('');
        }
    }, [isOpen]);

    const availableMembers = useMemo(() => {
        return members
            .filter(m => !course.enrolledMemberIds.includes(m.id))
            .filter(m => `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [members, course.enrolledMemberIds, searchTerm]);

    useEffect(() => {
        if (!selectAllCheckboxRef.current) return;
        
        const visibleIds = availableMembers.map(m => m.id);
        if (visibleIds.length === 0) {
            selectAllCheckboxRef.current.checked = false;
            selectAllCheckboxRef.current.indeterminate = false;
            return;
        }
        
        const selectedVisibleCount = visibleIds.filter(id => selectedIds.has(id)).length;
        const allVisibleSelected = selectedVisibleCount === visibleIds.length;
        
        selectAllCheckboxRef.current.checked = allVisibleSelected;
        selectAllCheckboxRef.current.indeterminate = selectedVisibleCount > 0 && !allVisibleSelected;
    }, [selectedIds, availableMembers]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (selectedIds.size === 0) {
            alert("Veuillez sélectionner au moins un membre.");
            return;
        }
        onSave(course.id, Array.from(selectedIds));
    };

    const toggleSelection = (memberId: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(memberId)) {
                newSet.delete(memberId);
            } else {
                newSet.add(memberId);
            }
            return newSet;
        });
    };
    
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setSelectedIds(prevSelected => {
            const newSelected = new Set(prevSelected);
            const visibleIds = availableMembers.map(m => m.id);
            if (isChecked) {
                visibleIds.forEach(id => newSelected.add(id));
            } else {
                visibleIds.forEach(id => newSelected.delete(id));
            }
            return newSelected;
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col" onClick={e => e.stopPropagation()}>
                 <header className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-xl">
                    <h2 className="text-xl font-bold text-gray-800">Ajouter des participants</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200"><XMarkIcon className="w-6 h-6" /></button>
                </header>
                <div className="p-6 overflow-y-auto">
                    <p className="text-sm mb-2">Sélectionnez les membres à ajouter à la formation "{course.name}".</p>
                     <div className="relative mb-2">
                        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Rechercher un membre..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-church-dark-teal focus:border-church-dark-teal"
                        />
                    </div>
                    <div className="h-64 border rounded-md overflow-y-auto bg-white flex flex-col">
                        <div className="p-2 border-b bg-gray-50 sticky top-0 z-10">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    ref={selectAllCheckboxRef}
                                    onChange={handleSelectAll}
                                    className="h-4 w-4 text-church-dark-blue rounded border-gray-300 focus:ring-church-light-teal"
                                />
                                <span className="font-medium text-sm">Tout sélectionner</span>
                            </label>
                        </div>
                        <div className="overflow-y-auto flex-grow">
                            {availableMembers.length > 0 ? availableMembers.map(member => (
                                <label key={member.id} className="flex items-center gap-3 p-2 border-b cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.has(member.id)}
                                        onChange={() => toggleSelection(member.id)}
                                        className="h-4 w-4 text-church-dark-blue rounded border-gray-300 focus:ring-church-light-teal"
                                    />
                                    <span>{member.firstName} {member.lastName}</span>
                                </label>
                            )) : (
                               <p className="text-center text-gray-500 p-4">Aucun membre disponible.</p> 
                            )}
                        </div>
                    </div>
                </div>
                <footer className="flex justify-end items-center p-4 bg-gray-50 rounded-b-xl space-x-3 border-t">
                    <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md">Annuler</button>
                    <button type="button" onClick={handleSave} className="px-4 py-2 border-transparent rounded-md text-white bg-church-dark-blue">Ajouter ({selectedIds.size})</button>
                </footer>
            </div>
        </div>
    );
};

const getFriendlyFileType = (mimeType: string) => {
    if (!mimeType) return 'Lien Web';
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('word')) return 'Document Word';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheetml')) return 'Fichier Excel';
    if (mimeType.includes('image')) return 'Image';
    return 'Fichier';
};

const CourseDetailModal: React.FC<{
    course: TrainingCourse | null;
    onClose: () => void;
    onAttendanceChange: (courseId: string, sessionId: string, memberId: string, isPresent: boolean) => void;
    onToggleAllAttendanceForMember: (courseId: string, memberId: string) => void;
    members: Member[];
    pathways: SpiritualPathway[];
    onViewMember: (member: Member) => void;
    onAddParticipants: (course: TrainingCourse) => void;
}> = ({ course, onClose, onAttendanceChange, onToggleAllAttendanceForMember, members, pathways, onViewMember, onAddParticipants }) => {
    const [activeTab, setActiveTab] = useState<'attendance' | 'materials'>('attendance');
    const [participantSearch, setParticipantSearch] = useState('');
    const [attendanceFilter, setAttendanceFilter] = useState('all');
    const [exportOpen, setExportOpen] = useState(false);
    const exportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
                setExportOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!course) return null;

    const leader = findDataById(course.leaderId, members);
    const pathway = findDataById(course.pathwayId, pathways);
    const enrolledMembers = course.enrolledMemberIds.map(id => findDataById(id, members)).filter(Boolean) as Member[];

    const filteredEnrolledMembers = useMemo(() => {
        const firstSession = course.sessions?.[0];
        return enrolledMembers.filter(member => {
            const searchMatch = `${member.firstName} ${member.lastName}`.toLowerCase().includes(participantSearch.toLowerCase());

            if (!searchMatch) return false;

            if (attendanceFilter === 'all' || !firstSession) {
                return true;
            }
            const isPresent = firstSession.presentMemberIds.has(member.id);
            if (attendanceFilter === 'present') return isPresent;
            if (attendanceFilter === 'absent') return !isPresent;
            
            return true;
        });
    }, [enrolledMembers, participantSearch, attendanceFilter, course.sessions]);

    const handleExport = (format: 'pdf' | 'csv' | 'word') => {
        setExportOpen(false);
        if (!course) return;

        const date = new Date().toISOString().split('T')[0];
        const safeCourseName = course.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const filename = `presence_${safeCourseName}_${date}`;

        const headers = ['Participant', ...course.sessions.map(s => `${s.topic} (${new Date(s.date).toLocaleDateString('fr-FR')})`)];
        const body = enrolledMembers.map(member => {
            return [
                `${member.firstName} ${member.lastName}`,
                ...course.sessions.map(session => session.presentMemberIds.has(member.id) ? 'Présent' : 'Absent')
            ];
        });

        if (format === 'pdf') {
            const doc = new jsPDF({ orientation: 'landscape' });
            doc.text(`Feuille de présence: ${course.name}`, 14, 15);
            autoTable(doc, { head: [headers], body, startY: 20 });
            doc.save(`${filename}.pdf`);
        } else if (format === 'csv') {
            const escapeCsvCell = (cell: string) => `"${String(cell || '').replace(/"/g, '""')}"`;
            const rows = body.map(row => row.map(escapeCsvCell).join(','));
            const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `${filename}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else if (format === 'word') {
            const headerHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export Suivi</title></head><body><h2>Suivi: ${course.name}</h2>`;
            const tableHeader = `<table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>`;
            const tableRows = body.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('');
            const footer = '</tbody></table></body></html>';
            const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(headerHtml + tableHeader + tableRows + footer);
            const link = document.createElement("a");
            link.href = source;
            link.download = `${filename}.doc`;
            link.click();
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-start justify-between p-4 border-b bg-gray-50 rounded-t-xl">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{course.name}</h2>
                        <p className="text-sm text-gray-500">{pathway?.name || course.customPathway}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200"><XMarkIcon className="w-6 h-6" /></button>
                </header>
                <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm border-b">
                     <div><span className="font-semibold">Responsable:</span> {leader ? `${leader.firstName} ${leader.lastName}` : 'N/A'}</div>
                     <div><span className="font-semibold">Statut:</span> <span className={getStatusChip(course.status)}>{course.status}</span></div>
                     <div><span className="font-semibold">Participants:</span> {course.enrolledMemberIds.length}</div>
                     <div><span className="font-semibold">Sessions:</span> {course.sessions.length}</div>
                </div>
                <div className="flex-grow flex overflow-hidden">
                    <main className="flex-grow p-4 flex flex-col overflow-hidden">
                        <nav className="flex gap-2 mb-4 border-b">
                            <button onClick={() => setActiveTab('attendance')} className={`px-3 py-2 text-sm font-semibold rounded-t-md ${activeTab === 'attendance' ? 'border-b-2 border-church-dark-teal text-church-dark-teal' : 'text-gray-500'}`}>Feuille de présence</button>
                            <button onClick={() => setActiveTab('materials')} className={`px-3 py-2 text-sm font-semibold rounded-t-md ${activeTab === 'materials' ? 'border-b-2 border-church-dark-teal text-church-dark-teal' : 'text-gray-500'}`}>Supports de cours</button>
                        </nav>

                        {activeTab === 'attendance' && (
                            <div className="flex-grow overflow-y-auto">
                                <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="p-2 text-left font-semibold w-1/4">Participant</th>
                                            {course.sessions.map(s => <th key={s.id} className="p-2 text-center font-semibold">{s.topic}<br/><span className="font-normal text-xs text-gray-500">{new Date(s.date).toLocaleDateString('fr-FR')}</span></th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {filteredEnrolledMembers.map(member => (
                                        <tr key={member.id} className="border-b hover:bg-gray-50">
                                            <td className="p-2 font-medium">
                                                <button onClick={() => onViewMember(member)} className="hover:underline">{member.firstName} {member.lastName}</button>
                                            </td>
                                            {course.sessions.map(session => (
                                                <td key={session.id} className="p-2 text-center">
                                                    <input type="checkbox" checked={session.presentMemberIds.has(member.id)} onChange={(e) => onAttendanceChange(course.id, session.id, member.id, e.target.checked)} className="h-4 w-4 rounded text-church-dark-blue"/>
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                                </div>
                            </div>
                        )}
                        {activeTab === 'materials' && (
                            <div>...</div>
                        )}
                    </main>
                    <aside className="w-1/4 border-l p-4 flex flex-col gap-4 bg-gray-50">
                        <h3 className="font-semibold text-gray-800">Participants ({enrolledMembers.length})</h3>
                        <button onClick={() => onAddParticipants(course)} className="w-full bg-green-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-green-700">Ajouter des participants</button>
                    </aside>
                </div>
            </div>
        </div>
    )
};


interface CourseFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<TrainingCourse, 'id' | 'enrolledMemberIds'> & { id?: string }) => void;
    courseToEdit: TrainingCourse | null;
    pathways: SpiritualPathway[];
    members: Member[];
}

const CourseFormModal: React.FC<CourseFormModalProps> = ({ isOpen, onClose, onSave, courseToEdit, pathways, members }) => {
    const [formData, setFormData] = useState<Partial<TrainingCourse>>({});

    useEffect(() => {
        if (isOpen) {
            setFormData(courseToEdit || {
                name: '', description: '', pathwayId: pathways[0]?.id || 'custom', customPathway: '', leaderId: '',
                status: 'Planifié', sessions: [], materials: [], isPaid: false, amount: 0,
            });
        }
    }, [isOpen, courseToEdit, pathways]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };
    
    const handleSessionChange = (index: number, field: keyof TrainingSession, value: string) => {
        const newSessions = [...(formData.sessions || [])];
        (newSessions[index] as any)[field] = value;
        setFormData(prev => ({ ...prev, sessions: newSessions }));
    };

    const addSession = () => {
        const newSession: TrainingSession = { id: `s_${Date.now()}`, topic: '', date: new Date().toISOString().split('T')[0], presentMemberIds: new Set() };
        setFormData(prev => ({ ...prev, sessions: [...(prev.sessions || []), newSession] }));
    };
    
    const removeSession = (index: number) => {
        setFormData(prev => ({ ...prev, sessions: (prev.sessions || []).filter((_, i) => i !== index) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Omit<TrainingCourse, 'id' | 'enrolledMemberIds'> & { id?: string });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-xl">
                    <h2 className="text-xl font-bold text-gray-800">{courseToEdit ? 'Modifier la formation' : 'Nouvelle Formation'}</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200"><XMarkIcon className="w-6 h-6" /></button>
                </header>
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto">
                    <div className="p-6 space-y-4">
                        <input name="name" value={formData.name || ''} onChange={handleChange} placeholder="Nom de la formation" required className="w-full p-2 border rounded-md" />
                        <textarea name="description" value={formData.description || ''} onChange={handleChange} placeholder="Description" rows={3} className="w-full p-2 border rounded-md" />
                        
                        <div className="grid grid-cols-2 gap-4">
                             <select name="leaderId" value={formData.leaderId || ''} onChange={handleChange} required className="w-full p-2 border rounded-md bg-white">
                                <option value="">-- Responsable --</option>
                                {members.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
                            </select>
                             <select name="status" value={formData.status || 'Planifié'} onChange={handleChange} className="w-full p-2 border rounded-md bg-white">
                                <option>Planifié</option><option>En cours</option><option>Terminé</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="text-sm font-medium">Parcours spirituel</label>
                            <select name="pathwayId" value={formData.pathwayId || 'custom'} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md bg-white">
                                {pathways.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                <option value="custom">Autre (personnalisé)</option>
                            </select>
                            {formData.pathwayId === 'custom' && (
                                <input name="customPathway" value={formData.customPathway || ''} onChange={handleChange} placeholder="Nom du parcours personnalisé" className="w-full mt-2 p-2 border rounded-md" />
                            )}
                        </div>

                        <div>
                            <label className="font-semibold">Sessions</label>
                            <div className="space-y-2 mt-2">
                                {formData.sessions?.map((session, index) => (
                                    <div key={session.id} className="flex items-center gap-2">
                                        <input value={session.topic} onChange={e => handleSessionChange(index, 'topic', e.target.value)} placeholder="Thème de la session" className="flex-grow p-2 border rounded-md" />
                                        <input type="date" value={session.date} onChange={e => handleSessionChange(index, 'date', e.target.value)} className="p-2 border rounded-md" />
                                        <button type="button" onClick={() => removeSession(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={addSession} className="text-sm flex items-center gap-1 text-blue-600 hover:underline mt-2"><PlusIcon className="w-4 h-4"/>Ajouter une session</button>
                        </div>
                    </div>
                    <footer className="flex justify-end items-center p-4 bg-gray-50 rounded-b-xl space-x-3 border-t sticky bottom-0">
                        <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md">Annuler</button>
                        <button type="submit" className="px-4 py-2 text-white bg-church-dark-blue rounded-md">{courseToEdit ? 'Enregistrer' : 'Créer'}</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

const CourseCard: React.FC<{
    course: TrainingCourse,
    pathway?: SpiritualPathway,
    leader?: Member,
    onView: (course: TrainingCourse) => void,
    onEdit: (course: TrainingCourse) => void,
    onDelete: (courseId: string) => void,
    openActionMenu: string | null;
    setOpenActionMenu: React.Dispatch<React.SetStateAction<string | null>>;
}> = ({ course, pathway, leader, onView, onEdit, onDelete, openActionMenu, setOpenActionMenu }) => {
     return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <div className="p-5 flex-grow">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-church-dark-teal">{course.name}</h3>
                     <span className={getStatusChip(course.status)}>{course.status}</span>
                </div>
                <p className="text-sm font-semibold text-gray-500">{pathway?.name || course.customPathway}</p>
                <p className="text-sm text-gray-600 mt-2 h-10 line-clamp-2">{course.description}</p>

                <div className="mt-4 pt-4 border-t space-y-2 text-sm">
                    <div className="flex items-center gap-2"><UserCircleIcon className="w-4 h-4 text-gray-400"/><span>Responsable: {leader ? `${leader.firstName} ${leader.lastName}` : 'N/A'}</span></div>
                    <div className="flex items-center gap-2"><UsersIcon className="w-4 h-4 text-gray-400"/><span>{course.enrolledMemberIds.length} participant(s)</span></div>
                    <div className="flex items-center gap-2"><CalendarDaysIcon className="w-4 h-4 text-gray-400"/><span>{course.sessions.length} session(s)</span></div>
                </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-b-lg mt-auto flex items-center justify-between">
                <button onClick={() => onView(course)} className="px-4 py-2 text-sm font-semibold text-church-dark-blue hover:bg-blue-100 rounded-md transition-colors">Gérer</button>
                <div className="relative" data-menu-container>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setOpenActionMenu(openActionMenu === course.id ? null : course.id); }} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                        <EllipsisVerticalIcon className="w-5 h-5" />
                    </button>
                    {openActionMenu === course.id && (
                        <div className="origin-top-right absolute right-0 bottom-full mb-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 border border-gray-200">
                            <div className="py-1" role="menu">
                                <button onClick={() => { onEdit(course); setOpenActionMenu(null); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    <PencilIcon className="w-5 h-5 text-gray-500" />
                                    <span>Modifier</span>
                                </button>
                                <button onClick={() => { onDelete(course.id); setOpenActionMenu(null); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                                    <TrashIcon className="w-5 h-5 text-red-400" />
                                    <span>Supprimer</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
     )
}


interface EducationProps {
    courses: TrainingCourse[];
    pathways: SpiritualPathway[];
    members: Member[];
    onViewMember: (member: Member) => void;
    onSaveCourse: (data: Omit<TrainingCourse, 'id'> & { id?: string }) => void;
    onDeleteCourse: (courseId: string) => void;
    onAddParticipantsToCourse: (courseId: string, memberIds: string[]) => void;
    onAttendanceChange: (courseId: string, sessionId: string, memberId: string, isPresent: boolean) => void;
    onToggleAllMemberAttendance: (courseId: string, memberId: string) => void;
}

const Education: React.FC<EducationProps> = ({ courses, pathways, members, onViewMember, onSaveCourse, onDeleteCourse, onAddParticipantsToCourse, onAttendanceChange, onToggleAllMemberAttendance }) => {
    const [isCourseFormOpen, setCourseFormOpen] = useState(false);
    const [isDetailViewOpen, setDetailViewOpen] = useState(false);
    const [isAddParticipantOpen, setAddParticipantOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<TrainingCourse | null>(null);
    const [courseToEdit, setCourseToEdit] = useState<TrainingCourse | null>(null);
    const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('[data-menu-container]')) {
                setOpenActionMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleOpenForm = (course: TrainingCourse | null = null) => {
        setCourseToEdit(course);
        setCourseFormOpen(true);
    };

    const handleViewDetails = (course: TrainingCourse) => {
        setSelectedCourse(course);
        setDetailViewOpen(true);
    };
    
    const handleAddParticipants = (course: TrainingCourse) => {
        setSelectedCourse(course);
        setAddParticipantOpen(true);
    };

    return (
        <div className="space-y-6">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Gestion des formations & enseignements</h2>
                    <p className="mt-1 text-gray-500">Créez des parcours, gérez les cours et suivez la progression des membres.</p>
                </div>
                <button onClick={() => handleOpenForm()} className="bg-church-dark-teal text-white px-4 py-2 rounded-md shadow hover:bg-church-teal transition-colors flex items-center justify-center">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Nouvelle Formation
                </button>
            </div>
            {courses.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {courses.map(course => (
                        <CourseCard
                            key={course.id}
                            course={course}
                            pathway={findDataById(course.pathwayId, pathways)}
                            leader={findDataById(course.leaderId, members)}
                            onView={handleViewDetails}
                            onEdit={handleOpenForm}
                            onDelete={onDeleteCourse}
                            openActionMenu={openActionMenu}
                            setOpenActionMenu={setOpenActionMenu}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-lg shadow-md">
                    <AcademicCapIcon className="w-16 h-16 mx-auto text-gray-300" />
                    <h3 className="mt-4 text-lg font-semibold text-gray-700">Aucune formation créée.</h3>
                    <p className="mt-1 text-sm text-gray-500">Commencez par ajouter votre première formation.</p>
                </div>
            )}
            
            <CourseFormModal
                isOpen={isCourseFormOpen}
                onClose={() => setCourseFormOpen(false)}
                onSave={(data) => {
                    onSaveCourse({
                        ...data,
                        enrolledMemberIds: courseToEdit?.enrolledMemberIds || [],
                    });
                    setCourseFormOpen(false);
                }}
                courseToEdit={courseToEdit}
                pathways={pathways}
                members={members}
            />

            {selectedCourse && isDetailViewOpen && <CourseDetailModal
                course={selectedCourse}
                onClose={() => setDetailViewOpen(false)}
                onAttendanceChange={onAttendanceChange}
                onToggleAllAttendanceForMember={onToggleAllMemberAttendance}
                members={members}
                pathways={pathways}
                onViewMember={onViewMember}
                onAddParticipants={handleAddParticipants}
            />}
            
            {selectedCourse && <AddParticipantToCourseModal
                isOpen={isAddParticipantOpen}
                onClose={() => setAddParticipantOpen(false)}
                onSave={(courseId, memberIds) => { onAddParticipantsToCourse(courseId, memberIds); setAddParticipantOpen(false); }}
                course={selectedCourse}
                members={members}
            />}
        </div>
    );
};

export default Education;
