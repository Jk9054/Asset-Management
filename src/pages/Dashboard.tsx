import React, { useEffect, useState } from 'react';
import { Asset, MaintenanceRecord } from '../types';
import { fetchAssets, computeDashboardStats } from '../services/assetService';
import { fetchAllMaintenance } from '../services/maintenanceService';
import { DEMO_DISTRICTS } from '../services/mockData';
import { StatCard } from '../components/StatCard';
import { AssetMap } from '../components/AssetMap';
import { ConditionBadge, StatusBadge, TypeBadge } from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  Layers,
  MapPin,
  AlertTriangle,
  Building,
  CheckCircle,
  Wrench,
  Filter,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dashboard Filters
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [fetchedAssets, fetchedMaintenance] = await Promise.all([
        fetchAssets(),
        fetchAllMaintenance(),
      ]);
      setAssets(fetchedAssets);
      setMaintenanceLogs(fetchedMaintenance);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered Assets list based on dashboard dropdowns
  const filteredAssets = assets.filter((asset) => {
    const matchDistrict = selectedDistrict === 'All' || asset.district === selectedDistrict;
    const matchType = selectedType === 'All' || asset.asset_type === selectedType;
    return matchDistrict && matchType;
  });

  const stats = computeDashboardStats(filteredAssets);

  // Prepare chart data
  const typeChartData = [
    { name: 'Road', count: filteredAssets.filter((a) => a.asset_type === 'Road').length },
    { name: 'Bridge', count: filteredAssets.filter((a) => a.asset_type === 'Bridge').length },
    { name: 'Building', count: filteredAssets.filter((a) => a.asset_type === 'Building').length },
    { name: 'Culvert', count: filteredAssets.filter((a) => a.asset_type === 'Culvert').length },
    { name: 'Flyover', count: filteredAssets.filter((a) => a.asset_type === 'Flyover').length },
    { name: 'Other', count: filteredAssets.filter((a) => a.asset_type === 'Other').length },
  ];

  const conditionChartData = [
    { name: 'Good', value: stats.goodConditionCount, color: '#10b981' },
    { name: 'Fair', value: stats.fairConditionCount, color: '#f59e0b' },
    { name: 'Poor', value: stats.poorConditionCount, color: '#ef4444' },
  ].filter((d) => d.value > 0);

  const statusChartData = [
    { name: 'Active', value: stats.activeCount, color: '#3b82f6' },
    { name: 'Under Maintenance', value: stats.underMaintenanceCount, color: '#f59e0b' },
    { name: 'Retired', value: stats.retiredCount, color: '#64748b' },
  ].filter((d) => d.value > 0);

  const recentAssets = filteredAssets.slice(0, 5);
  const recentMaintenance = maintenanceLogs.slice(0, 5);

  if (isLoading) {
    return <LoadingSpinner message="Calculating infrastructure asset metrics..." />;
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-3xl shadow-lg border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold tracking-tight text-slate-100">
              Infrastructure Operations & Analytics Dashboard
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Real-time monitoring of roads, bridges, public buildings, and state capital assets.
          </p>
        </div>

        {/* Dashboard Filters */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-800/80 p-2.5 rounded-2xl border border-slate-700">
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold px-2">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </div>

          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 text-xs text-slate-200 border border-slate-700 focus:outline-none font-medium"
          >
            <option value="All">All Districts ({assets.length})</option>
            {DEMO_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 text-xs text-slate-200 border border-slate-700 focus:outline-none font-medium"
          >
            <option value="All">All Asset Types</option>
            <option value="Road">Roads</option>
            <option value="Bridge">Bridges</option>
            <option value="Building">Buildings</option>
            <option value="Culvert">Culverts</option>
            <option value="Flyover">Flyovers</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Assets"
          value={stats.totalAssets}
          subtitle={`Filtered Inventory`}
          icon={Layers}
          colorTheme="blue"
          onClick={() => navigate('/assets')}
        />
        <StatCard
          title="Road Network"
          value={stats.roadsCount}
          subtitle="Expressways & Corridors"
          icon={MapPin}
          colorTheme="indigo"
          onClick={() => {
            setSelectedType('Road');
            navigate('/assets');
          }}
        />
        <StatCard
          title="Bridges & Flyovers"
          value={stats.bridgesCount}
          subtitle="River & Rail Overpasses"
          icon={TrendingUp}
          colorTheme="purple"
          onClick={() => {
            setSelectedType('Bridge');
            navigate('/assets');
          }}
        />
        <StatCard
          title="Govt Buildings"
          value={stats.buildingsCount}
          subtitle="Secretariats & Hospitals"
          icon={Building}
          colorTheme="emerald"
          onClick={() => {
            setSelectedType('Building');
            navigate('/assets');
          }}
        />
        <StatCard
          title="Poor Condition"
          value={stats.poorConditionCount}
          subtitle="Requires Immediate Repair"
          icon={AlertTriangle}
          colorTheme="rose"
          onClick={() => navigate('/assets?condition=Poor')}
        />
      </div>

      {/* Map + Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaflet Map (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                State Infrastructure GIS Map
              </h3>
              <p className="text-xs text-slate-500">
                Click pin markers to view asset name, code, condition, and full inspection profile.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              {filteredAssets.length} Pins Rendered
            </span>
          </div>

          <AssetMap assets={filteredAssets} height="360px" zoom={8} />
        </div>

        {/* Condition & Status Charts (1 Col) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Asset Health Condition</h3>
            <p className="text-xs text-slate-500 mb-3">Good vs Fair vs Poor status distribution</p>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={conditionChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {conditionChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Operational Status</h3>
            <p className="text-xs text-slate-500 mb-3">Active vs Under Maintenance</p>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend verticalAlign="bottom" height={30} wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Bar Chart: Assets by Type */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Asset Distribution by Category</h3>
            <p className="text-xs text-slate-500">Categorization across public infrastructure types</p>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={typeChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
              <RechartsTooltip cursor={{ fill: '#f1f5f9' }} />
              <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Grid: Recent Assets & Recent Maintenance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Assets */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" /> Recent Infrastructure Registrations
            </h3>
            <button
              onClick={() => navigate('/assets')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentAssets.map((asset) => (
              <div
                key={asset.id}
                onClick={() => navigate(`/assets/${asset.id}`)}
                className="py-3 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-xl transition-colors cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600">
                      {asset.asset_code}
                    </span>
                    <TypeBadge type={asset.asset_type} />
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 mt-1">{asset.name}</h4>
                  <p className="text-[11px] text-slate-500">{asset.district} • {asset.responsible_division}</p>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <ConditionBadge condition={asset.condition} />
                  <span className="text-[10px] text-slate-400 font-mono">
                    ₹{(asset.estimated_cost / 10000000).toFixed(1)} Cr
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Maintenance Audits */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-600" /> Recent Maintenance & Inspection Logs
            </h3>
            <button
              onClick={() => navigate('/assets/maintenance')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Audit History <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentMaintenance.map((m) => (
              <div key={m.id} className="py-3 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      {m.maintenance_type}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">{m.maintenance_date}</span>
                  </div>
                  <p className="text-xs text-slate-800 font-medium mt-1 leading-snug">{m.description}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">By {m.created_by}</p>
                </div>

                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-slate-900">
                    ₹{Number(m.cost).toLocaleString('en-IN')}
                  </span>
                  <div className="mt-1">
                    <ConditionBadge condition={m.condition_after} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
