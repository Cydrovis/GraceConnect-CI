import React, { useState, useEffect, useMemo } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon } from './icons/HeroIcons';
import { AppUser, Group, AppUserRole } from '../types';
import { ROLES_DATA, getActiveRoles } from '../constants';

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: Omit<AppUser, 'id' | 'photoUrl' | 'identifiant'> & { id?: string }) => void;
    userToEdit?: AppUser | null;
    groups: Group[];
    defaultGroup?: string | null;
    appUsers: AppUser[];
}

// Add a temporary unique ID for key prop
type AppUserRoleWithId = AppUserRole & { _id: string };

const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, onSave, userToEdit, groups, defaultGroup, appUsers }) => {
    const isEditMode = !!userToEdit;
    const [roles, setRoles] = useState<AppUserRoleWithId[]>([]);
    
    const isAdminRoleTaken = useMemo(() => {
        return appUsers.some(user => 
            user.id !== userToEdit?.id && 
            getActiveRoles(user).includes('Administrateur principal')
        );
    }, [appUsers, userToEdit]);

    useEffect(() => {
        if (isOpen) {
            if (userToEdit) {
                // Initialize roles with unique IDs when modal opens with a user to edit
                setRoles(userToEdit.roles.map((r, i) => ({ ...r, _id: `role_${userToEdit.id}_${i}` })));
            } else {
                // Reset for a new user
                setRoles([]);
            }
        }
    }, [userToEdit, isOpen]);

    const handleAddRole = () => {
        const today = new Date().toISOString().split('T')[0];
        const defaultRole = ROLES_DATA.find(r => r.role === 'Secrétaire') || ROLES_DATA[1];
        setRoles([...roles, { role: defaultRole.role, startDate: today, _id: `role_new_${Date.now()}` }]);
    };
    
    const handleRoleChange = (index: number, field: keyof AppUserRole, value: string) => {
        const newRoles = [...roles];
        const roleToUpdate = { ...newRoles[index] };
        (roleToUpdate as any)[field] = value;
        // If endDate is cleared, remove it from the object
        if (field === 'endDate' && !value) {
            delete roleToUpdate.endDate;
        }
        newRoles[index] = roleToUpdate;
        setRoles(newRoles);
    };

    const handleRemoveRole = (index: number) => {
        setRoles(roles.filter((_, i) => i !== index));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        
        const finalRoles: AppUserRole[] = roles
            .filter(r => r.role && r.startDate)
            .map(({ _id, ...rest }) => rest);
            
        if(finalRoles.length === 0){
            alert('L\'utilisateur doit avoir au moins un rôle valide.');
            return;
        }

        const groupeAdmin = (!isEditMode && defaultGroup) 
            ? defaultGroup 
            : formData.get('groupeAdministratif') as string;

        const userData = {
            id: userToEdit?.id,
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            roles: finalRoles,
            department: formData.get('department') as string,
            status: formData.get('status') as 'Actif' | 'Suspendu',
            civilite: formData.get('civilite') as 'M.' | 'Mme',
            sexe: formData.get('sexe') as 'M' | 'F',
            groupeAdministratif: groupeAdmin,
            contact: formData.get('contact') as string,
            birthDate: formData.get('birthDate') as string,
            maritalStatus: formData.get('maritalStatus') as 'Célibataire' | 'Marié(e)' | 'Divorcé(e)' | 'Veuf(ve)',
            cellGroup: formData.get('cellGroup') as string,
            joinDate: formData.get('joinDate') as string,
        };
        
        if(userData.name && userData.email && userData.status) {
            onSave(userData);
            onClose();
        } else {
            alert('Veuillez remplir tous les champs obligatoires.');
        }
    };

    return (
        <div className={`fixed inset-0 bg-black bg-opacity-60 z-50 justify-center items-center p-4 ${isOpen ? 'flex' : 'hidden'}`} onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-xl">
                    <h2 className="text-xl font-bold text-gray-800">{isEditMode ? "Modifier le profil du personnel" : "Ajouter un nouveau personnel"}</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200"><XMarkIcon className="w-6 h-6" /></button>
                </header>
                <form onSubmit={handleSubmit} key={userToEdit?.id || 'new'}>
                    <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                        
                        <fieldset>
                            <legend className="text-lg font-semibold text-gray-700 mb-2">Informations d'identité</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="civilite" className="block text-sm font-medium text-gray-700 mb-1">Civilité</label>
                                    <select id="civilite" name="civilite" required defaultValue={userToEdit?.civilite || 'M.'} className="w-full px-3 py-2 border bg-white border-gray-300 rounded-md">
                                        <option>M.</option>
                                        <option>Mme</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="sexe" className="block text-sm font-medium text-gray-700 mb-1">Sexe</label>
                                    <select id="sexe" name="sexe" required defaultValue={userToEdit?.sexe || 'M'} className="w-full px-3 py-2 border bg-white border-gray-300 rounded-md">
                                        <option>M</option>
                                        <option>F</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nom et prénom(s)</label>
                                    <input id="name" name="name" type="text" defaultValue={userToEdit?.name} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                                </div>
                                <div>
                                    <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
                                    <input id="birthDate" name="birthDate" type="date" defaultValue={userToEdit?.birthDate} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                                </div>
                                <div>
                                    <label htmlFor="maritalStatus" className="block text-sm font-medium text-gray-700 mb-1">Statut matrimonial</label>
                                    <select id="maritalStatus" name="maritalStatus" required defaultValue={userToEdit?.maritalStatus} className="w-full px-3 py-2 border bg-white border-gray-300 rounded-md">
                                        <option>Célibataire</option>
                                        <option>Marié(e)</option>
                                        <option>Divorcé(e)</option>
                                        <option>Veuf(ve)</option>
                                    </select>
                                </div>
                            </div>
                        </fieldset>

                        <fieldset>
                            <legend className="text-lg font-semibold text-gray-700 mb-2">Contact & Eglise</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div>
                                    <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">Contact (Tél/WhatsApp)</label>
                                    <input id="contact" name="contact" type="text" defaultValue={userToEdit?.contact} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input id="email" name="email" type="email" defaultValue={userToEdit?.email} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                                </div>
                                <div>
                                    <label htmlFor="joinDate" className="block text-sm font-medium text-gray-700 mb-1">Date d'adhésion</label>
                                    <input id="joinDate" name="joinDate" type="date" defaultValue={userToEdit?.joinDate} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                                </div>
                                <div>
                                    <label htmlFor="cellGroup" className="block text-sm font-medium text-gray-700 mb-1">Cellule / Groupe local</label>
                                    <input id="cellGroup" name="cellGroup" type="text" defaultValue={userToEdit?.cellGroup} placeholder="Ex: Cellule Joie" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                                </div>
                            </div>
                        </fieldset>
                        
                        <fieldset>
                            <legend className="text-lg font-semibold text-gray-700 mb-2">Accès et Rôles</legend>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="identifiant" className="block text-sm font-medium text-gray-700 mb-1">Identifiant</label>
                                    <input id="identifiant" name="identifiant" type="text" defaultValue={userToEdit?.identifiant} placeholder={isEditMode ? '' : 'Généré automatiquement'} disabled className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed" />
                                </div>
                                <div />
                                <div>
                                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Ministère / Département rattaché</label>
                                    <select id="department" name="department" required defaultValue={userToEdit?.department || ''} className="w-full px-3 py-2 border bg-white border-gray-300 rounded-md">
                                        <option value="Tous">Tous</option>
                                        <option value="Aucun">Aucun</option>
                                        <option value="Administration">Administration</option>
                                        <option value="Finances">Finances</option>
                                        {groups.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
                                    </select>
                                </div>
                                 <div>
                                    <label htmlFor="groupeAdministratif" className="block text-sm font-medium text-gray-700 mb-1">Groupe Administratif</label>
                                    <select 
                                        id="groupeAdministratif" 
                                        name="groupeAdministratif" 
                                        required defaultValue={userToEdit?.groupeAdministratif || defaultGroup || 'ADMINISTRATIF'}
                                        disabled={!isEditMode && !!defaultGroup} className="w-full px-3 py-2 border bg-white border-gray-300 rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed">
                                        <option>ADMINISTRATIF</option>
                                        <option>DIACONAT</option>
                                        <option>ANCIEN</option>
                                        <option>PASTEUR PRINCIPAUX</option>
                                        <option>RESPONSABLE DE DEPARTEMENT</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Statut du compte</label>
                                    <select id="status" name="status" required defaultValue={userToEdit?.status || 'Actif'} className="w-full px-3 py-2 border bg-white border-gray-300 rounded-md">
                                        <option value="Actif">Actif</option>
                                        <option value="Suspendu">Suspendu</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Rôles assignés</label>
                                    {roles.map((role, index) => (
                                        <div key={role._id} className="grid grid-cols-12 gap-2 items-center p-2 border rounded-md bg-gray-50">
                                            <select 
                                                value={role.role} 
                                                onChange={e => handleRoleChange(index, 'role', e.target.value)}
                                                disabled={role.role === 'Administrateur principal'}
                                                className="col-span-5 w-full p-2 border bg-white rounded-md text-sm disabled:bg-gray-100 disabled:cursor-not-allowed">
                                                <option value="" disabled>-- Rôle --</option>
                                                {ROLES_DATA.filter(r => r.role !== 'Super Administrateur').map(r => 
                                                    <option 
                                                        key={r.role} 
                                                        value={r.role}
                                                        disabled={isAdminRoleTaken && r.role === 'Administrateur principal'}
                                                    >
                                                        {r.role}
                                                    </option>
                                                )}
                                            </select>
                                            <input type="date" value={role.startDate} onChange={e => handleRoleChange(index, 'startDate', e.target.value)} className="col-span-3 w-full p-2 border rounded-md text-sm" title="Date de début" />
                                            <input type="date" value={role.endDate || ''} onChange={e => handleRoleChange(index, 'endDate', e.target.value)} className="col-span-3 w-full p-2 border rounded-md text-sm" title="Date de fin (optionnel)" />
                                            <button type="button" onClick={() => handleRemoveRole(index)} className="col-span-1 p-2 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                                        </div>
                                    ))}
                                     <button type="button" onClick={handleAddRole} className="flex items-center gap-1 text-sm text-blue-600 hover:underline"><PlusIcon className="w-4 h-4"/>Ajouter un rôle</button>
                                </div>
                            </div>
                        </fieldset>
                    </div>
                    <footer className="flex justify-end items-center p-4 bg-gray-50 rounded-b-xl space-x-3 border-t">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">Annuler</button>
                        <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-church-dark-blue hover:bg-blue-900">{isEditMode ? "Enregistrer" : "Ajouter"}</button>
                    </footer>
                </form>
            </div>
        </div>
    )
}

export default UserFormModal;
