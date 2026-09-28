import React, { useEffect, useState } from 'react';
import { Asset, MaintenanceRecord } from '../types';
import { fetchAssets } from '../services/assetService';
import { fetchAllMaintenance, fetchMaintenanceByAssetId } from '../services/maintenanceService';
import {
  exportAssetsToCSV,
  exportMaintenanceToCSV,
  generateAssetPDF,
} from '../services/reportService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Toast } from '../components/Toast';
import {
  FileSpreadsheet,
  FileText,
  Download,
  Building,
  Wrench,
  CheckCircle,
  BarChart2,
  Layers,
} from 'lucide-react';

export const Reports: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    setIsLoading(true);
    try {
      const [fetchedAssets, fetchedMaintenance] = await Promise.all([
        fetchAssets(),
        fetchAllMaintenance(),
      ]);
      setAssets(fetchedAssets);
      setMaintenanceRecords(fetchedMaintenance);
      if (fetchedAssets.length > 0) {
        setSelectedAssetId(fetchedAssets[0].id);
      }
    } catch (e) {
      console.error('Failed to load report datasets', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportAssetsCSV = () => {
    exportAssetsToCSV(assets);
    setToastMsg(`Exported ${assets.length} infrastructure asset records to CSV.`);
  };

  const handleExportMaintenanceCSV = () => {
    const assetsMap: Record<string, Asset> = {};
    assets.forEach((a) => {
      assetsMap[a.id] = a;
    });
    exportMaintenanceToCSV(maintenanceRecords, assetsMap);
    setToastMsg(`Exported ${maintenanceRecords.length} maintenance logs to CSV.`);
  };

  const handleExportSinglePDF = async () => {
    if (!selectedAssetId) return;
    const targetAsset = assets.find((a) => a.id === selectedAssetId);
    if (!targetAsset) return;

    const maintenanceForAsset = await fetchMaintenanceByAssetId(targetAsset.id);
    generateAssetPDF(targetAsset, maintenanceForAsset);
    setToastMsg(`Generated official PDF audit report for ${targetAsset.asset_code}.`);
  };

  // Metrics
  const totalCost = assets.reduce((sum, a) => sum + Number(a.estimated_cost || 0), 0);
  const totalMaintenanceCost = maintenanceRecords.reduce((sum, m) => sum + Number(m.cost || 0), 0);
  const poorAssets = assets.filter((a) => a.condition === 'Poor').length;

  if (isLoading) return <LoadingSpinner message="Building government report dataset..." />;

  const selectedAsset = assets.find((a) => a.id === selectedAssetId);

  return (
    <div className="space-y-6">
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

      {/* Header */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-400" />
            Audit Reports & Data Export Center
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Download state audit compliance reports, asset inventory CSVs, and printable PDF documents.
          </p>
        </div>
      </div>

      {/* Audit Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Registered Assets</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{assets.length}</h3>
          <p className="text-xs text-slate-400 mt-0.5">Ready for CSV export</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Infrastructure Capital</p>
          <h3 className="text-2xl font-bold text-blue-700 mt-1 font-mono">
            ₹{(totalCost / 10000000).toFixed(1)} Cr
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Estimated Asset Valuation</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Maintenance Outlay</p>
          <h3 className="text-2xl font-bold text-amber-600 mt-1 font-mono">
            ₹{(totalMaintenanceCost / 100000).toFixed(1)} Lakhs
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">{maintenanceRecords.length} Audits Executed</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase">Poor Condition Assets</p>
          <h3 className="text-2xl font-bold text-rose-600 mt-1">{poorAssets}</h3>
          <p className="text-xs text-slate-400 mt-0.5">High priority repair list</p>
        </div>
      </div>

      {/* Export Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Asset Inventory CSV */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Complete Assets CSV Export</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Export all {assets.length} registered roads, bridges, flyovers, and buildings with complete location, cost, condition, and GPS coordinates.
            </p>
          </div>

          <button
            onClick={handleExportAssetsCSV}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Export Assets CSV
          </button>
        </div>

        {/* Card 2: Maintenance Audit CSV */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <Wrench className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Maintenance History CSV</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Export complete timeline of {maintenanceRecords.length} maintenance audits, expense amounts, work types, and officer notes.
            </p>
          </div>

          <button
            onClick={handleExportMaintenanceCSV}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Export Maintenance CSV
          </button>
        </div>

        {/* Card 3: Individual Asset PDF Generator */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 md:col-span-2 lg:col-span-1">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Individual Asset PDF Report</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Generate an official single-asset document containing structural details, valuation, and maintenance history.
            </p>

            <div className="mt-3">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Select Asset Record</label>
              <select
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.asset_code} - {a.name} ({a.district})
                  </option>
                ))}
              </select>
            </div>

            {selectedAsset && (
              <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-0.5">
                <div><strong>Selected:</strong> {selectedAsset.name}</div>
                <div><strong>Condition:</strong> {selectedAsset.condition} • <strong>Status:</strong> {selectedAsset.status}</div>
              </div>
            )}
          </div>

          <button
            onClick={handleExportSinglePDF}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Download Official PDF Report
          </button>
        </div>
      </div>
    </div>
  );
};
