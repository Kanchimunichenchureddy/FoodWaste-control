import React, { useState, useEffect } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { analyticsService } from '@services/api';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { LayoutDashboard, TrendingUp, DollarSign, Leaf, PieChart as PieIcon, Loader2 } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const Reports = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [overview, setOverview] = useState(null);
    const [catData, setCatData] = useState([]);
    const [reasonData, setReasonData] = useState([]);
    const [trends, setTrends] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        loadAnalytics();
    }, [user]);

    const loadAnalytics = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [overviewRes, catRes, reasonRes, trendsRes] = await Promise.all([
                analyticsService.getOverview(user.organization_id),
                analyticsService.getWasteByCategory(user.organization_id),
                analyticsService.getWasteByReason(user.organization_id),
                analyticsService.getWasteTrends(user.organization_id)
            ]);

            setOverview(overviewRes.data);
            setCatData(catRes.data || []);
            setReasonData(reasonRes.data || []);
            setTrends(trendsRes.data || []);
        } catch (error) {
            console.error("Failed to load analytics", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
    );

    // Chart Data Preparation
    const categoryChartData = {
        labels: catData.map(d => d.category || 'Uncategorized'),
        datasets: [{
            data: catData.map(d => Number(d.total_quantity)),
            backgroundColor: [
                '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'
            ],
            borderWidth: 0
        }]
    };

    const reasonChartData = {
        labels: reasonData.map(d => d.reason || 'Unknown'),
        datasets: [{
            label: 'Waste Events',
            data: reasonData.map(d => d.count),
            backgroundColor: '#10B981',
            borderRadius: 8
        }]
    };

    const trendChartData = {
        labels: trends.map(d => new Date(d.date).toLocaleDateString()),
        datasets: [{
            label: 'Daily Waste Cost ($)',
            data: trends.map(d => Number(d.total_cost)),
            borderColor: '#EF4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: true,
            tension: 0.4
        }]
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-emerald-950">Analytics & Reports</h1>
                    <p className="text-emerald-600 font-medium">Insights from your real data — pantry, waste logs, and donations</p>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card p-6 border-l-4 border-emerald-500">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs font-bold uppercase text-emerald-600 tracking-wider">Total Waste</p>
                            <h3 className="text-2xl font-black text-emerald-950 mt-1">{overview?.waste?.total_quantity || 0} kg</h3>
                        </div>
                        <div className="p-3 bg-emerald-100 rounded-xl">
                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 border-l-4 border-red-500">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs font-bold uppercase text-red-600 tracking-wider">Money Lost</p>
                            <h3 className="text-2xl font-black text-emerald-950 mt-1">${overview?.waste?.total_cost || 0}</h3>
                        </div>
                        <div className="p-3 bg-red-100 rounded-xl">
                            <DollarSign className="w-5 h-5 text-red-600" />
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 border-l-4 border-blue-500">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs font-bold uppercase text-blue-600 tracking-wider">Carbon Footprint</p>
                            <h3 className="text-2xl font-black text-emerald-950 mt-1">{overview?.waste?.total_carbon || 0} kg</h3>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <Leaf className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 border-l-4 border-purple-500">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs font-bold uppercase text-purple-600 tracking-wider">Pantry Value</p>
                            <h3 className="text-2xl font-black text-emerald-950 mt-1">${Number(overview?.pantry?.total_value || 0).toFixed(2)}</h3>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-xl">
                            <LayoutDashboard className="w-5 h-5 text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row 1 - all from your real waste data */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                    <h3 className="font-bold text-emerald-950 mb-6 flex items-center gap-2">
                        <PieIcon className="w-5 h-5 text-emerald-600" />
                        Waste by Category
                    </h3>
                    <div className="h-64 flex justify-center items-center">
                        {catData.length > 0 ? (
                            <Doughnut data={categoryChartData} options={{ maintainAspectRatio: false }} />
                        ) : (
                            <p className="text-emerald-600 font-medium text-center">No waste data yet. Log waste to see charts.</p>
                        )}
                    </div>
                </div>

                <div className="glass-card p-6">
                    <h3 className="font-bold text-emerald-950 mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                        Waste Trends (Cost)
                    </h3>
                    <div className="h-64 flex justify-center items-center">
                        {trends.length > 0 ? (
                            <Line data={trendChartData} options={{ maintainAspectRatio: false, responsive: true }} />
                        ) : (
                            <p className="text-emerald-600 font-medium text-center">No trend data yet. Log waste to see trends.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="glass-card p-6">
                <h3 className="font-bold text-emerald-950 mb-6">Waste Reasons Analysis</h3>
                <div className="h-64 flex justify-center items-center">
                    {reasonData.length > 0 ? (
                        <Bar data={reasonChartData} options={{ maintainAspectRatio: false }} />
                    ) : (
                        <p className="text-emerald-600 font-medium text-center">No reason data yet. Log waste with reasons to see analysis.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reports;
