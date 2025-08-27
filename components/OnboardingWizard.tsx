
import React, { useState, useRef } from 'react';
import { Church, AppUser, ChurchData, Group, ChurchEvent } from '../types';
import { UserPlusIcon, UserGroupIcon, CalendarDaysIcon, CheckCircleIcon, PhotoIcon, PlusIcon, TrashIcon, ChevronRightIcon, ChevronLeftIcon } from './icons/HeroIcons';
import { useAuth, useChurch } from '../contexts';

const ProgressBar: React.FC<{ step: number; totalSteps: number }> = ({ step, totalSteps }) => (
    <div className="flex items-center">
        {Array.from({ length: totalSteps }).map((_, i) => (
            <React.Fragment key={i}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${i < step ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                    {i < step -1 ? '✔' : i + 1}
                </div>
                {i < totalSteps - 1 && <div className={`flex-grow h-1 ${i < step - 1 ? 'bg-green-500' : 'bg-gray-300'}`}></div>}
            </React.Fragment>
        ))}
    </div>
);

const OnboardingWizard: React.FC = () => {
    const { currentUser: user } = useAuth();
    const { currentChurch: church, handleOnboardingComplete: onComplete } = useChurch();

    const [step, setStep] = useState(1);
    const [ministries, setMinistries] = useState<Partial<Group>[]>([]);
    const [newMinistryName, setNewMinistryName] = useState('');
    const [personnel, setPersonnel] = useState<Partial<AppUser>[]>([]);
    const [firstEvent, setFirstEvent] = useState<Partial<ChurchEvent>>({ name: 'Premier Culte de Bienvenue', startDate: '', startTime: '10:00' });
    const [customization, setCustomization] = useState({ name: church.name, logoUrl: church.data.settings.logoUrl });
    const logoInputRef = useRef<HTMLInputElement>(null);

    if(!user) return null;

    const handleAddMinistry = () => {
        if (newMinistryName.trim()) {
            setMinistries(prev => [...prev, { name: newMinistryName.trim(), description: '', leaderId: user.id, memberIds: [user.id] }]);
            setNewMinistryName('');
        }
    };

    const handleAddPersonnel = () => {
        setPersonnel(prev => [...prev, { name: '', email: '', roles: [{ role: '', startDate: new Date().toISOString().split('T')[0] }] }]);
    };
    
    const handlePersonnelChange = (index: number, field: keyof AppUser, value: any) => {
        const newPersonnel = [...personnel];
        if (field === 'roles') {
             newPersonnel[index].roles = [{ role: value, startDate: new Date().toISOString().split('T')[0] }];
        } else {
            (newPersonnel[index] as any)[field] = value;
        }
        setPersonnel(newPersonnel);
    };
    
    const handleRemovePersonnel = (index: number) => {
        setPersonnel(personnel.filter((_, i) => i !== index));
    };
    
    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCustomization(prev => ({...prev, logoUrl: reader.result as string}));
            }
            reader.readAsDataURL(file);
        }
    };

    const handleFinish = () => {
        const newPersonnel = personnel.map((p, i) => ({
            ...p, 
            id: `u_onboard_${i}`, 
            identifiant: `U-${1000+i}`, 
            password: 'grace', 
            status: 'Actif',
            photoUrl: `https://i.pravatar.cc/150?u=onboard${i}`,
            civilite: 'M.', sexe: 'M', contact: '', groupeAdministratif: 'ADMINISTRATIF',
            birthDate: new Date().toISOString().split('T')[0], maritalStatus: 'Célibataire',
            joinDate: new Date().toISOString().split('T')[0],
        }));

        const updates: Partial<ChurchData> = {
            settings: { ...church.data.settings, name: customization.name, logoUrl: customization.logoUrl },
            appUsers: [...church.data.appUsers, ...newPersonnel as AppUser[]],
            events: firstEvent.startDate ? [...church.data.events, {...firstEvent, id: `evt_onboard_1`, type: 'Culte régulier', location: 'Sanctuaire', endTime: '12:00', status: 'À venir', attendeeIds: []} as ChurchEvent] : church.data.events,
        };
        onComplete(updates);
    };

    const nextStep = () => setStep(s => Math.min(s + 1, 5));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));
    
    const renderStep = () => {
        switch(step) {
            case 1: return (
                 <div>
                    <h3 className="text-xl font-semibold mb-2">1. Créer vos ministères</h3>
                    <p className="text-sm text-gray-600 mb-4">Ajoutez les principaux départements de votre église (ex: Musique, Intercession, Jeunesse...).</p>
                    <div className="flex gap-2 mb-4">
                        <input value={newMinistryName} onChange={e => setNewMinistryName(e.target.value)} placeholder="Nom du ministère" className="flex-grow p-2 border rounded-md" />
                        <button type="button" onClick={handleAddMinistry} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Ajouter</button>
                    </div>
                    <ul className="space-y-2">{ministries.map((min, i) => <li key={i} className="p-2 bg-gray-100 rounded-md">{min.name}</li>)}</ul>
                </div>
            );
            case 2: return (
                 <div>
                    <h3 className="text-xl font-semibold mb-2">2. Ajouter vos premiers membres</h3>
                    <p className="text-sm text-gray-600 mb-4">Ajoutez quelques membres clés du personnel pour commencer.</p>
                    <div className="space-y-3">
                       {personnel.map((p, i) => (
                           <div key={i} className="grid grid-cols-12 gap-2 items-center p-2 border rounded-md bg-gray-50">
                               <input value={p.name} onChange={e => handlePersonnelChange(i, 'name', e.target.value)} placeholder="Nom complet" className="col-span-5 p-2 border rounded-md" />
                               <input value={p.email} onChange={e => handlePersonnelChange(i, 'email', e.target.value)} placeholder="Email" className="col-span-4 p-2 border rounded-md" />
                               <select value={p.roles?.[0]?.role} onChange={e => handlePersonnelChange(i, 'roles', e.target.value)} className="col-span-2 p-2 border rounded-md bg-white">
                                   <option value="">Rôle...</option>
                                   {(church.data.settings.activatedRoles || []).map(r => <option key={r} value={r}>{r}</option>)}
                               </select>
                               <button type="button" onClick={() => handleRemovePersonnel(i)} className="col-span-1 p-2 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                           </div>
                       ))}
                    </div>
                    <button type="button" onClick={handleAddPersonnel} className="mt-3 text-sm flex items-center gap-1 text-blue-600 hover:underline"><PlusIcon className="w-4 h-4" /> Ajouter une personne</button>
                </div>
            );
            case 3: return (
                <div>
                    <h3 className="text-xl font-semibold mb-2">3. Planifier votre premier culte</h3>
                    <p className="text-sm text-gray-600 mb-4">Programmez le premier événement dans votre nouvel espace.</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Nom de l'événement</label>
                            <input value={firstEvent.name} onChange={e => setFirstEvent({...firstEvent, name: e.target.value})} className="w-full mt-1 p-2 border rounded" />
                        </div>
                        <div/>
                        <div>
                            <label className="block text-sm font-medium">Date</label>
                            <input type="date" value={firstEvent.startDate} onChange={e => setFirstEvent({...firstEvent, startDate: e.target.value})} className="w-full mt-1 p-2 border rounded" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium">Heure</label>
                            <input type="time" value={firstEvent.startTime} onChange={e => setFirstEvent({...firstEvent, startTime: e.target.value})} className="w-full mt-1 p-2 border rounded" />
                        </div>
                    </div>
                </div>
            );
            case 4: return (
                <div>
                    <h3 className="text-xl font-semibold mb-2">4. Personnaliser votre espace</h3>
                    <p className="text-sm text-gray-600 mb-4">Confirmez le nom de votre église et ajoutez votre logo.</p>
                    <div>
                        <label className="block text-sm font-medium">Nom de l'église</label>
                        <input value={customization.name} onChange={e => setCustomization({...customization, name: e.target.value})} className="w-full mt-1 p-2 border rounded" />
                    </div>
                     <div className="mt-4">
                        <label className="block text-sm font-medium mb-1">Logo</label>
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border">
                                {customization.logoUrl ? <img src={customization.logoUrl} alt="logo" className="w-full h-full object-cover"/> : <PhotoIcon className="w-10 h-10 text-gray-400"/>}
                            </div>
                             <input type="file" ref={logoInputRef} onChange={handleLogoChange} className="hidden" accept="image/*" />
                             <button type="button" onClick={() => logoInputRef.current?.click()} className="text-sm font-medium text-blue-600 hover:underline">Changer le logo</button>
                        </div>
                    </div>
                </div>
            );
            case 5: return (
                 <div className="text-center">
                    <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4"/>
                    <h3 className="text-2xl font-bold">Configuration terminée !</h3>
                    <p className="text-gray-600 mt-2">Votre espace est prêt. Vous pouvez maintenant accéder à votre tableau de bord et commencer à gérer votre église.</p>
                </div>
            )
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col">
                <header className="p-6 text-center border-b">
                    <h2 className="text-2xl font-bold text-gray-800">Bienvenue sur GraceConnect, {user.name.split(' ')[0]} !</h2>
                    <p className="text-gray-600">Suivez ces quelques étapes pour configurer votre espace.</p>
                    <div className="w-full max-w-md mx-auto mt-4">
                        <ProgressBar step={step} totalSteps={5} />
                    </div>
                </header>
                <main className="p-6 overflow-y-auto" style={{minHeight: '400px'}}>
                    {renderStep()}
                </main>
                <footer className="p-4 bg-gray-50 rounded-b-xl flex justify-between items-center border-t">
                    <button onClick={prevStep} disabled={step === 1} className="px-6 py-2 border rounded-md disabled:opacity-50">
                        <ChevronLeftIcon className="w-5 h-5 inline-block mr-1" /> Précédent
                    </button>
                    {step < 5 ? (
                         <button onClick={nextStep} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                             Suivant <ChevronRightIcon className="w-5 h-5 inline-block ml-1" />
                         </button>
                    ) : (
                         <button onClick={handleFinish} className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                             Aller au tableau de bord
                         </button>
                    )}
                </footer>
            </div>
        </div>
    );
};

export default OnboardingWizard;
