import React, { useState, useEffect } from 'react';
import { X, Mic, MicOff } from 'lucide-react';
import VoiceInput from './VoiceInput';
import { useAuth } from '@contexts/AuthContext';
import { supplierService } from '@services/api';

const AddItemModal = ({ onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: 'Produce',
        quantity: 1,
        unit: 'pcs',
        expiry_date: '',
        batch_number: '',
        location: '',
        purchase_price: '',
        notes: '',
    });

    const { currentOrganization } = useAuth();
    const [suppliers, setSuppliers] = useState([]);
    const [isListening, setIsListening] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (currentOrganization) {
            loadSuppliers();
        }
    }, [currentOrganization]);

    const loadSuppliers = async () => {
        const { data } = await supplierService.getSuppliers(currentOrganization.id);
        if (data) setSuppliers(data);
    };

    const categories = [
        'Produce',
        'Dairy',
        'Meat',
        'Grains',
        'Beverages',
        'Snacks',
        'Frozen',
        'Bakery',
        'Other',
    ];

    const units = ['pcs', 'kg', 'g', 'l', 'ml', 'lb', 'oz', 'box', 'bag', 'can'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleVoiceResult = (transcript) => {
        setFormData({ ...formData, name: transcript });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.expiry_date) {
            alert('Name and expiry date are required');
            return;
        }

        setLoading(true);
        await onAdd(formData);
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="glass-card bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-emerald-100">
                    <h2 className="text-2xl font-black text-emerald-950">Add Pantry Item</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-emerald-100 rounded-xl transition-all"
                    >
                        <X className="w-6 h-6 text-emerald-600" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Item Name with Voice Input */}
                    <div>
                        <label className="block text-sm font-bold text-emerald-900 mb-2">
                            Item Name *
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="input-primary flex-1"
                                placeholder="e.g., Fresh Tomatoes"
                                required
                            />
                            <VoiceInput
                                onResult={handleVoiceResult}
                                isListening={isListening}
                                setIsListening={setIsListening}
                            />
                        </div>
                        {isListening && (
                            <p className="text-xs text-emerald-600 mt-2 animate-pulse">
                                🎤 Listening...
                            </p>
                        )}
                    </div>

                    {/* Category & Quantity Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-emerald-900 mb-2">
                                Category *
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="input-primary w-full"
                                required
                            >
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-emerald-900 mb-2">
                                Quantity & Unit *
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    className="input-primary w-1/2"
                                    min="0.01"
                                    step="0.01"
                                    required
                                />
                                <select
                                    name="unit"
                                    value={formData.unit}
                                    onChange={handleChange}
                                    className="input-primary w-1/2"
                                    required
                                >
                                    {units.map((unit) => (
                                        <option key={unit} value={unit}>
                                            {unit}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Expiry Date & Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-emerald-900 mb-2">
                                Expiry Date *
                            </label>
                            <input
                                type="date"
                                name="expiry_date"
                                value={formData.expiry_date}
                                onChange={handleChange}
                                className="input-primary w-full"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-emerald-900 mb-2">
                                Location
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className="input-primary w-full"
                                placeholder="e.g., Main Fridge, Dry Storage"
                            />
                        </div>
                    </div>

                    {/* Batch Number & Price */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-emerald-900 mb-2">
                                Batch Number (Optional)
                            </label>
                            <input
                                type="text"
                                name="batch_number"
                                value={formData.batch_number}
                                onChange={handleChange}
                                className="input-primary w-full"
                                placeholder="e.g., B12345"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-emerald-900 mb-2">
                                Purchase Price (Optional)
                            </label>
                            <input
                                type="number"
                                name="purchase_price"
                                value={formData.purchase_price}
                                onChange={handleChange}
                                className="input-primary w-full"
                                placeholder="₹0.00"
                                min="0"
                                step="0.01"
                            />
                        </div>
                    </div>

                    {/* Supplier (Business Only) */}
                    {currentOrganization && (
                        <div>
                            <label className="block text-sm font-bold text-emerald-900 mb-2">
                                Supplier
                            </label>
                            <select
                                name="supplier_id"
                                value={formData.supplier_id || ''}
                                onChange={handleChange}
                                className="input-primary w-full"
                            >
                                <option value="">Select Supplier</option>
                                {suppliers.map((supplier) => (
                                    <option key={supplier.id} value={supplier.id}>
                                        {supplier.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-bold text-emerald-900 mb-2">
                            Notes (Optional)
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            className="input-primary w-full min-h-[80px]"
                            placeholder="Any additional information..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary flex-1"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-premium flex-1"
                            disabled={loading}
                        >
                            {loading ? 'Adding...' : 'Add Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddItemModal;
