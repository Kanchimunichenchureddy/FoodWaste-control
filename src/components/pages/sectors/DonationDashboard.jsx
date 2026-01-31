import React, { useState, useEffect } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { donationService, analyticsService } from '@services/api';
import {
    Heart,
    TrendingUp,
    ArrowRight,
    Loader2,
    Package,
    MapPin,
    AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DonationDashboard = () => {
    const { currentOrganization } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalPosts: 0,
        claimedByMe: 0,
        availableMarketplace: 0,
        impact: {
            total_kg: 0,
            people_fed: 0
        }
    });
    const [recentDonations, setRecentDonations] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [postsRes, claimsRes, marketplaceRes, impactRes] = await Promise.all([
                donationService.getMyDonations(),
                donationService.getMyClaims(),
                donationService.getAvailableDonations(),
                analyticsService.getCommunityImpact()
            ]);

            setStats({
                totalPosts: postsRes.data?.length || 0,
                claimedByMe: claimsRes.data?.length || 0,
                availableMarketplace: marketplaceRes.data?.length || 0,
                impact: {
                    total_kg: impactRes.data?.total_kg || 0,
                    people_fed: impactRes.data?.people_fed || 0
                }
            });

            setRecentDonations(marketplaceRes.data?.slice(0, 3) || []);
        } catch (error) {
            console.error("Donation Dashboard error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20 animate-slide-up">
            {/* Hero */}
            <section className="glass-card p-10 bg-gradient-to-br from-emerald-600 to-teal-700 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-6 text-center md:text-left">
                        <div className="text-6xl bg-white/20 backdrop-blur-md w-24 h-24 flex items-center justify-center rounded-[2.5rem] shadow-xl">
                            🤝
                        </div>
                        <div>
                            <span className="text-emerald-200 text-xs font-black uppercase tracking-widest">Community Impact</span>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">Donation Center</h1>
                            <p className="text-white/70 font-medium">Coordinating surplus food distribution</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('../donations')}
                        className="btn-premium px-8 py-4 bg-white text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 text-sm"
                    >
                        Browse Marketplace <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </section>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <MetricCard
                    icon={<Package className="w-6 h-6" />}
                    label="Active Posts"
                    value={stats.totalPosts}
                    color="emerald"
                    sub="Items offered by you"
                />
                <MetricCard
                    icon={<Heart className="w-6 h-6" />}
                    label="Claimed by You"
                    value={stats.claimedByMe}
                    color="pink"
                    sub="Waitlist for pickup"
                />
                <MetricCard
                    icon={<TrendingUp className="w-6 h-6" />}
                    label="Marketplace"
                    value={stats.availableMarketplace}
                    color="blue"
                    sub="New items available"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Items */}
                <section className="glass-card p-8 bg-white/40">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-black text-emerald-950">Recently Added</h2>
                        <button onClick={() => navigate('../donations')} className="text-emerald-600 text-xs font-black uppercase hover:underline">View All</button>
                    </div>
                    <div className="space-y-4">
                        {recentDonations.length > 0 ? (
                            recentDonations.map(donation => (
                                <div key={donation.id} className="p-4 bg-white/80 rounded-2xl border border-emerald-50 flex justify-between items-center transition-all hover:shadow-md">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-xl">🍎</div>
                                        <div>
                                            <h4 className="font-bold text-emerald-950">{donation.item_name}</h4>
                                            <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold uppercase tracking-tighter">
                                                <MapPin className="w-3 h-3" /> {donation.pickup_location || 'Local Area'}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate('../donations')}
                                        className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100"
                                    >
                                        CLAIM
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center text-emerald-900/30 font-bold italic">No new donations yet.</div>
                        )}
                    </div>
                </section>

                {/* Impact Card */}
                <div className="glass-card p-8 bg-gradient-to-br from-indigo-500 to-blue-600 text-white">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-black">Your Impact</h2>
                        <AlertCircle className="w-6 h-6 opacity-50" />
                    </div>
                    <div className="space-y-6">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-white/60 text-xs font-black uppercase tracking-wider mb-1">Total Diverted</p>
                                <h3 className="text-5xl font-black">{stats.impact.total_kg}<span className="text-xl ml-1">kg</span></h3>
                            </div>
                            <div className="text-right">
                                <p className="text-white/60 text-xs font-black uppercase tracking-wider mb-1">People Fed</p>
                                <h3 className="text-3xl font-black">~{stats.impact.people_fed}</h3>
                            </div>
                        </div>
                        <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden">
                            <div className="bg-white h-full" style={{ width: `${Math.min(100, (stats.impact.total_kg / 200) * 100)}%` }}></div>
                        </div>
                        <p className="text-sm font-medium text-white/80">
                            {stats.impact.total_kg >= 200 ? "You've surpassed your community goal! Amazing work!" : `You're ${200 - stats.impact.total_kg}kg away from the community goal of 200kg!`}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ icon, label, value, color, sub }) => {
    const colors = {
        emerald: 'bg-emerald-100 text-emerald-700',
        pink: 'bg-pink-100 text-pink-700',
        blue: 'bg-blue-100 text-blue-700',
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

export default DonationDashboard;
