import React, { useRef, useState, useEffect } from 'react';
import { XMarkIcon, UserCircleIcon, PlusIcon, TrashIcon } from './icons/HeroIcons';
import { Member, Child, MemberType } from '../types';

interface MemberRegistrationFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<Member, 'id' | 'photoUrl'> & { id?: string; photoFile?: File }) => void;
    memberToEdit?: Member | null;
}

const CLASS_LEVELS = ['Petite Session', 'Moyen Session', 'Grande session', 'CP1', 'CP2', 'CE1', 'CE2', 'CM1', 'CM2', '6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminal'];

const PREDEFINED_MEMBER_TYPES: MemberType[] = ['Membre', 'Préposé', 'Visiteur'];


const FormSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <fieldset className="mb-8">
        <legend className="text-xl font-bold text-theme-accent mb-4 border-b-2 border-theme-accent/50 w-full pb-2">{title}</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {children}
        </div>
    </fieldset>
);

const FormInput: React.FC<{ label: string, type?: string, placeholder?: string, name: string, fullWidth?: boolean, required?: boolean, value?: string, defaultValue?: string, min?: string, onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void, disabled?: boolean }> = ({ label, type = 'text', placeholder, name, fullWidth, required=false, value, defaultValue, min, onChange, disabled=false }) => (
    <div className={fullWidth ? 'md:col-span-2' : ''}>
        <label htmlFor={name} className="block text-sm font-medium mb-1 text-theme-text-muted">{label}</label>
        <input type={type} name={name} id={name} placeholder={placeholder} required={required} value={value} defaultValue={defaultValue} min={min} onChange={onChange} disabled={disabled} className="w-full" />
    </div>
);

const FormSelect: React.FC<{ label: string, name: string, options: string[], fullWidth?: boolean, value?: string, defaultValue?: string, onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void }> = ({ label, name, options, fullWidth, value, defaultValue, onChange }) => (
    <div className={fullWidth ? 'md:col-span-2' : ''}>
        <label htmlFor={name} className="block text-sm font-medium mb-1 text-theme-text-muted">{label}</label>
        <select name={name} id={name} value={value} defaultValue={defaultValue} onChange={onChange} className="w-full">
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

const FormCheckbox: React.FC<{ label: string, name: string, checked?: boolean, defaultChecked?: boolean, onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, name, checked, defaultChecked, onChange }) => (
    <div className="flex items-center gap-2">
        <input type="checkbox" name={name} id={name} checked={checked} defaultChecked={defaultChecked} onChange={onChange} className="h-4 w-4 text-church-dark-teal border-theme-border rounded focus:ring-church-light-teal" />
        <label htmlFor={name} className="text-sm text-theme-text-base">{label}</label>
    </div>
);

