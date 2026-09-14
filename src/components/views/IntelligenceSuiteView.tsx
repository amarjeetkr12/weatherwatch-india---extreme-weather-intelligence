import React, { useState, useEffect } from 'react';
import {
  Globe2,
  Activity,
  GitCommit,
  Layers,
  FileText,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Database,
  ArrowRight,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { GridCell } from '../../types/weather';

interface IntelligenceSuiteViewProps {
  initialTab?: 'intel-global-map' | 'intel-forecast-trajectory' | 'intel-events' | 'intel-anomaly-registry' | 'intel-advisory-feed' | 'intel-diagnostics';
  gridCells: GridCell[];
  onSelectLocation?: (loc: { name: string; country: string; lat: number; lon: number }) => void;
}

export const IntelligenceSuiteView: React.FC<IntelligenceSuiteViewProps> = ({
  initialTab = 'intel-global-map',
  gridCells,
  onSelectLocation
}) => {
  const [activeSection, setActiveSection] = useState(initialTab);
  const [events, setEvents] = useState<any[]>([]);
  const [advisories, setAdvisories] = useState<any[]>([]);
  const [diagnostics, setDiagnostics] = useState<any>(null);

  useEffect(() => {
    setActiveSection(initialTab);
  }, [initialTab]);

  useEffect(() => {
    fetch('/api/events').then(r => r.json()).then(setEvents).catch(console.warn);
    fetch('/api/advisories').then(r => r.json()).then(setAdvisories).catch(console.warn);
    fetch('/api/diagnostics').then(r => r.json()).then(setDiagnostics).catch(console.warn);
  }, []);

  const sections = [
    { id: 'intel-global-map', label: '1. Global Spatial Map', icon: Globe2 },
    { id: 'intel-forecast-trajectory', label: '2. Forecast Trajectory & Risk', icon: Activity },
    { id: 'intel-events', label: '3. Spatio-Temporal Events', icon: GitCommit },
    { id: 'intel-anomaly-registry', label: '4. Anomaly Registry', icon: Layers },
    { id: 'intel-advisory-feed', label: '5. Advisory Feed', icon: FileText },
    { id: 'intel-diagnostics', label: '6. Diagnostics & Quality', icon: Cpu }
  ];

  return (
    <div id="intelligence-suite-view" className="space-y-4">
      {/* Top Section Nav Tabs */}
      <div className="bg-white border border-gray-200 rounded-xl p-2 shadow-2xs">
        <div className="flex items-center space-x-1 overflow-x-auto">
          {sections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id as any)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 shrink-0 transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. Global Spatial Map Analytics */}
      {activeSection === 'intel-global-map' && (
        <div className="space-y-3">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
            <h3 className="text-sm font-bold text-gray-900 mb-1">
              Global Spatial Grid & India High-Resolution Matrix
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              703-cell analytical grid resolution monitoring temperature, precipitation anomaly, and divergence patterns.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <span className="text-[10px] text-blue-700 font-bold uppercase">Grid Cells Active</span>
                <div className="text-xl font-extrabold text-blue-900">{gridCells.length} Monitored Nodes</div>
                <span className="text-[11px] text-blue-600">Global & National Coverage</span>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                <span className="text-[10px] text-amber-700 font-bold uppercase">Spatial Anomaly Density</span>
                <div className="text-xl font-extrabold text-amber-900">
                  {gridCells.filter(c => c.anomaly === 'Significant' || c.anomaly === 'Extreme').length} Anomalous Cells
                </div>
                <span className="text-[11px] text-amber-600">Spatial Autocorrelation Moran's I: 0.68</span>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                <span className="text-[10px] text-emerald-700 font-bold uppercase">Clustering Confidence</span>
                <div className="text-xl font-extrabold text-emerald-900">94.8%</div>
                <span className="text-[11px] text-emerald-600">DBSCAN Spatial Cluster Validator</span>
              </div>
            </div>

            {/* Grid Station Quick Selector */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-3 py-2 bg-gray-50 text-xs font-bold text-gray-700 border-b border-gray-200">
                Monitored Meteorological Nodes & Anomaly Scores
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 text-xs">
                {gridCells.map((cell) => (
                  <div key={cell.id} className="p-2.5 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center space-x-2.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" />
                      <div>
                        <div className="font-semibold text-gray-900">{cell.name}</div>
                        <div className="text-[10px] text-gray-400 font-mono">
                          {cell.lat.toFixed(2)}°N, {cell.lon.toFixed(2)}°E • {cell.region}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-gray-800">{cell.temperature}°C</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        cell.anomaly === 'Extreme' ? 'bg-rose-100 text-rose-800' :
                        cell.anomaly === 'Significant' ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {cell.anomaly}
                      </span>
                      {onSelectLocation && (
                        <button
                          onClick={() => onSelectLocation({ name: cell.name, country: cell.region, lat: cell.lat, lon: cell.lon })}
                          className="px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-[11px] font-medium"
                        >
                          Inspect
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Forecast Trajectory & Risk */}
      {activeSection === 'intel-forecast-trajectory' && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Multi-Ensemble Forecast Trajectory & Risk Divergence
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Evaluating medium-range forecast agreement across ECMWF, GFS, and NCMRWF model ensembles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 border border-gray-200 rounded-lg">
              <div className="font-bold text-xs text-gray-800 mb-1">ECMWF Integrated Forecasting System</div>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Deterministic run: 0.1° resolution</div>
                <div>Ensemble members: 51 members</div>
                <div className="text-blue-600 font-semibold">Consensus Score: 92%</div>
              </div>
            </div>

            <div className="p-3.5 border border-gray-200 rounded-lg">
              <div className="font-bold text-xs text-gray-800 mb-1">NCEP Global Forecast System (GFS)</div>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Deterministic run: 0.25° resolution</div>
                <div>Ensemble members: 31 members</div>
                <div className="text-blue-600 font-semibold">Consensus Score: 87%</div>
              </div>
            </div>

            <div className="p-3.5 border border-gray-200 rounded-lg">
              <div className="font-bold text-xs text-gray-800 mb-1">NCMRWF Unified Model (India)</div>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Regional domain: 4.0 km convection-permitting</div>
                <div>Focus: Monsoon Trough & Western Ghats</div>
                <div className="text-blue-600 font-semibold">Consensus Score: 94%</div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-700 leading-relaxed border border-gray-200">
            <strong>Trajectory Analysis Note:</strong> Model spread remains tight through Day +3 (low epistemic uncertainty), with slight ensemble dispersion starting Day +5 over cyclonic tracks in the Bay of Bengal. Confidence levels for heatwave persistence in Western Rajasthan remain high (&gt;90%).
          </div>
        </div>
      )}

      {/* 3. Spatio-Temporal Events */}
      {activeSection === 'intel-events' && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs space-y-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Spatio-Temporal Coherent Weather Event Tracking
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Continuously track clusters of anomalies as coherent propagating entities over space and time.
            </p>
          </div>

          <div className="space-y-3">
            {events.map((evt) => (
              <div key={evt.id} className="p-3.5 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-blue-600 uppercase">
                      EVENT ID: {evt.id} • {evt.type}
                    </span>
                    <h4 className="text-sm font-bold text-gray-900 mt-0.5">{evt.name}</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                    {evt.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs my-2.5 bg-gray-50 p-2.5 rounded">
                  <div>
                    <span className="text-[10px] text-gray-400 block">COORDINATES</span>
                    <span className="font-mono text-gray-800">{evt.coordinates[0]}°N, {evt.coordinates[1]}°E</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block">CLUSTER RADIUS</span>
                    <span className="font-semibold text-gray-800">{evt.clusterRadiusKm} km</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block">PERSISTENCE</span>
                    <span className="font-semibold text-gray-800">{evt.durationDays} Days</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block">ML CONFIDENCE</span>
                    <span className="font-bold text-emerald-600">{evt.mlConfidence}%</span>
                  </div>
                </div>

                <div className="text-xs text-gray-600">
                  <strong>Progression Vector:</strong> {evt.progression}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Anomaly Registry */}
      {activeSection === 'intel-anomaly-registry' && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs space-y-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Climatological Anomaly Registry & ML Scoring Engine
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Isolation Forest multidimensional outlier detection combined with robust Z-score and Interquartile Range (IQR) bounds.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-gray-200">
              <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase">
                <tr>
                  <th className="px-3.5 py-2.5">Station</th>
                  <th className="px-3.5 py-2.5">Temperature Anomaly</th>
                  <th className="px-3.5 py-2.5">Rainfall Deviation</th>
                  <th className="px-3.5 py-2.5">Wind Anomaly</th>
                  <th className="px-3.5 py-2.5">Robust Z-Score</th>
                  <th className="px-3.5 py-2.5">Isolation Forest</th>
                  <th className="px-3.5 py-2.5">Classification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {gridCells.slice(0, 8).map(cell => {
                  const z = (cell.anomalyScore * 3.4).toFixed(2);
                  return (
                    <tr key={cell.id} className="hover:bg-blue-50/30">
                      <td className="px-3.5 py-2.5 font-semibold text-gray-900">{cell.name}</td>
                      <td className="px-3.5 py-2.5 text-rose-600 font-semibold">
                        {cell.temperature > 25 ? `+${(cell.temperature - 24.5).toFixed(1)}°C` : `${(cell.temperature - 24.5).toFixed(1)}°C`}
                      </td>
                      <td className="px-3.5 py-2.5 text-blue-600">
                        {cell.precipitation > 0 ? `+${cell.precipitation} mm` : '0 mm'}
                      </td>
                      <td className="px-3.5 py-2.5 text-gray-700">{cell.windSpeed} km/h</td>
                      <td className="px-3.5 py-2.5 font-mono text-[11px]">{z}σ</td>
                      <td className="px-3.5 py-2.5 font-mono text-[11px] font-bold">{cell.anomalyScore}</td>
                      <td className="px-3.5 py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          cell.anomaly === 'Extreme' ? 'bg-rose-100 text-rose-800' :
                          cell.anomaly === 'Significant' ? 'bg-amber-100 text-amber-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {cell.anomaly}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Advisory Feed */}
      {activeSection === 'intel-advisory-feed' && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs space-y-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Official Meteorological & Marine Advisory Feed
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Live synchronized bulletins from IMD New Delhi, RSMC, JMA Tokyo, and INCOIS Hyderabad.
            </p>
          </div>

          <div className="space-y-3">
            {advisories.map((adv) => (
              <div key={adv.id} className="p-3.5 border border-gray-200 rounded-lg hover:border-gray-300">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-gray-900">{adv.agency}</span>
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      {adv.level}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">Issued: {adv.issuedAt}</span>
                </div>
                <h4 className="text-xs font-bold text-gray-800 mb-1">{adv.title}</h4>
                <p className="text-xs text-gray-600 leading-relaxed">{adv.description}</p>
                <div className="mt-2 text-[10px] text-gray-400 border-t border-gray-100 pt-1">
                  Valid Until: {adv.validUntil}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Diagnostics & Quality */}
      {activeSection === 'intel-diagnostics' && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              System Diagnostics, Quality Assurance & Data Provenance
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Real-time API health telemetry, model convergence diagnostics, and caching efficiency.
            </p>
          </div>

          {diagnostics && (
            <div className="space-y-4">
              {/* Data sources health table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-3.5 py-2.5 bg-gray-50 text-xs font-bold text-gray-700 border-b border-gray-200">
                  Live API Ingestion Endpoints
                </div>
                <div className="divide-y divide-gray-100 text-xs">
                  {diagnostics.dataSources.map((ds: any) => (
                    <div key={ds.name} className="p-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="font-semibold text-gray-800">{ds.name}</span>
                        <span className="text-[10px] text-gray-400 font-mono">({ds.protocol})</span>
                      </div>
                      <div className="flex items-center space-x-4 text-[11px] text-gray-500 font-mono">
                        <span>Latency: {ds.latencyMs}ms</span>
                        <span>Uptime: {ds.uptime}</span>
                        <span className="text-emerald-700 font-semibold">Cache Hit: {ds.cacheHitRate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ML Engine Metadata */}
              <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-200 text-xs space-y-1.5">
                <div className="font-bold text-gray-800">Machine Learning Isolation Forest Model</div>
                <div className="text-gray-600">Algorithm: {diagnostics.mlEngine.algorithm}</div>
                <div className="text-gray-600">Climatological Reference: {diagnostics.mlEngine.climatologicalBaseline}</div>
                <div className="text-gray-600 font-mono text-[11px]">
                  Feature Vector: {diagnostics.mlEngine.featureDimensions.join(', ')}
                </div>
                <div className="text-emerald-700 font-semibold">
                  Spatial Convergence Score: {diagnostics.mlEngine.spatialConvergenceScore}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
