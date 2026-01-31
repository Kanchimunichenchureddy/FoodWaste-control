const pool = require('../config/db');

const getAllSuppliers = async (req, res) => {
    try {
        const organization_id = req.user.organization_id;
        const [suppliers] = await pool.query(
            'SELECT * FROM suppliers WHERE organization_id = ? ORDER BY name ASC',
            [organization_id]
        );
        res.json(suppliers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const createSupplier = async (req, res) => {
    try {
        const { name, contact_info, sector_category } = req.body;
        const organization_id = req.user.organization_id;

        const [result] = await pool.query(
            'INSERT INTO suppliers (organization_id, name, contact_info, sector_category) VALUES (?, ?, ?, ?)',
            [organization_id, name, contact_info, sector_category]
        );

        const [newSupplier] = await pool.query('SELECT * FROM suppliers WHERE id = ?', [result.insertId]);
        res.status(201).json(newSupplier[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, contact_info, sector_category } = req.body;
        const organization_id = req.user.organization_id;

        await pool.query(
            'UPDATE suppliers SET name = ?, contact_info = ?, sector_category = ? WHERE id = ? AND organization_id = ?',
            [name, contact_info, sector_category, id, organization_id]
        );

        res.json({ message: 'Supplier updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const organization_id = req.user.organization_id;

        await pool.query(
            'DELETE FROM suppliers WHERE id = ? AND organization_id = ?',
            [id, organization_id]
        );

        res.json({ message: 'Supplier deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getAllSuppliers, createSupplier, updateSupplier, deleteSupplier };
