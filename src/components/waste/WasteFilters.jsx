import React from 'react';
import { Filter } from 'lucide-react';

const WasteFilters = ({ selectedCategory, setSelectedCategory }) => {
    const categories = [
        'All', 'Produce', 'Dairy', 'Meat', 'Grains', 'Beverages',
        'Snacks', 'Frozen', 'Bakery', 'Other'
    ];

    return (
        <div className="mt-4 pt-4 border-t border-emerald-200">
            <h4 className="text-sm font-bold text-emerald-900 mb-3 block">Filter by Category</h4>
            <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${selectedCategory === cat
                                ? 'bg-emerald-600 text-white shadow-md'
                                : 'bg-white text-emerald-700 hover:bg-emerald-50'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default WasteFilters;
