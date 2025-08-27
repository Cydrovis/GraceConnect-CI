import React, { useState } from 'react';
import { useAuth, useData } from '../contexts';
import { LockClosedIcon, CheckCircleIcon } from './icons/HeroIcons';

const ForcePasswordChange: React.FC = () => {
    const { currentUser, currentChurchId, handleChangePassword, setSessionState } = useAuth();
    const { churches, platformSettings: settings } = useData();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword.length < 4) {
             setError("Le mot de passe doit contenir au moins 4 caractères.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        if (!currentUser) {
            setError("Session utilisateur invalide. Veuillez vous reconnecter.");
            return;
        }
        
        // The default password is 'grace'
        const result = handleChangePassword(currentUser.id, 'grace', newPassword);

        if (result.success) {
            setSuccess("Mot de passe mis à jour avec succès ! Vous allez être redirigé...");
            setTimeout(() => {
                const currentChurch = churches.find(c => c.id === currentChurchId);
                if (currentChurch?.data.onboardingCompleted === false) {
                    setSessionState('onboarding');
                } else {
                    setSessionState('loggedInChurch');
                }
            }, 2000);
        } else {
            setError(result.message);
        }
    };

    if (!currentUser) return null;

    return (
        <div
            className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center p-4"
            style={{ backgroundImage: `url(${settings.loginPage.backgroundImageUrl})` }}
        >
            <div className="w-full max-w-sm">
                <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
                    <div className="text-center mb-6">
                        <div className="w-20 h-20 mx-auto rounded-full bg-white/20 border border-white/30 flex items-center justify-center mb-4">
                           <LockClosedIcon className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Sécurisez votre compte</h2>
                        <p className="mt-2 text-slate-300">
                            Bonjour {currentUser.name.split(' ')[0]}, pour votre sécurité, veuillez changer votre mot de passe par défaut.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <input
                                id="new-password"
                                type="password"
                                placeholder="Nouveau mot de passe"
                                className="w-full rounded-full border border-white/40 bg-white/20 !py-3 !px-6 text-white placeholder-slate-300"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="relative">
                            <input
                                id="confirm-password"
                                type="password"
                                placeholder="Confirmez le mot de passe"
                                className="w-full rounded-full border border-white/40 bg-white/20 !py-3 !px-6 text-white placeholder-slate-300"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && <div className="bg-red-500/50 text-white text-sm p-3 rounded-lg text-center">{error}</div>}
                        {success && <div className="bg-green-500/50 text-white text-sm p-3 rounded-lg text-center flex items-center justify-center gap-2"><CheckCircleIcon className="w-5 h-5"/>{success}</div>}

                        <button type="submit" disabled={!!success} className="w-full rounded-full bg-cyan-500/80 py-3 font-bold text-white transition-all hover:bg-cyan-500 active:scale-95 disabled:bg-gray-500">
                            Enregistrer et continuer
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForcePasswordChange;
