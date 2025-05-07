import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import NotificationCenter from './NotificationCenter';
import { 
  Car, Users, UserRound, Calendar, Home, Settings, 
  LogOut, Menu, X, ChevronDown, Moon, Sun 
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const isLinkActive = (path: string) => {
    return location.pathname === path;
  };

  const adminLinks = [
    { path: '/', icon: <Home size={20} />, label: 'Tableau de bord' },
    { path: '/moniteurs', icon: <Users size={20} />, label: 'Moniteurs' },
    { path: '/eleves', icon: <UserRound size={20} />, label: 'Élèves' },
    { path: '/vehicules', icon: <Car size={20} />, label: 'Véhicules' },
    { path: '/planning', icon: <Calendar size={20} />, label: 'Planning' },
  ];

  const userLinks = [
    { path: '/', icon: <Home size={20} />, label: 'Tableau de bord' },
    { path: '/calendrier', icon: <Calendar size={20} />, label: 'Calendrier' },
    { path: '/profil', icon: <Settings size={20} />, label: 'Mon Profil' },
  ];

  const links = user?.role === 'admin' ? adminLinks : userLinks;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className={`fixed inset-0 bg-gray-800 bg-opacity-75 z-40 lg:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={closeSidebar}></div>

      <aside className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg z-50 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300`}>
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <div className="font-bold text-xl text-blue-600">AutoÉcole Pro</div>
          <button className="lg:hidden" onClick={closeSidebar}>
            <X size={24} />
          </button>
        </div>
        
        <div className="p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Connecté en tant que:</p>
          <p className="font-medium dark:text-white">{user?.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">{user?.role}</p>
        </div>
        
        <nav className="mt-4 px-2">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`sidebar-link ${isLinkActive(link.path) ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
          <button 
            className="sidebar-link text-red-600 hover:bg-red-50 hover:text-red-700 mt-8 w-full"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </nav>
      </aside>

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30">
          <div className="px-4 py-3 flex items-center justify-between">
            <button 
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden" 
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            
            <div className="flex items-center space-x-2">
              <button
                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={toggleTheme}
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              <NotificationCenter />
              
              <div className="relative">
                <button 
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setProfileOpen(!profileOpen)}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                    {user?.name.charAt(0)}
                  </div>
                  <ChevronDown size={16} />
                </button>
                
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-50">
                    <Link 
                      to="/profil" 
                      className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setProfileOpen(false)}
                    >
                      Mon profil
                    </Link>
                    <button 
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={handleLogout}
                    >
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
        
        <footer className="bg-white dark:bg-gray-800 py-4 text-center text-gray-500 dark:text-gray-400 text-sm border-t dark:border-gray-700">
          © {new Date().getFullYear()} AutoÉcole Pro - Tous droits réservés
        </footer>
      </div>
    </div>
  );
};

export default Layout;