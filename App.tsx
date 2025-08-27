
import React from 'react';
import { AuthProvider, DataProvider, UIProvider, ChurchProvider, useAuth } from './contexts';

import { LoginPage } from './components/LoginPage';
import ChurchRegistrationPage from './components/ChurchRegistrationPage';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import SuperAdminProfilePage from './components/SuperAdminProfilePage';
import OnboardingWizard from './components/OnboardingWizard';
import RegistrationSuccessPage from './components/RegistrationSuccessPage';
import MainLayout from './components/MainLayout';
import AwaitingActivationPage from './components/AwaitingActivationPage';
import ForcePasswordChange from './components/ForcePasswordChange';

/**
 * @file App.tsx
 * @description Composant racine de l'application. Il agit comme un routeur en fonction de l'état de la session
 * de l'utilisateur (déconnecté, connecté, en cours d'inscription, etc.) et encapsule l'application
 * avec les fournisseurs de contexte nécessaires.
 *
 * Root component of the application. It acts as a router based on the user's session state
 * (logged out, logged in, registering, etc.) and wraps the application with the necessary
 * context providers.
 */
const AppContent: React.FC = () => {
    const { 
      sessionState, 
      setSessionState,
      registrationSuccessData,
      setRegistrationSuccessData,
      isSuperAdminProfileOpen,
      handleLogout
    } = useAuth();
    
    if (registrationSuccessData) {
        const handleSuccessClose = () => {
            setRegistrationSuccessData(null);
            if (sessionState === 'loggedInChurch') {
                handleLogout();
            } else {
                setSessionState('loggedOut');
            }
        };
        return <RegistrationSuccessPage
            identifiant={registrationSuccessData.identifiant}
            name={registrationSuccessData.name}
            onClose={handleSuccessClose}
        />;
    }

    switch (sessionState) {
        case 'loggedOut':
            return <LoginPage />;
        case 'registering':
            return <ChurchRegistrationPage onBackToLogin={() => setSessionState('loggedOut')} />;
        case 'awaitingActivation':
            return <AwaitingActivationPage />;
        case 'activatingDirectly':
            return <AwaitingActivationPage />;
        case 'loggedInSuperAdmin':
            return (
                <UIProvider>
                    <SuperAdminDashboard />
                    {isSuperAdminProfileOpen && <SuperAdminProfilePage />}
                </UIProvider>
            );
        case 'forcePasswordChange':
            return <ForcePasswordChange />;
        case 'onboarding':
            return (
                <UIProvider>
                    <ChurchProvider>
                        <OnboardingWizard />
                    </ChurchProvider>
                </UIProvider>
            );
        case 'loggedInChurch':
            return (
                <UIProvider>
                    <ChurchProvider>
                        <MainLayout />
                    </ChurchProvider>
                </UIProvider>
            );
        default:
            return <div>Chargement...</div>;
    }
};

const App: React.FC = () => {
    return (
        <DataProvider>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </DataProvider>
    );
};

export default App;