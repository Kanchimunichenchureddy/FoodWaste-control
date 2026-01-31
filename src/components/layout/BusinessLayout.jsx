import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import OrganizationSwitcher from './OrganizationSwitcher';

const BusinessLayout = () => {
    const { currentOrganization } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showOrgSwitcher, setShowOrgSwitcher] = useState(false);

    // Guard Rail: Redirect if this is actually a household account
    if (currentOrganization?.sector_type?.toLowerCase() === 'household') {
        return <Navigate to="/home/dashboard" replace />;
    }

    return (
        <div className="min-h-screen flex bg-slate-50/30">
            {/* Sidebar (Professional) */}
            <Sidebar
                isOpen={sidebarOpen}
                setIsOpen={setSidebarOpen}
                experience="business"
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:ml-64">
                <Header
                    onMenuClick={() => setSidebarOpen(!sidebarOpen)}
                    onOrgSwitcherClick={() => setShowOrgSwitcher(true)}
                />

                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Organization Switcher Modal */}
            {showOrgSwitcher && (
                <OrganizationSwitcher onClose={() => setShowOrgSwitcher(false)} />
            )}
        </div>
    );
};

export default BusinessLayout;
