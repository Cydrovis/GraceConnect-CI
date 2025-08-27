



import React, { useState } from 'react';
import { Member, Child } from '../types';
import { XMarkIcon, PencilIcon, TrashIcon, DevicePhoneMobileIcon, IdentificationIcon, CakeIcon, MapPinIcon, GlobeAltIcon, BriefcaseIcon, HeartIcon, SparklesIcon, CalendarDaysIcon, BookOpenIcon, UsersIcon, PresentationChartLineIcon, CurrencyDollarIcon, ChatBubbleLeftRightIcon, ClipboardDocumentCheckIcon, DocumentTextIcon, DocumentArrowDownIcon, UserCircleIcon, UserGroupIcon, EnvelopeIcon } from './icons/HeroIcons';
import { getAge } from '../constants';

interface MemberDetailViewProps {
    member: Member;
    onClose: () => void;
    onEdit: (member: Member) => void;
    onDelete: (memberId: string) => void;
}

const DetailItem: React.FC<{ icon: React.ReactNode, label: string, value?: string | number }> = ({ icon, label, value }) => (
    <div className="flex items-start gap-3">
        <div className="text-theme-text-muted mt-0.5">{icon}</div>
        <div>
            <p className="text-xs text-theme-text-muted">{label}</p>
            <p className="text-sm font-medium text-theme-text-base">{value || 'Non renseigné'}</p>
        </div>
    </div>
);