const MemberRegistrationForm: React.FC<MemberRegistrationFormProps> = ({ isOpen, onClose, onSave, memberToEdit }) => {
    const isEditMode = memberToEdit != null;
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const [isMarried, setIsMarried] = useState(isEditMode ? memberToEdit.maritalStatus === 'Marié(e)' : false);
    const [children, setChildren] = useState<Partial<Child>[]>([]);
    
    // New states for member type
    const [memberTypeSelection, setMemberTypeSelection] = useState<string>('');
    const [customMemberType, setCustomMemberType] = useState('');

    useEffect(() => {
        if (memberToEdit) {
            setPhotoPreview(memberToEdit.photoUrl);
            setIsMarried(memberToEdit.maritalStatus === 'Marié(e)');
            setChildren(memberToEdit.children || []);
            
            // New logic for member type
            if (PREDEFINED_MEMBER_TYPES.includes(memberToEdit.memberType as MemberType)) {
                setMemberTypeSelection(memberToEdit.memberType);
                setCustomMemberType('');
            } else {
                setMemberTypeSelection('Autre');
                setCustomMemberType(memberToEdit.memberType);
            }

        } else {
            setPhotoPreview(null);
            setIsMarried(false);
            setChildren([]);
            formRef.current?.reset();
            
            // New logic for member type
            setMemberTypeSelection('Membre');
            setCustomMemberType('');
        }
        setPhotoFile(null);
        if (!memberToEdit && fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }, [memberToEdit, isOpen]);


    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleTriggerFileUpload = () => {
        fileInputRef.current?.click();
    };

    const handleAddChild = () => {
        setChildren([...children, { id: `new_${Date.now()}`, name: '', gender: 'Garçon', birthDate: '', attendsSchool: false, attendsSundaySchool: false, remainsInChurch: true, reasonForLeaving: '' }]);
    };

    const handleChildChange = (index: number, field: keyof Child, value: any) => {
        const newChildren = [...children];
        (newChildren[index] as any)[field] = value;
        setChildren(newChildren);
    };

    const handleRemoveChild = (index: number) => {
        setChildren(children.filter((_, i) => i !== index));
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const data = new FormData(form);

        const maritalStatus = data.get('maritalStatus') as Member['maritalStatus'];
        
        const finalChildren: Child[] = children
            .filter(c => c.name) // Only save children with a name
            .map(c => ({
                id: c.id?.startsWith('new_') ? `c_${Date.now()}_${Math.random()}`: c.id!,
                name: c.name!,
                gender: c.gender!,
                birthDate: c.birthDate!,
                attendsSchool: c.attendsSchool!,
                schoolClass: c.attendsSchool ? c.schoolClass : undefined,
                schoolName: c.attendsSchool ? c.schoolName : undefined,
                attendsSundaySchool: c.attendsSundaySchool!,
                remainsInChurch: c.remainsInChurch!,
                reasonForLeaving: !c.remainsInChurch ? c.reasonForLeaving : undefined,
            }));

        const finalMemberType = memberTypeSelection === 'Autre' ? customMemberType : memberTypeSelection;

        const memberData: Omit<Member, 'id' | 'photoUrl'> & { id?: string, photoFile?: File } = {
            id: isEditMode ? memberToEdit.id : undefined,
            firstName: data.get('firstName') as string,
            lastName: data.get('lastName') as string,
            phone: data.get('phone') as string,
            phone2: data.get('phone2') as string || undefined,
            email: data.get('email') as string,
            gender: data.get('gender') as 'Homme' | 'Femme',
            birthDate: data.get('birthDate') as string,
            address: data.get('address') as string,
            nationality: data.get('nationality') as string,
            nationalIdNumber: data.get('nationalIdNumber') as string,
            maritalStatus: maritalStatus,
            spouseName: maritalStatus === 'Marié(e)' ? data.get('spouseName') as string : undefined,
            profession: data.get('profession') as string,
            conversionDate: data.get('conversionDate') as string,
            baptismDate: data.get('baptismDate') as string,
            mentor: isEditMode ? memberToEdit.mentor : '',
            groups: [data.get('ministry') as string].filter(Boolean),
            trainings: isEditMode ? memberToEdit.trainings : [],
            department: data.get('ministry') as string,
            status: isEditMode ? memberToEdit.status : 'Nouveau',
            lastSeen: isEditMode ? memberToEdit.lastSeen : 'Aujourd\'hui',
            history: isEditMode ? memberToEdit.history : [],
            documents: isEditMode ? memberToEdit.documents : [],
            photoFile: photoFile || undefined,
            children: finalChildren,
            hasChildren: finalChildren.length > 0,
            childrenCount: finalChildren.length,
            boysCount: finalChildren.filter(c => c.gender === 'Garçon').length,
            girlsCount: finalChildren.filter(c => c.gender === 'Fille').length,
            childrenInSundaySchool: finalChildren.some(c => c.attendsSundaySchool),
            memberType: finalMemberType,
        };
        onSave(memberData);
    };

    return (
        <div className={`fixed inset-0 bg-black bg-opacity-60 z-50 justify-center items-center p-4 ${isOpen ? 'flex' : 'hidden'}`} onClick={onClose}>
            <div className="bg-theme-card rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-theme-border bg-theme-table-header rounded-t-xl">
                    <h2 className="text-2xl font-bold text-theme-text-base">{isEditMode ? 'Modifier les informations du fidèle' : 'Fiche d’adhésion des fidèles'}</h2>
                    <button onClick={onClose} type="button" className="p-2 rounded-full text-theme-text-muted hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </header>
                <form ref={formRef} className="p-6 overflow-y-auto flex-grow text-theme-text-base" onSubmit={handleSubmit}>
                    
                    <FormSection title="1. Informations personnelles">
                        {isEditMode ? (
                            <FormInput label="ID Membre" name="memberId" defaultValue={memberToEdit.id} disabled fullWidth />
                        ) : (
                            <FormInput label="ID Membre" name="memberId" value="Attribué automatiquement" disabled fullWidth />
                        )}
                        <FormInput label="Prénom" name="firstName" placeholder="ex: Jean" required defaultValue={memberToEdit?.firstName}/>
                        <FormInput label="Nom" name="lastName" placeholder="ex: Dupont" required defaultValue={memberToEdit?.lastName}/>
                        <FormInput label="Date de naissance" name="birthDate" type="date" defaultValue={memberToEdit?.birthDate}/>
                        <FormSelect label="Sexe" name="gender" options={['Homme', 'Femme']} defaultValue={memberToEdit?.gender} />
                        <div>
                            <label htmlFor="memberType" className="block text-sm font-medium mb-1 text-theme-text-muted">Statut du membre</label>
                            <select
                                id="memberType"
                                value={memberTypeSelection}
                                onChange={e => setMemberTypeSelection(e.target.value)}
                                required
                                className="w-full"
                            >
                                <option value="" disabled>Choisir</option>
                                <option>Membre</option>
                                <option>Préposé</option>
                                <option>Visiteur</option>
                                <option value="Autre">Autre (préciser)</option>
                            </select>
                        </div>
                        
                        {memberTypeSelection === 'Autre' ? (
                            <FormInput
                                label="Préciser le statut"
                                name="customMemberType"
                                placeholder="ex: Sympathisant"
                                value={customMemberType}
                                onChange={e => setCustomMemberType(e.target.value)}
                                required
                            />
                        ) : <div/>}

                        <FormInput label="N° CNI/Passport/Carte Consulaire" name="nationalIdNumber" placeholder="Numéro d'identité" defaultValue={memberToEdit?.nationalIdNumber} />
                        <FormSelect label="Situation matrimoniale" name="maritalStatus" options={['Célibataire', 'Marié(e)', 'Divorcé(e)', 'Veuf(ve)']} defaultValue={memberToEdit?.maritalStatus} onChange={(e) => setIsMarried(e.target.value === 'Marié(e)')} />
                        
                        {isMarried && (
                           <FormInput label="Nom de l'époux(se)" name="spouseName" placeholder="ex: Hélène Dupont" defaultValue={memberToEdit?.spouseName} />
                        )}

                        <FormInput label="Profession / Activité" name="profession" placeholder="ex: Enseignant" defaultValue={memberToEdit?.profession}/>
                        <FormInput label="Nationalité" name="nationality" placeholder="ex: Française" defaultValue={memberToEdit?.nationality}/>
                        <FormInput label="Téléphone" name="phone" type="tel" placeholder="ex: 06 12 34 56 78" required defaultValue={memberToEdit?.phone}/>
                        <FormInput label="Téléphone 2 (Optionnel)" name="phone2" type="tel" placeholder="ex: 07 12 34 56 78" defaultValue={memberToEdit?.phone2} />
                        <FormInput label="Email" name="email" type="email" placeholder="ex: jean.dupont@email.com" fullWidth defaultValue={memberToEdit?.email}/>
                        <FormInput label="Adresse complète" name="address" placeholder="Quartier, commune, ville" fullWidth defaultValue={memberToEdit?.address}/>
                        <div className="md:col-span-2">
                             <label htmlFor="photo" className="block text-sm font-medium mb-1 text-theme-text-muted">Photo d’identité</label>
                             <div className="mt-1 flex items-center gap-4">
                                <span className="inline-block h-16 w-16 rounded-full overflow-hidden bg-theme-bg flex justify-center items-center border border-theme-border">
                                    {photoPreview ? <img src={photoPreview} alt="Aperçu" className="h-full w-full object-cover" /> : <UserCircleIcon className="h-14 w-14 text-theme-text-muted" />}
                                </span>
                                <button type="button" onClick={handleTriggerFileUpload} className="bg-theme-card py-2 px-3 border border-theme-border rounded-md shadow-sm text-sm leading-4 font-medium hover:bg-theme-bg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-church-light-teal">
                                    Changer
                                </button>
                                <input type="file" ref={fileInputRef} onChange={handlePhotoChange} id="photo-upload" name="photo-upload" className="hidden" accept="image/*"/>
                             </div>
                        </div>
                    </FormSection>

                    <fieldset className="mb-8">
                         <legend className="text-xl font-bold text-theme-accent mb-4 border-b-2 border-theme-accent/50 w-full pb-2">Informations sur les enfants</legend>
                         {children.map((child, index) => (
                             <div key={child.id} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 bg-theme-bg p-4 rounded-lg border border-theme-border relative mb-4">
                                <button type="button" onClick={() => handleRemoveChild(index)} className="absolute top-2 right-2 p-1 text-theme-text-muted hover:text-red-600 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20">
                                    <TrashIcon className="w-5 h-5"/>
                                </button>
                                <FormInput label={`Nom complet de l'enfant ${index + 1}`} name={`child_name_${index}`} value={child.name} onChange={e => handleChildChange(index, 'name', e.target.value)} required />
                                <FormSelect label="Sexe" name={`child_gender_${index}`} options={['Garçon', 'Fille']} value={child.gender} onChange={e => handleChildChange(index, 'gender', e.target.value)} />
                                <FormInput label="Date de naissance" name={`child_birthDate_${index}`} type="date" value={child.birthDate} onChange={e => handleChildChange(index, 'birthDate', e.target.value)} />
                                <div className="flex flex-col justify-center">
                                    <FormCheckbox label="Participe à l'école du dimanche" name={`child_attendsSundaySchool_${index}`} checked={child.attendsSundaySchool} onChange={e => handleChildChange(index, 'attendsSundaySchool', e.target.checked)} />
                                </div>
                                <div className="md:col-span-2 flex flex-col pt-2 border-t border-theme-border mt-2">
                                    <FormCheckbox label="Scolarisé(e)" name={`child_attendsSchool_${index}`} checked={child.attendsSchool} onChange={e => handleChildChange(index, 'attendsSchool', e.target.checked)} />
                                     {child.attendsSchool && (
                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-3 pl-6">
                                             <div className="md:col-span-1">
                                                <label htmlFor={`child_schoolClass_${index}`} className="block text-sm font-medium mb-1 text-theme-text-muted">Classe</label>
                                                <select id={`child_schoolClass_${index}`} name={`child_schoolClass_${index}`} value={child.schoolClass} onChange={e => handleChildChange(index, 'schoolClass', e.target.value)} className="w-full">
                                                    <option value="">Classe (Optionnel)</option>
                                                    {CLASS_LEVELS.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                             </div>
                                             <FormInput label="Établissement" name={`child_schoolName_${index}`} value={child.schoolName} onChange={e => handleChildChange(index, 'schoolName', e.target.value)} />
                                         </div>
                                     )}
                                </div>
                                 <div className="md:col-span-2 flex flex-col pt-2 border-t border-theme-border mt-2">
                                     <FormCheckbox 
                                        label="Reste dans l'église" 
                                        name={`child_remainsInChurch_${index}`} 
                                        checked={child.remainsInChurch}
                                        onChange={e => handleChildChange(index, 'remainsInChurch', e.target.checked)} 
                                    />
                                     {child.remainsInChurch === false && (
                                         <div className="mt-3 pl-6">
                                             <FormInput 
                                                label="Raison du départ" 
                                                name={`child_reasonForLeaving_${index}`}
                                                value={child.reasonForLeaving}
                                                onChange={e => handleChildChange(index, 'reasonForLeaving', e.target.value)}
                                                placeholder="Ex: Fréquente une autre église, a déménagé..."
                                            />
                                         </div>
                                     )}
                                 </div>

                             </div>
                         ))}
                         <button type="button" onClick={handleAddChild} className="mt-2 flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-church-green rounded-lg hover:bg-green-600 shadow">
                             <PlusIcon className="w-4 h-4" />
                             Ajouter un enfant
                         </button>
                    </fieldset>


                    <FormSection title="2. Informations spirituelles">
                        <FormInput label="Date de conversion" name="conversionDate" type="date" defaultValue={memberToEdit?.conversionDate}/>
                        <FormInput label="Date du baptême" name="baptismDate" type="date" defaultValue={memberToEdit?.baptismDate}/>
                        <FormInput label="Lieu du baptême" name="baptismPlace" placeholder="Église, pasteur" />
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-medium text-theme-text-muted">Baptisé(e) par immersion ?</label>
                            <FormCheckbox label="Oui" name="isImmersed" />
                            <FormCheckbox label="Non" name="isNotImmersed" />
                        </div>
                        <FormInput label="Ancienne église fréquentée" name="previousChurch" placeholder="Nom de l'église, durée" />
                        <FormSelect label="Niveau de formation biblique" name="bibleLevel" options={['Débutant', 'Intermédiaire', 'Avancé']} />
                    </FormSection>

                    <FormSection title="3. Appartenance & Service">
                        <FormInput label="Ministère ou département" name="ministry" placeholder="Chorale, Intercession..." defaultValue={memberToEdit?.department}/>
                        <FormInput label="Fonction actuelle" name="churchRole" placeholder="Membre simple, diacre..." />
                        <FormSelect label="Disponibilité pour le service" name="availability" options={['Oui', 'Non', 'Temps partiel']} />
                        <FormInput label="Dons ou talents spécifiques" name="talents" placeholder="Chant, prêche, médias..." fullWidth />
                    </FormSection>
                    
                    <FormSection title="4. Engagements">
                        <div className="md:col-span-2 space-y-3">
                           <FormCheckbox label="Accepte la doctrine de l’église" name="acceptsDoctrine" />
                           <FormCheckbox label="A signé la charte des membres" name="signedCharter" />
                           <FormCheckbox label="A participé à la classe des nouveaux membres" name="attendedNewMembersClass" />
                           <FormCheckbox label="Souhaite un entretien avec le pasteur" name="wantsMeeting" />
                        </div>
                    </FormSection>
                    
                    <div className="p-4 bg-theme-bg rounded-lg mt-6">
                        <p className="text-sm italic text-theme-text-muted">
                            Je soussigné(e) déclare m’inscrire volontairement comme membre de l’église Grace Connect, et m’engage à respecter ses principes bibliques et sa vision.
                        </p>
                        <div className="mt-4 flex items-center gap-4">
                            <FormInput label="Signature (entrez votre nom complet)" name="signature" fullWidth defaultValue={isEditMode ? `${memberToEdit.firstName} ${memberToEdit.lastName}` : ''}/>
                            <div className="w-1/3">
                                <FormInput label="Date" name="signatureDate" type="date" defaultValue={new Date().toISOString().substring(0, 10)}/>
                            </div>
                        </div>
                    </div>
                
                    <footer className="flex justify-end items-center p-4 border-t border-theme-border bg-theme-table-header rounded-b-xl space-x-3 mt-6 -mx-6 -mb-6">
                        <button onClick={onClose} type="button" className="px-6 py-2 border border-theme-border rounded-md bg-theme-card hover:bg-theme-bg transition-colors">
                            Annuler
                        </button>
                        <button type="submit" className="px-6 py-2 border border-transparent rounded-md shadow-sm text-white bg-church-dark-blue hover:bg-blue-900 transition-colors">
                            {isEditMode ? 'Enregistrer les modifications' : 'Enregistrer le membre'}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default MemberRegistrationForm;