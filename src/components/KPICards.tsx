import React from 'react';
import { AlertTriangle, Zap, Flame, Radio, MapPin, Database } from 'lucide-react';
import { KPIMetrics } from '../types/weather';

interface KPICardsProps {
  metrics?: KPIMetrics;
  stats?: KPIMetrics;
  onFilterClick?: (filterType: string) => void;
}

export const KPICards: React.FC<KPICardsProps> = ({ metrics, stats, onFilterClick }) => {
  const m = metrics || stats || {
    activeHazards: 14,
    extremeAnomalies: 38,
    highRiskRegions: 9,
    developingSignals: 6,
    trackedLocations: 703,
    dataSourcesOnline: 5,
    lastUpdated: '14 Sep 2026',
    nextUpdate: '15:10'
  };

  const cards = [
    {
      id: 'active-hazards',
      label: 'Active Hazards',
      value: m.activeHazards,
      subtext: 'Cyclones & Seismic alerts',
      icon: AlertTriangle,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-100',
      badge: 'MONITORED'
    },
    {
      id: 'extreme-anomalies',
      label: 'Extreme Anomalies',
      value: m.extremeAnomalies ?? (m as any).anomaliesDetected ?? 38,
      subtext: 'Z-score > 3.0σ deviation',
      icon: Zap,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
      badge: 'ML FLAGGED'
    },
    {
      id: 'high-risk-regions',
      label: 'High-Risk Regions',
      value: m.highRiskRegions,
      subtext: 'Multivariate composite score',
      icon: Flame,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-100',
      badge: 'IMPACT'
    },
    {
      id: 'developing-signals',
      label: 'Developing Signals',
      value: m.developingSignals,
      subtext: 'Spatial cluster expansion',
      icon: Radio,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      badge: 'EARLY STAGE'
    },
    {
      id: 'tracked-locations',
      label: 'Tracked Locations',
      value: m.trackedLocations ?? (m as any).monitoredStations ?? 703,
      subtext: 'Global & India grid cells',
      icon: MapPin,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100',
      badge: 'GLOBAL'
    },
    {
      id: 'data-sources-online',
      label: 'Data Sources Online',
      value: `${m.dataSourcesOnline}/5`,
      subtext: 'Open-Meteo, USGS, IMD, INCOIS',
      icon: Database,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      badge: '100% HEALTH'
    }
  ];


  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            id={`kpi-card-${card.id}`}
            onClick={() => onFilterClick && onFilterClick(card.id)}
            className="bg-white border border-gray-200 rounded-xl p-3 shadow-2xs hover:shadow-xs transition-shadow cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-gray-500 tracking-tight truncate">
                {card.label}
              </span>
              <div className={`w-6 h-6 rounded-lg ${card.bgColor} ${card.color} flex items-center justify-center shrink-0`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-xl font-bold text-gray-900 leading-none">
                {card.value}
              </span>
              <span className="text-[9px] font-semibold text-gray-400 uppercase">
                {card.badge}
              </span>
            </div>

            <div className="text-[10px] text-gray-400 truncate mt-1">
              {card.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
};
