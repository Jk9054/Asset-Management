# Government Infrastructure Asset Inventory & Lifecycle Management System

An end-to-end civic-tech web application built for state **Roads & Buildings (R&B) Departments** to register, locate, monitor, maintain, and report physical infrastructure assets (Roads, Bridges, Government Buildings, Culverts, Flyovers) throughout their operational lifecycle.

---

## 🏛️ Executive Summary

Government physical infrastructure represents billions in public capital investment. Traditional record-keeping across fragmented divisions leads to lost maintenance histories, delayed inspections, and inefficient budgeting. 

This platform unifies all infrastructure asset management into a centralized web portal:
- **REGISTER**: Input new assets with technical parameters, cost valuation, and photo upload.
- **LOCATE**: Interactive GIS Leaflet map displaying real-time asset markers and condition badges.
- **MONITOR**: Track real-time health conditions (*Good*, *Fair*, *Poor*) and operational status (*Active*, *Under Maintenance*, *Retired*).
- **MAINTAIN**: Log maintenance activities (Repairs, Inspections, Resurfacing) and auto-update asset condition.
- **REPORT**: Generate state audit compliance reports in CSV and individual official PDF documents.
- **PHYSICAL QR TAGGING**: Generate printable physical QR stickers linking to instant field inspection profiles.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19 + TypeScript + Vite |
| **Styling & UI** | Tailwind CSS v4 + Lucide Icons |
| **Routing** | React Router v7 |
| **Backend / BaaS** | Supabase (PostgreSQL, Supabase Auth, Supabase Storage) |
| **GIS Mapping** | Leaflet + OpenStreetMap + React Leaflet |
| **Analytics Charts** | Recharts (Bar Charts, Pie/Donut Charts) |
| **PDF Generation** | jsPDF + jsPDF-AutoTable |
| **QR Code Generation**| QRCode.react |
| **Deployment** | Vercel |

---

## 👥 User Roles & Access Control

1. **ADMIN**
   - Full system access: View assets, Add new assets, Edit assets, Delete assets, Log maintenance, View dashboard, Export CSV/PDF reports.
2. **OFFICER**
   - Standard administrative access: View assets, Add assets, Edit assets, Log maintenance, View dashboard, Export reports (No delete permissions).
3. **VIEWER**
   - Public/Auditor access: Read-only access to view asset inventory, GIS map, dashboard analytics, and export reports.

*Note: For quick hackathon demonstration, a 1-click Role Switcher is provided directly in the top header navbar and login page.*

---

## 🗄️ Database Schema (Supabase PostgreSQL)

### 1. `assets`
- `id` (Text/UUID, Primary Key)
- `asset_code` (Text, Unique) - e.g., `RD-AMD-001`
- `name` (Text) - Asset title
- `asset_type` (Text) - `Road`, `Bridge`, `Building`, `Culvert`, `Flyover`, `Other`
- `description` (Text) - Technical description & engineering specs
- `district` (Text) - e.g., `Ahmedabad`, `Gandhinagar`, `Surat`, `Vadodara`, `Rajkot`
- `taluka` (Text)
- `address` (Text)
- `latitude` (Numeric) & `longitude` (Numeric) - GIS coordinates
- `construction_year` (Integer)
- `estimated_cost` (Numeric) - Cost in INR (₹)
- `condition` (Text) - `Good`, `Fair`, `Poor`
- `status` (Text) - `Active`, `Under Maintenance`, `Retired`
- `responsible_division` (Text)
- `photo_url` (Text) - Image URL or Supabase storage path
- `created_at` & `updated_at` (Timestamptz)

### 2. `maintenance`
- `id` (Text/UUID, Primary Key)
- `asset_id` (Text, Foreign Key -> `assets.id`)
- `maintenance_date` (Date)
- `maintenance_type` (Text) - `Inspection`, `Repair`, `Resurfacing`, `Renovation`, `Routine Maintenance`, `Other`
- `description` (Text)
- `cost` (Numeric) - Expenditure in INR (₹)
- `condition_after` (Text) - Updated condition (`Good`, `Fair`, `Poor`)
- `created_by` (Text) - Officer name
- `created_at` (Timestamptz)

### 3. `users`
- `id` (UUID, Primary Key)
- `name` (Text)
- `email` (Text, Unique)
- `role` (Text) - `ADMIN`, `OFFICER`, `VIEWER`
- `department` (Text)

---

## 🚀 Local Setup & Running Instructions

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-repo/government-asset-inventory.git
cd government-asset-inventory
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```
*Note: If Supabase keys are not set yet, the application automatically runs in rich offline demo mode using local persistent storage so you can test all features immediately!*

### 3. Start Local Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🗄️ Supabase Database & Storage Setup Steps

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** -> Create New Query.
3. Paste the contents of [`supabase/schema.sql`](./supabase/schema.sql) and click **Run**.
4. Paste the contents of [`supabase/seed.sql`](./supabase/seed.sql) to seed realistic demo assets and click **Run**.
5. Copy your Project URL and Anon Key from **Project Settings** -> **API**, and add them to your `.env` file or Vercel Environment Variables.

---

## 🌐 Deploying to Vercel

1. Push your repository to **GitHub**.
2. Log into [Vercel](https://vercel.com) and click **Add New** -> **Project**.
3. Import your GitHub repository.
4. Add the following **Environment Variables**:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase Anon Key
5. Click **Deploy**.

---

## 🎯 Hackathon Judge Demonstration Flow

1. **Login Page** (`/login`):
   - Click **OFFICER** under *1-Click Demo Login* to enter the system.
2. **Dashboard Overview** (`/dashboard`):
   - Review statistic cards: Total Assets, Roads, Bridges, Buildings, Poor Condition Assets.
   - Use the **District Filter** (e.g., select *Ahmedabad* or *Surat*) to observe dynamic chart & map updates.
   - Interact with the **GIS Leaflet Map**; click pin markers to view popup details.
3. **Asset Inventory** (`/assets`):
   - Search assets by code (`RD-AMD-001`) or name.
   - Filter by Condition (*Poor*) or Status (*Under Maintenance*).
   - Toggle between **Table View** and **Grid View**.
4. **Asset Inspection & Details** (`/assets/ast-102`):
   - View photo, coordinates, structural parameters, and location map.
   - Review **Lifecycle Progress Timeline**.
   - Click **QR Code** button to preview & download printable asset QR tag.
   - Click **Export PDF** to generate official PDF report.
5. **Add Maintenance Audit**:
   - Click **+ Log Maintenance**.
   - Select *Resurfacing*, enter cost ₹25,000,000, set condition after to *Good*, and update status to *Active*.
   - Verify that condition and lifecycle automatically update across the platform!
6. **Register New Asset** (`/assets/new`):
   - Click **Register New Asset**.
   - Click **Auto Code** to generate a code, fill in details, upload or paste photo URL, and click **Save Asset Record**.
7. **Reports & Audit Data Export** (`/reports`):
   - Export **Assets CSV** & **Maintenance History CSV**.

---

## 🌟 Future Roadmap (Post-MVP)

- **Mobile Inspection PWA**: Native camera scanning of QR stickers directly in field.
- **Geofenced Field Audits**: GPS verification for on-site inspection logging.
- **Budgeting & Tender Integration**: Linking maintenance logs with state procurement portals.
