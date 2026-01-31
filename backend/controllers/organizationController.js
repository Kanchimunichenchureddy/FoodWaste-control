const pool = require('../config/db');

const getOrganization = async (req, res) => {
    try {
        const organization_id = req.params.id;
        // Verify user belongs to this org
        if (req.user.organization_id != organization_id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const [org] = await pool.query('SELECT * FROM organizations WHERE id = ?', [organization_id]);

        if (org.length === 0) {
            return res.status(404).json({ message: 'Organization not found' });
        }

        res.json(org[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateOrganization = async (req, res) => {
    try {
        const organization_id = req.params.id;
        const { name, sector_type } = req.body;

        // Only owners can update organization settings
        if (req.user.role !== 'owner' || req.user.organization_id != organization_id) {
            return res.status(403).json({ message: 'Only organization owners can update settings' });
        }

        await pool.query(
            'UPDATE organizations SET name = ?, sector_type = ? WHERE id = ?',
            [name, sector_type, organization_id]
        );

        res.json({ message: 'Organization updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getOrganization, updateOrganization };
