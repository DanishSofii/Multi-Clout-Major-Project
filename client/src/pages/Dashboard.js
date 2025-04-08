import React, { useEffect, useState } from 'react';
import DriveList from '../components/DriveList';
import VolumeList from '../components/VolumeList';
import driveService from '../services/driveService';
import api from '../services/api';
import { PlusIcon, CloudIcon, ChartPieIcon, CircleStackIcon } from '@heroicons/react/24/outline';

function Dashboard() {
    const [drives, setDrives] = useState([]);
    const [volumes, setVolumes] = useState([]);
    const [storageInfo, setStorageInfo] = useState({
        total: '0',
        allocated: '0',
        remaining: '0'
    });

    useEffect(() => {
        fetchDrives();
        fetchVolumes();
    }, []);

    useEffect(() => {
        if (drives.length > 0) {
            calculateStorageInfo();
        }
    }, [drives, volumes]);

    const fetchDrives = async () => {
        try {
            const data = await driveService.getConnectedDrives();
            setDrives(data);
        } catch (error) {
            console.error('Error fetching drives:', error);
        }
    };

    const fetchVolumes = async () => {
        try {
            const response = await api.get('/api/volumes');
            setVolumes(response.data);
        } catch (error) {
            console.error('Error fetching volumes:', error);
        }
    };

    const calculateStorageInfo = async () => {
        try {
            // Get drive storage info
            const driveData = await driveService.getStorageInfo();
            
            // Calculate allocated storage from volumes
            const allocatedStorage = volumes.reduce((total, volume) => {
                return total + BigInt(volume.size || 0);
            }, BigInt(0));

            // Update storage info
            setStorageInfo({
                total: driveData.total.toString(),
                allocated: allocatedStorage.toString(),
                remaining: (BigInt(driveData.total) - allocatedStorage).toString()
            });
        } catch (error) {
            console.error('Error calculating storage info:', error);
        }
    };

    const formatBytes = (bytes) => {
        if (!bytes || bytes === '0') return '0 Bytes';
        const bytesNum = BigInt(bytes);
        const k = BigInt(1024);
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        let i = 0;
        let size = bytesNum;

        while (size >= k && i < sizes.length - 1) {
            size = size / k;
            i++;
        }

        return `${Number(size)} ${sizes[i]}`;
    };

    const calculateProgress = () => {
        if (storageInfo.total === '0') return 0;
        const total = BigInt(storageInfo.total);
        const allocated = BigInt(storageInfo.allocated);
        return Number((allocated * BigInt(100)) / total);
    };

    return (
        <div className="p-6 space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Storage Overview Card */}
                <div className="col-span-1 md:col-span-3">
                    <div className="card">
                        <div className="flex items-center space-x-3 mb-4">
                            <ChartPieIcon className="h-6 w-6 text-primary-500" />
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Storage Overview
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="p-4 bg-gray-50 dark:bg-dark-primary rounded-lg">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Storage</p>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                                    {formatBytes(storageInfo.total)}
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-dark-primary rounded-lg">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Allocated Storage</p>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                                    {formatBytes(storageInfo.allocated)}
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-dark-primary rounded-lg">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Remaining Storage</p>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                                    {formatBytes(storageInfo.remaining)}
                                </p>
                            </div>
                        </div>
                        <div className="relative pt-1">
                            <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-dark-primary">
                                <div
                                    style={{ width: `${calculateProgress()}%` }}
                                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Connected Drives Card */}
                <div className="col-span-1 md:col-span-3">
                    <div className="card">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <CloudIcon className="h-6 w-6 text-primary-500" />
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Connected Drives
                                </h2>
                            </div>
                            <button
                                onClick={driveService.initiateGoogleAuth}
                                className="btn-primary flex items-center space-x-2"
                            >
                                <PlusIcon className="h-5 w-5" />
                                <span>Connect Drive</span>
                            </button>
                        </div>
                        <DriveList 
                            drives={drives} 
                            onDriveRemoved={fetchDrives}
                            onStorageUpdated={calculateStorageInfo}
                        />
                    </div>
                </div>

                {/* Volumes Card */}
                <div className="col-span-1 md:col-span-3">
                    <div className="card">
                        <div className="flex items-center space-x-3 mb-6">
                            <CircleStackIcon className="h-6 w-6 text-primary-500" />
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Storage Volumes
                            </h2>
                        </div>
                        <VolumeList onVolumeChange={fetchVolumes} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;