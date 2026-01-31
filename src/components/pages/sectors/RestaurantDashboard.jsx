import React, { useState, useEffect } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { analyticsService } from '@services/api';
import {
    TrendingUp,
    DollarSign,
    Leaf,
    ChefHat,
    AlertTriangle,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RestaurantDashboard = () => {
    const { currentOrganization } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total_waste_kg: 0,
        total_cost: 0,
        total_carbon: 0,
        waste_item_count: 0,
        total_items: 0,
        expiring_soon: 0
    });

    useEffect(() => {
        loadData();
    }, [currentOrganization]);

    const loadData = async () => {
        setLoading(true);
        try {
            const { data } = await analyticsService.getOverview();
            if (data) {
                setStats({
                    total_waste_kg: data.waste?.total_quantity ?? 0,
                    total_cost: data.waste?.total_cost ?? 0,
                    total_carbon: data.waste?.total_carbon ?? 0,
                    waste_item_count: data.waste?.total_logs ?? 0,
                    total_items: data.pantry?.total_items ?? 0,
                    expiring_soon: data.pantry?.expiring_soon ?? 0
                });
            }
        } catch (error) {
            console.error("Dashboard load error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20 animate-slide-up">
            {/* Hero */}
            <section className="glass-card p-8 bg-gradient-to-br from-orange-600 to-orange-700 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-[2rem] flex items-center justify-center text-5xl shadow-inner">
                            👨‍🍳
                        </div>
                        <div>
                            <span className="text-orange-200 text-xs font-black uppercase tracking-widest">Premium Kitchen Analytics</span>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight">{currentOrganization?.name || 'Chef'} Dashboard</h1>
                            <p className="text-white/70 font-medium">Monitoring kitchen waste & procurement efficiency</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('../waste-logs')}
                        className="px-6 py-3 bg-white text-orange-600 rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-orange-50 transition-all shadow-xl flex items-center gap-2"
                    >
                        Log Today's Waste <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </section>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    icon={<Leaf className="w-6 h-6" />}
                    label="Inventory"
                    value={stats.total_items}
                    color="emerald"
                    sub="Current in-stock items"
                />
                <MetricCard
                    icon={<AlertTriangle className="w-6 h-6" />}
                    label="Expiring"
                    value={stats.expiring_soon}
                    color="orange"
                    sub="Items needing action"
                />
                <MetricCard
                    icon={<DollarSign className="w-6 h-6" />}
                    label="Loss (Cost)"
                    value={`₹${stats.total_cost}`}
                    color="red"
                    sub="Monthly procurement loss"
                />
                <MetricCard
                    icon={<TrendingUp className="w-6 h-6" />}
                    label="Waste Volume"
                    value={`${stats.total_waste_kg}kg`}
                    color="blue"
                    sub="Total kitchen waste"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card p-8 bg-white/40 border-orange-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-black text-emerald-950">Kitchen Insights</h3>
                        <AlertTriangle className="w-6 h-6 text-orange-500" />
                    </div>
                    <div className="space-y-4">
                        <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                            <h4 className="font-bold text-orange-900">Optimization Tip</h4>
                            <p className="text-sm text-orange-800/80">Your produce waste is 15% higher this week. Consider reducing your bulk orders for leafy greens.</p>
                        </div>
                        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                            <h4 className="font-bold text-emerald-900">Efficiency Gain</h4>
                            <p className="text-sm text-emerald-800/80">Donation frequency has increased. You've diverted 12kg of surplus this month!</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-8 bg-white/40">
                    <h3 className="text-2xl font-black text-emerald-950 mb-4">Quick Links</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => navigate('../pantry')} className="p-4 bg-white/80 rounded-2xl border border-emerald-50 text-left hover:border-emerald-200 transition-all">
                            <span className="text-2xl mb-2 block">📋</span>
                            <span className="font-black text-emerald-950 block">Inventory</span>
                            <span className="text-[10px] text-emerald-600 uppercase font-black">Track Supplies</span>
                        </button>
                        <button onClick={() => navigate('../donations')} className="p-4 bg-white/80 rounded-2xl border border-emerald-50 text-left hover:border-emerald-200 transition-all">
                            <span className="text-2xl mb-2 block">🤝</span>
                            <span className="font-black text-emerald-950 block">Donations</span>
                            <span className="text-[10px] text-emerald-600 uppercase font-black">Post Excess</span>
                        </button>
                        <button onClick={() => navigate('../suppliers')} className="p-4 bg-white/80 rounded-2xl border border-emerald-50 text-left hover:border-emerald-200 transition-all">
                            <span className="text-2xl mb-2 block">🚚</span>
                            <span className="font-black text-emerald-950 block">Suppliers</span>
                            <span className="text-[10px] text-emerald-600 uppercase font-black">Manage Partners</span>
                        </button>
                        <button onClick={() => navigate('../reports')} className="p-4 bg-white/80 rounded-2xl border border-emerald-50 text-left hover:border-emerald-200 transition-all">
                            <span className="text-2xl mb-2 block">📊</span>
                            <span className="font-black text-emerald-950 block">Reports</span>
                            <span className="text-[10px] text-emerald-600 uppercase font-black">Detailed View</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ icon, label, value, color, sub }) => {
    const colors = {
        orange: 'bg-orange-100 text-orange-700',
        blue: 'bg-blue-100 text-blue-700',
        red: 'bg-red-100 text-red-700',
        emerald: 'bg-emerald-100 text-emerald-700',
    };

    return (
        <div className="glass-card p-6 bg-white/40 hover:scale-105 transition-transform">
            <div className={`w-12 h-12 ${colors[color]} rounded-2xl flex items-center justify-center mb-4 shadow-sm`}>
                {icon}
            </div>
            <p className="text-[10px] font-black uppercase text-emerald-900/40 tracking-widest mb-1">{label}</p>
            <h3 className="text-3xl font-black text-emerald-950">{value}</h3>
            <p className="text-[10px] text-emerald-600 font-bold mt-1 uppercase tracking-tight opacity-60">{sub}</p>
        </div>
    );
};

export default RestaurantDashboard;
