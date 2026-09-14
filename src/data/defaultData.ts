import {
  WeatherDataset,
  GridCell,
  CycloneHazard,
  EarthquakeHazard,
  TsunamiEvent,
  WeatherData,
  ForecastDay,
  WeatherAnomaly,
  KPIStats
} from '../types/weather';

export const DEFAULT_DATASETS: WeatherDataset[] = [
  {
    id: 'ds-global-prototype-01',
    name: 'Global Extreme Weather Anomaly Prototype',
    version: 'v2.4',
    uploadedAt: '2026-09-14T08:30:00Z',
    recordCount: 12,
    dateRange: '2026-09-01 - 2026-09-14',
    locations: ['New Delhi', 'Rajasthan (Thar)', 'Mumbai', 'Tokyo', 'Death Valley', 'London', 'Valencia', 'Sydney', 'Cairo', 'Manaus', 'Hanoi', 'Nairobi'],
    sourceType: 'Global Extreme Weather Anomaly Prototype',
    records: [
      { id: 'rec-01', timestamp: '2026-09-14 10:00', location: 'New Delhi', country: 'India', lat: 28.6139, lon: 77.2090, tempC: 10.6, rainfallMm: 0.0, windKmh: 14.0, pressureHpa: 1014.2, anomalyType: 'Early Cold Wave Induction', riskCategory: 'Moderate', mlScore: 0.74, notes: '4.2°C lower than 30-year seasonal climatological median' },
      { id: 'rec-02', timestamp: '2026-09-14 09:30', location: 'Barmer, Rajasthan', country: 'India', lat: 25.7521, lon: 71.3967, tempC: 39.8, rainfallMm: 0.0, windKmh: 28.5, pressureHpa: 1004.8, anomalyType: 'Thar Thermal Surge', riskCategory: 'High', mlScore: 0.88, notes: 'Sustained anticyclonic dry subsidence over western desert' },
      { id: 'rec-03', timestamp: '2026-09-14 11:15', location: 'Mumbai Coast', country: 'India', lat: 19.0760, lon: 72.8777, tempC: 31.4, rainfallMm: 42.6, windKmh: 36.2, pressureHpa: 1008.1, anomalyType: 'Coastal Convergence Band', riskCategory: 'High', mlScore: 0.82, notes: 'Arabian Sea moisture plume driving localized squall showers' },
      { id: 'rec-04', timestamp: '2026-09-14 12:00', location: 'Tokyo Bay', country: 'Japan', lat: 35.6762, lon: 139.6503, tempC: 27.8, rainfallMm: 68.4, windKmh: 54.0, pressureHpa: 994.0, anomalyType: 'Subtropical Low Deepening', riskCategory: 'Critical', mlScore: 0.93, notes: 'Rapid baroclinic cyclogenesis off Kanto Peninsula' },
      { id: 'rec-05', timestamp: '2026-09-14 07:45', location: 'Valencia', country: 'Spain', lat: 39.4699, lon: -0.3763, tempC: 24.1, rainfallMm: 85.0, windKmh: 45.1, pressureHpa: 1010.5, anomalyType: 'Cut-off Low (DANA)', riskCategory: 'Critical', mlScore: 0.95, notes: 'Upper-level cold drop triggering convective torrential discharge' },
      { id: 'rec-06', timestamp: '2026-09-14 08:20', location: 'London', country: 'UK', lat: 51.5074, lon: -0.1278, tempC: 17.2, rainfallMm: 3.1, windKmh: 22.0, pressureHpa: 1019.0, anomalyType: 'Zonal Jet Weakening', riskCategory: 'Low', mlScore: 0.32, notes: 'Stable maritime airmass with mild boundary layer mixing' },
      { id: 'rec-07', timestamp: '2026-09-14 06:10', location: 'Death Valley', country: 'USA', lat: 36.5323, lon: -116.9325, tempC: 44.5, rainfallMm: 0.0, windKmh: 19.4, pressureHpa: 1006.0, anomalyType: 'Extreme Basin Heat', riskCategory: 'High', mlScore: 0.86, notes: 'Mojave thermal trough compression causing persistent hyperthermia' },
      { id: 'rec-08', timestamp: '2026-09-14 13:00', location: 'Sydney Harbour', country: 'Australia', lat: -33.8688, lon: 151.2093, tempC: 19.4, rainfallMm: 12.8, windKmh: 31.0, pressureHpa: 1016.4, anomalyType: 'Tasman Sea Frontal Trough', riskCategory: 'Moderate', mlScore: 0.58, notes: 'Polar air resurgence along New South Wales seaboard' },
      { id: 'rec-09', timestamp: '2026-09-14 10:40', location: 'Cairo', country: 'Egypt', lat: 30.0444, lon: 31.2357, tempC: 36.1, rainfallMm: 0.0, windKmh: 18.0, pressureHpa: 1012.3, anomalyType: 'Saharan Dust Incursion', riskCategory: 'Moderate', mlScore: 0.65, notes: 'Elevated particulate concentration with dry adiabatic lapse rate' },
      { id: 'rec-10', timestamp: '2026-09-14 09:00', location: 'Manaus Basin', country: 'Brazil', lat: -3.1190, lon: -60.0217, tempC: 35.8, rainfallMm: 5.2, windKmh: 11.0, pressureHpa: 1011.0, anomalyType: 'Amazon Hydrological Deficit', riskCategory: 'High', mlScore: 0.79, notes: 'Sub-normal riverine runoff and vegetative evapotranspiration stress' },
      { id: 'rec-11', timestamp: '2026-09-14 11:50', location: 'Hanoi', country: 'Vietnam', lat: 21.0285, lon: 105.8542, tempC: 28.5, rainfallMm: 72.0, windKmh: 48.0, pressureHpa: 1001.2, anomalyType: 'Monsoonal Squall Vortex', riskCategory: 'High', mlScore: 0.89, notes: 'Low-level jet interaction along Red River delta plain' },
      { id: 'rec-12', timestamp: '2026-09-14 08:00', location: 'Nairobi', country: 'Kenya', lat: -1.2921, lon: 36.8219, tempC: 22.0, rainfallMm: 0.0, windKmh: 16.5, pressureHpa: 1018.0, anomalyType: 'Equatorial Highland Stability', riskCategory: 'Low', mlScore: 0.25, notes: 'Typical mid-tropospheric divergence with fair weather cumulus' }
    ]
  },
  {
    id: 'ds-india-sample-02',
    name: 'Extreme Weather Anomaly Sample Dataset',
    version: 'v1.8',
    uploadedAt: '2026-09-13T14:15:00Z',
    recordCount: 8,
    dateRange: '2026-09-05 - 2026-09-13',
    locations: ['Jaipur', 'Shimla', 'Chennai', 'Kolkata', 'Bengaluru', 'Ahmedabad', 'Cherrapunji', 'Bhopal'],
    sourceType: 'Extreme Weather Anomaly Sample Dataset',
    records: [
      { id: 'in-01', timestamp: '2026-09-13 16:00', location: 'Jaipur', country: 'India', lat: 26.9124, lon: 75.7873, tempC: 34.2, rainfallMm: 2.1, windKmh: 21.0, pressureHpa: 1007.5, anomalyType: 'Semi-Arid Heat Elevation', riskCategory: 'Moderate', mlScore: 0.62, notes: 'Aravalli lee-wave heat stagnation' },
      { id: 'in-02', timestamp: '2026-09-13 14:30', location: 'Shimla Ridge', country: 'India', lat: 31.1048, lon: 77.1734, tempC: 13.5, rainfallMm: 34.0, windKmh: 29.0, pressureHpa: 1015.0, anomalyType: 'Himalayan Cloudburst Indicator', riskCategory: 'Critical', mlScore: 0.91, notes: 'Orographic lift causing intense meso-beta convective cell' },
      { id: 'in-03', timestamp: '2026-09-13 15:20', location: 'Chennai Coromandel', country: 'India', lat: 13.0827, lon: 80.2707, tempC: 32.8, rainfallMm: 18.4, windKmh: 27.5, pressureHpa: 1009.2, anomalyType: 'Bay of Bengal Moisture Surge', riskCategory: 'Moderate', mlScore: 0.68, notes: 'Northeast monsoon precursor easterly wave' },
      { id: 'in-04', timestamp: '2026-09-13 17:00', location: 'Kolkata Delta', country: 'India', lat: 22.5726, lon: 88.3639, tempC: 30.5, rainfallMm: 52.0, windKmh: 42.0, pressureHpa: 1003.8, anomalyType: 'Gangetic Squall Line (Kalbaishakhi)', riskCategory: 'High', mlScore: 0.85, notes: 'Strong dry-line boundary interaction' },
      { id: 'in-05', timestamp: '2026-09-13 12:40', location: 'Bengaluru Plateau', country: 'India', lat: 12.9716, lon: 77.5946, tempC: 24.6, rainfallMm: 8.5, windKmh: 18.2, pressureHpa: 1013.4, anomalyType: 'Deccan Microclimate Shift', riskCategory: 'Low', mlScore: 0.38, notes: 'Normal post-monsoon diurnal convection' },
      { id: 'in-06', timestamp: '2026-09-13 13:10', location: 'Ahmedabad Sabarmati', country: 'India', lat: 23.0225, lon: 72.5714, tempC: 36.4, rainfallMm: 0.0, windKmh: 19.5, pressureHpa: 1006.1, anomalyType: 'Dry Advection from Kutch', riskCategory: 'Moderate', mlScore: 0.66, notes: 'Low boundary layer moisture with elevated surface sensible heat' },
      { id: 'in-07', timestamp: '2026-09-13 11:30', location: 'Cherrapunji (Sohra)', country: 'India', lat: 25.2702, lon: 91.7323, tempC: 19.0, rainfallMm: 114.5, windKmh: 38.0, pressureHpa: 1005.0, anomalyType: 'Extreme Orographic Deluge', riskCategory: 'Critical', mlScore: 0.96, notes: 'Khasi hills funneling relentless humid southerlies' },
      { id: 'in-08', timestamp: '2026-09-13 10:00', location: 'Bhopal Central', country: 'India', lat: 23.2599, lon: 77.4126, tempC: 29.8, rainfallMm: 14.0, windKmh: 16.0, pressureHpa: 1010.2, anomalyType: 'Central Trough Convergence', riskCategory: 'Low', mlScore: 0.44, notes: 'Scattered thunderstorm activity with moderate CAPE' }
    ]
  }
];

