import React from 'react';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  subItems?: NavItem[];
}

export interface AppUserRole {
  role: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
}

export interface UserAvailability {
  day: 'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi' | 'Samedi' | 'Dimanche';
  isAvailable: boolean;
  notes?: string;
}

export interface User {
  name: string;
  primaryRole: string;
  avatarUrl: string;
  status: string;
}

export interface Child {
  id: string;
  name: string;
  gender: 'Garçon' | 'Fille';
  birthDate: string;
  attendsSchool: boolean;
  schoolClass?: string;
  schoolName?: string;
  attendsSundaySchool: boolean;
  remainsInChurch: boolean;
  reasonForLeaving?: string;
}

export type MemberType = 'Membre' | 'Préposé' | 'Visiteur';

export interface Member {
  id: string;
  photoUrl: string;
  firstName: string;
  lastName: string;
  phone: string;
  phone2?: string;
  department: string;
  status: 'Actif' | 'Nouveau' | 'À suivre' | 'Inactif';
  lastSeen: string; 
  lastFollowUpDate?: string;
  email: string;
  gender: 'Homme' | 'Femme';
  birthDate: string;
  address: string;
  nationality: string;
  nationalIdNumber?: string;
  maritalStatus: 'Célibataire' | 'Marié(e)' | 'Divorcé(e)' | 'Veuf(ve)';
  spouseName?: string;
  children?: Child[];
  hasChildren?: boolean;
  childrenCount?: number;
  boysCount?: number;
  girlsCount?: number;
  childrenInSundaySchool?: boolean;
  profession: string;
  conversionDate?: string;
  baptismDate?: string;
  mentor?: string;
  groups: string[];
  trainings: string[];
  history: { date: string; event: string; type: 'event' | 'donation' | 'note' }[];
  documents: { name:string; type: 'PDF' | 'Word' | 'Image'; url: string; uploadDate: string }[];
  memberType: string;
}

export type EventFunction = 'Prédicateur' | 'Chantre' | 'Modérateur' | 'Témoignage' | 'Autre';

export interface SpecialGuest {
    id: string;
    name: string;
    function: EventFunction;
    functionOther?: string;
    churchOrMinistry?: string;
    contactInfo?: string;
    transportationNeeded: boolean;
    technicalNeeds?: string;
}

export interface ProgramItem {
    id: string;
    time: string;
    activity: string;
    responsibleId?: string; // from members list
    duration: number; // in minutes
}

export interface FileAttachment {
    id: string;
    name: string;
    url: string; // Data URL for prototype
    type: string;
}

export interface Task {
    id: string;
    text: string;
    completed: boolean;
}

export interface BudgetItem {
    id: string;
    category: string;
    amount: number;
}


export interface DailySchedule {
    date: string;
    speakerIds?: string[];
    musicalGroupIds?: string[];
}

export type TargetAudience = 'Membres de l’église' | 'Cellules' | 'Responsables' | 'Jeunes' | 'Tous publics' | 'Extérieurs';
export type AccessType = 'Libre' | 'Inscription obligatoire' | 'Sur invitation';

export interface ChurchEvent {
    id: string;
    name: string;
    type: string;
    objective?: string;
    startDate: string;
    endDate?: string;
    startTime: string;
    endTime: string;
    location: string;
    description: string;
    
    // Section 1 - New
    recurrence?: 'none' | 'weekly' | 'monthly' | 'yearly';
    recurrenceEndDate?: string;

    // Section 2
    targetAudience?: TargetAudience[];
    accessType?: AccessType;
    expectedParticipants?: number;
    onlineRegistration?: boolean;
    automaticNotifications?: boolean;
    
    // Section 3
    specialGuests?: SpecialGuest[];
    
    // Section 4
    detailedProgram?: ProgramItem[];
    
    // Section 5
    logistics?: {
        soundSystem?: boolean;
        videoStreaming?: boolean;
        receptionSecurity?: boolean;
        snacks?: boolean;
        chairsToInstall?: number;
        guestAccomodationBooked?: boolean;
        materialsNeeded?: string;
        // New
        resources?: string[];
        budget?: BudgetItem[];
    };
    
    // Section 6
    attachments?: FileAttachment[];
    
    // Section 7
    organizerId?: string;
    validation?: {
        validatedById?: string;
        validationDate?: string;
    };
    internalNotes?: string;
    // New
    tasks?: Task[];

    // Keep some old fields for compatibility
    attendeeIds: string[];
    status: 'À venir' | 'Passé' | 'Annulé';
    report?: string;
    leaderId?: string; // Replaced by organizerId in new form
    schedule?: DailySchedule[]; // Replaced by detailedProgram in new form
}


export interface BureauMember {
    memberId: string;
    name: string;
    phone: string;
    fonction: string;
}

export interface Group {
    id: string;
    name: string;
    description: string;
    leaderId: string;
    memberIds: string[];
    activities: ChurchEvent[];
    bureau?: BureauMember[];
}

