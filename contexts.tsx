import React, { createContext, useState, useMemo, useContext, ReactNode, useEffect } from 'react';
import { NavItem, User, Member, Child, AppUser, DeathCase, CotisationCampaign, MemberCotisation, CotisationPayment, Project, ChurchSettings, MessageThread, InternalMessage, Transaction, ChurchEvent, Church, InscriptionCode, PlatformSettings, ChurchData, ChurchDocument, Group, BureauMember, FollowUp, Announcement, Assignment, TrainingCourse, SpiritualPathway, TrainingSession, PasswordResetRequest, PaymentRequest } from './types';
import { DUMMY_CHURCHES, DUMMY_INSCRIPTION_CODES, SUPER_ADMIN_USER, DUMMY_PASSWORD_RESET_REQUESTS, DUMMY_PAYMENT_REQUESTS } from './dummyData';
import { SIDEBAR_ITEMS, hasPermission, ROLES_DATA, getActiveRoles, getPrimaryRole } from './constants';
import { ClipboardDocumentListIcon, ExclamationTriangleIcon, UserCircleIcon, ChatBubbleLeftRightIcon, HomeIcon } from './components/icons/HeroIcons';

/*
 * Ce fichier définit l'architecture de gestion d'état de l'application
 * en utilisant le Context API de React. Il est divisé en quatre contextes principaux,
 * chacun avec une responsabilité claire pour une séparation logique des préoccupations.
 *
 * This file defines the state management architecture of the application
 * using React's Context API. It is divided into four main contexts,
 * each with a clear responsibility for a logical separation of concerns.
 */

// =================================================================================================
// 1. DATA CONTEXT
// Gère les données globales et multi-tenants comme la liste des églises, les codes d'inscription,
// et les paramètres de la plateforme. C'est la source de vérité pour les données de plus haut niveau.
// Manages global, multi-tenant data like the list of churches, inscription codes,
// and platform settings. It's the source of truth for the highest-level data.
// =================================================================================================