export const GLOBAL_GRID_NODES: GridCell[] = [
  // India Focus Cells
  { id: 'grid-delhi', lat: 28.6139, lon: 77.2090, name: 'New Delhi', region: 'India', temperature: 10.6, humidity: 55, precipitation: 0.0, windSpeed: 14.0, anomaly: 'Significant', risk: 'Moderate', anomalyScore: 0.74, condition: 'Partly Cloudy', source: 'OPEN-METEO', lastUpdated: '2026-09-14 14:40 IST' },
  { id: 'grid-mumbai', lat: 19.0760, lon: 72.8777, name: 'Mumbai', region: 'India', temperature: 31.4, humidity: 78, precipitation: 12.5, windSpeed: 24.2, anomaly: 'Mild', risk: 'Moderate', anomalyScore: 0.52, condition: 'Scattered Showers', source: 'OPEN-METEO', lastUpdated: '2026-09-14 14:40 IST' },
  { id: 'grid-jaipur', lat: 26.9124, lon: 75.7873, name: 'Jaipur (Rajasthan)', region: 'India', temperature: 34.8, humidity: 38, precipitation: 0.0, windSpeed: 18.5, anomaly: 'Significant', risk: 'High', anomalyScore: 0.79, condition: 'Hot & Clear', source: 'OPEN-METEO', lastUpdated: '2026-09-14 14:40 IST' },
  { id: 'grid-chennai', lat: 13.0827, lon: 80.2707, name: 'Chennai', region: 'India', temperature: 32.1, humidity: 82, precipitation: 4.2, windSpeed: 21.0, anomaly: 'Mild', risk: 'Low', anomalyScore: 0.39, condition: 'Humid & Sunny', source: 'OPEN-METEO', lastUpdated: '2026-09-14 14:40 IST' },
  { id: 'grid-kolkata', lat: 22.5726, lon: 88.3639, name: 'Kolkata', region: 'India', temperature: 29.8, humidity: 86, precipitation: 26.0, windSpeed: 31.4, anomaly: 'Extreme', risk: 'High', anomalyScore: 0.86, condition: 'Thunderstorm', source: 'OPEN-METEO', lastUpdated: '2026-09-14 14:40 IST' },
  { id: 'grid-bengaluru', lat: 12.9716, lon: 77.5946, name: 'Bengaluru', region: 'India', temperature: 25.2, humidity: 64, precipitation: 1.0, windSpeed: 15.0, anomaly: 'Normal', risk: 'Low', anomalyScore: 0.22, condition: 'Pleasant & Breezy', source: 'OPEN-METEO', lastUpdated: '2026-09-14 14:40 IST' },
  { id: 'grid-shimla', lat: 31.1048, lon: 77.1734, name: 'Shimla (Himachal)', region: 'India', temperature: 14.1, humidity: 91, precipitation: 38.0, windSpeed: 28.0, anomaly: 'Extreme', risk: 'Critical', anomalyScore: 0.92, condition: 'Heavy Rain / Hazard', source: 'OPEN-METEO', lastUpdated: '2026-09-14 14:40 IST' },
  { id: 'grid-ahmedabad', lat: 23.0225, lon: 72.5714, name: 'Ahmedabad (Gujarat)', region: 'India', temperature: 35.6, humidity: 45, precipitation: 0.0, windSpeed: 17.0, anomaly: 'Mild', risk: 'Moderate', anomalyScore: 0.58, condition: 'Dry & Clear', source: 'OPEN-METEO', lastUpdated: '2026-09-14 14:40 IST' },
  { id: 'grid-guwahati', lat: 26.1445, lon: 91.7362, name: 'Guwahati (Assam)', region: 'India', temperature: 27.0, humidity: 88, precipitation: 48.0, windSpeed: 22.0, anomaly: 'Significant', risk: 'High', anomalyScore: 0.81, condition: 'Monsoon Pouring', source: 'OPEN-METEO', lastUpdated: '2026-09-14 14:40 IST' },
  { id: 'grid-hyderabad', lat: 17.3850, lon: 78.4867, name: 'Hyderabad', region: 'India', temperature: 28.4, humidity: 62, precipitation: 6.0, windSpeed: 19.0, anomaly: 'Normal', risk: 'Low', anomalyScore: 0.31, condition: 'Partly Cloudy', source: 'OPEN-METEO', lastUpdated: '2026-09-14 14:40 IST' },
  { id: 'grid-srinagar', lat: 34.0837, lon: 74.7973, name: 'Srinagar (J&K)', region: 'India', temperature: 18.0, humidity: 70, precipitation: 14.0, windSpeed: 12.0, anomaly: 'Mild', risk: 'Moderate', anomalyScore: 0.49, condition: 'Scattered Rain', source: 'OPEN-METEO', lastUpdated: '2026-09-14 14:40 IST' },
  { id: 'grid-patna', lat: 25.5941, lon: 85.1376, name: 'Patna (Bihar)', region: 'India', temperature: 30.1, humidity: 76, precipitation: 18.0, windSpeed: 20.0, anomaly: 'Mild', risk: 'Moderate', anomalyScore: 0.54, condition: 'Overcast & Humid', source: 'OPEN-METEO', lastUpdated: '2026-09-14 14:40 IST' },

  // Global Key Weather Grid Nodes
  { id: 'grid-tokyo', lat: 35.6762, lon: 139.6503, name: 'Tokyo', region: 'Asia', temperature: 27.8, humidity: 85, precipitation: 64.0, windSpeed: 52.0, anomaly: 'Extreme', risk: 'Critical', anomalyScore: 0.94, condition: 'Tropical Squall', source: 'OPEN-METEO', lastUpdated: '2026-09-14 14:40 IST' },
  { id: 'grid-nyc', lat: 40.7128, lon: -74.0060, name: 'New York', region: 'North America', temperature: 21.5, humidity: 58, precipitation: 2.0, windSpeed: 18.0, anomaly: 'Normal', risk: 'Low', anomalyScore: 0.28, condition: 'Mostly Sunny', source: 'OPEN-METEO', lastUpdated: '2026-09-14 14:40 IST' },
  { id: 'grid-london', lat: 51.5074, lon: -0.1278, name: 'London', region: 'Europe', temperature: 17.2, humidity: 72, precipitation: 3.5, windSpeed: 22.0, anomaly: 'Mild', risk: 'Low', anomalyScore: 0.35, condition: 'Breezy & Overcast', source: 'OPEN-METEO', lastUpdated: '2026-09-14 14:40 IST' },
  { id: 'grid-valencia', lat: 39.4699, lon: -0.3763, name: 'Valencia', region: 'Europe', temperature: 23.4, humidity: 92, precipitation: 78.0, windSpeed: 44.0, anomaly: 'Extreme', risk: 'Critical', anomalyScore: 0.96, condition: 'Torrential Flooding', source: 'OPEN-METEO', lastUpdated: '2026-09-14 14:40 IST' },
  { id: 'grid-sydney', lat: -33.8688, lon: 151.2093, name: 'Sydney', region: 'Oceania', temperature: 19.4, humidity: 68, precipitation: 11.0, windSpeed: 30.0, anomaly: 'Mild', risk: 'Moderate', anomalyScore: 0.51, condition: 'Passing Showers', source: 'OPEN-METEO', lastUpdated: '2026-09-14 14:40 IST' },
  { id: 'grid-cairo', lat: 30.0444, lon: 31.2357, name: 'Cairo', region: 'Africa', temperature: 36.2, humidity: 32, precipitation: 0.0, windSpeed: 17.0, anomaly: 'Significant', risk: 'Moderate', anomalyScore: 0.67, condition: 'Dust Haze', source: 'OPEN-METEO', lastUpdated: '2026-09-14 14:40 IST' },
  { id: 'grid-singapore', lat: 1.3521, lon: 103.8198, name: 'Singapore', region: 'Asia', temperature: 29.8, humidity: 84, precipitation: 32.0, windSpeed: 14.0, anomaly: 'Mild', risk: 'Moderate', anomalyScore: 0.48, condition: 'Tropical Downpour', source: 'OPEN-METEO', lastUpdated: '2026-09-14 14:40 IST' },
  { id: 'grid-dubai', lat: 25.2048, lon: 55.2708, name: 'Dubai', region: 'Asia', temperature: 38.6, humidity: 48, precipitation: 0.0, windSpeed: 25.0, anomaly: 'Significant', risk: 'High', anomalyScore: 0.76, condition: 'Severe Heat', source: 'OPEN-METEO', lastUpdated: '2026-09-14 14:40 IST' },
  { id: 'grid-saopaulo', lat: -23.5505, lon: -46.6333, name: 'São Paulo', region: 'South America', temperature: 26.0, humidity: 60, precipitation: 5.0, windSpeed: 16.0, anomaly: 'Normal', risk: 'Low', anomalyScore: 0.33, condition: 'Clear', source: 'OPEN-METEO', lastUpdated: '2026-09-14 14:40 IST' },
  { id: 'grid-losangeles', lat: 34.0522, lon: -118.2437, name: 'Los Angeles (California)', region: 'North America', temperature: 28.5, humidity: 46, precipitation: 0.0, windSpeed: 15.0, anomaly: 'Mild', risk: 'Moderate', anomalyScore: 0.52, condition: 'Sunny & Dry', source: 'OPEN-METEO', lastUpdated: '2026-09-14 14:40 IST' },
  { id: 'grid-bangkok', lat: 13.7563, lon: 100.5018, name: 'Bangkok', region: 'Asia', temperature: 31.0, humidity: 82, precipitation: 28.0, windSpeed: 19.0, anomaly: 'Mild', risk: 'Moderate', anomalyScore: 0.55, condition: 'Warm Rain', source: 'OPEN-METEO', lastUpdated: '2026-09-14 14:40 IST' },
  { id: 'grid-capetown', lat: -33.9249, lon: 18.4241, name: 'Cape Town', region: 'Africa', temperature: 16.5, humidity: 66, precipitation: 8.0, windSpeed: 38.0, anomaly: 'Significant', risk: 'Moderate', anomalyScore: 0.69, condition: 'Gale Warning', source: 'OPEN-METEO', lastUpdated: '2026-09-14 14:40 IST' }
];

