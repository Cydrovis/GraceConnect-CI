
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ArchiveBoxIcon, DocumentPlusIcon, MagnifyingGlassIcon, DocumentArrowDownIcon, TrashIcon, PaperClipIcon, XMarkIcon, DocumentTextIcon, EllipsisVerticalIcon } from './icons/HeroIcons';
import { ChurchDocument, Member, AppUser, ChurchSettings } from '../types';
import CreateMinutesModal, { MinutesData } from './CreateMinutesModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const getFileTypeIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <span className="text-red-500 font-bold">PDF</span>;
    if (fileType.includes('word')) return <span className="text-blue-500 font-bold">DOC</span>;
    if (fileType.includes('image')) return <span className="text-green-500 font-bold">IMG</span>;
    return <span className="text-gray-500 font-bold">FILE</span>;
};

const getPrimaryRole = (user: AppUser): string => {
    if (!user.roles || user.roles.length === 0) return 'Aucun rôle';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeRoles = user.roles.filter(role => {
        const startDate = new Date(role.startDate + 'T00:00:00');
        const hasStarted = startDate <= today;
        if (!role.endDate) {
            return hasStarted;
        }
        const endDate = new Date(role.endDate + 'T00:00:00');
        const hasEnded = endDate < today;
        return hasStarted && !hasEnded;
    });

    return activeRoles.length > 0 ? activeRoles[0].role : (user.roles[0]?.role || 'Rôle inactif');
}

const UploadModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<ChurchDocument, 'id' | 'uploadedById' | 'fileUrl'> & { file: File }) => void;
}> = ({ isOpen, onClose, onSave }) => {
    const [file, setFile] = useState<File | null>(null);
    const [docName, setDocName] = useState('');

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setDocName(selectedFile.name.replace(/\.[^/.]+$/, "")); // remove extension
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        if (file) {
            const data = {
                name: formData.get('name') as string,
                category: formData.get('category') as ChurchDocument['category'],
                description: formData.get('description') as string,
                file: file,
                uploadDate: new Date().toISOString().split('T')[0],
                fileType: file.type,
                fileName: file.name
            };
            onSave(data);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-theme-card rounded-xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-theme-border bg-theme-table-header rounded-t-xl">
                    <h2 className="text-xl font-bold text-theme-text-base">Télécharger un document</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-theme-text-muted hover:bg-slate-200 dark:hover:bg-slate-600"><XMarkIcon className="w-6 h-6" /></button>
                </header>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Fichier</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-theme-border border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    <PaperClipIcon className="mx-auto h-12 w-12 text-theme-text-muted" />
                                    <div className="flex text-sm text-theme-text-muted">
                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-theme-card rounded-md font-medium text-theme-accent hover:text-theme-accent">
                                            <span>Choisir un fichier</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} required />
                                        </label>
                                        <p className="pl-1">ou glissez-déposez</p>
                                    </div>
                                    <p className="text-xs text-theme-text-muted">{file ? file.name : "PDF, DOCX, PNG, JPG jusqu'à 10MB"}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium mb-1">Nom du document</label>
                            <input type="text" name="name" id="name" value={docName} onChange={e => setDocName(e.target.value)} required className="w-full" />
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium mb-1">Catégorie</label>
                            <select name="category" id="category" required className="w-full">
                                <option>Certificat de baptême</option>
                                <option>Rapport annuel</option>
                                <option>Procès-verbal</option>
                                <option>Autre</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium mb-1">Description (Optionnel)</label>
                            <textarea name="description" id="description" rows={3} className="w-full"></textarea>
                        </div>
                    </div>
                    <footer className="flex justify-end items-center p-4 bg-theme-table-header rounded-b-xl space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-theme-border rounded-md text-theme-text-base bg-theme-card hover:bg-theme-bg">Annuler</button>
                        <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-church-dark-blue hover:bg-blue-900">Enregistrer</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

interface DocumentsProps {
    documents: ChurchDocument[];
    members: Member[];
    appUsers: AppUser[];
    churchSettings: ChurchSettings;
    onSaveDocument: (data: Omit<ChurchDocument, 'id' | 'uploadedById' | 'fileUrl'> & { file?: File, fileUrl?: string }) => void;
    onDeleteDocument: (docId: string) => void;
}


const Documents: React.FC<DocumentsProps> = ({ documents, members, appUsers, churchSettings, onSaveDocument, onDeleteDocument }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [isUploadModalOpen, setUploadModalOpen] = useState(false);
    const [isMinutesModalOpen, setMinutesModalOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    
    const filteredDocuments = useMemo(() => {
        return documents
            .filter(doc => filterCategory === 'all' || doc.category === filterCategory)
            .filter(doc => doc.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a,b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
    }, [documents, searchTerm, filterCategory]);

    const handleSaveUpload = (data: Omit<ChurchDocument, 'id' | 'uploadedById' | 'fileUrl'> & { file: File }) => {
        onSaveDocument({
            name: data.name,
            category: data.category,
            description: data.description,
            uploadDate: new Date().toISOString().split('T')[0],
            fileName: data.file.name,
            fileType: data.file.type,
            file: data.file,
        });
        setUploadModalOpen(false);
    };

    const handleGenerateAndSaveMinutes = (data: MinutesData) => {
        const doc = new jsPDF();
        const pageHeight = doc.internal.pageSize.height;
        let y = 15;

        // Header
        doc.setFontSize(18);
        doc.text(churchSettings.name, 15, y);
        y += 7;
        doc.setFontSize(12);
        doc.text("Procès-Verbal de Réunion", 15, y);
        y += 10;
        doc.setLineWidth(0.5);
        doc.line(15, y, 195, y);
        y += 10;
        
        // Info
        autoTable(doc, {
            body: [
                ['Titre:', data.title],
                ['Date:', new Date(data.meetingDate).toLocaleDateString('fr-FR')],
            ],
            startY: y,
            theme: 'plain',
            styles: { fontSize: 10 },
        });
        y = (doc as any).lastAutoTable.finalY + 5;

        const attendeesList = data.attendees.map(id => {
            const user = appUsers.find(u => u.id === id);
            return user ? `${user.name} (${getPrimaryRole(user)})` : 'Participant inconnu';
        }).join('\n');
        
        autoTable(doc, {
            body: [['Participants:', attendeesList]],
            startY: y,
            theme: 'plain',
            styles: { fontSize: 10 },
        });
        y = (doc as any).lastAutoTable.finalY + 10;
        
        // Content
        const addSection = (title: string, content: string) => {
            if (y > pageHeight - 40) { doc.addPage(); y = 15; }
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(title, 15, y);
            y += 6;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            const splitText = doc.splitTextToSize(content, 180);
            doc.text(splitText, 15, y);
            y += (splitText.length * 4) + 10;
        };

        if (data.agenda.trim()) addSection("Ordre du Jour", data.agenda);
        if (data.decisions.trim()) addSection("Décisions Prises", data.decisions);

        if (data.actionPoints.length > 0) {
            if (y > pageHeight - 40) { doc.addPage(); y = 15; }
             doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text("Actions à Mener", 15, y);
            y += 6;
             autoTable(doc, {
                head: [['Action', 'Responsable']],
                body: data.actionPoints.map(ap => {
                    const resp = appUsers.find(u => u.id === ap.responsibleId);
                    return [ap.text, resp ? resp.name : 'Non assigné'];
                }),
                startY: y,
                theme: 'grid',
                styles: { fontSize: 10 },
            });
            y = (doc as any).lastAutoTable.finalY + 10;
        }
        
        const pdfDataUrl = doc.output('datauristring');
        
        onSaveDocument({
            name: `Procès-Verbal: ${data.title}`,
            category: 'Procès-verbal',
            description: `Réunion du ${new Date(data.meetingDate).toLocaleDateString('fr-FR')}`,
            uploadDate: new Date().toISOString().split('T')[0],
            fileName: `PV_${data.title.replace(/ /g, '_')}_${data.meetingDate}.pdf`,
            fileType: 'application/pdf',
            fileUrl: pdfDataUrl,
        });

        setMinutesModalOpen(false);
    };

    const handleDeleteSingle = (docId: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
            onDeleteDocument(docId);
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(new Set(filteredDocuments.map(d => d.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleSelectOne = (id: string) => {
        const newSelectedIds = new Set(selectedIds);
        if (newSelectedIds.has(id)) {
            newSelectedIds.delete(id);
        } else {
            newSelectedIds.add(id);
        }
        setSelectedIds(newSelectedIds);
    };

    const handleDeleteSelected = () => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer les ${selectedIds.size} documents sélectionnés ?`)) {
            selectedIds.forEach(id => onDeleteDocument(id));
            setSelectedIds(new Set());
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-theme-text-base">Documents & archivage</h2>
                    <p className="mt-1 text-theme-text-muted">Gérez tous les documents importants de l'église en un seul endroit.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setMinutesModalOpen(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 transition-colors flex items-center justify-center">
                        <DocumentTextIcon className="w-5 h-5 mr-2" />
                        Créer un Procès-Verbal
                    </button>
                    <button
                        onClick={() => setUploadModalOpen(true)}
                        className="bg-church-dark-teal text-white px-4 py-2 rounded-md shadow hover:bg-church-teal transition-colors flex items-center justify-center">
                        <DocumentPlusIcon className="w-5 h-5 mr-2" />
                        Télécharger un document
                    </button>
                </div>
            </div>

            <div className="bg-theme-card p-4 rounded-lg shadow-md">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                    <div className="relative w-full md:w-1/3">
                        <MagnifyingGlassIcon className="w-5 h-5 text-theme-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Rechercher un document..."
                            className="w-full pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <select
                            value={filterCategory}
                            onChange={e => setFilterCategory(e.target.value)}
                            className="w-full md:w-auto text-sm">
                            <option value="all">Toutes les catégories</option>
                            <option value="Certificat de baptême">Certificats de baptême</option>
                            <option value="Rapport annuel">Rapports annuels</option>
                            <option value="Procès-verbal">Procès-verbaux</option>
                            <option value="Autre">Autres</option>
                        </select>
                    </div>
                </div>

                {selectedIds.size > 0 && (
                    <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg mb-4 flex items-center justify-between">
                        <span className="text-sm font-semibold text-theme-text-base">{selectedIds.size} document(s) sélectionné(s)</span>
                        <div className="flex items-center gap-2">
                            <button onClick={() => alert("Fonctionnalité à venir")} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-theme-text-base bg-theme-card rounded-md border border-theme-border hover:bg-theme-bg"><DocumentArrowDownIcon className="w-4 h-4"/>Télécharger</button>
                            <button onClick={handleDeleteSelected} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 bg-theme-card rounded-md border border-red-200 hover:bg-red-50 dark:border-red-800/50 dark:hover:bg-red-900/20"><TrashIcon className="w-4 h-4"/>Supprimer</button>
                        </div>
                    </div>
                )}


                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-theme-text-muted">
                        <thead className="text-xs text-theme-text-base uppercase bg-theme-table-header">
                            <tr>
                                <th scope="col" className="p-4">
                                    <input type="checkbox" className="w-4 h-4 text-church-dark-blue rounded focus:ring-church-light-teal" 
                                    onChange={handleSelectAll}
                                    checked={filteredDocuments.length > 0 && selectedIds.size === filteredDocuments.length}
                                    />
                                </th>
                                <th scope="col" className="px-6 py-3">Nom du document</th>
                                <th scope="col" className="px-6 py-3">Catégorie</th>
                                <th scope="col" className="px-6 py-3">Téléchargé par</th>
                                <th scope="col" className="px-6 py-3">Date</th>
                                <th scope="col" className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDocuments.map(doc => {
                                const uploader = appUsers.find(u => u.id === doc.uploadedById);
                                return (
                                <tr key={doc.id} className="bg-theme-card border-b border-theme-border hover:bg-theme-bg">
                                    <td className="w-4 p-4">
                                        <input type="checkbox" className="w-4 h-4 text-church-dark-blue rounded" 
                                        checked={selectedIds.has(doc.id)}
                                        onChange={() => handleSelectOne(doc.id)}
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 text-center">{getFileTypeIcon(doc.fileType)}</div>
                                            <div>
                                                <p className="font-semibold text-theme-text-base">{doc.name}</p>
                                                <p className="text-xs text-theme-text-muted">{doc.description}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{doc.category}</td>
                                    <td className="px-6 py-4">{uploader ? uploader.name : 'Utilisateur inconnu'}</td>
                                    <td className="px-6 py-4">{new Date(doc.uploadDate).toLocaleDateString('fr-FR')}</td>
                                    <td className="px-6 py-4 text-center">
                                         <div className="flex items-center justify-center gap-2">
                                            <a 
                                                href={doc.fileUrl} 
                                                download={doc.fileName}
                                                className="p-2 text-theme-text-muted hover:text-blue-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                                                title="Télécharger"
                                            >
                                                <DocumentArrowDownIcon className="w-5 h-5"/>
                                            </a>
                                            <button 
                                                onClick={() => handleDeleteSingle(doc.id)}
                                                className="p-2 text-theme-text-muted hover:text-red-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                                                title="Supprimer"
                                            >
                                                <TrashIcon className="w-5 h-5"/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                 {filteredDocuments.length === 0 && (
                     <div className="text-center py-10">
                        <DocumentTextIcon className="w-12 h-12 mx-auto text-theme-text-muted opacity-50" />
                        <h3 className="mt-2 text-md font-semibold text-theme-text-base">Aucun document trouvé</h3>
                        <p className="mt-1 text-sm text-theme-text-muted">Essayez de modifier vos filtres ou téléchargez un nouveau document.</p>
                    </div>
                )}
            </div>

            <UploadModal 
                isOpen={isUploadModalOpen}
                onClose={() => setUploadModalOpen(false)}
                onSave={handleSaveUpload}
            />
             <CreateMinutesModal
                isOpen={isMinutesModalOpen}
                onClose={() => setMinutesModalOpen(false)}
                onSave={handleGenerateAndSaveMinutes}
                appUsers={appUsers}
            />
        </div>
    );
};

export default Documents;