export interface Transaction {
    id: string;
    date: string;
    type: 'income' | 'expense';
    category: 'Dîme' | 'Offrande' | 'Quête' | 'Don spécial' | 'Contribution projet' | 'Salaire' | 'Facture' | 'Construction' | 'Autre dépense' | 'Autre revenu';
    categoryDetail?: string;
    amount: number;
    description: string;
    memberId?: string;
    receiptGenerated: boolean;
    period?: string;
}

export interface Project {
    id: string;
    name: string;
    description: string;
    status: 'En cours' | 'Planifié' | 'En attente' | 'Terminé' | 'Annulé';
    budget: number;
    spent: number;
    startDate: string;
    endDate: string;
    leaderId: string;
    contributions: { memberId: string, amount: number, date: string }[];
}

export interface Assignment {
    id: string;
    memberId: string;
    role: string;
    departmentId: string;
    startDate: string;
    endDate?: string;
    status: 'Actif' | 'Terminé';
}

export interface SpiritualPathway {
    id: string;
    name: string;
    description: string;
}

export interface TrainingSession {
    id: string;
    topic: string;
    date: string;
    presentMemberIds: Set<string>;
}

export interface TrainingCourse {
    id: string;
    pathwayId: string;
    customPathway?: string;
    name: string;
    description: string;
    leaderId: string;
    enrolledMemberIds: string[];
    status: 'En cours' | 'Planifié' | 'Terminé';
    sessions: TrainingSession[];
    materials: { id: string; name: string; type: string; url: string; sessionId: string; }[];
    isPaid?: boolean;
    amount?: number;
}

export interface ChurchDocument {
    id: string;
    name: string;
    category: 'Certificat de baptême' | 'Rapport annuel' | 'Procès-verbal' | 'Autre';
    uploadDate: string;
    uploadedById: string;
    description: string;
    fileUrl: string;
    fileName: string;
    fileType: string;
}

export interface ActivityLog {
    id: string;
    text: string;
    date: string;
    actor: string;
    icon: React.ReactNode;
}

export interface DeathCase {
    id: string;
    deceasedName: string;
    declarationDate: string;
    status: 'En cours' | 'Clôturé';
    familyContactMemberId: string;
    deathDate?: string;
    funeralDate?: string;
    funeralLocation?: string;
    churchSupportDetails?: string;
}

export interface CotisationCampaign {
    id: string;
    name: string;
    description: string;
    type: 'Projet spécial' | 'Département' | 'Campagne spéciale' | 'Régulière' | 'Cas de Décès';
    frequency: 'Ponctuelle' | 'Mensuelle' | 'Annuelle' | 'Unique';
    defaultAmount: number;
    isAmountFree: boolean;
    isMandatory: boolean;
    targetScope: 'Tous les membres' | 'Groupe spécifique' | 'Volontaires';
    targetGroupId?: string;
    startDate: string;
    endDate?: string;
    deathCaseId?: string;
    projectId?: string;
    closeOnTargetAmount?: boolean;
}

export interface CotisationPayment {
    id: string;
    amount: number;
    date: string;
    method: 'Espèces' | 'Mobile Money' | 'Virement' | 'Carte';
}

export interface MemberCotisation {
    id: string;
    campaignId: string;
    memberId: string;
    expectedAmount: number;
    dueDate: string;
    payments: CotisationPayment[];
    status: 'Payée' | 'Partiel' | 'Non payée' | 'En retard';
}

export interface AppUser {
  id: string;
  photoUrl: string;
  name: string;
  email: string;
  roles: AppUserRole[];
  department: string; // Ministère / département rattaché
  status: 'Actif' | 'Suspendu';
  identifiant: string;
  password?: string;
  civilite: 'M.' | 'Mme';
  sexe: 'M' | 'F';
  contact: string; // Téléphone / WhatsApp
  groupeAdministratif: string; // Pour les onglets de filtrage
  // Champs enrichis
  birthDate: string;
  maritalStatus: 'Célibataire' | 'Marié(e)' | 'Divorcé(e)' | 'Veuf(ve)';
  cellGroup?: string; // Cellule ou groupe local
  joinDate: string; // Date d’adhésion à l’église
  availability?: UserAvailability[];
  superAdmin?: boolean;
}

export interface CertificateTemplate {
  title: string;
  body: string;
  signatureLabel: string;
}

