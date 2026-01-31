import React, { useState, useEffect } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { analyticsService, pantryService } from '@services/api';
import {
    ShoppingCart,
    ArrowDownRight,
    Zap,
    BarChart3,
    Loader2,
    Clock,
    Tag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GroceryDashboard = () => {
    const { currentOrganization } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        stock_value: 0,
        expiring_items: 0,
        total_items: 0, // Added
        turnover_rate: 4.2, // Mock turnover
        discount_count: 5 // Items recommended for discount
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const { data: overview } = await analyticsService.getOverview();
            if (overview) {
                setStats(prev => ({
                    ...prev,
                    stock_value: Math.round(overview.pantry?.total_value ?? 0),
                    expiring_items: overview.pantry?.expiring_soon ?? 0,
                    total_items: overview.pantry?.total_items ?? 0,
                    discount_count: Math.ceil((overview.pantry?.expiring_soon ?? 0) * 0.7)
                }));
            }
        } catch (error) {
            console.error("Grocery Dashboard error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20 animate-slide-up">
            {/* Hero */}
            <section className="glass-card p-10 bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-6">
                        <div className="text-5xl bg-white/20 backdrop-blur-md w-24 h-24 flex items-center justify-center rounded-[2.5rem] shadow-xl">
                            🛒
                        </div>
                        <div>
                            <span className="text-blue-200 text-xs font-black uppercase tracking-widest">Inventory Intelligence</span>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight">{currentOrganization?.name || 'Fresh Mart'}</h1>
                            <p className="text-white/70 font-medium">Shelf-life tracking & shrinkage reduction</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    icon={<ShoppingCart className="w-6 h-6" />}
                    label="Stock Count"
                    value={stats.total_items}
                    color="blue"
                    sub="Items currently on shelf"
                />
                <MetricCard
                    icon={<Clock className="w-6 h-6" />}
                    label="Risk Items"
                    value={stats.expiring_items}
                    color="orange"
                    sub="Expires < 5 days"
                />
                <MetricCard
                    icon={<Zap className="w-6 h-6" />}
                    label="Turnover"
                    value={stats.turnover_rate}
                    color="emerald"
                    sub="Avg stock duration"
                />
                <MetricCard
                    icon={<Tag className="w-6 h-6" />}
                    label="Discounts"
                    value={stats.discount_count}
                    color="pink"
                    sub="Suggest price drop"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-card p-8 bg-white/40">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-black text-emerald-950">Active Promotions</h3>
                        <Zap className="w-6 h-6 text-orange-500" />
                    </div>
                    <div className="space-y-4">
                        <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-center gap-4">
                            <div className="text-2xl">🥛</div>
                            <div>
                                <h4 className="font-black text-orange-950">Dairy Flash Sale</h4>
                                <p className="text-xs text-orange-800/70 font-medium">3 items expiring today. Auto-flagged for 30% discount.</p>
                            </div>
                        </div>
                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-4">
                            <div className="text-2xl">🥬</div>
                            <div>
                                <h4 className="font-black text-emerald-950">Produce Clearance</h4>
                                <p className="text-xs text-emerald-800/70 font-medium">Moved 15kg to Donatable status. Impact report updated.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-8 bg-gradient-to-br from-indigo-50 to-blue-50 border-blue-100">
                    <h3 className="text-2xl font-black text-indigo-950 mb-6 font-display">Inventory Health</h3>
                    <div className="space-y-6">
                        <HealthProgress label="Shelf Freshness" percentage={78} color="emerald" />
                        <HealthProgress label="Stock Accuracy" percentage={94} color="blue" />
                        <HealthProgress label="Waste Prevention" percentage={62} color="indigo" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ icon, label, value, color, sub }) => {
    const colors = {
        blue: 'bg-blue-100 text-blue-700',
        orange: 'bg-orange-100 text-orange-700',
        emerald: 'bg-emerald-100 text-emerald-700',
        pink: 'bg-pink-100 text-pink-700',
    };

    return (
        <div className="glass-card p-6 bg-white/40">
            <div className={`w-12 h-12 ${colors[color]} rounded-2xl flex items-center justify-center mb-4`}>
                {icon}
            </div>
            <p className="text-[10px] font-black uppercase text-emerald-900/40 tracking-widest mb-1">{label}</p>
            <h3 className="text-3xl font-black text-emerald-950">{value}</h3>
            <p className="text-[10px] text-emerald-600 font-bold mt-1 uppercase tracking-tight opacity-60">{sub}</p>
        </div>
    );
};

const HealthProgress = ({ label, percentage, color }) => {
    const colorMap = {
        emerald: 'bg-emerald-500',
        blue: 'bg-blue-500',
        indigo: 'bg-indigo-500'
    };
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-emerald-900/40">
                <span>{label}</span>
                <span>{percentage}%</span>
            </div>
            <div className="w-full bg-white h-2.5 rounded-full overflow-hidden border border-indigo-100 p-0.5">
                <div className={`${colorMap[color]} h-full rounded-full transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

export default GroceryDashboard;
