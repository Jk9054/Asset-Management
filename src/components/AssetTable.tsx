import React from 'react';
import { Asset, UserRole } from '../types';
import { ConditionBadge, StatusBadge, TypeBadge } from './Badge';
import { Eye, Edit3, Trash2, MapPin, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AssetTableProps {
  assets: Asset[];
  userRole: UserRole;
  onDeleteAsset?: (id: string, name: string) => void;
  isLoading?: boolean;
}

export const AssetTable: React.FC<AssetTableProps> = ({
  assets,
  userRole,
  onDeleteAsset,
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const canEdit = userRole === 'ADMIN' || userRole === 'OFFICER';
  const canDelete = userRole === 'ADMIN';

  if (isLoading) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-600">Retrieving infrastructure asset registry...</p>
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
          <Building className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No Infrastructure Assets Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          No records match your search query or filter parameters. Try clearing your filters or register a new asset.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
      <table className="w-full text-left border-collapse text-xs lg:text-sm">
        <thead>
          <tr className="bg-slate-900 text-slate-200 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-800">
            <th className="py-3.5 px-4">Asset Code</th>
            <th className="py-3.5 px-4">Asset Name & Location</th>
            <th className="py-3.5 px-4">Type</th>
            <th className="py-3.5 px-4">District</th>
            <th className="py-3.5 px-4">Condition</th>
            <th className="py-3.5 px-4">Status</th>
            <th className="py-3.5 px-4">Responsible Division</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700">
          {assets.map((asset) => (
            <tr key={asset.id} className="hover:bg-slate-50/80 transition-colors">
              <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                {asset.asset_code}
              </td>
              <td className="py-3.5 px-4">
                <div className="font-bold text-slate-900 leading-tight">{asset.name}</div>
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                  <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span className="truncate max-w-[220px]">{asset.address}</span>
                </div>
              </td>
              <td className="py-3.5 px-4">
                <TypeBadge type={asset.asset_type} />
              </td>
              <td className="py-3.5 px-4 font-medium text-slate-800">{asset.district}</td>
              <td className="py-3.5 px-4">
                <ConditionBadge condition={asset.condition} />
              </td>
              <td className="py-3.5 px-4">
                <StatusBadge status={asset.status} />
              </td>
              <td className="py-3.5 px-4 text-xs text-slate-600 max-w-[160px] truncate">
                {asset.responsible_division}
              </td>
              <td className="py-3.5 px-4 text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => navigate(`/assets/${asset.id}`)}
                    className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                    title="View asset details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {canEdit && (
                    <button
                      onClick={() => navigate(`/assets/${asset.id}/edit`)}
                      className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                      title="Edit asset"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}

                  {canDelete && onDeleteAsset && (
                    <button
                      onClick={() => onDeleteAsset(asset.id, asset.name)}
                      className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                      title="Delete asset (Admin)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
