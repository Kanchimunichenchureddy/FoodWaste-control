const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const pantryRoutes = require('./routes/pantryRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Support larger images for receipt scanning

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/pantry', pantryRoutes);
app.use('/api/waste', require('./routes/wasteRoutes'));
app.use('/api/suppliers', require('./routes/supplierRoutes'));
app.use('/api/organizations', require('./routes/organizationRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/donations', require('./routes/donationRoutes'));
app.use('/api/team', require('./routes/teamRoutes'));
app.use('/api/ai', aiRoutes); // AI-powered endpoints

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
