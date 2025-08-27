
import React, { useState } from 'react';
import { HeartIcon, PlusIcon, XMarkIcon, PencilIcon, TrashIcon, CalendarDaysIcon, MapPinIcon, UserCircleIcon, DocumentTextIcon, BanknotesIcon, ChatBubbleBottomCenterTextIcon } from './icons/HeroIcons';
import { DUMMY_MEMBERS } from '../dummyData';
import { DeathCase, Member, CotisationCampaign } from '../types';

const findMemberById = (id: string, members: Member[]): Member | undefined => members.find(m => m.id === id);

const getStatusChip = (status: DeathCase['status']) => {
    const baseClasses = 'px-2 py-0.5 text-xs font-semibold rounded-full inline-block';
    switch (status) {
        case 'En cours': return `${baseClasses} bg-yellow-100 text-yellow-800`;
        case 'Clôturé': return `${baseClasses} bg-gray-200 text-gray-700`;
        default: return baseClasses;
    }
};

interface CampaignForDeathCaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (campaign: Omit<CotisationCampaign, 'id'>) => void;
    deathCase: DeathCase | null;
    members: Member[];
}

const CampaignForDeathCaseModal: React.FC<CampaignForDeathCaseModalProps> = ({ isOpen, onClose, onSave, deathCase, members }) => {
    const [isAmountFree, setIsAmountFree] = useState(true);

    if (!isOpen || !deathCase) return null;

    const contact = findMemberById(deathCase.familyContactMemberId, members);
    const defaultName = `Soutien famille ${contact?.lastName || deathCase.deceasedName}`;
    const defaultDescription = `Cotisation pour soutenir la famille de ${deathCase.deceasedName} suite à son décès.`;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const amount = parseFloat(formData.get('amount') as string);
        const campaignName = formData.get('name') as string;

        const campaignData: Omit<CotisationCampaign, 'id'> = {
            name: campaignName,
            description: formData.get('description') as string,
            type: 'Cas de Décès',
            frequency: 'Unique',
            defaultAmount: isAmountFree || isNaN(amount) ? 0 : amount,
            isAmountFree: isAmountFree,
            isMandatory: false,
            targetScope: 'Tous les membres', // Default for death cases
            startDate: new Date().toISOString().split('T')[0],
            endDate: formData.get('endDate') as string,
            deathCaseId: deathCase.id,
        };

        onSave(campaignData);
        alert(`La campagne de cotisation "${campaignName}" a été créée avec succès. Vous pouvez la gérer dans le module "Cotisations".`);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-xl">
                    <h2 className="text-xl font-bold text-gray-800">Lancer une cotisation</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200"><XMarkIcon className="w-6 h-6" /></button>
                </header>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la cotisation</label>
                            <input name="name" required defaultValue={defaultName} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea name="description" rows={3} defaultValue={defaultDescription} className="w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type de cotisation</label>
                            <input value="Cas de Décès" disabled className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                                <label className="text-xs text-gray-500">Montant suggéré (€)</label>
                                <input type="number" name="amount" placeholder="Ex: 50" disabled={isAmountFree} className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100" />
                                <div className="mt-2 flex items-center">
                                    <input id="isAmountFree_dc" type="checkbox" checked={isAmountFree} onChange={e => setIsAmountFree(e.target.checked)} className="h-4 w-4 text-church-dark-blue border-gray-300 rounded focus:ring-church-light-teal" />
                                    <label htmlFor="isAmountFree_dc" className="ml-2 block text-sm text-gray-900">Montant libre</label>
                                </div>
                           </div>
                           <div>
                                <label className="text-xs text-gray-500">Date de fin</label>
                               <input type="date" name="endDate" required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                           </div>
                        </div>
                         <p className="text-xs text-gray-600 italic">
                            Par défaut, la cotisation sera lancée pour tous les membres.
                        </p>
                    </div>
                    <footer className="flex justify-end items-center p-4 bg-gray-50 rounded-b-xl space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">Annuler</button>
                        <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">Lancer la campagne</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};


const DeathCaseModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<DeathCase, 'id'> & { id?: string }) => void;
    members: Member[];
    deathCaseToEdit?: DeathCase | null;
}> = ({ isOpen, onClose, onSave, members, deathCaseToEdit }) => {
    if (!isOpen) return null;
    const isEditMode = !!deathCaseToEdit;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const data = {
            id: deathCaseToEdit?.id,
            deceasedName: formData.get('deceasedName') as string,
            declarationDate: formData.get('declarationDate') as string,
            deathDate: formData.get('deathDate') as string || undefined,
            familyContactMemberId: formData.get('familyContactMemberId') as string,
            funeralDate: formData.get('funeralDate') as string || undefined,
            funeralLocation: formData.get('funeralLocation') as string || undefined,
            churchSupportDetails: formData.get('churchSupportDetails') as string || undefined,
            status: (isEditMode ? formData.get('status') as DeathCase['status'] : 'En cours') as DeathCase['status'],
        };

        if (data.deceasedName && data.declarationDate && data.familyContactMemberId) {
            onSave(data);
        } else {
            alert("Veuillez remplir tous les champs obligatoires.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-xl">
                    <h2 className="text-xl font-bold text-gray-800">{isEditMode ? 'Modifier le cas de décès' : 'Enregistrer un cas de décès'}</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200"><XMarkIcon className="w-6 h-6" /></button>
                </header>
                <form onSubmit={handleSubmit} key={deathCaseToEdit?.id || 'new'}>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <input name="deceasedName" required placeholder="Nom du défunt" defaultValue={deathCaseToEdit?.deceasedName} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                                <label className="text-xs text-gray-500">Date de déclaration</label>
                                <input type="date" name="declarationDate" required defaultValue={deathCaseToEdit?.declarationDate} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                           </div>
                           <div>
                                <label className="text-xs text-gray-500">Date du décès</label>
                               <input type="date" name="deathDate" defaultValue={deathCaseToEdit?.deathDate} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                           </div>
                        </div>
                        <select name="familyContactMemberId" required defaultValue={deathCaseToEdit?.familyContactMemberId || ""} className="w-full px-3 py-2 border bg-white border-gray-300 rounded-md">
                            <option value="" disabled>-- Contact dans la famille --</option>
                            {members.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
                        </select>
                         <div className="grid grid-cols-2 gap-4">
                           <div>
                                <label className="text-xs text-gray-500">Date des obsèques</label>
                                <input type="date" name="funeralDate" defaultValue={deathCaseToEdit?.funeralDate} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                           </div>
                           <input name="funeralLocation" placeholder="Lieu des obsèques" defaultValue={deathCaseToEdit?.funeralLocation} className="w-full px-3 py-2 border border-gray-300 rounded-md self-end" />
                        </div>
                        <textarea name="churchSupportDetails" rows={3} placeholder="Détails du soutien de l'église..." defaultValue={deathCaseToEdit?.churchSupportDetails} className="w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
                        {isEditMode && (
                             <select name="status" defaultValue={deathCaseToEdit?.status} className="w-full px-3 py-2 border bg-white border-gray-300 rounded-md">
                                <option value="En cours">En cours</option>
                                <option value="Clôturé">Clôturé</option>
                            </select>
                        )}
                    </div>
                    <footer className="flex justify-end items-center p-4 bg-gray-50 rounded-b-xl space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">Annuler</button>
                        <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-church-dark-blue hover:bg-blue-900">{isEditMode ? 'Enregistrer' : 'Créer'}</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

const DetailItem: React.FC<{ icon: React.ReactNode, label: string, value?: string }> = ({ icon, label, value }) => (
    <div className="flex items-start gap-3">
        <div className="text-gray-500 mt-0.5">{icon}</div>
        <div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-sm font-medium text-gray-800">{value || 'Non renseigné'}</p>
        </div>
    </div>
);

const DeathCaseDetailModal: React.FC<{
    deathCase: DeathCase | null;
    onClose: () => void;
    onEdit: (dc: DeathCase) => void;
    onDelete: (id: string) => void;
    members: Member[];
    onLaunchCotisation: (dc: DeathCase) => void;
}> = ({ deathCase, onClose, onEdit, onDelete, members, onLaunchCotisation }) => {
    if (!deathCase) return null;
    const contact = findMemberById(deathCase.familyContactMemberId, members);
    
    return (
         <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl" onClick={e => e.stopPropagation()}>
                <header className="flex items-start justify-between p-4 border-b bg-gray-50 rounded-t-xl">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Détails du cas de décès</h2>
                        <p className="text-gray-600">Dossier de: {deathCase.deceasedName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200"><XMarkIcon className="w-6 h-6" /></button>
                </header>
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-6">
                        <DetailItem icon={<CalendarDaysIcon className="w-5 h-5"/>} label="Date du décès" value={deathCase.deathDate ? new Date(deathCase.deathDate).toLocaleDateString('fr-FR') : 'Inconnue'} />
                        <DetailItem icon={<CalendarDaysIcon className="w-5 h-5"/>} label="Date de déclaration" value={new Date(deathCase.declarationDate).toLocaleDateString('fr-FR')} />
                        <DetailItem icon={<CalendarDaysIcon className="w-5 h-5"/>} label="Date des obsèques" value={deathCase.funeralDate ? new Date(deathCase.funeralDate).toLocaleDateString('fr-FR') : 'À définir'} />
                        <DetailItem icon={<MapPinIcon className="w-5 h-5"/>} label="Lieu des obsèques" value={deathCase.funeralLocation} />
                        <div className="col-span-2">
                           <DetailItem icon={<UserCircleIcon className="w-5 h-5"/>} label="Contact famille dans l'église" value={contact ? `${contact.firstName} ${contact.lastName} (${contact.phone})` : 'Inconnu'} />
                        </div>
                         <div className="col-span-2">
                           <DetailItem icon={<DocumentTextIcon className="w-5 h-5"/>} label="Soutien de l'église" value={deathCase.churchSupportDetails} />
                        </div>
                    </div>
                     <div className="border-t pt-4 flex items-center justify-between">
                        <h4 className="text-sm font-semibold">Actions rapides</h4>
                        <div className="flex gap-2">
                            <button onClick={() => onLaunchCotisation(deathCase)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-green-600 rounded-md border hover:bg-green-700"><BanknotesIcon className="w-4 h-4"/>Lancer une cotisation</button>
                            <button onClick={() => alert('Fonctionnalité à venir: Envoyer une annonce')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-blue-600 rounded-md border hover:bg-blue-700"><ChatBubbleBottomCenterTextIcon className="w-4 h-4"/>Envoyer une annonce</button>
                        </div>
                    </div>
                </div>
                 <footer className="flex justify-between items-center p-4 bg-gray-50 rounded-b-xl space-x-3">
                    <button onClick={() => onDelete(deathCase.id)} className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 bg-white border border-gray-300 rounded-md hover:bg-red-50">
                        <TrashIcon className="w-4 h-4" /> Supprimer
                    </button>
                    <button onClick={() => onEdit(deathCase)} className="flex items-center gap-1.5 px-3 py-2 text-sm text-white bg-church-dark-blue rounded-md shadow hover:bg-blue-900">
                       <PencilIcon className="w-4 h-4" /> Modifier
                    </button>
                </footer>
            </div>
        </div>
    );
};

interface DeathCasesProps {
    deathCases: DeathCase[];
    members: Member[];
    onSaveCase: (data: Omit<DeathCase, 'id'> & { id?: string }) => void;
    onDeleteCase: (id: string) => void;
    onSaveCampaign: (campaign: Omit<CotisationCampaign, 'id'>) => void;
}


const DeathCases: React.FC<DeathCasesProps> = ({ deathCases, members, onSaveCase, onDeleteCase, onSaveCampaign }) => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingCase, setEditingCase] = useState<DeathCase | null>(null);
    const [viewingCase, setViewingCase] = useState<DeathCase | null>(null);
    const [isCampaignModalOpen, setCampaignModalOpen] = useState(false);
    const [campaignForCase, setCampaignForCase] = useState<DeathCase | null>(null);

    const handleOpenModal = () => {
        setEditingCase(null);
        setModalOpen(true);
    };

    const handleEdit = (dc: DeathCase) => {
        setViewingCase(null); 
        setEditingCase(dc);
        setModalOpen(true);
    };

    const handleView = (dc: DeathCase) => {
        setViewingCase(dc);
    };

    const handleDelete = (id: string) => {
        onDeleteCase(id);
        setViewingCase(null);
    };
    
    const handleSave = (data: Omit<DeathCase, 'id'> & { id?: string }) => {
        onSaveCase(data);
        setModalOpen(false);
        setEditingCase(null);
    };

    const handleLaunchCotisation = (dc: DeathCase) => {
        setViewingCase(null);
        setCampaignForCase(dc);
        setCampaignModalOpen(true);
    };


    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                 <div>
                    <h2 className="text-2xl font-bold text-gray-800">Gestion des Cas de Décès</h2>
                    <p className="mt-1 text-gray-500">Gérez les dossiers et le soutien pour les cas de décès.</p>
                </div>
                <button 
                    onClick={handleOpenModal}
                    className="bg-church-dark-teal text-white px-4 py-2 rounded-md shadow hover:bg-church-teal transition-colors flex items-center justify-center w-full md:w-auto">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Enregistrer un cas
                </button>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-md">
                 <h3 className="text-lg font-semibold text-gray-800 mb-4">Liste des cas enregistrés</h3>
                 {deathCases.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-600">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Personne décédée</th>
                                    <th scope="col" className="px-6 py-3">Date de déclaration</th>
                                    <th scope="col" className="px-6 py-3">Contact Famille</th>
                                    <th scope="col" className="px-6 py-3">Statut</th>
                                    <th scope="col" className="px-6 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deathCases.map(dc => {
                                    const contact = findMemberById(dc.familyContactMemberId, members);
                                    return (
                                        <tr key={dc.id} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 font-semibold text-gray-900">
                                                <button onClick={() => handleView(dc)} className="hover:text-church-dark-blue transition-colors">
                                                    {dc.deceasedName}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">{new Date(dc.declarationDate).toLocaleDateString('fr-FR')}</td>
                                            <td className="px-6 py-4">
                                                {contact ? (
                                                    <div className="flex items-center gap-2">
                                                        <img src={contact.photoUrl} alt={contact.firstName} className="w-8 h-8 rounded-full" />
                                                        <span>{contact.firstName} {contact.lastName}</span>
                                                    </div>
                                                ) : <span className="italic text-gray-500">Contact non trouvé</span>}
                                            </td>
                                            <td className="px-6 py-4"><span className={getStatusChip(dc.status)}>{dc.status}</span></td>
                                            <td className="px-6 py-4 text-center">
                                                <button onClick={() => handleEdit(dc)} className="font-medium text-church-dark-blue hover:underline">Gérer</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                 ) : (
                    <div className="text-center py-16">
                        <HeartIcon className="w-16 h-16 mx-auto text-gray-300" />
                        <h3 className="mt-4 text-lg font-semibold text-gray-700">Aucun cas de décès enregistré.</h3>
                        <p className="mt-1 text-gray-500">Cliquez sur "Enregistrer un cas" pour commencer.</p>
                    </div>
                 )}
            </div>

            <DeathCaseModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                members={members}
                deathCaseToEdit={editingCase}
            />

            <DeathCaseDetailModal
                deathCase={viewingCase}
                onClose={() => setViewingCase(null)}
                onEdit={handleEdit}
                onDelete={handleDelete}
                members={members}
                onLaunchCotisation={handleLaunchCotisation}
            />

            <CampaignForDeathCaseModal
                isOpen={isCampaignModalOpen}
                onClose={() => setCampaignModalOpen(false)}
                deathCase={campaignForCase}
                members={members}
                onSave={onSaveCampaign}
            />
        </div>
    );
}

export default DeathCases;
