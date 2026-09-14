import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { KPICards } from './components/KPICards';
import { WeatherMap } from './components/WeatherMap';
import { RightPanel } from './components/RightPanel';
import { DataReportsView } from './components/views/DataReportsView';
import { SatelliteView } from './components/views/SatelliteView';
import { ForecastView } from './components/views/ForecastView';
import { AlertsView } from './components/views/AlertsView';
import { IntelligenceSuiteView } from './components/views/IntelligenceSuiteView';
import {
  WeatherData,
  ForecastDay,
  WeatherAnomaly,
  KPIStats,
  EarthquakeHazard,
  CycloneHazard,
  TsunamiEvent,
  WeatherDataset,
  GridCell
} from './types/weather';
import {
  defaultWeatherData,
  defaultForecast,
  defaultAnomaly,
  defaultKPIStats,
  defaultGridCells,
  initialDatasets
} from './data/defaultData';

function weatherConditionFromCode(code: number): string {
  if (code === 0) return 'Clear Sky';
  if (code <= 3) return code === 1 ? 'Mainly Clear' : code === 2 ? 'Partly Cloudy' : 'Overcast';
  if (code <= 48) return 'Fog & Depositing Rime';
  if (code <= 55) return 'Drizzle';
  if (code <= 65 || (code >= 80 && code <= 82)) return 'Rain Showers';
  if (code <= 77) return 'Snow Fall';
  return 'Thunderstorm with Hail';
}

