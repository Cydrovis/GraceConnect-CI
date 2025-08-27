import React, { useState, useRef, useEffect } from 'react';
import { HomeIcon, ChevronRightIcon, Cog6ToothIcon, ArrowLeftOnRectangleIcon, ChevronDownIcon, SunIcon, MoonIcon, UserCircleIcon, BellIcon, ChatBubbleLeftRightIcon } from './icons/HeroIcons';
import { User, NavItem, PlatformSettings } from '../types';
import LogoutConfirmationModal from './LogoutConfirmationModal';
import { hasPermission } from '../constants';
import { useUI, useAuth, useData } from '../contexts';

interface HeaderProps {
  unreadCount: number;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ unreadCount, onMenuClick }) => {
  const { activeTitle: title, handleNavClick, openSettingsModal } = useUI();
  const { userForHeaderAndSidebar: user, handleLogout } = useAuth();
  const { platformSettings } = useData();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    openSettingsModal();
    setDropdownOpen(false);
  };

   const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    handleNavClick({ id: 'profile', label: 'Mon Profil', icon: <UserCircleIcon /> });
    setDropdownOpen(false);
  };
  
  const handleLogoutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setDropdownOpen(false);
    setLogoutModalOpen(true);
  };
  
  const handleConfirmLogout = () => {
    handleLogout();
    setLogoutModalOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);
  
  if (!user) return null;

  return (
    <>
      <header className="bg-theme-card shadow-sm z-10 border-b border-theme-border">
        <div className="flex items-center justify-between h-20 px-4 md:px-6">
           <div className="flex items-center gap-2">
            <button onClick={onMenuClick} className="md:hidden p-2 text-theme-text-muted">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
            </button>
            <div className="hidden sm:block">
              <h2 className="text-2xl font-bold text-theme-text-base">Bienvenue sur {platformSettings.appName} (édition 2025)</h2>
              <div className="flex items-center text-sm text-theme-text-muted mt-1 gap-1.5">
                <HomeIcon className="w-4 h-4" />
                <span>Vous êtes ici :</span>
                <ChevronRightIcon className="w-4 h-4" />
                <span className="font-semibold text-theme-accent">{title}</span>
              </div>
            </div>
             <div className="sm:hidden">
                <h2 className="text-lg font-bold text-theme-text-base">{title}</h2>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
              <button 
                  onClick={() => handleNavClick({ id: 'internal-messaging', label: 'Messagerie Interne', icon: <ChatBubbleLeftRightIcon />})} 
                  className="relative p-2 rounded-full text-theme-text-muted hover:bg-theme-bg"
                  aria-label="Ouvrir la messagerie"
                  data-tooltip="Messagerie"
              >
                  <BellIcon className="w-6 h-6" />
                  {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center ring-2 ring-theme-card">
                          {unreadCount}
                      </span>
                  )}
              </button>
            <div className="relative" ref={dropdownRef}>
                <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-2 rounded-full p-1 sm:p-2 hover:bg-theme-bg transition-colors">
                  <div className="text-right hidden sm:block">
                      <p className="font-semibold text-theme-text-base">{user.name}</p>
                  </div>
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="User Avatar" className="w-10 h-10 rounded-full"/>
                  ) : (
                    <UserCircleIcon className="w-10 h-10 text-theme-text-muted"/>
                  )}
                  <ChevronDownIcon className="w-5 h-5 text-theme-text-muted hidden sm:block"/>
                </button>
                {dropdownOpen && (
                  <div className="dropdown-content absolute right-0 mt-2 w-56 bg-theme-card rounded-md shadow-lg py-1 z-20 ring-1 ring-black ring-opacity-5">
                    <a href="#" onClick={handleProfileClick} className="flex items-center gap-3 px-4 py-2 text-sm text-theme-text-base hover:bg-theme-bg transition-colors">
                      <UserCircleIcon className="w-5 h-5 text-theme-text-muted" />
                      Mon Profil
                    </a>
                    {hasPermission(user.roles, 'settings') && (
                      <a href="#" onClick={handleSettingsClick} className="flex items-center gap-3 px-4 py-2 text-sm text-theme-text-base hover:bg-theme-bg transition-colors">
                        <Cog6ToothIcon className="w-5 h-5 text-theme-text-muted" />
                        Paramétrages
                      </a>
                    )}
                    <a href="#" onClick={handleLogoutClick} className="flex items-center gap-3 px-4 py-2 text-sm text-theme-text-base hover:bg-theme-bg transition-colors">
                      <ArrowLeftOnRectangleIcon className="w-5 h-5 text-theme-text-muted" />
                      Déconnexion
                    </a>
                  </div>
                )}
            </div>
          </div>
        </div>
      </header>
      <LogoutConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
};

export default Header;