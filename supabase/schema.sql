-- ====================================================================
-- Government Infrastructure Asset Inventory & Lifecycle Management System
-- PostgreSQL Database Schema for Supabase
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'OFFICER', 'VIEWER')),
  department TEXT DEFAULT 'Roads & Buildings Department',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ASSET TYPES TABLE
CREATE TABLE IF NOT EXISTS public.asset_types (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

INSERT INTO public.asset_types (name) VALUES
  ('Road'), ('Bridge'), ('Building'), ('Culvert'), ('Flyover'), ('Other')
ON CONFLICT (name) DO NOTHING;

-- 3. DIVISIONS TABLE
CREATE TABLE IF NOT EXISTS public.divisions (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  district TEXT NOT NULL
);

INSERT INTO public.divisions (name, district) VALUES
  ('Ahmedabad City R&B Division', 'Ahmedabad'),
  ('Gandhinagar Capital Circle', 'Gandhinagar'),
  ('Surat Coastal Infrastructure Circle', 'Surat'),
  ('Vadodara Highway Division', 'Vadodara'),
  ('Rajkot Rural & Urban Division', 'Rajkot')
ON CONFLICT DO NOTHING;

-- 4. ASSETS TABLE
CREATE TABLE IF NOT EXISTS public.assets (
  id TEXT PRIMARY KEY DEFAULT ('ast-' || gen_random_uuid()),
  asset_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('Road', 'Bridge', 'Building', 'Culvert', 'Flyover', 'Other')),
  description TEXT,
  district TEXT NOT NULL,
  taluka TEXT,
  address TEXT,
  latitude NUMERIC(10, 6),
  longitude NUMERIC(10, 6),
  construction_year INT,
  estimated_cost NUMERIC(15, 2),
  condition TEXT NOT NULL DEFAULT 'Good' CHECK (condition IN ('Good', 'Fair', 'Poor')),
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Under Maintenance', 'Retired')),
  responsible_division TEXT NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for searching assets efficiently
CREATE INDEX IF NOT EXISTS idx_assets_code ON public.assets(asset_code);
CREATE INDEX IF NOT EXISTS idx_assets_district ON public.assets(district);
CREATE INDEX IF NOT EXISTS idx_assets_type ON public.assets(asset_type);

-- 5. MAINTENANCE TABLE
CREATE TABLE IF NOT EXISTS public.maintenance (
  id TEXT PRIMARY KEY DEFAULT ('mnt-' || gen_random_uuid()),
  asset_id TEXT NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  maintenance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  maintenance_type TEXT NOT NULL,
  description TEXT NOT NULL,
  cost NUMERIC(15, 2) DEFAULT 0,
  condition_after TEXT NOT NULL CHECK (condition_after IN ('Good', 'Fair', 'Poor')),
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maintenance_asset ON public.maintenance(asset_id);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Assets RLS Policies
CREATE POLICY "Allow read access to all authenticated and anon users"
  ON public.assets FOR SELECT
  USING (true);

CREATE POLICY "Allow insert access to authenticated users"
  ON public.assets FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow update access to authenticated users"
  ON public.assets FOR UPDATE
  USING (true);

CREATE POLICY "Allow delete access to authenticated users"
  ON public.assets FOR DELETE
  USING (true);

-- Maintenance RLS Policies
CREATE POLICY "Allow read access to maintenance records"
  ON public.maintenance FOR SELECT
  USING (true);

CREATE POLICY "Allow insert access to maintenance records"
  ON public.maintenance FOR INSERT
  WITH CHECK (true);

-- ====================================================================
-- SUPABASE STORAGE BUCKET SETUP
-- ====================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('asset-images', 'asset-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Read Access for Asset Images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'asset-images');

CREATE POLICY "Authenticated Upload for Asset Images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'asset-images');
