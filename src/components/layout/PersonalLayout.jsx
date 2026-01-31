import React, { useState } from 'react';
import { Outlet, NavLink, Navigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import { LayoutDashboard, Package2, Trash2, Heart } from 'lucide-react';

const PersonalLayout = () => {
    const { currentOrganization } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Guard Rail: Redirect if not a personal/household account
    if (currentOrganization && currentOrganization?.sector_type?.toLowerCase() !== 'household') {
        return <Navigate to="/pro/dashboard" replace />;
    }

    // Mobile Bottom Nav Items
    const bottomNavItems = [
        { name: 'Dashboard', path: '/home/dashboard', icon: LayoutDashboard },
        { name: 'Pantry', path: '/home/pantry', icon: Package2 },
        { name: 'Logs', path: '/home/waste-logs', icon: Trash2 },
        { name: 'Market', path: '/home/donations', icon: Heart },
    ];

    return (
        <div className="min-h-screen flex bg-emerald-50/20">
            {/* Sidebar (Adapts for Personal) */}
            <Sidebar
                isOpen={sidebarOpen}
                setIsOpen={setSidebarOpen}
                experience="personal"
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:ml-64 pb-20 lg:pb-0">
                <Header
                    onMenuClick={() => setSidebarOpen(!sidebarOpen)}
                />

                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    <div className="max-w-5xl mx-auto">
                        <Outlet />
                    </div>
                </main>

                {/* Mobile Bottom Navigation - Distinct for Personal */}
                <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-emerald-100 flex justify-around p-3 z-50">
                    {bottomNavItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex flex-col items-center gap-1 transition-all ${isActive ? 'text-emerald-600' : 'text-emerald-900/40'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''}`} />
                                    <span className="text-[10px] font-black uppercase tracking-tighter">{item.name}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>
            </div>
        </div>
    );
};

export default PersonalLayout;
