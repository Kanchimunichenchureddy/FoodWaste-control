import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

const PantryFilters = ({ selectedCategory, setSelectedCategory, sortBy, setSortBy }) => {
    const categories = [
        'All',
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

    const sortOptions = [
        { value: 'expiry_asc', label: 'Expiry: Soonest First' },
        { value: 'expiry_desc', label: 'Expiry: Latest First' },
        { value: 'name_asc', label: 'Name: A-Z' },
        { value: 'name_desc', label: 'Name: Z-A' },
    ];

    return (
        <div className="mt-4 pt-4 border-t border-emerald-200">
            <div className="flex items-center gap-2 mb-4">
                <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-emerald-950">Filters & Sorting</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category Filter */}
                <div>
                    <label className="block text-sm font-bold text-emerald-900 mb-2">
                        Category
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedCategory === category
                                        ? 'bg-emerald-600 text-white shadow-lg'
                                        : 'bg-white/60 text-emerald-700 hover:bg-white'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sort Options */}
                <div>
                    <label className="block text-sm font-bold text-emerald-900 mb-2">
                        Sort By
                    </label>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="input-primary w-full"
                    >
                        {sortOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default PantryFilters;
