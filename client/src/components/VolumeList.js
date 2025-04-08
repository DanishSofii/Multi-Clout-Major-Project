import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import api from '../services/api';

function VolumeList({ onVolumeChange }) {
    const [volumes, setVolumes] = useState([]);
    const [open, setOpen] = useState(false);
    const [newVolume, setNewVolume] = useState({ name: '', size: '' });
    const navigate = useNavigate();

    useEffect(() => {
        fetchVolumes();
    }, []);

    const fetchVolumes = async () => {
        try {
            const response = await api.get('/api/volumes');
            setVolumes(response.data);
            if (onVolumeChange) {
                onVolumeChange();
            }
        } catch (error) {
            console.error('Error fetching volumes:', error);
        }
    };

    const handleCreateVolume = async (name, size) => {
        try {
            await api.post('/api/volumes', { name, size });
            setOpen(false);
            setNewVolume({ name: '', size: '' }); // Reset form
            await fetchVolumes(); // Refresh the list
        } catch (error) {
            if (error.response?.data?.error === 'Insufficient storage available') {
                const details = error.response.data.details;
                alert(`Insufficient storage available!\n\nRequested: ${details.requested}\nAvailable: ${details.available}\nTotal: ${details.total}\nAllocated: ${details.allocated}`);
            } else if (error.response?.data?.error === 'No drives connected') {
                alert('Please connect at least one drive before creating a volume.');
            } else {
                console.error('Error creating volume:', error);
                alert('Failed to create volume. Please try again.');
            }
        }
    };

    const handleDeleteVolume = async (id) => {
        try {
            await api.delete(`/api/volumes/${id}`);
            await fetchVolumes();
        } catch (error) {
            console.error('Error deleting volume:', error);
        }
    };

    const handleVolumeClick = (id) => {
        navigate(`/volumes/${id}`);
    };

    return (
        <div>
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => setOpen(true)}
                    className="btn-primary flex items-center space-x-2"
                >
                    <PlusIcon className="h-5 w-5" />
                    <span>Create Volume</span>
                </button>
            </div>

            <div className="space-y-4">
                {volumes.map((volume) => (
                    <div
                        key={volume.id}
                        className="flex flex-col p-4 bg-gray-50 dark:bg-dark-primary rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-secondary transition-colors duration-200"
                        onClick={() => handleVolumeClick(volume.id)}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                {volume.name}
                            </h3>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteVolume(volume.id);
                                }}
                                className="p-2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors duration-200"
                            >
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {`${(volume.used / (1024 * 1024 * 1024)).toFixed(2)} GB / ${(volume.size / (1024 * 1024 * 1024)).toFixed(2)} GB`}
                            </p>
                            <div className="relative pt-1">
                                <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-dark-secondary">
                                    <div
                                        style={{ width: `${(volume.used / volume.size) * 100}%` }}
                                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Volume Modal */}
            {open && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-dark-primary rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                Create New Volume
                            </h3>
                            <button
                                onClick={() => setOpen(false)}
                                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Volume Name
                                </label>
                                <input
                                    type="text"
                                    value={newVolume.name}
                                    onChange={(e) => setNewVolume({ ...newVolume, name: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-dark-secondary dark:border-dark-secondary dark:text-white sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Size (GB)
                                </label>
                                <input
                                    type="number"
                                    value={newVolume.size}
                                    onChange={(e) => setNewVolume({ ...newVolume, size: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-dark-secondary dark:border-dark-secondary dark:text-white sm:text-sm"
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setOpen(false)}
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleCreateVolume(newVolume.name, newVolume.size * 1024 * 1024 * 1024)}
                                    className="btn-primary"
                                >
                                    Create
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default VolumeList; 