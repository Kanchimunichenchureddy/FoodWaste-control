import React, { useState, useEffect } from 'react';
import { X, Mic, MicOff, Sparkles } from 'lucide-react';
import VoiceInput from './VoiceInput';
import { useAuth } from '@contexts/AuthContext';
import { supplierService, aiService } from '@services/api';

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
    const [aiPrediction, setAiPrediction] = useState(null);
    const [showAiInsight, setShowAiInsight] = useState(false);

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

    // Get AI waste prediction for the item
    const getAiPrediction = async () => {
        if (!formData.name || !formData.category) {
            alert('Please enter item name and category first');
            return;
        }

        setLoading(true);
        const { data, error } = await aiService.predictWaste(
            formData.name,
            formData.category,
            formData.quantity,
            formData.purchase_price || 0,
            formData.expiry_date || new Date().toISOString().split('T')[0]
        );

        if (!error && data) {
            setAiPrediction(data);
            setShowAiInsight(true);
        } else {
            console.error('Prediction error:', error);
        }
        setLoading(false);
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

                {/* AI Prediction Panel */}
                {showAiInsight && aiPrediction && (
                    <div className="p-4 bg-blue-50 border-b border-blue-200 flex gap-3">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-4 h-4 text-blue-600" />
                                <p className="font-bold text-blue-900">AI Waste Prediction</p>
                            </div>
                            <p className="text-sm text-blue-800 mb-1">
                                <strong>Prediction:</strong> {aiPrediction.prediction}
                            </p>
                            <p className="text-sm text-blue-800 mb-1">
                                <strong>Waste Score:</strong> {aiPrediction.wasteScore}/100
                            </p>
                            {aiPrediction.recommendations && (
                                <p className="text-xs text-blue-700">
                                    💡 {aiPrediction.recommendations[0]}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={() => setShowAiInsight(false)}
                            className="text-blue-600 hover:text-blue-800 font-bold"
                        >
                            ✕
                        </button>
                    </div>
                )}

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
                            type="button"
                            onClick={getAiPrediction}
                            className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-200 transition-all disabled:opacity-50"
                            disabled={loading}
                        >
                            <Sparkles className="w-4 h-4" />
                            {loading ? 'Analyzing...' : 'Get AI Insight'}
                        </button>
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            className="btn-premium flex-1"
                            disabled={loading}
                        >
                            {loading ? 'Adding...' : 'Add Item'}
                        </button>
                    </div>

                    {/* AI Prediction Panel */}
                    {showAiInsight && aiPrediction && (
                        <div className="mt-4 glass-card p-4 bg-blue-50 border border-blue-200">
                            <div className="flex items-start gap-3">
                                <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <h4 className="font-black text-blue-900">AI Waste Risk Analysis</h4>
                                    <div className="mt-2 space-y-1 text-sm text-blue-800">
                                        <p><strong>Waste Score:</strong> {aiPrediction.wasteScore}/100</p>
                                        <p><strong>Prediction:</strong> {aiPrediction.prediction}</p>
                                        {aiPrediction.recommendations && aiPrediction.recommendations.length > 0 && (
                                            <p><strong>Tip:</strong> {aiPrediction.recommendations[0]}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default AddItemModal;
