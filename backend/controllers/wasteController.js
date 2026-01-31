const pool = require('../config/db');

const getWasteLogs = async (req, res) => {
    try {
        const organization_id = req.user.organization_id;
        const { start_date, end_date } = req.query;

        let query = 'SELECT * FROM waste_logs WHERE organization_id = ?';
        let params = [organization_id];

        if (start_date) {
            query += ' AND logged_at >= ?';
            params.push(start_date);
        }

        if (end_date) {
            query += ' AND logged_at <= ?';
            params.push(end_date);
        }

        query += ' ORDER BY logged_at DESC';

        const [logs] = await pool.query(query, params);
        res.json(logs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const logWaste = async (req, res) => {
    try {
        const { item_name, category, quantity, unit, reason, cost, carbon_footprint, pantry_item_id } = req.body;
        const organization_id = req.user.organization_id;
        const user_id = req.user.id;

        const [result] = await pool.query(
            `INSERT INTO waste_logs 
            (organization_id, user_id, item_name, category, quantity, unit, reason, cost, carbon_footprint) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [organization_id, user_id, item_name, category, quantity, unit, reason || null, cost || 0, carbon_footprint || null]
        );

        // If wasting a pantry item, update its status
        // Note: Frontend calls pantryService.updatePantryItem separately for this logic in `handleLogWaste`.
        // We could move it here to be transactional, but keeping consistent with existing frontend logic for now.

        const [newLog] = await pool.query('SELECT * FROM waste_logs WHERE id = ?', [result.insertId]);
        res.status(201).json(newLog); // Return array to match frontend if needed, but object is standard
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getWasteLogs, logWaste };
