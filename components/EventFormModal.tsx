
import React, { useState, useEffect, useRef } from 'react';
import { ChurchEvent, Member, Group, SpecialGuest, ProgramItem, BudgetItem, Task, FileAttachment, TargetAudience, AccessType, EventFunction } from '../types';
import { XMarkIcon, PlusIcon, TrashIcon, ChevronRightIcon, PaperClipIcon } from './icons/HeroIcons';

interface EventFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (event: Omit<ChurchEvent, 'id'> & { id?: string }) => void;
    eventToEdit: ChurchEvent | null;
    members: Member[];
    groups: Group[];
    initialDate?: string;
}

const defaultEventState: Partial<ChurchEvent> = {
    name: '',
    type: 'Culte régulier',
    objective: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    startTime: '10:00',
    endTime: '12:00',
    location: 'Sanctuaire Principal',
    description: '',
    recurrence: 'none',
    targetAudience: [],
    accessType: 'Libre',
    onlineRegistration: false,
    automaticNotifications: false,
    attendeeIds: [],
    specialGuests: [],
    detailedProgram: [],
    logistics: {
        resources: [],
        budget: [],
    },
    attachments: [],
    tasks: [],
    internalNotes: '',
    validation: {
        validatedById: '',
        validationDate: ''
    }
};

const FormSection: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = true }) => (
    <details className="border border-theme-border rounded-lg group" open={defaultOpen}>
        <summary className="p-3 font-semibold text-theme-text-base cursor-pointer flex justify-between items-center bg-theme-table-header rounded-t-lg list-none">
            {title}
            <ChevronRightIcon className="w-5 h-5 transform transition-transform group-open:rotate-90" />
        </summary>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {children}
        </div>
    </details>
);

