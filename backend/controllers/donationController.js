const pool = require('../config/db');

// Create a new donation
const createDonation = async (req, res) => {
    try {
        const { item_name, description, quantity, unit, category, expiry_date, pickup_location, pickup_window } = req.body;
        const organization_id = req.user.organization_id;

        if (!item_name || !organization_id) {
            return res.status(400).json({ message: 'Item name is required' });
        }

        const [result] = await pool.query(
            'INSERT INTO donations (organization_id, item_name, description, quantity, unit, category, expiry_date, pickup_location, pickup_window) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [organization_id, item_name, description, quantity, unit, category, expiry_date, pickup_location, pickup_window]
        );

        res.status(201).json({ id: result.insertId, message: 'Donation post created successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all available donations (marketplace view)
const getAvailableDonations = async (req, res) => {
    try {
        // Exclude own donations from marketplace view (optional, but good for clarity)
        // For now, show all available except own (or maybe show all?)
        // Let's show all that are 'available'
        const [rows] = await pool.query(
            `SELECT d.*, o.name as donor_name 
             FROM donations d 
             JOIN organizations o ON d.organization_id = o.id 
             WHERE d.status = 'available' 
             ORDER BY d.created_at DESC`
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get donations posted by my organization
const getMyDonations = async (req, res) => {
    try {
        const organization_id = req.user.organization_id;
        const [rows] = await pool.query(
            'SELECT * FROM donations WHERE organization_id = ? ORDER BY created_at DESC',
            [organization_id]
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get donations claimed by my organization
const getMyClaims = async (req, res) => {
    try {
        const organization_id = req.user.organization_id;
        const [rows] = await pool.query(
            `SELECT d.*, o.name as donor_name 
             FROM donations d 
             JOIN organizations o ON d.organization_id = o.id 
             WHERE d.claimed_by_org_id = ? 
             ORDER BY d.updated_at DESC`,
            [organization_id]
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Claim a donation
const claimDonation = async (req, res) => {
    try {
        const donationIds = req.params.id;
        const claiming_org_id = req.user.organization_id;

        // Check if donation exists and is available
        const [check] = await pool.query('SELECT * FROM donations WHERE id = ?', [donationIds]);
        if (check.length === 0) return res.status(404).json({ message: 'Donation not found' });
        if (check[0].status !== 'available') return res.status(400).json({ message: 'Donation already claimed' });
        if (check[0].organization_id === claiming_org_id) return res.status(400).json({ message: 'Cannot claim your own donation' });

        await pool.query(
            'UPDATE donations SET status = "claimed", claimed_by_org_id = ? WHERE id = ?',
            [claiming_org_id, donationIds]
        );

        res.json({ message: 'Donation claimed successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Mark donation as completed (handover done) - Only owner can do this
const completeDonation = async (req, res) => {
    try {
        const donationIds = req.params.id;
        const organization_id = req.user.organization_id;

        const [check] = await pool.query('SELECT * FROM donations WHERE id = ?', [donationIds]);
        if (check.length === 0) return res.status(404).json({ message: 'Donation not found' });
        if (check[0].organization_id !== organization_id) return res.status(403).json({ message: 'Not authorized' });

        await pool.query(
            'UPDATE donations SET status = "completed" WHERE id = ?',
            [donationIds]
        );

        res.json({ message: 'Donation marked as completed' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createDonation,
    getAvailableDonations,
    getMyDonations,
    getMyClaims,
    claimDonation,
    completeDonation
};
