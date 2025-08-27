import React, { useState } from 'react';
import { Announcement, AppUser } from '../types';
import { MegaphoneIcon, PlusIcon, PencilIcon, TrashIcon } from './icons/HeroIcons';
import ConfirmationModal from './ConfirmationModal';

interface CommunicationsProps {
    announcements: Announcement[];
    appUsers: AppUser[];
    currentUser: AppUser;
    onOpenForm: () => void;
    onEdit: (announcement: Announcement) => void;
    onDelete: (announcementId: string) => void;
}

const Communications: React.FC<CommunicationsProps> = ({ announcements, appUsers, currentUser, onOpenForm, onEdit, onDelete }) => {
    const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null);

    const findUser = (id: string) => appUsers.find(u => u.id === id);
    const canManage = (announcement: Announcement) => {
        return currentUser.roles.some(r => r.role === 'Administrateur principal') || currentUser.id === announcement.authorId;
    };

    const handleDeleteConfirm = () => {
        if (announcementToDelete) {
            onDelete(announcementToDelete.id);
            setAnnouncementToDelete(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <MegaphoneIcon className="w-8 h-8 text-theme-accent" />
                    <div>
                        <h2 className="text-2xl font-bold text-theme-text-base">Gestion des Annonces</h2>
                        <p className="text-sm text-theme-text-muted">Affichez, modifiez ou supprimez les annonces de l'église.</p>
                    </div>
                </div>
                <button onClick={onOpenForm} className="bg-church-dark-blue text-white px-4 py-2 rounded-md shadow hover:bg-blue-900 flex items-center gap-2 w-full md:w-auto justify-center">
                    <PlusIcon className="w-5 h-5" />
                    Créer une annonce
                </button>
            </div>
            
            <div className="space-y-4">
                {announcements.length > 0 ? (
                    announcements.map(announcement => {
                        const author = findUser(announcement.authorId);
                        return (
                            <div key={announcement.id} className="bg-theme-card p-4 rounded-lg shadow-md border-l-4 border-theme-accent">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-bold text-theme-text-base">{announcement.title}</h3>
                                        <p className="text-xs text-theme-text-muted">
                                            Par {author?.name || 'Inconnu'} le {new Date(announcement.createdAt).toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>
                                    {canManage(announcement) && (
                                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                            <button onClick={() => onEdit(announcement)} className="p-2 text-theme-text-muted hover:text-blue-600 rounded-full hover:bg-slate-100">
                                                <PencilIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => setAnnouncementToDelete(announcement)} className="p-2 text-theme-text-muted hover:text-red-600 rounded-full hover:bg-slate-100">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <p className="mt-2 text-sm text-theme-text-muted whitespace-pre-wrap">{announcement.content}</p>
                            </div>
                        )
                    })
                ) : (
                    <div className="text-center py-16 bg-theme-table-header rounded-lg">
                        <MegaphoneIcon className="w-12 h-12 mx-auto text-gray-400" />
                        <h3 className="mt-2 text-lg font-semibold text-theme-text-base">Aucune annonce pour le moment</h3>
                        <p className="mt-1 text-sm text-theme-text-muted">Cliquez sur "Créer une annonce" pour en publier une.</p>
                    </div>
                )}
            </div>
            <ConfirmationModal
                isOpen={!!announcementToDelete}
                onClose={() => setAnnouncementToDelete(null)}
                onConfirm={handleDeleteConfirm}
                title="Supprimer l'annonce"
                message={`Êtes-vous sûr de vouloir supprimer l'annonce "${announcementToDelete?.title}" ? Cette action est irréversible.`}
            />
        </div>
    );
};

export default Communications;