const EventFormModal: React.FC<EventFormModalProps> = ({ isOpen, onClose, onSave, eventToEdit, members, initialDate }) => {
    const [formData, setFormData] = useState<Partial<ChurchEvent>>(defaultEventState);

    useEffect(() => {
        if (eventToEdit) {
            setFormData({
                ...defaultEventState, // ensure all keys exist
                ...eventToEdit,
                logistics: { ...defaultEventState.logistics, ...eventToEdit.logistics },
                validation: { ...defaultEventState.validation, ...eventToEdit.validation }
            });
        } else if (initialDate) {
            setFormData({
                ...defaultEventState,
                startDate: initialDate
            });
        }
        else {
            setFormData(defaultEventState);
        }
    }, [eventToEdit, isOpen, initialDate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogisticsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        
        setFormData(prev => ({
            ...prev,
            logistics: {
                ...prev.logistics,
                [name]: type === 'checkbox' ? checked : value,
            }
        }));
    };
    
    const handleValidationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            validation: {
                ...prev.validation,
                [name]: value
            }
        }));
    };
    
    // --- Special Guests Handlers ---
    const handleGuestChange = (index: number, field: keyof SpecialGuest, value: string | boolean) => {
        setFormData(prev => {
            const newGuests = [...(prev.specialGuests || [])];
            const updatedGuest = { ...newGuests[index], [field]: value };
            newGuests[index] = updatedGuest;
            return { ...prev, specialGuests: newGuests };
        });
    };

    const addGuest = () => {
        const newGuest: SpecialGuest = { id: `sg_${Date.now()}`, name: '', function: 'Autre', transportationNeeded: false };
        setFormData(prev => ({ ...prev, specialGuests: [...(prev.specialGuests || []), newGuest] }));
    };

    const removeGuest = (index: number) => {
        setFormData(prev => ({ ...prev, specialGuests: (prev.specialGuests || []).filter((_, i) => i !== index) }));
    };
    
    // --- Program Handlers ---
    const handleProgramChange = (index: number, field: keyof ProgramItem, value: string | number) => {
        setFormData(prev => {
            const newProgram = [...(prev.detailedProgram || [])];
            const updatedItem = { ...newProgram[index], [field]: value };
            newProgram[index] = updatedItem;
            return { ...prev, detailedProgram: newProgram };
        });
    };
    
    const addProgramItem = () => {
        const newItem: ProgramItem = { id: `p_${Date.now()}`, time: '', activity: '', duration: 15 };
        setFormData(prev => ({ ...prev, detailedProgram: [...(prev.detailedProgram || []), newItem] }));
    };

    const removeProgramItem = (index: number) => {
        setFormData(prev => ({ ...prev, detailedProgram: (prev.detailedProgram || []).filter((_, i) => i !== index) }));
    };

    // --- Participants Handler ---
     const handleAttendeesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({ ...prev, attendeeIds: selectedIds }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Omit<ChurchEvent, 'id'> & { id?: string });
    };

    return (
        <div className={`fixed inset-0 bg-black bg-opacity-60 z-50 justify-center items-center p-4 ${isOpen ? 'flex' : 'hidden'}`} onClick={onClose}>
            <div className="bg-theme-card rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-theme-border bg-theme-table-header rounded-t-xl">
                    <h2 className="text-2xl font-bold text-theme-text-base">{eventToEdit ? "Modifier l'événement" : "Planifier un événement"}</h2>
                    <button type="button" onClick={onClose} className="p-2 rounded-full text-theme-text-muted hover:bg-slate-200 dark:hover:bg-slate-600"><XMarkIcon className="w-6 h-6" /></button>
                </header>
                <form className="p-6 overflow-y-auto flex-grow" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <FormSection title="Informations Générales">
                             <div className="md:col-span-2">
                                <label className="block text-sm font-medium">Numéro d’événement</label>
                                <input value={formData.id ? `EVT-${formData.id}` : 'Généré automatiquement'} className="w-full mt-1 p-2 border rounded bg-slate-100 dark:bg-slate-700 cursor-not-allowed" disabled/>
                            </div>
                             <div className="md:col-span-2">
                                <label className="block text-sm font-medium">Nom de l'événement</label>
                                <input name="name" value={formData.name} onChange={handleChange} className="w-full mt-1" required/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Date de début</label>
                                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full mt-1" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Date de fin (optionnel)</label>
                                <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="w-full mt-1" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Heure de début</label>
                                <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} className="w-full mt-1" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Heure de fin</label>
                                <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} className="w-full mt-1" required />
                            </div>
                        </FormSection>

                        <FormSection title="Intervenants & invités spéciaux" defaultOpen={false}>
                            <div className="md:col-span-2 space-y-3">
                                {formData.specialGuests?.map((guest, index) => (
                                    <div key={guest.id} className="p-3 border border-theme-border rounded-md bg-theme-bg space-y-3 relative">
                                        <button type="button" onClick={() => removeGuest(index)} className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full"><TrashIcon className="w-4 h-4"/></button>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input placeholder="Nom de l'intervenant" value={guest.name} onChange={e => handleGuestChange(index, 'name', e.target.value)} className="w-full" />
                                            <select value={guest.function} onChange={e => handleGuestChange(index, 'function', e.target.value)} className="w-full">
                                                {['Prédicateur', 'Chantre', 'Modérateur', 'Témoignage', 'Autre'].map(f => <option key={f} value={f}>{f}</option>)}
                                            </select>
                                            <input placeholder="Église ou ministère" value={guest.churchOrMinistry} onChange={e => handleGuestChange(index, 'churchOrMinistry', e.target.value)} className="w-full" />
                                            <input placeholder="Contact (Tél/Email)" value={guest.contactInfo} onChange={e => handleGuestChange(index, 'contactInfo', e.target.value)} className="w-full" />
                                        </div>
                                        <textarea placeholder="Besoins techniques (Micro, projecteur...)" value={guest.technicalNeeds} onChange={e => handleGuestChange(index, 'technicalNeeds', e.target.value)} className="w-full" rows={2}></textarea>
                                        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={guest.transportationNeeded} onChange={e => handleGuestChange(index, 'transportationNeeded', e.target.checked)} /> Transport/hébergement nécessaire ?</label>
                                    </div>
                                ))}
                                <button type="button" onClick={addGuest} className="text-sm flex items-center gap-1 text-blue-600 hover:underline"><PlusIcon className="w-4 h-4" /> Ajouter un intervenant</button>
                            </div>
                        </FormSection>
                        
                        <FormSection title="Programme détaillé" defaultOpen={false}>
                            <div className="md:col-span-2 space-y-2">
                                {formData.detailedProgram?.map((item, index) => (
                                    <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                                        <input type="time" value={item.time} onChange={e => handleProgramChange(index, 'time', e.target.value)} className="col-span-2" />
                                        <input placeholder="Activité" value={item.activity} onChange={e => handleProgramChange(index, 'activity', e.target.value)} className="col-span-4" />
                                        <select value={item.responsibleId} onChange={e => handleProgramChange(index, 'responsibleId', e.target.value)} className="col-span-3">
                                            <option value="">Responsable...</option>
                                            {members.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
                                        </select>
                                        <input type="number" placeholder="Durée" value={item.duration} onChange={e => handleProgramChange(index, 'duration', parseInt(e.target.value) || 0)} className="col-span-2" />
                                        <button type="button" onClick={() => removeProgramItem(index)} className="col-span-1 p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                                    </div>
                                ))}
                                 <button type="button" onClick={addProgramItem} className="text-sm flex items-center gap-1 text-blue-600 hover:underline"><PlusIcon className="w-4 h-4" /> Ajouter une ligne au programme</button>
                            </div>
                        </FormSection>

                        <FormSection title="Participants" defaultOpen={false}>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Participants</label>
                                <select multiple value={formData.attendeeIds} onChange={handleAttendeesChange} className="w-full h-40">
                                    {members.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
                                </select>
                                <p className="text-xs text-theme-text-muted mt-1">Maintenez Ctrl (ou Cmd) pour sélectionner plusieurs membres.</p>
                            </div>
                        </FormSection>

                        <FormSection title="Logistique & technique" defaultOpen={false}>
                            <div className="md:col-span-2 grid grid-cols-2 lg:grid-cols-3 gap-4">
                                <label className="flex items-center gap-2"><input type="checkbox" name="soundSystem" checked={formData.logistics?.soundSystem || false} onChange={handleLogisticsChange} /> Sonorisation prévue ?</label>
                                <label className="flex items-center gap-2"><input type="checkbox" name="videoStreaming" checked={formData.logistics?.videoStreaming || false} onChange={handleLogisticsChange} /> Streaming vidéo ?</label>
                                <label className="flex items-center gap-2"><input type="checkbox" name="receptionSecurity" checked={formData.logistics?.receptionSecurity || false} onChange={handleLogisticsChange} /> Service d’accueil / sécurité ?</label>
                                <label className="flex items-center gap-2"><input type="checkbox" name="snacks" checked={formData.logistics?.snacks || false} onChange={handleLogisticsChange} /> Prévoir une collation ?</label>
                                <label className="flex items-center gap-2"><input type="checkbox" name="guestAccomodationBooked" checked={formData.logistics?.guestAccomodationBooked || false} onChange={handleLogisticsChange} /> Hébergement des invités réservé ?</label>
                            </div>
                             <div>
                                <label className="block text-sm font-medium">Nombre de chaises à installer</label>
                                <input type="number" name="chairsToInstall" value={formData.logistics?.chairsToInstall || ''} onChange={handleLogisticsChange} className="w-full mt-1" />
                            </div>
                             <div className="md:col-span-2">
                                <label className="block text-sm font-medium">Matériel à prévoir</label>
                                <textarea name="materialsNeeded" value={formData.logistics?.materialsNeeded || ''} onChange={handleLogisticsChange} rows={3} className="w-full mt-1"></textarea>
                            </div>
                        </FormSection>
                        
                        <FormSection title="Suivi et validation" defaultOpen={false}>
                            <div>
                                <label className="block text-sm font-medium">Responsable de l’organisation</label>
                                <select name="organizerId" value={formData.organizerId} onChange={handleChange} className="w-full mt-1">
                                    <option value="">-- Choisir --</option>
                                    {members.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Validé par</label>
                                <select name="validatedById" value={formData.validation?.validatedById} onChange={handleValidationChange} className="w-full mt-1">
                                    <option value="">-- En attente --</option>
                                    {members.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium">Date de validation</label>
                                <input type="date" name="validationDate" value={formData.validation?.validationDate} onChange={handleValidationChange} className="w-full mt-1" />
                            </div>
                             <div className="md:col-span-2">
                                <label className="block text-sm font-medium">Commentaires / notes internes</label>
                                <textarea name="internalNotes" value={formData.internalNotes} onChange={handleChange} rows={3} className="w-full mt-1"></textarea>
                            </div>
                        </FormSection>
                    </div>

                    <footer className="flex justify-end items-center p-4 bg-theme-table-header rounded-b-xl space-x-3 border-t border-theme-border mt-4">
                        <button type="button" onClick={onClose} className="btn btn-secondary">Annuler</button>
                        <button type="submit" className="btn btn-primary">Enregistrer</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default EventFormModal;
