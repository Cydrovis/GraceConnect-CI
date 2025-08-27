import React from 'react';
import { useAuth, useUI, useChurch } from '../contexts';

import Sidebar from './Sidebar';
import Header from './Header';
import Dashboard from './Dashboard';
import Members from './Members';
import Finances from './Finances';
import Events from './Events';
import Groups from './Groups';
import Communications from './Communications';
import Reports from './Reports';
import MemberRegistrationForm from './MemberRegistrationForm';
import ChildRegistrationForm from './ChildRegistrationForm';
import Projects from './Projects';
import Personnel from './Personnel';
import Assignments from './Assignments';
import Education from './Education';
import Documents from './Documents';
import Settings from './Settings';
import MemberDetailView from './MemberDetailView';
import ChildDetailView from './ChildDetailView';
import Cotisations from './Cotisations';
import DeathCases from './DeathCases';
import ChildrenManagement from './ChildrenManagement';
import UserFormModal from './UserFormModal';
import ActivityLog from './ActivityLog';
import ProfilePage from './ProfilePage';
import InternalMessaging from './InternalMessaging';
import MemberFollowUpModal from './MemberFollowUpModal';
import AnnouncementFormModal from './AnnouncementFormModal';
import NewMessageModal from './NewMessageModal';
import { NavItem, Member, AppUser, FollowUp, Announcement, ChurchSettings, Child } from '../types';
import { hasPermission, SIDEBAR_ITEMS } from '../constants';
import { ClipboardDocumentListIcon, ExclamationTriangleIcon, UserCircleIcon, ChatBubbleLeftRightIcon, HomeIcon } from './icons/HeroIcons';

const findNavItemRecursive = (items: NavItem[], id: string): NavItem | null => {
    for (const item of items) {
        if (item.id === id) return item;
        if (item.subItems) {
            const found = findNavItemRecursive(item.subItems, id);
            if (found) return found;
        }
    }
    return null;
};

/**
 * @file MainLayout.tsx
 * @description Ce composant est la structure principale de l'application une fois qu'un utilisateur est connecté.
 * Il assemble la Sidebar, le Header et le contenu principal de la page active.
 * Il gère également l'ouverture et la fermeture de toutes les modales de l'application.
 *
 * This component is the main structure of the application once a user is logged in.
 * It assembles the Sidebar, Header, and the main content of the active page.
 * It also manages the opening and closing of all application modals.
 */
