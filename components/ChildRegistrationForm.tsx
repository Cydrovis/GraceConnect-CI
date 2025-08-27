

import React, { useState, useEffect } from 'react';
import { XMarkIcon } from './icons/HeroIcons';
import { Member, Child } from '../types';

interface ChildRegistrationFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (parentId: string, newChild: Omit<Child, 'id'> & { id?: string }) => void;
    members: Member[];
    childToEdit?: { child: Child, parentId: string } | null;
}

const CLASS_LEVELS = ['Petite Session', 'Moyen Session', 'Grande session', 'CP1', 'CP2', 'CE1', 'CE2', 'CM1', 'CM2', '6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminal'];

const FormInput: React.FC<{ label: string, type?: string, name: string, required?: boolean, value?: string, onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, type = 'text', name, required = false, value, onChange }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-theme-text-muted mb-1">{label}</label>
        <input type={type} name={name} id={name} required={required} value={value} onChange={onChange} className="w-full" />
    </div>
);

const FormSelect: React.FC<{ label: string, name: string, options: string[], value?: string, onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void }> = ({ label, name, options, value, onChange }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-theme-text-muted mb-1">{label}</label>
        <select name={name} id={name} value={value} onChange={onChange} className="w-full bg-white">
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

const FormCheckbox: React.FC<{ label: string, name: string, checked?: boolean, onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, name, checked, onChange }) => (
    <div className="flex items-center gap-2">
        <input type="checkbox" name={name} id={name} checked={checked} onChange={onChange} />
        <label htmlFor={name} className="text-sm text-theme-text-base">{label}</label>
    </div>
);

const ChildRegistrationForm: React.FC<ChildRegistrationFormProps> = ({ isOpen, onClose, onSave, members, childToEdit }) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [parentId, setParentId] = useState('');
    const [child, setChild] = useState<Omit<Child, 'id'> & { id?: string }>({
        name: '',
        gender: 'Garçon',
        birthDate: '',
        attendsSchool: false,
        schoolClass: '',
        schoolName: '',
        attendsSundaySchool: false,
        remainsInChurch: true,
        reasonForLeaving: ''
    });

    useEffect(() => {
        if (!isOpen) return;

        if (childToEdit) {
            setIsEditMode(true);
            setParentId(childToEdit.parentId);
            setChild(childToEdit.child);
        } else {
            setIsEditMode(false);
            setParentId('');
            setChild({
                name: '', gender: 'Garçon', birthDate: '', attendsSchool: false, schoolClass: '', schoolName: '',
                attendsSundaySchool: false, remainsInChurch: true, reasonForLeaving: ''
            });
        }
    }, [isOpen, childToEdit]);

    const handleChildChange = (field: keyof Omit<Child, 'id'>, value: any) => {
        setChild(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!parentId) {
            alert("Veuillez sélectionner un parent.");
            return;
        }
        
        const dataToSave: Omit<Child, 'id'> & { id?: string } = {
            ...child,
            schoolClass: child.attendsSchool ? child.schoolClass : undefined,
            schoolName: child.attendsSchool ? child.schoolName : undefined,
            reasonForLeaving: !child.remainsInChurch ? child.reasonForLeaving : undefined,
        };
        
        onSave(parentId, dataToSave);
    };

    return (
        <div className={`fixed inset-0 bg-black bg-opacity-60 z-50 justify-center items-center p-4 ${isOpen ? 'flex' : 'hidden'}`} onClick={onClose}>
            <div className="bg-theme-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-theme-border bg-theme-table-header rounded-t-xl">
                    <h2 className="text-2xl font-bold text-theme-text-base">{isEditMode ? "Modifier les informations de l'enfant" : "Fiche d'adhésion pour enfant"}</h2>
                    <button onClick={onClose} type="button" className="p-2 rounded-full text-theme-text-muted hover:bg-slate-200 dark:hover:bg-slate-600">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </header>
                <form className="p-6 overflow-y-auto flex-grow" onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="parent" className="block text-sm font-medium text-theme-text-muted mb-1">Parent</label>
                            <select id="parent" name="parent" value={parentId} onChange={e => setParentId(e.target.value)} required disabled={isEditMode} className="w-full bg-white disabled:bg-gray-100 disabled:cursor-not-allowed">
                                <option value="" disabled>-- Sélectionner le parent --</option>
                                {members.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
                            </select>
                        </div>
                        
                        <fieldset className="border-t border-theme-border pt-4">
                            <legend className="text-lg font-semibold text-theme-text-base mb-2">Informations de l'enfant</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                <FormInput label="Nom complet de l'enfant" name="child_name" value={child.name} onChange={e => handleChildChange('name', e.target.value)} required />
                                <FormSelect label="Sexe" name="child_gender" options={['Garçon', 'Fille']} value={child.gender} onChange={e => handleChildChange('gender', e.target.value)} />
                                <FormInput label="Date de naissance" name="child_birthDate" type="date" value={child.birthDate} onChange={e => handleChildChange('birthDate', e.target.value)} />
                                
                                <div className="flex flex-col justify-center">
                                    <FormCheckbox label="Participe à l'école du dimanche" name="child_attendsSundaySchool" checked={child.attendsSundaySchool} onChange={e => handleChildChange('attendsSundaySchool', e.target.checked)} />
                                </div>
                                
                                <div className="md:col-span-2 flex flex-col pt-2 border-t border-theme-border mt-2">
                                    <FormCheckbox label="Scolarisé(e)" name="child_attendsSchool" checked={child.attendsSchool} onChange={e => handleChildChange('attendsSchool', e.target.checked)} />
                                     {child.attendsSchool && (
                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-3 pl-6">
                                             <div>
                                                <label className="block text-sm font-medium text-theme-text-muted mb-1">Classe</label>
                                                <select value={child.schoolClass} onChange={e => handleChildChange('schoolClass', e.target.value)} className="w-full bg-white">
                                                    <option value="">Classe (Optionnel)</option>
                                                    {CLASS_LEVELS.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                             </div>
                                             <FormInput label="Établissement" name="child_schoolName" value={child.schoolName} onChange={e => handleChildChange('schoolName', e.target.value)} />
                                         </div>
                                     )}
                                </div>

                                <div className="md:col-span-2 flex flex-col pt-2 border-t border-theme-border mt-2">
                                     <FormCheckbox label="Reste dans l'église" name="child_remainsInChurch" checked={child.remainsInChurch} onChange={e => handleChildChange('remainsInChurch', e.target.checked)} />
                                     {!child.remainsInChurch && (
                                         <div className="mt-3 pl-6">
                                             <FormInput label="Raison du départ" name="child_reasonForLeaving" value={child.reasonForLeaving} onChange={e => handleChildChange('reasonForLeaving', e.target.value)} />
                                         </div>
                                     )}
                                 </div>
                            </div>
                        </fieldset>
                    </div>

                    <footer className="flex justify-end items-center p-4 border-t border-theme-border bg-theme-table-header rounded-b-xl space-x-3 mt-6 -mx-6 -mb-6">
                        <button onClick={onClose} type="button" className="px-6 py-2 border border-theme-border rounded-md">Annuler</button>
                        <button type="submit" className="px-6 py-2 border border-transparent rounded-md shadow-sm text-white bg-church-dark-blue">{isEditMode ? "Enregistrer les modifications" : "Enregistrer l'enfant"}</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default ChildRegistrationForm;