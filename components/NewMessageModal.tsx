

import React, { useState } from 'react';
import { AppUser } from '../types';
import { XMarkIcon, PaperAirplaneIcon, MagnifyingGlassIcon } from './icons/HeroIcons';

interface NewMessageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSend: (recipientIds: string[], subject: string, text: string) => void;
    currentUser: AppUser;
    appUsers: AppUser[];
}

const NewMessageModal: React.FC<NewMessageModalProps> = ({ isOpen, onClose, onSend, currentUser, appUsers }) => {
    const [recipientIds, setRecipientIds] = useState<string[]>([]);
    const [subject, setSubject] = useState('');
    const [text, setText] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    if (!isOpen) return null;

    const availableUsers = appUsers.filter(u => u.id !== currentUser.id && u.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleRecipientToggle = (userId: string) => {
        setRecipientIds(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (recipientIds.length > 0 && subject.trim() && text.trim()) {
            onSend(recipientIds, subject, text);
        } else {
            alert("Veuillez sélectionner au moins un destinataire et remplir le sujet et le message.");
        }
    };
    
    const selectedUsers = appUsers.filter(u => recipientIds.includes(u.id));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-theme-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-theme-border bg-theme-table-header rounded-t-xl">
                    <h2 className="text-xl font-bold text-theme-text-base">Nouveau Message</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-theme-text-muted hover:bg-slate-200 dark:hover:bg-slate-600"><XMarkIcon className="w-6 h-6" /></button>
                </header>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 overflow-y-auto">
                        <div>
                            <label className="block text-sm font-medium text-theme-text-muted mb-1">À :</label>
                            <div className="p-2 border border-theme-border rounded-md min-h-[40px] flex flex-wrap gap-2">
                                {selectedUsers.map(user => (
                                    <span key={user.id} className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-sm font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                                        {user.name}
                                        <button type="button" onClick={() => handleRecipientToggle(user.id)} className="text-blue-500 hover:text-blue-700">
                                            <XMarkIcon className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="relative mt-2">
                                <MagnifyingGlassIcon className="w-5 h-5 text-theme-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Rechercher des destinataires..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border-b border-theme-border"
                                />
                            </div>
                            <div className="max-h-40 overflow-y-auto border border-t-0 border-theme-border rounded-b-md">
                                {availableUsers.map(user => (
                                    <label key={user.id} className="p-2 hover:bg-theme-bg cursor-pointer flex items-center gap-2" onClick={() => handleRecipientToggle(user.id)}>
                                        <input type="checkbox" readOnly checked={recipientIds.includes(user.id)} />
                                        <span className="text-theme-text-base">{user.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-theme-text-muted mb-1">Sujet</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                                className="w-full"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-theme-text-muted mb-1">Message</label>
                            <textarea
                                value={text}
                                onChange={e => setText(e.target.value)}
                                rows={6}
                                className="w-full"
                                required
                            />
                        </div>
                    </div>
                    <footer className="flex justify-end items-center p-4 bg-theme-table-header rounded-b-xl space-x-3 border-t border-theme-border">
                        <button type="button" onClick={onClose} className="btn btn-secondary">Annuler</button>
                        <button type="submit" className="btn btn-primary flex items-center gap-2">
                           <PaperAirplaneIcon className="w-5 h-5"/> Envoyer
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default NewMessageModal;