export const OBSERVED_CYCLONES: CycloneHazard[] = [
  {
    id: 'cyc-bob-01',
    name: 'Deep Depression BOB-04',
    basin: 'Bay of Bengal',
    category: 'Deep Depression (55 km/h)',
    windSpeedKmh: 58.0,
    centralPressureHpa: 996.0,
    coordinates: [17.5, 87.2],
    movement: 'North-Northwest at 14 km/h towards Odisha/West Bengal coast',
    status: 'Deep Depression',
    source: 'IMD / JTWC Track Bulletin',
    updatedAt: '2026-09-14 13:30 IST',
    pastTrack: [
      { coordinates: [14.2, 89.0], time: '12 Sep 12:00 UTC', windKmh: 40.0, category: 'Well Marked Low' },
      { coordinates: [15.6, 88.3], time: '13 Sep 00:00 UTC', windKmh: 48.0, category: 'Depression' },
      { coordinates: [16.8, 87.8], time: '13 Sep 18:00 UTC', windKmh: 52.0, category: 'Deep Depression' },
      { coordinates: [17.5, 87.2], time: '14 Sep 06:00 UTC', windKmh: 58.0, category: 'Deep Depression' }
    ],
    forecastTrack: [
      { coordinates: [18.8, 86.4], time: '14 Sep 18:00 UTC', windKmh: 62.0, category: 'Cyclonic Storm (Borderline)' },
      { coordinates: [20.2, 85.8], time: '15 Sep 06:00 UTC', windKmh: 55.0, category: 'Landfall near Puri / Gopalpur' },
      { coordinates: [21.5, 85.0], time: '15 Sep 18:00 UTC', windKmh: 42.0, category: 'Inland Weakening' },
      { coordinates: [22.8, 84.1], time: '16 Sep 06:00 UTC', windKmh: 30.0, category: 'Remnant Low' }
    ]
  },
  {
    id: 'cyc-wp-19',
    name: 'Severe Typhoon Bebinca (2413)',
    basin: 'Northwest Pacific',
    category: 'Category 2 Typhoon',
    windSpeedKmh: 145.0,
    centralPressureHpa: 970.0,
    coordinates: [29.8, 126.4],
    movement: 'West-Northwest at 22 km/h approaching East China Coast',
    status: 'Severe Cyclonic Storm',
    source: 'JMA / JTWC Official Track',
    updatedAt: '2026-09-14 14:00 IST',
    pastTrack: [
      { coordinates: [24.5, 134.2], time: '12 Sep 06:00 UTC', windKmh: 110.0, category: 'Severe Tropical Storm' },
      { coordinates: [26.8, 130.5], time: '13 Sep 06:00 UTC', windKmh: 130.0, category: 'Typhoon' },
      { coordinates: [28.4, 128.0], time: '13 Sep 18:00 UTC', windKmh: 140.0, category: 'Category 2 Typhoon' },
      { coordinates: [29.8, 126.4], time: '14 Sep 06:00 UTC', windKmh: 145.0, category: 'Category 2 Typhoon' }
    ],
    forecastTrack: [
      { coordinates: [30.9, 123.5], time: '14 Sep 18:00 UTC', windKmh: 150.0, category: 'Peak Intensity' },
      { coordinates: [31.4, 121.6], time: '15 Sep 06:00 UTC', windKmh: 130.0, category: 'Landfall near Shanghai' },
      { coordinates: [31.9, 119.5], time: '15 Sep 18:00 UTC', windKmh: 85.0, category: 'Inland Tropical Storm' }
    ]
  }
];

