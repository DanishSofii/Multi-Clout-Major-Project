import React, { useState, useEffect } from 'react';
import { UserIcon, KeyIcon, CloudIcon, FolderIcon, XMarkIcon } from '@heroicons/react/24/outline';
import api from '../services/api';

function Profile() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await api.get('/api/users/profile');
            setUser(response.data);
        } catch (error) {
            setError('Failed to load profile data');
            console.error('Error fetching profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage('');

        // Validate passwords
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setError('New password must be at least 6 characters long');
            return;
        }

        try {
            await api.post('/api/users/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            setSuccessMessage('Password changed successfully');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to change password');
            console.error('Error changing password:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 animate-fade-in">
            {/* Profile Header */}
            <div className="flex items-center space-x-3">
                <UserIcon className="h-8 w-8 text-primary-500" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Profile
                </h1>
            </div>

            {/* User Details Card */}
            <div className="card">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email
                        </label>
                        <p className="mt-1 text-lg text-gray-900 dark:text-white">
                            {user?.email}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Account Created
                        </label>
                        <p className="mt-1 text-lg text-gray-900 dark:text-white">
                            {new Date(user?.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-dark-primary rounded-lg">
                            <CloudIcon className="h-8 w-8 text-primary-500" />
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Connected Drives
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    {user?.totalDrives || 0} Google Drive{user?.totalDrives !== 1 ? 's' : ''} connected
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-dark-primary rounded-lg">
                            <FolderIcon className="h-8 w-8 text-primary-500" />
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Storage Volumes
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    {user?.totalVolumes || 0} volume{user?.totalVolumes !== 1 ? 's' : ''} created
                                </p>
                            </div>
                        </div>
                    </div>
                    {user?.driveAccounts?.length > 0 && (
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                Connected Google Drive Accounts
                            </h3>
                            <div className="space-y-3">
                                {user.driveAccounts.map((drive, index) => (
                                    <div key={index} className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                                        <CloudIcon className="h-5 w-5" />
                                        <span>{drive.email}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Change Password Button */}
                    <div className="pt-4">
                        <button
                            onClick={() => setShowPasswordModal(true)}
                            className="btn-primary flex items-center space-x-2"
                        >
                            <KeyIcon className="h-5 w-5" />
                            <span>Change Password</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-dark-surface rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Change Password
                            </h2>
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200">
                                {error}
                            </div>
                        )}

                        {successMessage && (
                            <div className="mb-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-200">
                                {successMessage}
                            </div>
                        )}

                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({
                                        ...passwordData,
                                        currentPassword: e.target.value
                                    })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-dark-secondary dark:border-dark-secondary dark:text-white sm:text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({
                                        ...passwordData,
                                        newPassword: e.target.value
                                    })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-dark-secondary dark:border-dark-secondary dark:text-white sm:text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({
                                        ...passwordData,
                                        confirmPassword: e.target.value
                                    })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-dark-secondary dark:border-dark-secondary dark:text-white sm:text-sm"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordModal(false)}
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                >
                                    Change Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Profile; 