function windDirectionLabel(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return directions[Math.round(degrees / 22.5) % 16];
}

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [activeMapLayer, setActiveMapLayer] = useState<'temp' | 'rain' | 'wind' | 'hazard'>('temp');

  // Selected Location (Default: Jaipur, Rajasthan)
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    country: string;
    state?: string;
    lat: number;
    lon: number;
  }>({
    name: 'Jaipur, Rajasthan',
    country: 'India',
    state: 'Rajasthan',
    lat: 26.9124,
    lon: 75.7873
  });

  // State for all data slices
  const [weather, setWeather] = useState<WeatherData>(defaultWeatherData);
  const [forecast, setForecast] = useState<ForecastDay[]>(defaultForecast);
  const [anomaly, setAnomaly] = useState<WeatherAnomaly>(defaultAnomaly);
  const [kpis, setKpis] = useState<KPIStats>(defaultKPIStats);
  const [earthquakes, setEarthquakes] = useState<EarthquakeHazard[]>([]);
  const [cyclones, setCyclones] = useState<CycloneHazard[]>([]);
  const [tsunamis, setTsunamis] = useState<TsunamiEvent[]>([]);
  const [datasets, setDatasets] = useState<WeatherDataset[]>(initialDatasets);
  const [gridCells, setGridCells] = useState<GridCell[]>(defaultGridCells);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataConnected, setDataConnected] = useState<boolean>(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // Fetch initial static/global data
  const fetchGlobalFeeds = useCallback(async (lat: number, lon: number) => {
    try {
      const [kpiRes, eqRes, cycRes, tsuRes, dsRes, gridRes] = await Promise.all([
        fetch('/api/kpis').then(r => r.json()).catch(() => defaultKPIStats),
        fetch(`/api/hazards/earthquakes?lat=${lat}&lon=${lon}`).then(r => r.json()).catch(() => []),
        fetch('/api/hazards/cyclones').then(r => r.json()).catch(() => []),
        fetch('/api/hazards/tsunamis').then(r => r.json()).catch(() => []),
        fetch('/api/datasets').then(r => r.json()).catch(() => initialDatasets),
        fetch('/api/grid').then(r => r.json()).catch(() => defaultGridCells)
      ]);

      if (kpiRes) setKpis(kpiRes);
      if (Array.isArray(eqRes) && eqRes.length > 0) setEarthquakes(eqRes);
      if (Array.isArray(cycRes) && cycRes.length > 0) setCyclones(cycRes);
      if (Array.isArray(tsuRes) && tsuRes.length > 0) setTsunamis(tsuRes);
      if (Array.isArray(dsRes) && dsRes.length > 0) {
        setDatasets(dsRes);
      } else if (dsRes && Array.isArray(dsRes.datasets) && dsRes.datasets.length > 0) {
        setDatasets(dsRes.datasets);
      }
      if (gridRes) {
        if (Array.isArray(gridRes) && gridRes.length > 0) {
          setGridCells(gridRes);
        } else if (Array.isArray(gridRes.cells) && gridRes.cells.length > 0) {
          setGridCells(gridRes.cells);
        }
      }
      setDataConnected(true);
    } catch (err) {
      console.warn('Failed to fetch initial feeds from backend, keeping cached state:', err);
      setDataConnected(false);
    }
  }, []);

  useEffect(() => {
    fetchGlobalFeeds(selectedLocation.lat, selectedLocation.lon);
  }, [fetchGlobalFeeds, selectedLocation.lat, selectedLocation.lon]);

  // Fetch weather and forecast when selectedLocation changes
  const fetchWeatherData = useCallback(async (location: typeof selectedLocation) => {
    setIsLoading(true);
    setWeatherError(null);
    try {
      const params = new URLSearchParams({
        lat: String(location.lat),
        lon: String(location.lon),
        name: location.name,
        country: location.country
      });
      if (location.state) params.set('state', location.state);
      const res = await fetch(`/api/weather?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Live weather provider returned HTTP ${res.status}`);
      }
      const data = await res.json();
      const incomingWeather = data.current || data.weather;
      if (incomingWeather) {
          // Check if any uploaded dataset contains this location to enrich with uploaded values (Requirement 17)
          const matchedRecord = datasets
            .flatMap(d => d.records || [])
            .find(r => r.location.toLowerCase() === location.name.toLowerCase() ||
                      (Math.abs(r.lat - location.lat) < 0.1 && Math.abs(r.lon - location.lon) < 0.1));

          if (matchedRecord) {
            const parentDataset = datasets.find(d => (d.records || []).some(r => r.id === matchedRecord.id));
            setWeather({
              ...incomingWeather,
              uploadedComparison: {
                datasetName: parentDataset?.name || 'Uploaded Climatology Dataset',
                datasetId: parentDataset?.id,
                tempC: matchedRecord.tempC,
                rainfallMm: matchedRecord.rainfallMm,
                windKmh: matchedRecord.windKmh,
                pressureHpa: matchedRecord.pressureHpa,
                anomalyType: matchedRecord.anomalyType,
                riskCategory: matchedRecord.riskCategory,
                mlScore: matchedRecord.mlScore,
                notes: matchedRecord.notes,
                recordedAt: matchedRecord.timestamp
              }
            });
            setAnomaly({
              type: matchedRecord.anomalyType || (data.anomaly ? data.anomaly.type : 'Observed Regional Variance'),
              severity: matchedRecord.riskCategory || (data.anomaly ? data.anomaly.severity : 'Moderate'),
              zScore: (matchedRecord.mlScore * 4 - 2),
              baselinePeriod: `${parentDataset?.name || 'Uploaded Dataset'} vs 30-Yr Climatology`,
              confidence: matchedRecord.mlScore,
              explanation: matchedRecord.notes || `Direct observational record verified from uploaded dataset (${matchedRecord.location}). Combined with live multi-model atmospheric telemetry.`
            });
          } else {
            setWeather(incomingWeather);
            if (data.anomaly) {
              setAnomaly(data.anomaly);
            }
          }
      }
      if (data.forecast) setForecast(data.forecast);
      if (data.anomaly && !datasets.some(d => d.records?.some(r => r.location.toLowerCase() === location.name.toLowerCase()))) {
        setAnomaly(data.anomaly);
      }
      setDataConnected(true);
    } catch (err) {
      console.error('Error fetching live weather:', err);
      try {
        // Use the official provider directly in the browser if Render cannot reach it.
        const directUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;
        const directRes = await fetch(directUrl);
        if (!directRes.ok) throw new Error(`Direct Open-Meteo HTTP ${directRes.status}`);
        const direct = await directRes.json();
        const current = direct.current;
        const daily = direct.daily || {};
        if (!current || typeof current.temperature_2m !== 'number') throw new Error('Direct provider returned no current observation');
        const codes = daily.weather_code || [];
        const forecastFallback: ForecastDay[] = (daily.time || []).slice(0, 8).map((date: string, index: number) => ({
          dayName: index === 0 ? 'Today' : `+${index} Day`,
          date,
          maxTemp: Number(daily.temperature_2m_max[index].toFixed(1)),
          minTemp: Number(daily.temperature_2m_min[index].toFixed(1)),
          precipitation: Number((daily.precipitation_sum[index] || 0).toFixed(1)),
          rainProbability: daily.precipitation_probability_max[index] ?? 0,
          windSpeed: Number((daily.wind_speed_10m_max[index] || 0).toFixed(1)),
          condition: weatherConditionFromCode(codes[index] ?? 0),
          weatherCode: codes[index] ?? 0,
          anomalyScore: 0,
          riskLevel: 'Low'
        }));
        setWeather({
          location: location.name,
          country: location.country,
          state: location.state,
          lat: location.lat,
          lon: location.lon,
          temperature: Number(current.temperature_2m.toFixed(1)),
          apparentTemperature: Number(current.apparent_temperature.toFixed(1)),
          humidity: Math.round(current.relative_humidity_2m),
          windSpeed: Number(current.wind_speed_10m.toFixed(1)),
          windDirection: current.wind_direction_10m,
          windDirectionCompass: windDirectionLabel(current.wind_direction_10m),
          rainProbability: forecastFallback[0]?.rainProbability ?? 0,
          precipitation: Number(current.precipitation.toFixed(1)),
          pressure: Number(current.surface_pressure.toFixed(1)),
          visibility: 0,
          uvIndex: 0,
          weatherCode: current.weather_code,
          condition: weatherConditionFromCode(current.weather_code),
          source: 'OPEN-METEO',
          lastUpdated: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' })
        });
        setForecast(forecastFallback);
        setWeatherError(null);
        setDataConnected(true);
      } catch (directError) {
        console.error('Direct Open-Meteo fallback failed:', directError);
        setWeatherError('Live weather is temporarily unavailable. Retrying automatically.');
        setDataConnected(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, [datasets]);

  useEffect(() => {
    fetchWeatherData(selectedLocation);
  }, [selectedLocation, fetchWeatherData]);

  // Keep the selected location's weather and nearby hazard context current.
  useEffect(() => {
    const refreshLiveLocationData = () => {
      fetchWeatherData(selectedLocation);
      fetchGlobalFeeds(selectedLocation.lat, selectedLocation.lon);
    };
    const interval = setInterval(refreshLiveLocationData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchGlobalFeeds, fetchWeatherData, selectedLocation]);

  // Handle Location Selection from Search or Presets
  const handleSelectLocation = (loc: { name: string; country: string; state?: string; lat: number; lon: number }) => {
    setSelectedLocation(loc);
    // If user was on another view and clicked a location, return to overview so they see the result immediately
    if (activeTab !== 'overview' && !activeTab.startsWith('intel-')) {
      setActiveTab('overview');
    }
  };

  const handleRefreshDatasets = () => {
    fetch('/api/datasets')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setDatasets(data);
      })
      .catch(console.error);
  };

  const handleManualRefresh = useCallback(() => {
    fetchGlobalFeeds(selectedLocation.lat, selectedLocation.lon);
    fetchWeatherData(selectedLocation);
    handleRefreshDatasets();
  }, [fetchGlobalFeeds, fetchWeatherData, selectedLocation]);

  return (
    <div id="weatherwatch-app" className="min-h-screen bg-[#f8fafc] text-gray-900 flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* 1. TOP HEADER - Exact visual layout from screenshot */}
      <Header
        currentLocation={selectedLocation.name}
        lastUpdated={weather.lastUpdated}
        onSelectLocation={handleSelectLocation}
        dataConnected={dataConnected}
        isLoading={isLoading}
        onManualRefresh={handleManualRefresh}
      />

      {/* Main Body Layout: Sidebar + Main Area */}
      <div className="flex-1 max-w-[1720px] w-full mx-auto p-3 sm:p-4 lg:p-5 flex flex-col lg:flex-row gap-4">
        {/* 2. LEFT SIDEBAR NAVIGATION */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSelectTab={setActiveTab}
          hazardsCount={kpis.activeHazards}
          anomaliesCount={kpis.anomaliesDetected}
          unreadAlertsCount={kpis.activeHazards}
        />

        {/* 3. MAIN CONTENT CONTAINER */}
        <main className="flex-1 flex flex-col min-w-0 space-y-4">
          {/* TAB: OVERVIEW or LIVE-MAP (Main Operational Layout) */}
          {(activeTab === 'overview' || activeTab === 'live-map') && (
            <div className="flex flex-col space-y-4">
              {/* TOP KPI CARDS */}
              <KPICards stats={kpis} />

              {/* CENTER MAP & RIGHT PANEL CONTAINER */}
              <div className="flex flex-col lg:flex-row items-start gap-4">
                {/* CENTER MAP VIEW */}
                <div className="flex-1 w-full min-w-0">
                  <WeatherMap
                    selectedLocation={selectedLocation}
                    activeLayer={activeMapLayer}
                    onLayerChange={setActiveMapLayer}
                    gridCells={gridCells}
                    earthquakes={earthquakes}
                    cyclones={cyclones}
                    tsunamis={tsunamis}
                    datasets={datasets}
                    lastUpdated={weather.lastUpdated}
                    onSelectLocation={handleSelectLocation}
                  />
                </div>

                {/* RIGHT LIVE DATA PANELS (Current Weather, Temp Trend, Precip, Anomaly, Why Risk, Hazard Watch) */}
                <RightPanel
                  weather={weather}
                  forecast={forecast}
                  anomaly={anomaly}
                  earthquakes={earthquakes}
                  cyclones={cyclones}
                  tsunamis={tsunamis}
                  isLoading={isLoading}
                  weatherError={weatherError}
                  onSelectLocation={handleSelectLocation}
                />
              </div>
            </div>
          )}

          {/* TAB: DATA & REPORTS (Excel Ingestion, Versioning, CRUD) */}
          {activeTab === 'data-reports' && (
            <DataReportsView
              datasets={datasets}
              onRefreshDatasets={handleRefreshDatasets}
              onSelectLocation={handleSelectLocation}
              onNavigateToMap={() => setActiveTab('overview')}
            />
          )}

          {/* TAB: SATELLITE (Observational Ground Truth) */}
          {activeTab === 'satellite' && <SatelliteView />}

          {/* TAB: FORECAST (7-Day Multi-Model Trajectory) */}
          {activeTab === 'forecast' && (
            <ForecastView weather={weather} forecast={forecast} />
          )}

          {/* TAB: ALERTS (Validated Meteorological & Hazard Advisories) */}
          {activeTab === 'alerts' && (
            <AlertsView
              cyclones={cyclones}
              earthquakes={earthquakes}
              tsunamis={tsunamis}
            />
          )}

          {/* INTELLIGENCE SUITE TABS (The 6 required intelligence sections) */}
          {activeTab.startsWith('intel-') && (
            <IntelligenceSuiteView
              initialTab={activeTab as any}
              gridCells={gridCells}
              onSelectLocation={handleSelectLocation}
            />
          )}
        </main>
      </div>

      {/* Minimal Footer with Provenance Citations */}
      <footer className="mt-auto border-t border-gray-200/80 bg-white/70 py-2.5 px-4 text-center text-[11px] text-gray-500">
        <div className="max-w-[1720px] mx-auto flex flex-wrap items-center justify-between gap-2">
          <div>
            WeatherWatch India • Operational Extreme Weather Intelligence Platform
          </div>
          <div className="flex items-center space-x-3 text-gray-400 font-mono text-[10px]">
            <span>Data Feeds: Open-Meteo API • USGS Earthquake API • IMD • ECMWF IFS</span>
            <span>•</span>
            <span>Version 2.4.1 Production</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
