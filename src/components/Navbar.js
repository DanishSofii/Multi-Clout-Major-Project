import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
    const { isAuthenticated, logout } = useAuth();

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Cloud Storage
                </Typography>
                {isAuthenticated ? (
                    <>
                        <Button color="inherit" component={RouterLink} to="/">
                            Dashboard
                        </Button>
                        <Button color="inherit" component={RouterLink} to="/volumes">
                            Volumes
                        </Button>
                        <Button color="inherit" component={RouterLink} to="/profile">
                            Profile
                        </Button>
                        <Button color="inherit" onClick={logout}>
                            Logout
                        </Button>
                    </>
                ) : (
                    <Button color="inherit" component={RouterLink} to="/login">
                        Login
                    </Button>
                )}
            </Toolbar>
        </AppBar>
    );
}

export default Navbar; 