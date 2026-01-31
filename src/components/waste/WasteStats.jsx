import React from 'react';
import { TrendingDown, DollarSign, Scale, Leaf } from 'lucide-react';

const WasteStats = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Total Waste */}
            <div className="glass-card p-6 bg-white/60">
                <div className="flex items-center justify-between mb-2">
                    <div className="p-3 bg-red-100 rounded-xl text-red-600">
                        <Scale className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold px-2 py-1 bg-red-50 text-red-600 rounded-full">
                        Total Mass
                    </span>
                </div>
                <h3 className="text-3xl font-black text-emerald-950">{stats.totalWaste} <span className="text-lg text-emerald-600">kg</span></h3>
                <p className="text-sm text-emerald-600 mt-1">Total wasted quantity</p>
            </div>

            {/* Total Cost */}
            <div className="glass-card p-6 bg-white/60">
                <div className="flex items-center justify-between mb-2">
                    <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full">
                        Financial Impact
                    </span>
                </div>
                <h3 className="text-3xl font-black text-emerald-950">₹{stats.totalCost}</h3>
                <p className="text-sm text-emerald-600 mt-1">Estimated value lost</p>
            </div>

            {/* Carbon Footprint */}
            <div className="glass-card p-6 bg-white/60">
                <div className="flex items-center justify-between mb-2">
                    <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                        <Leaf className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold px-2 py-1 bg-blue-50 text-blue-600 rounded-full">
                        Environmental
                    </span>
                </div>
                <h3 className="text-3xl font-black text-emerald-950">{stats.carbonFootprint} <span className="text-lg text-emerald-600">kg</span></h3>
                <p className="text-sm text-emerald-600 mt-1">CO2 equivalent emissions</p>
            </div>

            {/* Top Category */}
            <div className="glass-card p-6 bg-white/60">
                <div className="flex items-center justify-between mb-2">
                    <div className="p-3 bg-orange-100 rounded-xl text-orange-600">
                        <TrendingDown className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold px-2 py-1 bg-orange-50 text-orange-600 rounded-full">
                        Highest Waste
                    </span>
                </div>
                <h3 className="text-xl font-black text-emerald-950 truncate">{stats.mostWastedCategory}</h3>
                <p className="text-sm text-emerald-600 mt-1">Top category by frequency</p>
            </div>
        </div>
    );
};

export default WasteStats;
