const pool = require('../config/db');

const getAllItems = async (req, res) => {
    try {
        const organization_id = req.user.organization_id;

        let query = 'SELECT * FROM pantry_items WHERE organization_id = ? AND status = ?';
        let params = [organization_id, 'in_stock'];

        // Simple filtering
        if (req.query.search) {
            query += ' AND name LIKE ?';
            params.push(`%${req.query.search}%`);
        }

        query += ' ORDER BY expiry_date ASC';

        const [items] = await pool.query(query, params);
        res.json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const addItem = async (req, res) => {
    try {
        const { name, category, quantity, unit, expiry_date, location, batch_number, purchase_price, notes, supplier_id } = req.body;
        const organization_id = req.user.organization_id;
        const user_id = req.user.id; // Added by member

        const [result] = await pool.query(
            `INSERT INTO pantry_items 
            (organization_id, user_id, name, category, quantity, unit, expiry_date, location, batch_number, purchase_price, notes, supplier_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [organization_id, user_id, name, category, quantity, unit, expiry_date, location, batch_number, purchase_price, notes, supplier_id || null]
        );

        const [rows] = await pool.query('SELECT * FROM pantry_items WHERE id = ?', [result.insertId]);
        res.status(201).json(rows[0]); // Returning array to match old frontend expectation slightly, or just object. Supabase returned array. 
        // Adapting to just return object for cleaner API, but frontend might expect array.
        // Supabase often returns { data: [ ... ] }. Our API service wrapper will handle this.
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        // Ensure item belongs to user's org
        const [check] = await pool.query('SELECT * FROM pantry_items WHERE id = ? AND organization_id = ?', [id, req.user.organization_id]);
        if (check.length === 0) return res.status(404).json({ message: 'Item not found' });

        const fields = [];
        const values = [];

        // Dynamic update
        Object.keys(req.body).forEach(key => {
            // whitelist allowed keys for safety
            if (['name', 'category', 'quantity', 'unit', 'expiry_date', 'location', 'batch_number', 'purchase_price', 'notes', 'status'].includes(key)) {
                fields.push(`${key} = ?`);
                values.push(req.body[key]);
            }
        });

        if (fields.length === 0) return res.json(check[0]); // Nothing to update

        values.push(id);
        await pool.query(`UPDATE pantry_items SET ${fields.join(', ')} WHERE id = ?`, values);

        const [rows] = await pool.query('SELECT * FROM pantry_items WHERE id = ?', [id]);
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM pantry_items WHERE id = ? AND organization_id = ?', [id, req.user.organization_id]);

        if (result.affectedRows === 0) return res.status(404).json({ message: 'Item not found' });

        res.json({ message: 'Item deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getAllItems, addItem, updateItem, deleteItem };