const MainLayout: React.FC = () => {
    const { currentUser, userForHeaderAndSidebar, currentUserActiveRoles, handleSaveProfile, handleChangePassword } = useAuth();
    const { 
        activePage, handleNavClick, isSidebarOpen, setSidebarOpen,
        isRegistrationFormOpen, openRegistrationForm, closeRegistrationForm,
        isChildRegistrationFormOpen, openChildRegistrationForm, closeChildRegistrationForm,
        isUserFormOpen, openUserForm, closeUserForm,
        isFollowUpModalOpen, closeFollowUpModal,
        isAnnouncementFormOpen, openAnnouncementForm, closeAnnouncementForm,
        isNewMessageModalOpen, setNewMessageModalOpen,
        isSettingsModalOpen, closeSettingsModal,
        editingMember, setEditingMember, editingChild, setEditingChild, editingUser, setEditingUser,
        defaultUserGroup, followingUpMember, editingAnnouncement, setEditingAnnouncement,
        viewingMember, setViewingMember, viewingChild, setViewingChild
    } = useUI();
    const { 
        currentChurch, unreadCount,
        handleSaveMember, handleDeleteMember, handleDeleteMultipleMembers,
        handleSaveChild, handleDeleteChild, handleSaveTransaction, handleDeleteTransaction,
        handleSaveUser, handleDeleteUser, handleAssignUsersToGroup,
        handleSendMessage, handleCreateThreadAndSendMessage,
        handleSaveAnnouncement, handleDeleteAnnouncement, handleSaveNewDocument,
        handleDeleteDocument, handleSaveGroup, handleUpdateGroupMembers,
        handleDeleteGroup, handleSaveEvent, handleDeleteEvent, handleSaveProject,
        handleDeleteProject, handleSaveCase, handleDeleteCase,
        handleSaveCotisationCampaign, handleAddPaymentToCotisation, handleAddMembersToCampaign,
        handleSaveAssignment, handleDeleteAssignment, handleSaveCourse,
        handleDeleteCourse, handleAddParticipantsToCourse, handleAttendanceChange,
        handleToggleAllMemberAttendance, handleSaveSettings, handleSaveFollowUp
    } = useChurch();

    if (!currentChurch || !currentUser || !userForHeaderAndSidebar) return <div>Erreur de chargement...</div>;

    const { members, appUsers, groups, deathCases, cotisationCampaigns, memberCotisations, projects, transactions, events, settings, followUps, announcements, assignments, trainingCourses, spiritualPathways } = currentChurch.data;

    const handleDashboardNav = (id: string) => {
        const item = findNavItemRecursive(SIDEBAR_ITEMS, id) || 
                     { id, label: id.charAt(0).toUpperCase() + id.slice(1), icon: <></> }; // Generic fallback
        if (item) {
            handleNavClick(item);
        }
    };
    
    // Wrapper functions to close modals on save
    const handleSaveAndCloseMemberForm = (data: Parameters<typeof handleSaveMember>[0]) => {
        handleSaveMember(data);
        closeRegistrationForm();
    };

    const handleSaveAndCloseChildForm = (parentId: string, childData: Omit<Child, 'id'> & { id?: string }) => {
        handleSaveChild(parentId, childData);
        closeChildRegistrationForm();
    };

    const handleSaveAndCloseUserForm = (user: Parameters<typeof handleSaveUser>[0]) => {
        handleSaveUser(user);
        closeUserForm();
    };

    const handleSaveAndCloseFollowUpModal = (followUpData: Parameters<typeof handleSaveFollowUp>[0]) => {
        handleSaveFollowUp(followUpData);
        closeFollowUpModal();
    };

    const handleSaveAndCloseAnnouncementForm = (data: Parameters<typeof handleSaveAnnouncement>[0]) => {
        handleSaveAnnouncement(data);
        closeAnnouncementForm();
    };
    
    const handleSaveAndCloseSettings = (newSettings: ChurchSettings) => {
        handleSaveSettings(newSettings);
        closeSettingsModal();
        alert('Paramètres enregistrés avec succès !');
    };

    const handleSendAndCloseNewMessageModal = (...args: Parameters<typeof handleCreateThreadAndSendMessage>) => {
        handleCreateThreadAndSendMessage(...args);
        setNewMessageModalOpen(false);
    };


    const handleCloseMemberView = () => setViewingMember(null);
    const handleCloseChildView = () => setViewingChild(null);

    const renderContent = () => {
      if (!hasPermission(currentUserActiveRoles, activePage)) {
        return (
            <div className="text-center p-8 bg-white rounded-lg shadow-md">
                <ExclamationTriangleIcon className="w-16 h-16 mx-auto text-yellow-400" />
                <h2 className="mt-4 text-2xl font-bold text-red-600">Accès Refusé</h2>
                <p className="mt-2 text-gray-600">Vous n'avez pas les permissions nécessaires pour voir cette page.</p>
            </div>
        );
      }
      switch (activePage) {
        case 'dashboard': return <Dashboard onNavClick={(item) => handleNavClick(item)} />;
        case 'personnel': return <Personnel users={appUsers} onAddUser={openUserForm} onEditUser={(user) => {setEditingUser(user); openUserForm();}} onDeleteUser={handleDeleteUser} onAssignUsers={handleAssignUsersToGroup} />;
        case 'members-list': return <Members />;
        case 'children-management': return <ChildrenManagement members={members} onViewMember={setViewingMember} onOpenChildRegistrationForm={openChildRegistrationForm} onViewChild={(child, parent) => setViewingChild({ child, parent })} onEditChild={(child, parentId) => {setEditingChild({child, parentId}); openChildRegistrationForm();}} />;
        case 'groups': return <Groups groups={groups} members={members} onSaveGroup={handleSaveGroup} onUpdateGroupMembers={handleUpdateGroupMembers} onDeleteGroup={handleDeleteGroup} />;
        case 'events': return <Events events={events} members={members} groups={groups} onSaveEvent={handleSaveEvent} onDeleteEvent={handleDeleteEvent} />;
        case 'finances-overview': return <Finances />;
        case 'cotisations': return <Cotisations campaigns={cotisationCampaigns} memberCotisations={memberCotisations} members={members} groups={groups} deathCases={deathCases} projects={projects} onSaveCampaign={handleSaveCotisationCampaign} onAddPayment={handleAddPaymentToCotisation} onAddMembersToCampaign={handleAddMembersToCampaign} />;
        case 'cas-deces': return <DeathCases deathCases={deathCases} members={members} onSaveCase={handleSaveCase} onDeleteCase={handleDeleteCase} onSaveCampaign={handleSaveCotisationCampaign} />;
        case 'projects': return <Projects projects={projects} members={members} onSaveProject={handleSaveProject} onDeleteProject={handleDeleteProject} onSaveCampaign={handleSaveCotisationCampaign} />;
        case 'assignments': return <Assignments assignments={assignments || []} members={members} groups={groups} onViewMember={setViewingMember} onSaveAssignment={handleSaveAssignment} onDeleteAssignment={handleDeleteAssignment} />;
        case 'education': return <Education courses={trainingCourses || []} pathways={spiritualPathways || []} members={members} onViewMember={setViewingMember} onSaveCourse={handleSaveCourse} onDeleteCourse={handleDeleteCourse} onAddParticipantsToCourse={handleAddParticipantsToCourse} onAttendanceChange={handleAttendanceChange} onToggleAllMemberAttendance={handleToggleAllMemberAttendance} />;
        case 'announcements': return <Communications announcements={announcements || []} appUsers={appUsers} currentUser={currentUser} onOpenForm={openAnnouncementForm} onEdit={(ann) => {setEditingAnnouncement(ann); openAnnouncementForm()}} onDelete={handleDeleteAnnouncement} />;
        case 'internal-messaging': return <InternalMessaging />;
        case 'documents': return <Documents documents={currentChurch.data.documents || []} members={members} appUsers={appUsers} churchSettings={settings} onSaveDocument={handleSaveNewDocument} onDeleteDocument={handleDeleteDocument} />;
        case 'reports': return <Reports members={members} transactions={transactions} events={events} projects={projects} cotisationCampaigns={cotisationCampaigns} memberCotisations={memberCotisations} groups={groups} churchSettings={settings} deathCases={deathCases} />;
        case 'settings': return <Settings isOpen={isSettingsModalOpen} onClose={closeSettingsModal} settings={settings} onSaveSettings={handleSaveAndCloseSettings} expirationDate={currentChurch.expirationDate} />;
        case 'profile': return <ProfilePage user={currentUser} onSave={(u) => {handleSaveProfile(u); handleNavClick({id:'dashboard', label:'', icon:<></>})}} onChangePassword={handleChangePassword} onClose={() => handleNavClick({id: 'dashboard', label: 'Panneau d\'accueil', icon: <HomeIcon />})} />;
        case 'activity-log': return <ActivityLog />;
        default: return <Dashboard onNavClick={(item) => handleNavClick(item)} />;
      }
    };

    return (
        <div className="flex h-screen bg-church-bg font-sans relative">
            {isSidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" onClick={() => setSidebarOpen(false)}></div>}
            <Sidebar churchLogoUrl={settings.logoUrl} isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header unreadCount={unreadCount} onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    {viewingMember && <MemberDetailView member={viewingMember} onClose={handleCloseMemberView} onEdit={(member) => {handleCloseMemberView(); setEditingMember(member); openRegistrationForm();}} onDelete={handleDeleteMember} />}
                    {viewingChild && <ChildDetailView child={viewingChild.child} parent={viewingChild.parent} onClose={handleCloseChildView} onViewParent={(parent) => {handleCloseChildView(); setViewingMember(parent);}} />}
                    {isRegistrationFormOpen && <MemberRegistrationForm isOpen={isRegistrationFormOpen} onClose={closeRegistrationForm} onSave={handleSaveAndCloseMemberForm} memberToEdit={editingMember} />}
                    {isChildRegistrationFormOpen && <ChildRegistrationForm isOpen={isChildRegistrationFormOpen} onClose={closeChildRegistrationForm} onSave={handleSaveAndCloseChildForm} members={members} childToEdit={editingChild} />}
                    {isUserFormOpen && <UserFormModal isOpen={isUserFormOpen} onClose={closeUserForm} onSave={handleSaveAndCloseUserForm} userToEdit={editingUser} groups={groups} defaultGroup={defaultUserGroup} appUsers={appUsers} />}
                    {isFollowUpModalOpen && <MemberFollowUpModal isOpen={isFollowUpModalOpen} onClose={closeFollowUpModal} onSave={handleSaveAndCloseFollowUpModal} member={followingUpMember} currentUser={currentUser} followUps={followUps || []} appUsers={appUsers} />}
                    {isAnnouncementFormOpen && <AnnouncementFormModal isOpen={isAnnouncementFormOpen} onClose={closeAnnouncementForm} onSave={handleSaveAndCloseAnnouncementForm} announcementToEdit={editingAnnouncement} />}
                    {isNewMessageModalOpen && <NewMessageModal isOpen={isNewMessageModalOpen} onClose={() => setNewMessageModalOpen(false)} onSend={handleSendAndCloseNewMessageModal} currentUser={currentUser} appUsers={appUsers} />}
                    {isSettingsModalOpen && <Settings isOpen={isSettingsModalOpen} onClose={closeSettingsModal} settings={settings} onSaveSettings={handleSaveAndCloseSettings} expirationDate={currentChurch.expirationDate} />}
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;