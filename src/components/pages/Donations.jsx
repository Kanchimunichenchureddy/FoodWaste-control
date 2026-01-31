import React, { useState, useEffect } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { donationService } from '@services/api';
import {
    Heart,
    MapPin,
    Calendar,
    Package,
    Plus,
    Search,
    Loader2,
    CheckCircle,
    Clock
} from 'lucide-react';

const Donations = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('marketplace'); // marketplace, my-posts, my-claims
    const [donations, setDonations] = useState([]);
    const [showPostModal, setShowPostModal] = useState(false);

    // New Donation Form State
    const [newItem, setNewItem] = useState({
        item_name: '',
        description: '',
        quantity: '',
        unit: 'kg',
        category: 'Produce',
        expiry_date: '',
        pickup_location: '',
        pickup_window: ''
    });

    useEffect(() => {
        loadDonations();
    }, [view]);

    const loadDonations = async () => {
        setLoading(true);
        try {
            let res;
            if (view === 'marketplace') res = await donationService.getAvailableDonations();
            else if (view === 'my-posts') res = await donationService.getMyDonations();
            else if (view === 'my-claims') res = await donationService.getMyClaims();

            if (res.data) setDonations(res.data);
        } catch (error) {
            console.error("Failed to load donations", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateDonation = async (e) => {
        e.preventDefault();
        const { error } = await donationService.createDonation(newItem);
        if (!error) {
            setShowPostModal(false);
            setNewItem({
                item_name: '',
                description: '',
                quantity: '',
                unit: 'kg',
                category: 'Produce',
                expiry_date: '',
                pickup_location: '',
                pickup_window: ''
            });
            if (view === 'marketplace') loadDonations(); // Refresh
            else setView('marketplace');
        } else {
            alert('Failed to create donation');
        }
    };

    const handleClaim = async (id) => {
        if (!window.confirm("Are you sure you want to claim this donation?")) return;
        const { error } = await donationService.claimDonation(id);
        if (!error) {
            alert("Donation claimed! Please arrange pickup.");
            loadDonations();
        } else {
            alert("Failed to claim: " + error.message);
        }
    };

    const handleComplete = async (id) => {
        const { error } = await donationService.completeDonation(id);
        if (!error) loadDonations();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-emerald-950">Donation Marketplace</h1>
                    <p className="text-emerald-600 font-medium">Share surplus food with your community</p>
                </div>
                <button
                    onClick={() => setShowPostModal(true)}
                    className="btn-premium flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Post Donation
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-emerald-100 overflow-x-auto">
                <button
                    onClick={() => setView('marketplace')}
                    className={`px-4 py-2 font-bold whitespace-nowrap ${view === 'marketplace' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-emerald-900/40 hover:text-emerald-700'}`}
                >
                    Available Donations
                </button>
                <button
                    onClick={() => setView('my-posts')}
                    className={`px-4 py-2 font-bold whitespace-nowrap ${view === 'my-posts' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-emerald-900/40 hover:text-emerald-700'}`}
                >
                    My Posts
                </button>
                <button
                    onClick={() => setView('my-claims')}
                    className={`px-4 py-2 font-bold whitespace-nowrap ${view === 'my-claims' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-emerald-900/40 hover:text-emerald-700'}`}
                >
                    My Claims
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {donations.length === 0 && (
                        <div className="col-span-full text-center py-12 text-emerald-900/40 font-medium">
                            No donations found in this section.
                        </div>
                    )}
                    {donations.map(donation => (
                        <div key={donation.id} className="glass-card p-0 overflow-hidden flex flex-col">
                            <div className="h-32 bg-emerald-100 flex items-center justify-center relative">
                                <Heart className="w-12 h-12 text-emerald-300" />
                                <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 rounded-lg text-xs font-bold text-emerald-800 uppercase">
                                    {donation.category}
                                </div>
                                {donation.status !== 'available' && (
                                    <div className={`absolute bottom-2 right-2 px-2 py-1 rounded-lg text-xs font-bold uppercase text-white ${donation.status === 'completed' ? 'bg-gray-500' : 'bg-blue-500'}`}>
                                        {donation.status}
                                    </div>
                                )}
                            </div>
                            <div className="p-5 flex-1 flex flex-col gap-3">
                                <div>
                                    <h3 className="text-lg font-black text-emerald-950">{donation.item_name}</h3>
                                    <p className="text-emerald-600 text-sm font-medium">{donation.quantity} {donation.unit}</p>
                                </div>

                                {donation.donor_name && (
                                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 p-2 rounded-lg">
                                        <Package className="w-4 h-4" />
                                        By: {donation.donor_name}
                                    </div>
                                )}

                                <div className="space-y-2 mt-auto">
                                    <div className="flex items-start gap-2 text-sm text-emerald-900/70">
                                        <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                                        <span>{donation.pickup_location || 'No location'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-emerald-900/70">
                                        <Calendar className="w-4 h-4 shrink-0" />
                                        <span>Exp: {new Date(donation.expiry_date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-emerald-900/70">
                                        <Clock className="w-4 h-4 shrink-0" />
                                        <span>Pickup: {donation.pickup_window || 'Anytime'}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="pt-4 mt-2 border-t border-emerald-100">
                                    {view === 'marketplace' && donation.organization_id !== user.organization_id && (
                                        <button
                                            onClick={() => handleClaim(donation.id)}
                                            className="w-full btn-secondary py-2 text-sm"
                                        >
                                            Claim Donation
                                        </button>
                                    )}
                                    {view === 'my-posts' && donation.status === 'claimed' && (
                                        <button
                                            onClick={() => handleComplete(donation.id)}
                                            className="w-full btn-primary py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white"
                                        >
                                            Mark Completed
                                        </button>
                                    )}
                                    {view === 'my-claims' && (
                                        <div className="text-center text-sm font-bold text-emerald-600">
                                            {donation.status === 'completed' ? 'Received ✅' : 'Claimed - pending pickup'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Post Modal */}
            {showPostModal && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl animate-scale-in">
                        <h2 className="text-2xl font-black text-emerald-950 mb-6">Post a Donation</h2>
                        <form onSubmit={handleCreateDonation} className="space-y-4">
                            <div>
                                <label className="label">Item Name</label>
                                <input
                                    className="input-primary"
                                    value={newItem.item_name}
                                    onChange={e => setNewItem({ ...newItem, item_name: e.target.value })}
                                    required
                                    placeholder="e.g. Surplus Bagels"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Quantity</label>
                                    <input
                                        type="number"
                                        className="input-primary"
                                        value={newItem.quantity}
                                        onChange={e => setNewItem({ ...newItem, quantity: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="label">Unit</label>
                                    <select
                                        className="input-primary"
                                        value={newItem.unit}
                                        onChange={e => setNewItem({ ...newItem, unit: e.target.value })}
                                    >
                                        <option value="kg">kg</option>
                                        <option value="lbs">lbs</option>
                                        <option value="items">items</option>
                                        <option value="portions">portions</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Category</label>
                                    <select
                                        className="input-primary"
                                        value={newItem.category}
                                        onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                                    >
                                        <option value="Produce">Produce</option>
                                        <option value="Dairy">Dairy</option>
                                        <option value="Bakery">Bakery</option>
                                        <option value="Canned">Canned</option>
                                        <option value="Meals">Meals</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Expiry Date</label>
                                    <input
                                        type="date"
                                        className="input-primary"
                                        value={newItem.expiry_date}
                                        onChange={e => setNewItem({ ...newItem, expiry_date: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="label">Pickup Location</label>
                                <input
                                    className="input-primary"
                                    value={newItem.pickup_location}
                                    onChange={e => setNewItem({ ...newItem, pickup_location: e.target.value })}
                                    placeholder="e.g. Back entrance, 123 Main St"
                                />
                            </div>
                            <div>
                                <label className="label">Pickup Window</label>
                                <input
                                    className="input-primary"
                                    value={newItem.pickup_window}
                                    onChange={e => setNewItem({ ...newItem, pickup_window: e.target.value })}
                                    placeholder="e.g. Mon-Fri 9am-5pm"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowPostModal(false)} className="btn-secondary flex-1">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-premium flex-1">
                                    Post Donation
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Donations;
