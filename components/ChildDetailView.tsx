

import React from 'react';
import { Child, Member } from '../types';
import { XMarkIcon, CakeIcon, AcademicCapIcon, InformationCircleIcon, UsersIcon } from './icons/HeroIcons';
import { getAge } from '../constants';

const DetailItem: React.FC<{ icon: React.ReactNode, label: string, children: React.ReactNode }> = ({ icon, label, children }) => (
    <div className="flex items-start gap-3">
        <div className="text-theme-text-muted mt-0.5">{icon}</div>
        <div>
            <p className="text-xs text-theme-text-muted">{label}</p>
            <div className="text-sm font-medium text-theme-text-base">{children}</div>
        </div>
    </div>
);

interface ChildDetailViewProps {
    child: Child;
    parent: Member;
    onClose: () => void;
    onViewParent: (parent: Member) => void;
}

const ChildDetailView: React.FC<ChildDetailViewProps> = ({ child, parent, onClose, onViewParent }) => {
    const age = getAge(child.birthDate);
    const ageText = age !== null ? `${age} ans` : 'N/A';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose}>
            <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-theme-bg shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out"
                 onClick={(e) => e.stopPropagation()}>
                
                {/* Header */}
                <header className="p-4 bg-theme-card border-b border-theme-border">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-church-teal text-white flex items-center justify-center text-3xl font-bold">
                                {child.name.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-theme-text-base">{child.name}</h2>
                                <p className="text-sm text-theme-text-muted">Enfant de 
                                    <button onClick={() => onViewParent(parent)} className="font-semibold text-church-dark-blue hover:underline ml-1">
                                        {parent.firstName} {parent.lastName}
                                    </button>
                                </p>
                            </div>
                        </div>
                         <div className="flex items-center gap-2">
                            <button onClick={onClose} className="p-2 text-theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                         </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-6 space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                       <h3 className="text-lg font-semibold text-theme-text-base col-span-full border-b border-theme-border pb-2">Informations Générales</h3>
                       <DetailItem icon={<CakeIcon className="w-5 h-5"/>} label="Âge et date de naissance">
                           <p>{ageText} ({new Date(child.birthDate).toLocaleDateString('fr-FR')})</p>
                       </DetailItem>
                       <DetailItem icon={<UsersIcon className="w-5 h-5"/>} label="Sexe">
                           <p>{child.gender}</p>
                       </DetailItem>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-theme-text-base col-span-full border-b border-theme-border pb-2">Scolarité & Église</h3>
                        <DetailItem icon={<AcademicCapIcon className="w-5 h-5"/>} label="Scolarisé(e)">
                             <p className={`font-semibold ${child.attendsSchool ? 'text-green-700' : 'text-red-700'}`}>{child.attendsSchool ? 'Oui' : 'Non'}</p>
                             {child.attendsSchool && (
                                <div className="text-xs mt-1 space-y-0.5">
                                   <p>Classe: <span className="font-normal text-theme-text-muted">{child.schoolClass || 'Non renseigné'}</span></p>
                                   <p>Établissement: <span className="font-normal text-theme-text-muted">{child.schoolName || 'Non renseigné'}</span></p>
                                </div>
                             )}
                        </DetailItem>
                         <DetailItem icon={<AcademicCapIcon className="w-5 h-5"/>} label="Participe à l'école du dimanche">
                             <p className={`font-semibold ${child.attendsSundaySchool ? 'text-green-700' : 'text-red-700'}`}>{child.attendsSundaySchool ? 'Oui' : 'Non'}</p>
                         </DetailItem>
                         <DetailItem icon={<InformationCircleIcon className="w-5 h-5"/>} label="Situation dans l'église">
                             <p className={`font-semibold ${child.remainsInChurch ? 'text-green-700' : 'text-red-700'}`}>{child.remainsInChurch ? 'Reste dans l\'église' : 'A quitté l\'église'}</p>
                            {!child.remainsInChurch && child.reasonForLeaving && (
                                 <p className="text-xs mt-1 text-theme-text-muted italic">Raison: {child.reasonForLeaving}</p>
                            )}
                         </DetailItem>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ChildDetailView;