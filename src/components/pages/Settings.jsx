import React, { useState, useEffect } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { authService, organizationService } from '@services/api';
import {
    User,
    Building,
    Shield,
    Save,
    CheckCircle,
    AlertCircle,
    Loader2,
    Lock,
    Mail,
    Globe
} from 'lucide-react';

const Settings = () => {
    const { user, currentOrganization, refreshOrganizations } = useAuth();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    // Profile State
    const [profileData, setProfileData] = useState({
        full_name: user?.full_name || '',
        email: user?.email || '',
        password: ''
    });

    // Org State
    const [orgData, setOrgData] = useState({
        name: currentOrganization?.name || '',
        sector_type: currentOrganization?.sector_type || 'Household'
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                full_name: user.full_name || '',
                email: user.email || '',
                password: ''
            });
        }
        if (currentOrganization) {
            setOrgData({
                name: currentOrganization.name || '',
                sector_type: currentOrganization.sector_type || 'Household'
            });
        }
    }, [user, currentOrganization]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });
        try {
            const { error } = await authService.updateProfile(profileData);
            if (error) throw error;
            setStatus({ type: 'success', message: 'Profile updated successfully!' });
        } catch (error) {
            setStatus({ type: 'error', message: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleOrgUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });
        try {
            const { error } = await organizationService.updateOrganization(currentOrganization.id, orgData);
            if (error) throw error;
            await refreshOrganizations();
            setStatus({ type: 'success', message: 'Organization settings updated!' });
        } catch (error) {
            setStatus({ type: 'error', message: error.message });
        } finally {
            setLoading(false);
        }
    };

    const isOwner = user?.role === 'owner';

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-slide-up">
            <div>
                <h1 className="text-3xl font-black text-emerald-950">Settings</h1>
                <p className="text-emerald-600 font-medium">Manage your profile and organization preferences</p>
            </div>

            {status.message && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 animate-slide-in ${status.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {status.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span className="font-bold">{status.message}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Profile Section */}
                <section className="glass-card p-8 bg-white/40 border-emerald-100 h-fit">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                            <User className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-black text-emerald-950">User Profile</h2>
                    </div>

                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div>
                            <label className="label">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                                <input
                                    type="text"
                                    className="input-primary pl-10"
                                    value={profileData.full_name}
                                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="label">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                                <input
                                    type="email"
                                    className="input-primary pl-10"
                                    value={profileData.email}
                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="label">Change Password (leave blank to keep current)</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                                <input
                                    type="password"
                                    className="input-primary pl-10"
                                    placeholder="••••••••"
                                    value={profileData.password}
                                    onChange={(e) => setProfileData({ ...profileData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-premium w-full flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Update Profile
                        </button>
                    </form>
                </section>

                {/* Organization Section */}
                {isOwner && (
                    <section className="glass-card p-8 bg-white/40 border-emerald-100 h-fit">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                <Building className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-black text-emerald-950">Organization Settings</h2>
                        </div>

                        <form onSubmit={handleOrgUpdate} className="space-y-4">
                            <div>
                                <label className="label">Organization Name</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                                    <input
                                        type="text"
                                        className="input-primary pl-10"
                                        value={orgData.name}
                                        onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="label">Sector Type</label>
                                <select
                                    className="input-primary"
                                    value={orgData.sector_type}
                                    onChange={(e) => setOrgData({ ...orgData, sector_type: e.target.value })}
                                >
                                    <option value="Household">Household</option>
                                    <option value="Restaurant">Restaurant</option>
                                    <option value="Grocery">Grocery</option>
                                    <option value="Hotel">Hotel</option>
                                    <option value="Donation">Donation Center</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-premium w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Organization Info
                            </button>
                        </form>
                    </section>
                )}

                {!isOwner && (
                    <div className="p-8 bg-amber-50 rounded-3xl border border-amber-100 flex flex-col items-center text-center justify-center gap-4">
                        <Shield className="w-12 h-12 text-amber-500" />
                        <div>
                            <h3 className="text-lg font-black text-amber-900">Admin Access Only</h3>
                            <p className="text-sm text-amber-800/70 font-medium">Organization settings can only be managed by the owner. Please contact your administrator for changes.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;