const TabButton: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
            active ? 'bg-church-teal text-white' : 'text-theme-text-muted hover:bg-slate-100'
        }`}
    >
        {label}
    </button>
);

const MemberDetailView: React.FC<MemberDetailViewProps> = ({ member, onClose, onEdit, onDelete }) => {
    const [activeTab, setActiveTab] = useState<'info' | 'spiritual' | 'history' | 'docs'>('info');

    const handleCallClick = () => {
        alert(`Appelez ${member.firstName} au : ${member.phone}`);
    };

    const handleEditClick = () => {
        onEdit(member);
    };

    const handleDeleteClick = () => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${member.firstName} ${member.lastName}? Cette action est irréversible.`)) {
            onDelete(member.id);
        }
    };

    const age = getAge(member.birthDate);
    const ageText = age !== null ? ` (${age} ans)` : '';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose}>
            <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-theme-bg shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out"
                 onClick={(e) => e.stopPropagation()}>
                
                {/* Header */}
                <header className="p-4 bg-theme-card border-b border-theme-border">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <img src={member.photoUrl} alt="avatar" className="w-16 h-16 rounded-full" />
                            <div>
                                <h2 className="text-2xl font-bold text-theme-text-base">{member.firstName} {member.lastName}</h2>
                                <p className="text-sm text-theme-text-muted">{member.department} - {member.status}</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-2">
                            <button onClick={handleEditClick} className="p-2 text-theme-text-muted hover:bg-slate-100 rounded-full"><PencilIcon className="w-5 h-5"/></button>
                            <button onClick={handleDeleteClick} className="p-2 text-theme-text-muted hover:bg-slate-100 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                            <button onClick={onClose} className="p-2 text-theme-text-muted hover:bg-slate-100 rounded-full">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                         </div>
                    </div>
                     <div className="mt-4 flex items-center justify-between border-t border-theme-border pt-4">
                         <div className="flex items-center gap-2">
                              <button onClick={handleCallClick} className="flex items-center gap-2 px-3 py-1.5 text-sm text-theme-text-base bg-theme-card border border-theme-border rounded-md hover:bg-theme-bg">
                                 <DevicePhoneMobileIcon className="w-4 h-4" />
                                 Appeler
                             </button>
                         </div>
                         <div className="text-xs text-theme-text-muted">Membre depuis: {new Date(member.conversionDate || Date.now()).toLocaleDateString('fr-FR')}</div>
                     </div>
                </header>

                {/* Tabs */}
                <nav className="p-2 bg-theme-card border-b border-theme-border flex gap-2">
                    <TabButton label="Informations" active={activeTab === 'info'} onClick={() => setActiveTab('info')} />
                    <TabButton label="Spirituel" active={activeTab === 'spiritual'} onClick={() => setActiveTab('spiritual')} />
                    <TabButton label="Historique" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
                    <TabButton label="Documents" active={activeTab === 'docs'} onClick={() => setActiveTab('docs')} />
                </nav>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'info' && (
                        <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                           <h3 className="text-lg font-semibold text-theme-text-base col-span-full border-b border-theme-border pb-2">Informations personnelles</h3>
                           <DetailItem icon={<IdentificationIcon className="w-5 h-5"/>} label="Prénom & Nom" value={`${member.firstName} ${member.lastName}`} />
                           <DetailItem icon={<UsersIcon className="w-5 h-5"/>} label="Statut du membre" value={member.memberType} />
                           <DetailItem icon={<UsersIcon className="w-5 h-5"/>} label="Sexe" value={member.gender} />
                           <DetailItem icon={<CakeIcon className="w-5 h-5"/>} label="Date de naissance" value={`${new Date(member.birthDate).toLocaleDateString('fr-FR')}${ageText}`} />
                           <DetailItem icon={<HeartIcon className="w-5 h-5"/>} label="Statut matrimonial" value={member.maritalStatus} />
                           {member.maritalStatus === 'Marié(e)' && (
                             <DetailItem icon={<UserCircleIcon className="w-5 h-5"/>} label="Nom de l'époux(se)" value={member.spouseName} />
                           )}
                           <DetailItem icon={<IdentificationIcon className="w-5 h-5"/>} label="N° CNI/Passport/Carte Consulaire" value={member.nationalIdNumber} />
                           <DetailItem icon={<DevicePhoneMobileIcon className="w-5 h-5"/>} label="Téléphone(s)" value={`${member.phone}${member.phone2 ? ` / ${member.phone2}` : ''}`} />
                           <DetailItem icon={<EnvelopeIcon className="w-5 h-5"/>} label="Email" value={member.email} />
                           <DetailItem icon={<MapPinIcon className="w-5 h-5"/>} label="Adresse" value={member.address} />
                           <DetailItem icon={<GlobeAltIcon className="w-5 h-5"/>} label="Nationalité" value={member.nationality} />
                           <DetailItem icon={<BriefcaseIcon className="w-5 h-5"/>} label="Profession" value={member.profession} />
                        </div>
                         {member.children && member.children.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-lg font-semibold text-theme-text-base col-span-full border-b border-theme-border pb-2">Enfants ({member.children.length})</h3>
                                <div className="mt-4 space-y-4">
                                    {member.children.map((child: Child) => {
                                        const childAge = getAge(child.birthDate);
                                        const childAgeText = childAge !== null ? `${childAge} ans` : 'N/A';
                                        return (
                                            <div key={child.id} className="p-4 bg-theme-card rounded-lg border border-theme-border">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-bold text-theme-text-base">{child.name}</p>
                                                    <span className="text-sm text-theme-text-muted">{child.gender}, {childAgeText}</span>
                                                </div>
                                                <div className="mt-3 pt-3 border-t border-theme-border grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="font-semibold text-theme-text-base">Scolarisé(e): <span className={`font-normal ${child.attendsSchool ? 'text-green-700' : 'text-red-700'}`}>{child.attendsSchool ? 'Oui' : 'Non'}</span></p>
                                                        {child.attendsSchool && (
                                                            <>
                                                                <p className="mt-1">Classe: <span className="font-normal text-theme-text-muted">{child.schoolClass || 'Non renseigné'}</span></p>
                                                                <p className="mt-1">Établissement: <span className="font-normal text-theme-text-muted">{child.schoolName || 'Non renseigné'}</span></p>
                                                            </>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-theme-text-base">Participe à l'EDD: <span className={`font-normal ${child.attendsSundaySchool ? 'text-green-700' : 'text-red-700'}`}>{child.attendsSundaySchool ? 'Oui' : 'Non'}</span></p>
                                                    </div>
                                                    <div className="md:col-span-2 pt-2 border-t border-theme-border mt-2">
                                                        <p className="font-semibold text-theme-text-base">Reste dans l'église: 
                                                            <span className={`font-normal ml-1 ${child.remainsInChurch ? 'text-green-700' : 'text-red-700'}`}>
                                                                {child.remainsInChurch ? 'Oui' : 'Non'}
                                                            </span>
                                                        </p>
                                                        {!child.remainsInChurch && child.reasonForLeaving && (
                                                            <p className="mt-1">Raison: <span className="font-normal italic text-theme-text-muted">{child.reasonForLeaving}</span></p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        </>
                    )}
                    {activeTab === 'spiritual' && (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                           <h3 className="text-lg font-semibold text-theme-text-base col-span-full border-b border-theme-border pb-2">Informations spirituelles</h3>
                           <DetailItem icon={<SparklesIcon className="w-5 h-5"/>} label="Date de conversion" value={member.conversionDate ? new Date(member.conversionDate).toLocaleDateString('fr-FR') : undefined} />
                           <DetailItem icon={<CalendarDaysIcon className="w-5 h-5"/>} label="Date de baptême" value={member.baptismDate ? new Date(member.baptismDate).toLocaleDateString('fr-FR') : undefined} />
                           <DetailItem icon={<UserCircleIcon className="w-5 h-5"/>} label="Mentor / Pasteur responsable" value={member.mentor} />
                           <DetailItem icon={<UserGroupIcon className="w-5 h-5"/>} label="Ministères affectés" value={member.groups.join(', ')} />
                           <DetailItem icon={<BookOpenIcon className="w-5 h-5"/>} label="Formations suivies" value={member.trainings.join(', ')} />
                        </div>
                    )}
                    {activeTab === 'history' && (
                        <div>
                            <h3 className="text-lg font-semibold text-theme-text-base border-b border-theme-border pb-2 mb-4">Historique</h3>
                            <ul className="space-y-4">
                               {member.history.length > 0 ? member.history.map((item, index) => (
                                   <li key={index} className="flex items-center gap-4 p-3 bg-theme-card rounded-md border border-theme-border">
                                       <div className="p-2 bg-slate-100 rounded-full">
                                            {item.type === 'event' && <PresentationChartLineIcon className="w-5 h-5 text-theme-text-muted"/>}
                                            {item.type === 'donation' && <CurrencyDollarIcon className="w-5 h-5 text-theme-text-muted"/>}
                                            {item.type === 'note' && <ChatBubbleLeftRightIcon className="w-5 h-5 text-theme-text-muted"/>}
                                       </div>
                                       <div className="flex-grow">
                                           <p className="font-semibold text-theme-text-base">{item.event}</p>
                                           <p className="text-xs text-theme-text-muted">{new Date(item.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                       </div>
                                   </li>
                               )) : <p className="text-center text-theme-text-muted mt-8">Aucun historique disponible.</p>}
                            </ul>
                        </div>
                    )}
                    {activeTab === 'docs' && (
                         <div>
                            <h3 className="text-lg font-semibold text-theme-text-base border-b border-theme-border pb-2 mb-4">Documents</h3>
                            <ul className="space-y-3">
                                {member.documents.length > 0 ? member.documents.map((doc, index) => (
                                   <li key={index} className="flex items-center justify-between gap-4 p-3 bg-theme-card rounded-md border border-theme-border">
                                        <div className="flex items-center gap-3">
                                            <DocumentTextIcon className="w-6 h-6 text-church-dark-teal"/>
                                            <div>
                                               <a href={doc.url} className="font-semibold text-blue-600 hover:underline">{doc.name}</a>
                                               <p className="text-xs text-theme-text-muted">Type: {doc.type} - Ajouté le {new Date(doc.uploadDate).toLocaleDateString('fr-FR')}</p>
                                            </div>
                                        </div>
                                       <button className="p-2 text-theme-text-muted hover:bg-slate-100 rounded-full"><DocumentArrowDownIcon className="w-5 h-5"/></button>
                                   </li>
                                )) : <p className="text-center text-theme-text-muted mt-8">Aucun document n'a été ajouté.</p>}
                            </ul>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default MemberDetailView;