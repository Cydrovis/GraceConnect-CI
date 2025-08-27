import React, { useState } from 'react';
import { NavItem } from '../types';
import { ChevronDownIcon, XMarkIcon, BuildingOffice2Icon } from './icons/HeroIcons';
import { useUI, useAuth, useData, useChurch } from '../contexts';

interface SidebarProps {
  churchLogoUrl?: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ churchLogoUrl, isOpen, setIsOpen }) => {
  const { activePage, handleNavClick } = useUI();
  const { userForHeaderAndSidebar: user } = useAuth();
  const { platformSettings } = useData();
  const { visibleSidebarItems: items } = useChurch();
  
  const [openMenus, setOpenMenus] = useState<Set<string>>(() => {
    const activeParent = items.find(item => item.subItems?.some(sub => sub.id === activePage));
    return activeParent ? new Set([activeParent.id]) : new Set<string>();
  });
  
  if (!user) return null;

  const handleMenuClick = (item: NavItem) => {
    if (item.subItems) {
      setOpenMenus(prev => {
        return prev.has(item.id) ? new Set<string>() : new Set<string>([item.id]);
      });
      
      const isSubItemActive = item.subItems.some(sub => sub.id === activePage);
      if (!isSubItemActive && item.subItems.length > 0) {
        handleNavClick(item.subItems[0]);
      }
    } else {
      handleNavClick(item);
    }
  };
  
  const handleLinkClick = (item: NavItem) => {
      handleMenuClick(item);
      if (window.innerWidth < 768) {
          setIsOpen(false);
      }
  }


  return (
    <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-church-dark-teal text-white flex flex-col flex-shrink-0 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex justify-between items-center h-20 px-4 bg-church-teal shadow-md">
        <div className="flex items-center gap-2">
            <img src={platformSettings.appLogoUrl} alt="App Logo" className="h-10 w-10 object-contain" />
            <h1 className="text-xl font-bold tracking-wider truncate">{platformSettings.appName}</h1>
        </div>
        <button onClick={() => setIsOpen(false)} className="md:hidden p-2 text-white/80 hover:text-white">
            <XMarkIcon className="w-6 h-6" />
        </button>
      </div>
      
      <div className="p-4 flex flex-col items-center border-b border-white/10">
        {churchLogoUrl ? (
          <img 
            src={churchLogoUrl} 
            alt="Logo de l'église" 
            className="w-20 h-20 rounded-full border-4 border-theme-accent object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full border-4 border-theme-accent bg-slate-200 flex items-center justify-center">
              <BuildingOffice2Icon className="w-12 h-12 text-slate-500"/>
          </div>
        )}
        <p className="mt-3 text-sm text-gray-300">Bienvenue</p>
        <h2 className="font-semibold text-lg text-center">{user.name}</h2>
        <p className="text-sm text-gray-300">{user.primaryRole}</p>
        <div className="mt-1 flex items-center text-xs">
          <span className="w-2 h-2 bg-green-400 rounded-full mr-1.5"></span>
          <span className="text-gray-400">{user.status}</span>
        </div>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const isParentActive = item.subItems?.some(sub => sub.id === activePage) ?? false;
          const isMenuOpen = openMenus.has(item.id);

          return (
            <React.Fragment key={item.id}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(item);
                }}
                className={`flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-md transition-colors duration-200 border-l-4 ${
                  (activePage === item.id || isParentActive)
                    ? 'border-theme-accent bg-church-teal text-white'
                    : 'border-transparent text-gray-300 hover:bg-church-teal hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.subItems && <ChevronDownIcon className={`w-4 h-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />}
              </a>
              {item.subItems && isMenuOpen && (
                <div className="pl-6 pt-1 pb-2 space-y-1">
                  {item.subItems.map(subItem => (
                    <a
                      key={subItem.id}
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleLinkClick(subItem);
                      }}
                      className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 w-full ${
                        activePage === subItem.id
                          ? 'bg-church-light-teal/80 text-white'
                          : 'text-gray-300 hover:bg-church-teal/50 hover:text-white'
                      }`}
                    >
                      <span className="w-6 h-6 opacity-50">{subItem.icon}</span>
                      <span>{subItem.label}</span>
                    </a>
                  ))}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      <div className="p-4 text-center text-xs text-gray-400 border-t border-white/10">
        <p>Développé par</p>
        <p className="font-semibold text-gray-300">{platformSettings.developedByText}</p>
      </div>
    </div>
  );
};

export default Sidebar;