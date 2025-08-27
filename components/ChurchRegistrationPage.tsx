import React, { useState, useRef } from 'react';
import { AppUserRole, ChurchOnboardingData, AdminOnboardingData, PaymentMethodConfig } from '../types';
import { BuildingOffice2Icon, KeyIcon, EnvelopeIcon, UserIcon, LockClosedIcon, PhotoIcon, CheckCircleIcon, InformationCircleIcon, HashtagIcon } from './icons/HeroIcons';
import { ROLES_DATA } from '../constants';
import { useData, useAuth } from '../contexts';

interface ChurchRegistrationPageProps {
    onBackToLogin: () => void;
}

const FormInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className="w-full px-4 py-3 bg-white text-black placeholder-slate-500 rounded-full focus:ring-2 focus:ring-orange-400 focus:outline-none" />
);

const ChurchRegistrationPage: React.FC<ChurchRegistrationPageProps> = ({ onBackToLogin }) => {
    const { platformSettings, handleCreatePaymentRequest } = useData();
    const { setSessionState, setPendingRequestId } = useAuth();
    
    const [step, setStep] = useState(1); // 1: Form, 2: Payment, 2.5: Wave QR, 3: Success
    const [error, setError] = useState('');

    const [churchData, setChurchData] = useState<ChurchOnboardingData>({
        name: '', denomination: '', country: '', city: '', neighborhood: '', address: '', legalStatus: 'Enregistrée',
        adminEmail: '', phone: '', whatsapp: '', website: ''
    });
    const [adminData, setAdminData] = useState<AdminOnboardingData>({ name: '', email: '', contact: '', roles: [{ role: 'Administrateur principal', startDate: new Date().toISOString().split('T')[0] }]});
    const [logoDataUrl, setLogoDataUrl] = useState<string | undefined>(undefined);
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethodConfig | null>(null);
    const [transactionId, setTransactionId] = useState('');

    const logoInputRef = useRef<HTMLInputElement>(null);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setLogoDataUrl(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleProceedToPayment = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!churchData.name || !adminData.name || !churchData.adminEmail || !churchData.denomination || !churchData.country || !churchData.city || !churchData.address) {
            setError('Veuillez remplir tous les champs obligatoires.');
            return;
        }
        setAdminData(prev => ({ ...prev, email: churchData.adminEmail }));
        setStep(2);
    };

    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMethod) return;

        const requestId = handleCreatePaymentRequest({
            churchName: churchData.name,
            applicantName: adminData.name,
            applicantEmail: adminData.email,
            paymentMethod: selectedMethod.name,
            transactionId: transactionId || undefined,
            churchOnboardingData: churchData,
            adminOnboardingData: adminData,
            logoDataUrl,
        });
        
        setPendingRequestId(requestId);
        setSessionState('awaitingActivation');
    };
    
    return (
        <div 
            className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center text-white" 
            style={{ backgroundImage: `url(${platformSettings.loginPage.backgroundImageUrl})` }}
        >
            <div className="min-h-screen w-full bg-black bg-opacity-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-3xl">
                    <h2 className="text-2xl font-bold text-center mb-1">Inscription d’une nouvelle église</h2>
                    <p className="text-center text-sm text-gray-200 mb-4">Système intelligent et professionnel</p>
                    
                    {error && <div className="bg-red-500/80 text-white p-3 rounded-md mb-4 text-sm">{error}</div>}

                    {step === 1 && (
                        <form onSubmit={handleProceedToPayment} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                             <fieldset className="border border-gray-400 rounded-lg p-4 space-y-4">
                                <legend className="px-2 font-semibold text-lg">🔹 Informations sur l'église</legend>
                                <FormInput type="text" placeholder="Nom de l’église" value={churchData.name} onChange={e => setChurchData({...churchData, name: e.target.value})} required />
                                <FormInput type="text" placeholder="Dénomination" value={churchData.denomination} onChange={e => setChurchData({...churchData, denomination: e.target.value})} required />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <FormInput type="text" placeholder="Pays" value={churchData.country} onChange={e => setChurchData({...churchData, country: e.target.value})} required />
                                    <FormInput type="text" placeholder="Ville" value={churchData.city} onChange={e => setChurchData({...churchData, city: e.target.value})} required />
                                </div>
                                <FormInput type="text" placeholder="Adresse complète" value={churchData.address} onChange={e => setChurchData({...churchData, address: e.target.value})} required />
                                <FormInput type="email" placeholder="Email de l'église" value={churchData.adminEmail} onChange={e => setChurchData({...churchData, adminEmail: e.target.value})} required />
                             </fieldset>
                            
                             <fieldset className="border border-gray-400 rounded-lg p-4 space-y-4">
                                <legend className="px-2 font-semibold text-lg">👨‍💼 Administrateur principal</legend>
                                 <FormInput type="text" placeholder="Nom complet" value={adminData.name} onChange={e => setAdminData({...adminData, name: e.target.value})} required />
                                 <FormInput type="tel" placeholder="Téléphone / WhatsApp" value={adminData.contact} onChange={e => setAdminData({...adminData, contact: e.target.value})} />
                             </fieldset>

                             <fieldset className="border border-gray-400 rounded-lg p-4">
                                <legend className="px-2 font-semibold text-lg">🖼️ Logo (facultatif)</legend>
                                <div onClick={() => logoInputRef.current?.click()} className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-400 border-dashed rounded-md cursor-pointer hover:border-gray-300">
                                    <div className="space-y-1 text-center">
                                        {logoDataUrl ? <img src={logoDataUrl} alt="Aperçu du logo" className="mx-auto h-24 w-24 object-contain" /> : <PhotoIcon className="mx-auto h-12 w-12 text-gray-300" />}
                                        <div className="flex text-sm text-gray-300"><span className="relative font-medium text-orange-400 hover:text-orange-300">Cliquez pour télécharger</span></div>
                                    </div>
                                </div>
                                <input id="logo-upload" name="logo-upload" type="file" className="sr-only" ref={logoInputRef} onChange={handleLogoChange} accept="image/*" />
                            </fieldset>
                            
                            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-full">Continuer vers le paiement</button>
                        </form>
                    )}

                    {step === 2 && (
                        <div>
                             <button type="button" onClick={() => setStep(1)} className="text-sm text-yellow-300 mb-4">&larr; Modifier les informations</button>
                             <h3 className="font-semibold text-center mb-1">Accès complet pour 1 an</h3>
                            <p className="text-3xl font-bold text-center text-orange-400 mb-4">{platformSettings.subscriptionPrice.toLocaleString('fr-FR')} {platformSettings.subscriptionPriceCurrency}</p>
                            <p className="text-sm text-center text-gray-200 mb-6">Choisissez votre moyen de paiement.</p>
                             <div className="grid grid-cols-2 gap-4">
                                {platformSettings.paymentMethods.map(method => (
                                    <button key={method.name} onClick={() => { setSelectedMethod(method); setStep(method.name === 'Wave' ? 2.5 : 2.1); }} className="p-4 bg-white/80 text-gray-800 rounded-lg hover:shadow-lg hover:ring-2 ring-orange-400 transition-all flex flex-col items-center justify-center gap-2 h-32">
                                        <img src={method.logoUrl} alt={method.name} className="w-10 h-10 object-contain"/>
                                        <span className="font-semibold">{method.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                     {(step === 2.1 || step === 2.5) && selectedMethod && (
                        <form onSubmit={handlePaymentSubmit}>
                             <button type="button" onClick={() => setStep(2)} className="text-sm text-yellow-300 mb-4">&larr; Changer de moyen de paiement</button>
                            <div className="p-4 bg-white/20 rounded-lg mb-4">
                                <div className="flex items-center gap-3">
                                    <img src={selectedMethod.logoUrl} alt={selectedMethod.name} className="w-10 h-10 object-contain"/>
                                    <div>
                                        <h3 className="font-bold text-white">{selectedMethod.name}</h3>
                                        <p className="text-lg font-mono font-semibold text-white">{selectedMethod.number}</p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-200 mt-2">{selectedMethod.details}</p>
                            </div>
                           
                            {step === 2.5 && selectedMethod.qrCodeUrl && ( // Wave QR Code
                                <div className="flex justify-center my-4">
                                    <img src={selectedMethod.qrCodeUrl} alt="QR Code" className="w-48 h-48 object-contain bg-white p-2 rounded-md" />
                                </div>
                            )}

                             {selectedMethod.transactionIdRequired && (
                                <div className="relative mt-4">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500"><HashtagIcon className="w-5 h-5"/></span>
                                    <FormInput name="transactionId" placeholder="ID de la transaction" onChange={e => setTransactionId(e.target.value)} value={transactionId} required />
                                </div>
                             )}
                            <button type="submit" className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-full transition">J'ai payé, soumettre ma demande</button>
                        </form>
                    )}

                    <div className="text-center mt-6">
                        <button onClick={onBackToLogin} className="text-sm text-yellow-400 hover:underline">Retour à la connexion</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChurchRegistrationPage;