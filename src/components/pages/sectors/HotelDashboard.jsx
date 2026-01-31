import React, { useState, useEffect } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { analyticsService, pantryService } from '@services/api';
import {
    Bed,
    Coffee,
    TrendingDown,
    AlertCircle,
    Loader2,
    Calendar,
    ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HotelDashboard = () => {
    const { currentOrganization } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total_items: 0, // Added
        total_waste: 0,
        expiring_soon: 0,
        guest_count: 85, // Mock data for now
        efficiency: 92
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const { data: overview } = await analyticsService.getOverview();

            if (overview) {
                const wasteVol = overview.waste?.total_quantity ?? 0;
                const pantryVol = overview.pantry?.total_items ?? 1;
                const efficiency = Math.max(0, Math.min(100, 100 - Math.round((wasteVol / (pantryVol + wasteVol)) * 100)));

                setStats(prev => ({
                    ...prev,
                    total_items: overview.pantry?.total_items ?? 0,
                    total_waste: wasteVol,
                    expiring_soon: overview.pantry?.expiring_soon ?? 0,
                    efficiency: efficiency || 92
                }));
            }
        } catch (error) {
            console.error("Hotel Dashboard error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20 animate-slide-up">
            {/* Hero */}
            <section className="glass-card p-10 bg-gradient-to-br from-indigo-600 to-blue-700 text-white relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-20 -mb-20 blur-3xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-6">
                        <div className="text-5xl bg-white/20 backdrop-blur-md w-24 h-24 flex items-center justify-center rounded-[2.5rem] shadow-xl">
                            🏨
                        </div>
                        <div>
                            <span className="text-indigo-200 text-xs font-black uppercase tracking-widest">Hospitality Excellence</span>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight">{currentOrganization?.name || 'Grand Hotel'}</h1>
                            <p className="text-white/70 font-medium">Managing buffet efficiency & room-service supply</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => navigate('../pantry', { state: { openScan: true } })}
                            className="px-6 py-3 bg-white/20 text-white border border-white/30 rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-white/30 transition-all"
                        >
                            Stock Take
                        </button>
                        <button
                            onClick={() => navigate('../reports')}
                            className="px-6 py-3 bg-white text-indigo-700 rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-orange-50 transition-all shadow-xl"
                        >
                            Guest Reports
                        </button>
                    </div>
                </div>
            </section>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    icon={<Coffee className="w-6 h-6" />}
                    label="Stock Count"
                    value={stats.total_items}
                    color="indigo"
                    sub="Current kitchen supply"
                />
                <MetricCard
                    icon={<AlertCircle className="w-6 h-6" />}
                    label="Expiring (3 Days)"
                    value={stats.expiring_soon}
                    color="orange"
                    sub="Critical action items"
                />
                <MetricCard
                    icon={<Bed className="w-6 h-6" />}
                    label="Occupancy Impact"
                    value={`${stats.guest_count}%`}
                    color="blue"
                    sub="Food requirement sync"
                />
                <MetricCard
                    icon={<TrendingDown className="w-6 h-6" />}
                    label="Efficiency"
                    value={`${stats.efficiency}%`}
                    color="emerald"
                    sub="Waste reduction score"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-card p-8 bg-white/40">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-black text-emerald-950">Supply vs Demand</h3>
                        <Calendar className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div className="h-64 flex items-center justify-center border-2 border-dashed border-emerald-900/5 rounded-3xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-50/50 to-transparent"></div>
                        <p className="font-bold text-emerald-900/30 uppercase tracking-[0.3em] z-10">Demand Chart Placeholder</p>
                    </div>
                </div>

                <div className="glass-card p-8 bg-indigo-50 border-indigo-100">
                    <h3 className="text-xl font-black text-indigo-950 mb-4">Sustainability Certificate</h3>
                    <div className="p-6 bg-white rounded-2xl shadow-sm space-y-4">
                        <div className="flex justify-center text-4xl">🏆</div>
                        <p className="text-center text-sm text-indigo-900/70 font-medium">You've reached the **Gold Tier** in food diversion this month!</p>
                        <button className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-colors">
                            Download Badge
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ icon, label, value, color, sub }) => {
    const colors = {
        indigo: 'bg-indigo-100 text-indigo-700',
        orange: 'bg-orange-100 text-orange-700',
        blue: 'bg-blue-100 text-blue-700',
        emerald: 'bg-emerald-100 text-emerald-700',
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

export default HotelDashboard;