export const TSUNAMI_EVENTS: TsunamiEvent[] = [
  {
    id: 'tsu-pac-01',
    title: 'Pacific Ocean Basin Wide Tsunami Information Statement',
    status: 'Information',
    region: 'Northwest Pacific Basin (Off Honshu & Ryukyu)',
    coordinates: [35.5, 143.0],
    source: 'PTWC / JMA Official Advisory',
    issuedAt: '2026-09-14 06:22 UTC',
    details: 'Based on recent M5.8 shallow subduction event east of Honshu, no destructive basin-wide tsunami threat exists. Minor sea-level oscillations (<0.2m) observed at Chichi-jima tidal gauges.'
  },
  {
    id: 'tsu-ind-01',
    title: 'Indian Ocean Tsunami Early Warning System (ITEWS) Advisory',
    status: 'No Threat',
    region: 'Indian Ocean & Andaman Sea Basin',
    coordinates: [11.7, 92.7],
    source: 'INCOIS Hyderabad Official Bulletin',
    issuedAt: '2026-09-14 08:00 IST',
    details: 'No undersea seismic trigger exceeding M6.5 threshold detected in Sunda trench or Makran subduction zone. All coastal stations report nominal astronomical tide levels.'
  },
  {
    id: 'tsu-mak-02',
    title: 'Arabian Sea / Makran Subduction Monitoring Buoy',
    status: 'No Threat',
    region: 'North Arabian Sea',
    coordinates: [23.5, 64.2],
    source: 'INCOIS / PMD Ocean Seismic Network',
    issuedAt: '2026-09-14 09:30 IST',
    details: 'Continuous seafloor bottom pressure recorder reports zero anomalous tsunami wave trains.'
  }
];

