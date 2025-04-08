import React from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import driveService from '../services/driveService';

function DriveList({ drives, onDriveRemoved, onStorageUpdated }) {
    const handleRemoveDrive = async (driveId) => {
        try {
            await driveService.removeDrive(driveId);
            onDriveRemoved();
            onStorageUpdated();
        } catch (error) {
            console.error('Error removing drive:', error);
        }
    };

    if (drives.length === 0) {
        return (
            <p className="text-sm text-gray-500 dark:text-gray-400">
                No drives connected. Add a drive to get started.
            </p>
        );
    }

    return (
        <div className="space-y-4">
            {drives.map((drive) => (
                <div
                    key={drive.id}
                    className="flex items-center justify-between p-4 bg-white dark:bg-dark-primary rounded-lg border border-gray-200 dark:border-dark-secondary hover:bg-gray-50 dark:hover:bg-dark-secondary transition-colors duration-200"
                >
                    <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                            <svg className="h-8 w-8 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0C5.372 0 0 5.373 0 12s5.372 12 12 12c6.627 0 12-5.373 12-12S18.627 0 12 0zm.14 19.018c-3.868 0-7-3.14-7-7.018 0-3.878 3.132-7.018 7-7.018 1.89 0 3.47.697 4.682 1.829l-1.974 1.978v-.004c-.735-.702-1.667-1.062-2.708-1.062-2.31 0-4.187 1.956-4.187 4.273 0 2.315 1.877 4.277 4.187 4.277 2.096 0 3.522-1.202 3.816-2.852H12.14v-2.737h6.585c.088.47.135.96.135 1.474 0 4.01-2.677 6.86-6.72 6.86z"/>
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                {drive.accountEmail}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Connected on {new Date(drive.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleRemoveDrive(drive.id)}
                        className="p-2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors duration-200"
                    >
                        <TrashIcon className="h-5 w-5" />
                    </button>
                </div>
            ))}
        </div>
    );
}

export default DriveList;