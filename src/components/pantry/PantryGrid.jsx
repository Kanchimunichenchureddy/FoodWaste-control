import React from 'react';
import PantryItem from './PantryItem';

const PantryGrid = ({ items, onEdit, onDelete, selectedItems = [], onToggleSelect }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
                <PantryItem
                    key={item.id}
                    item={item}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    viewMode="grid"
                    isSelected={selectedItems.includes(item.id)}
                    onToggleSelect={onToggleSelect}
                />
            ))}
        </div>
    );
};

export default PantryGrid;