export const PRESET_GEOCODING: Record<string, { name: string; country: string; state?: string; lat: number; lon: number }> = {
  'delhi': { name: 'New Delhi', country: 'India', state: 'Delhi', lat: 28.6139, lon: 77.2090 },
  'new delhi': { name: 'New Delhi', country: 'India', state: 'Delhi', lat: 28.6139, lon: 77.2090 },
  'mumbai': { name: 'Mumbai', country: 'India', state: 'Maharashtra', lat: 19.0760, lon: 72.8777 },
  'jaipur': { name: 'Jaipur', country: 'India', state: 'Rajasthan', lat: 26.9124, lon: 75.7873 },
  'rajasthan': { name: 'Jaipur (Rajasthan)', country: 'India', state: 'Rajasthan', lat: 26.9124, lon: 75.7873 },
  'india': { name: 'New Delhi', country: 'India', state: 'National Capital', lat: 28.6139, lon: 77.2090 },
  'tokyo': { name: 'Tokyo', country: 'Japan', state: 'Kanto', lat: 35.6762, lon: 139.6503 },
  'japan': { name: 'Tokyo', country: 'Japan', state: 'Honshu', lat: 35.6762, lon: 139.6503 },
  'new york': { name: 'New York', country: 'United States', state: 'New York', lat: 40.7128, lon: -74.0060 },
  'california': { name: 'Los Angeles (California)', country: 'United States', state: 'California', lat: 34.0522, lon: -118.2437 },
  'chennai': { name: 'Chennai', country: 'India', state: 'Tamil Nadu', lat: 13.0827, lon: 80.2707 },
  'kolkata': { name: 'Kolkata', country: 'India', state: 'West Bengal', lat: 22.5726, lon: 88.3639 },
  'bengaluru': { name: 'Bengaluru', country: 'India', state: 'Karnataka', lat: 12.9716, lon: 77.5946 },
  'bangalore': { name: 'Bengaluru', country: 'India', state: 'Karnataka', lat: 12.9716, lon: 77.5946 },
  'shimla': { name: 'Shimla', country: 'India', state: 'Himachal Pradesh', lat: 31.1048, lon: 77.1734 },
  'ahmedabad': { name: 'Ahmedabad', country: 'India', state: 'Gujarat', lat: 23.0225, lon: 72.5714 },
  'hyderabad': { name: 'Hyderabad', country: 'India', state: 'Telangana', lat: 17.3850, lon: 78.4867 },
  'pune': { name: 'Pune', country: 'India', state: 'Maharashtra', lat: 18.5204, lon: 73.8567 },
  'lucknow': { name: 'Lucknow', country: 'India', state: 'Uttar Pradesh', lat: 26.8467, lon: 80.9462 },
  'patna': { name: 'Patna', country: 'India', state: 'Bihar', lat: 25.5941, lon: 85.1376 },
  'srinagar': { name: 'Srinagar', country: 'India', state: 'Jammu & Kashmir', lat: 34.0837, lon: 74.7973 },
  'guwahati': { name: 'Guwahati', country: 'India', state: 'Assam', lat: 26.1445, lon: 91.7362 },
  'bhopal': { name: 'Bhopal', country: 'India', state: 'Madhya Pradesh', lat: 23.2599, lon: 77.4126 },
  'chandigarh': { name: 'Chandigarh', country: 'India', state: 'Punjab & Haryana', lat: 30.7333, lon: 76.7794 },
  'kochi': { name: 'Kochi', country: 'India', state: 'Kerala', lat: 9.9312, lon: 76.2673 },
  'london': { name: 'London', country: 'United Kingdom', state: 'England', lat: 51.5074, lon: -0.1278 },
  'valencia': { name: 'Valencia', country: 'Spain', state: 'Comunidad Valenciana', lat: 39.4699, lon: -0.3763 },
  'sydney': { name: 'Sydney', country: 'Australia', state: 'NSW', lat: -33.8688, lon: 151.2093 },
  'australia': { name: 'Sydney', country: 'Australia', state: 'NSW', lat: -33.8688, lon: 151.2093 },
  'cairo': { name: 'Cairo', country: 'Egypt', state: 'Cairo', lat: 30.0444, lon: 31.2357 },
  'singapore': { name: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198 },
  'dubai': { name: 'Dubai', country: 'United Arab Emirates', lat: 25.2048, lon: 55.2708 },
  'paris': { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522 },
  'berlin': { name: 'Berlin', country: 'Germany', lat: 52.5200, lon: 13.4050 }
};

