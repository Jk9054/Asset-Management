import React, { useEffect, useState } from 'react';
import { Asset, UserRole } from '../types';
import { fetchAssets, deleteAssetRecord } from '../services/assetService';
import { DEMO_DISTRICTS } from '../services/mockData';
import { AssetTable } from '../components/AssetTable';
import { ConditionBadge, StatusBadge, TypeBadge } from '../components/Badge';
import { Toast } from '../components/Toast';
import {
  Search,
  Filter,
  PlusCircle,
  Grid,
  List,
  MapPin,
  Trash2,
  Eye,
  Edit3,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface AssetsPageProps {
  userRole: UserRole;
}

export const Assets: React.FC<AssetsPageProps> = ({ userRole }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Filters State
  const [search, setSearch] = useState('');
  const [assetType, setAssetType] = useState('All');
  const [district, setDistrict] = useState('All');
  const [condition, setCondition] = useState(searchParams.get('condition') || 'All');
  const [status, setStatus] = useState('All');

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{ id: string; name: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const canModify = userRole === 'ADMIN' || userRole === 'OFFICER';

  useEffect(() => {
    loadAssets();
  }, [search, assetType, district, condition, status]);

  const loadAssets = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAssets({
        search,
        asset_type: assetType,
        district,
        condition,
        status,
      });
      setAssets(data);
    } catch (e) {
      console.error('Failed to load assets', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setAssetType('All');
    setDistrict('All');
    setCondition('All');
    setStatus('All');
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal) return;
    try {
      await deleteAssetRecord(deleteModal.id);
      setToastMessage(`Asset "${deleteModal.name}" deleted successfully.`);
      setDeleteModal(null);
      loadAssets();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast message */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Infrastructure Asset Inventory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Central repository for roads, bridges, public buildings, and state capital infrastructure.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Table / Grid view switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'table' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'grid' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid Card View"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>

          {canModify && (
            <button
              onClick={() => navigate('/assets/new')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-900/20 transition-all"
            >
              <PlusCircle className="w-4 h-4" /> Register New Asset
            </button>
          )}
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search code, name, location..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={assetType}
              onChange={(e) => setAssetType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="All">All Asset Types</option>
              <option value="Road">Road</option>
              <option value="Bridge">Bridge</option>
              <option value="Building">Building</option>
              <option value="Culvert">Culvert</option>
              <option value="Flyover">Flyover</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* District Filter */}
          <div>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="All">All Districts</option>
              {DEMO_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Condition Filter */}
          <div>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="All">All Conditions</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Retired">Retired</option>
            </select>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div>
            Found <span className="font-bold text-slate-900">{assets.length}</span> matching infrastructure asset records
          </div>
          {(search || assetType !== 'All' || district !== 'All' || condition !== 'All' || status !== 'All') && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-800"
            >
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Main List Display */}
      {viewMode === 'table' ? (
        <AssetTable
          assets={assets}
          userRole={userRole}
          onDeleteAsset={(id, name) => setDeleteModal({ id, name })}
          isLoading={isLoading}
        />
      ) : (
        /* Grid Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Photo Thumbnail */}
                <div className="h-40 bg-slate-900 relative overflow-hidden">
                  <img
                    src={
                      asset.photo_url ||
                      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80'
                    }
                    alt={asset.name}
                    className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="bg-slate-900/90 text-amber-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-amber-400/30">
                      {asset.asset_code}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <ConditionBadge condition={asset.condition} />
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <TypeBadge type={asset.asset_type} />
                    <StatusBadge status={asset.status} />
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 leading-tight">{asset.name}</h3>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{asset.district}, {asset.taluka}</span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {asset.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-slate-700">
                  ₹{(asset.estimated_cost / 10000000).toFixed(1)} Cr
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/assets/${asset.id}`)}
                    className="p-1.5 rounded-lg bg-blue-600 text-white font-semibold text-[11px] px-2.5 flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                  {canModify && (
                    <button
                      onClick={() => navigate(`/assets/${asset.id}/edit`)}
                      className="p-1.5 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Verification Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 bg-rose-100 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Delete Asset Record</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete asset record{' '}
              <strong className="text-slate-900">"{deleteModal.name}"</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteModal(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
