const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
        console.log('📝 Register Request Body:', req.body);
        const { email, password, full_name, organization_name, sector_type } = req.body;

        if (!email || !password || !full_name) {
            console.log('❌ Missing required fields');
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // 1. Check if user exists
        const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            console.log('❌ User already exists:', email);
            return res.status(400).json({ message: 'User already exists' });
        }

        // 2. Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // 3. Create Organization (if provided)
        let organization_id = null;

        // If organization_name is provided, creating a new organization
        if (organization_name) {
            console.log('🏢 Creating Organization:', organization_name);
            const [orgResult] = await pool.query(
                'INSERT INTO organizations (name, sector_type) VALUES (?, ?)',
                [organization_name, sector_type || 'Household']
            );
            organization_id = orgResult.insertId;
            console.log('✅ Organization Created ID:', organization_id);
        } else {
            console.log('⚠️ No organization name provided. User will be created without an organization.');
        }

        // 4. Create User
        console.log('👤 Creating User:', email);
        const [userResult] = await pool.query(
            'INSERT INTO users (email, password_hash, full_name, role, organization_id) VALUES (?, ?, ?, ?, ?)',
            [email, password_hash, full_name, 'owner', organization_id]
        );

        const userId = userResult.insertId;
        console.log('✅ User Created ID:', userId);

        // 4.5 Create Organization Membership
        if (organization_id) {
            await pool.query(
                'INSERT INTO organization_members (organization_id, user_id, role) VALUES (?, ?, ?)',
                [organization_id, userId, 'owner']
            );
        }

        // 5. Generate Token
        const token = jwt.sign(
            { id: userId, organization_id, role: 'owner' },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(201).json({
            token,
            user: { id: userId, email, full_name, role: 'owner', organization_id }
        });

    } catch (error) {
        console.error('❌ Registration Error:', error);
        // Send actual error message for debugging
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check user
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const user = users[0];

        // 2. Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // 3. Generate token
        const token = jwt.sign(
            { id: user.id, organization_id: user.organization_id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                organization_id: user.organization_id
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getMe = async (req, res) => {
    try {
        // User is attached to req by auth middleware
        const [users] = await pool.query('SELECT id, email, full_name, role, organization_id FROM users WHERE id = ?', [req.user.id]);
        res.json(users[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { full_name, email, password } = req.body;
        const userId = req.user.id;

        let query = 'UPDATE users SET full_name = ?, email = ?';
        let params = [full_name, email];

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(password, salt);
            query += ', password_hash = ?';
            params.push(password_hash);
        }

        query += ' WHERE id = ?';
        params.push(userId);

        await pool.query(query, params);

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { register, login, getMe, updateProfile };
