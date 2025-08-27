import React, { useState, useRef, useEffect } from 'react';
import { ChurchSettings, CertificateTemplate } from '../types';
import { 
    Cog6ToothIcon, BuildingOffice2Icon, DevicePhoneMobileIcon, EnvelopeIcon, PhotoIcon, 
    PencilSquareIcon, DocumentDuplicateIcon, SwatchIcon, ShieldCheckIcon, LockClosedIcon, 
    ClipboardDocumentListIcon, GlobeAmericasIcon, CurrencyDollarIcon,
    ChatBubbleLeftIcon,
    UserCircleIcon,
    HomeIcon,
    XMarkIcon,
    DocumentTextIcon,
    InformationCircleIcon
} from './icons/HeroIcons';

const TabButton: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
            active 
            ? 'border-theme-accent text-theme-accent bg-theme-card' 
            : 'border-transparent text-theme-text-muted hover:text-theme-text-base hover:bg-theme-table-header'
        }`}
    >
        {label}
    </button>
);

const FormInput: React.FC<{ label: string, name: string, value?: string, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void, as?: 'input' | 'select', options?: string[] }> = ({ label, name, value, onChange, as = 'input', options = [] }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-theme-text-muted">{label}</label>
        <div className="mt-1 relative rounded-md shadow-sm">
            {as === 'input' ? (
                 <input
                    type="text"
                    name={name}
                    id={name}
                    className="block w-full sm:text-sm"
                    value={value}
                    onChange={onChange}
                />
            ) : (
                 <select
                    name={name}
                    id={name}
                    className="block w-full sm:text-sm"
                    value={value}
                    onChange={onChange}
                 >
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                 </select>
            )}
        </div>
    </div>
);

const PLACEHOLDERS = [
    { value: '{{NomComplet}}', label: 'Nom complet du baptisé' },
    { value: '{{DateNaissance}}', label: 'Date de naissance' },
    { value: '{{DateBapteme}}', label: 'Date du baptême' },
    { value: '{{LieuBapteme}}', label: 'Lieu du baptême' },
    { value: '{{PasteurOfficiant}}', label: 'Pasteur officiant' },
    { value: '{{NomEglise}}', label: "Nom de l'église" },
];


const CertificateDesignerModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (template: CertificateTemplate) => void;
    template?: CertificateTemplate;
}> = ({ isOpen, onClose, onSave, template }) => {
    const [localTemplate, setLocalTemplate] = useState<CertificateTemplate>({ title: '', body: '', signatureLabel: '' });

    useEffect(() => {
        if (template) {
            setLocalTemplate(template);
        }
    }, [template, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setLocalTemplate({ ...localTemplate, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        onSave(localTemplate);
    };

    const previewBody = localTemplate.body
        .replace(/{{NomComplet}}/g, '<b>Jean Dupont</b>')
        .replace(/{{DateNaissance}}/g, '<b>15/05/1985</b>')
        .replace(/{{DateBapteme}}/g, '<b>12/04/2024</b>')
        .replace(/{{LieuBapteme}}/g, '<b>Grace Connect</b>')
        .replace(/{{PasteurOfficiant}}/g, '<b>Pasteur John Doe</b>')
        .replace(/{{NomEglise}}/g, '<b>Grace Connect</b>')
        .replace(/\n/g, '<br />');

    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 bg-black bg-opacity-60 z-50 justify-center items-center p-4 ${isOpen ? 'flex' : 'hidden'}`} onClick={onClose}>
            <div className="bg-theme-card rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-theme-border bg-theme-table-header rounded-t-xl">
                    <h2 className="text-xl font-bold text-theme-text-base">Personnaliser le certificat de baptême</h2>
                    <button type="button" onClick={onClose} className="p-2 rounded-full text-theme-text-muted hover:bg-slate-200"><XMarkIcon className="w-6 h-6" /></button>
                </header>
                <div className="flex-grow p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto">
                    {/* Editor */}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium">Titre du certificat</label>
                            <input id="title" name="title" value={localTemplate.title} onChange={handleChange} className="w-full mt-1" />
                        </div>
                        <div>
                            <label htmlFor="body" className="block text-sm font-medium">Corps du texte</label>
                            <textarea id="body" name="body" value={localTemplate.body} onChange={handleChange} rows={10} className="w-full mt-1 font-mono text-sm"></textarea>
                        </div>
                        <div>
                            <label htmlFor="signatureLabel" className="block text-sm font-medium">Texte pour la signature</label>
                            <input id="signatureLabel" name="signatureLabel" value={localTemplate.signatureLabel} onChange={handleChange} className="w-full mt-1" />
                        </div>
                         <div className="border border-theme-border p-3 rounded-md">
                            <h4 className="text-sm font-semibold text-theme-text-base flex items-center gap-2"><DocumentTextIcon className="w-5 h-5"/>Champs dynamiques</h4>
                            <p className="text-xs text-theme-text-muted mb-2">Cliquez pour copier et collez dans le corps du texte.</p>
                            <div className="flex flex-wrap gap-2">
                                {PLACEHOLDERS.map(p => (
                                    <button type="button" key={p.value} title={p.label} onClick={() => navigator.clipboard.writeText(p.value)} className="text-xs bg-slate-200 text-theme-text-base px-2 py-1 rounded-full hover:bg-theme-accent hover:text-white transition-colors">
                                        {p.value}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Preview */}
                    <div className="bg-theme-bg p-4 rounded-lg border border-theme-border">
                        <h4 className="text-sm font-semibold text-theme-text-base mb-2">Aperçu</h4>
                        <div className="bg-white p-6 aspect-[1/1.414] shadow-md overflow-hidden flex flex-col items-center text-center">
                            <h1 className="text-2xl font-serif text-gray-800">{localTemplate.title}</h1>
                            <div className="my-8 w-24 border-t border-gray-300"></div>
                            <div className="text-sm text-gray-600 flex-grow" dangerouslySetInnerHTML={{ __html: previewBody }} />
                            <div className="mt-auto pt-8 w-1/2">
                                <div className="border-t border-gray-400 pt-2 text-xs text-gray-700">
                                    {localTemplate.signatureLabel}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <footer className="flex justify-end items-center p-4 bg-theme-table-header rounded-b-xl space-x-3 border-t border-theme-border">
                    <button type="button" onClick={onClose} className="px-4 py-2 border border-theme-border rounded-md text-theme-text-base bg-theme-card hover:bg-theme-bg">Annuler</button>
                    <button type="button" onClick={handleSave} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-church-dark-blue hover:bg-blue-900">Enregistrer</button>
                </footer>
            </div>
        </div>
    );
};