export const initialDatasets = DEFAULT_DATASETS;

export const defaultGridCells = GLOBAL_GRID_NODES;

export const defaultKPIStats: KPIStats = {
  activeHazards: 14,
  extremeAnomalies: 38,
  anomaliesDetected: 38,
  highRiskRegions: 9,
  developingSignals: 6,
  trackedLocations: 703,
  monitoredStations: 703,
  dataSourcesOnline: 5,
  lastUpdated: '14 Sep 2026, 14:40 IST',
  nextUpdate: '15:10 IST'
};

export const defaultWeatherData: WeatherData = {
  location: 'Jaipur, Rajasthan',
  state: 'Rajasthan',
  country: 'India',
  lat: 26.9124,
  lon: 75.7873,
  timezone: 'Asia/Kolkata',
  temperature: 34.8,
  apparentTemperature: 36.2,
  condition: 'Hot & Clear',
  humidity: 38,
  windSpeed: 18.5,
  windDirection: 310,
  windDirectionCompass: 'NW',
  rainProbability: 0,
  precipitation: 0.0,
  rainAmount: 0.0,
  pressure: 1008.4,
  visibility: 10.0,
  cloudCover: 0,
  uvIndex: 7,
  weatherCode: 1,
  aqi: {
    value: 78,
    category: 'Moderate',
    pm25: 28.4,
    pm10: 55.2
  },
  lastUpdated: '2026-09-14 14:45 IST',
  source: 'OPEN-METEO'
};

