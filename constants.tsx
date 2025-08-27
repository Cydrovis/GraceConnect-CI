import React from 'react';
import { NavItem, AppUser } from './types';
import { HomeIcon, UsersIcon, UserGroupIcon, CurrencyDollarIcon, ChatBubbleLeftRightIcon, ChartBarIcon, DocumentTextIcon, BookOpenIcon, CogIcon, ArrowRightOnRectangleIcon, ClipboardDocumentListIcon, TagIcon, RocketLaunchIcon, AcademicCapIcon, ArchiveBoxIcon, CalendarDaysIcon, PresentationChartBarIcon, BanknotesIcon, HeartIcon, MegaphoneIcon, UserIcon } from './components/icons/HeroIcons';

export const SIDEBAR_ITEMS: NavItem[] = [
    { id: 'dashboard', label: 'Panneau d\'accueil', icon: <HomeIcon /> },
    { 
      id: 'user-management', 
      label: 'Utilisateur', 
      icon: <UserIcon />,
      subItems: [
        { id: 'personnel', label: 'Personnel', icon: <UserGroupIcon /> },
      ]
    },
    { 
      id: 'members', 
      label: 'Gestion des membres', 
      icon: <UsersIcon />,
      subItems: [
        { id: 'members-list', label: 'Liste des membres', icon: <UsersIcon /> },
        { id: 'children-management', label: 'Gestion des enfants', icon: <AcademicCapIcon /> },
      ]
    },
    { 
      id: 'organization', 
      label: 'Organisation', 
      icon: <UserGroupIcon />,
      subItems: [
        { id: 'groups', label: 'Départements / Ministères', icon: <UserGroupIcon /> },
        { id: 'events', label: 'Cultes et Événements', icon: <CalendarDaysIcon /> },
      ]
    },
    { 
      id: 'finances', 
      label: 'Gestion des finances', 
      icon: <CurrencyDollarIcon />,
      subItems: [
        { id: 'finances-overview', label: 'Aperçu Financier', icon: <PresentationChartBarIcon /> },
        { id: 'cotisations', label: 'Cotisations', icon: <BanknotesIcon /> },
        { id: 'cas-deces', label: 'Cas de Décès', icon: <HeartIcon /> },
        { id: 'projects', label: 'Gestion des projets de l’église', icon: <RocketLaunchIcon /> },
      ]
    },
    { id: 'assignments', label: 'Gestion des affectations et responsabilités', icon: <ClipboardDocumentListIcon /> },
    { id: 'education', label: 'Gestion des formations & enseignements', icon: <AcademicCapIcon /> },
    { 
      id: 'communications', 
      label: 'Communications', 
      icon: <ChatBubbleLeftRightIcon />,
      subItems: [
        { id: 'internal-messaging', label: 'Messagerie Interne', icon: <ChatBubbleLeftRightIcon /> },
        { id: 'announcements', label: 'Gestion des Annonces', icon: <MegaphoneIcon /> },
      ]
    },
    { id: 'documents', label: 'Documents & archivage', icon: <ArchiveBoxIcon /> },
    { id: 'reports', label: 'Statistiques & Rapports', icon: <ChartBarIcon /> },
];

export const ROLES_DATA = [
    { role: 'Administrateur principal', description: 'A tous les droits, peut tout créer, modifier et supprimer.' },
    { role: 'Pasteur général', description: 'Accès complet à la gestion spirituelle, membres, cultes, rapports.' },
    { role: 'Pasteur', description: 'Gère les aspects spirituels et pastoraux.' },
    { role: 'Ancien/Ancienne', description: 'Conseille et veille sur la bonne marche spirituelle de l\'église.' },
    { role: 'Diacre/Diaconnaise', description: 'Assiste dans les services pratiques et spirituels de l\'église.' },
    { role: 'Secrétaire', description: 'Gère les membres, les inscriptions, les documents.' },
    { role: 'Trésorier', description: 'Accès au module des finances (cotisations, rapports, dons).' },
    { role: 'Responsable de département', description: 'Gère un département spécifique de l\'église.' },
    { role: 'Responsable ministère', description: 'Gère son département (ex : musique, intercession, jeunesse).' },
    { role: 'Animateur cellule', description: 'Gère son groupe de maison et les membres qui y sont assignés.' },
    { role: 'Coordinateur logistique', description: 'Rôle temporaire pour gérer la logistique d\'un événement.' },
    { role: 'Responsable transport', description: 'Rôle temporaire pour gérer le transport lors d\'un événement.' },
    { role: 'Super Administrateur', description: 'Gère toutes les églises de la plateforme.' },
];

