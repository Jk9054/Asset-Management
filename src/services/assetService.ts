import { Asset, AssetFilters, DashboardStats } from '../types';
import { INITIAL_ASSETS } from './mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const ASSETS_STORAGE_KEY = 'govt_asset_mgmt_assets_db';

const getLocalStorageAssets = (): Asset[] => {
  const data = localStorage.getItem(ASSETS_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(INITIAL_ASSETS));
    return INITIAL_ASSETS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_ASSETS;
  }
};

const saveLocalStorageAssets = (assets: Asset[]): void => {
  localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(assets));
};

export const fetchAssets = async (filters?: Partial<AssetFilters>): Promise<Asset[]> => {
  let assetsList: Asset[] = [];

  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase.from('assets').select('*').order('created_at', { ascending: false });

      if (filters?.asset_type && filters.asset_type !== 'All') {
        query = query.eq('asset_type', filters.asset_type);
      }
      if (filters?.district && filters.district !== 'All') {
        query = query.eq('district', filters.district);
      }
      if (filters?.condition && filters.condition !== 'All') {
        query = query.eq('condition', filters.condition);
      }
      if (filters?.status && filters.status !== 'All') {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (!error && data) {
        assetsList = data as Asset[];
      } else {
        console.warn('Supabase fetch failed, falling back to local DB', error);
        assetsList = getLocalStorageAssets();
      }
    } catch (err) {
      console.warn('Supabase asset fetch error', err);
      assetsList = getLocalStorageAssets();
    }
  } else {
    assetsList = getLocalStorageAssets();
  }

  // Filter client side for local mode or search string
  if (filters) {
    const searchLower = (filters.search || '').toLowerCase().trim();
    assetsList = assetsList.filter((asset) => {
      const matchSearch =
        !searchLower ||
        asset.asset_code.toLowerCase().includes(searchLower) ||
        asset.name.toLowerCase().includes(searchLower) ||
        asset.district.toLowerCase().includes(searchLower) ||
        asset.taluka.toLowerCase().includes(searchLower) ||
        asset.address.toLowerCase().includes(searchLower);

      const matchType = !filters.asset_type || filters.asset_type === 'All' || asset.asset_type === filters.asset_type;
      const matchDistrict = !filters.district || filters.district === 'All' || asset.district === filters.district;
      const matchCondition = !filters.condition || filters.condition === 'All' || asset.condition === filters.condition;
      const matchStatus = !filters.status || filters.status === 'All' || asset.status === filters.status;

      return matchSearch && matchType && matchDistrict && matchCondition && matchStatus;
    });
  }

  return assetsList;
};

export const fetchAssetById = async (id: string): Promise<Asset | null> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('assets').select('*').eq('id', id).single();
      if (!error && data) {
        return data as Asset;
      }
    } catch (err) {
      console.warn('Supabase fetch single asset error', err);
    }
  }
  const assets = getLocalStorageAssets();
  return assets.find((a) => a.id === id) || null;
};

export const createAsset = async (assetData: Omit<Asset, 'id' | 'created_at' | 'updated_at'>): Promise<Asset> => {
  const newId = `ast-${Date.now().toString().slice(-6)}`;
  const now = new Date().toISOString();

  const newAsset: Asset = {
    ...assetData,
    id: newId,
    created_at: now,
    updated_at: now,
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('assets')
        .insert([
          {
            asset_code: newAsset.asset_code,
            name: newAsset.name,
            asset_type: newAsset.asset_type,
            description: newAsset.description,
            district: newAsset.district,
            taluka: newAsset.taluka,
            address: newAsset.address,
            latitude: newAsset.latitude,
            longitude: newAsset.longitude,
            construction_year: Number(newAsset.construction_year),
            estimated_cost: Number(newAsset.estimated_cost),
            condition: newAsset.condition,
            status: newAsset.status,
            responsible_division: newAsset.responsible_division,
            photo_url: newAsset.photo_url || null,
          },
        ])
        .select()
        .single();

      if (!error && data) {
        // also save to local cache
        const local = getLocalStorageAssets();
        saveLocalStorageAssets([data as Asset, ...local]);
        return data as Asset;
      }
    } catch (e) {
      console.warn('Supabase create asset error', e);
    }
  }

  // Local storage fallback
  const local = getLocalStorageAssets();
  const updated = [newAsset, ...local];
  saveLocalStorageAssets(updated);
  return newAsset;
};

export const updateAssetRecord = async (
  id: string,
  assetData: Partial<Omit<Asset, 'id' | 'created_at'>>
): Promise<Asset> => {
  const now = new Date().toISOString();

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('assets')
        .update({
          ...assetData,
          updated_at: now,
        })
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        const local = getLocalStorageAssets();
        const idx = local.findIndex((a) => a.id === id);
        if (idx >= 0) {
          local[idx] = data as Asset;
          saveLocalStorageAssets(local);
        }
        return data as Asset;
      }
    } catch (e) {
      console.warn('Supabase update asset error', e);
    }
  }

  const local = getLocalStorageAssets();
  const index = local.findIndex((a) => a.id === id);
  if (index === -1) throw new Error('Asset not found');

  const updatedAsset: Asset = {
    ...local[index],
    ...assetData,
    updated_at: now,
  };

  local[index] = updatedAsset;
  saveLocalStorageAssets(local);
  return updatedAsset;
};

export const deleteAssetRecord = async (id: string): Promise<boolean> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('assets').delete().eq('id', id);
      if (error) {
        console.warn('Supabase delete asset error', error);
      }
    } catch (e) {
      console.warn('Supabase delete exception', e);
    }
  }

  const local = getLocalStorageAssets();
  const filtered = local.filter((a) => a.id !== id);
  saveLocalStorageAssets(filtered);
  return true;
};

export const uploadAssetPhoto = async (file: File): Promise<string> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `assets/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('asset-images').upload(filePath, file);

      if (!uploadError) {
        const { data } = supabase.storage.from('asset-images').getPublicUrl(filePath);
        return data.publicUrl;
      }
    } catch (e) {
      console.warn('Supabase photo upload failed, converting to data URL', e);
    }
  }

  // Local fallback: convert to base64 data URL
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(file);
  });
};

export const computeDashboardStats = (assets: Asset[]): DashboardStats => {
  const stats: DashboardStats = {
    totalAssets: assets.length,
    roadsCount: 0,
    bridgesCount: 0,
    buildingsCount: 0,
    poorConditionCount: 0,
    fairConditionCount: 0,
    goodConditionCount: 0,
    activeCount: 0,
    underMaintenanceCount: 0,
    retiredCount: 0,
    totalInvestment: 0,
  };

  assets.forEach((asset) => {
    if (asset.asset_type === 'Road') stats.roadsCount++;
    if (asset.asset_type === 'Bridge') stats.bridgesCount++;
    if (asset.asset_type === 'Building') stats.buildingsCount++;

    if (asset.condition === 'Good') stats.goodConditionCount++;
    if (asset.condition === 'Fair') stats.fairConditionCount++;
    if (asset.condition === 'Poor') stats.poorConditionCount++;

    if (asset.status === 'Active') stats.activeCount++;
    if (asset.status === 'Under Maintenance') stats.underMaintenanceCount++;
    if (asset.status === 'Retired') stats.retiredCount++;

    stats.totalInvestment += Number(asset.estimated_cost || 0);
  });

  return stats;
};
