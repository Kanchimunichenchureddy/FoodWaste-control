## TEAM NAME : WEB LINES FUN 

- **Title**: Food Waste Platform: A Modular Ecosystem for Surplus Optimization.

- **Members**:
    LEAD : M. Kiran Kumar 
    MEMBER : K. Muni Kanchi 
# FoodWaste Platform 🌍🌱

A premium, full-stack food waste management platform for Households and Businesses.

## 🚀 Dual-Face Architecture

The platform automatically transforms its interface based on your account type:

| Experience | URL Prefix | Best For | Key Features |
| :--- | :--- | :--- | :--- |
| **FoodWaste Home** | `/home` | Families / Individuals | Simple Pantry, Waste Logs, Mobile-First Bottom Nav |
| **FoodWaste Pro** | `/pro` | Restaurants / Hotels | Team Management, Suppliers, High-Density Analytics |

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), TailwindCSS, Lucide Icons, Chart.js
- **Backend**: Node.js, Express.js, MySQL
- **Auth**: JWT (Stateless), Bcrypt (Security)

---

## 🏗️ Getting Started

### 1. Database Setup
Ensure you have MySQL running, then initialize the schema:
```bash
cd backend
npm install
node initDb.js
```

### 2. Backend Environment (`backend/.env`)
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=foodwaste_db
JWT_SECRET=your_super_secret_key
```

### 3. Frontend Environment (root `.env` or `.env.local`)
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Run Development Servers
**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
npm install
npm run dev
```

---

## 🚀 Deploy to Vercel (Frontend)

1. **Push your code** to GitHub (or connect your repo to Vercel).
2. **Import the project** in [Vercel](https://vercel.com) and set the root to this repo (frontend is the root).
3. **Environment variable:** Add `VITE_API_URL` = your backend API URL (e.g. `https://your-backend.railway.app/api` or `https://your-api.render.com/api`). The backend must be deployed separately (e.g. Railway, Render, Fly.io) with MySQL.
4. **Build:** Vercel will run `npm run build` and serve the `dist` folder. The `vercel.json` rewrites ensure all routes (e.g. `/home/dashboard`, `/pro/pantry`) load the SPA correctly.

**Note:** Deploy the **backend** on a platform that supports Node + MySQL (e.g. Railway, Render). Set CORS to allow your Vercel frontend origin. Use the same `VITE_API_URL` in the frontend so all API calls go to your live backend.

---

## 🌟 Key Features

- **Pantry Intelligence**: Real-time expiry alerts and inventory tracking.
- **Waste Root-Cause**: Log waste with specific reasons to identify procurement leaks.
- **Sustainability Reporting**: Detailed Carbon Footprint (CO2e) and financial loss metrics.
- **Marketplace**: Post surplus food for NGOs or other organizations to claim.
- **Role-Based Access**: Specialized views for Owners, Managers, and Staff.
- **Multi-Sector Dashboards**: Tailored experiences for Restaurants, Hotels, Grocery Stores, and Donation Centers.

---

## 📄 License
MIT License - Created with ❤️ for a sustainable future.
# FoodWaste-control