export interface ChurchSettings {
  name: string;
  slogan: string;
  address: string;
  country: string;
  city: string;
  neighborhood: string;
  phone: string;
  phone2: string;
  email: string;
  whatsapp: string;
  leaderName: string;
  leaderTitle?: string;
  leaderPhone?: string;
  currency: string;
  timezone: string;
  language: string;
  logoUrl: string;
  // Onboarding
  activatedRoles?: string[];
  // Personalization
  docTemplateReceipt?: string;
  baptismCertificateTemplate?: CertificateTemplate;
  docTemplateEngagement?: string;
  docTemplateHeader?: string;
  officialSignatureUrl?: string;
  pdfFooterText?: string;
  pdfIncludeLogo?: boolean;
  // Security
  requireSpecialChars?: boolean;
  requireNumbersInPassword?: boolean;
  dateFormat?: 'JJ/MM/AAAA' | 'MM/DD/AAAA';
}

export interface InternalMessage {
  id: string;
  senderId: string; // AppUser ID
  timestamp: string; // ISO string
  text: string;
  isRead: boolean;
}

export interface MessageThread {
  id: string;
  participantIds: string[]; // AppUser IDs
  subject: string;
  messages: InternalMessage[];
}

export interface FollowUp {
  id: string;
  memberId: string;
  date: string;
  type: 'Appel' | 'Visite' | 'Message' | 'Rencontre' | 'Autre';
  outcome: 'Contacté' | 'Pas de réponse' | 'Visité' | 'Promesse de retour' | 'Raison personnelle' | 'Autre';
  notes: string;
  followedUpById: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string; // AppUser ID
  createdAt: string; // ISO string
}

// ---- Super Admin Types ----
export interface InscriptionCode {
  code: string;
  status: 'Actif' | 'Utilisé' | 'Expiré';
  expirationDate: string; // YYYY-MM-DD
  usedByChurchId?: string;
  usedDate?: string; // ISO String
  paymentRequestId?: string;
}

export interface PasswordResetRequest {
  id: string;
  churchId: string;
  churchName: string;
  userEmail: string;
  userName: string;
  userId: string;
  requestDate: string; // ISO String
  status: 'En attente' | 'Résolue';
}

export type ChurchOnboardingData = {
    name: string;
    adminEmail: string;
    denomination: string;
    foundationDate?: string;
    legalStatus: 'Enregistrée' | 'En cours' | 'Non déclarée';
    country: string;
    city: string;
    neighborhood: string;
    address: string;
    phone: string;
    whatsapp: string;
    website?: string;
};

export type AdminOnboardingData = {
    name: string;
    email: string;
    contact: string;
    roles: AppUserRole[];
};

export interface PaymentRequest {
  id: string;
  applicantName: string;
  applicantEmail: string;
  churchName: string;
  paymentMethod: 'Wave' | 'Orange Money' | 'MTN Money' | 'Moov Money';
  transactionId?: string;
  requestDate: string; // ISO String
  status: 'En attente' | 'Validé' | 'Rejeté';
  validationDate?: string; // ISO String
  generatedCode?: string;
  churchOnboardingData?: ChurchOnboardingData;
  adminOnboardingData?: AdminOnboardingData;
  logoDataUrl?: string;
}


export interface ChurchData {
  members: Member[];
  appUsers: AppUser[];
  groups: Group[];
  deathCases: DeathCase[];
  cotisationCampaigns: CotisationCampaign[];
  memberCotisations: MemberCotisation[];
  projects: Project[];
  transactions: Transaction[];
  events: ChurchEvent[];
  messageThreads: MessageThread[];
  documents: ChurchDocument[];
  followUps: FollowUp[];
  announcements: Announcement[];
  assignments: Assignment[];
  trainingCourses: TrainingCourse[];
  spiritualPathways: SpiritualPathway[];
  settings: ChurchSettings;
  onboardingCompleted: boolean;
}

export interface Church {
  id: string;
  name: string;
  adminEmail: string;
  status: 'Actif' | 'Inactif';
  registrationCode: string;
  creationDate: string; // ISO String
  denomination: string;
  website?: string;
  foundationDate?: string;
  legalStatus: 'Enregistrée' | 'En cours' | 'Non déclarée';
  data: ChurchData;
  expirationDate?: string;
}

export interface LoginPromotionalText {
    text: string;
    backgroundColor: string;
    enabled: boolean;
}

export interface AppColors {
    primary: string;
    primaryLight: string;
    primaryLighter: string;
    accent: string;
    darkBlue: string;
    background: string;
}

export interface PaymentMethodConfig {
  name: 'Wave' | 'Orange Money' | 'MTN Money' | 'Moov Money';
  logoUrl: string;
  details: string;
  number: string;
  qrCodeUrl?: string;
  transactionIdRequired: boolean;
}

export interface PlatformSettings {
    appName: string;
    appLogoUrl: string;
    developedByText: string;
    subscriptionPrice: number;
    subscriptionPriceCurrency: string;
    loginPage: {
        backgroundImageUrl: string;
        promoText1: LoginPromotionalText;
        promoText2: LoginPromotionalText;
        promoText3: LoginPromotionalText;
        contactPhone: string;
        contactEmail: string;
        copyrightYear: string;
    };
    colors: AppColors;
    paymentMethods: PaymentMethodConfig[];
}