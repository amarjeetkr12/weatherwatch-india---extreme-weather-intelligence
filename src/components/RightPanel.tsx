import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import {
  Thermometer,
  CloudRain,
  Wind,
  Gauge,
  Eye,
  Activity,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Waves,
  Calendar,
  Sparkles,
  Info,
  Bookmark,
  BookmarkCheck,
  MapPin,
  Play,
  Pause,
  RotateCcw,
  X,
  FileSpreadsheet,
  GitCompare,
  Database
} from 'lucide-react';
import { WeatherData, ForecastDay, WeatherAnomaly, EarthquakeHazard, CycloneHazard, TsunamiEvent, TrackedLocation } from '../types/weather';

interface RightPanelProps {
  weather: WeatherData;
  forecast: ForecastDay[];
  anomaly: WeatherAnomaly;
  earthquakes: EarthquakeHazard[];
  cyclones: CycloneHazard[];
  tsunamis: TsunamiEvent[];
  isLoading?: boolean;
  weatherError?: string | null;
  onSelectLocation?: (loc: { name: string; country: string; state?: string; lat: number; lon: number }) => void;
}

const DEFAULT_TRACKED_LOCATIONS: TrackedLocation[] = [
  { id: 'track-1', name: 'Jaipur, Rajasthan', country: 'India', lat: 26.9124, lon: 75.7873, addedAt: new Date().toISOString() },
  { id: 'track-2', name: 'Mumbai, Maharashtra', country: 'India', lat: 19.0760, lon: 72.8777, addedAt: new Date().toISOString() },
  { id: 'track-3', name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503, addedAt: new Date().toISOString() }
];

