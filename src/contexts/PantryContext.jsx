import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { pantryService } from '@services/api';
import { useAuth } from '@contexts/AuthContext';

const PantryContext = createContext({});

export const usePantry = () => {
    const ctx = useContext(PantryContext);
    if (!ctx) throw new Error('usePantry must be used within PantryProvider');
    return ctx;
};

export const PantryProvider = ({ children }) => {
    const { currentOrganization, user } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadPantryItems = useCallback(async () => {
        if (!currentOrganization && !user) {
            setItems([]);
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await pantryService.getPantryItems(
                currentOrganization?.id || null,
                currentOrganization ? null : user?.id
            );
            if (error) throw error;
            const sanitized = Array.isArray(data) ? data.map(d => Array.isArray(d) ? d[0] : d) : [];
            setItems(sanitized);
        } catch (e) {
            console.error('Failed to load pantry items', e);
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [currentOrganization, user]);

    useEffect(() => {
        loadPantryItems();
    }, [loadPantryItems]);

    // Helpers that call API then refresh local state
    const addItem = async (itemData) => {
        const { data, error } = await pantryService.addPantryItem(itemData);
        if (error) throw error;
        await loadPantryItems();
        try { window.dispatchEvent(new CustomEvent('pantryUpdated', { detail: { action: 'add' } })); } catch (e) {}
        return data;
    };

    const updateItem = async (id, itemData) => {
        const { data, error } = await pantryService.updatePantryItem(id, itemData);
        if (error) throw error;
        await loadPantryItems();
        try { window.dispatchEvent(new CustomEvent('pantryUpdated', { detail: { action: 'update' } })); } catch (e) {}
        return data;
    };

    const deleteItem = async (id) => {
        const { error } = await pantryService.deletePantryItem(id);
        if (error) throw error;
        await loadPantryItems();
        try { window.dispatchEvent(new CustomEvent('pantryUpdated', { detail: { action: 'delete' } })); } catch (e) {}
    };

    const consumeItem = async (id) => {
        const { error } = await pantryService.consumePantryItem(id);
        if (error) throw error;
        await loadPantryItems();
        try { window.dispatchEvent(new CustomEvent('pantryUpdated', { detail: { action: 'consume' } })); } catch (e) {}
    };

    const bulkAdd = async (itemsData) => {
        const addPromises = itemsData.map(item => pantryService.addPantryItem(item));
        const results = await Promise.all(addPromises);
        const newItems = results.map(r => (r?.data && Array.isArray(r.data) ? r.data[0] : r.data)).filter(Boolean);
        await loadPantryItems();
        try { window.dispatchEvent(new CustomEvent('pantryUpdated', { detail: { action: 'bulk_add' } })); } catch (e) {}
        return newItems;
    };

    const value = {
        items,
        loading,
        loadPantryItems,
        addItem,
        updateItem,
        deleteItem,
        consumeItem,
        bulkAdd,
    };

    return <PantryContext.Provider value={value}>{children}</PantryContext.Provider>;
};

export default PantryContext;
