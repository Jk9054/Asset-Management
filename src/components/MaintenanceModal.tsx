import React, { useState } from 'react';
import { Asset, AssetCondition, AssetStatus, MaintenanceRecord } from '../types';
import { X, Wrench, AlertCircle, CheckCircle2 } from 'lucide-react';

interface MaintenanceModalProps {
  asset: Asset;
  currentUserName: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    record: Omit<MaintenanceRecord, 'id' | 'created_at'>,
    newStatus?: AssetStatus
  ) => Promise<void>;
}

export const MaintenanceModal: React.FC<MaintenanceModalProps> = ({
  asset,
  currentUserName,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [maintenanceDate, setMaintenanceDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [maintenanceType, setMaintenanceType] = useState<
    'Inspection' | 'Repair' | 'Resurfacing' | 'Renovation' | 'Routine Maintenance' | 'Other'
  >('Routine Maintenance');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState<number>(500000);
  const [conditionAfter, setConditionAfter] = useState<AssetCondition>(asset.condition);
  const [targetStatus, setTargetStatus] = useState<AssetStatus>(asset.status);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!description.trim()) {
      setErrorMsg('Please enter a description for the maintenance activity.');
      return;
    }
    if (cost < 0) {
      setErrorMsg('Maintenance cost cannot be negative.');
      return;
    }

    setIsSaving(true);
    try {
      await onSubmit(
        {
          asset_id: asset.id,
          maintenance_date: maintenanceDate,
          maintenance_type: maintenanceType,
          description: description.trim(),
          cost: Number(cost),
          condition_after: conditionAfter,
          created_by: currentUserName,
        },
        targetStatus
      );
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record maintenance.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600 text-white">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Record Maintenance Audit</h3>
              <p className="text-xs text-slate-400">Asset: {asset.asset_code} ({asset.name})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Maintenance Date
              </label>
              <input
                type="date"
                value={maintenanceDate}
                onChange={(e) => setMaintenanceDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Activity Type
              </label>
              <select
                value={maintenanceType}
                onChange={(e) =>
                  setMaintenanceType(
                    e.target.value as
                      | 'Inspection'
                      | 'Repair'
                      | 'Resurfacing'
                      | 'Renovation'
                      | 'Routine Maintenance'
                      | 'Other'
                  )
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                <option value="Inspection">Inspection</option>
                <option value="Repair">Repair</option>
                <option value="Resurfacing">Resurfacing</option>
                <option value="Renovation">Renovation</option>
                <option value="Routine Maintenance">Routine Maintenance</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Work Description & Findings
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe repairs carried out, materials used, structural findings..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Total Expenditure (₹ INR)
              </label>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Resulting Asset Condition
              </label>
              <select
                value={conditionAfter}
                onChange={(e) => setConditionAfter(e.target.value as AssetCondition)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Set Updated Asset Status
            </label>
            <select
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value as AssetStatus)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            >
              <option value="Active">Active (Fully Operational)</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Retired">Retired (Decommissioned)</option>
            </select>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSaving ? 'Saving Log...' : 'Record Maintenance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
