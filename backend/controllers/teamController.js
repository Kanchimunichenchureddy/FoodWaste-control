const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// Get all members of the user's organization
const getTeamMembers = async (req, res) => {
    try {
        const organization_id = req.user.organization_id;
        const [members] = await pool.query(
            'SELECT id, email, full_name, role, created_at FROM users WHERE organization_id = ? ORDER BY full_name ASC',
            [organization_id]
        );
        res.json(members);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add a new member to the organization
const addMember = async (req, res) => {
    try {
        const { email, password, full_name, role } = req.body;
        const organization_id = req.user.organization_id;

        // Check if user already exists
        const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Hash default password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password || 'Welcome@123', salt);

        const [result] = await pool.query(
            'INSERT INTO users (email, password_hash, full_name, role, organization_id) VALUES (?, ?, ?, ?, ?)',
            [email, password_hash, full_name, role || 'staff', organization_id]
        );

        res.status(201).json({ id: result.insertId, message: 'Member added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update member role
const updateMemberRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        const organization_id = req.user.organization_id;

        // Only allow owners to change roles
        if (req.user.role !== 'owner') {
            return res.status(403).json({ message: 'Only organization owners can change roles' });
        }

        await pool.query(
            'UPDATE users SET role = ? WHERE id = ? AND organization_id = ?',
            [role, id, organization_id]
        );

        res.json({ message: 'Role updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Remove member from organization
const removeMember = async (req, res) => {
    try {
        const { id } = req.params;
        const organization_id = req.user.organization_id;

        // Only allow owners to remove members
        if (req.user.role !== 'owner') {
            return res.status(403).json({ message: 'Only organization owners can remove members' });
        }

        // Don't allow removing yourself
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ message: 'Cannot remove yourself from the organization' });
        }

        await pool.query(
            'UPDATE users SET organization_id = NULL, role = "viewer" WHERE id = ? AND organization_id = ?',
            [id, organization_id]
        );

        res.json({ message: 'Member removed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getTeamMembers,
    addMember,
    updateMemberRole,
    removeMember
};
