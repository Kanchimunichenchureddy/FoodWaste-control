import React from 'react';
import { useAuth } from '@contexts/AuthContext';
import { Menu, Building2, ChevronDown } from 'lucide-react';

const Header = ({ onMenuClick, onOrgSwitcherClick }) => {
    const { currentOrganization, organizations } = useAuth();

    return (
        <header className="sticky top-0 z-30 bg-white/60 backdrop-blur-xl border-b border-emerald-100 shadow-sm">
            <div className="flex items-center justify-between h-16 px-4 md:px-8">
                {/* Left Side - Menu Button */}
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                    <Menu className="w-6 h-6 text-emerald-900" />
                </button>

                {/* Center/Left - Welcome Message */}
                <div className="hidden md:block">
                    <h2 className="text-lg font-black text-emerald-950">
                        Welcome back! 👋
                    </h2>
                    <p className="text-xs text-emerald-600 font-bold">
                        Let's reduce food waste together
                    </p>
                </div>

                {/* Right Side - Organization Switcher */}
                {organizations.length > 1 && currentOrganization && (
                    <button
                        onClick={onOrgSwitcherClick}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all border border-emerald-200"
                    >
                        <Building2 className="w-4 h-4 text-emerald-700" />
                        <span className="font-bold text-sm text-emerald-900 max-w-[150px] truncate">
                            {currentOrganization.name}
                        </span>
                        <ChevronDown className="w-4 h-4 text-emerald-700" />
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;
