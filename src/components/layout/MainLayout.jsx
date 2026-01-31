import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import OrganizationSwitcher from './OrganizationSwitcher';

const MainLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showOrgSwitcher, setShowOrgSwitcher] = useState(false);

    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:ml-64">
                {/* Header */}
                <Header
                    onMenuClick={() => setSidebarOpen(!sidebarOpen)}
                    onOrgSwitcherClick={() => setShowOrgSwitcher(true)}
                />

                {/* Page Content */}
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

export default MainLayout;
