
import React, { useState } from 'react';
import { AppUser } from '../types';
import { KeyIcon, UserCircleIcon, XMarkIcon } from './icons/HeroIcons';
import { useAuth } from '../contexts';

const SuperAdminProfilePage: React.FC = () => {
    const { currentUser: user, handleSaveSuperAdminProfile, setSuperAdminProfileOpen } = useAuth();
    
    const [identifiant, setIdentifiant] = useState(user?.identifiant || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    if (!user) return null;
    
    const onClose = () => setSuperAdminProfileOpen(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (newPassword && newPassword !== confirmPassword) {
            setError("Le nouveau mot de passe et sa confirmation ne correspondent pas.");
            return;
        }

        const result = handleSaveSuperAdminProfile({
            identifiant,
            currentPassword,
            newPassword: newPassword || undefined,
        });

        if (result.success) {
            setMessage(result.message);
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-theme-card rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-theme-border bg-theme-table-header rounded-t-xl">
                    <h2 className="text-xl font-bold text-theme-text-base">Profil Super Administrateur</h2>
                    <button onClick={onClose} type="button" className="p-2 rounded-full text-theme-text-muted hover:bg-slate-200 dark:hover:bg-slate-600">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </header>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-6">
                        {error && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}
                        {message && <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm">{message}</div>}

                        <div>
                            <label htmlFor="identifiant" className="block text-sm font-medium text-theme-text-muted flex items-center gap-2">
                                <UserCircleIcon className="w-5 h-5" /> Identifiant / Login
                            </label>
                            <input id="identifiant" type="text" value={identifiant} onChange={e => setIdentifiant(e.target.value)} className="w-full mt-1" required />
                        </div>

                        <div className="border-t border-theme-border pt-4 space-y-4">
                             <p className="text-sm text-theme-text-muted">Pour modifier votre profil, veuillez entrer votre mot de passe actuel.</p>
                             <div>
                                <label className="block text-sm font-medium text-theme-text-muted flex items-center gap-2">
                                    <KeyIcon className="w-5 h-5" /> Mot de passe actuel
                                </label>
                                <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full mt-1" required />
                            </div>
                        </div>

                        <div className="border-t border-theme-border pt-4 space-y-4">
                            <p className="text-sm text-theme-text-muted">Laissez les champs suivants vides si vous ne souhaitez pas changer de mot de passe.</p>
                             <div>
                                <label className="block text-sm font-medium text-theme-text-muted flex items-center gap-2">
                                    <KeyIcon className="w-5 h-5" /> Nouveau mot de passe
                                </label>
                                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full mt-1" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-theme-text-muted flex items-center gap-2">
                                    <KeyIcon className="w-5 h-5" /> Confirmer le nouveau mot de passe
                                </label>
                                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full mt-1" />
                            </div>
                        </div>

                    </div>
                    <footer className="flex justify-end items-center p-4 bg-theme-table-header rounded-b-xl space-x-3 border-t border-theme-border">
                        <button type="button" onClick={onClose} className="btn btn-secondary"> Annuler </button>
                        <button type="submit" className="btn btn-primary"> Enregistrer </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default SuperAdminProfilePage;