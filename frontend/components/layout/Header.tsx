import React, { useContext, useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, Wifi, WifiOff, UserCircle, LogOut, User, ChevronsUpDown, Check, Building } from 'lucide-react';
import { AppContext } from '../../contexts/AppContext';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const context = useContext(AppContext);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isSiteSwitcherOpen, setSiteSwitcherOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const siteSwitcherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (siteSwitcherRef.current && !siteSwitcherRef.current.contains(event.target as Node)) {
        setSiteSwitcherOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const statusIndicator = () => {
    if (context?.connectionStatus === 'connected') {
      return <div className="flex items-center text-green-500"><Wifi className="w-5 h-5 mr-2" /><span>Online</span></div>;
    }
    if (context?.connectionStatus === 'connecting') {
        return <div className="flex items-center text-yellow-500"><Wifi className="w-5 h-5 mr-2 animate-pulse" /><span>Connecting...</span></div>;
    }
    return <div className="flex items-center text-red-500"><WifiOff className="w-5 h-5 mr-2" /><span>Offline</span></div>;
  }

  return (
    <header className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center">
        <button
          onClick={onToggleSidebar}
          className="md:hidden mr-4 p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="relative" ref={siteSwitcherRef}>
            <button 
                onClick={() => setSiteSwitcherOpen(!isSiteSwitcherOpen)}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{context?.selectedSite?.name ?? 'No Site Selected'}</h1>
                <ChevronsUpDown className="w-4 h-4 text-gray-400" />
            </button>
            {isSiteSwitcherOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                     <ul className="py-1">
                        {context?.sites.map(site => (
                             <li key={site.id}>
                                <button 
                                    onClick={() => {
                                        context.selectSite(site);
                                        setSiteSwitcherOpen(false);
                                    }}
                                    className="w-full text-left flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <span>{site.name}</span>
                                    {context.selectedSite?.id === site.id && <Check className="w-4 h-4 text-blue-500"/>}
                                </button>
                            </li>
                        ))}
                        <li><hr className="my-1 border-gray-200 dark:border-gray-700"/></li>
                        <li>
                            <button
                                onClick={() => {
                                    context?.selectSite(null);
                                    setSiteSwitcherOpen(false);
                                }}
                                className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <Building className="w-4 h-4 mr-3" />
                                Change Site
                            </button>
                        </li>
                     </ul>
                </div>
            )}
        </div>
      </div>
      <div className="flex items-center space-x-4">
        {statusIndicator()}
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-600"></div>
        <div className="relative" ref={profileRef}>
          <button onClick={() => setProfileOpen(!isProfileOpen)} className="flex items-center p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
            <UserCircle className="w-8 h-8 text-gray-400 dark:text-gray-500"/>
            <span className="ml-2 text-sm font-medium hidden sm:block">operator@ems.com</span>
          </button>
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
              <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-semibold">Operator User</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">operator@ems.com</p>
              </div>
              <ul className="py-1">
                <li>
                  <NavLink
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <User className="w-4 h-4 mr-3" />
                    Profile
                  </NavLink>
                </li>
                <li>
                  <button
                    onClick={() => {
                        context?.logout();
                        setProfileOpen(false);
                    }}
                    className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
