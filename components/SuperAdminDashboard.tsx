import React, { useState, useRef, useEffect } from 'react';
import { Church, InscriptionCode, PlatformSettings, LoginPromotionalText, AppColors, AppUser, PaymentRequest, PaymentMethodConfig } from '../types';
import { BuildingOffice2Icon, KeyIcon, PlusIcon, DocumentArrowDownIcon, TrashIcon, CheckCircleIcon, XCircleIcon, PowerIcon, Cog6ToothIcon, ChevronDownIcon, ArrowPathIcon, BanknotesIcon, HomeIcon, Bars3Icon, XMarkIcon, DocumentDuplicateIcon } from './icons/HeroIcons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import LogoutConfirmationModal from './LogoutConfirmationModal';
import ConfirmationModal from './ConfirmationModal';
import { useData, useAuth } from '../contexts';
import { getActiveRoles, getPrimaryRole } from '../constants';

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white p-5 rounded-lg shadow-md flex items-center gap-4">
        <div className="bg-gray-100 p-3 rounded-full text-gray-600">{icon}</div>
        <div>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
            <p className="text-sm font-medium text-gray-500">{title}</p>
        </div>
    </div>
);

const PlatformSettingsEditor: React.FC = () => {
    const { platformSettings, setPlatformSettings } = useData();
    const [localSettings, setLocalSettings] = useState(platformSettings);
    const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
    const [settingsTab, setSettingsTab] = useState('general');

    const handleRootChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setLocalSettings(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
    };

    const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({ ...prev, loginPage: { ...prev.loginPage, [name]: value } }));
    };
    
    const handleFileChange = (file: File | null, callback: (dataUrl: string) => void) => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => callback(reader.result as string);
            reader.readAsDataURL(file);
        }
    };
    
    const handleColorChange = (colorKey: keyof AppColors, value: string) => {
        setLocalSettings(prev => ({ ...prev, colors: { ...prev.colors!, [colorKey]: value } }));
    };

    const handlePromoChange = (promoKey: 'promoText1' | 'promoText2' | 'promoText3', field: keyof LoginPromotionalText, value: string | boolean) => {
        setLocalSettings(prev => ({ ...prev, loginPage: { ...prev.loginPage, [promoKey]: { ...prev.loginPage[promoKey], [field]: value } } }));
    };
    
    const handlePaymentMethodChange = (index: number, field: keyof PaymentMethodConfig, value: string) => {
        const newMethods = [...localSettings.paymentMethods];
        (newMethods[index] as any)[field] = value;
        setLocalSettings(prev => ({...prev, paymentMethods: newMethods}));
    };

    const handleSave = () => {
        setPlatformSettings(localSettings);
        setShowSaveConfirmation(true);
        setTimeout(() => setShowSaveConfirmation(false), 3000);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-xl font-semibold text-gray-800">Paramètres de la Plateforme</h2>
                <div className="flex items-center gap-4">
                     {showSaveConfirmation && <div className="text-sm font-medium text-green-600 flex items-center gap-2 transition-opacity duration-300"><CheckCircleIcon className="w-5 h-5"/><span>Enregistré !</span></div>}
                    <button onClick={handleSave} className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">Enregistrer les modifications</button>
                </div>
            </div>
             <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6">
                    <button onClick={() => setSettingsTab('general')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${ settingsTab === 'general' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Général & Branding</button>
                    <button onClick={() => setSettingsTab('login')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${ settingsTab === 'login' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Page de Connexion</button>
                    <button onClick={() => setSettingsTab('payments')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${ settingsTab === 'payments' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Abonnement & Paiements</button>
                </nav>
            </div>
            
            <div className="mt-6">
                {settingsTab === 'general' && (
                    <div className="space-y-6">
                        <div className="border border-gray-200 p-4 rounded-md space-y-3">
                            <h3 className="font-semibold text-gray-900">Branding Général</h3>
                            <div><label className="block text-sm font-medium text-gray-700">Nom de l'application</label><input name="appName" value={localSettings.appName} onChange={handleRootChange} className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white" /></div>
                            <div><label className="block text-sm font-medium text-gray-700">Logo de l'application (télécharger)</label><input type="file" accept="image/*" onChange={(e) => handleFileChange(e.target.files?.[0] || null, (url) => setLocalSettings(prev => ({ ...prev, appLogoUrl: url })))} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />{localSettings.appLogoUrl && <img src={localSettings.appLogoUrl} alt="Aperçu du logo" className="w-16 h-16 mt-2 object-contain border p-1 rounded-md" />}</div>
                            <div><label className="block text-sm font-medium text-gray-700">"Développé par" (Sidebar)</label><input name="developedByText" value={localSettings.developedByText} onChange={handleRootChange} className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white" /></div>
                        </div>
                        <div className="border border-gray-200 p-4 rounded-md space-y-3">
                            <h3 className="font-semibold text-gray-900">Couleurs de la Plateforme</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {Object.entries(localSettings.colors || {}).map(([key, value]) => (<div key={key}><label className="block text-sm font-medium capitalize text-gray-700">{key.replace(/([A-Z])/g, ' $1').trim()}</label><div className="flex items-center gap-2"><input type="color" value={value} onChange={(e) => handleColorChange(key as keyof AppColors, e.target.value)} className="w-10 h-10 p-0 border-none rounded-md" /><input value={value} onChange={(e) => handleColorChange(key as keyof AppColors, e.target.value)} className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white" /></div></div>))}
                            </div>
                        </div>
                    </div>
                )}
                {settingsTab === 'login' && (
                     <div className="border border-gray-200 p-4 rounded-md space-y-3">
                        <h3 className="font-semibold text-gray-900">Page de Connexion</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Image de fond (télécharger)</label>
                            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e.target.files?.[0] || null, (url) => setLocalSettings(prev => ({...prev, loginPage: {...prev.loginPage, backgroundImageUrl: url}})))} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                            {localSettings.loginPage.backgroundImageUrl && <img src={localSettings.loginPage.backgroundImageUrl} alt="Aperçu du fond" className="w-full h-24 mt-2 object-cover border p-1 rounded-md" />}
                        </div>
                        {([1, 2, 3] as const).map(i => {
                            const key = `promoText${i}` as const; const promo = localSettings.loginPage[key]; return (<div key={key} className="border p-4 rounded-md space-y-3 bg-gray-50"><div className="flex justify-between items-center"><h4 className="font-semibold text-gray-900">Texte promotionnel {i}</h4><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={promo.enabled} onChange={e => handlePromoChange(key, 'enabled', e.target.checked)} className="h-4 w-4 rounded text-blue-600"/> Activé</label></div><input placeholder="Texte" value={promo.text} onChange={e => handlePromoChange(key, 'text', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md bg-white" /><input placeholder="Classe de fond (ex: bg-orange-500)" value={promo.backgroundColor} onChange={e => handlePromoChange(key, 'backgroundColor', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md bg-white" /></div>);
                        })}
                        <div><label className="block text-sm font-medium text-gray-700">Contact téléphonique</label><input name="contactPhone" value={localSettings.loginPage.contactPhone} onChange={handleLoginChange} className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white" /></div>
                        <div><label className="block text-sm font-medium text-gray-700">Contact Email</label><input name="contactEmail" value={localSettings.loginPage.contactEmail} onChange={handleLoginChange} className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white" /></div>
                        <div><label className="block text-sm font-medium text-gray-700">Année du Copyright</label><input name="copyrightYear" value={localSettings.loginPage.copyrightYear} onChange={handleLoginChange} className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white" /></div>
                    </div>
                )}
                 {settingsTab === 'payments' && (
                    <div className="space-y-4">
                         <div className="border border-gray-200 p-4 rounded-md space-y-3">
                            <h3 className="font-semibold text-gray-900">Prix de l'abonnement</h3>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Prix de l'abonnement (annuel)</label>
                                <input name="subscriptionPrice" type="number" value={localSettings.subscriptionPrice} onChange={handleRootChange} className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Devise</label>
                                <input name="subscriptionPriceCurrency" value={localSettings.subscriptionPriceCurrency} onChange={handleRootChange} className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white" />
                            </div>
                        </div>

                        {localSettings.paymentMethods.map((method, index) => (
                            <div key={method.name} className="border border-gray-200 p-4 rounded-md space-y-3 bg-gray-50">
                                 <h3 className="font-semibold text-lg text-gray-900">{method.name}</h3>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div>
                                        <label className="block text-sm font-medium text-gray-700">Logo</label>
                                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e.target.files?.[0] || null, (url) => handlePaymentMethodChange(index, 'logoUrl', url))} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                        {method.logoUrl && <img src={method.logoUrl} alt="Logo" className="w-16 h-16 mt-2 object-contain border p-1 rounded-md bg-white"/>}
                                     </div>
                                      {method.name === 'Wave' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">QR Code</label>
                                            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e.target.files?.[0] || null, (url) => handlePaymentMethodChange(index, 'qrCodeUrl', url))} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                            {method.qrCodeUrl && <img src={method.qrCodeUrl} alt="QR Code" className="w-16 h-16 mt-2 object-contain border p-1 rounded-md bg-white"/>}
                                        </div>
                                    )}
                                 </div>
                                 <div><label className="block text-sm font-medium text-gray-700">Numéro de téléphone</label><input value={method.number} onChange={e => handlePaymentMethodChange(index, 'number', e.target.value)} className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white" /></div>
                                 <div><label className="block text-sm font-medium text-gray-700">Détails / Instructions</label><input value={method.details} onChange={e => handlePaymentMethodChange(index, 'details', e.target.value)} className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white" /></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const PaymentDetailsModal: React.FC<{
    request: PaymentRequest | null;
    onClose: () => void;
}> = ({ request, onClose }) => {
    if (!request) return null;
    const { churchOnboardingData: church, adminOnboardingData: admin, logoDataUrl } = request;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                 <header className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-xl">
                    <h2 className="text-xl font-bold text-gray-800">Détails de la demande d'inscription</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200"><XMarkIcon className="w-6 h-6" /></button>
                </header>
                 <div className="p-6 overflow-y-auto space-y-6 text-black">
                    {logoDataUrl && (
                        <div className="text-center">
                            <img src={logoDataUrl} alt="Logo" className="w-24 h-24 object-contain inline-block border p-2 rounded-full bg-white"/>
                        </div>
                    )}
                    {church && (
                        <fieldset className="border p-4 rounded-md">
                            <legend className="px-2 font-semibold">Informations sur l'église</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                <p><strong>Nom:</strong> {church.name}</p>
                                <p><strong>Dénomination:</strong> {church.denomination}</p>
                                <p><strong>Statut Légal:</strong> {church.legalStatus}</p>
                                <p><strong>Date de fondation:</strong> {church.foundationDate || 'N/A'}</p>
                                <p><strong>Pays:</strong> {church.country}</p>
                                <p><strong>Ville:</strong> {church.city}</p>
                                <p><strong>Quartier:</strong> {church.neighborhood}</p>
                                <p><strong>Adresse:</strong> {church.address}</p>
                                <p><strong>Email:</strong> {church.adminEmail}</p>
                                <p><strong>Téléphone:</strong> {church.phone}</p>
                                <p><strong>WhatsApp:</strong> {church.whatsapp || 'N/A'}</p>
                                <p><strong>Site Web:</strong> {church.website || 'N/A'}</p>
                            </div>
                        </fieldset>
                    )}
                    {admin && (
                         <fieldset className="border p-4 rounded-md">
                            <legend className="px-2 font-semibold">Informations sur l'administrateur</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                <p><strong>Nom:</strong> {admin.name}</p>
                                <p><strong>Email:</strong> {admin.email}</p>
                                <p><strong>Contact:</strong> {admin.contact}</p>
                                <p className="col-span-2"><strong>Rôles:</strong> {admin.roles.map(r => r.role).join(', ')}</p>
                            </div>
                        </fieldset>
                    )}
                 </div>
                 <footer className="p-4 bg-gray-50 rounded-b-xl border-t text-right">
                    <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm">Fermer</button>
                 </footer>
            </div>
        </div>
    );
};

const ChurchDetailsModal: React.FC<{
    church: Church | null;
    onClose: () => void;
}> = ({ church, onClose }) => {
    if (!church) return null;
    const { data } = church;
    const settings = data.settings;
    const admin = data.appUsers.find(u => getActiveRoles(u).includes('Administrateur principal')) || data.appUsers[0];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-xl">
                    <h2 className="text-xl font-bold text-gray-800">Détails de l'Église: {church.name}</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200"><XMarkIcon className="w-6 h-6" /></button>
                </header>
                <div className="p-6 overflow-y-auto space-y-6 text-black">
                    {settings.logoUrl && (
                        <div className="text-center">
                            <img src={settings.logoUrl} alt="Logo" className="w-24 h-24 object-contain inline-block border p-2 rounded-full bg-white"/>
                        </div>
                    )}
                    <fieldset className="border p-4 rounded-md">
                        <legend className="px-2 font-semibold">Informations Générales</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <p><strong>ID:</strong> {church.id}</p>
                            <p><strong>Nom:</strong> {settings.name}</p>
                            <p><strong>Slogan:</strong> {settings.slogan}</p>
                            <p><strong>Statut:</strong> {church.status}</p>
                            <p><strong>Date de création:</strong> {new Date(church.creationDate).toLocaleDateString('fr-FR')}</p>
                            <p><strong>Expiration:</strong> {church.expirationDate ? new Date(church.expirationDate).toLocaleDateString('fr-FR') : 'N/A'}</p>
                            <p><strong>Dénomination:</strong> {church.denomination}</p>
                            <p><strong>Statut Légal:</strong> {church.legalStatus}</p>
                        </div>
                    </fieldset>
                    <fieldset className="border p-4 rounded-md">
                        <legend className="px-2 font-semibold">Coordonnées</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <p><strong>Pays:</strong> {settings.country}</p>
                            <p><strong>Ville:</strong> {settings.city}</p>
                            <p><strong>Quartier:</strong> {settings.neighborhood}</p>
                            <p><strong>Adresse:</strong> {settings.address}</p>
                            <p><strong>Téléphone 1:</strong> {settings.phone}</p>
                            <p><strong>Téléphone 2:</strong> {settings.phone2 || 'N/A'}</p>
                            <p><strong>Email:</strong> {settings.email}</p>
                            <p><strong>WhatsApp:</strong> {settings.whatsapp || 'N/A'}</p>
                        </div>
                    </fieldset>
                    {admin && (
                         <fieldset className="border p-4 rounded-md">
                            <legend className="px-2 font-semibold">Administrateur Principal</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                <p><strong>Nom:</strong> {admin.name}</p>
                                <p><strong>Email:</strong> {admin.email}</p>
                                <p><strong>Contact:</strong> {admin.contact}</p>
                                <p><strong>Identifiant:</strong> {admin.identifiant}</p>
                                <p><strong>Rôle principal:</strong> {getPrimaryRole(admin)}</p>
                            </div>
                        </fieldset>
                    )}
                </div>
                <footer className="p-4 bg-gray-50 rounded-b-xl border-t text-right">
                    <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm">Fermer</button>
                </footer>
            </div>
        </div>
    );
};

const SubscriptionDurationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (durationInMonths: number) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
    const [duration, setDuration] = useState(12);

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (duration > 0) {
            onSubmit(duration);
        } else {
            alert("Veuillez entrer une durée valide.");
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-xl">
                    <h2 className="text-lg font-bold text-gray-800">Durée de l'Abonnement</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200"><XMarkIcon className="w-5 h-5" /></button>
                </header>
                <div className="p-6 space-y-4">
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Définir la durée de validité de l'abonnement en mois :</label>
                    <input 
                        id="duration" 
                        type="number"
                        value={duration}
                        onChange={e => setDuration(Number(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        min="1"
                    />
                </div>
                <footer className="flex justify-end items-center p-4 bg-gray-50 rounded-b-xl space-x-3 border-t">
                    <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">Annuler</button>
                    <button type="button" onClick={handleSubmit} className="px-4 py-2 border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700">Confirmer</button>
                </footer>
            </div>
        </div>
    );
};


const SuperAdminDashboard: React.FC = () => {
    const { churches, inscriptionCodes: codes, setChurches, setInscriptionCodes, passwordResetRequests, handleResolvePasswordReset, paymentRequests, handleValidatePayment, handleRejectPayment } = useData();
    const { currentUser: user, handleLogout, setSuperAdminProfileOpen } = useAuth();
    
    const [activeView, setActiveView] = useState('dashboard');
    const [subTabView, setSubTabView] = useState('payments');
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [expirationDate, setExpirationDate] = useState('');
    const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [churchToDelete, setChurchToDelete] = useState<Church | null>(null);
    const [viewingPaymentDetails, setViewingPaymentDetails] = useState<PaymentRequest | null>(null);
    const [churchToView, setChurchToView] = useState<Church | null>(null);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [paymentToValidate, setPaymentToValidate] = useState<PaymentRequest | null>(null);


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setDropdownOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const onToggleChurchStatus = (churchId: string) => setChurches(prev => prev.map(c => c.id === churchId ? {...c, status: c.status === 'Actif' ? 'Inactif' : 'Actif'} : c));
    
    const onGenerateCode = (expDate: string) => {
        const newCode: InscriptionCode = { code: `GRACE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`, status: 'Actif', expirationDate: expDate };
        setInscriptionCodes(prev => [newCode, ...prev]);
        setExpirationDate('');
    };
    
    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const generateReport = () => {
        const doc = new jsPDF();
        autoTable(doc, {
            head: [["ID", "Nom de l'église", "Email Admin", "Date de Création", "Statut", "Code Utilisé"]],
            body: churches.map(church => [church.id, church.name, church.data.appUsers[0]?.email || 'N/A', new Date(church.creationDate).toLocaleDateString('fr-FR'), church.status, church.registrationCode]),
            startY: 20,
        });
        doc.text("Rapport des Églises Inscrites", 14, 15);
        doc.save(`rapport_eglises_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    if (!user) return null;
    
    const sidebarItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <HomeIcon className="w-5 h-5"/> },
        { id: 'churches', label: 'Gestion des Églises', icon: <BuildingOffice2Icon className="w-5 h-5"/> },
        { id: 'inscriptions', label: 'Gestion des Inscriptions', icon: <BanknotesIcon className="w-5 h-5"/> },
        { id: 'support', label: 'Support', icon: <ArrowPathIcon className="w-5 h-5"/> },
        { id: 'settings', label: 'Paramètres', icon: <Cog6ToothIcon className="w-5 h-5"/> },
    ];

    const activeChurches = churches.filter(c => c.status === 'Actif').length;
    const activeCodes = codes.filter(c => c.status === 'Actif').length;
    const pendingPayments = paymentRequests.filter(p => p.status === 'En attente').length;

    const renderContent = () => {
        switch (activeView) {
            case 'dashboard':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard title="Églises Actives" value={activeChurches} icon={<BuildingOffice2Icon className="w-7 h-7" />} />
                        <StatCard title="Total d'Églises" value={churches.length} icon={<BuildingOffice2Icon className="w-7 h-7" />} />
                        <StatCard title="Codes d'accès Actifs" value={activeCodes} icon={<KeyIcon className="w-7 h-7" />} />
                        <StatCard title="Paiements en attente" value={pendingPayments} icon={<BanknotesIcon className="w-7 h-7" />} />
                    </div>
                );
            case 'churches':
                return (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Liste des Églises</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-600"><tr><th className="p-2 text-left">ID</th><th className="p-2 text-left">Nom</th><th className="p-2 text-left">Admin</th><th className="p-2 text-left">Statut</th><th className="p-2 text-left">Date Création</th><th className="p-2 text-left">Date Expiration</th><th className="p-2 text-center">Actions</th></tr></thead>
                                <tbody className="divide-y divide-gray-200">
                                    {churches.map(church => (
                                        <tr key={church.id}><td className="p-2 font-mono text-xs text-gray-500">{church.id}</td><td className="p-2 font-medium text-gray-900">{church.name}</td><td className="p-2 text-gray-600">{church.data.appUsers[0]?.name || 'N/A'}</td><td className="p-2"><span className={`px-2 py-1 text-xs rounded-full ${church.status === 'Actif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{church.status}</span></td><td className="p-2 text-gray-600">{new Date(church.creationDate).toLocaleDateString('fr-FR')}</td><td className="p-2 text-gray-600">{church.expirationDate ? new Date(church.expirationDate).toLocaleDateString('fr-FR') : 'N/A'}</td><td className="p-2 text-center space-x-2"><button onClick={() => setChurchToView(church)} className="px-2 py-1 text-xs text-white bg-blue-600 rounded-md hover:bg-blue-700">Détails</button><button onClick={() => onToggleChurchStatus(church.id)} className={`p-1 rounded-full ${church.status === 'Actif' ? 'text-yellow-600 hover:bg-yellow-100' : 'text-green-600 hover:bg-green-100'}`} title={church.status === 'Actif' ? 'Désactiver' : 'Activer'}>{church.status === 'Actif' ? <XCircleIcon className="w-5 h-5"/> : <CheckCircleIcon className="w-5 h-5"/>}</button><button onClick={() => setChurchToDelete(church)} className="p-1 text-red-600 hover:bg-red-100 rounded-full" title="Supprimer"><TrashIcon className="w-5 h-5" /></button></td></tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button onClick={generateReport} className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"><DocumentArrowDownIcon className="w-4 h-4"/>Télécharger le rapport</button>
                    </div>
                );
             case 'inscriptions':
                return (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-6">
                                <button onClick={() => setSubTabView('payments')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${ subTabView === 'payments' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Paiements en attente</button>
                                <button onClick={() => setSubTabView('codes')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${ subTabView === 'codes' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Codes d'inscription</button>
                            </nav>
                        </div>
                        <div className="mt-6">
                            {subTabView === 'payments' && (
                                 <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 text-gray-600"><tr><th className="p-2 text-left">Église</th><th className="p-2 text-left">Contact</th><th className="p-2 text-left">Méthode</th><th className="p-2 text-left">ID Transaction</th><th className="p-2 text-left">Date</th><th className="p-2 text-center">Actions</th></tr></thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {paymentRequests.filter(p => p.status === 'En attente').map(p => (
                                                <tr key={p.id}><td className="p-2 font-medium text-black">{p.churchName}</td><td className="p-2 text-black">{p.applicantEmail}</td><td className="p-2 text-black">{p.paymentMethod}</td><td className="p-2 font-mono text-black">{p.transactionId || 'N/A'}</td><td className="p-2 text-black">{new Date(p.requestDate).toLocaleDateString()}</td><td className="p-2 text-center space-x-2"><button onClick={() => setViewingPaymentDetails(p)} className="px-3 py-1 text-xs text-white bg-blue-600 rounded-md hover:bg-blue-700">Détails</button><button onClick={() => setPaymentToValidate(p)} className="px-3 py-1 text-xs text-white bg-green-600 rounded-md hover:bg-green-700">Valider</button><button onClick={() => handleRejectPayment(p.id)} className="px-3 py-1 text-xs text-white bg-red-600 rounded-md hover:bg-red-700">Rejeter</button></td></tr>
                                            ))}
                                            {paymentRequests.filter(p => p.status === 'En attente').length === 0 && (<tr><td colSpan={6} className="p-4 text-center text-gray-500">Aucune demande en attente.</td></tr>)}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            {subTabView === 'codes' && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2 text-gray-800">Générer un code (sans paiement)</h3>
                                        <div className="space-y-4">
                                            <div><label className="block text-sm font-medium text-gray-700">Date d'expiration</label><div className="flex gap-2 mt-1"><input type="date" value={expirationDate} onChange={e => setExpirationDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md bg-white" /><button onClick={() => onGenerateCode(expirationDate)} disabled={!expirationDate} className="px-3 py-2 text-white bg-blue-600 rounded-md disabled:bg-gray-400"><PlusIcon className="w-5 h-5"/></button></div></div>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2 text-gray-800">Codes Actifs (non utilisés)</h3>
                                        <div className="overflow-y-auto max-h-64 border rounded-md">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50 text-gray-600 sticky top-0"><tr><th className="p-2 text-left">Code</th><th className="p-2 text-left">Destinataire</th><th className="p-2 text-left">Église</th><th className="p-2 text-left">Expire le</th></tr></thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {codes.filter(c => c.status === 'Actif').map(code => {
                                                        const request = code.paymentRequestId ? paymentRequests.find(p => p.id === code.paymentRequestId) : null;
                                                        return (
                                                            <tr key={code.code}>
                                                                <td className="p-2 font-mono text-black">
                                                                    <div className="flex items-center gap-2">
                                                                        <span>{code.code}</span>
                                                                        <button onClick={() => handleCopyCode(code.code)} title="Copier">
                                                                            {copiedCode === code.code ? <CheckCircleIcon className="w-4 h-4 text-green-500"/> : <DocumentDuplicateIcon className="w-4 h-4 text-gray-400 hover:text-gray-600"/>}
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                                <td className="p-2 text-black">{request?.applicantName || 'Manuel'}</td>
                                                                <td className="p-2 text-black">{request?.churchName || 'N/A'}</td>
                                                                <td className="p-2 text-xs text-black">{new Date(code.expirationDate).toLocaleDateString('fr-FR')}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'support':
                 return (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Demandes de réinitialisation</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-600"><tr><th className="p-2 text-left">Église</th><th className="p-2 text-left">Utilisateur</th><th className="p-2 text-left">Email</th><th className="p-2 text-left">Date</th><th className="p-2 text-center">Action</th></tr></thead>
                                <tbody className="divide-y divide-gray-200">
                                    {passwordResetRequests.filter(r => r.status === 'En attente').map(req => (<tr key={req.id}><td className="p-2">{req.churchName}</td><td className="p-2">{req.userName}</td><td className="p-2">{req.userEmail}</td><td className="p-2">{new Date(req.requestDate).toLocaleString()}</td><td className="p-2 text-center"><button onClick={() => handleResolvePasswordReset(req.id)} className="px-3 py-1 text-xs text-white bg-green-600 rounded-md">Réinitialiser à 'grace'</button></td></tr>))}
                                    {passwordResetRequests.filter(r => r.status === 'En attente').length === 0 && (<tr><td colSpan={5} className="p-4 text-center text-gray-500">Aucune demande en attente.</td></tr>)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'settings':
                return <PlatformSettingsEditor />;
            default: return null;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 text-gray-900 font-sans">
            {isSidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setSidebarOpen(false)}></div>}
            <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-800 text-white flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-center h-16 shadow-md bg-slate-900">
                    <h1 className="text-xl font-bold tracking-wider">SUPER ADMIN</h1>
                </div>
                <nav className="mt-5 flex-1 px-2 space-y-1">
                    {sidebarItems.map(item => (
                        <a key={item.id} href="#" onClick={(e) => { e.preventDefault(); setActiveView(item.id); setSidebarOpen(false); }} className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${activeView === item.id ? 'bg-slate-700 text-white' : 'text-gray-300 hover:bg-slate-700 hover:text-white'}`}>
                            {item.icon}
                            <span>{item.label}</span>
                        </a>
                    ))}
                </nav>
            </aside>

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm z-10">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-gray-500">
                                <Bars3Icon className="w-6 h-6"/>
                            </button>
                            <h1 className="text-lg font-semibold text-gray-800 hidden md:block">{sidebarItems.find(i => i.id === activeView)?.label}</h1>
                            <div ref={dropdownRef} className="relative">
                                <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100">
                                   <img src={user.photoUrl || 'https://i.pravatar.cc/150?u=superadmin'} alt="avatar" className="w-8 h-8 rounded-full" />
                                   <span className="hidden sm:inline text-gray-700 font-medium">{user.name}</span>
                                   <ChevronDownIcon className="w-4 h-4 text-gray-500"/>
                                </button>
                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 ring-1 ring-black ring-opacity-5">
                                        <a href="#" onClick={(e) => { e.preventDefault(); setSuperAdminProfileOpen(true); setDropdownOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Mon Profil</a>
                                        <a href="#" onClick={(e) => { e.preventDefault(); setLogoutModalOpen(true); setDropdownOpen(false); }} className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Déconnexion</a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    {renderContent()}
                </main>
            </div>
            
            <LogoutConfirmationModal isOpen={isLogoutModalOpen} onClose={() => setLogoutModalOpen(false)} onConfirm={handleLogout} />
            <ConfirmationModal
                isOpen={!!churchToDelete}
                onClose={() => setChurchToDelete(null)}
                onConfirm={() => {
                    if (churchToDelete) {
                        setChurches(prev => prev.filter(c => c.id !== churchToDelete.id));
                        setChurchToDelete(null);
                    }
                }}
                title="Supprimer l'église"
                message={`Êtes-vous sûr de vouloir supprimer l'église "${churchToDelete?.name}" ? Cette action est irréversible et supprimera toutes les données associées.`}
            />
             <PaymentDetailsModal request={viewingPaymentDetails} onClose={() => setViewingPaymentDetails(null)} />
             <ChurchDetailsModal church={churchToView} onClose={() => setChurchToView(null)} />
             <SubscriptionDurationModal
                isOpen={!!paymentToValidate}
                onClose={() => setPaymentToValidate(null)}
                onSubmit={(duration) => {
                    if (paymentToValidate) {
                        handleValidatePayment(paymentToValidate.id, duration);
                    }
                    setPaymentToValidate(null);
                }}
             />
        </div>
    );
};

export default SuperAdminDashboard;