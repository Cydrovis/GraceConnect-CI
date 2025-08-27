import React, { useState, useMemo, useRef, useEffect } from 'react';
import { CotisationCampaign, MemberCotisation, Member, CotisationPayment, Group, DeathCase, Project } from '../types';
import { BanknotesIcon, PlusIcon, XMarkIcon, CurrencyDollarIcon, PresentationChartBarIcon, ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon, UserCircleIcon, DocumentArrowDownIcon, ChatBubbleBottomCenterTextIcon, MagnifyingGlassIcon, ChevronDownIcon, HeartIcon, RocketLaunchIcon } from './icons/HeroIcons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


const findMemberById = (id: string, members: Member[]): Member | undefined => members.find(m => m.id === id);

const getStatusChip = (status: MemberCotisation['status']) => {
    const baseClasses = 'px-2 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-1.5';
    switch (status) {
        case 'Payée': return {_class: `${baseClasses} bg-green-100 text-green-800`, icon: <CheckCircleIcon className="w-3.5 h-3.5"/>};
        case 'Partiel': return {_class: `${baseClasses} bg-yellow-100 text-yellow-800`, icon: <PresentationChartBarIcon className="w-3.5 h-3.5"/>};
        case 'Non payée': return {_class: `${baseClasses} bg-red-100 text-red-800`, icon: <XCircleIcon className="w-3.5 h-3.5"/>};
        case 'En retard': return {_class: `${baseClasses} bg-red-200 text-red-900`, icon: <ExclamationTriangleIcon className="w-3.5 h-3.5"/>};
        default: return {_class: baseClasses, icon: null};
    }
};

const CampaignModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (campaign: Omit<CotisationCampaign, 'id'>) => void;
    groups: Group[];
    deathCases: DeathCase[];
    members: Member[];
}> = ({ isOpen, onClose, onSave, groups, deathCases, members }) => {
    const [isAmountFree, setIsAmountFree] = useState(false);
    const [targetScope, setTargetScope] = useState<'Tous les membres' | 'Groupe spécifique' | 'Volontaires'>('Tous les membres');
    const [campaignType, setCampaignType] = useState<CotisationCampaign['type']>('Projet spécial');
    const [hasEndDate, setHasEndDate] = useState(true);
    const [closeOnTargetAmount, setCloseOnTargetAmount] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Reset state for new campaign form
            setIsAmountFree(false);
            setTargetScope('Tous les membres');
            setCampaignType('Projet spécial');
            setHasEndDate(true);
            setCloseOnTargetAmount(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        
        const campaignData: Omit<CotisationCampaign, 'id'> = {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            type: campaignType,
            frequency: formData.get('frequency') as CotisationCampaign['frequency'],
            defaultAmount: isAmountFree ? 0 : parseFloat(formData.get('defaultAmount') as string),
            isAmountFree: isAmountFree,
            isMandatory: formData.get('isMandatory') === 'true',
            targetScope: targetScope,
            targetGroupId: targetScope === 'Groupe spécifique' ? (formData.get('targetGroupId') as string) : undefined,
            startDate: formData.get('startDate') as string,
            endDate: hasEndDate ? (formData.get('endDate') as string || undefined) : undefined,
            deathCaseId: campaignType === 'Cas de Décès' ? (formData.get('deathCaseId') as string) : undefined,
            closeOnTargetAmount: !hasEndDate && closeOnTargetAmount,
        };

        if (campaignData.name && campaignData.type && campaignData.frequency && campaignData.startDate) {
            onSave(campaignData);
        } else {
            alert('Veuillez remplir tous les champs obligatoires.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-xl">
                    <h2 className="text-xl font-bold text-gray-800">Créer une cotisation</h2>
                     <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200"><XMarkIcon className="w-6 h-6" /></button>
                </header>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nom de la cotisation</label>
                            <input id="name" name="name" type="text" required placeholder="Ex: Projet Construction Temple" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-church-dark-teal focus:border-church-dark-teal" />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea id="description" name="description" rows={2} placeholder="Courte description de l'objectif de la cotisation" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-church-dark-teal focus:border-church-dark-teal"></textarea>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select id="type" name="type" required value={campaignType} onChange={(e) => setCampaignType(e.target.value as CotisationCampaign['type'])} className="w-full px-3 py-2 border bg-white border-gray-300 rounded-md shadow-sm focus:ring-church-dark-teal focus:border-church-dark-teal">
                                    <option>Projet spécial</option>
                                    <option>Département</option>
                                    <option>Campagne spéciale</option>
                                    <option>Régulière</option>
                                    <option>Cas de Décès</option>
                                </select>
                            </div>
                             <div>
                                <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">Fréquence</label>
                                <select id="frequency" name="frequency" required defaultValue="Ponctuelle" className="w-full px-3 py-2 border bg-white border-gray-300 rounded-md shadow-sm focus:ring-church-dark-teal focus:border-church-dark-teal">
                                    <option>Ponctuelle</option>
                                    <option>Mensuelle</option>
                                    <option>Annuelle</option>
                                    <option>Unique</option>
                                </select>
                            </div>
                        </div>

                        {campaignType === 'Cas de Décès' && (
                            <div>
                                <label htmlFor="deathCaseId" className="block text-sm font-medium text-gray-700 mb-1">Cas de décès concerné</label>
                                <select id="deathCaseId" name="deathCaseId" required className="w-full px-3 py-2 border bg-white border-gray-300 rounded-md shadow-sm focus:ring-church-dark-teal focus:border-church-dark-teal" defaultValue="">
                                    <option value="" disabled>-- Choisir un cas --</option>
                                    {deathCases.filter(d => d.status === 'En cours').map(dc => {
                                        const contact = findMemberById(dc.familyContactMemberId, members);
                                        return (
                                            <option key={dc.id} value={dc.id}>
                                                Décès de {dc.deceasedName} (Famille {contact?.lastName})
                                            </option>
                                        );
                                    })}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Seuls les cas "En cours" sont affichés.</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="isMandatory" className="block text-sm font-medium text-gray-700 mb-1">Caractère</label>
                                <select id="isMandatory" name="isMandatory" required defaultValue="false" className="w-full px-3 py-2 border bg-white border-gray-300 rounded-md shadow-sm focus:ring-church-dark-teal focus:border-church-dark-teal">
                                    <option value="false">Volontaire</option>
                                    <option value="true">Obligatoire</option>
                                </select>
                            </div>
                             <div>
                                <label htmlFor="defaultAmount" className="block text-sm font-medium text-gray-700 mb-1">Montant par défaut (XOF)</label>
                                <input id="defaultAmount" name="defaultAmount" type="number" step="0.01" disabled={isAmountFree} placeholder="50000" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-church-dark-teal focus:border-church-dark-teal disabled:bg-gray-100" />
                                <div className="mt-2 flex items-center">
                                    <input id="isAmountFree" type="checkbox" checked={isAmountFree} onChange={e => setIsAmountFree(e.target.checked)} className="h-4 w-4 text-church-dark-blue border-gray-300 rounded focus:ring-church-light-teal" />
                                    <label htmlFor="isAmountFree" className="ml-2 block text-sm text-gray-900">Montant libre (laisser le membre décider)</label>
                                </div>
                            </div>
                        </div>
                         <div>
                            <label htmlFor="targetScope" className="block text-sm font-medium text-gray-700 mb-1">Groupe concerné</label>
                            <select id="targetScope" name="targetScope" value={targetScope} onChange={e => setTargetScope(e.target.value as any)} className="w-full px-3 py-2 border bg-white border-gray-300 rounded-md shadow-sm focus:ring-church-dark-teal focus:border-church-dark-teal">
                               <option>Tous les membres</option>
                               <option>Groupe spécifique</option>
                               <option>Volontaires</option>
                            </select>
                        </div>

                        {targetScope === 'Groupe spécifique' && (
                             <div>
                                <label htmlFor="targetGroupId" className="block text-sm font-medium text-gray-700 mb-1">Choisir le groupe spécifique</label>
                                <select id="targetGroupId" name="targetGroupId" required className="w-full px-3 py-2 border bg-white border-gray-300 rounded-md shadow-sm focus:ring-church-dark-teal focus:border-church-dark-teal">
                                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                                <input id="startDate" name="startDate" type="date" required defaultValue={new Date().toISOString().substring(0,10)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-church-dark-teal focus:border-church-dark-teal" />
                            </div>
                            {hasEndDate && (
                                <div>
                                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                                    <input id="endDate" name="endDate" type="date" required={hasEndDate} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-church-dark-teal focus:border-church-dark-teal" />
                                </div>
                            )}
                        </div>
                        <div className="space-y-2 border-t pt-4">
                            <div className="flex items-center">
                                <input id="hasEndDateCheckbox" type="checkbox" checked={hasEndDate} onChange={e => { setHasEndDate(e.target.checked); if (e.target.checked) { setCloseOnTargetAmount(false); } }} className="h-4 w-4 text-church-dark-blue border-gray-300 rounded focus:ring-church-light-teal" />
                                <label htmlFor="hasEndDateCheckbox" className="ml-2 block text-sm text-gray-900">Cette cotisation a une date de fin</label>
                            </div>
                            
                            {!hasEndDate && (
                                <div className="flex items-center pl-6">
                                    <input id="closeOnTargetAmount" type="checkbox" checked={closeOnTargetAmount} onChange={e => setCloseOnTargetAmount(e.target.checked)} className="h-4 w-4 text-church-dark-blue border-gray-300 rounded focus:ring-church-light-teal" />
                                    <label htmlFor="closeOnTargetAmount" className="ml-2 block text-sm text-gray-900">Clôturer la cotisation une fois la somme fixée atteinte</label>
                                </div>
                            )}
                        </div>
                    </div>
                    <footer className="flex justify-end items-center p-4 bg-gray-50 rounded-b-xl space-x-3 border-t">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">Annuler</button>
                        <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-church-dark-blue hover:bg-blue-900">Enregistrer la cotisation</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

const PaymentModal: React.FC<{
    isOpen: boolean,
    onClose: () => void,
    onSave: (pledgeId: string, payment: Omit<CotisationPayment, 'id'>) => void,
    pledge: MemberCotisation | null,
    member: Member | null,
}> = ({ isOpen, onClose, onSave, pledge, member }) => {
    if (!isOpen || !pledge || !member) return null;

    const remainingAmount = pledge.expectedAmount - pledge.payments.reduce((sum, p) => sum + p.amount, 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const amount = parseFloat(formData.get('amount') as string);
        if (isNaN(amount) || amount <= 0) {
            alert("Montant invalide");
            return;
        }

        const paymentData: Omit<CotisationPayment, 'id'> = {
            amount,
            date: formData.get('date') as string,
            method: formData.get('method') as CotisationPayment['method'],
        };
        onSave(pledge.id, paymentData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-xl">
                    <h2 className="text-xl font-bold text-gray-800">Ajouter un paiement</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200"><XMarkIcon className="w-6 h-6" /></button>
                </header>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <p>Membre: <span className="font-semibold">{member.firstName} {member.lastName}</span></p>
                        <p>Solde restant: <span className="font-semibold text-red-600">{remainingAmount.toLocaleString('fr-FR')} XOF</span></p>
                        
                        <input type="date" name="date" required defaultValue={new Date().toISOString().substring(0,10)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        <input type="number" name="amount" required placeholder="Montant versé" step="0.01" max={remainingAmount > 0 ? remainingAmount : undefined} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        <select name="method" required defaultValue="Espèces" className="w-full px-3 py-2 border bg-white border-gray-300 rounded-md">
                            <option>Espèces</option>
                            <option>Mobile Money</option>
                            <option>Virement</option>
                            <option>Carte</option>
                        </select>
                    </div>
                    <footer className="flex justify-end items-center p-4 bg-gray-50 rounded-b-xl space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md">Annuler</button>
                        <button type="submit" className="px-4 py-2 border-transparent rounded-md text-white bg-church-dark-blue">Enregistrer paiement</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

const GroupPaymentModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (payment: Omit<CotisationPayment, 'id'>) => void;
    selectedCount: number;
}> = ({ isOpen, onClose, onSave, selectedCount }) => {
    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const amount = parseFloat(formData.get('amount') as string);

        if (isNaN(amount) || amount <= 0) {
            alert("Veuillez entrer un montant valide.");
            return;
        }

        const paymentData: Omit<CotisationPayment, 'id'> = {
            amount,
            date: formData.get('date') as string,
            method: formData.get('method') as CotisationPayment['method'],
        };
        onSave(paymentData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-xl">
                    <h2 className="text-xl font-bold text-gray-800">Paiement groupé</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200"><XMarkIcon className="w-6 h-6" /></button>
                </header>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <p>Vous êtes sur le point d'enregistrer un paiement pour <span className="font-bold">{selectedCount} membre(s)</span>.</p>
                        <p className="text-sm text-yellow-700 bg-yellow-50 p-3 rounded-md">Le montant que vous entrez sera ajouté à la fiche de chaque membre sélectionné.</p>

                        <input type="date" name="date" required defaultValue={new Date().toISOString().substring(0,10)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        <input type="number" name="amount" required placeholder="Montant versé (par membre)" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        <select name="method" required defaultValue="Espèces" className="w-full px-3 py-2 border bg-white border-gray-300 rounded-md">
                            <option>Espèces</option>
                            <option>Mobile Money</option>
                            <option>Virement</option>
                            <option>Carte</option>
                        </select>
                    </div>
                    <footer className="flex justify-end items-center p-4 bg-gray-50 rounded-b-xl space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md">Annuler</button>
                        <button type="submit" className="px-4 py-2 border-transparent rounded-md text-white bg-church-dark-blue">Appliquer le paiement</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};


const AddMembersModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (membersToAdd: { memberId: string, expectedAmount: number }[]) => void;
    campaign: CotisationCampaign;
    allMembers: Member[];
    currentPledges: MemberCotisation[];
}> = ({ isOpen, onClose, onSave, campaign, allMembers, currentPledges }) => {
    const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
    const [expectedAmount, setExpectedAmount] = useState(campaign.defaultAmount);

    useEffect(() => {
        if (isOpen) {
            setSelectedMemberIds(new Set());
            setExpectedAmount(campaign.defaultAmount);
        }
    }, [isOpen, campaign.defaultAmount]);
    
    if (!isOpen) return null;

    const availableMembers = allMembers.filter(m => !currentPledges.some(p => p.memberId === m.id));

    const handleSave = () => {
        if (selectedMemberIds.size === 0) {
            alert("Veuillez sélectionner au moins un membre.");
            return;
        }
        const membersToAdd = Array.from(selectedMemberIds).map(memberId => ({
            memberId,
            expectedAmount
        }));
        onSave(membersToAdd);
    };

    const toggleMemberSelection = (memberId: string) => {
        setSelectedMemberIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(memberId)) {
                newSet.delete(memberId);
            } else {
                newSet.add(memberId);
            }
            return newSet;
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-xl">
                    <h2 className="text-xl font-bold text-gray-800">Ajouter des membres à "{campaign.name}"</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200"><XMarkIcon className="w-6 h-6" /></button>
                </header>
                <div className="p-6 space-y-4 overflow-y-auto">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Membres disponibles</label>
                        <div className="h-64 border rounded-md overflow-y-auto bg-white">
                            {availableMembers.map(member => (
                                <label key={member.id} className="flex items-center gap-3 p-2 border-b cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="checkbox"
                                        checked={selectedMemberIds.has(member.id)}
                                        onChange={() => toggleMemberSelection(member.id)}
                                        className="h-4 w-4 text-church-dark-blue rounded border-gray-300 focus:ring-church-light-teal"
                                    />
                                    <img src={member.photoUrl} alt={member.firstName} className="w-8 h-8 rounded-full" />
                                    <span>{member.firstName} {member.lastName}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Montant attendu par membre (XOF)</label>
                        <input
                            type="number"
                            value={expectedAmount}
                            onChange={(e) => setExpectedAmount(parseFloat(e.target.value) || 0)}
                            disabled={!campaign.isAmountFree && campaign.defaultAmount > 0}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                        />
                    </div>
                </div>
                <footer className="flex justify-end items-center p-4 bg-gray-50 rounded-b-xl space-x-3 border-t">
                    <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md">Annuler</button>
                    <button type="button" onClick={handleSave} className="px-4 py-2 border-transparent rounded-md text-white bg-church-dark-blue">Ajouter ({selectedMemberIds.size})</button>
                </footer>
            </div>
        </div>
    );
};


const CampaignDetailView: React.FC<{
    campaign: CotisationCampaign;
    allPledges: MemberCotisation[];
    allMembers: Member[];
    deathCases: DeathCase[];
    projects: Project[];
    onBack: () => void;
    onAddPayment: (pledgeId: string, payment: Omit<CotisationPayment, 'id'>) => void;
    onAddMembers: () => void;
}> = ({ campaign, allPledges, allMembers, deathCases, projects, onBack, onAddPayment, onAddMembers }) => {
    const [filterStatus, setFilterStatus] = useState('all');
    const [paymentPledge, setPaymentPledge] = useState<MemberCotisation | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [exportOpen, setExportOpen] = useState(false);
    const exportRef = useRef<HTMLDivElement>(null);
    const [selectedPledgeIds, setSelectedPledgeIds] = useState<Set<string>>(new Set());
    const [isGroupPaymentModalOpen, setGroupPaymentModalOpen] = useState(false);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
                setExportOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    const campaignPledges = useMemo(() => {
        return allPledges
            .filter(p => p.campaignId === campaign.id)
            .filter(p => filterStatus === 'all' || p.status === filterStatus)
            .filter(p => {
                if (!searchTerm) return true;
                const member = findMemberById(p.memberId, allMembers);
                if (!member) return false;
                return `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
            });
    }, [allPledges, campaign.id, filterStatus, searchTerm, allMembers]);

    const stats = useMemo(() => {
        const pledges = allPledges.filter(p => p.campaignId === campaign.id);
        const totalExpected = pledges.reduce((sum, p) => sum + p.expectedAmount, 0);
        const totalReceived = pledges.reduce((sum, p) => sum + p.payments.reduce((pSum, payment) => pSum + payment.amount, 0), 0);
        return { totalExpected, totalReceived, rate: totalExpected > 0 ? (totalReceived / totalExpected) * 100 : 0 };
    }, [allPledges, campaign.id]);
    
    const handleExport = (format: 'pdf' | 'csv' | 'word') => {
        setExportOpen(false);
        if (campaignPledges.length === 0) {
            alert("Aucun membre à exporter pour les filtres actuels.");
            return;
        }

        const dataToExport = campaignPledges.map(pledge => {
            const member = findMemberById(pledge.memberId, allMembers);
            const paidAmount = pledge.payments.reduce((sum, p) => sum + p.amount, 0);
            const balance = pledge.expectedAmount - paidAmount;
            return {
                member: member ? `${member.firstName} ${member.lastName}` : 'N/A',
                expected: `${pledge.expectedAmount.toLocaleString('fr-FR')} XOF`,
                paid: `${paidAmount.toLocaleString('fr-FR')} XOF`,
                balance: `${balance.toLocaleString('fr-FR')} XOF`,
                status: pledge.status
            };
        });

        const safeCampaignName = campaign.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const date = new Date().toISOString().split('T')[0];
        const filename = `suivi_${safeCampaignName}_${date}`;

        if (format === 'pdf') {
            const doc = new jsPDF();
            doc.text(`Suivi de la cotisation: ${campaign.name}`, 14, 15);
            autoTable(doc, {
                head: [['Membre', 'Attendu', 'Versé', 'Solde', 'Statut']],
                body: dataToExport.map(item => Object.values(item)),
                startY: 20
            });
            doc.save(`${filename}.pdf`);
        } else if (format === 'csv') {
            const headers = ['Membre', 'Attendu', 'Versé', 'Solde', 'Statut'];
            const escapeCsvCell = (cell: string) => `"${cell.replace(/"/g, '""')}"`;
            const rows = dataToExport.map(item => Object.values(item).map(escapeCsvCell).join(','));
            const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
            const link = document.createElement("a");
            link.setAttribute("href", encodeURI(csvContent));
            link.setAttribute("download", `${filename}.csv`);
            link.click();
        } else if (format === 'word') {
            const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export Suivi</title></head><body><h2>Suivi: ${campaign.name}</h2>`;
            const tableHeader = '<table><thead><tr><th>Membre</th><th>Attendu</th><th>Versé</th><th>Solde</th><th>Statut</th></tr></thead><tbody>';
            const tableRows = dataToExport.map(item => `<tr><td>${item.member}</td><td>${item.expected}</td><td>${item.paid}</td><td>${item.balance}</td><td>${item.status}</td></tr>`).join('');
            const footer = '</tbody></table></body></html>';
            const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(header + tableHeader + tableRows + footer);
            const link = document.createElement("a");
            link.href = source;
            link.download = `${filename}.doc`;
            link.click();
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedPledgeIds(new Set(campaignPledges.map(p => p.id)));
        } else {
            setSelectedPledgeIds(new Set());
        }
    };

    const handleSelectOne = (pledgeId: string) => {
        const newSelectedIds = new Set(selectedPledgeIds);
        if (newSelectedIds.has(pledgeId)) {
            newSelectedIds.delete(pledgeId);
        } else {
            newSelectedIds.add(pledgeId);
        }
        setSelectedPledgeIds(newSelectedIds);
    };

    const handleSaveGroupPayment = (payment: Omit<CotisationPayment, 'id'>) => {
        selectedPledgeIds.forEach(pledgeId => {
            onAddPayment(pledgeId, payment);
        });
        setGroupPaymentModalOpen(false);
        setSelectedPledgeIds(new Set());
    };

    const deathCase = campaign.deathCaseId ? deathCases.find(dc => dc.id === campaign.deathCaseId) : null;
    const project = campaign.projectId ? projects.find(p => p.id === campaign.projectId) : null;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <PaymentModal 
                isOpen={!!paymentPledge} 
                onClose={() => setPaymentPledge(null)} 
                onSave={onAddPayment}
                pledge={paymentPledge}
                member={paymentPledge ? findMemberById(paymentPledge.memberId, allMembers) : null}
            />
             <GroupPaymentModal
                isOpen={isGroupPaymentModalOpen}
                onClose={() => setGroupPaymentModalOpen(false)}
                onSave={handleSaveGroupPayment}
                selectedCount={selectedPledgeIds.size}
            />

            <button onClick={onBack} className="text-sm font-semibold text-church-dark-blue mb-4">← Retour aux campagnes</button>
            <h3 className="text-xl font-bold text-gray-800">{campaign.name}</h3>
            {deathCase && (
                <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md my-2">
                    <HeartIcon className="w-4 h-4 inline-block mr-2"/>
                    Cette campagne soutient la famille de <strong>{deathCase.deceasedName}</strong>.
                </p>
            )}
            {project && (
                <p className="text-sm text-purple-600 bg-purple-50 p-2 rounded-md my-2">
                    <RocketLaunchIcon className="w-4 h-4 inline-block mr-2"/>
                    Cette campagne soutient le projet : <strong>{project.name}</strong>.
                </p>
            )}
            <p className="text-sm text-gray-500 mb-4">{campaign.description}</p>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total Attendu</p>
                    <p className="text-2xl font-bold">{stats.totalExpected.toLocaleString('fr-FR')} XOF</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total Reçu</p>
                    <p className="text-2xl font-bold text-green-600">{stats.totalReceived.toLocaleString('fr-FR')} XOF</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Taux de réalisation</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.rate.toFixed(1)}%</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
                <h4 className="text-lg font-semibold">Suivi des membres</h4>
                <div className="flex items-center gap-2">
                     <button onClick={onAddMembers} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-church-green rounded-lg hover:bg-green-600 shadow">
                        <PlusIcon className="w-4 h-4" /> Ajouter un membre
                    </button>
                     <div className="relative">
                        <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                            type="text"
                            placeholder="Rechercher un membre..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-md text-sm"
                        />
                    </div>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border-gray-300 rounded-md text-sm">
                        <option value="all">Tous les statuts</option>
                        <option value="Payée">Payée</option>
                        <option value="Partiel">Partiel</option>
                        <option value="Non payée">Non payée</option>
                        <option value="En retard">En retard</option>
                    </select>
                     <div className="relative" ref={exportRef}>
                        <button
                            onClick={() => setExportOpen(prev => !prev)}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            <DocumentArrowDownIcon className="w-4 h-4" />
                            Exporter
                            <ChevronDownIcon className="w-4 h-4" />
                        </button>
                        {exportOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 ring-1 ring-black ring-opacity-5">
                                <a href="#" onClick={(e) => { e.preventDefault(); handleExport('pdf'); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Exporter en PDF</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); handleExport('csv'); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Exporter en Excel (CSV)</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); handleExport('word'); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Exporter en Word</a>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {selectedPledgeIds.size > 0 && (
                <div className="bg-blue-50 p-2 rounded-lg mb-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-blue-800">{selectedPledgeIds.size} membre(s) sélectionné(s)</span>
                    <button onClick={() => setGroupPaymentModalOpen(true)} className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md shadow hover:bg-blue-700">
                        Paiement groupé
                    </button>
                </div>
            )}
            
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-4">
                                <input type="checkbox" onChange={handleSelectAll} checked={selectedPledgeIds.size > 0 && selectedPledgeIds.size === campaignPledges.length} className="w-4 h-4 text-church-dark-blue bg-gray-100 border-gray-300 rounded focus:ring-church-light-teal"/>
                            </th>
                            <th className="px-4 py-2 text-left">Membre</th>
                            <th className="px-4 py-2 text-right">Attendu</th>
                            <th className="px-4 py-2 text-right">Versé</th>
                            <th className="px-4 py-2 text-right">Solde</th>
                            <th className="px-4 py-2 text-center">Statut</th>
                            <th className="px-4 py-2 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {campaignPledges.map(pledge => {
                            const member = findMemberById(pledge.memberId, allMembers);
                            const paidAmount = pledge.payments.reduce((sum, p) => sum + p.amount, 0);
                            const balance = pledge.expectedAmount - paidAmount;
                            const statusStyle = getStatusChip(pledge.status);
                            if (!member) return null;
                            return (
                                <tr key={pledge.id} className="border-b hover:bg-gray-50">
                                     <td className="w-4 p-4">
                                        <input type="checkbox" checked={selectedPledgeIds.has(pledge.id)} onChange={() => handleSelectOne(pledge.id)} className="w-4 h-4 text-church-dark-blue bg-gray-100 border-gray-300 rounded focus:ring-church-light-teal" />
                                    </td>
                                    <td 
                                        className="px-4 py-2 font-medium cursor-pointer hover:text-church-dark-blue transition-colors"
                                        onClick={() => setPaymentPledge(pledge)}
                                    >
                                        {member.firstName} {member.lastName}
                                    </td>
                                    <td className="px-4 py-2 text-right">{pledge.expectedAmount.toLocaleString('fr-FR')} XOF</td>
                                    <td className="px-4 py-2 text-right text-green-600">{paidAmount.toLocaleString('fr-FR')} XOF</td>
                                    <td className="px-4 py-2 text-right text-red-600">{balance.toLocaleString('fr-FR')} XOF</td>
                                    <td className="px-4 py-2 text-center"><span className={statusStyle._class}>{statusStyle.icon}{pledge.status}</span></td>
                                    <td className="px-4 py-2 text-center">
                                        <button onClick={() => setPaymentPledge(pledge)} className="px-2 py-1 bg-green-600 text-white text-xs rounded-md shadow-sm hover:bg-green-700">Ajouter Paiement</button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

        </div>
    )
}

interface CotisationsProps {
    campaigns: CotisationCampaign[];
    memberCotisations: MemberCotisation[];
    members: Member[];
    groups: Group[];
    deathCases: DeathCase[];
    projects: Project[];
    onSaveCampaign: (campaign: Omit<CotisationCampaign, 'id'>) => void;
    onAddPayment: (pledgeId: string, payment: Omit<CotisationPayment, 'id'>) => void;
    onAddMembersToCampaign: (campaign: CotisationCampaign, membersToAdd: { memberId: string, expectedAmount: number }[]) => void;
}

const Cotisations: React.FC<CotisationsProps> = ({ campaigns, memberCotisations, members, groups, deathCases, projects, onSaveCampaign, onAddPayment, onAddMembersToCampaign }) => {
    const [selectedCampaign, setSelectedCampaign] = useState<CotisationCampaign | null>(null);
    const [isCampaignModalOpen, setCampaignModalOpen] = useState(false);
    const [isAddMembersModalOpen, setAddMembersModalOpen] = useState(false);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [exportOpen, setExportOpen] = useState(false);
    const exportRef = useRef<HTMLDivElement>(null);
    
    const campaignTypes: (CotisationCampaign['type'] | 'all')[] = ['all', 'Projet spécial', 'Département', 'Campagne spéciale', 'Régulière', 'Cas de Décès'];


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
                setExportOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const campaignStats = useMemo(() => {
        const filtered = campaigns.filter(campaign => {
            const searchMatch = searchTerm === '' || 
                campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                campaign.description.toLowerCase().includes(searchTerm.toLowerCase());

            const typeMatch = filterType === 'all' || campaign.type === filterType;

            const dateMatch = filterDate === '' || (
                campaign.startDate <= filterDate && 
                (!campaign.endDate || campaign.endDate >= filterDate)
            );

            return searchMatch && typeMatch && dateMatch;
        });

        return filtered.map(campaign => {
            const pledges = memberCotisations.filter(p => p.campaignId === campaign.id);
            const totalExpected = pledges.reduce((sum, p) => sum + p.expectedAmount, 0);
            const totalReceived = pledges.reduce((sum, p) => sum + p.payments.reduce((pSum, payment) => pSum + payment.amount, 0), 0);
            const membersUpToDate = pledges.filter(p => p.status === 'Payée').length;
            const membersLate = pledges.filter(p => p.status === 'En retard' || p.status === 'Non payée').length;
            return {
                id: campaign.id,
                name: campaign.name,
                totalExpected,
                totalReceived,
                rate: totalExpected > 0 ? (totalReceived / totalExpected) * 100 : 0,
                membersUpToDate,
                membersLate
            };
        });
    }, [campaigns, memberCotisations, searchTerm, filterDate, filterType]);
    
    const handleSaveCampaign = (campaignData: Omit<CotisationCampaign, 'id'>) => {
        onSaveCampaign(campaignData);
        setCampaignModalOpen(false);
    };
    
    const handleAddMembers = (membersToAdd: { memberId: string, expectedAmount: number }[]) => {
        if (!selectedCampaign) return;
        onAddMembersToCampaign(selectedCampaign, membersToAdd);
        setAddMembersModalOpen(false);
    };

    const handleExport = (format: 'pdf' | 'csv' | 'word') => {
        setExportOpen(false);
        if (campaignStats.length === 0) {
            alert("Aucune campagne à exporter pour les filtres actuels.");
            return;
        }

        const dataToExport = campaignStats.map(stat => ({
            name: stat.name,
            expected: `${stat.totalExpected.toLocaleString('fr-FR')} XOF`,
            received: `${stat.totalReceived.toLocaleString('fr-FR')} XOF`,
            rate: `${stat.rate.toFixed(1)}%`,
            upToDate: stat.membersUpToDate.toString(),
            late: stat.membersLate.toString()
        }));

        const date = new Date().toISOString().split('T')[0];
        const filename = `rapport_cotisations_${date}`;

        if (format === 'pdf') {
            const doc = new jsPDF();
            doc.text("Rapport Global des Cotisations", 14, 15);
            autoTable(doc, {
                head: [['Campagne', 'Total Attendu', 'Total Reçu', 'Taux (%)', 'Membres à jour', 'Membres en retard']],
                body: dataToExport.map(item => Object.values(item)),
                startY: 20
            });
            doc.save(`${filename}.pdf`);
        } else if (format === 'csv') {
            const headers = ['Campagne', 'Total Attendu', 'Total Reçu', 'Taux (%)', 'Membres a jour', 'Membres en retard'];
            const escapeCsvCell = (cell: string) => `"${cell.replace(/"/g, '""')}"`;
            const rows = dataToExport.map(item => Object.values(item).map(escapeCsvCell).join(','));
            const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
            const link = document.createElement("a");
            link.setAttribute("href", encodeURI(csvContent));
            link.setAttribute("download", `${filename}.csv`);
            link.click();
        } else if (format === 'word') {
            const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export Cotisations</title></head><body><h2>Rapport Global des Cotisations</h2>`;
            const tableHeader = '<table><thead><tr><th>Campagne</th><th>Total Attendu</th><th>Total Reçu</th><th>Taux (%)</th><th>Membres à jour</th><th>Membres en retard</th></tr></thead><tbody>';
            const tableRows = dataToExport.map(item => `<tr>${Object.values(item).map(val => `<td>${val}</td>`).join('')}</tr>`).join('');
            const footer = '</tbody></table></body></html>';
            const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(header + tableHeader + tableRows + footer);
            const link = document.createElement("a");
            link.href = source;
            link.download = `${filename}.doc`;
            link.click();
        }
    };


    if (selectedCampaign) {
        return (
            <>
                <CampaignDetailView 
                    campaign={selectedCampaign}
                    allPledges={memberCotisations}
                    allMembers={members}
                    deathCases={deathCases}
                    projects={projects}
                    onBack={() => setSelectedCampaign(null)}
                    onAddPayment={onAddPayment}
                    onAddMembers={() => setAddMembersModalOpen(true)}
                />
                 <AddMembersModal
                    isOpen={isAddMembersModalOpen}
                    onClose={() => setAddMembersModalOpen(false)}
                    onSave={handleAddMembers}
                    campaign={selectedCampaign}
                    allMembers={members}
                    currentPledges={memberCotisations.filter(p => p.campaignId === selectedCampaign.id)}
                 />
             </>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                 <div>
                    <h2 className="text-2xl font-bold text-gray-800">Gestion des Cotisations</h2>
                    <p className="mt-1 text-gray-500">Suivez les engagements financiers des membres.</p>
                </div>
                <div className="flex items-center space-x-2 w-full md:w-auto">
                    <div className="relative" ref={exportRef}>
                        <button
                            onClick={() => setExportOpen(prev => !prev)}
                            className="bg-white text-gray-700 px-4 py-2 rounded-md shadow border hover:bg-gray-50 transition-colors flex items-center justify-center"
                        >
                            <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                            Exporter
                            <ChevronDownIcon className={`w-4 h-4 ml-1 transition-transform ${exportOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {exportOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-20 ring-1 ring-black ring-opacity-5">
                                <a href="#" onClick={(e) => { e.preventDefault(); handleExport('pdf'); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Exporter en PDF</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); handleExport('csv'); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Exporter en Excel (CSV)</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); handleExport('word'); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Exporter en Word</a>
                            </div>
                        )}
                    </div>
                    <button 
                        onClick={() => setCampaignModalOpen(true)}
                        className="bg-church-dark-teal text-white px-4 py-2 rounded-md shadow hover:bg-church-teal transition-colors flex items-center justify-center">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Créer une cotisation
                    </button>
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
                 <h3 className="text-lg font-bold text-gray-800 mb-4">Tableau Global des Cotisations</h3>
                 <div className="flex flex-col md:flex-row justify-end items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg border">
                    <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="px-3 py-1.5 border border-gray-300 rounded-md text-sm" placeholder="jj/mm/aaaa" />
                    <div className="relative">
                        <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                            type="text"
                            placeholder="Rechercher par nom..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-md text-sm"
                            style={{minWidth: '220px'}}
                        />
                    </div>
                    <select value={filterType} onChange={e => setFilterType(e.target.value as any)} className="px-3 py-1.5 border border-gray-300 rounded-md bg-white text-sm">
                        {campaignTypes.map(type => 
                            <option key={type} value={type}>{type === 'all' ? 'Tous les types' : type}</option>
                        )}
                    </select>
                 </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left">Campagne</th>
                                <th className="px-4 py-2 text-right">Total Attendu</th>
                                <th className="px-4 py-2 text-right">Total Reçu</th>
                                <th className="px-4 py-2 text-center">Taux (%)</th>
                                <th className="px-4 py-2 text-center">Membres à jour</th>
                                <th className="px-4 py-2 text-center">Membres en retard</th>
                                <th className="px-4 py-2 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {campaignStats.map(stat => {
                                const campaign = campaigns.find(c => c.id === stat.id);
                                const isProjectCampaign = campaign?.type === 'Projet spécial' && campaign.projectId;
                                const isDeathCaseCampaign = campaign?.type === 'Cas de Décès';
                                return (
                                <tr key={stat.id} className="hover:bg-gray-50">
                                    <td 
                                        className="px-4 py-3 font-semibold text-gray-900 cursor-pointer"
                                        onClick={() => setSelectedCampaign(campaigns.find(c => c.id === stat.id) || null)}
                                    >
                                        <div className="flex items-center gap-2">
                                            {isProjectCampaign && <span title="Cotisation pour un projet"><RocketLaunchIcon className="w-4 h-4 text-purple-500" /></span>}
                                            {isDeathCaseCampaign && <span title="Cotisation pour un cas de décès"><HeartIcon className="w-4 h-4 text-red-400" /></span>}
                                            <span className="hover:text-church-dark-blue transition-colors">{stat.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">{stat.totalExpected.toLocaleString('fr-FR')} XOF</td>
                                    <td className="px-4 py-3 text-right text-green-600">{stat.totalReceived.toLocaleString('fr-FR')} XOF</td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div className="bg-blue-600 h-2.5 rounded-full" style={{width: `${stat.rate}%`}}></div>
                                        </div>
                                        <span className="text-xs">{stat.rate.toFixed(1)}%</span>
                                    </td>
                                    <td className="px-4 py-3 text-center text-green-700 font-medium">{stat.membersUpToDate}</td>
                                    <td className="px-4 py-3 text-center text-red-700 font-medium">{stat.membersLate}</td>
                                    <td className="px-4 py-3 text-center">
                                        <button onClick={() => setSelectedCampaign(campaigns.find(c => c.id === stat.id) || null)} className="text-sm font-semibold text-church-dark-blue hover:underline">Gérer</button>
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
             <CampaignModal 
                isOpen={isCampaignModalOpen}
                onClose={() => setCampaignModalOpen(false)}
                onSave={handleSaveCampaign}
                groups={groups}
                deathCases={deathCases}
                members={members}
            />
        </div>
    );
}

export default Cotisations;