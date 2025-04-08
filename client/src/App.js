import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ConnectDrive from './pages/ConnectDrive';
import DriveVerification from './pages/DriveVerification';
import PrivateRoute from './components/PrivateRoute';
import VolumeDetail from './pages/VolumeDetail';
import Profile from './pages/Profile';
import { ThemeProvider } from './contexts/ThemeContext';
import './styles/tailwind.css';

function App() {
    return (
        <ThemeProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-200">
                <Router>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                            <Route index element={<Navigate to="/dashboard" />} />
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="connect-drive" element={<ConnectDrive />} />
                            <Route path="connect-drive/verify" element={<DriveVerification />} />
                            <Route path="profile" element={<Profile />} />
                        </Route>
                        <Route
                            path="/volumes/:id"
                            element={
                                <PrivateRoute>
                                    <VolumeDetail />
                                </PrivateRoute>
                            }
                        />
                    </Routes>
                </Router>
            </div>
        </ThemeProvider>
    );
}

export default App;