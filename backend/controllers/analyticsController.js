const pool = require('../config/db');

// Helper: coerce to number for consistent API response (MySQL may return strings for DECIMAL)
const num = (v) => (v == null || v === '' ? 0 : Number(v));

// Get high-level stats for the dashboard
const getOverview = async (req, res) => {
    try {
        const organization_id = req.user.organization_id;

        // When user has no organization, return zeros so dashboard still loads
        if (organization_id == null || organization_id === '') {
            return res.json({
                pantry: { total_items: 0, total_value: 0, expiring_soon: 0 },
                waste: { total_logs: 0, total_quantity: 0, total_cost: 0, total_carbon: 0 },
                donations: { completed_count: 0, total_kg: 0, people_fed: 0 }
            });
        }

        // 1. Total Pantry Items
        const [pantryResult] = await pool.query(
            'SELECT COUNT(*) as total_items, SUM(quantity * IFNULL(purchase_price, 0)) as total_value FROM pantry_items WHERE organization_id = ? AND status = "in_stock"',
            [organization_id]
        );

        // 2. Waste Stats (Total Logged)
        const [wasteResult] = await pool.query(
            'SELECT COUNT(*) as total_logs, SUM(quantity) as total_quantity, SUM(cost) as total_cost, SUM(carbon_footprint) as total_carbon FROM waste_logs WHERE organization_id = ?',
            [organization_id]
        );

        // 3. Expiring Soon (Next 7 days, including past-due by 1 day)
        const [expiringResult] = await pool.query(
            'SELECT COUNT(*) as count FROM pantry_items WHERE organization_id = ? AND status = "in_stock" AND expiry_date <= DATE_ADD(CURRENT_DATE, INTERVAL 7 DAY) AND expiry_date >= DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY)',
            [organization_id]
        );

        // 4. Donation Impact (For this org)
        const [donationResult] = await pool.query(
            'SELECT COUNT(*) as count, SUM(quantity) as total_kg FROM donations WHERE organization_id = ? AND status = "completed"',
            [organization_id]
        );

        const totalKg = num(donationResult[0].total_kg);

        res.json({
            pantry: {
                total_items: num(pantryResult[0].total_items),
                total_value: num(pantryResult[0].total_value),
                expiring_soon: num(expiringResult[0].count)
            },
            waste: {
                total_logs: num(wasteResult[0].total_logs),
                total_quantity: num(wasteResult[0].total_quantity),
                total_cost: num(wasteResult[0].total_cost),
                total_carbon: num(wasteResult[0].total_carbon)
            },
            donations: {
                completed_count: num(donationResult[0].count),
                total_kg: totalKg,
                people_fed: Math.round(totalKg * 2.5)
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get community-wide impact
const getCommunityImpact = async (req, res) => {
    try {
        const [result] = await pool.query(
            'SELECT COUNT(*) as total_donations, SUM(quantity) as total_kg FROM donations WHERE status = "completed"'
        );

        res.json({
            total_kg: result[0].total_kg || 0,
            people_fed: Math.round((result[0].total_kg || 0) * 2.5),
            donations_count: result[0].total_donations || 0
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get waste breakdown by category
const getWasteByCategory = async (req, res) => {
    try {
        const organization_id = req.user.organization_id;
        const [rows] = await pool.query(
            'SELECT category, SUM(cost) as total_cost, SUM(quantity) as total_quantity FROM waste_logs WHERE organization_id = ? GROUP BY category',
            [organization_id]
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get waste breakdown by reason
const getWasteByReason = async (req, res) => {
    try {
        const organization_id = req.user.organization_id;
        const [rows] = await pool.query(
            'SELECT reason, SUM(cost) as total_cost, COUNT(*) as count FROM waste_logs WHERE organization_id = ? GROUP BY reason',
            [organization_id]
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get monthly trends (last 30 days)
const getWasteTrends = async (req, res) => {
    try {
        const organization_id = req.user.organization_id;
        // Group by Date (YYYY-MM-DD)
        const [rows] = await pool.query(
            `SELECT DATE(logged_at) as date, SUM(cost) as total_cost 
             FROM waste_logs 
             WHERE organization_id = ? 
             GROUP BY DATE(logged_at) 
             ORDER BY date ASC`,
            [organization_id]
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getOverview, getWasteByCategory, getWasteByReason, getWasteTrends, getCommunityImpact };
