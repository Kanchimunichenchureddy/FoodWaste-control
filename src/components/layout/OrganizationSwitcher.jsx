import React from 'react';
import { useAuth } from '@contexts/AuthContext';
import { X, Check, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OrganizationSwitcher = ({ onClose }) => {
    const { organizations, currentOrganization, switchOrganization } = useAuth();
    const navigate = useNavigate();

    const getSectorIcon = (sector) => {
        switch (sector) {
            case 'Restaurant': return '🍽️';
            case 'Grocery': return '🏪';
            case 'Hotel': return '🏨';
            case 'Donation': return '🤝';
            default: return '🏠';
        }
    };

    const getSectorColor = (sector) => {
        switch (sector) {
            case 'Restaurant': return 'bg-orange-100 text-orange-700';
            case 'Grocery': return 'bg-blue-100 text-blue-700';
            case 'Hotel': return 'bg-purple-100 text-purple-700';
            case 'Donation': return 'bg-pink-100 text-pink-700';
            default: return 'bg-emerald-100 text-emerald-700';
        }
    };

    const handleSwitch = (org) => {
        switchOrganization(org);
        onClose();
        navigate('/'); // Force re-route through root experience logic
    };

    return (
        <div className="fixed inset-0 bg-emerald-950/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-emerald-700" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-emerald-950">Switch Organization</h3>
                            <p className="text-xs text-emerald-600 font-bold uppercase tracking-wide">
                                {organizations.length} organizations
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center hover:bg-emerald-100 transition-colors"
                    >
                        <X className="w-5 h-5 text-emerald-900" />
                    </button>
                </div>

                {/* Organization List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {organizations.map((org) => {
                        const isActive = org.id === currentOrganization?.id;
                        return (
                            <button
                                key={org.id}
                                onClick={() => handleSwitch(org)}
                                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${isActive
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-950'
                                    }`}
                            >
                                <div className="text-3xl">{getSectorIcon(org.sector_type)}</div>
                                <div className="flex-1 text-left">
                                    <h4 className="font-black text-sm">{org.name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span
                                            className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${isActive ? 'bg-white/20 text-white' : getSectorColor(org.sector_type)
                                                }`}
                                        >
                                            {org.sector_type}
                                        </span>
                                        <span
                                            className={`text-[9px] font-bold uppercase tracking-wider ${isActive ? 'text-white/80' : 'text-emerald-600'
                                                }`}
                                        >
                                            {org.role}
                                        </span>
                                    </div>
                                </div>
                                {isActive && (
                                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                        <Check className="w-5 h-5" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Add Organization Button */}
                <button className="btn-secondary w-full mt-6">
                    + Add New Organization
                </button>
            </div>
        </div>
    );
};

export default OrganizationSwitcher;
