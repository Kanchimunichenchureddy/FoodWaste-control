import React, { useState, useEffect } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { wasteLogService, pantryService } from '@services/api';
import { Plus, Download, Filter, Trash2 } from 'lucide-react';
import WasteList from '@components/waste/WasteList';
import WasteStats from '@components/waste/WasteStats';
import LogWasteModal from '@components/waste/LogWasteModal';
import WasteFilters from '@components/waste/WasteFilters';

const WasteLogs = () => {
    const { currentOrganization, user } = useAuth();
    const [logs, setLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modals
    const [showLogModal, setShowLogModal] = useState(false);
    const [selectedPantryItem, setSelectedPantryItem] = useState(null); // If logging from pantry

    // Filters
    const [dateRange, setDateRange] = useState('month'); // week, month, year, all
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showFilters, setShowFilters] = useState(false);

    // Stats
    const [stats, setStats] = useState({
        totalWaste: 0, // kg
        totalCost: 0,  // currency
        carbonFootprint: 0, // kg CO2
        mostWastedCategory: '',
    });

    useEffect(() => {
        loadWasteLogs();
    }, [currentOrganization, user, dateRange]);

    useEffect(() => {
        filterLogs();
    }, [logs, selectedCategory]);

    const loadWasteLogs = async () => {
        setLoading(true);
        try {
            // Calculate date range
            const endDate = new Date();
            let startDate = new Date();

            if (dateRange === 'week') startDate.setDate(endDate.getDate() - 7);
            if (dateRange === 'month') startDate.setMonth(endDate.getMonth() - 1);
            if (dateRange === 'year') startDate.setFullYear(endDate.getFullYear() - 1);
            if (dateRange === 'all') startDate = null;

            const { data, error } = await wasteLogService.getWasteLogs(
                currentOrganization?.id || (currentOrganization ? null : user?.id), // Handle household user vs org
                startDate?.toISOString(),
                endDate.toISOString()
            );

            if (error) throw error;

            if (data) {
                setLogs(data);
                calculateStats(data);
            }
        } catch (error) {
            console.error('Error loading waste logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (logData) => {
        let weight = 0;
        let cost = 0;
        let carbon = 0;
        const categories = {};

        logData.forEach((log) => {
            weight += Number(log.quantity) || 0;
            cost += Number(log.cost ?? log.cost_estimate) || 0;
            carbon += Number(log.carbon_footprint) || 0;

            categories[log.category] = (categories[log.category] || 0) + 1;
        });

        // Find most wasted category
        let maxCount = 0;
        let topCategory = 'None';
        Object.entries(categories).forEach(([cat, count]) => {
            if (count > maxCount) {
                maxCount = count;
                topCategory = cat;
            }
        });

        setStats({
            totalWaste: weight.toFixed(2),
            totalCost: cost.toFixed(2),
            carbonFootprint: carbon.toFixed(2),
            mostWastedCategory: topCategory,
        });
    };

    const filterLogs = () => {
        let result = [...logs];

        if (selectedCategory !== 'All') {
            result = result.filter((log) => log.category === selectedCategory);
        }

        setFilteredLogs(result);
    };

    const handleLogWaste = async (wasteData) => {
        try {
            // Map frontend field names to backend API (reason, cost)
            const payload = {
                item_name: wasteData.item_name,
                category: wasteData.category,
                quantity: wasteData.quantity,
                unit: wasteData.unit,
                reason: wasteData.reason ?? wasteData.waste_reason,
                cost: wasteData.cost ?? wasteData.cost_estimate ?? 0,
                carbon_footprint: wasteData.carbon_footprint ?? null,
                pantry_item_id: wasteData.pantry_item_id,
            };

            const { data, error } = await wasteLogService.logWaste(payload);

            if (error) throw error;

            // If linked to a pantry item, optionally update it
            if (wasteData.pantry_item_id) {
                await pantryService.updatePantryItem(wasteData.pantry_item_id, {
                    status: 'wasted',
                    quantity: 0
                });
            }

            const newLog = Array.isArray(data) ? data[0] : data;
            setLogs([newLog, ...logs]);
            calculateStats([newLog, ...logs]);
            setShowLogModal(false);
            setSelectedPantryItem(null);
        } catch (error) {
            console.error('Error logging waste:', error);
            alert('Failed to log waste. Please try again.');
        }
    };

    const exportToCSV = () => {
        const headers = ['Date', 'Item', 'Category', 'Reason', 'Quantity', 'Cost', 'CO2'];
        const rows = filteredLogs.map((log) => [
            new Date(log.logged_at).toLocaleDateString(),
            log.item_name,
            log.category,
            log.reason ?? log.waste_reason ?? '',
            `${log.quantity} ${log.unit ?? ''}`,
            log.cost ?? log.cost_estimate ?? '',
            log.carbon_footprint ?? ''
        ]);

        const csvContent = [headers.join(','), ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `waste_logs_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
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
                    <h1 className="text-3xl font-black text-emerald-950">Waste Logs</h1>
                    <p className="text-emerald-600 font-medium mt-1">
                        Track, analyze, and reduce your food waste impact
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={exportToCSV}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <Download className="w-5 h-5" />
                        Export CSV
                    </button>
                    <button
                        onClick={() => setShowLogModal(true)}
                        className="btn-premium flex items-center gap-2"
                    >
                        <Trash2 className="w-5 h-5" />
                        Log Waste
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <WasteStats stats={stats} />

            {/* Filters & Actions */}
            <div className="glass-card p-6 bg-white/40">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setDateRange('week')}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${dateRange === 'week' ? 'bg-emerald-600 text-white' : 'bg-white/60 text-emerald-700'}`}
                        >
                            This Week
                        </button>
                        <button
                            onClick={() => setDateRange('month')}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${dateRange === 'month' ? 'bg-emerald-600 text-white' : 'bg-white/60 text-emerald-700'}`}
                        >
                            This Month
                        </button>
                        <button
                            onClick={() => setDateRange('year')}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${dateRange === 'year' ? 'bg-emerald-600 text-white' : 'bg-white/60 text-emerald-700'}`}
                        >
                            This Year
                        </button>
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <Filter className="w-5 h-5" />
                        Filters
                    </button>
                </div>

                {showFilters && (
                    <WasteFilters
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                    />
                )}
            </div>

            {/* Waste Log List */}
            <WasteList logs={filteredLogs} />

            {/* Helper to log waste */}
            {showLogModal && (
                <LogWasteModal
                    onClose={() => setShowLogModal(false)}
                    onLog={handleLogWaste}
                    initialData={selectedPantryItem}
                />
            )}
        </div>
    );
};

export default WasteLogs;
