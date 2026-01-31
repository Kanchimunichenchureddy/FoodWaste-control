import React, { useState, useEffect } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { supplierService } from '@services/api';
import { Truck, Plus, Search, Edit2, Trash2, Phone, Mail, MapPin, Loader2, X } from 'lucide-react';

const Suppliers = () => {
    const { user } = useAuth();
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        contact_info: '',
        sector_category: 'Produce'
    });

    useEffect(() => {
        loadSuppliers();
    }, []);

    const loadSuppliers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supplierService.getSuppliers();
            if (error) throw error;
            setSuppliers(data || []);
        } catch (error) {
            console.error('Error loading suppliers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingSupplier) {
                const { error } = await supplierService.updateSupplier(editingSupplier.id, formData);
                if (error) throw error;
            } else {
                const { error } = await supplierService.createSupplier(formData);
                if (error) throw error;
            }
            setShowModal(false);
            setEditingSupplier(null);
            setFormData({ name: '', contact_info: '', sector_category: 'Produce' });
            loadSuppliers();
        } catch (error) {
            alert('Error saving supplier: ' + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this supplier?')) return;
        try {
            const { error } = await supplierService.deleteSupplier(id);
            if (error) throw error;
            loadSuppliers();
        } catch (error) {
            alert('Error deleting supplier: ' + error.message);
        }
    };

    const handleEdit = (supplier) => {
        setEditingSupplier(supplier);
        setFormData({
            name: supplier.name,
            contact_info: supplier.contact_info || '',
            sector_category: supplier.sector_category || 'Produce'
        });
        setShowModal(true);
    };

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.sector_category && s.sector_category.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-emerald-950">Supplier Management</h1>
                    <p className="text-emerald-600 font-medium">Manage your network of food providers</p>
                </div>
                <button
                    onClick={() => {
                        setEditingSupplier(null);
                        setFormData({ name: '', contact_info: '', sector_category: 'Produce' });
                        setShowModal(true);
                    }}
                    className="btn-premium flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Add Supplier
                </button>
            </div>

            <div className="glass-card p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
                    <input
                        type="text"
                        placeholder="Search suppliers by name or category..."
                        className="input-primary pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSuppliers.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-emerald-900/40 font-medium">
                            No suppliers found.
                        </div>
                    ) : (
                        filteredSuppliers.map((supplier) => (
                            <div key={supplier.id} className="glass-card p-6 flex flex-col hover:shadow-xl transition-shadow group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                                        <Truck className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(supplier)}
                                            className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(supplier.id)}
                                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-xl font-black text-emerald-950 mb-1">{supplier.name}</h3>
                                <span className="inline-block px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg uppercase tracking-wider mb-4">
                                    {supplier.sector_category}
                                </span>

                                <div className="space-y-3 pt-4 border-t border-emerald-50 flex-1">
                                    <div className="flex items-start gap-3 text-sm text-emerald-900/70">
                                        <Phone className="w-4 h-4 mt-0.5 text-emerald-600" />
                                        <p className="line-clamp-2">{supplier.contact_info || 'No contact info provided'}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl animate-scale-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-emerald-950">
                                {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-emerald-50 rounded-xl transition-colors">
                                <X className="w-6 h-6 text-emerald-900/40" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="label">Supplier Name</label>
                                <input
                                    type="text"
                                    required
                                    className="input-primary"
                                    placeholder="e.g. Fresh Farms Ltd"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="label">Category</label>
                                <select
                                    className="input-primary"
                                    value={formData.sector_category}
                                    onChange={(e) => setFormData({ ...formData, sector_category: e.target.value })}
                                >
                                    <option value="Produce">Produce</option>
                                    <option value="Dairy">Dairy</option>
                                    <option value="Meat">Meat</option>
                                    <option value="Bakery">Bakery</option>
                                    <option value="Logistics">Logistics</option>
                                    <option value="Packaging">Packaging</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">Contact Info (Phone/Email)</label>
                                <textarea
                                    className="input-primary min-h-[100px] py-3"
                                    placeholder="e.g. Phone: +91 9876543210&#10;Email: contact@freshfarms.com"
                                    value={formData.contact_info}
                                    onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="btn-secondary flex-1"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-premium flex-1">
                                    {editingSupplier ? 'Save Changes' : 'Add Supplier'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Suppliers;
