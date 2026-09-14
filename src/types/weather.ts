export interface WeatherData {
  location: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  windDirectionCompass: string;
  rainProbability: number;
  precipitation: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  weatherCode: number;
  condition: string;
  aqi?: {
    value: number;
    category: 'Good' | 'Moderate' | 'Unhealthy for Sensitive' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
    pm25: number;
    pm10: number;
  };
  source: 'OPEN-METEO' | 'OFFICIAL' | 'MODEL-DERIVED' | 'SAMPLE' | 'UPLOADED';
  datasetName?: string;
  datasetId?: string;
  historicalTemp?: number;
  uploadedComparison?: {
    datasetName: string;
    datasetId?: string;
    tempC: number;
    rainfallMm: number;
    windKmh: number;
    pressureHpa: number;
    anomalyType: string;
    riskCategory: string;
    mlScore: number;
    notes?: string;
    recordedAt?: string;
  };
  lastUpdated: string;
}

export interface UserProfile {
  displayName: string;
  theme: 'Light (Default)' | 'System' | 'Dark';
  notifications: {
    extremeWeather: boolean;
    cycloneAlerts: boolean;
    seismicEvents: boolean;
    dailyDigest: boolean;
  };
  defaultLocation: {
    name: string;
    country: string;
    lat: number;
    lon: number;
  };
}

export interface ForecastDay {
  dayName: string;
  date: string;
  maxTemp: number;
  minTemp: number;
  precipitation: number;
  rainProbability: number;
  windSpeed: number;
  condition: string;
  weatherCode: number;
  anomalyScore: number;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
}

export interface WeatherAnomaly {
  currentAnomaly: 'Normal' | 'Mild' | 'Significant' | 'Extreme';
  tempAnomaly: number; // e.g. +2.4 °C
  rainAnomaly: number; // e.g. +18.5 mm
  windAnomaly: number; // e.g. +14.2 km/h
  mlSignal: 'Normal' | 'Developing Extreme Signal' | 'Strong Signal';
  risk: 'Low' | 'Moderate' | 'High' | 'Critical';
  confidence: number; // 0 - 100 %
  isolationForestScore: number;
  zScore: number;
  iqrDeviation: number;
  baselineTemp: number;
  baselineRain: number;
  baselineWind: number;
  persistenceDays: number;
  spatialClusterSize: number;
  multiModelAgreement: number; // %
}

export interface EarthquakeHazard {
  id: string;
  magnitude: number;
  location: string;
  depthKm: number;
  time: string;
  distanceKm?: number;
  coordinates: [number, number];
  tsunamiWarning: boolean;
  source: string;
}

export interface CycloneTrackPoint {
  coordinates: [number, number]; // [lat, lon]
  time: string;
  windKmh: number;
  category?: string;
  pressureHpa?: number;
}

export interface CycloneHazard {
  id: string;
  name: string;
  basin: string;
  category: string;
  windSpeedKmh: number;
  centralPressureHpa: number;
  coordinates: [number, number];
  movement: string;
  status: 'Invest' | 'Depression' | 'Deep Depression' | 'Cyclonic Storm' | 'Severe Cyclonic Storm' | 'Super Cyclone';
  source: string;
  updatedAt: string;
  pastTrack?: CycloneTrackPoint[];
  forecastTrack?: CycloneTrackPoint[];
}

export interface TrackedLocation {
  id: string;
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
  addedAt: string;
  lastTemp?: number;
  lastCondition?: string;
  risk?: 'Low' | 'Moderate' | 'High' | 'Critical';
}

export type TimelineStep =
  | 'HISTORICAL'
  | 'CURRENT'
  | '+1 DAY'
  | '+2 DAYS'
  | '+3 DAYS'
  | '+4 DAYS'
  | '+5 DAYS'
  | '+6 DAYS'
  | '+7 DAYS';


export interface TsunamiEvent {
  id: string;
  title: string;
  status: 'Warning' | 'Advisory' | 'Watch' | 'Information' | 'No Threat';
  region: string;
  coordinates?: [number, number];
  source: string;
  issuedAt: string;
  details: string;
}

export interface GridCell {
  id: string;
  lat: number;
  lon: number;
  name: string;
  region: 'India' | 'Asia' | 'Europe' | 'North America' | 'South America' | 'Africa' | 'Oceania';
  temperature: number;
  humidity?: number;
  precipitation: number;
  windSpeed: number;
  anomaly: 'Normal' | 'Mild' | 'Significant' | 'Extreme';
  risk: 'Low' | 'Moderate' | 'High' | 'Critical';
  anomalyScore: number;
  condition: string;
  source: 'OPEN-METEO' | 'OFFICIAL' | 'MODEL-DERIVED' | 'SAMPLE' | 'UPLOADED';
  datasetName?: string;
  notes?: string;
  lastUpdated: string;
}

export interface KPIMetrics {
  activeHazards: number;
  extremeAnomalies: number;
  highRiskRegions: number;
  developingSignals: number;
  trackedLocations: number;
  dataSourcesOnline: number;
  lastUpdated: string;
  nextUpdate: string;
  anomaliesDetected?: number;
  monitoredStations?: number;
}

export type KPIStats = KPIMetrics;

export interface DatasetRecord {
  id: string;
  timestamp: string;
  location: string;
  country: string;
  lat: number;
  lon: number;
  tempC: number;
  rainfallMm: number;
  windKmh: number;
  pressureHpa: number;
  anomalyType: string;
  riskCategory: 'Low' | 'Moderate' | 'High' | 'Critical';
  mlScore: number;
  notes: string;
}

export interface WeatherDataset {
  id: string;
  name: string;
  version: string;
  uploadedAt: string;
  recordCount: number;
  dateRange: string;
  locations: string[];
  sourceType: 'Global Extreme Weather Anomaly Prototype' | 'Extreme Weather Anomaly Sample Dataset' | 'Custom User Upload';
  records: DatasetRecord[];
  isArchived?: boolean;
}

export interface DatasetVersionLog {
  id: string;
  datasetId: string;
  version: string;
  timestamp: string;
  action: 'Created' | 'Edited' | 'Added Record' | 'Deleted Record' | 'Restored';
  summary: string;
  recordCount: number;
}
