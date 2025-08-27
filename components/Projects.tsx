

import React, { useState, useMemo } from 'react';
import { RocketLaunchIcon, PlusIcon, XMarkIcon, UserCircleIcon, CalendarDaysIcon, CurrencyDollarIcon, BanknotesIcon, TrashIcon } from './icons/HeroIcons';
import { Project, Member, CotisationCampaign } from '../types';
import ConfirmationModal from './ConfirmationModal';
import { useChurch } from '../contexts';


const findMemberById = (id: string, members: Member[]): Member | undefined => members.find(m => m.id === id);

const getStatusChip = (status: Project['status']) => {
    const baseClasses = 'px-2 py-0.5 text-xs font-bold rounded-full inline-block';
    switch (status) {
        case 'En cours': return `${baseClasses} bg-green-100 text-green-800`;
        case 'Planifié': return `${baseClasses} bg-blue-100 text-blue-800`;
        case 'En attente': return `${baseClasses} bg-yellow-100 text-yellow-800`;
        case 'Terminé': return `${baseClasses} bg-gray-200 text-gray-700`;
        case 'Annulé': return `${baseClasses} bg-red-100 text-red-800`;
        default: return baseClasses;
    }
};

const ProjectModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (project: Omit<Project, 'spent' | 'contributions'> & { id?: string }) => void;
    members: Member[];
    projectToEdit?: Project | null;
    currency: string;
}> = ({ isOpen, onClose, onSave, members, projectToEdit, currency }) => {
    if (!isOpen) return null;
    
    const isEditMode = !!projectToEdit;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const data = {
            id: projectToEdit?.id,
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            leaderId: formData.get('leaderId') as string,
            budget: parseFloat(formData.get('budget') as string),
            startDate: formData.get('startDate') as string,
            endDate: formData.get('endDate') as string,
            status: formData.get('status') as Project['status'] || 'Planifié',
        };
        if (data.name && data.leaderId && !isNaN(data.budget)) {
            onSave(data);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-theme-card rounded-xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-theme-border bg-theme-table-header rounded-t-xl">
                    <h2 className="text-xl font-bold text-theme-text-base">{isEditMode ? 'Modifier le projet' : 'Créer un nouveau projet'}</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-theme-text-muted hover:bg-slate-200 dark:hover:bg-slate-600"><XMarkIcon className="w-6 h-6" /></button>
                </header>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <input name="name" required placeholder="Nom du projet" defaultValue={projectToEdit?.name} className="w-full" />
                        <textarea name="description" rows={3} placeholder="Description du projet..." defaultValue={projectToEdit?.description} className="w-full"></textarea>
                        <div className="grid grid-cols-2 gap-4">
                           <input type="number" name="budget" required placeholder={`Budget prévisionnel (${currency})`} defaultValue={projectToEdit?.budget} className="w-full" />
                           <select name="leaderId" required className="w-full" defaultValue={projectToEdit?.leaderId || ""}>
                                <option value="" disabled>-- Choisir un responsable --</option>
                                {members.map(member => <option key={member.id} value={member.id}>{member.firstName} {member.lastName}</option>)}
                            </select>
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                           <div>
                                <label className="text-xs text-theme-text-muted">Date de début</label>
                                <input type="date" name="startDate" required defaultValue={projectToEdit?.startDate} className="w-full" />
                           </div>
                           <div>
                                <label className="text-xs text-theme-text-muted">Date de fin</label>
                               <input type="date" name="endDate" required defaultValue={projectToEdit?.endDate} className="w-full" />
                           </div>
                        </div>
                        {isEditMode && (
                            <div>
                                <label className="text-xs text-theme-text-muted">Statut</label>
                                <select name="status" required className="w-full" defaultValue={projectToEdit?.status}>
                                    <option>Planifié</option>
                                    <option>En cours</option>
                                    <option>En attente</option>
                                    <option>Terminé</option>
                                    <option>Annulé</option>
                                </select>
                            </div>
                        )}
                    </div>
                    <footer className="flex justify-end items-center p-4 bg-theme-table-header rounded-b-xl space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-theme-border rounded-md text-theme-text-base bg-theme-card hover:bg-theme-bg">Annuler</button>
                        <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-church-dark-blue hover:bg-blue-900">{isEditMode ? 'Enregistrer les modifications' : 'Créer le projet'}</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

interface CampaignForProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (campaign: Omit<CotisationCampaign, 'id'>) => void;
    project: Project | null;
    currency: string;
}

const CampaignForProjectModal: React.FC<CampaignForProjectModalProps> = ({ isOpen, onClose, onSave, project, currency }) => {
    const [isAmountFree, setIsAmountFree] = useState(true);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const amount = parseFloat(formData.get('amount') as string);
        const campaignName = formData.get('name') as string;

        const campaignData: Omit<CotisationCampaign, 'id'> = {
            name: campaignName,
            description: formData.get('description') as string,
            type: 'Projet spécial',
            frequency: 'Ponctuelle', // Projects are usually one-time fundraising
            defaultAmount: isAmountFree || isNaN(amount) ? 0 : amount,
            isAmountFree: isAmountFree,
            isMandatory: false,
            targetScope: 'Tous les membres',
            startDate: new Date().toISOString().split('T')[0],
            endDate: formData.get('endDate') as string,
            projectId: project!.id, // Link to project
        };
        
        onSave(campaignData);
        alert(`La campagne de cotisation "${campaignName}" a été créée. Vous pouvez la gérer dans le module "Cotisations".`);
        onClose();
    };
    
    return (
        <div className={`fixed inset-0 bg-black bg-opacity-60 z-50 justify-center items-center p-4 ${isOpen ? 'flex' : 'hidden'}`} onClick={onClose}>
            <div className="bg-theme-card rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-theme-border bg-theme-table-header rounded-t-xl">
                    <h2 className="text-xl font-bold text-theme-text-base">Lancer une cotisation pour un Projet</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-theme-text-muted hover:bg-slate-200 dark:hover:bg-slate-600"><XMarkIcon className="w-6 h-6" /></button>
                </header>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div>
                            <label className="block text-sm font-medium mb-1">Nom de la cotisation</label>
                            <input name="name" required defaultValue={`Cotisation: ${project?.name}`} className="w-full" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea name="description" rows={3} defaultValue={`Campagne de soutien pour le projet de l'église: "${project?.description}"`} className="w-full"></textarea>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                                <label className="text-xs text-theme-text-muted">Montant suggéré ({currency})</label>
                                <input type="number" name="amount" placeholder="Ex: 100" disabled={isAmountFree} className="w-full" />
                                <div className="mt-2 flex items-center">
                                    <input id="isAmountFree_proj" type="checkbox" checked={isAmountFree} onChange={e => setIsAmountFree(e.target.checked)} />
                                    <label htmlFor="isAmountFree_proj" className="ml-2 block text-sm">Montant libre</label>
                                </div>
                           </div>
                           <div>
                                <label className="text-xs text-theme-text-muted">Date de fin de campagne</label>
                               <input type="date" name="endDate" required className="w-full" />
                           </div>
                        </div>
                         <p className="text-xs text-theme-text-muted italic">
                            Par défaut, la cotisation sera lancée pour tous les membres en tant que contribution volontaire.
                        </p>
                    </div>
                    <footer className="flex justify-end items-center p-4 bg-theme-table-header rounded-b-xl space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-theme-border rounded-md text-theme-text-base bg-theme-card hover:bg-theme-bg">Annuler</button>
                        <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">Lancer la campagne</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};


const ProjectCard: React.FC<{ 
    project: Project, 
    leader?: Member, 
    onEdit: (project: Project) => void;
    onDelete: (project: Project) => void;
    onLaunchCotisation: (project: Project) => void;
    currency: string;
}> = ({ project, leader, onEdit, onDelete, onLaunchCotisation, currency }) => {
    const progress = project.budget > 0 ? Math.min((project.spent / project.budget) * 100, 100) : 0;
    const progressColor = progress > 90 ? 'bg-red-500' : progress > 70 ? 'bg-yellow-500' : 'bg-green-500';

    return (
        <div className="bg-theme-card rounded-lg shadow hover:shadow-lg transition-shadow duration-300 flex flex-col">
            <div className="p-5 flex-grow">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-church-dark-teal pr-2">{project.name}</h3>
                    <span className={getStatusChip(project.status)}>{project.status}</span>
                </div>
                <p className="text-sm text-theme-text-muted mt-2 h-10">{project.description}</p>
                
                <div className="mt-4 pt-4 border-t border-theme-border space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-theme-text-base">
                        <UserCircleIcon className="w-5 h-5 text-theme-text-muted"/>
                        <span className="font-medium">Responsable:</span>
                        <span>{leader ? `${leader.firstName} ${leader.lastName}` : 'N/A'}</span>
                    </div>
                     <div className="flex items-center gap-2 text-theme-text-base">
                        <CalendarDaysIcon className="w-5 h-5 text-theme-text-muted"/>
                        <span className="font-medium">Période:</span>
                        <span>{new Date(project.startDate).toLocaleDateString('fr-FR')} au {new Date(project.endDate).toLocaleDateString('fr-FR')}</span>
                    </div>
                </div>

                <div className="mt-4">
                    <div className="flex justify-between items-center mb-1 text-sm">
                        <span className="font-semibold text-theme-text-base">Budget</span>
                        <span className="font-mono text-xs">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                        <div className={`${progressColor} h-2.5 rounded-full`} style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-theme-text-muted">
                        <span>Dépensé: {project.spent.toLocaleString('fr-FR')} {currency}</span>
                        <span>Budget: {project.budget.toLocaleString('fr-FR')} {currency}</span>
                    </div>
                </div>

            </div>
            <div className="bg-theme-table-header p-3 rounded-b-lg mt-auto flex gap-2">
                <button data-tooltip="Gérer le projet" onClick={() => onEdit(project)} className="w-full text-center px-4 py-2 text-sm font-semibold text-church-dark-blue hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md transition-colors">
                    Gérer
                </button>
                 <button 
                    onClick={() => onLaunchCotisation(project)} 
                    className="w-full text-center px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors flex items-center justify-center gap-1.5"
                    data-tooltip="Lancer une campagne de cotisation"
                >
                    <BanknotesIcon className="w-4 h-4" />
                    Cotisation
                </button>
                <button data-tooltip="Supprimer le projet" onClick={() => onDelete(project)} className="p-2 text-sm font-semibold text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-md transition-colors">
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

interface ProjectsProps {
    projects: Project[];
    members: Member[];
    onSaveProject: (data: Omit<Project, 'spent' | 'contributions'> & { id?: string }) => void;
    onDeleteProject: (projectId: string) => void;
    onSaveCampaign: (campaign: Omit<CotisationCampaign, 'id'>) => void;
}

const Projects: React.FC<ProjectsProps> = ({ projects, members, onSaveProject, onDeleteProject, onSaveCampaign }) => {
    const { currentChurch } = useChurch();
    const { settings } = currentChurch.data;
    const currency = settings.currency || 'FCFA';

    const [isModalOpen, setModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [isCampaignModalOpen, setCampaignModalOpen] = useState(false);
    const [campaignForProject, setCampaignForProject] = useState<Project | null>(null);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

    const handleOpenCreateModal = () => {
        setEditingProject(null);
        setModalOpen(true);
    };

    const handleOpenEditModal = (project: Project) => {
        setEditingProject(project);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingProject(null);
        setModalOpen(false);
    };

    const handleSaveProject = (data: Omit<Project, 'spent' | 'contributions'> & { id?: string }) => {
        onSaveProject(data);
        handleCloseModal();
    };

    const handleLaunchCotisation = (project: Project) => {
        setCampaignForProject(project);
        setCampaignModalOpen(true);
    };


    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                 <div>
                    <h2 className="text-2xl font-bold text-theme-text-base">Gestion des projets de l’église</h2>
                    <p className="mt-1 text-theme-text-muted">Suivez l'avancement, les budgets et les contributions pour chaque projet.</p>
                </div>
                <button 
                    onClick={handleOpenCreateModal}
                    className="bg-church-dark-teal text-white px-4 py-2 rounded-md shadow hover:bg-church-teal transition-colors flex items-center justify-center gap-2 w-full md:w-auto">
                    <PlusIcon className="w-5 h-5" />
                    Nouveau Projet
                </button>
            </div>
            
             {projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {projects.map(project => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            leader={findMemberById(project.leaderId, members)}
                            onEdit={handleOpenEditModal}
                            onDelete={setProjectToDelete}
                            onLaunchCotisation={handleLaunchCotisation}
                            currency={currency}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-theme-card rounded-lg shadow-md">
                    <RocketLaunchIcon className="w-16 h-16 mx-auto text-theme-text-muted opacity-50" />
                    <h3 className="mt-4 text-lg font-semibold text-theme-text-base">Aucun projet en cours.</h3>
                    <p className="mt-1 text-sm text-theme-text-muted">Commencez par créer votre premier projet pour mobiliser l'église.</p>
                </div>
            )}

            <ProjectModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveProject}
                members={members}
                projectToEdit={editingProject}
                currency={currency}
            />
            <CampaignForProjectModal
                isOpen={isCampaignModalOpen}
                onClose={() => setCampaignModalOpen(false)}
                onSave={onSaveCampaign}
                project={campaignForProject}
                currency={currency}
            />
             <ConfirmationModal
                isOpen={!!projectToDelete}
                onClose={() => setProjectToDelete(null)}
                onConfirm={() => {
                    if (projectToDelete) {
                        onDeleteProject(projectToDelete.id);
                        setProjectToDelete(null);
                    }
                }}
                title="Supprimer le projet"
                message={`Êtes-vous sûr de vouloir supprimer le projet "${projectToDelete?.name}" ? Cette action est irréversible.`}
            />
        </div>
    );
};

export default Projects;