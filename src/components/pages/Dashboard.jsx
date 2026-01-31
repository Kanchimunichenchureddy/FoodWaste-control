import React, { useState, useEffect } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { pantryService, wasteLogService, analyticsService } from '@services/api';
import { TrendingUp, DollarSign, Leaf, AlertCircle, ScanLine, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Sector-specific dashboard components
import RestaurantDashboard from './sectors/RestaurantDashboard';
import GroceryDashboard from './sectors/GroceryDashboard';
import HotelDashboard from './sectors/HotelDashboard';
import DonationDashboard from './sectors/DonationDashboard';

const Dashboard = () => {
    const { currentOrganization, user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalItems: 0,
        expiringSoon: 0,
        moneySaved: 0,
        wasteReduced: 0,
    });
    const [expiringItems, setExpiringItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statsError, setStatsError] = useState(null);

    useEffect(() => {
        loadDashboardData();
    }, [currentOrganization?.id, user?.id]);

    const loadDashboardData = async () => {
        setStatsError(null);
        try {
            const { data: overview, error: overviewError } = await analyticsService.getOverview();

            // Always set stats so they show (from overview or zeros)
            if (overviewError || !overview) {
                setStats({
                    totalItems: 0,
                    expiringSoon: 0,
                    moneySaved: 0,
                    wasteReduced: 0,
                });
                if (overviewError) setStatsError(overviewError.message || 'Could not load stats');
            } else {
                setStats({
                    totalItems: Number(overview.pantry?.total_items) || 0,
                    expiringSoon: Number(overview.pantry?.expiring_soon) || 0,
                    moneySaved: Math.round((Number(overview.waste?.total_cost) || 0) * 0.8),
                    wasteReduced: Number(overview.waste?.total_quantity) || 0,
                });
            }

            // Load expiring items (backend returns array of item objects) - only show real user data, no OCR junk
            const { data: pantryData, error: pantryError } = await pantryService.getPantryItems();

            const OCR_JUNK_NAMES = ['consectetur', 'dolore', 'lorem', 'ipsum', 'dolor', 'amet', 'sit', 'sed', 'elit'];
            const isRealItemName = (name) => {
                const n = (name || '').toLowerCase().trim();
                return n.length >= 2 && !OCR_JUNK_NAMES.includes(n) && !OCR_JUNK_NAMES.some(j => n.startsWith(j + ' ') || n === j);
            };

            if (!pantryError && pantryData != null) {
                const rawItems = Array.isArray(pantryData) ? pantryData : [];
                const now = new Date();
                const processedItems = rawItems
                    .map((dataItem) => {
                        const item = Array.isArray(dataItem) ? dataItem[0] : dataItem;
                        if (!item || !item.expiry_date || !isRealItemName(item.name)) return null;
                        const expiryDate = new Date(item.expiry_date);
                        if (isNaN(expiryDate.getTime())) return null;
                        const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
                        return { ...item, daysLeft };
                    })
                    .filter(Boolean);

                const expiring = processedItems
                    .filter((item) => item.daysLeft <= 7 && item.daysLeft >= -1)
                    .sort((a, b) => a.daysLeft - b.daysLeft);
                setExpiringItems(expiring.slice(0, 3));
            } else {
                setExpiringItems([]);
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
            setStats({ totalItems: 0, expiringSoon: 0, moneySaved: 0, wasteReduced: 0 });
            setStatsError(error?.message || 'Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    // Render sector-specific dashboard if it's a business
    const sector = currentOrganization?.sector_type || 'Household';
    if (currentOrganization && sector.toLowerCase() !== 'household') {
        switch (sector.toLowerCase()) {
            case 'restaurant':
                return <RestaurantDashboard />;
            case 'grocery':
                return <GroceryDashboard />;
            case 'hotel':
                return <HotelDashboard />;
            case 'donation':
                return <DonationDashboard />;
            default:
                break;
        }
    }

    // Household Dashboard
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20 animate-slide-up">
            {statsError && (
                <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-center gap-3 text-amber-800 text-sm font-medium">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{statsError}</span>
                    <button onClick={loadDashboardData} className="ml-auto underline font-bold">Retry</button>
                </div>
            )}
            {/* Hero Section */}
            <section className="relative overflow-hidden rounded-[3rem] bg-emerald-950 p-8 md:p-12 text-white shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-[80px] -mr-32 -mt-32" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="space-y-4 text-center md:text-left">
                        <span className="inline-block px-4 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">
                            Efficiency Champion
                        </span>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                            Dashboard
                        </h1>
                        <p className="text-emerald-100/60 font-medium max-w-sm">
                            Track your food inventory and reduce waste effectively!
                        </p>
                        <button
                            onClick={() => navigate('../pantry', { state: { openScan: true } })}
                            className="btn-premium flex items-center gap-2 mx-auto md:mx-0"
                        >
                            <ScanLine className="w-5 h-5" />
                            Manage Pantry
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                        <div className="glass-card-dark p-6 border-white/5 bg-white/5 text-center">
                            <p className="text-[10px] font-black uppercase text-emerald-500/60 mb-1">
                                Money Saved
                            </p>
                            <h3 className="text-2xl font-black">₹{stats.moneySaved}</h3>
                        </div>
                        <div className="glass-card-dark p-6 border-white/5 bg-white/5 text-center">
                            <p className="text-[10px] font-black uppercase text-emerald-500/60 mb-1">
                                Waste Reduced
                            </p>
                            <h3 className="text-2xl font-black">{stats.wasteReduced}kg</h3>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<Leaf className="w-6 h-6" />}
                    label="Total Items"
                    value={stats.totalItems}
                    color="emerald"
                />
                <StatCard
                    icon={<AlertCircle className="w-6 h-6" />}
                    label="Expiring Soon"
                    value={stats.expiringSoon}
                    color="orange"
                />
                <StatCard
                    icon={<DollarSign className="w-6 h-6" />}
                    label="Money Saved"
                    value={`₹${stats.moneySaved}`}
                    color="blue"
                />
                <StatCard
                    icon={<TrendingUp className="w-6 h-6" />}
                    label="Waste Reduced"
                    value={`${stats.wasteReduced}kg`}
                    color="green"
                />
            </div>

            {/* Expiring Items */}
            <section className="glass-card p-8 bg-white/40">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-2xl font-black text-emerald-950">Expiring Soon</h3>
                        <p className="text-[10px] font-black text-emerald-800/30 uppercase tracking-[0.2em] mt-1">
                            Action Required
                        </p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-orange-500 animate-pulse" />
                </div>

                <div className="space-y-4">
                    {expiringItems.length > 0 ? (
                        expiringItems.map((item) => {
                            const { daysLeft } = item;
                            return (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-4 p-5 bg-white/60 rounded-[1.5rem] border border-white shadow-sm hover:shadow-md transition-all"
                                >
                                    <div className="text-3xl bg-emerald-50 w-12 h-12 flex items-center justify-center rounded-2xl">
                                        {item.category === 'Produce' ? '🥬' : item.category === 'Dairy' ? '🥛' : '🥗'}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-black text-emerald-950">{item.name}</h4>
                                        <p
                                            className={`text-[10px] font-black uppercase ${daysLeft <= 1 ? 'text-red-500' : 'text-emerald-600'
                                                }`}
                                        >
                                            Expires {daysLeft === 0 ? 'Today' : `in ${daysLeft} days`}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-12 text-center text-emerald-900/20 font-black uppercase tracking-widest text-sm border-2 border-dashed border-emerald-900/5 rounded-3xl">
                            All items are fresh!
                        </div>
                    )}
                </div>
            </section>

            {/* Quick Actions */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <QuickActionCard
                    title="Add Items"
                    description="Quickly add items to your pantry"
                    icon="📦"
                    onClick={() => navigate('../pantry', { state: { openScan: true } })}
                />
                <QuickActionCard
                    title="View Reports"
                    description="Analyze your waste patterns"
                    icon="📊"
                    onClick={() => navigate('../reports')}
                />
                <QuickActionCard
                    title="Donations"
                    description="Share excess food with others"
                    icon="🤝"
                    onClick={() => navigate('../donations')}
                />
            </section>
        </div>
    );
};

const StatCard = ({ icon, label, value, color }) => {
    const colorClasses = {
        emerald: 'bg-emerald-100 text-emerald-700',
        orange: 'bg-orange-100 text-orange-700',
        blue: 'bg-blue-100 text-blue-700',
        green: 'bg-green-100 text-green-700',
    };

    return (
        <div className="glass-card p-6 bg-white/40">
            <div className={`w-12 h-12 ${colorClasses[color]} rounded-2xl flex items-center justify-center mb-4`}>
                {icon}
            </div>
            <p className="text-[10px] font-black uppercase text-emerald-900/40 tracking-widest mb-2">
                {label}
            </p>
            <h3 className="text-3xl font-black text-emerald-950">{value}</h3>
        </div>
    );
};

const QuickActionCard = ({ title, description, icon, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="glass-card p-6 bg-white/40 hover:bg-white/60 text-left transition-all hover:scale-105 hover:shadow-xl"
        >
            <div className="text-4xl mb-4">{icon}</div>
            <h4 className="font-black text-emerald-950 mb-2">{title}</h4>
            <p className="text-sm text-emerald-600 font-medium">{description}</p>
        </button>
    );
};

export default Dashboard;
