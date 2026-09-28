import React from 'react';
import { Asset, MaintenanceRecord } from '../types';
import { CheckCircle2, Clock, Wrench, ShieldAlert, Check, Construction } from 'lucide-react';

interface LifecycleTimelineProps {
  asset: Asset;
  maintenanceRecords: MaintenanceRecord[];
}

export const LifecycleTimeline: React.FC<LifecycleTimelineProps> = ({
  asset,
  maintenanceRecords,
}) => {
  const isRetired = asset.status === 'Retired';
  const isUnderMaintenance = asset.status === 'Under Maintenance';

  const stages = [
    {
      title: 'Registration',
      date: new Date(asset.created_at).toLocaleDateString('en-IN'),
      desc: `Registered as ${asset.asset_type} in ${asset.district}`,
      status: 'completed',
      icon: CheckCircle2,
    },
    {
      title: 'Construction & Commissioning',
      date: `Built: ${asset.construction_year}`,
      desc: `Valuation: ₹${Number(asset.estimated_cost).toLocaleString('en-IN')}`,
      status: 'completed',
      icon: Construction,
    },
    {
      title: 'Operational Lifecycle',
      date: asset.status,
      desc: isUnderMaintenance
        ? 'Currently temporarily undergoing repair work.'
        : isRetired
        ? 'Asset lifecycle completed & decommissioned.'
        : 'Active service delivering public transit.',
      status: isRetired ? 'completed' : isUnderMaintenance ? 'active' : 'completed',
      icon: Clock,
    },
    {
      title: 'Maintenance & Repairs',
      date: `${maintenanceRecords.length} Audits Logged`,
      desc: maintenanceRecords.length > 0
        ? `Last maintenance on ${maintenanceRecords[0].maintenance_date} (${maintenanceRecords[0].maintenance_type})`
        : 'No major structural overhauls recorded yet.',
      status: maintenanceRecords.length > 0 ? 'completed' : 'pending',
      icon: Wrench,
    },
    {
      title: 'Decommission / Retirement',
      date: isRetired ? 'Retired' : 'Future Stage',
      desc: isRetired
        ? 'Safely decommissioned from public network.'
        : 'Asset remains actively monitored by R&B Dept.',
      status: isRetired ? 'completed' : 'pending',
      icon: ShieldAlert,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
      <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
        <Clock className="w-4 h-4 text-blue-600" />
        Infrastructure Lifecycle Progress
      </h3>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isCompleted = stage.status === 'completed';
          const isActive = stage.status === 'active';

          return (
            <div key={idx} className="relative flex items-start gap-4">
              <div
                className={`absolute -left-[31px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-xs ${
                  isActive
                    ? 'bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse'
                    : isCompleted
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-400 border border-slate-300'
                }`}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900">{stage.title}</h4>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    {stage.date}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 leading-normal">{stage.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
