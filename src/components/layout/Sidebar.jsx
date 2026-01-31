import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import {
    LayoutDashboard,
    Package2,
    Trash2,
    FileText,
    Heart,
    Users,
    TrendingUp,
    Settings,
    LogOut,
    X
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen, experience = 'business' }) => {
    const { currentOrganization, signOut } = useAuth();

    const getSectorIcon = (sector) => {
        switch (sector) {
            case 'Restaurant': return '🍽️';
            case 'Grocery': return '🏪';
            case 'Hotel': return '🏨';
            case 'Donation': return '🤝';
            default: return '🏠';
        }
    };

    const prefix = experience === 'personal' ? '/home' : '/pro';

    const navigationItems = [
        { name: 'Dashboard', path: `${prefix}/dashboard`, icon: LayoutDashboard },
        { name: 'Pantry', path: `${prefix}/pantry`, icon: Package2 },
        { name: 'Waste Logs', path: `${prefix}/waste-logs`, icon: Trash2 },
        { name: 'Reports', path: `${prefix}/reports`, icon: FileText },
        { name: 'Donations', path: `${prefix}/donations`, icon: Heart },
        ...(experience === 'business'
            ? [
                { name: 'Suppliers', path: `${prefix}/suppliers`, icon: TrendingUp },
                ...(currentOrganization?.role !== 'viewer'
                    ? [{ name: 'Team', path: `${prefix}/team`, icon: Users }]
                    : []
                )
            ]
            : []
        ),
        { name: 'Settings', path: `${prefix}/settings`, icon: Settings },
    ];

    const handleSignOut = async () => {
        await signOut();
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 h-full w-64 bg-white/80 backdrop-blur-xl border-r border-emerald-100 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo & Close Button */}
                    <div className="flex items-center justify-between p-6 border-b border-emerald-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-2xl">
                                🌱
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-emerald-950">FoodWaste</h1>
                                <p className="text-[8px] uppercase tracking-widest text-emerald-600 font-black">
                                    Multi-Sector
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="lg:hidden p-2 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-emerald-900" />
                        </button>
                    </div>

                    {/* Current Organization */}
                    {currentOrganization && (
                        <div className="p-4 bg-emerald-50/50 border-b border-emerald-100">
                            <div className="flex items-center gap-3">
                                <div className="text-3xl">
                                    {getSectorIcon(currentOrganization.sector_type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-emerald-950 truncate text-sm">
                                        {currentOrganization.name}
                                    </p>
                                    <p className="text-[10px] uppercase tracking-wider text-emerald-600 font-bold">
                                        {currentOrganization.sector_type}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {navigationItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${isActive
                                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                                        : 'text-emerald-900/60 hover:bg-emerald-50 hover:text-emerald-950'
                                    }`
                                }
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="text-sm">{item.name}</span>
                            </NavLink>
                        ))}
                    </nav>

                    {/* Sign Out */}
                    <div className="p-4 border-t border-emerald-100">
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-600 hover:bg-red-50 transition-all"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="text-sm">Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
