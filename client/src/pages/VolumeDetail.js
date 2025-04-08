import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    TrashIcon, 
    ArrowUpTrayIcon, 
    ArrowDownTrayIcon, 
    CircleStackIcon,
    ChartPieIcon,
    DocumentIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';

function VolumeDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [volume, setVolume] = useState(null);
    const [files, setFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);

    useEffect(() => {
        fetchVolume();
    }, [id]);

    const fetchVolume = async () => {
        try {
            const response = await api.get(`/api/volumes/${id}`);
            const volumeData = response.data;
            
            // Convert string values to BigInt for calculations
            volumeData.size = BigInt(volumeData.size);
            volumeData.used = BigInt(volumeData.used);
            volumeData.files = volumeData.files.map(file => ({
                ...file,
                size: BigInt(file.size)
            }));
            
            setVolume(volumeData);
            setFiles(volumeData.files);
        } catch (error) {
            console.error('Error fetching volume:', error);
            setUploadError('Failed to fetch volume data. Please try again.');
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploading(true);
        setUploadProgress(0);
        setUploadError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('volumeId', id);

            await api.post('/api/files/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });

            // Refresh volume data after successful upload
            await fetchVolume();
            
            // Clear the file input
            event.target.value = '';
        } catch (error) {
            console.error('Error uploading file:', error);
            setUploadError('Failed to upload file. Please try again.');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const handleFileDelete = async (fileId) => {
        try {
            await api.delete(`/api/files/${fileId}`);
            // Refresh volume data after successful deletion
            await fetchVolume();
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    };

    const handleFileDownload = async (fileId, fileName) => {
        try {
            const response = await api.get(`/api/files/download/${fileId}`, {
                responseType: 'blob',
                headers: {
                    'Accept': '*/*'
                }
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading file:', error);
            alert('Failed to download file. Please try again.');
        }
    };

    const formatBytes = (bytes) => {
        if (!bytes) return '0 Bytes';
        const bytesNum = typeof bytes === 'bigint' ? bytes : BigInt(bytes);
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

    if (!volume) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 animate-fade-in">
            <div className="flex items-center space-x-3">
                <CircleStackIcon className="h-8 w-8 text-primary-500" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {volume.name}
                </h1>
            </div>

            {/* Storage Usage Card */}
            <div className="card">
                <div className="flex items-center space-x-3 mb-4">
                    <ChartPieIcon className="h-6 w-6 text-primary-500" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Storage Usage
                    </h2>
                </div>
                <div className="mb-4">
                    <p className="text-lg text-gray-700 dark:text-gray-300">
                        {`${formatBytes(volume.used)} / ${formatBytes(volume.size)}`}
                    </p>
                </div>
                <div className="relative pt-1">
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-dark-secondary">
                        <div
                            style={{ width: `${Number((volume.used * BigInt(100)) / volume.size)}%` }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500"
                        />
                    </div>
                </div>
            </div>

            {/* Files Card */}
            <div className="card">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-3">
                        <DocumentIcon className="h-6 w-6 text-primary-500" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Files
                        </h2>
                    </div>
                    <label className="btn-primary flex items-center space-x-2 cursor-pointer">
                        <ArrowUpTrayIcon className="h-5 w-5" />
                        <span>Upload File</span>
                        <input
                            type="file"
                            className="hidden"
                            onChange={handleFileUpload}
                            disabled={isUploading}
                        />
                    </label>
                </div>

                {isUploading && (
                    <div className="mb-6">
                        <div className="flex justify-between mb-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Uploading file...
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {uploadProgress}%
                            </span>
                        </div>
                        <div className="relative pt-1">
                            <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-dark-secondary">
                                <div
                                    style={{ width: `${uploadProgress}%` }}
                                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {uploadError && (
                    <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200">
                        {uploadError}
                    </div>
                )}

                <div className="space-y-4">
                    {files.map((file) => (
                        <div
                            key={file.id}
                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-primary rounded-lg"
                        >
                            <div>
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                    {file.name}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {formatBytes(file.size)}
                                </p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handleFileDownload(file.id, file.name)}
                                    className="p-2 text-gray-400 hover:text-primary-500 dark:text-gray-500 dark:hover:text-primary-400 transition-colors duration-200"
                                >
                                    <ArrowDownTrayIcon className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => handleFileDelete(file.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors duration-200"
                                >
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default VolumeDetail; 