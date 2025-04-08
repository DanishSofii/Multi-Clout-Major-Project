import { Navigate, Outlet } from 'react-router-dom';
import authService from '../services/authService';

function ProtectedRoute() {
    if (!authService.isAuthenticated()) {
        return <Navigate to="/login" />;
    }

    return <Outlet />;
}

export default ProtectedRoute;