export const defaultForecast: ForecastDay[] = [
  { dayName: 'Today', date: 'Sep 14', maxTemp: 35.2, minTemp: 24.1, condition: 'Sunny', weatherCode: 1, rainProbability: 0, precipitation: 0.0, windSpeed: 18.5, riskLevel: 'Moderate', anomalyScore: 0.65 },
  { dayName: '+1 Day', date: 'Sep 15', maxTemp: 36.0, minTemp: 24.5, condition: 'Clear', weatherCode: 1, rainProbability: 0, precipitation: 0.0, windSpeed: 16.0, riskLevel: 'Moderate', anomalyScore: 0.68 },
  { dayName: '+2 Days', date: 'Sep 16', maxTemp: 37.4, minTemp: 25.2, condition: 'Hot', weatherCode: 1, rainProbability: 5, precipitation: 0.0, windSpeed: 19.2, riskLevel: 'High', anomalyScore: 0.76 },
  { dayName: '+3 Days', date: 'Sep 17', maxTemp: 38.1, minTemp: 25.8, condition: 'Heatwave Warning', weatherCode: 1, rainProbability: 10, precipitation: 0.0, windSpeed: 22.0, riskLevel: 'High', anomalyScore: 0.82 },
  { dayName: '+4 Days', date: 'Sep 18', maxTemp: 37.5, minTemp: 25.0, condition: 'Partly Cloudy', weatherCode: 2, rainProbability: 15, precipitation: 0.5, windSpeed: 20.0, riskLevel: 'Moderate', anomalyScore: 0.71 },
  { dayName: '+5 Days', date: 'Sep 19', maxTemp: 35.8, minTemp: 24.0, condition: 'Scattered Cloud', weatherCode: 3, rainProbability: 25, precipitation: 2.1, windSpeed: 17.5, riskLevel: 'Low', anomalyScore: 0.44 },
  { dayName: '+6 Days', date: 'Sep 20', maxTemp: 34.2, minTemp: 23.5, condition: 'Passing Shower', weatherCode: 61, rainProbability: 35, precipitation: 4.8, windSpeed: 15.0, riskLevel: 'Low', anomalyScore: 0.38 },
  { dayName: '+7 Days', date: 'Sep 21', maxTemp: 33.6, minTemp: 23.0, condition: 'Breezy Sunny', weatherCode: 1, rainProbability: 10, precipitation: 0.2, windSpeed: 14.0, riskLevel: 'Low', anomalyScore: 0.31 }
];

export const defaultAnomaly: WeatherAnomaly = {
  currentAnomaly: 'Significant',
  tempAnomaly: 3.8,
  rainAnomaly: -12.4,
  windAnomaly: 6.2,
  mlSignal: 'Developing Extreme Signal',
  risk: 'High',
  confidence: 88,
  baselineTemp: 31.0,
  baselineRain: 25.0,
  baselineWind: 14.0,
  persistenceDays: 4,
  spatialClusterSize: 280,
  multiModelAgreement: 91,
  isolationForestScore: 0.79,
  zScore: 2.45,
  iqrDeviation: 1.85
};


