import React from 'react';
import { Member, Group, ChurchEvent, Transaction, Project, Assignment, SpiritualPathway, TrainingCourse, ChurchDocument, ActivityLog, CotisationCampaign, MemberCotisation, DeathCase, Child, AppUser, MessageThread, Church, InscriptionCode, PasswordResetRequest, PaymentRequest } from './types';
import { UserGroupIcon, CurrencyDollarIcon, CalendarDaysIcon, AcademicCapIcon, RocketLaunchIcon, DocumentTextIcon, HeartIcon } from './components/icons/HeroIcons';
import { ROLES_DATA } from './constants';


// --- START OF DEMO DATA ---
// All sample data has been cleared to allow for a fresh start.
// --- END OF DEMO DATA ---


export const DUMMY_MEMBERS: Member[] = [];

export const DUMMY_EVENTS: ChurchEvent[] = [];

export const DUMMY_GROUPS: Group[] = [];

export const DUMMY_TRANSACTIONS: Transaction[] = [];

export const DUMMY_PROJECTS: Project[] = [];

export const DUMMY_ASSIGNMENTS: Assignment[] = [];

export const DUMMY_PATHWAYS: SpiritualPathway[] = [];

export const DUMMY_COURSES: TrainingCourse[] = [];

export const DUMMY_DOCUMENTS: ChurchDocument[] = [];

export const DUMMY_ACTIVITIES: ActivityLog[] = [];

export const DUMMY_DEATH_CASES: DeathCase[] = [];

export const DUMMY_COTISATION_CAMPAIGNS: CotisationCampaign[] = [];

export const DUMMY_MEMBER_COTISATIONS: MemberCotisation[] = [];

export const DUMMY_APP_USERS: AppUser[] = [];

export const DUMMY_MESSAGE_THREADS: MessageThread[] = [];

export const DUMMY_PASSWORD_RESET_REQUESTS: PasswordResetRequest[] = [];

export const DUMMY_PAYMENT_REQUESTS: PaymentRequest[] = [];

export const SUPER_ADMIN_USER: AppUser = {
  id: 'superadmin_01',
  photoUrl: '',
  name: 'Administrateur Général',
  email: 'superadmin@graceconnect.app',
  password: 'admin@',
  roles: [{ role: 'Super Administrateur', startDate: '2020-01-01' }],
  department: 'Platform',
  status: 'Actif',
  identifiant: 'cydrovis',
  civilite: 'M.',
  sexe: 'M',
  contact: '0000000000',
  groupeAdministratif: 'ADMINISTRATIF',
  birthDate: '1970-01-01',
  maritalStatus: 'Célibataire',
  joinDate: '2020-01-01',
  superAdmin: true,
};

const mainAdmin: AppUser = {
  id: 'user1',
  photoUrl: ``,
  name: 'Admin Principal',
  email: 'admin@mon-eglise.com',
  roles: [{ role: 'Administrateur principal', startDate: '2024-01-01' }],
  department: 'Administration',
  status: 'Actif',
  identifiant: '310682',
  password: 'admin',
  civilite: 'M.',
  sexe: 'M',
  contact: '0102030405',
  groupeAdministratif: 'ADMINISTRATIF',
  birthDate: '1980-01-01',
  maritalStatus: 'Célibataire',
  joinDate: '2024-01-01',
};

export const DUMMY_CHURCHES: Church[] = [
  {
    id: 'church1',
    name: 'Mon Eglise',
    adminEmail: 'admin@mon-eglise.com',
    status: 'Actif',
    registrationCode: 'USED-CODE-123',
    creationDate: '2024-01-01T12:00:00Z',
    denomination: 'Evangélique',
    legalStatus: 'Enregistrée',
    data: {
      members: [],
      appUsers: [mainAdmin],
      groups: [],
      deathCases: [],
      cotisationCampaigns: [],
      memberCotisations: [],
      projects: [],
      transactions: [],
      events: [],
      messageThreads: [],
      documents: [],
      followUps: [],
      announcements: [],
      assignments: [],
      trainingCourses: [],
      spiritualPathways: [],
      onboardingCompleted: true,
      settings: {
        name: 'Mon Eglise',
        slogan: 'Mon Slogan',
        address: "123 Rue de l'Eglise",
        country: 'France',
        city: 'Paris',
        neighborhood: 'Centre',
        phone: '0102030405',
        phone2: '',
        email: 'contact@mon-eglise.com',
        whatsapp: '',
        leaderName: 'Admin Principal',
        currency: 'FCFA',
        timezone: 'Europe/Paris',
        language: 'Français',
        logoUrl: '',
        activatedRoles: ROLES_DATA.map(r => r.role),
      }
    }
  }
];


export const DUMMY_INSCRIPTION_CODES: InscriptionCode[] = [];