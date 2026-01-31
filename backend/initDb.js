const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const initDB = async () => {
    try {
        console.log('🔄 Connecting to MySQL server...');
        // Create connection without database selected to create it
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            multipleStatements: true
        });

        console.log('📦 Creating database if not exists...');
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'foodwaste_db'}`);
        console.log(`✅ Database ${process.env.DB_NAME || 'foodwaste_db'} ready.`);

        // Switch to the database
        await connection.changeUser({ database: process.env.DB_NAME || 'foodwaste_db' });

        console.log('📄 Reading schema.sql...');
        const schemaPath = path.join(__dirname, 'schema.sql');

        // DROP tables to ensure fresh schema matching code
        console.log('🗑️ Dropping existing tables to reset schema...');
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        await connection.query('DROP TABLE IF EXISTS waste_logs');
        await connection.query('DROP TABLE IF EXISTS donations');
        await connection.query('DROP TABLE IF EXISTS pantry_items');
        await connection.query('DROP TABLE IF EXISTS suppliers');
        await connection.query('DROP TABLE IF EXISTS organization_members');
        await connection.query('DROP TABLE IF EXISTS users');
        await connection.query('DROP TABLE IF EXISTS organizations');
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        const schemaSql = `
CREATE TABLE IF NOT EXISTS organizations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sector_type ENUM('Household', 'Restaurant', 'Grocery', 'Hotel', 'Donation') NOT NULL DEFAULT 'Household',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    organization_id INT,
    role ENUM('owner', 'manager', 'staff', 'viewer') DEFAULT 'owner',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS organization_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    organization_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('owner', 'manager', 'staff', 'viewer') DEFAULT 'staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY (organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    organization_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    contact_info TEXT,
    sector_category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pantry_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    organization_id INT NOT NULL,
    user_id INT,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    quantity DECIMAL(10,2) DEFAULT 0,
    unit VARCHAR(50),
    expiry_date DATE,
    location VARCHAR(255),
    supplier_id INT,
    batch_number VARCHAR(100),
    purchase_price DECIMAL(10,2),
    notes TEXT,
    status ENUM('in_stock', 'consumed', 'wasted') DEFAULT 'in_stock',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS waste_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    organization_id INT,
    user_id INT,
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    quantity DECIMAL(10,2),
    unit VARCHAR(50),
    reason TEXT,
    cost DECIMAL(10,2),
    carbon_footprint DECIMAL(10,2),
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS donations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    organization_id INT NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    quantity DECIMAL(10,2),
    unit VARCHAR(50),
    category VARCHAR(100),
    expiry_date DATE,
    pickup_location VARCHAR(255),
    pickup_window VARCHAR(100),
    status ENUM('available', 'claimed', 'completed') DEFAULT 'available',
    claimed_by_org_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (claimed_by_org_id) REFERENCES organizations(id) ON DELETE SET NULL
);
`;

        console.log('🚀 Executing schema...');
        await connection.query(schemaSql);

        console.log('✅ Tables created successfully!');
        console.log('✨ Database initialization complete.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error initializing database:', error);
        process.exit(1);
    }
};

initDB();
