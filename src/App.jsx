import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@contexts/AuthContext';
import { PantryProvider } from '@contexts/PantryContext';

// Pages
import Login from '@components/pages/Login';
import Signup from '@components/pages/Signup';
import Pantry from '@components/pages/Pantry';
import WasteLogs from '@components/pages/WasteLogs';
import Reports from '@components/pages/Reports';
import Donations from '@components/pages/Donations';
import Suppliers from '@components/pages/Suppliers';
import TeamManagement from '@components/pages/TeamManagement';
import Settings from '@components/pages/Settings';

import Dashboard from '@components/pages/Dashboard';

// Layout
import PersonalLayout from '@components/layout/PersonalLayout';
import BusinessLayout from '@components/layout/BusinessLayout';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100">
                <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100">
                <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

function AppRoutes() {
    const { currentOrganization, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100">
                <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    const isHousehold = currentOrganization?.sector_type?.toLowerCase() === 'household';

    return (
        <Routes>
            {/* Public Routes */}
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                }
            />
            <Route
                path="/signup"
                element={
                    <PublicRoute>
                        <Signup />
                    </PublicRoute>
                }
            />

            {/* Managed Experiences */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <Navigate
                            to={isHousehold ? '/home/dashboard' : '/pro/dashboard'}
                            replace
                        />
                    </ProtectedRoute>
                }
            />

            {/* Personal Experience */}
            <Route
                path="/home"
                element={
                    <ProtectedRoute>
                        <PersonalLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="pantry" element={<Pantry />} />
                <Route path="waste-logs" element={<WasteLogs />} />
                <Route path="reports" element={<Reports />} />
                <Route path="donations" element={<Donations />} />
                <Route path="settings" element={<Settings />} />
            </Route>

            {/* Business Experience */}
            <Route
                path="/pro"
                element={
                    <ProtectedRoute>
                        <BusinessLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="pantry" element={<Pantry />} />
                <Route path="waste-logs" element={<WasteLogs />} />
                <Route path="reports" element={<Reports />} />
                <Route path="donations" element={<Donations />} />
                <Route path="suppliers" element={<Suppliers />} />
                <Route path="team" element={<TeamManagement />} />
                <Route path="settings" element={<Settings />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <PantryProvider>
                <BrowserRouter>
                    <AppRoutes />
                </BrowserRouter>
            </PantryProvider>
        </AuthProvider>
    );
}

export default App;
