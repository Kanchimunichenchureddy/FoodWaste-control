import React from 'react';
import { Clock, DollarSign, Leaf } from 'lucide-react';

const WasteList = ({ logs }) => {
    if (!logs.length) {
        return (
            <div className="text-center py-12 bg-white/40 rounded-3xl border border-emerald-100 border-dashed">
                <div className="text-4xl mb-3">✅</div>
                <h3 className="text-xl font-bold text-emerald-900">No Waste Logged Yet</h3>
                <p className="text-emerald-600 mt-1">This list shows only your real entries. Log waste to see your data here.</p>
            </div>
        );
    }

    return (
        <div className="glass-card bg-white/40 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-emerald-100 text-left bg-emerald-50/50">
                            <th className="p-4 text-sm font-bold text-emerald-900">Date/Time</th>
                            <th className="p-4 text-sm font-bold text-emerald-900">Item Name</th>
                            <th className="p-4 text-sm font-bold text-emerald-900">Category</th>
                            <th className="p-4 text-sm font-bold text-emerald-900">Reason</th>
                            <th className="p-4 text-sm font-bold text-emerald-900">Quantity</th>
                            <th className="p-4 text-sm font-bold text-emerald-900">Est. Cost</th>
                            <th className="p-4 text-sm font-bold text-emerald-900">Impact</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-100">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-white/50 transition-colors">
                                <td className="p-4 text-sm text-emerald-700">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 opacity-50" />
                                        {new Date(log.logged_at).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="p-4 font-bold text-emerald-950">{log.item_name}</td>
                                <td className="p-4 text-sm">
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                        {log.category}
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-emerald-700">{log.reason ?? log.waste_reason ?? '—'}</td>
                                <td className="p-4 font-mono font-bold text-emerald-800">
                                    {log.quantity} {log.unit}
                                </td>
                                <td className="p-4 text-sm font-bold text-emerald-700">
                                    ₹{log.cost ?? log.cost_estimate ?? '0.00'}
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                                        <Leaf className="w-3 h-3" />
                                        {log.carbon_footprint ?? '—'} kg
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default WasteList;
