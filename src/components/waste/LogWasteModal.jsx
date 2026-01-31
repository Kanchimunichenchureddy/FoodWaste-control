import React, { useState } from 'react';
import { X } from 'lucide-react';

const LogWasteModal = ({ onClose, onLog, initialData }) => {
    const [formData, setFormData] = useState({
        item_name: initialData?.name || '',
        category: initialData?.category || 'Produce',
        quantity: initialData?.quantity || 1,
        unit: initialData?.unit || 'kg',
        waste_reason: 'Expired',
        cost_estimate: initialData?.purchase_price || '',
        notes: '',
        pantry_item_id: initialData?.id || null, // Link to pantry item if applicable
    });

    const [loading, setLoading] = useState(false);

    const categories = [
        'Produce', 'Dairy', 'Meat', 'Grains', 'Beverages',
        'Snacks', 'Frozen', 'Bakery', 'Other'
    ];

    const reasons = [
        'Expired', 'Spoiled', 'Over-preparation',
        'Customer Leftover', 'Quality Issue', 'Damaged', 'Other'
    ];

    const units = ['kg', 'g', 'lbs', 'oz', 'pcs', 'l', 'ml'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const calculateCarbon = () => {
        // Very simplified carbon calculation (kg CO2e per kg of food)
        // In a real app, this would use a more detailed database
        const factors = {
            'Meat': 20, // High impact
            'Dairy': 8,
            'Frozen': 5,
            'Bakery': 2,
            'Grains': 1.5,
            'Produce': 1,
            'Beverages': 0.5,
            'Other': 2
        };

        let weightInKg = parseFloat(formData.quantity);
        if (formData.unit === 'g') weightInKg /= 1000;
        if (formData.unit === 'lbs') weightInKg *= 0.453;
        // ... other conversions

        if (isNaN(weightInKg)) return 0;

        const factor = factors[formData.category] || 2;
        return (weightInKg * factor).toFixed(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const carbon_footprint = calculateCarbon();

        await onLog({
            ...formData,
            carbon_footprint: parseFloat(carbon_footprint),
            logged_at: new Date().toISOString()
        });

        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="glass-card bg-white max-w-lg w-full max-h-[90vh] overflow-y-auto animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-emerald-100">
                    <h2 className="text-2xl font-black text-emerald-950">Log Food Waste</h2>
                    <button onClick={onClose} className="p-2 hover:bg-emerald-100 rounded-xl transition-all">
                        <X className="w-6 h-6 text-emerald-600" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-emerald-900 mb-2">Item Name *</label>
                        <input
                            type="text"
                            name="item_name"
                            value={formData.item_name}
                            onChange={handleChange}
                            className="input-primary w-full"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-emerald-900 mb-2">Category *</label>
                            <select name="category" value={formData.category} onChange={handleChange} className="input-primary w-full" required>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-emerald-900 mb-2">Reason *</label>
                            <select name="waste_reason" value={formData.waste_reason} onChange={handleChange} className="input-primary w-full" required>
                                {reasons.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-emerald-900 mb-2">Quantity *</label>
                            <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} className="input-primary w-full" min="0" step="0.01" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-emerald-900 mb-2">Unit *</label>
                            <select name="unit" value={formData.unit} onChange={handleChange} className="input-primary w-full" required>
                                {units.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-emerald-900 mb-2">Estimated Cost (Optional)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 font-bold">₹</span>
                            <input
                                type="number"
                                name="cost_estimate"
                                value={formData.cost_estimate}
                                onChange={handleChange}
                                className="input-primary w-full pl-8"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-emerald-900 mb-2">Notes</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            className="input-primary w-full min-h-[80px]"
                        />
                    </div>

                    <div className="bg-emerald-50 p-4 rounded-xl flex items-center gap-3">
                        <div className="text-2xl">🌍</div>
                        <div>
                            <p className="text-sm font-bold text-emerald-900">Estimated Impact</p>
                            <p className="text-xs text-emerald-600">This waste generates approx. <strong>{calculateCarbon()} kg CO2e</strong></p>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1" disabled={loading}>Cancel</button>
                        <button type="submit" className="btn-premium flex-1" disabled={loading}>
                            {loading ? 'Logging...' : 'Confirm Waste'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LogWasteModal;
