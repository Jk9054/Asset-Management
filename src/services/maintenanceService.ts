import { MaintenanceRecord, AssetCondition } from '../types';
import { INITIAL_MAINTENANCE } from './mockData';
import { updateAssetRecord } from './assetService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const MAINTENANCE_STORAGE_KEY = 'govt_asset_mgmt_maintenance_db';

const getLocalStorageMaintenance = (): MaintenanceRecord[] => {
  const data = localStorage.getItem(MAINTENANCE_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(MAINTENANCE_STORAGE_KEY, JSON.stringify(INITIAL_MAINTENANCE));
    return INITIAL_MAINTENANCE;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_MAINTENANCE;
  }
};

const saveLocalStorageMaintenance = (records: MaintenanceRecord[]): void => {
  localStorage.setItem(MAINTENANCE_STORAGE_KEY, JSON.stringify(records));
};

export const fetchMaintenanceByAssetId = async (assetId: string): Promise<MaintenanceRecord[]> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('maintenance')
        .select('*')
        .eq('asset_id', assetId)
        .order('maintenance_date', { ascending: false });

      if (!error && data) {
        return data as MaintenanceRecord[];
      }
    } catch (e) {
      console.warn('Supabase fetch maintenance error', e);
    }
  }

  const all = getLocalStorageMaintenance();
  return all
    .filter((m) => m.asset_id === assetId)
    .sort((a, b) => new Date(b.maintenance_date).getTime() - new Date(a.maintenance_date).getTime());
};

export const fetchAllMaintenance = async (): Promise<MaintenanceRecord[]> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('maintenance')
        .select('*')
        .order('maintenance_date', { ascending: false });

      if (!error && data) {
        return data as MaintenanceRecord[];
      }
    } catch (e) {
      console.warn('Supabase fetch all maintenance error', e);
    }
  }

  const all = getLocalStorageMaintenance();
  return all.sort((a, b) => new Date(b.maintenance_date).getTime() - new Date(a.maintenance_date).getTime());
};

export const addMaintenanceRecord = async (
  recordData: Omit<MaintenanceRecord, 'id' | 'created_at'>,
  updateAssetStatus?: 'Active' | 'Under Maintenance' | 'Retired'
): Promise<MaintenanceRecord> => {
  const newId = `mnt-${Date.now().toString().slice(-6)}`;
  const now = new Date().toISOString();

  const newRecord: MaintenanceRecord = {
    ...recordData,
    id: newId,
    created_at: now,
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('maintenance')
        .insert([
          {
            asset_id: newRecord.asset_id,
            maintenance_date: newRecord.maintenance_date,
            maintenance_type: newRecord.maintenance_type,
            description: newRecord.description,
            cost: Number(newRecord.cost),
            condition_after: newRecord.condition_after,
            created_by: newRecord.created_by,
          },
        ])
        .select()
        .single();

      if (!error && data) {
        // Automatically update asset condition & status
        const patch: { condition: AssetCondition; status?: 'Active' | 'Under Maintenance' | 'Retired' } = {
          condition: newRecord.condition_after,
        };
        if (updateAssetStatus) {
          patch.status = updateAssetStatus;
        }
        await updateAssetRecord(newRecord.asset_id, patch);

        const local = getLocalStorageMaintenance();
        saveLocalStorageMaintenance([data as MaintenanceRecord, ...local]);
        return data as MaintenanceRecord;
      }
    } catch (e) {
      console.warn('Supabase insert maintenance error', e);
    }
  }

  // Local storage fallback
  const local = getLocalStorageMaintenance();
  const updated = [newRecord, ...local];
  saveLocalStorageMaintenance(updated);

  // Update asset condition
  const patch: { condition: AssetCondition; status?: 'Active' | 'Under Maintenance' | 'Retired' } = {
    condition: newRecord.condition_after,
  };
  if (updateAssetStatus) {
    patch.status = updateAssetStatus;
  }
  await updateAssetRecord(newRecord.asset_id, patch);

  return newRecord;
};
