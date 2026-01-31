import React from 'react';
import { Edit2, Trash2, MapPin, Package } from 'lucide-react';

const PantryItem = ({ item, onEdit, onDelete, viewMode = 'grid', isSelected = false, onToggleSelect }) => {
    // Calculate days until expiry
    const getDaysUntilExpiry = () => {
        const now = new Date();
        const expiryDate = new Date(item.expiry_date);
        return Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
    };

    const daysLeft = getDaysUntilExpiry();

    // Determine status color
    const getStatusColor = () => {
        if (daysLeft < 0) return 'red';
        if (daysLeft <= 3) return 'orange';
        if (daysLeft <= 7) return 'yellow';
        return 'green';
    };

    const statusColor = getStatusColor();
    const colorClasses = {
        red: 'bg-red-100 border-red-300 text-red-700',
        orange: 'bg-orange-100 border-orange-300 text-orange-700',
        yellow: 'bg-yellow-100 border-yellow-300 text-yellow-700',
        green: 'bg-green-100 border-green-300 text-green-700',
    };

    // Category emoji
    const categoryEmojis = {
        Produce: '🥬',
        Dairy: '🥛',
        Meat: '🥩',
        Grains: '🌾',
        Beverages: '🥤',
        Snacks: '🍿',
        Frozen: '❄️',
        Bakery: '🥖',
        Other: '📦',
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    if (viewMode === 'grid') {
        return (
            <div className="glass-card p-5 bg-white/60 hover:bg-white/80 transition-all group relative">
                {/* Status Badge */}
                <div
                    className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-black uppercase ${colorClasses[statusColor]}`}
                >
                    {daysLeft < 0 ? 'Expired' : daysLeft === 0 ? 'Today' : `${daysLeft}d`}
                </div>

                {/* Selection Checkbox (Grid) */}
                <div className="absolute top-3 left-3 z-10">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(item.id)}
                        className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300 shadow-sm cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>

                {/* Category Icon */}
                <div className="text-5xl mb-3 mt-4">{categoryEmojis[item.category] || '📦'}</div>

                {/* Item Details */}
                <h3 className="text-lg font-black text-emerald-950 mb-2 pr-16">{item.name}</h3>

                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-emerald-600">
                        <Package className="w-4 h-4" />
                        <span className="font-bold">
                            {item.quantity} {item.unit}
                        </span>
                    </div>

                    <div className="text-emerald-500">
                        <span className="font-semibold">Expires:</span> {formatDate(item.expiry_date)}
                    </div>

                    {item.location && (
                        <div className="flex items-center gap-2 text-emerald-500">
                            <MapPin className="w-4 h-4" />
                            <span className="text-xs">{item.location}</span>
                        </div>
                    )}

                    {item.batch_number && (
                        <div className="text-xs text-emerald-400">
                            Batch: {item.batch_number}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onEdit(item)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete(item.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-xl text-sm font-bold transition-all"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    }

    // List View
    return (
        <div className={`p-4 hover:bg-emerald-50/50 transition-all flex items-center gap-4 group ${isSelected ? 'bg-emerald-50/80 border-l-4 border-emerald-500' : ''}`}>
            {/* Selection Checkbox (List) */}
            <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleSelect(item.id)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300 cursor-pointer"
                onClick={(e) => e.stopPropagation()}
            />

            {/* Icon */}
            <div className="text-3xl flex-shrink-0">{categoryEmojis[item.category] || '📦'}</div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <h4 className="font-black text-emerald-950 truncate">{item.name}</h4>
                <div className="flex items-center gap-4 mt-1 text-sm text-emerald-600">
                    <span className="font-bold">
                        {item.quantity} {item.unit}
                    </span>
                    <span>•</span>
                    <span>{item.category}</span>
                    {item.location && (
                        <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {item.location}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Expiry */}
            <div className="flex-shrink-0 text-right">
                <div
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase mb-1 ${colorClasses[statusColor]}`}
                >
                    {daysLeft < 0 ? 'Expired' : daysLeft === 0 ? 'Today' : `${daysLeft} days`}
                </div>
                <div className="text-xs text-emerald-500">{formatDate(item.expiry_date)}</div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onEdit(item)}
                    className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all"
                >
                    <Edit2 className="w-4 h-4" />
                </button>
                <button
                    onClick={() => onDelete(item.id)}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default PantryItem;
