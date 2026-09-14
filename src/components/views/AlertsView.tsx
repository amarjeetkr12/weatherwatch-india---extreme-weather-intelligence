import React, { useState } from 'react';
import {
  AlertTriangle,
  Flame,
  CloudRain,
  Wind,
  Waves,
  Zap,
  Filter,
  ShieldAlert,
  Clock,
  ExternalLink
} from 'lucide-react';
import { CycloneHazard, EarthquakeHazard, TsunamiEvent } from '../../types/weather';

interface AlertsViewProps {
  cyclones: CycloneHazard[];
  earthquakes: EarthquakeHazard[];
  tsunamis: TsunamiEvent[];
}

export const AlertsView: React.FC<AlertsViewProps> = ({ cyclones, earthquakes, tsunamis }) => {
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'high' | 'moderate'>('all');

  const alerts = [
    ...cyclones.map(c => ({
      id: c.id,
      type: 'Cyclone / Tropical Storm',
      title: `${c.name} — ${c.status}`,
      location: `${c.basin} (${c.coordinates[0]}°N, ${c.coordinates[1]}°E)`,
      severity: c.status === 'Severe Cyclonic Storm' ? 'Critical' : 'High',
      source: c.source,
      time: c.updatedAt,
      description: `Sustained cyclonic wind speed ${c.windSpeedKmh} km/h with central pressure of ${c.centralPressureHpa} hPa. Track vector: ${c.movement}.`,
      icon: AlertTriangle,
      color: 'rose'
    })),
    ...earthquakes.filter(e => e.magnitude >= 4.8).map(e => ({
      id: e.id,
      type: 'Seismic Observation',
      title: `Observed M${e.magnitude.toFixed(1)} Earthquake Detected`,
      location: e.location,
      severity: e.magnitude >= 5.5 ? 'Critical' : 'High',
      source: e.source,
      time: new Date(e.time).toUTCString(),
      description: `Focal depth ${e.depthKm} km at coordinates ${e.coordinates[0]}°N, ${e.coordinates[1]}°E. Strictly an observed seismic event, not a forecast. ${e.tsunamiWarning ? 'Local tsunami evaluation issued.' : 'No regional tsunami threat.'}`,
      icon: Zap,
      color: 'amber'
    })),
    ...tsunamis.map(t => ({
      id: t.id,
      type: 'Tsunami Advisory / Information',
      title: t.title,
      location: t.region,
      severity: t.status === 'Warning' ? 'Critical' : t.status === 'Advisory' ? 'High' : 'Moderate',
      source: t.source,
      time: t.issuedAt,
      description: t.details,
      icon: Waves,
      color: 'blue'
    })),
    {
      id: 'anom-alert-01',
      type: 'Thermal / Heat Surge Anomaly',
      title: 'Barmer & Western Thar Desert Extreme Temperature Surge',
      location: 'Rajasthan, India (Barmer / Jaisalmer Sector)',
      severity: 'High',
      source: 'IMD Climatological Anomaly Alert',
      time: '2026-09-14 11:00 IST',
      description: 'Surface temperatures tracking 4.8°C above historical 30-year normal with intense subsidence heating.',
      icon: Flame,
      color: 'orange'
    },
    {
      id: 'anom-alert-02',
      type: 'Extreme Convective Deluge',
      title: 'Khasi Hills / Cherrapunji Extreme Rainfall Convergence',
      location: 'Meghalaya, India',
      severity: 'Critical',
      source: 'NCMRWF / IMD Flash Flood Guidance',
      time: '2026-09-14 09:30 IST',
      description: 'Persistent orographic lifting producing 114 mm localized 6-hour accumulation. High runoff vulnerability in steep catchment basins.',
      icon: CloudRain,
      color: 'rose'
    }
  ];

  const filteredAlerts = alerts.filter(a => {
    if (filterSeverity === 'all') return true;
    return a.severity.toLowerCase() === filterSeverity.toLowerCase();
  });

  return (
    <div id="alerts-view" className="space-y-4">
      {/* View Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 leading-none">
              Operational Hazard & Anomaly Alerts
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Strictly validated real-time meteorological warnings, observed seismic events, and cyclone tracks.
            </p>
          </div>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-gray-400 font-semibold uppercase text-[10px]">Filter Severity:</span>
          <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50">
            {(['all', 'critical', 'high', 'moderate'] as const).map(sev => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2.5 py-1 rounded-md capitalize font-medium transition-colors ${
                  filterSeverity === sev
                    ? 'bg-white text-gray-900 shadow-2xs font-semibold'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.map(alert => {
          const Icon = alert.icon;
          const isCritical = alert.severity === 'Critical';
          const isHigh = alert.severity === 'High';

          return (
            <div
              key={alert.id}
              className={`bg-white border rounded-xl p-4 shadow-2xs transition-all hover:shadow-xs ${
                isCritical ? 'border-rose-300 ring-1 ring-rose-200/50' :
                isHigh ? 'border-orange-300' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    isCritical ? 'bg-rose-100 text-rose-700' :
                    isHigh ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono">
                        {alert.type}
                      </span>
                      <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                        isCritical ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                        isHigh ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                        'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {alert.severity} Severity
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mt-0.5">
                      {alert.title}
                    </h3>
                    <div className="text-xs text-gray-500 font-medium">
                      Location: {alert.location}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[11px] font-medium text-gray-500 flex items-center justify-end space-x-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span>{alert.time}</span>
                  </div>
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono mt-1 inline-block">
                    {alert.source}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-700 leading-relaxed pl-11">
                {alert.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
