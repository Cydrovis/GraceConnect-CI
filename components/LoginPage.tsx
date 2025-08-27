import React, { useState, useEffect } from 'react';
import { UserIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, BuildingOffice2Icon } from './icons/HeroIcons';
import { useAuth, useData } from '../contexts';

export const LoginPage: React.FC = () => {
    const { handleLogin, loginError, setSessionState, handlePasswordResetRequest } = useAuth();
    const { platformSettings: settings } = useData();

    const [identifiant, setIdentifiant] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    const [formMode, setFormMode] = useState<'login' | 'forgot'>('login');
    const [forgotIdentifiant, setForgotIdentifiant] = useState('');
    const [forgotMessage, setForgotMessage] = useState('');
    const [localError, setLocalError] = useState(loginError);

    useEffect(() => {
        setLocalError(loginError);
    }, [loginError]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleLogin(identifiant, password);
    };
    
    const handleForgotSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const result = handlePasswordResetRequest(forgotIdentifiant);
        setForgotMessage(result.message);
        setForgotIdentifiant('');
    };

    const switchToForgot = () => {
        setFormMode('forgot');
        setLocalError('');
        setForgotMessage('');
    };
    
    const switchToLogin = () => {
        setFormMode('login');
        setForgotMessage('');
    };
    
    return (
        <div
            className="min-h-screen bg-cover bg-center font-sans text-white"
            style={{ backgroundImage: `url(${settings.loginPage.backgroundImageUrl})` }}
        >
            <div className="min-h-screen w-full bg-black/50 flex flex-col items-center justify-between p-4">
                <main className="flex flex-col items-center justify-center w-full max-w-md mt-8">
                    {/* Header */}
                    <div className="flex flex-col items-center gap-4 mb-6 text-center">
                        <div className="flex items-center gap-4">
                            <img src={settings.appLogoUrl} alt="GraceConnect Logo" className="w-12 h-12" />
                            <h1 className="text-4xl font-bold">GraceConnect</h1>
                        </div>
                        <div className="px-6 py-2 bg-orange-500 rounded-lg text-lg font-bold shadow-md">
                            GESTION D'ÉGLISE MODERNE
                        </div>
                        <div className="px-6 py-2 bg-green-600 rounded-lg text-base font-semibold shadow-md">
                            Plateforme de gestion pour votre communauté
                        </div>
                        <div className="px-4 py-1 bg-slate-800 rounded-md text-sm font-semibold">
                            (Edition 2025)
                        </div>
                    </div>

                    {/* Login Card */}
                    <div className="w-full bg-gray-700 p-8 rounded-2xl shadow-lg">
                        {formMode === 'login' ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="flex items-center gap-3 w-full rounded-full bg-white py-3 px-4 focus-within:ring-2 focus-within:ring-orange-500">
                                    <span className="text-orange-500 flex-shrink-0">
                                        <UserIcon className="w-5 h-5" />
                                    </span>
                                    <input
                                        id="identifiant"
                                        type="text"
                                        placeholder="Matricule ou E-mail"
                                        className="w-full border-0 bg-transparent p-0 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0"
                                        value={identifiant}
                                        onChange={(e) => setIdentifiant(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="flex items-center gap-3 w-full rounded-full bg-white py-3 px-4 focus-within:ring-2 focus-within:ring-orange-500">
                                    <span className="text-orange-500 flex-shrink-0">
                                        <LockClosedIcon className="w-5 h-5" />
                                    </span>
                                    <input
                                        id="password-login"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="MOT DE PASSE"
                                        className="w-full border-0 bg-transparent p-0 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="h-5 w-5 text-orange-500 flex-shrink-0">
                                        {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                                    </button>
                                </div>

                                {localError && (
                                    <div className="bg-red-500/50 text-white text-sm font-semibold p-3 rounded-lg text-center">
                                        {localError}
                                    </div>
                                )}
                                
                                <button type="button" onClick={switchToForgot} className="w-full rounded-md bg-yellow-500 py-3 font-bold text-slate-900 transition-all hover:bg-yellow-400 active:scale-95 shadow-md">
                                    Mot de passe oublié ?
                                </button>
                                
                                <button type="submit" className="w-full rounded-md bg-green-600 py-3 font-bold text-white transition-all hover:bg-green-500 active:scale-95 shadow-md">
                                    Connexion
                                </button>
                                
                                <div className="flex items-center justify-center my-2 gap-2">
                                    <span className="text-gray-400 text-sm">OU</span>
                                </div>

                                <button type="button" onClick={() => setSessionState('registering')} className="w-full flex items-center justify-center gap-2 rounded-md bg-orange-500 py-3 font-bold text-white transition-all hover:bg-orange-400 active:scale-95 shadow-md">
                                    <BuildingOffice2Icon className="w-5 h-5"/>
                                    Payer et Inscrire une église
                                </button>

                                <button type="button" onClick={() => setSessionState('activatingDirectly')} className="w-full rounded-md bg-indigo-800 py-3 font-bold text-white transition-all hover:bg-indigo-700 active:scale-95 shadow-md">
                                    J'ai déjà un code d'inscription
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleForgotSubmit} className="space-y-4">
                                <p className="text-center text-sm text-slate-300">
                                    Entrez le matricule ou l'e-mail de l'administrateur principal de votre église.
                                </p>
                                <div className="flex items-center gap-3 w-full rounded-full bg-white py-3 px-4 focus-within:ring-2 focus-within:ring-orange-500">
                                    <span className="text-orange-500 flex-shrink-0">
                                        <UserIcon className="w-5 h-5" />
                                    </span>
                                    <input
                                        id="forgot-identifiant"
                                        type="text"
                                        placeholder="Matricule ou E-mail de l'admin"
                                        value={forgotIdentifiant}
                                        onChange={e => setForgotIdentifiant(e.target.value)}
                                        className="w-full border-0 bg-transparent p-0 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0"
                                        required
                                    />
                                </div>
                                
                                 {forgotMessage && <div className={`p-3 rounded-lg text-sm font-semibold ${forgotMessage.includes('envoyée') ? 'bg-green-500/50 text-white' : 'bg-yellow-500/50 text-white'}`}>{forgotMessage}</div>}

                                <button type="submit" className="w-full rounded-md bg-green-600 py-3 font-bold text-white transition-all hover:bg-green-500 active:scale-95">
                                    Envoyer la demande
                                </button>
                                <button type="button" onClick={switchToLogin} className="w-full text-center text-sm font-medium text-orange-400 hover:underline">
                                    Retour à la connexion
                                </button>
                            </form>
                        )}
                    </div>
                </main>

                <footer className="w-full max-w-3xl text-center text-xs text-gray-300 py-4">
                    <p>Contact : {settings.loginPage.contactPhone}</p>
                    <p>Email : {settings.loginPage.contactEmail}</p>
                    <p>&copy; {settings.loginPage.copyrightYear} GraceConnect. Développé par {settings.developedByText}.</p>
                </footer>
            </div>
        </div>
    );
};
