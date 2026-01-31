import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, organizationService } from '@services/api';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [organizations, setOrganizations] = useState([]);
    const [currentOrganization, setCurrentOrganization] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const { user } = await authService.getCurrentUser();
            if (user) {
                setUser(user);
                await loadUserOrganizations(user);
            }
        } catch (error) {
            console.error('Error checking user:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadUserOrganizations = async (currentUser) => {
        if (!currentUser) return;
        const { data, error } = await organizationService.getUserOrganizations(currentUser.id);
        if (!error && data && data.length > 0) {
            const orgs = data.map(m => ({ ...(m.organizations || m), role: m.role }));
            setOrganizations(orgs);
            const savedOrgId = localStorage.getItem('currentOrganizationId');
            const currentOrg = orgs.find(o => String(o.id) === String(savedOrgId)) || orgs[0];
            setCurrentOrganization(currentOrg);
        } else if (currentUser.organization_id) {
            // Fallback so dashboard/stats still work when org fetch fails
            const fallback = { id: currentUser.organization_id, name: 'My Organization', sector_type: 'Household' };
            setOrganizations([fallback]);
            setCurrentOrganization(fallback);
        }
    };

    const signUp = async (email, password, fullName, organizationData = null) => {
        setLoading(true);
        try {
            // Our new backend register handles org creation too if we pass metadata
            const metadata = organizationData ? { ...organizationData, organization_name: organizationData.name, full_name: fullName } : { full_name: fullName };
            const { data, error } = await authService.signUp(email, password, metadata);

            if (error) throw error;

            if (data.token) {
                localStorage.setItem('token', data.token);
                setUser(data.user);
                await loadUserOrganizations(data.user);
            }

            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        } finally {
            setLoading(false);
        }
    };

    const signIn = async (email, password) => {
        setLoading(true);
        try {
            const { data, error } = await authService.signIn(email, password);
            if (error) throw new Error(error.message);

            if (data.token) {
                localStorage.setItem('token', data.token);
                setUser(data.user);
                await loadUserOrganizations(data.user);
            }
            return { data, error };
        } catch (error) {
            return { data: null, error };
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        setLoading(true);
        try {
            await authService.signOut();
            setUser(null);
            setOrganizations([]);
            setCurrentOrganization(null);
            localStorage.removeItem('currentOrganizationId');
        } catch (error) {
            console.error('Error signing out:', error);
        } finally {
            setLoading(false);
        }
    };

    const switchOrganization = (organization) => {
        setCurrentOrganization(organization);
        localStorage.setItem('currentOrganizationId', organization.id);
    };

    const value = {
        user,
        organizations,
        currentOrganization,
        loading,
        signUp,
        signIn,
        signOut,
        switchOrganization,
        refreshOrganizations: () => user && loadUserOrganizations(user),
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
