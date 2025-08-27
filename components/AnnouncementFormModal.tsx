import React, { useState, useEffect } from 'react';
import { Announcement } from '../types';
import { XMarkIcon, PaperAirplaneIcon } from './icons/HeroIcons';

interface AnnouncementFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { id?: string; title: string; content: string }) => void;
    announcementToEdit: Announcement | null;
}

const AnnouncementFormModal: React.FC<AnnouncementFormModalProps> = ({ isOpen, onClose, onSave, announcementToEdit }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const isEditMode = !!announcementToEdit;

    useEffect(() => {
        if (isOpen) {
            if (announcementToEdit) {
                setTitle(announcementToEdit.title);
                setContent(announcementToEdit.content);
            } else {
                setTitle('');
                setContent('');
            }
        }
    }, [isOpen, announcementToEdit]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            alert("Veuillez remplir le titre et le contenu de l'annonce.");
            return;
        }
        onSave({ id: announcementToEdit?.id, title, content });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-theme-card rounded-xl shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-theme-border bg-theme-table-header rounded-t-xl">
                    <h2 className="text-xl font-bold text-theme-text-base">{isEditMode ? 'Modifier l\'annonce' : 'Créer une annonce'}</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-theme-text-muted hover:bg-slate-200 dark:hover:bg-slate-600"><XMarkIcon className="w-6 h-6" /></button>
                </header>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium mb-1">Titre</label>
                            <input
                                id="title"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="content" className="block text-sm font-medium mb-1">Contenu</label>
                            <textarea
                                id="content"
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                rows={8}
                                className="w-full"
                                required
                            ></textarea>
                        </div>
                    </div>
                    <footer className="flex justify-end items-center p-4 bg-theme-table-header rounded-b-xl space-x-3 border-t border-theme-border">
                        <button type="button" onClick={onClose} className="btn btn-secondary">Annuler</button>
                        <button type="submit" className="btn btn-primary flex items-center gap-2">
                           <PaperAirplaneIcon className="w-5 h-5"/>
                           {isEditMode ? 'Enregistrer les modifications' : 'Publier'}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default AnnouncementFormModal;