interface DataContextType {
    churches: Church[];
    inscriptionCodes: InscriptionCode[];
    setInscriptionCodes: React.Dispatch<React.SetStateAction<InscriptionCode[]>>;
    platformSettings: PlatformSettings;
    setPlatformSettings: React.Dispatch<React.SetStateAction<PlatformSettings>>;
    updateChurchData: (churchId: string, dataUpdater: (churchData: Church['data']) => Partial<Church['data']>) => void;
    setChurches: React.Dispatch<React.SetStateAction<Church[]>>;
    passwordResetRequests: PasswordResetRequest[];
    setPasswordResetRequests: React.Dispatch<React.SetStateAction<PasswordResetRequest[]>>;
    handleResolvePasswordReset: (requestId: string) => void;
    paymentRequests: PaymentRequest[];
    handleCreatePaymentRequest: (request: Omit<PaymentRequest, 'id' | 'requestDate' | 'status'>) => string;
    handleValidatePayment: (requestId: string, durationInMonths: number) => void;
    handleRejectPayment: (requestId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [churches, setChurches] = useState<Church[]>(DUMMY_CHURCHES);
    const [inscriptionCodes, setInscriptionCodes] = useState<InscriptionCode[]>(DUMMY_INSCRIPTION_CODES);
    const [passwordResetRequests, setPasswordResetRequests] = useState<PasswordResetRequest[]>(DUMMY_PASSWORD_RESET_REQUESTS);
    const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>(DUMMY_PAYMENT_REQUESTS);
    const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
        appName: 'GraceConnect',
        appLogoUrl: 'https://i.imgur.com/J82f2de.png',
        developedByText: 'CYDROVIS',
        subscriptionPrice: 120000,
        subscriptionPriceCurrency: 'FCFA',
        loginPage: {
            backgroundImageUrl: 'https://images.unsplash.com/photo-1507919381536-213c5e01a12a?q=80&w=2070&auto=format&fit=crop',
            promoText1: { text: "GESTION D'ÉGLISE MODERNE", backgroundColor: 'bg-orange-500', enabled: true },
            promoText2: { text: "Plateforme de gestion pour votre communauté", backgroundColor: 'bg-green-600', enabled: true },
            promoText3: { text: "(Edition 2025)", backgroundColor: 'bg-gray-800 bg-opacity-75', enabled: true },
            contactPhone: '07 87 30 38 87 / 05 45 41 44 28 / 01 50 05 24 94 / 05 76 74 25 44',
            contactEmail: 'contactgraceconnect@gmail.com',
            copyrightYear: '2025'
        },
        colors: {
            primary: '#004d40', primaryLight: '#00695c', primaryLighter: '#00796b',
            accent: '#4caf50', darkBlue: '#1a237e', background: '#f0f2f5',
        },
        paymentMethods: [
            {
                name: 'Wave',
                logoUrl: 'https://i.imgur.com/D623r5K.png',
                details: 'Payez via Wave en utilisant le numéro ou le QR Code. Le paiement est instantané et sans frais de retrait.',
                number: '0787303887',
                qrCodeUrl: 'https://i.imgur.com/example-qr.png',
                transactionIdRequired: false
            },
            {
                name: 'Orange Money',
                logoUrl: 'https://i.imgur.com/tFtT6bV.png',
                details: 'Payez via Orange Money et entrez l\'ID de la transaction pour confirmation.',
                number: '0787303887',
                transactionIdRequired: true
            },
            {
                name: 'MTN Money',
                logoUrl: 'https://i.imgur.com/Qk7a2yH.png',
                details: 'Payez via MTN Money et entrez l\'ID de la transaction pour confirmation.',
                number: '0545414428',
                transactionIdRequired: true
            },
            {
                name: 'Moov Money',
                logoUrl: 'https://i.imgur.com/3h73t6e.png',
                details: 'Payez via Moov Money et entrez l\'ID de la transaction pour confirmation.',
                number: '0150052494',
                transactionIdRequired: true
            }
        ]
    });

    const updateChurchData = (churchId: string, dataUpdater: (churchData: Church['data']) => Partial<Church['data']>) => {
        setChurches(prevChurches => {
            const churchIndex = prevChurches.findIndex(c => c.id === churchId);
            if (churchIndex === -1) return prevChurches;

            const updatedChurches = [...prevChurches];
            const churchToUpdate = updatedChurches[churchIndex];
            const updatedData = dataUpdater(churchToUpdate.data);
            
            if (Object.keys(updatedData).length === 0) {
              return prevChurches; // Abort update if updater returns empty object
            }

            updatedChurches[churchIndex] = {
                ...churchToUpdate,
                data: { ...churchToUpdate.data, ...updatedData },
            };
            return updatedChurches;
        });
    };

    const handleResolvePasswordReset = (requestId: string) => {
        const request = passwordResetRequests.find(r => r.id === requestId);
        if (!request) return;

        // Update user password in the specific church
        updateChurchData(request.churchId, data => {
            return {
                appUsers: data.appUsers.map(u =>
                    u.id === request.userId
                        ? { ...u, password: 'grace' } // Reset password to 'grace'
                        : u
                )
            };
        });

        // Update request status
        setPasswordResetRequests(prev =>
            prev.map(r =>
                r.id === requestId
                    ? { ...r, status: 'Résolue' }
                    : r
            )
        );
    };

    const handleCreatePaymentRequest = (request: Omit<PaymentRequest, 'id' | 'requestDate' | 'status'>) => {
        const newRequest: PaymentRequest = {
            ...request,
            id: crypto.randomUUID(),
            requestDate: new Date().toISOString(),
            status: 'En attente',
        };
        setPaymentRequests(prev => [newRequest, ...prev]);
        return newRequest.id;
    };

    const handleValidatePayment = (requestId: string, durationInMonths: number) => {
        const newCodeString = `GRACE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const expirationDateCode = new Date();
        expirationDateCode.setDate(expirationDateCode.getDate() + 90); // Code valid for 90 days

        const newCode: InscriptionCode = {
            code: newCodeString,
            status: 'Actif',
            expirationDate: expirationDateCode.toISOString().split('T')[0],
            paymentRequestId: requestId,
        };
        setInscriptionCodes(prev => [newCode, ...prev]);

        setPaymentRequests(prev => prev.map(p => {
            if (p.id === requestId) {
                const updatedRequest = { ...p, status: 'Validé' as 'Validé', validationDate: new Date().toISOString(), generatedCode: newCodeString };
                // Now create the church
                const { churchOnboardingData, adminOnboardingData, logoDataUrl } = updatedRequest;
                if(churchOnboardingData && adminOnboardingData) {
                    
                    const newChurchId = `CH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
                    const safeChurchName = churchOnboardingData.name.substring(0, 5).toUpperCase().replace(/\s/g, '');
                    const newAdminIdentifiant = `${safeChurchName}-${Math.floor(100 + Math.random() * 900)}`;

                    const adminPrincipalRole = { role: 'Administrateur principal', startDate: new Date().toISOString().split('T')[0] };
                    
                    const firstAdmin: AppUser = {
                        ...adminOnboardingData,
                        id: `u_${crypto.randomUUID()}`,
                        photoUrl: `https://i.pravatar.cc/150?u=${crypto.randomUUID()}`,
                        identifiant: newAdminIdentifiant,
                        password: 'grace', // Default password
                        status: 'Actif',
                        department: 'Administration',
                        civilite: 'M.',
                        sexe: 'M',
                        groupeAdministratif: 'ADMINISTRATIF',
                        birthDate: '1990-01-01',
                        maritalStatus: 'Célibataire',
                        joinDate: new Date().toISOString().split('T')[0],
                        roles: [adminPrincipalRole],
                    };

                    const expirationDate = new Date();
                    expirationDate.setMonth(expirationDate.getMonth() + durationInMonths);

                    const newChurch: Church = {
                        id: newChurchId,
                        name: churchOnboardingData.name,
                        adminEmail: churchOnboardingData.adminEmail,
                        status: 'Actif',
                        registrationCode: newCodeString,
                        creationDate: new Date().toISOString(),
                        expirationDate: expirationDate.toISOString(),
                        denomination: churchOnboardingData.denomination,
                        website: churchOnboardingData.website,
                        foundationDate: churchOnboardingData.foundationDate,
                        legalStatus: churchOnboardingData.legalStatus,
                        data: {
                            members: [], appUsers: [firstAdmin], groups: [], deathCases: [], cotisationCampaigns: [],
                            memberCotisations: [], projects: [], transactions: [], events: [], messageThreads: [],
                            documents: [], followUps: [], announcements: [], assignments: [], trainingCourses: [],
                            spiritualPathways: [], onboardingCompleted: false,
                            settings: {
                                name: churchOnboardingData.name, slogan: `Bienvenue à ${churchOnboardingData.name}`,
                                address: churchOnboardingData.address, country: churchOnboardingData.country,
                                city: churchOnboardingData.city, neighborhood: churchOnboardingData.neighborhood,
                                phone: churchOnboardingData.phone, phone2: '', email: churchOnboardingData.adminEmail,
                                whatsapp: churchOnboardingData.whatsapp, leaderName: adminOnboardingData.name,
                                currency: 'FCFA', timezone: 'Africa/Abidjan', language: 'Français',
                                logoUrl: logoDataUrl || '', activatedRoles: ROLES_DATA.map(r => r.role),
                            }
                        }
                    };
                    setChurches(prevChurches => [...prevChurches, newChurch]);
                }
                return updatedRequest;
            }
            return p;
        }));
    };

    const handleRejectPayment = (requestId: string) => {
        setPaymentRequests(prev => prev.map(p => p.id === requestId ? { ...p, status: 'Rejeté', validationDate: new Date().toISOString() } : p));
    };
    
    useEffect(() => {
        document.title = platformSettings.appName;
    }, [platformSettings.appName]);
  
    const hexToRgb = (hex: string): string => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` : '0 0 0';
    };

    useEffect(() => {
        if (platformSettings.colors) {
            document.documentElement.style.setProperty('--color-primary', hexToRgb(platformSettings.colors.primary));
            document.documentElement.style.setProperty('--color-primary-light', hexToRgb(platformSettings.colors.primaryLight));
            document.documentElement.style.setProperty('--color-primary-lighter', hexToRgb(platformSettings.colors.primaryLighter));
            document.documentElement.style.setProperty('--color-accent', hexToRgb(platformSettings.colors.accent));
            document.documentElement.style.setProperty('--color-dark-blue', hexToRgb(platformSettings.colors.darkBlue));
            document.documentElement.style.setProperty('--color-background', hexToRgb(platformSettings.colors.background));
        }
    }, [platformSettings.colors]);


    return (
        <DataContext.Provider value={{ churches, inscriptionCodes, setInscriptionCodes, platformSettings, setPlatformSettings, updateChurchData, setChurches, passwordResetRequests, setPasswordResetRequests, handleResolvePasswordReset, paymentRequests, handleCreatePaymentRequest, handleValidatePayment, handleRejectPayment }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error('useData must be used within a DataProvider');
    return context;
};

// =================================================================================================
// 2. AUTH CONTEXT
// Gère l'état de la session, l'utilisateur actuellement connecté et la logique d'authentification.
// Il dépend du DataContext pour trouver les utilisateurs et valider les informations de connexion.
// Manages session state, the currently logged-in user, and authentication logic.
// It depends on the DataContext to find users and validate login credentials.
// =================================================================================================

type SessionState = 'loggedOut' | 'registering' | 'loggedInChurch' | 'loggedInSuperAdmin' | 'onboarding' | 'awaitingActivation' | 'activatingDirectly' | 'forcePasswordChange';

interface AuthContextType {
    sessionState: SessionState;
    setSessionState: React.Dispatch<React.SetStateAction<SessionState>>;
    currentUser: AppUser | null;
    currentChurchId: string | null;
    loginError: string;
    handleLogin: (identifiant: string, password: string) => void;
    handleLogout: () => void;
    registrationSuccessData: { identifiant: string; name: string; } | null;
    setRegistrationSuccessData: React.Dispatch<React.SetStateAction<{ identifiant: string; name: string; } | null>>;
    isSuperAdminProfileOpen: boolean;
    setSuperAdminProfileOpen: React.Dispatch<React.SetStateAction<boolean>>;
    handleSaveSuperAdminProfile: (data: { identifiant: string, currentPassword: string, newPassword?: string }) => { success: boolean, message: string };
    handleChangePassword: (userId: string, currentPassword: string, newPassword: string) => { success: boolean, message: string };
    handleSaveProfile: (updatedUser: AppUser) => void;
    userForHeaderAndSidebar?: User & { roles: string[] };
    currentUserActiveRoles: string[];
    handlePasswordResetRequest: (identifiant: string) => { success: boolean, message: string };
    pendingRequestId: string | null;
    setPendingRequestId: React.Dispatch<React.SetStateAction<string | null>>;
    activationError: string;
    handleActivateWithCode: (code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { churches, setChurches, inscriptionCodes, setInscriptionCodes, updateChurchData, setPasswordResetRequests, paymentRequests } = useData();
    const [sessionState, setSessionState] = useState<SessionState>('loggedOut');
    const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
    const [currentChurchId, setCurrentChurchId] = useState<string | null>(null);
    const [loginError, setLoginError] = useState('');
    const [registrationSuccessData, setRegistrationSuccessData] = useState<{ identifiant: string; name: string } | null>(null);
    const [isSuperAdminProfileOpen, setSuperAdminProfileOpen] = useState(false);
    const [pendingRequestId, setPendingRequestId] = useState<string | null>(null);
    const [activationError, setActivationError] = useState('');

    useEffect(() => {
        if (sessionState === 'onboarding' && currentChurchId) {
            const church = churches.find(c => c.id === currentChurchId);
            if (church && church.data.onboardingCompleted) {
                setSessionState('loggedInChurch');
            }
        }
    }, [churches, currentChurchId, sessionState]);

    const handleLogin = (identifiant: string, password: string) => {
        setLoginError('');
        const lowerIdentifiant = identifiant.toLowerCase();

        if (lowerIdentifiant === SUPER_ADMIN_USER.identifiant.toLowerCase() || lowerIdentifiant === 'cydrovis@gmail.com') {
            if (password === SUPER_ADMIN_USER.password) {
                setCurrentUser(SUPER_ADMIN_USER);
                setCurrentChurchId(null);
                setSessionState('loggedInSuperAdmin');
                return;
            }
            setLoginError('Mot de passe incorrect.');
            return;
        }

        for (const church of churches) {
            if (church.status === 'Inactif') continue;
            const user = church.data.appUsers.find(u => u.identifiant.toLowerCase() === lowerIdentifiant || u.email.toLowerCase() === lowerIdentifiant);
            if (user) {
                if (user.password === password) {
                    if (password === 'grace') {
                        setCurrentUser(user);
                        setCurrentChurchId(church.id);
                        setSessionState('forcePasswordChange');
                        return;
                    }
                    if (user.status === 'Actif') {
                        setCurrentUser(user);
                        setCurrentChurchId(church.id);
                        if (church.data.onboardingCompleted === false) {
                            setSessionState('onboarding');
                        } else {
                            setSessionState('loggedInChurch');
                        }
                    } else {
                        setLoginError('Votre compte est suspendu.');
                    }
                } else {
                    setLoginError('Mot de passe incorrect.');
                }
                return;
            }
        }
        setLoginError('Identifiant ou e-mail non trouvé, ou église inactive.');
    };
    
    const handleActivateWithCode = async (code: string) => {
        setActivationError('');
        const codeEntry = inscriptionCodes.find(c => c.code === code);
        const request = paymentRequests.find(p => p.generatedCode === code && p.status === 'Validé');

        if (!codeEntry) {
            setActivationError("Code d'activation invalide ou non trouvé.");
            return;
        }

        if (codeEntry.status === 'Utilisé') {
            setActivationError('Ce code a déjà été utilisé.');
            return;
        }
        
         if (new Date(codeEntry.expirationDate) < new Date()) {
            setActivationError('Ce code a expiré.');
            return;
        }

        if (!request || !request.churchOnboardingData || !request.adminOnboardingData) {
            setActivationError("Les données d'inscription sont manquantes pour cette demande. Veuillez contacter le support.");
            return;
        }
        
        // Find the church that was just created by the validation process
        const newChurch = churches.find(c => c.registrationCode === code);
        if(!newChurch) {
            setActivationError("L'église associée à ce code n'a pas été trouvée. Veuillez contacter le support.");
            return;
        }

        const admin = newChurch.data.appUsers.find(u => getActiveRoles(u).includes('Administrateur principal'));

        if (!admin) {
            setActivationError("L'administrateur de l'église n'a pas été trouvé. Veuillez contacter le support.");
            return;
        }
        
        setInscriptionCodes(prev => prev.map(c => c.code === code ? { ...c, status: 'Utilisé', usedByChurchId: newChurch.id, usedDate: new Date().toISOString() } : c));
        
        setRegistrationSuccessData({ identifiant: admin.identifiant, name: admin.name });
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setCurrentChurchId(null);
        setSessionState('loggedOut');
    };

    const handleSaveSuperAdminProfile = (data: { identifiant: string, currentPassword: string, newPassword?: string }) => {
        if (data.currentPassword !== SUPER_ADMIN_USER.password) {
            return { success: false, message: "Mot de passe actuel incorrect." };
        }
        SUPER_ADMIN_USER.identifiant = data.identifiant;
        if (data.newPassword) {
            SUPER_ADMIN_USER.password = data.newPassword;
        }
        setCurrentUser({ ...SUPER_ADMIN_USER });
        return { success: true, message: "Profil mis à jour avec succès." };
    };

    const handleChangePassword = (userId: string, currentPassword: string, newPassword: string) => {
        let success = false;
        let message = "Utilisateur ou église introuvable.";

        if (!currentChurchId) return { success: false, message: "Aucune église sélectionnée." };

        updateChurchData(currentChurchId, data => {
            const userIndex = data.appUsers.findIndex(u => u.id === userId);
            if (userIndex !== -1) {
                const user = data.appUsers[userIndex];
                if (user.password !== currentPassword) {
                    message = "Mot de passe actuel incorrect.";
                    return {}; // Abort update
                }
                const updatedUsers = [...data.appUsers];
                updatedUsers[userIndex] = { ...user, password: newPassword };
                success = true;
                message = "Mot de passe mis à jour avec succès.";
                setCurrentUser(updatedUsers[userIndex]); // Update current user state
                return { appUsers: updatedUsers };
            }
            return {};
        });
        
        return { success, message };
    };
    
    const handleSaveProfile = (updatedUser: AppUser) => {
        if (currentChurchId) {
            updateChurchData(currentChurchId, data => {
                const updatedUsers = data.appUsers.map(u => u.id === updatedUser.id ? updatedUser : u);
                setCurrentUser(updatedUser);
                return { appUsers: updatedUsers };
            });
        }
    };
    
    const handlePasswordResetRequest = (identifiant: string) => {
        const lowerIdentifiant = identifiant.toLowerCase();
        for (const church of churches) {
            const user = church.data.appUsers.find(u => 
                (u.identifiant.toLowerCase() === lowerIdentifiant || u.email.toLowerCase() === lowerIdentifiant) && 
                getActiveRoles(u).includes('Administrateur principal')
            );
            if (user) {
                const newRequest: PasswordResetRequest = {
                    id: crypto.randomUUID(),
                    churchId: church.id,
                    churchName: church.name,
                    userEmail: user.email,
                    userName: user.name,
                    userId: user.id,
                    requestDate: new Date().toISOString(),
                    status: 'En attente',
                };
                setPasswordResetRequests(prev => [newRequest, ...prev]);
                return { success: true, message: "Demande de réinitialisation envoyée au Super Administrateur." };
            }
        }
        return { success: false, message: "Aucun administrateur principal trouvé avec cet identifiant ou e-mail." };
    };
    
    const userForHeaderAndSidebar = useMemo(() => {
        if (!currentUser) return undefined;
        
        const activeRoles = getActiveRoles(currentUser);
        const primaryRole = getPrimaryRole(currentUser);
        
        return {
            name: currentUser.name,
            primaryRole: primaryRole,
            avatarUrl: currentUser.photoUrl,
            status: currentUser.status,
            roles: activeRoles
        };
    }, [currentUser]);
    
    const currentUserActiveRoles = useMemo(() => currentUser ? getActiveRoles(currentUser) : [], [currentUser]);
    

    return (
        <AuthContext.Provider value={{ sessionState, setSessionState, currentUser, currentChurchId, loginError, handleLogin, handleLogout, registrationSuccessData, setRegistrationSuccessData, isSuperAdminProfileOpen, setSuperAdminProfileOpen, handleSaveSuperAdminProfile, handleChangePassword, handleSaveProfile, userForHeaderAndSidebar, currentUserActiveRoles, handlePasswordResetRequest, pendingRequestId, setPendingRequestId, activationError, handleActivateWithCode }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};


// =================================================================================================
// 3. UI CONTEXT
// Gère l'état de l'interface utilisateur, comme la page active, les modales ouvertes, etc.
// Il dépend de l'AuthContext pour des éléments comme les permissions de l'utilisateur.
// Manages the state of the user interface, such as the active page, open modals, etc.
// It depends on the AuthContext for elements like user permissions.
// =================================================================================================

interface UIContextType {
    activePage: string;
    setActivePage: (pageId: string) => void;
    activeTitle: string;
    handleNavClick: (item: NavItem) => void;
    isSidebarOpen: boolean;
    setSidebarOpen: (isOpen: boolean) => void;
    isRegistrationFormOpen: boolean;
    openRegistrationForm: () => void;
    closeRegistrationForm: () => void;
    isChildRegistrationFormOpen: boolean;
    openChildRegistrationForm: () => void;
    closeChildRegistrationForm: () => void;
    isUserFormOpen: boolean;
    openUserForm: (group?: string) => void;
    closeUserForm: () => void;
    defaultUserGroup: string | null;
    isFollowUpModalOpen: boolean;
    openFollowUpModal: (member: Member) => void;
    closeFollowUpModal: () => void;
    followingUpMember: Member | null;
    isAnnouncementFormOpen: boolean;
    openAnnouncementForm: () => void;
    closeAnnouncementForm: () => void;
    isNewMessageModalOpen: boolean;
    setNewMessageModalOpen: (isOpen: boolean) => void;
    editingMember: Member | null;
    setEditingMember: (member: Member | null) => void;
    editingChild: { child: Child, parentId: string } | null;
    setEditingChild: (data: { child: Child, parentId: string } | null) => void;
    editingUser: AppUser | null;
    setEditingUser: (user: AppUser | null) => void;
    editingAnnouncement: Announcement | null;
    setEditingAnnouncement: (announcement: Announcement | null) => void;
    isSettingsModalOpen: boolean;
    openSettingsModal: () => void;
    closeSettingsModal: () => void;
    viewingMember: Member | null;
    setViewingMember: (member: Member | null) => void;
    viewingChild: { child: Child, parent: Member } | null;
    setViewingChild: (data: { child: Child, parent: Member } | null) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { currentUserActiveRoles } = useAuth();
    const [activePage, setActivePage] = useState('dashboard');
    const [activeTitle, setActiveTitle] = useState('Panneau d\'accueil');
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    
    // Member Registration Modal
    const [isRegistrationFormOpen, setRegistrationFormOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<Member | null>(null);
    const openRegistrationForm = () => setRegistrationFormOpen(true);
    const closeRegistrationForm = () => { setRegistrationFormOpen(false); setEditingMember(null); };

    // Child Registration Modal
    const [isChildRegistrationFormOpen, setChildRegistrationFormOpen] = useState(false);
    const [editingChild, setEditingChild] = useState<{ child: Child, parentId: string } | null>(null);
    const openChildRegistrationForm = () => setChildRegistrationFormOpen(true);
    const closeChildRegistrationForm = () => { setChildRegistrationFormOpen(false); setEditingChild(null); };

    // User Form Modal
    const [isUserFormOpen, setUserFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<AppUser | null>(null);
    const [defaultUserGroup, setDefaultUserGroup] = useState<string|null>(null);
    const openUserForm = (group: string | undefined = undefined) => {
        if (group) setDefaultUserGroup(group);
        setUserFormOpen(true);
    };
    const closeUserForm = () => { setUserFormOpen(false); setEditingUser(null); setDefaultUserGroup(null);};

     // FollowUp Modal
    const [isFollowUpModalOpen, setFollowUpModalOpen] = useState(false);
    const [followingUpMember, setFollowingUpMember] = useState<Member | null>(null);
    const openFollowUpModal = (member: Member) => { setFollowingUpMember(member); setFollowUpModalOpen(true); };
    const closeFollowUpModal = () => { setFollowUpModalOpen(false); setFollowingUpMember(null); };

     // Announcement Form Modal
    const [isAnnouncementFormOpen, setAnnouncementFormOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
    const openAnnouncementForm = () => setAnnouncementFormOpen(true);
    const closeAnnouncementForm = () => { setAnnouncementFormOpen(false); setEditingAnnouncement(null); };

    // New Message Modal
    const [isNewMessageModalOpen, setNewMessageModalOpen] = useState(false);
    
    // Settings Modal
    const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
    const openSettingsModal = () => setSettingsModalOpen(true);
    const closeSettingsModal = () => setSettingsModalOpen(false);
    
    // Detail Views
    const [viewingMember, setViewingMember] = useState<Member | null>(null);
    const [viewingChild, setViewingChild] = useState<{ child: Child, parent: Member } | null>(null);
    
    const handleNavClick = (item: NavItem) => {
        if(hasPermission(currentUserActiveRoles, item.id)) {
            setActivePage(item.id);
            setActiveTitle(item.label);
        } else {
            console.warn(`User does not have permission for page: ${item.id}`);
            setActivePage('dashboard');
            setActiveTitle('Panneau d\'accueil');
        }
    };

    return (
        <UIContext.Provider value={{ 
            activePage, setActivePage, activeTitle, handleNavClick, 
            isSidebarOpen, setSidebarOpen,
            isRegistrationFormOpen, openRegistrationForm, closeRegistrationForm,
            isChildRegistrationFormOpen, openChildRegistrationForm, closeChildRegistrationForm,
            isUserFormOpen, openUserForm, closeUserForm, defaultUserGroup,
            isFollowUpModalOpen, openFollowUpModal, closeFollowUpModal, followingUpMember,
            isAnnouncementFormOpen, openAnnouncementForm, closeAnnouncementForm,
            isNewMessageModalOpen, setNewMessageModalOpen,
            editingMember, setEditingMember, editingChild, setEditingChild, editingUser, setEditingUser,
            editingAnnouncement, setEditingAnnouncement,
            isSettingsModalOpen, openSettingsModal, closeSettingsModal,
            viewingMember, setViewingMember,
            viewingChild, setViewingChild
        }}>
            {children}
        </UIContext.Provider>
    );
};

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) throw new Error('useUI must be used within a UIProvider');
    return context;
};

// =================================================================================================
// 4. CHURCH CONTEXT
// Gère les données spécifiques à l'église actuellement connectée.
// Il fournit des fonctions pour manipuler les données (membres, finances, etc.) de cette église.
// Il dépend de l'AuthContext et du DataContext pour savoir quelle église est active et pour mettre à jour ses données.
// Manages data specific to the currently logged-in church.
// It provides functions to manipulate the data (members, finances, etc.) of that church.
// It depends on the AuthContext and DataContext to know which church is active and to update its data.
// =================================================================================================

interface ChurchContextType {
    currentChurch: Church;
    handleSaveMember: (data: Omit<Member, 'id' | 'photoUrl'> & { id?: string; photoFile?: File }) => void;
    handleDeleteMember: (memberId: string) => void;
    handleDeleteMultipleMembers: (memberIds: string[]) => void;
    handleSaveChild: (parentId: string, newChild: Omit<Child, 'id'> & { id?: string }) => void;
    handleDeleteChild: (parentId: string, childId: string) => void;
    handleSaveTransaction: (transaction: Omit<Transaction, 'receiptGenerated'> & { id?: string }) => void;
    handleDeleteTransaction: (transactionId: string) => void;
    handleSaveUser: (user: Omit<AppUser, 'id' | 'photoUrl' | 'identifiant'> & { id?: string }) => void;
    handleDeleteUser: (userId: string) => void;
    handleAssignUsersToGroup: (userIds: string[], groupName: string) => void;
    handleSendMessage: (threadId: string, text: string) => void;
    handleCreateThreadAndSendMessage: (recipientIds: string[], subject: string, text: string) => void;
    handleMarkAsRead: (threadId: string) => void;
    handleSaveNewDocument: (data: Omit<ChurchDocument, 'id' | 'uploadedById' | 'fileUrl'> & { file?: File, fileUrl?: string }) => void;
    handleDeleteDocument: (docId: string) => void;
    handleSaveGroup: (groupData: Omit<Group, 'id' | 'memberIds' | 'activities' | 'bureau'> & { leaderId: string }) => void;
    handleUpdateGroupMembers: (groupId: string, memberIds: string[], bureau: BureauMember[]) => void;
    handleDeleteGroup: (groupId: string) => void;
    handleSaveEvent: (eventData: Omit<ChurchEvent, 'id'> & { id?: string }) => void;
    handleDeleteEvent: (eventId: string) => void;
    handleSaveProject: (data: Omit<Project, 'spent' | 'contributions'> & { id?: string }) => void;
    handleDeleteProject: (projectId: string) => void;
    handleSaveCase: (data: Omit<DeathCase, 'id'> & { id?: string }) => void;
    handleDeleteCase: (id: string) => void;
    handleSaveCotisationCampaign: (campaign: Omit<CotisationCampaign, 'id'>) => void;
    handleAddPaymentToCotisation: (pledgeId: string, payment: Omit<CotisationPayment, 'id'>) => void;
    handleAddMembersToCampaign: (campaign: CotisationCampaign, membersToAdd: { memberId: string, expectedAmount: number }[]) => void;
    handleSaveAssignment: (data: Omit<Assignment, 'status'> & { id?: string }) => void;
    handleDeleteAssignment: (id: string) => void;
    handleSaveCourse: (data: Omit<TrainingCourse, 'id' | 'enrolledMemberIds'> & { id?: string }) => void;
    handleDeleteCourse: (courseId: string) => void;
    handleAddParticipantsToCourse: (courseId: string, memberIds: string[]) => void;
    handleAttendanceChange: (courseId: string, sessionId: string, memberId: string, isPresent: boolean) => void;
    handleToggleAllMemberAttendance: (courseId: string, memberId: string) => void;
    handleSaveSettings: (settings: ChurchSettings) => void;
    handleOnboardingComplete: (data: Partial<ChurchData>) => void;
    handleSaveFollowUp: (followUpData: Omit<FollowUp, 'id' | 'followedUpById'>) => void;
    handleSaveAnnouncement: (data: { id?: string; title: string; content: string }) => void;
    handleDeleteAnnouncement: (announcementId: string) => void;
    visibleSidebarItems: NavItem[];
    unreadCount: number;
}


const ChurchContext = createContext<ChurchContextType | undefined>(undefined);

export const ChurchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { churches, updateChurchData } = useData();
    const { currentChurchId, currentUser, currentUserActiveRoles } = useAuth();
    
    const currentChurch = useMemo((): Church => {
        const church = churches.find(c => c.id === currentChurchId);
        if (!church) {
            // This case should ideally not happen if logic is correct
            // but as a fallback, return a default structure.
            return {
                id: '', name: 'Not Found', adminEmail: '', status: 'Inactif', registrationCode: '', creationDate: '', denomination: '', legalStatus: 'Non déclarée',
                data: { 
                    members: [], 
                    appUsers: [], 
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
                    onboardingCompleted: false, 
                    settings: {
                        name: 'Not Found',
                        slogan: '',
                        address: '',
                        country: '',
                        city: '',
                        neighborhood: '',
                        phone: '',
                        phone2: '',
                        email: '',
                        whatsapp: '',
                        leaderName: '',
                        currency: 'FCFA',
                        timezone: 'UTC',
                        language: 'Français',
                        logoUrl: '',
                    } 
                }
            };
        }
        return church;
    }, [churches, currentChurchId]);

    const visibleSidebarItems = useMemo(() => {
        const filterItems = (items: NavItem[]): NavItem[] => {
            return items.reduce((acc: NavItem[], item) => {
                if (item.subItems) {
                    const visibleSubItems = filterItems(item.subItems);
                    if (visibleSubItems.length > 0) {
                        acc.push({ ...item, subItems: visibleSubItems });
                    }
                } else if (hasPermission(currentUserActiveRoles, item.id)) {
                    acc.push(item);
                }
                return acc;
            }, []);
        };
        return filterItems(SIDEBAR_ITEMS);
    }, [currentUserActiveRoles]);
    
    const unreadCount = useMemo(() => {
        if (!currentUser) return 0;
        return currentChurch.data.messageThreads
            .filter(t => t.participantIds.includes(currentUser.id))
            .filter(t => t.messages.some(m => !m.isRead && m.senderId !== currentUser.id))
            .length;
    }, [currentChurch.data.messageThreads, currentUser]);
    
    // ================== DATA HANDLERS ==================
    // Each handler uses the generic `updateChurchData` from DataContext.
    // This keeps the logic clean and centralized.

    const handleSaveMember = (data: Omit<Member, 'id' | 'photoUrl'> & { id?: string; photoFile?: File }) => {
        if (!currentChurchId) return;
        updateChurchData(currentChurchId, churchData => {
            const { photoFile, ...memberData } = data;
            let photoUrl = memberData.id ? churchData.members.find(m => m.id === memberData.id)?.photoUrl || '' : '';
            
            if (photoFile) {
                photoUrl = URL.createObjectURL(photoFile);
            }
            
            if (memberData.id) { // Edit
                return { members: churchData.members.map(m => m.id === memberData.id ? { ...m, ...memberData, photoUrl } : m) };
            } else { // Create
                const newMember: Member = { ...memberData, id: `m_${Date.now()}`, photoUrl, status: 'Nouveau' };
                return { members: [...churchData.members, newMember] };
            }
        });
    };
    
    const handleDeleteMember = (memberId: string) => {
        if (!currentChurchId) return;
        updateChurchData(currentChurchId, d => ({ members: d.members.filter(m => m.id !== memberId) }));
    };
    
    const handleDeleteMultipleMembers = (memberIds: string[]) => {
        if (!currentChurchId) return;
        updateChurchData(currentChurchId, d => ({ members: d.members.filter(m => !memberIds.includes(m.id))}));
    };
    
    const handleSaveChild = (parentId: string, newChild: Omit<Child, 'id'> & { id?: string }) => {
        if (!currentChurchId) return;
        updateChurchData(currentChurchId, d => ({
            members: d.members.map(member => {
                if (member.id === parentId) {
                    const children = member.children || [];
                    if (newChild.id) { // Edit child
                        return { ...member, children: children.map(c => c.id === newChild.id ? { ...c, ...newChild } : c) };
                    } else { // Add child
                        const childWithId: Child = { ...newChild, id: `c_${Date.now()}` };
                        return { ...member, children: [...children, childWithId] };
                    }
                }
                return member;
            })
        }));
    };
    
    const handleDeleteChild = (parentId: string, childId: string) => {
        if (!currentChurchId) return;
        updateChurchData(currentChurchId, d => ({
            members: d.members.map(member => 
                member.id === parentId 
                    ? { ...member, children: (member.children || []).filter(c => c.id !== childId) }
                    : member
            )
        }));
    };

    const handleSaveTransaction = (transaction: Omit<Transaction, 'receiptGenerated'> & { id?: string }) => {
        if (!currentChurchId) return;
        updateChurchData(currentChurchId, d => {
            if (transaction.id) { // Edit
                return { transactions: d.transactions.map(t => t.id === transaction.id ? { ...t, ...transaction, receiptGenerated: t.receiptGenerated } : t) };
            } else { // Create
                const newTransaction: Transaction = { ...transaction, id: `t_${Date.now()}`, receiptGenerated: false };
                return { transactions: [...d.transactions, newTransaction] };
            }
        });
    };
    
    const handleDeleteTransaction = (transactionId: string) => {
        if (!currentChurchId) return;
        updateChurchData(currentChurchId, d => ({ transactions: d.transactions.filter(t => t.id !== transactionId) }));
    };
    
    const handleSaveUser = (user: Omit<AppUser, 'id'|'photoUrl'|'identifiant'> & { id?: string }) => {
        if (!currentChurchId) return;
        updateChurchData(currentChurchId, d => {
            if (user.id) { // Edit
                 return { appUsers: d.appUsers.map(u => u.id === user.id ? { ...u, ...user } : u) };
            } else { // Create
                const safeChurchName = d.settings.name.substring(0, 5).toUpperCase().replace(/\s/g, '');
                const newIdentifiant = `${safeChurchName}-${Math.floor(1000 + Math.random() * 9000)}`;
                const newUser: AppUser = {
                    ...user,
                    id: `u_${Date.now()}`,
                    photoUrl: `https://i.pravatar.cc/150?u=${Date.now()}`,
                    identifiant: newIdentifiant,
                    password: 'grace',
                };
                 return { appUsers: [...d.appUsers, newUser] };
            }
        });
    };
    
    const handleDeleteUser = (userId: string) => {
        if (!currentChurchId || !currentUser || userId === currentUser.id) return;
        updateChurchData(currentChurchId, d => ({ appUsers: d.appUsers.filter(u => u.id !== userId) }));
    };
    
    const handleAssignUsersToGroup = (userIds: string[], groupName: string) => {
        if (!currentChurchId) return;
        updateChurchData(currentChurchId, d => ({
            appUsers: d.appUsers.map(u => userIds.includes(u.id) ? { ...u, groupeAdministratif: groupName } : u)
        }));
    };

    const handleSendMessage = (threadId: string, text: string) => {
        if (!currentChurchId || !currentUser) return;
        const newMessage: InternalMessage = {
            id: `msg_${Date.now()}`,
            senderId: currentUser.id,
            timestamp: new Date().toISOString(),
            text,
            isRead: true
        };
        updateChurchData(currentChurchId, d => ({
            messageThreads: d.messageThreads.map(t => t.id === threadId ? { ...t, messages: [...t.messages, newMessage] } : t)
        }));
    };
    
    const handleCreateThreadAndSendMessage = (recipientIds: string[], subject: string, text: string) => {
        if (!currentChurchId || !currentUser) return;
        const newThread: MessageThread = {
            id: `th_${Date.now()}`,
            participantIds: [currentUser.id, ...recipientIds],
            subject,
            messages: [{ id: `msg_${Date.now()}`, senderId: currentUser.id, timestamp: new Date().toISOString(), text, isRead: true }]
        };
        updateChurchData(currentChurchId, d => ({ messageThreads: [...d.messageThreads, newThread] }));
    };

    const handleMarkAsRead = (threadId: string) => {
        if (!currentChurchId || !currentUser) return;
        updateChurchData(currentChurchId, d => ({
            messageThreads: d.messageThreads.map(t => 
                t.id === threadId 
                ? { ...t, messages: t.messages.map(m => m.senderId !== currentUser.id ? { ...m, isRead: true } : m) } 
                : t
            )
        }));
    };

    const handleSaveNewDocument = (data: Omit<ChurchDocument, 'id' | 'uploadedById' | 'fileUrl'> & { file?: File, fileUrl?: string }) => {
        if (!currentChurchId || !currentUser) return;
        
        let fileUrl = data.fileUrl || '';
        if(data.file) {
            fileUrl = URL.createObjectURL(data.file);
        }

        const newDoc: ChurchDocument = {
            ...data,
            id: `doc_${Date.now()}`,
            uploadedById: currentUser.id,
            fileUrl: fileUrl,
        };

        updateChurchData(currentChurchId, d => ({ documents: [...(d.documents || []), newDoc] }));
    };
    
    const handleDeleteDocument = (docId: string) => {
        if (!currentChurchId) return;
        updateChurchData(currentChurchId, d => ({ documents: d.documents.filter(doc => doc.id !== docId) }));
    };

    const handleSaveGroup = (groupData: Omit<Group, 'id' | 'memberIds' | 'activities' | 'bureau'> & { leaderId: string }) => {
        if (!currentChurchId) return;
        const newGroup: Group = {
            ...groupData,
            id: `g_${Date.now()}`,
            memberIds: [groupData.leaderId], // Leader is automatically a member
            activities: [],
            bureau: [],
        };
        updateChurchData(currentChurchId, d => ({ groups: [...d.groups, newGroup] }));
    };
    
    const handleUpdateGroupMembers = (groupId: string, memberIds: string[], bureau: BureauMember[]) => {
        if (!currentChurchId) return;
        updateChurchData(currentChurchId, d => ({
            groups: d.groups.map(g => g.id === groupId ? { ...g, memberIds, bureau } : g)
        }));
    };
    
    const handleDeleteGroup = (groupId: string) => {
        if (!currentChurchId) return;
        updateChurchData(currentChurchId, d => ({ groups: d.groups.filter(g => g.id !== groupId) }));
    };

    const handleSaveEvent = (eventData: Omit<ChurchEvent, 'id'> & { id?: string }) => {
        if (!currentChurchId) return;
        updateChurchData(currentChurchId, d => {
            if (eventData.id) { // Edit
                return { events: d.events.map(e => e.id === eventData.id ? { ...e, ...eventData } : e) };
            } else { // Create
                const newEvent: ChurchEvent = { ...eventData, id: `evt_${Date.now()}`, status: 'À venir' } as ChurchEvent;
                return { events: [...d.events, newEvent] };
            }
        });
    };
    
    const handleDeleteEvent = (eventId: string) => {
        if (!currentChurchId) return;
        updateChurchData(currentChurchId, d => ({ events: d.events.filter(e => e.id !== eventId) }));
    };

    const handleSaveProject = (data: Omit<Project, 'spent' | 'contributions'> & { id?: string }) => {
        if (!currentChurchId) return;
        updateChurchData(currentChurchId, d => {
            if (data.id) { // Edit
                return { projects: d.projects.map(p => p.id === data.id ? { ...p, ...data } : p) };
            } else { // Create
                const newProject: Project = { ...data, id: `p_${Date.now()}`, spent: 0, contributions: [] };
                return { projects: [...d.projects, newProject] };
            }
        });
    };
    
    const handleDeleteProject = (projectId: string) => {
        if (!currentChurchId) return;
        updateChurchData(currentChurchId, d => ({ projects: d.projects.filter(p => p.id !== projectId) }));
    };

    const handleSaveCase = (data: Omit<DeathCase, 'id'> & { id?: string }) => {
         if (!currentChurchId) return;
         updateChurchData(currentChurchId, d => {
             if (data.id) { // Edit
                 return { deathCases: d.deathCases.map(dc => dc.id === data.id ? { ...dc, ...data } : dc) };
             } else { // Create
                 const newCase: DeathCase = { ...data, id: `dc_${Date.now()}`, status: 'En cours' };
                 return { deathCases: [...d.deathCases, newCase] };
             }
         });
    };
    
    const handleDeleteCase = (id: string) => {
        if (!currentChurchId) return;
        updateChurchData(currentChurchId, d => ({ deathCases: d.deathCases.filter(dc => dc.id !== id) }));
    };

    const handleSaveCotisationCampaign = (campaign: Omit<CotisationCampaign, 'id'>) => {
        if (!currentChurchId) return;
        const newCampaign: CotisationCampaign = { ...campaign, id: `camp_${Date.now()}` };
        
        updateChurchData(currentChurchId, d => {
            const updatedCampaigns = [...d.cotisationCampaigns, newCampaign];
            let newPledges: MemberCotisation[] = [];

            if (newCampaign.targetScope === 'Tous les membres' && !newCampaign.isAmountFree) {
                newPledges = d.members.map(member => ({
                    id: `pledge_${newCampaign.id}_${member.id}`,
                    campaignId: newCampaign.id,
                    memberId: member.id,
                    expectedAmount: newCampaign.defaultAmount,
                    dueDate: newCampaign.endDate || new Date().toISOString().split('T')[0],
                    payments: [],
                    status: 'Non payée'
                }));
            }
            
            return {
                cotisationCampaigns: updatedCampaigns,
                memberCotisations: [...d.memberCotisations, ...newPledges]
            };
        });
    };
    
    const handleAddPaymentToCotisation = (pledgeId: string, payment: Omit<CotisationPayment, 'id'>) => {
        if (!currentChurchId) return;
        updateChurchData(currentChurchId, d => {
            return {
                memberCotisations: d.memberCotisations.map(pledge => {
                    if (pledge.id === pledgeId) {
                        const newPayment: CotisationPayment = { ...payment, id: `pay_${Date.now()}` };
                        const updatedPayments = [...pledge.payments, newPayment];
                        const totalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
                        let newStatus: MemberCotisation['status'] = 'Partiel';
                        if (totalPaid >= pledge.expectedAmount) {
                            newStatus = 'Payée';
                        }
                        return { ...pledge, payments: updatedPayments, status: newStatus };
                    }
                    return pledge;
                })
            }
        });
    };

    const handleAddMembersToCampaign = (campaign: CotisationCampaign, membersToAdd: { memberId: string, expectedAmount: number }[]) => {
        if (!currentChurchId) return;
         updateChurchData(currentChurchId, d => {
            const newPledges: MemberCotisation[] = membersToAdd.map(m => ({
                id: `pledge_${campaign.id}_${m.memberId}`,
                campaignId: campaign.id,
                memberId: m.memberId,
                expectedAmount: m.expectedAmount,
                dueDate: campaign.endDate || new Date().toISOString().split('T')[0],
                payments: [],
                status: 'Non payée'
            }));
            return { memberCotisations: [...d.memberCotisations, ...newPledges] };
        });
    };
    
    const handleSaveAssignment = (data: Omit<Assignment, 'status'> & { id?: string }) => {
        if (!currentChurchId) return;
        updateChurchData(currentChurchId, d => {
            const status: Assignment['status'] = data.endDate && new Date(data.endDate) < new Date() ? 'Terminé' : 'Actif';
            if (data.id) { // Edit
                return { assignments: d.assignments.map(a => a.id === data.id ? { ...a, ...data, status } : a) };
            } else { // Create
                const newAssignment: Assignment = { ...data, id: `as_${Date.now()}`, status };
                return { assignments: [...(d.assignments || []), newAssignment] };
            }
        });
    };
    
    const handleDeleteAssignment = (id: string) => {
        if (!currentChurchId) return;
        updateChurchData(currentChurchId, d => ({ assignments: (d.assignments || []).filter(a => a.id !== id) }));
    };

    const handleSaveCourse = (data: Omit<TrainingCourse, 'id' | 'enrolledMemberIds'> & { id?: string }) => {
         if (!currentChurchId) return;
         updateChurchData(currentChurchId, d => {
             if (data.id) { // Edit
                 return { trainingCourses: d.trainingCourses.map(c => c.id === data.id ? { ...c, ...data } as TrainingCourse : c) };
             } else { // Create
                 const newCourse: TrainingCourse = { ...data, id: `c_${Date.now()}`, enrolledMemberIds: [] } as TrainingCourse;
                 return { trainingCourses: [...(d.trainingCourses || []), newCourse] };
             }
         });
    };

    const handleDeleteCourse = (courseId: string) => {
        if (!currentChurchId) return;
        updateChurchData(currentChurchId, d => ({ trainingCourses: (d.trainingCourses || []).filter(c => c.id !== courseId)}));
    };
    
    const handleAddParticipantsToCourse = (courseId: string, memberIds: string[]) => {
        if (!currentChurchId) return;
        updateChurchData(currentChurchId, d => ({
            trainingCourses: d.trainingCourses.map(c => c.id === courseId ? { ...c, enrolledMemberIds: [...new Set([...c.enrolledMemberIds, ...memberIds])] } : c)
        }));
    };
    
    const handleAttendanceChange = (courseId: string, sessionId: string, memberId: string, isPresent: boolean) => {
        if (!currentChurchId) return;
        updateChurchData(currentChurchId, d => ({
            trainingCourses: d.trainingCourses.map(c => {
                if (c.id === courseId) {
                    return {
                        ...c,
                        sessions: c.sessions.map(s => {
                            if (s.id === sessionId) {
                                const newSet = new Set(s.presentMemberIds);
                                if (isPresent) newSet.add(memberId);
                                else newSet.delete(memberId);
                                return { ...s, presentMemberIds: newSet };
                            }
                            return s;
                        })
                    };
                }
                return c;
            })
        }));
    };
    
    const handleToggleAllMemberAttendance = (courseId: string, memberId: string) => {
        if (!currentChurchId) return;
        updateChurchData(currentChurchId, d => {
            const course = d.trainingCourses.find(c => c.id === courseId);
            if (!course) return d;
            
            const isFullyPresent = course.sessions.every(s => s.presentMemberIds.has(memberId));
            
            return {
                trainingCourses: d.trainingCourses.map(c => {
                    if (c.id === courseId) {
                        return {
                            ...c,
                            sessions: c.sessions.map(s => {
                                const newSet = new Set(s.presentMemberIds);
                                if (isFullyPresent) newSet.delete(memberId);
                                else newSet.add(memberId);
                                return { ...s, presentMemberIds: newSet };
                            })
                        };
                    }
                    return c;
                })
            };
        });
    };

    const handleSaveSettings = (settings: ChurchSettings) => {
        if (!currentChurchId) return;
        updateChurchData(currentChurchId, () => ({ settings }));
    };

    const handleOnboardingComplete = (data: Partial<ChurchData>) => {
        if (!currentChurchId) return;
        updateChurchData(currentChurchId, (d) => ({
            ...d,
            ...data,
            onboardingCompleted: true,
        }));
    };

    const handleSaveFollowUp = (followUpData: Omit<FollowUp, 'id' | 'followedUpById'>) => {
        if (!currentChurchId || !currentUser) return;
        const newFollowUp: FollowUp = {
            ...followUpData,
            id: `fu_${Date.now()}`,
            followedUpById: currentUser.id
        };
        updateChurchData(currentChurchId, d => ({
            followUps: [...(d.followUps || []), newFollowUp],
            members: d.members.map(m => m.id === followUpData.memberId ? {...m, lastFollowUpDate: newFollowUp.date, status: 'À suivre'} : m)
        }));
    };

    const handleSaveAnnouncement = (data: { id?: string; title: string; content: string }) => {
        if (!currentChurchId || !currentUser) return;
        updateChurchData(currentChurchId, d => {
            if(data.id) { // Edit
                return { announcements: (d.announcements || []).map(a => a.id === data.id ? {...a, ...data} : a) };
            } else { // Create
                const newAnnouncement: Announcement = {
                    ...data,
                    id: `an_${Date.now()}`,
                    authorId: currentUser.id,
                    createdAt: new Date().toISOString(),
                };
                return { announcements: [newAnnouncement, ...(d.announcements || [])]};
            }
        });
    };

    const handleDeleteAnnouncement = (announcementId: string) => {
        if (!currentChurchId) return;
        updateChurchData(currentChurchId, d => ({ announcements: (d.announcements || []).filter(a => a.id !== announcementId) }));
    };

    const value: ChurchContextType = {
        currentChurch,
        handleSaveMember,
        handleDeleteMember,
        handleDeleteMultipleMembers,
        handleSaveChild,
        handleDeleteChild,
        handleSaveTransaction,
        handleDeleteTransaction,
        handleSaveUser,
        handleDeleteUser,
        handleAssignUsersToGroup,
        handleSendMessage,
        handleCreateThreadAndSendMessage,
        handleMarkAsRead,
        handleSaveNewDocument,
        handleDeleteDocument,
        handleSaveGroup,
        handleUpdateGroupMembers,
        handleDeleteGroup,
        handleSaveEvent,
        handleDeleteEvent,
        handleSaveProject,
        handleDeleteProject,
        handleSaveCase,
        handleDeleteCase,
        handleSaveCotisationCampaign,
        handleAddPaymentToCotisation,
        handleAddMembersToCampaign,
        handleSaveAssignment,
        handleDeleteAssignment,
        handleSaveCourse,
        handleDeleteCourse,
        handleAddParticipantsToCourse,
        handleAttendanceChange,
        handleToggleAllMemberAttendance,
        handleSaveSettings,
        handleOnboardingComplete,
        handleSaveFollowUp,
        handleSaveAnnouncement,
        handleDeleteAnnouncement,
        visibleSidebarItems,
        unreadCount,
    };

    return (
        <ChurchContext.Provider value={value}>
            {children}
        </ChurchContext.Provider>
    );
};

export const useChurch = () => {
    const context = useContext(ChurchContext);
    if (!context) throw new Error('useChurch must be used within a ChurchProvider');
    return context;
};