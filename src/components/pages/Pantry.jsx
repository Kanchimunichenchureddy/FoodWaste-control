import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { pantryService } from '@services/api';
import { usePantry } from '@contexts/PantryContext';
import { Plus, Search, Filter, Grid3x3, List, Download, ScanLine } from 'lucide-react';
import PantryGrid from '@components/pantry/PantryGrid';
import PantryList from '@components/pantry/PantryList';
import AddItemModal from '@components/pantry/AddItemModal';
import EditItemModal from '@components/pantry/EditItemModal';
import PantryFilters from '@components/pantry/PantryFilters';
import ScanReceiptModal from '@components/pantry/ScanReceiptModal';

const Pantry = () => {
    const { currentOrganization, user } = useAuth();
    const location = useLocation();
    const { items, loading: pantryLoading, loadPantryItems, addItem: addItemApi, updateItem: updateItemApi, deleteItem: deleteItemApi, consumeItem: consumeItemApi, bulkAdd: bulkAddApi } = usePantry();
    // local filtered view
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showScanModal, setShowScanModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('expiry_asc'); // expiry_asc, expiry_desc, name_asc, name_desc
    const [showFilters, setShowFilters] = useState(false);

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        expiringSoon: 0,
        expired: 0,
    });

    useEffect(() => {
        // Open scan modal if coming from dashboard with openScan state
        if (location.state?.openScan) {
            setShowScanModal(true);
            // Clear state so it doesn't reopen on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    useEffect(() => {
        // reflect pantry provider loading into local loading state
        setLoading(pantryLoading);
        // recalc stats whenever items from context change
        calculateStats(items || []);
    }, [pantryLoading, items]);

    useEffect(() => {
        filterAndSortItems();
    }, [items, searchQuery, selectedCategory, sortBy]);

    // pantry items are provided by the PantryContext `items`

    const calculateStats = (pantryItems) => {
        const now = new Date();
        let expiringSoon = 0;
        let expired = 0;

        pantryItems.forEach((item) => {
            const expiryDate = new Date(item.expiry_date);
            const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

            if (daysLeft < 0) {
                expired++;
            } else if (daysLeft <= 7) {
                expiringSoon++;
            }
        });

        setStats({
            total: pantryItems.length,
            expiringSoon,
            expired,
        });
    };

    const filterAndSortItems = () => {
        let result = [...items];

        // Search filter
        if (searchQuery) {
            result = result.filter((item) =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Category filter
        if (selectedCategory !== 'All') {
            result = result.filter((item) => item.category === selectedCategory);
        }

        // Sort
        result.sort((a, b) => {
            switch (sortBy) {
                case 'expiry_asc':
                    return new Date(a.expiry_date) - new Date(b.expiry_date);
                case 'expiry_desc':
                    return new Date(b.expiry_date) - new Date(a.expiry_date);
                case 'name_asc':
                    return a.name.localeCompare(b.name);
                case 'name_desc':
                    return b.name.localeCompare(a.name);
                default:
                    return 0;
            }
        });

        setFilteredItems(result);
    };

    const handleAddItem = async (itemData) => {
        try {
            await addItemApi({
                ...itemData,
                organization_id: currentOrganization?.id,
                user_id: currentOrganization ? null : user?.id,
            });
            setShowAddModal(false);
        } catch (error) {
            console.error('Error adding item:', error);
            alert('Failed to add item. Please try again.');
        }
    };

    const handleEditItem = async (itemData) => {
        try {
            await updateItemApi(selectedItem.id, itemData);
            setShowEditModal(false);
            setSelectedItem(null);
        } catch (error) {
            console.error('Error updating item:', error);
            alert('Failed to update item. Please try again.');
        }
    };

    const handleDeleteItem = async (itemId) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;

        try {
            await deleteItemApi(itemId);
        } catch (error) {
            console.error('Error deleting item:', error);
            alert('Failed to delete item. Please try again.');
        }
    };

    const handleToggleSelect = (itemId) => {
        setSelectedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const handleSelectAll = (selectAll) => {
        if (selectAll) {
            setSelectedItems(filteredItems.map(item => item.id));
        } else {
            setSelectedItems([]);
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete ${selectedItems.length} items?`)) return;

        try {
            // delete items one by one via service (backend doesn't support bulk delete endpoint)
            await Promise.all(selectedItems.map(id => deleteItemApi(id)));
            setSelectedItems([]);
        } catch (error) {
            console.error('Error bulk deleting:', error);
            alert('Failed to delete items.');
        }
    };

    const handleConsumeItem = async (itemId) => {
        try {
            await consumeItemApi(itemId);
        } catch (error) {
            console.error('Error consuming item:', error);
            alert('Failed to consume item. Please try again.');
        }
    };

    const handleOpenEdit = (item) => {
        setSelectedItem(item);
        setShowEditModal(true);
    };

    const handleBulkAddFromScan = async (scannedItems) => {
        try {
            const prepared = scannedItems.map(i => ({ ...i, organization_id: currentOrganization?.id, user_id: currentOrganization ? null : user?.id }));
            const newItems = await bulkAddApi(prepared);
            alert(`Successfully added ${newItems.length} items from receipt!`);
        } catch (error) {
            console.error('Error adding scanned items:', error);
            alert('Failed to add some items. Please try again.');
        }
    };

    const exportToCSV = () => {
        const headers = ['Name', 'Category', 'Quantity', 'Unit', 'Expiry Date', 'Location'];
        const rows = filteredItems.map((item) => [
            item.name,
            item.category,
            item.quantity,
            item.unit,
            item.expiry_date,
            item.location || 'N/A',
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map((row) => row.join(',')),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `pantry_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20 animate-slide-up">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-emerald-950">Pantry Management</h1>
                    <p className="text-emerald-600 font-medium mt-1">
                        {stats.total} items • {stats.expiringSoon} expiring soon • {stats.expired} expired
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowScanModal(true)}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <ScanLine className="w-5 h-5" />
                        Scan Receipt
                    </button>
                    <button
                        onClick={exportToCSV}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <Download className="w-5 h-5" />
                        Export
                    </button>
                    {selectedItems.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="bg-red-100 text-red-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-red-200 transition-all"
                        >
                            <span className="bg-red-200 px-2 py-0.5 rounded-md text-xs">
                                {selectedItems.length}
                            </span>
                            Delete Selected
                        </button>
                    )}
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="btn-premium flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Add Item
                    </button>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="glass-card p-6 bg-white/40">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input-primary pl-12 w-full"
                        />
                    </div>

                    {/* View Toggle */}
                    <div className="flex items-center gap-2 bg-white/60 rounded-2xl p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-xl transition-all ${viewMode === 'grid'
                                ? 'bg-emerald-600 text-white'
                                : 'text-emerald-600 hover:bg-emerald-50'
                                }`}
                        >
                            <Grid3x3 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-xl transition-all ${viewMode === 'list'
                                ? 'bg-emerald-600 text-white'
                                : 'text-emerald-600 hover:bg-emerald-50'
                                }`}
                        >
                            <List className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Select All Checkbox */}
                    <div className="flex items-center gap-2 px-3">
                        <input
                            type="checkbox"
                            checked={selectedItems.length > 0 && selectedItems.length === filteredItems.length}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300"
                        />
                        <span className="text-sm font-medium text-emerald-800 hidden md:inline">Select All</span>
                    </div>

                    {/* Filter Toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`btn-secondary flex items-center gap-2 ${showFilters ? 'bg-emerald-100' : ''
                            }`}
                    >
                        <Filter className="w-5 h-5" />
                        Filters
                    </button>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <PantryFilters
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                    />
                )}
            </div>

            {/* Items Display */}
            {filteredItems.length > 0 ? (
                viewMode === 'grid' ? (
                    <PantryGrid
                        items={filteredItems}
                        onEdit={handleOpenEdit}
                        onDelete={handleDeleteItem}
                        selectedItems={selectedItems}
                        onToggleSelect={handleToggleSelect}
                    />
                ) : (
                    <PantryList
                        items={filteredItems}
                        onEdit={handleOpenEdit}
                        onDelete={handleDeleteItem}
                        selectedItems={selectedItems}
                        onToggleSelect={handleToggleSelect}
                    />
                )
            ) : (
                <div className="glass-card p-12 bg-white/40 text-center">
                    <div className="text-6xl mb-4">📦</div>
                    <h3 className="text-xl font-black text-emerald-950 mb-2">
                        {searchQuery || selectedCategory !== 'All'
                            ? 'No items found'
                            : 'Your pantry is empty'}
                    </h3>
                    <p className="text-emerald-600 mb-6">
                        {searchQuery || selectedCategory !== 'All'
                            ? 'Try adjusting your filters'
                            : 'Start by adding your first item'}
                    </p>
                    {!searchQuery && selectedCategory === 'All' && (
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="btn-premium inline-flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Add First Item
                        </button>
                    )}
                </div>
            )}

            {/* Modals */}
            {showAddModal && (
                <AddItemModal
                    onClose={() => setShowAddModal(false)}
                    onAdd={handleAddItem}
                />
            )}

            {showEditModal && selectedItem && (
                <EditItemModal
                    item={selectedItem}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedItem(null);
                    }}
                    onUpdate={handleEditItem}
                    onConsume={handleConsumeItem}
                />
            )}

            {showScanModal && (
                <ScanReceiptModal
                    onClose={() => setShowScanModal(false)}
                    onItemsExtracted={handleBulkAddFromScan}
                />
            )}
        </div>
    );
};

export default Pantry;
