export type UserRole = 'ADMIN' | 'OFFICER' | 'VIEWER';

export type AssetCondition = 'Good' | 'Fair' | 'Poor';

export type AssetStatus = 'Active' | 'Under Maintenance' | 'Retired';

export type AssetType = 'Road' | 'Bridge' | 'Building' | 'Culvert' | 'Flyover' | 'Other';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  created_at?: string;
}

export interface Asset {
  id: string;
  asset_code: string;
  name: string;
  asset_type: AssetType;
  description: string;
  district: string;
  taluka: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  construction_year: number;
  estimated_cost: number;
  condition: AssetCondition;
  status: AssetStatus;
  responsible_division: string;
  photo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceRecord {
  id: string;
  asset_id: string;
  maintenance_date: string;
  maintenance_type: 'Inspection' | 'Repair' | 'Resurfacing' | 'Renovation' | 'Routine Maintenance' | 'Other';
  description: string;
  cost: number;
  condition_after: AssetCondition;
  created_by: string;
  created_at: string;
}

export interface Division {
  id: string;
  name: string;
  district: string;
}

export interface DashboardStats {
  totalAssets: number;
  roadsCount: number;
  bridgesCount: number;
  buildingsCount: number;
  poorConditionCount: number;
  fairConditionCount: number;
  goodConditionCount: number;
  activeCount: number;
  underMaintenanceCount: number;
  retiredCount: number;
  totalInvestment: number;
}

export interface AssetFilters {
  search: string;
  asset_type: string;
  district: string;
  condition: string;
  status: string;
}
