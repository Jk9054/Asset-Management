import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Asset, MaintenanceRecord, UserRole } from '../types';
import { fetchAssetById } from '../services/assetService';
import { fetchMaintenanceByAssetId, addMaintenanceRecord } from '../services/maintenanceService';
import { generateAssetPDF } from '../services/reportService';
import { ConditionBadge, StatusBadge, TypeBadge } from '../components/Badge';
import { AssetMap } from '../components/AssetMap';
import { LifecycleTimeline } from '../components/LifecycleTimeline';
import { MaintenanceModal } from '../components/MaintenanceModal';
import { QRCodeModal } from '../components/QRCodeModal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Toast } from '../components/Toast';
import {
  ArrowLeft,
  Edit3,
  Wrench,
  FileText,
  QrCode,
  MapPin,
  Calendar,
  Building,
  DollarSign,
  Info,
} from 'lucide-react';

interface AssetDetailsProps {
  userRole: UserRole;
  currentUserName: string;
}

export const AssetDetails: React.FC<AssetDetailsProps> = ({ userRole, currentUserName }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [asset, setAsset] = useState<Asset | null>(null);
  const [maintenanceList, setMaintenanceList] = useState<MaintenanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals & Feedback
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const [isQROpen, setIsQROpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const canModify = userRole === 'ADMIN' || userRole === 'OFFICER';

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (assetId: string) => {
    setIsLoading(true);
    try {
      const [fetchedAsset, fetchedMaintenance] = await Promise.all([
        fetchAssetById(assetId),
        fetchMaintenanceByAssetId(assetId),
      ]);
      setAsset(fetchedAsset);
      setMaintenanceList(fetchedMaintenance);
    } catch (e) {
      console.error('Error fetching asset details', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMaintenance = async (
    recordData: Omit<MaintenanceRecord, 'id' | 'created_at'>,
    targetStatus?: 'Active' | 'Under Maintenance' | 'Retired'
  ) => {
    if (!asset) return;
    await addMaintenanceRecord(recordData, targetStatus);
    setToastMsg('Maintenance activity logged successfully!');
    // Refresh asset details & maintenance list
    loadData(asset.id);
  };

  const handleDownloadPDF = () => {
    if (asset) {
      generateAssetPDF(asset, maintenanceList);
      setToastMsg('Asset official PDF report generated and downloaded.');
    }
  };

  if (isLoading) return <LoadingSpinner message="Retrieving structural profile & map..." />;

  if (!asset) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900">Asset Record Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">The requested asset ID does not exist in system records.</p>
        <button
          onClick={() => navigate('/assets')}
          className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
        >
          Return to Inventory
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

      {/* Navigation & Actions Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/assets')}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Back to assets list"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {asset.asset_code}
              </span>
              <TypeBadge type={asset.asset_type} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1">{asset.name}</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsQROpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors"
          >
            <QrCode className="w-4 h-4 text-amber-600" /> QR Code
          </button>

          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors"
          >
            <FileText className="w-4 h-4 text-blue-600" /> Export PDF
          </button>

          {canModify && (
            <>
              <button
                onClick={() => navigate(`/assets/${asset.id}/edit`)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors"
              >
                <Edit3 className="w-4 h-4 text-slate-600" /> Edit Profile
              </button>

              <button
                onClick={() => setIsMaintenanceOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-900/20 transition-all"
              >
                <Wrench className="w-4 h-4" /> Add Maintenance Log
              </button>
            </>
          )}
        </div>
      </div>

      {/* Asset Hero & Photo Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Photo Box (1 Col) */}
        <div className="bg-slate-900 rounded-3xl overflow-hidden relative border border-slate-800 shadow-md min-h-[260px] flex items-center justify-center">
          <img
            src={
              asset.photo_url ||
              'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80'
            }
            alt={asset.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80';
            }}
          />
          <div className="absolute top-4 left-4 flex gap-2">
            <ConditionBadge condition={asset.condition} />
            <StatusBadge status={asset.status} />
          </div>
        </div>

        {/* Technical Specification Matrix (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600" /> Infrastructure Details & Administrative Metadata
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 text-[11px] block font-semibold uppercase">District / Taluka</span>
              <span className="font-bold text-slate-900 mt-0.5 block">
                {asset.district}, {asset.taluka || 'Central'}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 text-[11px] block font-semibold uppercase">Construction Year</span>
              <span className="font-bold text-slate-900 mt-0.5 block flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" /> {asset.construction_year}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 text-[11px] block font-semibold uppercase">Valuation (Est. Cost)</span>
              <span className="font-bold text-slate-900 mt-0.5 block font-mono text-sm text-blue-700">
                ₹{Number(asset.estimated_cost).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 sm:col-span-2">
              <span className="text-slate-400 text-[11px] block font-semibold uppercase">Responsible Division</span>
              <span className="font-bold text-slate-900 mt-0.5 block flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-500" /> {asset.responsible_division}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 text-[11px] block font-semibold uppercase">Coordinates</span>
              <span className="font-bold font-mono text-slate-900 mt-0.5 block">
                {asset.latitude ? `${asset.latitude.toFixed(4)}°, ${asset.longitude?.toFixed(4)}°` : 'N/A'}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 sm:col-span-3">
              <span className="text-slate-400 text-[11px] block font-semibold uppercase">Full Site Address</span>
              <span className="font-medium text-slate-800 mt-0.5 block flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" /> {asset.address}
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-700 mb-1">Technical Description</h4>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
              {asset.description || 'No detailed technical specification available.'}
            </p>
          </div>
        </div>
      </div>

      {/* Map & Lifecycle Timeline Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Geolocation Map */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" /> Geographic Location Map
          </h3>
          <AssetMap assets={[asset]} selectedAsset={asset} height="320px" zoom={13} />
        </div>

        {/* Lifecycle Visual Timeline */}
        <LifecycleTimeline asset={asset} maintenanceRecords={maintenanceList} />
      </div>

      {/* Maintenance Audit History Logs */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-600" /> Structural Maintenance & Inspection Audit History
            </h3>
            <p className="text-xs text-slate-500">
              Chronological log of repairs, resurfacing, structural audits, and maintenance expenses.
            </p>
          </div>

          {canModify && (
            <button
              onClick={() => setIsMaintenanceOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold border border-blue-200 transition-colors"
            >
              + Log Maintenance
            </button>
          )}
        </div>

        {maintenanceList.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-xs font-semibold text-slate-600">No maintenance records logged for this asset yet.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Authorized officers can click "+ Log Maintenance" to record inspections or repairs.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-200 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Audit Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Work Description</th>
                  <th className="py-3 px-4">Cost (₹ INR)</th>
                  <th className="py-3 px-4">Condition After</th>
                  <th className="py-3 px-4">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {maintenanceList.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                      {log.maintenance_date}
                    </td>
                    <td className="py-3 px-4 font-bold text-amber-800 bg-amber-50/50">
                      {log.maintenance_type}
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-medium max-w-[280px]">
                      {log.description}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      ₹{Number(log.cost).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <ConditionBadge condition={log.condition_after} />
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-medium">{log.created_by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {isMaintenanceOpen && (
        <MaintenanceModal
          asset={asset}
          currentUserName={currentUserName}
          isOpen={isMaintenanceOpen}
          onClose={() => setIsMaintenanceOpen(false)}
          onSubmit={handleAddMaintenance}
        />
      )}

      {isQROpen && (
        <QRCodeModal asset={asset} isOpen={isQROpen} onClose={() => setIsQROpen(false)} />
      )}
    </div>
  );
};
