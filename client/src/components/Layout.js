import React from 'react';
import { Outlet, useNavigate, NavLink, Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import authService from '../services/authService';
import { 
    MoonIcon, 
    SunIcon, 
    HomeIcon, 
    UserCircleIcon, 
    CloudIcon,
    ArrowRightOnRectangleIcon,
    UserIcon
} from '@heroicons/react/24/outline';

function Layout() {
    const navigate = useNavigate();
    const { darkMode, toggleDarkMode } = useTheme();

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <div className="w-64 bg-white dark:bg-dark-surface border-r border-gray-200 dark:border-dark-primary">
                <div className="flex items-center justify-between px-4 py-6 border-b border-gray-200 dark:border-dark-primary">
                    <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
                        Cloud Storage
                    </h1>
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-primary"
                    >
                        {darkMode ? (
                            <SunIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        ) : (
                            <MoonIcon className="w-5 h-5 text-gray-500" />
                        )}
                    </button>
                </div>
                <nav className="p-4 space-y-2">
                    <NavLink to="/dashboard" className="nav-link">
                        <HomeIcon className="w-5 h-5 mr-3" />
                        Dashboard
                    </NavLink>
                    <NavLink to="/connect-drive" className="nav-link">
                        <CloudIcon className="w-5 h-5 mr-3" />
                        Connect Drive
                    </NavLink>
                    <NavLink
                        to="/profile"
                        className="nav-link"
                    >
                        <UserIcon className="w-5 h-5 mr-3" />
                        Profile
                    </NavLink>
                    <button
                        onClick={handleLogout}
                        className="nav-link w-full text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                        <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                        Logout
                    </button>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <header className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-primary">
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                                Dashboard
                            </h2>
                            <div className="flex items-center space-x-4">
                                <button className="btn-primary">
                                    New Volume
                                </button>
                                <div className="flex items-center">
                                    <UserCircleIcon className="w-8 h-8 text-gray-400" />
                                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                                        {authService.getCurrentUser()?.email}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>
                <main className="p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default Layout;