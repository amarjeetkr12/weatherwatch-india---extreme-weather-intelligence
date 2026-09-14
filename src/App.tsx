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
    try {
      const params = new URLSearchParams({
        lat: String(location.lat),
        lon: String(location.lon),
        name: location.name,
        country: location.country
      });
      if (location.state) params.set('state', location.state);
      const res = await fetch(`/api/weather?${params.toString()}`);
      if (res.ok) {
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
      }
    } catch (err) {
      console.error('Error fetching live weather:', err);
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