export const ROLE_PERMISSIONS: { [key: string]: string[] } = {
  // 'Administrateur principal' and 'Super Administrateur' have universal access, handled in hasPermission.
  'Pasteur général': [
    'dashboard', 'personnel', 'members-list', 'children-management', 'groups', 'events', 'assignments', 'education', 'reports', 'settings', 'activity-log',
    'announcements', 'internal-messaging'
  ],
  'Pasteur': [
    'dashboard', 'personnel', 'members-list', 'children-management', 'groups', 'events', 'assignments', 'education', 'reports', 'settings', 'activity-log',
    'announcements', 'internal-messaging'
  ],
  'Ancien/Ancienne': [
    'dashboard', 'personnel', 'members-list', 'children-management', 'groups', 'events', 'internal-messaging'
  ],
  'Diacre/Diaconnaise': [
    'dashboard', 'members-list', 'events', 'internal-messaging'
  ],
  'Secrétaire': [
    'dashboard', 'members-list', 'children-management', 'groups', 'events', 'documents', 'activity-log', 'internal-messaging'
  ],
  'Trésorier': [
    'dashboard', 'finances-overview', 'cotisations', 'cas-deces', 'projects', 'reports', 'activity-log', 'internal-messaging'
  ],
  'Responsable de département': [
    'dashboard', 'members-list', 'children-management', 'groups', 'events', 'assignments', 'internal-messaging'
  ],
  'Responsable ministère': [
    'dashboard', 'members-list', 'children-management', 'groups', 'events', 'assignments', 'internal-messaging'
  ],
  'Animateur cellule': [
    'dashboard', 'members-list', 'groups', 'internal-messaging'
  ],
  'Coordinateur logistique': [
    'dashboard', 'events', 'assignments', 'internal-messaging'
  ],
   'Responsable transport': [
    'dashboard', 'events', 'assignments', 'internal-messaging'
  ],
};

export const hasPermission = (roles: string[], pageId: string): boolean => {
    if (!roles || roles.length === 0) return false;
    // Super admins have universal access.
    if (roles.includes('Administrateur principal') || roles.includes('Super Administrateur')) return true;

    // Profile page, messaging, and new message creation should be accessible to all logged-in users.
    if (pageId === 'internal-messaging' || pageId === 'profile' || pageId === 'announcements') return true;
    
    // Check if any of the user's roles grant permission
    return roles.some(role => {
        const permissions = ROLE_PERMISSIONS[role] || [];
        return permissions.includes(pageId);
    });
};

export const getActiveRoles = (user: AppUser | null): string[] => {
    if (!user || !user.roles) {
        return [];
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return user.roles
        .filter(role => {
            // Use T00:00:00 to parse date string in local timezone
            const startDate = new Date(role.startDate + 'T00:00:00');
            
            if (startDate > today) {
                return false;
            }

            if (role.endDate) {
                const endDate = new Date(role.endDate + 'T00:00:00');
                if (endDate < today) {
                    return false;
                }
            }
            
            return true;
        })
        .map(role => role.role);
};

export const getPrimaryRole = (user: AppUser | null): string => {
    if (!user) {
        return 'Utilisateur';
    }
    const activeRoles = getActiveRoles(user);
    if (activeRoles.length > 0) {
        return activeRoles[0];
    }
    return user.roles.length > 0 ? user.roles[0].role : 'Utilisateur';
};

export const getAge = (birthDate?: string): number | null => {
    if (!birthDate) return null;
    try {
        const today = new Date();
        const birth = new Date(birthDate);
        if (isNaN(birth.getTime())) return null; // Invalid date
        
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    } catch (e) {
        return null;
    }
};
