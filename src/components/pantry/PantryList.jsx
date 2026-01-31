import React from 'react';
import PantryItem from './PantryItem';

const PantryList = ({ items, onEdit, onDelete, selectedItems = [], onToggleSelect }) => {
    return (
        <div className="glass-card bg-white/40 overflow-hidden">
            <div className="divide-y divide-emerald-100">
                {items.map((item) => (
                    <PantryItem
                        key={item.id}
                        item={item}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        viewMode="list"
                        isSelected={selectedItems.includes(item.id)}
                        onToggleSelect={onToggleSelect}
                    />
                ))}
            </div>
        </div>
    );
};

export default PantryList;