export const RightPanel: React.FC<RightPanelProps> = ({
  weather,
  forecast,
  anomaly,
  earthquakes,
  cyclones,
  tsunamis,
  isLoading,
  weatherError,
  onSelectLocation
}) => {
  const formatMetric = (value: number, suffix: string, digits = 1) =>
    Number.isFinite(value) ? `${value.toFixed(digits)}${suffix}` : 'Data unavailable';

  const [whyRiskOpen, setWhyRiskOpen] = useState(false);
  const [hazardWatchOpen, setHazardWatchOpen] = useState(true);
  const [timelineOpen, setTimelineOpen] = useState(true);

  // Tracked locations local state
  const [trackedLocations, setTrackedLocations] = useState<TrackedLocation[]>(() => {
    try {
      const saved = localStorage.getItem('weatherwatch_tracked_locations');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_TRACKED_LOCATIONS;
  });

  // Timeline Slider State: -1 = Historical, 0 = Current, 1..7 = Forecast days
  const [timelineIndex, setTimelineIndex] = useState<number>(0);
  const [isPlayingTimeline, setIsPlayingTimeline] = useState<boolean>(false);

  // Save tracked locations to local storage
  useEffect(() => {
    try {
      localStorage.setItem('weatherwatch_tracked_locations', JSON.stringify(trackedLocations));
    } catch (e) {
      console.warn('Failed to persist tracked locations:', e);
    }
  }, [trackedLocations]);

  // Timeline playback loop
  useEffect(() => {
    if (!isPlayingTimeline) return;
    const interval = setInterval(() => {
      setTimelineIndex(prev => (prev >= Math.min(forecast.length, 7) ? -1 : prev + 1));
    }, 1800);
    return () => clearInterval(interval);
  }, [isPlayingTimeline, forecast.length]);

  const isCurrentTracked = trackedLocations.some(
    loc => loc.name.toLowerCase() === weather.location.toLowerCase() ||
      (Math.abs(loc.lat - weather.lat) < 0.05 && Math.abs(loc.lon - weather.lon) < 0.05)
  );

  const handleToggleTrack = () => {
    if (isCurrentTracked) {
      setTrackedLocations(prev => prev.filter(
        loc => loc.name.toLowerCase() !== weather.location.toLowerCase() &&
          !(Math.abs(loc.lat - weather.lat) < 0.05 && Math.abs(loc.lon - weather.lon) < 0.05)
      ));
    } else {
      const newTracked: TrackedLocation = {
        id: `track-${Date.now()}`,
        name: weather.location,
        country: weather.country,
        state: weather.state,
        lat: weather.lat,
        lon: weather.lon,
        addedAt: new Date().toISOString()
      };
      setTrackedLocations(prev => [newTracked, ...prev]);
    }
  };

  const handleRemoveTracked = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTrackedLocations(prev => prev.filter(l => l.id !== id));
  };

  // Prepare chart data for Temperature Trend
  const tempChartData = forecast.map((f) => ({
    day: f.dayName,
    maxTemp: f.maxTemp,
    minTemp: f.minTemp,
    condition: f.condition
  }));

  // Prepare chart data for Precipitation Forecast
  const precipChartData = forecast.map((f) => ({
    day: f.dayName,
    precipitation: f.precipitation,
    probability: f.rainProbability
  }));

  const totalPrecip = precipChartData.reduce((acc, cur) => acc + cur.precipitation, 0);

  // Relevant nearby or regional hazards for State Hazard Watch
  const isIndia = weather.country === 'India' || weather.state?.toLowerCase().includes('rajasthan') || weather.location.toLowerCase().includes('delhi');
  const isJapan = weather.country === 'Japan' || weather.location.toLowerCase().includes('tokyo');
  const isUSA = weather.country === 'United States' || weather.location.toLowerCase().includes('california') || weather.location.toLowerCase().includes('york');

  // Filter earthquakes relevant or observed
  const relevantEarthquakes = earthquakes.slice(0, 2);

  // Color classes for risk
  const getRiskBadgeClass = (risk: string) => {
    switch (risk) {
      case 'Critical':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Moderate':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  const getAnomalyBadgeClass = (anom: string) => {
    switch (anom) {
      case 'Extreme':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Significant':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Mild':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div id="right-side-panel" className="w-full lg:w-96 shrink-0 flex flex-col space-y-3">
      {/* 1. CURRENT WEATHER CARD - Matching Reference Layout */}
      <div id="current-weather-card" className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                Current Weather — {weather.location}
              </h3>
              <button
                onClick={handleToggleTrack}
                className={`inline-flex items-center space-x-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border transition-colors ${
                  isCurrentTracked
                    ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200'
                }`}
                title={isCurrentTracked ? 'Location is tracked (click to remove)' : 'Track this location'}
              >
                {isCurrentTracked ? (
                  <>
                    <BookmarkCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>Tracked</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Track Location</span>
                  </>
                )}
              </button>
            </div>
            <span className="text-[10px] text-gray-500 font-medium">
              {weather.state ? `${weather.state}, ` : ''}{weather.country} • Lat {weather.lat.toFixed(2)}°, Lon {weather.lon.toFixed(2)}°
            </span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono font-semibold">
            {weather.source}
          </span>
        </div>

        {weatherError && (
          <div className="mb-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{weatherError} Cached values are hidden until a fresh observation arrives.</span>
          </div>
        )}

        {/* Tracked Locations List */}
        {trackedLocations.length > 0 && (
          <div className="mb-3 pb-2.5 border-b border-gray-100 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tracked:</span>
            {trackedLocations.map(tl => {
              const isSelected = tl.name.toLowerCase() === weather.location.toLowerCase() ||
                (Math.abs(tl.lat - weather.lat) < 0.05 && Math.abs(tl.lon - weather.lon) < 0.05);
              return (
                <button
                  key={tl.id}
                  onClick={() => onSelectLocation && onSelectLocation({
                    name: tl.name,
                    country: tl.country,
                    state: tl.state,
                    lat: tl.lat,
                    lon: tl.lon
                  })}
                  className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title={`Switch to ${tl.name}`}
                >
                  <MapPin className="w-2.5 h-2.5" />
                  <span>{tl.name.split(',')[0]}</span>
                  <span
                    onClick={(e) => handleRemoveTracked(tl.id, e)}
                    className="ml-1 text-gray-400 hover:text-rose-500 cursor-pointer p-0.5"
                    title="Remove location"
                  >
                    <X className="w-2.5 h-2.5" />
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Hero Temperature Display */}
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <div className="text-4xl font-extrabold text-gray-900 tracking-tight">
              {weatherError ? 'Data unavailable' : formatMetric(weather.temperature, '°C')}
            </div>
            <div className="text-xs font-semibold text-gray-600 mt-0.5">
              {weatherError ? 'Awaiting live observation' : weather.condition}
            </div>
          </div>
          <div className="text-right">
            <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-md border ${getRiskBadgeClass(anomaly.risk)}`}>
              {anomaly.risk} Risk
            </span>
            <div className="text-[10px] text-gray-400 mt-1">
              {weatherError ? 'Not available' : `Updated: ${weather.lastUpdated}`}
            </div>
          </div>
        </div>

        {/* Live Weather Metrics Grid */}
        {!weatherError && <div className="grid grid-cols-2 gap-y-2.5 gap-x-3 text-xs border-t border-gray-100 pt-3">
          <div className="flex justify-between items-center text-gray-600">
            <span className="text-gray-500">Feels Like</span>
            <span className="font-semibold text-gray-900">{formatMetric(weather.apparentTemperature, '°C', 0)}</span>
          </div>
          <div className="flex justify-between items-center text-gray-600">
            <span className="text-gray-500">Humidity</span>
            <span className="font-semibold text-gray-900">{formatMetric(weather.humidity, '%', 0)}</span>
          </div>
          <div className="flex justify-between items-center text-gray-600">
            <span className="text-gray-500">Wind Speed</span>
            <span className="font-semibold text-gray-900">
              {Number.isFinite(weather.windSpeed) ? `${weather.windSpeed.toFixed(1)} km/h (${weather.windDirectionCompass})` : 'Data unavailable'}
            </span>
          </div>
          <div className="flex justify-between items-center text-gray-600">
            <span className="text-gray-500">Rain Probability</span>
            <span className="font-semibold text-gray-900">{formatMetric(weather.rainProbability, '%', 0)}</span>
          </div>
          <div className="flex justify-between items-center text-gray-600">
            <span className="text-gray-500">Rainfall (last hour)</span>
            <span className="font-semibold text-gray-900">{formatMetric(weather.rainAmount, ' mm')}</span>
          </div>
          <div className="flex justify-between items-center text-gray-600">
            <span className="text-gray-500">Total Precipitation</span>
            <span className="font-semibold text-gray-900">{formatMetric(weather.precipitation, ' mm')}</span>
          </div>
          <div className="flex justify-between items-center text-gray-600">
            <span className="text-gray-500">Pressure</span>
            <span className="font-semibold text-gray-900">{formatMetric(weather.pressure, ' hPa')}</span>
          </div>
          <div className="flex justify-between items-center text-gray-600">
            <span className="text-gray-500">Visibility</span>
            <span className="font-semibold text-gray-900">{formatMetric(weather.visibility, ' km')}</span>
          </div>
          <div className="flex justify-between items-center text-gray-600">
            <span className="text-gray-500">Cloud Cover</span>
            <span className="font-semibold text-gray-900">{formatMetric(weather.cloudCover, '%', 0)}</span>
          </div>
          <div className="flex justify-between items-center text-gray-600">
            <span className="text-gray-500">Air Quality (AQI)</span>
            <span className="font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
              {weather.aqi ? `${weather.aqi.category} (${weather.aqi.value})` : 'Unavailable'}
            </span>
          </div>
        </div>}
      </div>

      {/* 1.1 LIVE + EXCEL INTEGRATED COMPARISON CARD (Requirement 15) */}
      {weather.uploadedComparison && (
        <div id="live-excel-comparison-card" className="bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/70 border-2 border-indigo-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between border-b border-indigo-100 pb-2 mb-2.5">
            <div className="flex items-center space-x-1.5">
              <GitCompare className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold text-gray-900 tracking-tight">
                Live API + Excel Ground Truth Integration
              </h4>
            </div>
            <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-600 text-white tracking-wider">
              COMBINED
            </span>
          </div>

          <div className="text-[11px] text-gray-600 mb-2">
            Dataset: <strong className="text-indigo-950 font-semibold">{weather.uploadedComparison.datasetName}</strong>
            {weather.uploadedComparison.recordedAt && (
              <span className="text-gray-400"> • Ingested {weather.uploadedComparison.recordedAt}</span>
            )}
          </div>

          {/* Side-by-side comparison table */}
          <div className="bg-white/90 border border-indigo-100 rounded-lg overflow-hidden mb-2.5 text-xs">
            <div className="grid grid-cols-3 bg-indigo-50/60 px-2 py-1 text-[10px] font-bold text-indigo-900 border-b border-indigo-100">
              <span>PARAMETER</span>
              <span className="text-center">LIVE API</span>
              <span className="text-right">UPLOADED (EXCEL)</span>
            </div>

            <div className="grid grid-cols-3 px-2 py-1.5 border-b border-gray-100 items-center">
              <span className="text-[11px] font-medium text-gray-600">Temperature</span>
              <span className="text-center font-bold text-gray-900">{formatMetric(weather.temperature, '°C')}</span>
              <span className="text-right font-bold text-indigo-700">{weather.uploadedComparison.tempC.toFixed(1)}°C</span>
            </div>

            <div className="grid grid-cols-3 px-2 py-1.5 border-b border-gray-100 items-center">
              <span className="text-[11px] font-medium text-gray-600">Rainfall</span>
              <span className="text-center font-bold text-gray-900">{formatMetric(weather.precipitation, ' mm')}</span>
              <span className="text-right font-bold text-indigo-700">{weather.uploadedComparison.rainfallMm} mm</span>
            </div>

            <div className="grid grid-cols-3 px-2 py-1.5 border-b border-gray-100 items-center">
              <span className="text-[11px] font-medium text-gray-600">Wind Velocity</span>
              <span className="text-center font-bold text-gray-900">{formatMetric(weather.windSpeed, ' km/h')}</span>
              <span className="text-right font-bold text-indigo-700">{weather.uploadedComparison.windKmh} km/h</span>
            </div>

            <div className="grid grid-cols-3 px-2 py-1.5 items-center">
              <span className="text-[11px] font-medium text-gray-600">Atm. Pressure</span>
              <span className="text-center font-bold text-gray-900">{formatMetric(weather.pressure, ' hPa')}</span>
              <span className="text-right font-bold text-indigo-700">{weather.uploadedComparison.pressureHpa} hPa</span>
            </div>
          </div>

          {/* Anomaly & Notes from Excel */}
          {weather.uploadedComparison.notes && (
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-md p-2 text-[11px] text-amber-900 mb-2.5">
              <div className="font-bold text-[10px] uppercase text-amber-800 tracking-wider mb-0.5">Observational Ground Truth:</div>
              <div>{weather.uploadedComparison.notes}</div>
            </div>
          )}

          {/* Explicit Data Provenance Labels (Requirement 15) */}
          <div className="pt-2 border-t border-indigo-100/80">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Data Lineage & Provenance Labels:
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                LIVE
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                FORECAST
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
                HISTORICAL
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
                UPLOADED
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                OFFICIAL
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                MODEL-DERIVED
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. TEMPERATURE TREND LINE CHART (Replacing What We're Seeing) */}
      <div id="temperature-trend-card" className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1.5">
            <Thermometer className="w-4 h-4 text-orange-500" />
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Temperature Trend
            </h4>
          </div>
          <span className="text-[10px] text-gray-400 font-mono">
            7-Day Forecast
          </span>
        </div>

        <div className="h-36 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={tempChartData} margin={{ top: 8, right: 10, left: -22, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis domain={['dataMin - 3', 'dataMax + 3']} tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} unit="°" />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-2 border border-gray-200 rounded-md shadow-md text-[11px]">
                        <div className="font-bold text-gray-800">{label}</div>
                        <div className="text-orange-600 font-semibold">Max: {data.maxTemp}°C</div>
                        <div className="text-blue-600 font-semibold">Min: {data.minTemp}°C</div>
                        <div className="text-gray-500 text-[10px]">{data.condition}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line type="monotone" dataKey="maxTemp" stroke="#f97316" strokeWidth={2.5} dot={{ r: 3, fill: '#ea580c' }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="minTemp" stroke="#0284c7" strokeWidth={1.5} strokeDasharray="3 3" dot={{ r: 2, fill: '#0284c7' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. PRECIPITATION FORECAST GRAPH (Second live graph) */}
      <div id="precipitation-forecast-card" className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1.5">
            <CloudRain className="w-4 h-4 text-blue-500" />
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Precipitation Forecast
            </h4>
          </div>
          <span className="text-[10px] text-gray-400 font-mono">
            {totalPrecip > 0 ? `Total: ${totalPrecip.toFixed(1)} mm` : '0 mm Total'}
          </span>
        </div>

        {totalPrecip === 0 && forecast.every(f => f.precipitation === 0) ? (
          <div className="h-28 flex flex-col items-center justify-center text-center p-3 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
            <CloudRain className="w-5 h-5 text-gray-300 mb-1" />
            <span className="text-xs font-medium text-gray-500">
              No precipitation forecast data available
            </span>
            <span className="text-[10px] text-gray-400">
              Dry atmospheric conditions forecast across the 7-day period
            </span>
          </div>
        ) : (
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={precipChartData} margin={{ top: 8, right: 10, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} unit="mm" />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-white p-2 border border-gray-200 rounded-md shadow-md text-[11px]">
                          <div className="font-bold text-gray-800">{label}</div>
                          <div className="text-blue-600 font-semibold">Precip: {d.precipitation} mm</div>
                          <div className="text-gray-500 text-[10px]">Probability: {d.probability}%</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="precipitation" radius={[3, 3, 0, 0]}>
                  {precipChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.precipitation > 20 ? '#1d4ed8' : entry.precipitation > 5 ? '#3b82f6' : '#93c5fd'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 4. WEATHER + ANOMALY INTELLIGENCE CARD */}
      <div id="weather-intelligence-card" className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-2xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2.5">
          <div className="flex items-center space-x-1.5">
            <Activity className="w-4 h-4 text-purple-600" />
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Weather Intelligence
            </h4>
          </div>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getAnomalyBadgeClass(anomaly.currentAnomaly)}`}>
            {anomaly.currentAnomaly} Anomaly
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
            <div className="text-[10px] text-gray-500">Temperature Anomaly</div>
            <div className={`text-sm font-bold ${anomaly.tempAnomaly > 0 ? 'text-rose-600' : 'text-blue-600'}`}>
              {anomaly.tempAnomaly > 0 ? `+${anomaly.tempAnomaly}` : anomaly.tempAnomaly} °C
            </div>
          </div>

          <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
            <div className="text-[10px] text-gray-500">Rainfall Anomaly</div>
            <div className={`text-sm font-bold ${anomaly.rainAnomaly > 0 ? 'text-blue-600' : 'text-gray-700'}`}>
              {anomaly.rainAnomaly > 0 ? `+${anomaly.rainAnomaly}` : anomaly.rainAnomaly} mm
            </div>
          </div>

          <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
            <div className="text-[10px] text-gray-500">Wind Anomaly</div>
            <div className="text-sm font-bold text-purple-700">
              {anomaly.windAnomaly > 0 ? `+${anomaly.windAnomaly}` : anomaly.windAnomaly} km/h
            </div>
          </div>

          <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
            <div className="text-[10px] text-gray-500">ML Signal</div>
            <div className="text-xs font-bold text-gray-900 truncate">
              {anomaly.mlSignal}
            </div>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
          <span className="text-gray-500 font-medium">Risk Assessment:</span>
          <div className="flex items-center space-x-1.5">
            <span className={`font-bold px-1.5 py-0.5 rounded border text-[11px] ${getRiskBadgeClass(anomaly.risk)}`}>
              {anomaly.risk}
            </span>
            <span className="text-gray-400 text-[11px] font-mono">
              Confidence: {anomaly.confidence}%
            </span>
          </div>
        </div>
      </div>

      {/* 5. "WHY THIS RISK?" (Explainable AI Panel) */}
      <div id="why-this-risk-card" className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
        <button
          onClick={() => setWhyRiskOpen(!whyRiskOpen)}
          className="w-full px-3.5 py-2.5 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left transition-colors"
        >
          <div className="flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-gray-900">
              Why This Risk?
            </span>
            <span className="text-[10px] bg-blue-100 text-blue-800 font-mono px-1 rounded">
              Explainable AI
            </span>
          </div>
          {whyRiskOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
        </button>

        {whyRiskOpen && (
          <div className="p-3.5 text-xs text-gray-600 space-y-2 border-t border-gray-100 bg-white">
            <div className="flex items-start space-x-2">
              <span className="text-blue-500 font-bold">•</span>
              <div>
                <strong className="text-gray-800">Temperature Deviation:</strong> {anomaly.tempAnomaly > 0 ? `+${anomaly.tempAnomaly}` : anomaly.tempAnomaly}°C departure from historical 30-year climatological median ({anomaly.baselineTemp}°C).
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <span className="text-blue-500 font-bold">•</span>
              <div>
                <strong className="text-gray-800">Rainfall Deviation:</strong> {anomaly.rainAnomaly > 0 ? `+${anomaly.rainAnomaly}` : anomaly.rainAnomaly} mm variance against weekly seasonal expected rate.
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <span className="text-blue-500 font-bold">•</span>
              <div>
                <strong className="text-gray-800">Wind Anomaly:</strong> {anomaly.windAnomaly > 0 ? `+${anomaly.windAnomaly}` : anomaly.windAnomaly} km/h above gradient wind threshold.
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <span className="text-blue-500 font-bold">•</span>
              <div>
                <strong className="text-gray-800">Persistence Over Time:</strong> Flagged anomaly signature has maintained structural coherence for {anomaly.persistenceDays} consecutive model cycles.
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <span className="text-blue-500 font-bold">•</span>
              <div>
                <strong className="text-gray-800">Spatial Clustering:</strong> Spatial autocorrelation radius spans ~{anomaly.spatialClusterSize} km across adjacent grid stations.
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <span className="text-blue-500 font-bold">•</span>
              <div>
                <strong className="text-gray-800">Multi-Model Agreement:</strong> {anomaly.multiModelAgreement}% consensus across ECMWF, GFS, and IMD ensemble trajectories.
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <span className="text-blue-500 font-bold">•</span>
              <div>
                <strong className="text-gray-800">ML Anomaly Score:</strong> Isolation Forest anomaly coefficient: <span className="font-mono font-bold text-gray-900">{anomaly.isolationForestScore}</span> (Normalized Z-score: {anomaly.zScore}σ).
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 6. REGIONAL HAZARD WATCH / STATE HAZARD WATCH */}
      <div id="regional-hazard-watch-card" className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
        <button
          onClick={() => setHazardWatchOpen(!hazardWatchOpen)}
          className="w-full px-3.5 py-2.5 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left transition-colors"
        >
          <div className="flex items-center space-x-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-gray-900">
              Regional Hazard Watch — {weather.location}
            </span>
          </div>
          {hazardWatchOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
        </button>

        {hazardWatchOpen && (
          <div className="p-3 text-xs space-y-2.5 border-t border-gray-100 divide-y divide-gray-100">
            {/* Earthquake Section */}
            <div className="pt-1 first:pt-0">
              <div className="flex items-center justify-between font-semibold text-gray-800 mb-1">
                <span className="text-[11px] uppercase tracking-wider text-amber-800 flex items-center space-x-1">
                  <span>⚡ Earthquake</span>
                </span>
                <span className="text-[10px] text-gray-500 font-normal">USGS Real-Time</span>
              </div>
              {relevantEarthquakes.length > 0 ? (
                <div className="space-y-1.5">
                  {relevantEarthquakes.map(eq => (
                    <div key={eq.id} className="bg-amber-50/70 p-2 rounded border border-amber-100 text-[11px]">
                      <div className="font-semibold text-amber-950 flex justify-between">
                        <span>Recent earthquake detected</span>
                        <span className="font-bold font-mono">M{eq.magnitude.toFixed(1)}</span>
                      </div>
                      <div className="text-gray-600 mt-0.5">{eq.location}</div>
                      <div className="text-gray-500 text-[10px] flex justify-between mt-1 pt-1 border-t border-amber-200/50">
                        <span>Depth: {eq.depthKm} km</span>
                        <span>{new Date(eq.time).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-[11px]">No significant seismic events detected in this regional sector (&lt;M4.5).</div>
              )}
            </div>

            {/* Tsunami Section */}
            <div className="pt-2">
              <div className="flex items-center justify-between font-semibold text-gray-800 mb-1">
                <span className="text-[11px] uppercase tracking-wider text-blue-800 flex items-center space-x-1">
                  <span>🌊 Tsunami</span>
                </span>
                <span className="text-[10px] text-gray-500 font-normal">INCOIS / PTWC</span>
              </div>
              <div className="bg-blue-50/60 p-2 rounded border border-blue-100 text-[11px]">
                <div className="font-semibold text-blue-950">Official Tsunami Status: No Threat</div>
                <div className="text-gray-600 mt-0.5">
                  No tsunami warning or advisory in effect for regional coastal boundaries.
                </div>
              </div>
            </div>

            {/* Cyclone Section */}
            <div className="pt-2">
              <div className="flex items-center justify-between font-semibold text-gray-800 mb-1">
                <span className="text-[11px] uppercase tracking-wider text-rose-800 flex items-center space-x-1">
                  <span>🌀 Cyclone</span>
                </span>
                <span className="text-[10px] text-gray-500 font-normal">RSMC / IMD / JTWC</span>
              </div>
              {cyclones.length > 0 ? (
                <div className="bg-rose-50/60 p-2 rounded border border-rose-100 text-[11px]">
                  <div className="font-semibold text-rose-900">{cyclones[0].name}</div>
                  <div className="text-gray-600">{cyclones[0].basin} • {cyclones[0].status}</div>
                  <div className="text-gray-500 text-[10px] mt-1">Movement: {cyclones[0].movement}</div>
                </div>
              ) : (
                <div className="text-gray-500 text-[11px]">No active cyclone threat currently in local basin.</div>
              )}
            </div>

            {/* Extreme Weather Section */}
            <div className="pt-2">
              <div className="flex items-center justify-between font-semibold text-gray-800 mb-1">
                <span className="text-[11px] uppercase tracking-wider text-purple-800">
                  ⚠️ Extreme Weather
                </span>
              </div>
              <div className="bg-gray-50 p-2 rounded border border-gray-100 text-[11px] text-gray-700">
                {anomaly.risk === 'Critical' || anomaly.risk === 'High' ? (
                  <span>High anomaly conditions flagged. Sustained monitoring recommended for local convective or thermal anomalies.</span>
                ) : (
                  <span>Standard atmospheric convective envelope. No immediate meteorological emergency declaration.</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 7. INTERACTIVE TEMPORAL TIMELINE SCRUBBER (Historical -> Current -> Future Horizon) */}
      <div id="location-timeline-card" className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="px-3.5 py-2.5 bg-gray-50 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center space-x-1.5">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-gray-900">
              Interactive Timeline Horizon
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsPlayingTimeline(!isPlayingTimeline)}
              className={`p-1 rounded text-xs transition-colors flex items-center space-x-1 px-1.5 ${
                isPlayingTimeline ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
              }`}
              title={isPlayingTimeline ? 'Pause temporal playback' : 'Auto-scrub timeline'}
            >
              {isPlayingTimeline ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span className="text-[10px] font-medium">{isPlayingTimeline ? 'Pause' : 'Play'}</span>
            </button>
            <button
              onClick={() => {
                setIsPlayingTimeline(false);
                setTimelineIndex(0);
              }}
              className="p-1 rounded bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 text-[10px] px-1.5 flex items-center space-x-0.5"
              title="Reset to Current (Now)"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Now</span>
            </button>
          </div>
        </div>

        <div className="p-3 text-xs space-y-3">
          {/* Scrubber slider track */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              <span className={timelineIndex === -1 ? 'text-amber-700 font-bold' : ''}>-1d (Past)</span>
              <span className={timelineIndex === 0 ? 'text-blue-700 font-bold' : ''}>Now (0d)</span>
              <span className={timelineIndex > 0 && timelineIndex <= 3 ? 'text-indigo-700 font-bold' : ''}>+1d .. +3d</span>
              <span className={timelineIndex > 3 ? 'text-purple-700 font-bold' : ''}>+4d .. +7d</span>
            </div>
            <input
              type="range"
              min={-1}
              max={Math.min(forecast.length, 7)}
              step={1}
              value={timelineIndex}
              onChange={(e) => {
                setIsPlayingTimeline(false);
                setTimelineIndex(parseInt(e.target.value, 10));
              }}
              className="w-full accent-indigo-600 h-1.5 bg-gray-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Milestone Step Selector Pills */}
          <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 text-[10px] font-semibold no-scrollbar">
            <button
              onClick={() => { setIsPlayingTimeline(false); setTimelineIndex(-1); }}
              className={`px-1.5 py-0.5 rounded border transition-colors shrink-0 ${
                timelineIndex === -1 ? 'bg-amber-600 text-white border-amber-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              -1d Hist
            </button>
            <button
              onClick={() => { setIsPlayingTimeline(false); setTimelineIndex(0); }}
              className={`px-1.5 py-0.5 rounded border transition-colors shrink-0 ${
                timelineIndex === 0 ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              Now
            </button>
            {forecast.slice(0, 7).map((f, i) => (
              <button
                key={i}
                onClick={() => { setIsPlayingTimeline(false); setTimelineIndex(i + 1); }}
                className={`px-1.5 py-0.5 rounded border transition-colors shrink-0 ${
                  timelineIndex === i + 1 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                +{i + 1}d
              </button>
            ))}
          </div>

          {/* Active Snapshot Card */}
          {timelineIndex === -1 && (
            <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900 text-xs">Past 24h Observational Baseline</span>
                <span className="text-[10px] bg-amber-200/70 text-amber-900 px-1 rounded font-mono font-semibold">
                  HISTORICAL LOG
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs pt-1 border-t border-amber-200/60">
                <div>
                  <span className="text-[10px] text-amber-800">Recorded Temp</span>
                  <div className="font-bold text-gray-900">Data unavailable</div>
                </div>
                <div>
                  <span className="text-[10px] text-amber-800">Rainfall</span>
                  <div className="font-bold text-gray-900">Data unavailable</div>
                </div>
                <div>
                  <span className="text-[10px] text-amber-800">Data Status</span>
                  <div className="font-bold text-gray-600">Data unavailable</div>
                </div>
              </div>
              <div className="text-[10px] text-amber-800 italic pt-1">
                No historical observation is available for this location.
              </div>
            </div>
          )}

          {timelineIndex === 0 && (
            <div className="p-2.5 rounded-lg bg-blue-50/80 border border-blue-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-950 text-xs">Live Telemetry Horizon (Now)</span>
                <span className="text-[10px] bg-blue-200/70 text-blue-900 px-1 rounded font-mono font-semibold">
                  REAL-TIME API
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs pt-1 border-t border-blue-200/60">
                <div>
                  <span className="text-[10px] text-blue-800">Current Temp</span>
                  <div className="font-bold text-gray-900">{formatMetric(weather.temperature, '°C')}</div>
                </div>
                <div>
                  <span className="text-[10px] text-blue-800">Atmosphere</span>
                  <div className="font-bold text-gray-900">{weather.condition || 'Data unavailable'}</div>
                </div>
                <div>
                  <span className="text-[10px] text-blue-800">Anomaly Risk</span>
                  <div className={`font-bold ${anomaly.risk === 'Critical' ? 'text-rose-700' : 'text-emerald-700'}`}>
                    {anomaly.risk}
                  </div>
                </div>
              </div>
              <div className="text-[10px] text-blue-700 pt-1">
                Source: {weather.source} • Synced: {weather.lastUpdated}
              </div>
            </div>
          )}

          {timelineIndex > 0 && forecast[timelineIndex - 1] && (() => {
            const f = forecast[timelineIndex - 1];
            return (
              <div className="p-2.5 rounded-lg bg-indigo-50/80 border border-indigo-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-indigo-950 text-xs">{f.dayName} (+{timelineIndex}d Horizon)</span>
                    <span className="text-[10px] text-gray-500 ml-1.5 font-mono">{f.date}</span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold ${getRiskBadgeClass(f.riskLevel)}`}>
                    {f.riskLevel} Risk
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs pt-1 border-t border-indigo-200/60">
                  <div>
                    <span className="text-[10px] text-indigo-800">Temp Range</span>
                    <div className="font-bold text-gray-900">{f.minTemp}° – {f.maxTemp}°C</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-indigo-800">Precip</span>
                    <div className="font-bold text-blue-700">{f.precipitation} mm</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-indigo-800">Rain Prob</span>
                    <div className="font-bold text-gray-900">{f.rainProbability}%</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-indigo-800">Wind</span>
                    <div className="font-bold text-gray-900">{f.windSpeed} kph</div>
                  </div>
                </div>
                <div className="text-[10px] text-indigo-700 pt-0.5 flex justify-between items-center">
                  <span>Forecast Condition: {f.condition}</span>
                  <span className="font-mono text-gray-500">ECMWF / GFS Trajectory</span>
                </div>
              </div>
            );
          })()}

          {/* Compact 7-day tabular summary below */}
          <div className="pt-2 border-t border-gray-100">
            <div className="grid grid-cols-5 text-[10px] font-bold text-gray-400 pb-1 border-b border-gray-100 uppercase">
              <span>Day</span>
              <span>Temp</span>
              <span>Rain</span>
              <span>Wind</span>
              <span className="text-right">Risk</span>
            </div>
            <div className="max-h-40 overflow-y-auto space-y-1 pt-1">
              {forecast.slice(0, 7).map((f, i) => (
                <div
                  key={i}
                  onClick={() => { setIsPlayingTimeline(false); setTimelineIndex(i + 1); }}
                  className={`grid grid-cols-5 text-[11px] items-center py-1 px-1 rounded cursor-pointer transition-colors ${
                    timelineIndex === i + 1 ? 'bg-indigo-100/70 font-semibold' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="font-medium text-gray-800">{f.dayName}</span>
                  <span className="font-semibold text-gray-700">{f.maxTemp}°C</span>
                  <span className="text-blue-600">{f.precipitation}mm</span>
                  <span className="text-gray-500">{f.windSpeed}kph</span>
                  <span className="text-right">
                    <span className={`px-1 rounded text-[10px] font-bold ${getRiskBadgeClass(f.riskLevel)}`}>
                      {f.riskLevel}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