interface SettingsProps {
    isOpen: boolean;
    onClose: () => void;
    settings: ChurchSettings;
    onSaveSettings: (settings: ChurchSettings) => void;
    expirationDate?: string;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose, settings, onSaveSettings, expirationDate }) => {
    const [activeTab, setActiveTab] = useState('info');
    const [formState, setFormState] = useState<ChurchSettings>(settings);
    const [isCertDesignerOpen, setCertDesignerOpen] = useState(false);
    
    useEffect(() => {
        setFormState(settings);
    }, [settings, isOpen]);

    const logoInputRef = useRef<HTMLInputElement>(null);
    const signatureInputRef = useRef<HTMLInputElement>(null);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormState(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormState(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof ChurchSettings) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormState(prev => ({ ...prev, [fieldName]: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveChanges = (e: React.FormEvent) => {
        e.preventDefault();
        onSaveSettings(formState);
    };

    let daysRemainingText = 'N/A';
    if (expirationDate) {
        const diff = new Date(expirationDate).getTime() - new Date().getTime();
        const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
        daysRemainingText = `${days} jour(s)`;
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-theme-card rounded-xl shadow-2xl w-full max-w-5xl h-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-theme-border bg-theme-table-header rounded-t-xl flex-shrink-0">
                    <h2 className="text-2xl font-bold text-theme-text-base">Paramétrages du système</h2>
                     <button onClick={onClose} type="button" className="p-2 rounded-full text-theme-text-muted hover:bg-slate-200">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </header>

                <form onSubmit={handleSaveChanges} className="flex-grow flex flex-col overflow-hidden">
                    <div className="flex-grow overflow-y-auto">
                         <nav className="flex space-x-2 border-b border-theme-border bg-theme-bg px-4 sticky top-0 z-10">
                            <TabButton label="Informations de l'église" active={activeTab === 'info'} onClick={() => setActiveTab('info')} />
                            <TabButton label="Personnalisation" active={activeTab === 'personalization'} onClick={() => setActiveTab('personalization')} />
                            <TabButton label="Sécurité & Préférences" active={activeTab === 'security'} onClick={() => setActiveTab('security')} />
                            <TabButton label="À propos" active={activeTab === 'about'} onClick={() => setActiveTab('about')} />
                        </nav>
                        <div className="p-6">
                            {activeTab === 'info' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-6">
                                            <FormInput label="Nom officiel de l'église" name="name" value={formState.name} onChange={handleFormChange} />
                                            <FormInput label="Slogan ou verset clé" name="slogan" value={formState.slogan} onChange={handleFormChange} />
                                            <div>
                                                <label className="block text-sm font-medium text-theme-text-muted">Adresse complète</label>
                                                <textarea name="address" value={formState.address} onChange={handleFormChange} rows={3} className="mt-1 block w-full sm:text-sm"></textarea>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <label className="block text-sm font-medium text-theme-text-muted mb-2">Logo de l'église</label>
                                            <div className="w-40 h-40 bg-theme-bg rounded-full flex items-center justify-center overflow-hidden border border-theme-border">
                                                {formState.logoUrl ? <img src={formState.logoUrl} alt="Logo preview" className="w-full h-full object-cover" /> : <PhotoIcon className="w-20 h-20 text-theme-text-muted" />}
                                            </div>
                                            <input type="file" ref={logoInputRef} onChange={e => handleFileChange(e, 'logoUrl')} className="hidden" accept="image/*" />
                                            <button type="button" onClick={() => logoInputRef.current?.click()} className="mt-3 text-sm font-medium text-theme-accent hover:underline">Changer le logo</button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 border-t border-theme-border pt-6 mt-6">
                                        <FormInput label="Téléphone" name="phone" value={formState.phone} onChange={handleFormChange} />
                                        <FormInput label="Téléphone 2" name="phone2" value={formState.phone2} onChange={handleFormChange} />
                                        <FormInput label="Email de contact" name="email" value={formState.email} onChange={handleFormChange} />
                                        <FormInput label="WhatsApp" name="whatsapp" value={formState.whatsapp} onChange={handleFormChange} />
                                        <FormInput label="Responsable principal" name="leaderName" value={formState.leaderName} onChange={handleFormChange} />
                                        <FormInput label="Devise" name="currency" value={formState.currency} onChange={handleFormChange} as="select" options={['€', '$', 'FCFA']} />
                                        <FormInput label="Langue" name="language" value={formState.language} onChange={handleFormChange} as="select" options={['Français', 'English']} />
                                    </div>
                                </div>
                            )}
                            {activeTab === 'personalization' && (
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-lg font-semibold text-theme-text-base flex items-center gap-2"><DocumentDuplicateIcon className="w-5 h-5"/>Modèles de documents</h4>
                                        <p className="text-sm text-theme-text-muted mb-2">
                                            Personnalisez le texte de base pour les documents générés. Utilisez des placeholders comme {'{{Prénom}}'} ou {'{{Nom}}'}.
                                        </p>
                                        <div className="mt-2 border border-theme-border p-4 rounded-md space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium">Reçu de don</label>
                                                <textarea name="docTemplateReceipt" value={formState.docTemplateReceipt || ''} onChange={handleFormChange} rows={2} className="w-full mt-1" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium">Certificat de baptême</label>
                                                <div className="mt-1 p-3 border border-theme-border rounded-md bg-theme-bg flex justify-between items-center">
                                                    <p className="text-sm text-theme-text-muted italic">Modèle de certificat personnalisé.</p>
                                                    <button type="button" onClick={() => setCertDesignerOpen(true)} className="px-4 py-2 text-sm font-medium text-white bg-church-dark-blue rounded-lg hover:bg-blue-900 shadow">
                                                        Personnaliser
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium">Certificat d'engagement</label>
                                                <textarea name="docTemplateEngagement" value={formState.docTemplateEngagement || ''} onChange={handleFormChange} rows={2} className="w-full mt-1" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium">Papier à en-tête</label>
                                                <textarea name="docTemplateHeader" value={formState.docTemplateHeader || ''} onChange={handleFormChange} rows={2} className="w-full mt-1" />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-theme-text-base flex items-center gap-2"><PencilSquareIcon className="w-5 h-5"/>Signatures officielles</h4>
                                        <div className="mt-2 border border-theme-border p-4 rounded-md flex items-center gap-4">
                                            <div className="w-48 h-24 bg-theme-bg rounded flex items-center justify-center border border-theme-border overflow-hidden">
                                                {formState.officialSignatureUrl ? (
                                                    <img src={formState.officialSignatureUrl} alt="Signature" className="max-w-full max-h-full object-contain" />
                                                ) : (
                                                    <span className="text-xs text-theme-text-muted">Aucune signature</span>
                                                )}
                                            </div>
                                            <div>
                                                <input type="file" ref={signatureInputRef} onChange={e => handleFileChange(e, 'officialSignatureUrl')} className="hidden" accept="image/png, image/jpeg" />
                                                <button type="button" onClick={() => signatureInputRef.current?.click()} className="text-sm font-medium text-theme-accent hover:underline">Télécharger une signature</button>
                                                <p className="text-xs text-theme-text-muted mt-1">Image PNG avec fond transparent recommandée.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-theme-text-base flex items-center gap-2"><SwatchIcon className="w-5 h-5"/>Personnalisation des PDF</h4>
                                        <div className="mt-2 border border-theme-border p-4 rounded-md space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium">Pieds de page automatiques</label>
                                                <textarea name="pdfFooterText" value={formState.pdfFooterText || ''} onChange={handleFormChange} placeholder="Ex: 'Que la grâce soit avec vous.'" className="w-full mt-1 resize-y" />
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <label className="flex items-center gap-2"><input name="pdfIncludeLogo" type="checkbox" checked={formState.pdfIncludeLogo || false} onChange={handleFormChange} /> Inclure le logo</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'security' && (
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-lg font-semibold text-theme-text-base flex items-center gap-2"><LockClosedIcon className="w-5 h-5"/>Politique de mot de passe</h4>
                                        <div className="mt-2 border border-theme-border p-4 rounded-md space-y-2 text-theme-text-base">
                                            <label className="flex items-center gap-2"><input type="checkbox" name="requireSpecialChars" checked={formState.requireSpecialChars || false} onChange={handleFormChange} /> Exiger des caractères spéciaux</label>
                                            <label className="flex items-center gap-2"><input type="checkbox" name="requireNumbersInPassword" checked={formState.requireNumbersInPassword || false} onChange={handleFormChange} /> Exiger des chiffres</label>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-theme-text-base flex items-center gap-2"><ClipboardDocumentListIcon className="w-5 h-5"/>Journal d’activité</h4>
                                        <div className="mt-2 border border-theme-border p-4 rounded-md">
                                            <p className="text-sm text-theme-text-muted">Consulter le journal de toutes les actions (disponible depuis le menu latéral).</p>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-theme-text-base flex items-center gap-2"><Cog6ToothIcon className="w-5 h-5"/>Préférences</h4>
                                        <div className="mt-2 border border-theme-border p-4 rounded-md space-y-4 text-theme-text-base">
                                            <div>
                                                <label className="text-sm font-medium">Format de date</label>
                                                <div className="flex gap-4 mt-1">
                                                    <label className="flex items-center gap-2"><input type="radio" name="dateFormat" value="JJ/MM/AAAA" checked={formState.dateFormat === 'JJ/MM/AAAA'} onChange={handleFormChange}/> JJ/MM/AAAA</label>
                                                    <label className="flex items-center gap-2"><input type="radio" name="dateFormat" value="MM/DD/AAAA" checked={formState.dateFormat === 'MM/DD/AAAA'} onChange={handleFormChange}/> MM/DD/AAAA</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'about' && (
                                <div className="space-y-6">
                                    <div className="bg-theme-bg p-6 rounded-lg border border-theme-border">
                                        <h3 className="text-xl font-bold text-theme-text-base">À propos de GraceConnect</h3>
                                        <p className="mt-2 text-theme-text-muted">
                                            GraceConnect est une solution de gestion d'église complète et moderne, conçue pour simplifier l'administration de votre communauté. De la gestion des membres et des finances à la planification d'événements et à la communication interne, notre objectif est de vous fournir les outils nécessaires pour vous concentrer sur ce qui compte le plus : votre ministère.
                                        </p>
                                    </div>
                                     <div className="bg-theme-bg p-6 rounded-lg border border-theme-border">
                                        <h3 className="text-xl font-bold text-theme-text-base">Développé par CYDROVIS</h3>
                                        <p className="mt-2 text-theme-text-muted">
                                            GraceConnect est fièrement développé par CYDROVIS, une entreprise passionnée par la création de solutions technologiques innovantes qui ont un impact positif. Notre équipe s'engage à fournir un produit de haute qualité, un support client réactif et des mises à jour continues pour répondre aux besoins changeants de votre église.
                                        </p>
                                    </div>
                                    <div className="bg-theme-accent/10 text-theme-accent p-6 rounded-lg border border-theme-accent/30 text-center">
                                         <p className="font-semibold">Temps restant avant le renouvellement de l'abonnement :</p>
                                        <p className="text-5xl font-extrabold my-2">{daysRemainingText}</p>
                                        <p className="text-sm">Votre abonnement est valide jusqu'au {expirationDate ? new Date(expirationDate).toLocaleDateString('fr-FR') : 'N/A'}.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <footer className="p-4 bg-theme-table-header rounded-b-xl border-t border-theme-border flex justify-end flex-shrink-0">
                        <button
                            type="submit"
                            className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-church-dark-blue hover:bg-blue-900"
                        >
                            Enregistrer les modifications
                        </button>
                    </footer>
                </form>
                <CertificateDesignerModal
                    isOpen={isCertDesignerOpen}
                    onClose={() => setCertDesignerOpen(false)}
                    template={formState.baptismCertificateTemplate}
                    onSave={(newTemplate) => {
                        setFormState(prev => ({...prev, baptismCertificateTemplate: newTemplate }));
                        setCertDesignerOpen(false);
                    }}
                />
            </div>
        </div>
    );
};

export default Settings;