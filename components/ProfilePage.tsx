import React, { useState, useRef } from 'react';
import { AppUser, UserAvailability } from '../types';
import { KeyIcon, UserCircleIcon, CalendarDaysIcon, BriefcaseIcon, PhotoIcon, XMarkIcon } from './icons/HeroIcons';

interface ProfilePageProps {
    user: AppUser;
    onSave: (updatedUser: AppUser) => void;
    onChangePassword: (userId: string, current: string, newPass: string) => { success: boolean, message: string };
    onClose: () => void;
}

const TabButton: React.FC<{ label: string; active: boolean; onClick: () => void; icon: React.ReactNode }> = ({ label, active, onClick, icon }) => (
    <button
        type="button"
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors text-left ${
            active 
            ? 'bg-church-teal text-white' 
            : 'text-theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-700'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const defaultAvailability: UserAvailability[] = [
    { day: 'Lundi', isAvailable: false },
    { day: 'Mardi', isAvailable: false },
    { day: 'Mercredi', isAvailable: false },
    { day: 'Jeudi', isAvailable: false },
    { day: 'Vendredi', isAvailable: false },
    { day: 'Samedi', isAvailable: true },
    { day: 'Dimanche', isAvailable: true },
];

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onSave, onChangePassword, onClose }) => {
    const [activeTab, setActiveTab] = useState('info');
    const [formData, setFormData] = useState<AppUser>(user);
    const [photoPreview, setPhotoPreview] = useState<string>(user.photoUrl);
    const photoInputRef = useRef<HTMLInputElement>(null);
    
    // State for password form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordMessage, setPasswordMessage] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleAvailabilityChange = (day: UserAvailability['day'], field: 'isAvailable' | 'notes', value: boolean | string) => {
        const currentAvailability = formData.availability || defaultAvailability;
        const updatedAvailability = currentAvailability.map(item => 
            item.day === day ? { ...item, [field]: value } : item
        );
        setFormData(prev => ({ ...prev, availability: updatedAvailability }));
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
                setFormData(prev => ({...prev, photoUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const handlePasswordSave = () => {
        setPasswordMessage('');
        setPasswordError('');

        if (newPassword !== confirmPassword) {
            setPasswordError("Le nouveau mot de passe et sa confirmation ne correspondent pas.");
            return;
        }
        if (!newPassword || !currentPassword) {
            setPasswordError("Veuillez remplir tous les champs de mot de passe.");
            return;
        }

        const result = onChangePassword(user.id, currentPassword, newPassword);

        if (result.success) {
            setPasswordMessage(result.message);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } else {
            setPasswordError(result.message);
        }
    };

    const clearPasswordForm = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordError('');
        setPasswordMessage('');
    };

    const today = new Date();
    today.setHours(0,0,0,0);
    const activeRoles = user.roles.filter(r => new Date(r.startDate) <= today && (!r.endDate || new Date(r.endDate) >= today));
    const upcomingRoles = user.roles.filter(r => new Date(r.startDate) > today);
    const pastRoles = user.roles.filter(r => r.endDate && new Date(r.endDate) < today);


    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-theme-card rounded-xl shadow-2xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                 <header className="flex items-center justify-between p-4 border-b border-theme-border bg-theme-table-header rounded-t-xl">
                    <h2 className="text-xl font-bold text-theme-text-base">Mon Profil</h2>
                    <button onClick={onClose} type="button" className="p-2 rounded-full text-theme-text-muted hover:bg-slate-200 dark:hover:bg-slate-700">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </header>
                <div className="flex flex-grow overflow-hidden">
                    <aside className="w-64 p-4 border-r border-theme-border flex-shrink-0">
                        <div className="flex flex-col items-center mb-6">
                            <img src={photoPreview} alt="Profile" className="w-24 h-24 rounded-full object-cover mb-2" />
                            <h3 className="font-semibold text-lg text-theme-text-base">{user.name}</h3>
                            <p className="text-sm text-theme-text-muted">{activeRoles[0]?.role || 'Aucun rôle'}</p>
                        </div>
                        <nav className="space-y-1">
                            <TabButton label="Informations" icon={<UserCircleIcon className="w-5 h-5"/>} active={activeTab === 'info'} onClick={() => setActiveTab('info')} />
                            <TabButton label="Sécurité" icon={<KeyIcon className="w-5 h-5"/>} active={activeTab === 'security'} onClick={() => setActiveTab('security')} />
                            <TabButton label="Disponibilités" icon={<CalendarDaysIcon className="w-5 h-5"/>} active={activeTab === 'availability'} onClick={() => setActiveTab('availability')} />
                            <TabButton label="Rôles & Missions" icon={<BriefcaseIcon className="w-5 h-5"/>} active={activeTab === 'roles'} onClick={() => setActiveTab('roles')} />
                        </nav>
                    </aside>
                    <main className="flex-1 overflow-y-auto">
                        <form onSubmit={handleSubmit}>
                            <div className="p-6">
                                {activeTab === 'info' && (
                                     <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-theme-text-base">Informations Personnelles</h3>
                                        <input type="file" ref={photoInputRef} onChange={handlePhotoChange} className="hidden" accept="image/*" />
                                        <button type="button" onClick={() => photoInputRef.current?.click()} className="flex items-center gap-2 text-sm text-blue-600 hover:underline"><PhotoIcon className="w-4 h-4"/> Changer de photo</button>
                                        <input name="name" value={formData.name} onChange={handleFormChange} placeholder="Nom complet" className="w-full" />
                                        <input name="email" type="email" value={formData.email} onChange={handleFormChange} placeholder="Email" className="w-full" />
                                        <input name="contact" value={formData.contact} onChange={handleFormChange} placeholder="Contact" className="w-full" />
                                     </div>
                                )}
                                {activeTab === 'security' && (
                                     <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-theme-text-base">Changer le mot de passe</h3>
                                        
                                        {passwordError && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{passwordError}</div>}
                                        {passwordMessage && <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm">{passwordMessage}</div>}

                                        <div className="space-y-4 pt-2">
                                            <div>
                                                <label className="block text-sm font-medium text-theme-text-muted">Mot de passe actuel</label>
                                                <input name="currentPassword" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full mt-1" required/>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-theme-text-muted">Nouveau mot de passe</label>
                                                <input name="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full mt-1" required/>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-theme-text-muted">Confirmer le nouveau mot de passe</label>
                                                <input name="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full mt-1" required/>
                                            </div>
                                            <div className="flex justify-end pt-2">
                                                <button type="button" onClick={clearPasswordForm} className="btn btn-secondary">Fermer</button>
                                                <button type="button" onClick={handlePasswordSave} className="ml-3 btn btn-primary">Enregistrer les modifications</button>
                                            </div>
                                        </div>
                                     </div>
                                )}
                                {activeTab === 'availability' && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-theme-text-base mb-2">Mes disponibilités pour le service</h3>
                                        <div className="space-y-2">
                                            {(formData.availability || defaultAvailability).map(avail => (
                                                <div key={avail.day} className="grid grid-cols-12 items-center gap-2 p-2 border border-theme-border rounded-md bg-theme-bg">
                                                    <label className="col-span-2 font-medium text-theme-text-base">{avail.day}</label>
                                                    <div className="col-span-3">
                                                         <button type="button" onClick={() => handleAvailabilityChange(avail.day, 'isAvailable', !avail.isAvailable)} className={`w-24 text-sm font-semibold py-1 rounded-full ${avail.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                            {avail.isAvailable ? 'Disponible' : 'Indisponible'}
                                                        </button>
                                                    </div>
                                                    <div className="col-span-7">
                                                        <input value={avail.notes || ''} onChange={e => handleAvailabilityChange(avail.day, 'notes', e.target.value)} placeholder="Notes (ex: matin seulement)" className="w-full text-sm"/>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {activeTab === 'roles' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-semibold text-theme-text-base">Rôles Actifs</h3>
                                            <ul className="list-disc list-inside text-sm mt-2 text-theme-text-base">
                                                {activeRoles.map((r,i) => <li key={i}>{r.role} (depuis le {new Date(r.startDate).toLocaleDateString()}{r.endDate ? `, jusqu'au ${new Date(r.endDate).toLocaleDateString()}` : ''})</li>)}
                                            </ul>
                                        </div>
                                         <div>
                                            <h3 className="text-lg font-semibold text-theme-text-base">Rôles à venir</h3>
                                            <ul className="list-disc list-inside text-sm mt-2 text-theme-text-base">
                                                {upcomingRoles.map((r,i) => <li key={i}>{r.role} (à partir du {new Date(r.startDate).toLocaleDateString()})</li>)}
                                            </ul>
                                        </div>
                                         <div>
                                            <h3 className="text-lg font-semibold text-theme-text-base">Rôles passés</h3>
                                            <ul className="list-disc list-inside text-sm mt-2 text-theme-text-muted">
                                                {pastRoles.map((r,i) => <li key={i}>{r.role} (jusqu'au {new Date(r.endDate!).toLocaleDateString()})</li>)}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                             <footer className="flex justify-end items-center p-4 bg-theme-table-header rounded-b-xl space-x-3 border-t border-theme-border sticky bottom-0">
                                <button type="button" onClick={onClose} className="btn btn-secondary">Fermer</button>
                                <button type="submit" className="btn btn-primary">Enregistrer les modifications</button>
                            </footer>
                        </form>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;