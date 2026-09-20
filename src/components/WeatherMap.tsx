import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import {
  Globe,
  Layers,
  Thermometer,
  CloudRain,
  Wind,
  AlertTriangle,
  Flame,
  Maximize2,
  Minimize2,
  RefreshCw,
  Locate,
  FileSpreadsheet,
  Map as MapIcon,
  Satellite,
  Mountain,
  Plus,
  Minus,
  Check,
  Compass,
  Waves
} from 'lucide-react';
import { GridCell, CycloneHazard, EarthquakeHazard, TsunamiEvent, WeatherDataset } from '../types/weather';

interface WeatherMapProps {
  selectedLocation: { name: string; country: string; state?: string; lat: number; lon: number };
  onSelectLocation: (loc: { name: string; country: string; state?: string; lat: number; lon: number }) => void;
  gridCells: GridCell[];
  cyclones: CycloneHazard[];
  earthquakes: EarthquakeHazard[];
  tsunamis?: TsunamiEvent[];
  datasets?: WeatherDataset[];
  lastUpdated?: string;
  activeLayer?: 'all' | 'temp' | 'rain' | 'wind' | 'risk' | 'hazards' | 'datasets';
  onLayerChange?: (layer: 'all' | 'temp' | 'rain' | 'wind' | 'risk' | 'hazards' | 'datasets') => void;
}

type BasemapType = 'osm' | 'satellite' | 'terrain' | 'carto';

export const WeatherMap: React.FC<WeatherMapProps> = ({
  selectedLocation,
  onSelectLocation,
  gridCells,
  cyclones,
  earthquakes,
  tsunamis = [],
  datasets = [],
  lastUpdated = '14 Sep 2026',
  activeLayer: controlledActiveLayer,
  onLayerChange
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapWrapperRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const selectedMarkerRef = useRef<L.Marker | null>(null);

  // Basemap & mode states
  const [basemap, setBasemap] = useState<BasemapType>('osm');
  const [mapMode, setMapMode] = useState<'global' | 'india'>('global');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(2);

  // Layer toggles
  const [visibleLayers, setVisibleLayers] = useState({
    weather: true,
    anomalies: true,
    cyclones: true,
    earthquakes: true,
    tsunami: true,
    datasets: true,
    forecastTrack: true
  });

  // Active filter for quick pill row
  const [internalActiveLayer, setInternalActiveLayer] = useState<'all' | 'temp' | 'rain' | 'wind' | 'risk' | 'hazards' | 'datasets'>('all');
  const activeLayer = controlledActiveLayer !== undefined ? controlledActiveLayer : internalActiveLayer;

  const setActiveLayer = (layer: 'all' | 'temp' | 'rain' | 'wind' | 'risk' | 'hazards' | 'datasets') => {
    setInternalActiveLayer(layer);
    if (onLayerChange) onLayerChange(layer);
  };

  const totalDatasetRecords = datasets.reduce((acc, d) => acc + (d.records?.length || 0), 0);

  const mapTileApiKey = import.meta.env.VITE_MAP_TILE_API_KEY?.trim();

  // Use an application-ready provider for the OSM-style basemap. CARTO is the
  // no-key fallback so the map remains usable before the deployment key exists.
  const getTileConfig = (type: BasemapType) => {
    switch (type) {
      case 'satellite':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          attribution: '&copy; Esri, Maxar, Earthstar Geographics, USDA, USGS, AeroGRID, IGN, and the GIS User Community',
          maxNativeZoom: 19,
          providerLabel: 'Esri Satellite'
        };
      case 'terrain':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
          attribution: '&copy; Esri, HERE, Garmin, Intermap, increment P Corp., GEBCO, USGS, FAO, NPS, NRCAN, GeoBase, IGN, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong)',
          maxNativeZoom: 19,
          providerLabel: 'Esri Topographic'
        };
      case 'carto':
        return {
          url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          maxNativeZoom: 20,
          providerLabel: 'CARTO Voyager'
        };
      case 'osm':
      default:
        if (mapTileApiKey) {
          return {
            url: `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${encodeURIComponent(mapTileApiKey)}`,
            attribution: '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank" rel="noopener noreferrer">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
            maxNativeZoom: 20,
            providerLabel: 'MapTiler Streets'
          };
        }
        return {
          url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>',
          maxNativeZoom: 20,
          providerLabel: 'CARTO Voyager (fallback)'
        };
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Start with global center [20.0, 0.0], zoom 2
    const map = L.map(mapContainerRef.current, {
      center: [20.0, 0.0],
      zoom: 2,
      minZoom: 1,
      maxZoom: 19,
      zoomControl: false,
      attributionControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
      dragging: true,
      fadeAnimation: true,
      zoomAnimation: true,
      worldCopyJump: true
    });

    const tileConf = getTileConfig('osm');
    const tileLayer = L.tileLayer(tileConf.url, {
      attribution: tileConf.attribution,
      maxNativeZoom: tileConf.maxNativeZoom,
      maxZoom: 20,
      detectRetina: true,
      updateWhenIdle: true,
      updateWhenZooming: false,
      keepBuffer: 3
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Scale bar in bottom left
    L.control.scale({ imperial: false, metric: true, position: 'bottomleft' }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    layerGroupRef.current = layerGroup;

    // Track zoom level for clustering and level-of-detail
    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    // Handle click on map to inspect coordinates & trigger location load
    map.on('click', (e: L.LeafletMouseEvent) => {
      const lat = Number(e.latlng.lat.toFixed(4));
      const lon = Number(e.latlng.lng.toFixed(4));
      const isIndia = lat >= 6 && lat <= 38 && lon >= 68 && lon <= 98;
      onSelectLocation({
        name: `Point (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
        country: isIndia ? 'India' : 'Global Ocean / Land',
        state: isIndia ? 'Regional Subcontinent' : 'Spatial Coordinate',
        lat,
        lon
      });
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Switch basemap tiles
  const handleBasemapChange = (type: BasemapType) => {
    setBasemap(type);
    if (!mapInstanceRef.current) return;
    const config = getTileConfig(type);
    const map = mapInstanceRef.current;
    tileLayerRef.current?.removeFrom(map);
    tileLayerRef.current = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxNativeZoom: config.maxNativeZoom,
      maxZoom: 20,
      detectRetina: true,
      updateWhenIdle: true,
      updateWhenZooming: false,
      keepBuffer: 3
    }).addTo(map);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!mapWrapperRef.current) return;
    if (!document.fullscreenElement) {
      mapWrapperRef.current.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
      mapInstanceRef.current?.invalidateSize();
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Zoom controls
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  // Locate User
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(4));
        const lon = Number(pos.coords.longitude.toFixed(4));
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lon], 9, { duration: 1.5 });
        }
        onSelectLocation({
          name: `My Location (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
          country: 'Current Position',
          lat,
          lon
        });
      },
      (err) => {
        console.warn('Geolocation failed:', err.message);
        // Default to New Delhi if denied
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([28.6139, 77.2090], 8, { duration: 1.2 });
        }
      },
      { timeout: 8000 }
    );
  };

  // Reset view
  const handleResetView = () => {
    if (!mapInstanceRef.current) return;
    if (mapMode === 'india') {
      mapInstanceRef.current.fitBounds([[6.5, 68.0], [37.5, 97.5]], { padding: [25, 25], maxZoom: 6 });
    } else {
      mapInstanceRef.current.setView([20.0, 0.0], 2);
    }
  };

  // Switch between Global and India Mode
  const handleModeChange = (mode: 'global' | 'india') => {
    setMapMode(mode);
    if (!mapInstanceRef.current) return;
    if (mode === 'india') {
      mapInstanceRef.current.fitBounds([[6.5, 68.0], [37.5, 97.5]], { padding: [25, 25], maxZoom: 6 });
    } else {
      mapInstanceRef.current.setView([20.0, 0.0], 2);
    }
  };

  // Update layers, markers, cyclone tracks, and earthquakes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // Helper: Render an individual weather grid station
    const renderSingleCell = (cell: GridCell) => {
      let displayValue = `${cell.temperature.toFixed(0)}°C`;
      let badgeColor = cell.temperature > 35 ? '#ea580c' : cell.temperature < 15 ? '#0284c7' : '#059669';

      if (activeLayer === 'rain') {
        displayValue = `${cell.precipitation}mm`;
        badgeColor = cell.precipitation > 25 ? '#2563eb' : '#64748b';
      } else if (activeLayer === 'wind') {
        displayValue = `${cell.windSpeed}km/h`;
        badgeColor = cell.windSpeed > 35 ? '#7c3aed' : '#475569';
      } else if (activeLayer === 'risk') {
        displayValue = cell.risk;
        badgeColor = cell.risk === 'Critical' ? '#dc2626' : cell.risk === 'High' ? '#ea580c' : cell.risk === 'Moderate' ? '#d97706' : '#16a34a';
      }

      const isCritical = cell.risk === 'Critical' || cell.anomaly === 'Extreme';

      // Check if location matches any uploaded dataset for live + excel enrichment
      const matchingRec = datasets
        .flatMap(d => d.records || [])
        .find(r => r.location.toLowerCase() === cell.name.toLowerCase() ||
                   (Math.abs(r.lat - cell.lat) < 0.15 && Math.abs(r.lon - cell.lon) < 0.15));

      const customIcon = L.divIcon({
        className: 'custom-weather-marker',
        html: `
          <div style="
            background-color: ${badgeColor};
            color: white;
            font-size: 11px;
            font-weight: 700;
            padding: 2px 7px;
            border-radius: 9999px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.25);
            border: 2px solid white;
            white-space: nowrap;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 3px;
            transform: translate(-50%, -50%);
            transition: transform 0.15s ease;
          ">
            ${isCritical ? '<span style="width:6px; height:6px; border-radius:50%; background-color:#fecaca; animation: ping 1.5s infinite;"></span>' : ''}
            <span>${displayValue}</span>
          </div>
        `,
        iconSize: [44, 22],
        iconAnchor: [22, 11]
      });

      const marker = L.marker([cell.lat, cell.lon], { icon: customIcon });

      const popupHtml = `
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4; color: #0f172a; min-width: 230px; padding: 2px;">
          <div style="font-weight: 700; font-size: 13px; margin-bottom: 5px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; display: flex; justify-content: space-between; align-items: center;">
            <span>${cell.name}</span>
            <span style="font-size: 10px; background: #e0f2fe; color: #0369a1; padding: 1px 6px; border-radius: 4px; font-weight: 600;">${cell.region}</span>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-bottom: 6px;">
            <div><span style="color:#64748b; font-size:11px;">Temperature:</span><br/><strong style="font-size: 13px; color: #0f172a;">${cell.temperature} °C</strong></div>
            <div><span style="color:#64748b; font-size:11px;">Condition:</span><br/><strong style="font-size: 12px;">${cell.condition}</strong></div>
            <div><span style="color:#64748b; font-size:11px;">Humidity:</span><br/><strong>${cell.humidity || 58}%</strong></div>
            <div><span style="color:#64748b; font-size:11px;">Precipitation:</span><br/><strong>${cell.precipitation} mm</strong></div>
            <div><span style="color:#64748b; font-size:11px;">Wind Speed:</span><br/><strong>${cell.windSpeed} km/h</strong></div>
            <div><span style="color:#64748b; font-size:11px;">ML Anomaly:</span><br/><strong style="color: ${cell.anomaly === 'Extreme' ? '#dc2626' : cell.anomaly === 'Significant' ? '#ea580c' : '#059669'};">${cell.anomaly}</strong></div>
          </div>
          ${matchingRec ? `
            <div style="background: #eef2ff; border: 1px solid #c7d2fe; padding: 4px 6px; border-radius: 4px; margin-bottom: 5px; font-size: 11px;">
              <div style="font-weight: 700; color: #3730a3; display: flex; justify-content: space-between; margin-bottom: 2px;">
                <span>EXCEL INTEGRATION</span>
                <span style="font-size: 9px; background: #c7d2fe; padding: 0.5px 4px; border-radius: 3px;">UPLOADED</span>
              </div>
              <div>Excel Temp: <strong>${matchingRec.tempC}°C</strong> | Rain: <strong>${matchingRec.rainfallMm}mm</strong></div>
              <div style="margin-top: 2px;">Lineage: <span style="font-size: 9px; font-weight: 700; color: #16a34a;">LIVE</span> + <span style="font-size: 9px; font-weight: 700; color: #4338ca;">UPLOADED</span> + <span style="font-size: 9px; font-weight: 700; color: #d97706;">OFFICIAL</span></div>
            </div>
          ` : ''}
          <div style="font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between; border-top: 1px solid #f1f5f9; padding-top: 4px;">
            <span>Source: <strong>${cell.source}</strong></span>
            <span>${cell.lastUpdated}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        map.flyTo([cell.lat, cell.lon], Math.max(map.getZoom(), 7), { duration: 1 });
        onSelectLocation({
          name: cell.name,
          country: cell.region === 'India' ? 'India' : 'Global',
          lat: cell.lat,
          lon: cell.lon
        });
      });

      marker.addTo(layerGroup);
    };

    // 1. Render Grid Nodes (Weather & Anomaly) with Zoom-based Spatial Clustering (Requirement 16)
    if (visibleLayers.weather && (activeLayer === 'all' || activeLayer === 'temp' || activeLayer === 'rain' || activeLayer === 'wind' || activeLayer === 'risk')) {
      let cellsToRender = gridCells;
      if (mapMode === 'india') {
        cellsToRender = gridCells.filter(c => c.region === 'India');
      }

      // At low world zoom (zoom < 4) and in global mode, cluster stations into regional nodes for performance
      if (currentZoom < 4 && mapMode === 'global') {
        const bucketSizeLat = 22;
        const bucketSizeLon = 30;
        const clusters: { [key: string]: GridCell[] } = {};

        cellsToRender.forEach(cell => {
          const latBucket = Math.floor(cell.lat / bucketSizeLat);
          const lonBucket = Math.floor(cell.lon / bucketSizeLon);
          const key = `${latBucket}_${lonBucket}`;
          if (!clusters[key]) clusters[key] = [];
          clusters[key].push(cell);
        });

        Object.values(clusters).forEach(group => {
          if (group.length === 1) {
            renderSingleCell(group[0]);
          } else {
            // Render Cluster Marker
            const avgLat = group.reduce((sum, c) => sum + c.lat, 0) / group.length;
            const avgLon = group.reduce((sum, c) => sum + c.lon, 0) / group.length;
            const hasCritical = group.some(c => c.risk === 'Critical' || c.anomaly === 'Extreme');
            const avgTemp = (group.reduce((sum, c) => sum + c.temperature, 0) / group.length).toFixed(0);

            const clusterIcon = L.divIcon({
              className: 'weather-cluster-marker',
              html: `
                <div style="
                  background: radial-gradient(circle, ${hasCritical ? '#b91c1c' : '#1d4ed8'} 0%, ${hasCritical ? '#7f1d1d' : '#0f172a'} 100%);
                  color: white;
                  font-size: 11px;
                  font-weight: 800;
                  width: 34px;
                  height: 34px;
                  border-radius: 50%;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  border: 2.5px solid white;
                  box-shadow: 0 3px 10px rgba(0,0,0,0.35);
                  cursor: pointer;
                  transform: translate(-50%, -50%);
                  transition: transform 0.15s ease;
                ">
                  <span style="line-height: 1;">${group.length}</span>
                  <span style="font-size: 8px; opacity: 0.85; line-height: 1;">stns</span>
                </div>
              `,
              iconSize: [34, 34],
              iconAnchor: [17, 17]
            });

            const clusterMarker = L.marker([avgLat, avgLon], { icon: clusterIcon });
            clusterMarker.bindPopup(`
              <div style="font-family: inherit; font-size: 12px; color: #0f172a; min-width: 220px; line-height: 1.4;">
                <div style="font-weight: 700; color: #1e3a8a; font-size: 13px; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
                  <span>Regional Station Cluster (${group.length})</span>
                  <span style="font-size: 10px; background: #e0f2fe; color: #0369a1; padding: 1px 6px; border-radius: 4px; font-weight: 600;">Avg ${avgTemp}°C</span>
                </div>
                <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">
                  Includes: <strong>${group.map(c => c.name).join(', ')}</strong>
                </div>
                <div style="font-size: 10px; color: #64748b; font-style: italic;">
                  Click cluster to zoom into regional stations.
                </div>
              </div>
            `);

            clusterMarker.on('click', () => {
              map.flyTo([avgLat, avgLon], 5, { duration: 1 });
            });

            clusterMarker.addTo(layerGroup);
          }
        });
      } else {
        // High zoom or India mode: Render all individual cells
        cellsToRender.forEach(cell => renderSingleCell(cell));
      }
    }

    // 2. Render Cyclones with Tracks (Past, Current, Forecast)
    if (visibleLayers.cyclones && (activeLayer === 'all' || activeLayer === 'hazards')) {
      let cyclonesToRender = cyclones;
      if (mapMode === 'india') {
        // North Indian Ocean focus
        cyclonesToRender = cyclones.filter(c => c.basin.includes('Bengal') || c.basin.includes('Arabian') || c.basin.includes('Indian'));
      }

      cyclonesToRender.forEach((cyc) => {
        // Draw Past Track Line (Dotted Gray/Red)
        if (cyc.pastTrack && cyc.pastTrack.length > 0) {
          const pastPoints = cyc.pastTrack.map(p => p.coordinates);
          pastPoints.push(cyc.coordinates); // Connect to current position

          L.polyline(pastPoints, {
            color: '#991b1b',
            weight: 3,
            opacity: 0.75,
            dashArray: '3, 6'
          }).addTo(layerGroup);

          // Small historical dots
          cyc.pastTrack.forEach(pt => {
            L.circleMarker(pt.coordinates, {
              radius: 4,
              color: '#991b1b',
              fillColor: '#ffffff',
              fillOpacity: 0.9,
              weight: 1.5
            }).bindTooltip(`Past: ${pt.time} (${pt.windKmh} km/h)`, { direction: 'top' }).addTo(layerGroup);
          });
        }

        // Draw Forecast Track (Dashed Amber/Red) & Cone
        if (visibleLayers.forecastTrack && cyc.forecastTrack && cyc.forecastTrack.length > 0) {
          const forwardPoints = [cyc.coordinates, ...cyc.forecastTrack.map(p => p.coordinates)];

          L.polyline(forwardPoints, {
            color: '#dc2626',
            weight: 3.5,
            opacity: 0.9,
            dashArray: '6, 6'
          }).addTo(layerGroup);

          // Forecast points with cones
          cyc.forecastTrack.forEach((fpt, idx) => {
            const coneRadius = 60000 + (idx * 45000); // Expanding uncertainty cone
            L.circle(fpt.coordinates, {
              radius: coneRadius,
              color: '#f87171',
              weight: 1,
              fillColor: '#fecaca',
              fillOpacity: 0.15,
              dashArray: '2, 4'
            }).addTo(layerGroup);

            L.circleMarker(fpt.coordinates, {
              radius: 5,
              color: '#b91c1c',
              fillColor: '#ef4444',
              fillOpacity: 1,
              weight: 1.5
            }).bindTooltip(`Forecast: ${fpt.time}<br/>${fpt.windKmh} km/h • ${fpt.category || ''}`, { direction: 'top' }).addTo(layerGroup);
          });
        }

        // Current Cyclone Center Icon (Animated Pulsing Eye)
        const cycloneIcon = L.divIcon({
          className: 'cyclone-eye-marker',
          html: `
            <div style="
              width: 36px;
              height: 36px;
              background: radial-gradient(circle, #dc2626 0%, #b91c1c 65%, transparent 100%);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 16px;
              animation: spin 5s linear infinite;
              border: 2px solid #ffffff;
              box-shadow: 0 0 12px rgba(220,38,38,0.8);
              cursor: pointer;
            ">
              🌀
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });

        const cycMarker = L.marker(cyc.coordinates, { icon: cycloneIcon });
        cycMarker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; color: #0f172a; min-width: 240px; line-height: 1.4;">
            <div style="font-weight: 700; color: #dc2626; font-size: 14px; border-bottom: 1.5px solid #fecaca; padding-bottom: 4px; margin-bottom: 6px; display: flex; justify-content: space-between;">
              <span>⚠️ ${cyc.name}</span>
              <span style="font-size: 10px; background: #fee2e2; color: #991b1b; padding: 1px 6px; border-radius: 4px;">${cyc.status}</span>
            </div>
            <div><strong>Ocean Basin:</strong> ${cyc.basin}</div>
            <div><strong>Classification:</strong> ${cyc.category}</div>
            <div><strong>Sustained Winds:</strong> <strong style="color: #dc2626;">${cyc.windSpeedKmh} km/h</strong></div>
            <div><strong>Central Pressure:</strong> ${cyc.centralPressureHpa} hPa</div>
            <div><strong>Movement Track:</strong> ${cyc.movement}</div>
            <div style="background: #fef2f2; padding: 5px; border-radius: 4px; margin-top: 5px; font-size: 11px; color: #991b1b;">
              <strong>Official Warning:</strong> Tracking via IMD / JTWC advisory bulletin. Observed track active.
            </div>
            <div style="margin-top: 5px; font-size: 10px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 3px;">
              Source: ${cyc.source} • ${cyc.updatedAt}
            </div>
          </div>
        `);

        cycMarker.on('click', () => {
          map.flyTo(cyc.coordinates, Math.max(map.getZoom(), 6), { duration: 1 });
        });

        cycMarker.addTo(layerGroup);
      });
    }

    // 3. Render Earthquakes (USGS Real-Time Feed)
    if (visibleLayers.earthquakes && (activeLayer === 'all' || activeLayer === 'hazards')) {
      earthquakes.forEach((eq) => {
        const isMajor = eq.magnitude >= 5.5;
        const color = isMajor ? '#b91c1c' : eq.magnitude >= 5.0 ? '#c2410c' : '#d97706';

        const eqIcon = L.divIcon({
          className: 'earthquake-marker',
          html: `
            <div style="
              background-color: ${color};
              color: white;
              font-size: 10px;
              font-weight: 800;
              padding: 2px 5px;
              border-radius: 4px;
              border: 1.5px solid white;
              box-shadow: 0 1px 4px rgba(0,0,0,0.35);
              white-space: nowrap;
              cursor: pointer;
              transform: translate(-50%, -50%);
            ">
              M${eq.magnitude.toFixed(1)}
            </div>
          `,
          iconSize: [28, 20],
          iconAnchor: [14, 10]
        });

        const eqMarker = L.marker(eq.coordinates, { icon: eqIcon });
        eqMarker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; color: #0f172a; min-width: 220px; line-height: 1.4;">
            <div style="font-weight: 700; color: #c2410c; font-size: 13px; border-bottom: 1px solid #fed7aa; padding-bottom: 3px; margin-bottom: 5px;">
              ⚡ USGS Observed Seismic Event
            </div>
            <div><strong>Location:</strong> ${eq.location}</div>
            <div><strong>Magnitude:</strong> <span style="font-weight: 700; color: ${color};">M${eq.magnitude.toFixed(1)}</span></div>
            <div><strong>Focal Depth:</strong> ${eq.depthKm} km</div>
            <div><strong>Observed Time:</strong> ${new Date(eq.time).toUTCString()}</div>
            <div style="margin-top: 4px; font-weight: 600; color: ${eq.tsunamiWarning ? '#dc2626' : '#16a34a'};">
              ${eq.tsunamiWarning ? '⚠️ Official Tsunami Watch/Advisory' : '✓ No Tsunami Threat Detected'}
            </div>
            <div style="margin-top: 5px; font-size: 10px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 2px;">
              Source: ${eq.source} (Observed event, not prediction)
            </div>
          </div>
        `);

        eqMarker.on('click', () => {
          map.flyTo(eq.coordinates, Math.max(map.getZoom(), 6), { duration: 1 });
        });

        eqMarker.addTo(layerGroup);
      });
    }

    // 3.5. Render Official Tsunami Warnings & Deep-Ocean Early Detection Buoys (INCOIS / PTWC / PMD)
    if (visibleLayers.tsunami && (activeLayer === 'all' || activeLayer === 'hazards')) {
      tsunamis.forEach((tsu) => {
        if (!tsu.coordinates || tsu.coordinates.length < 2) return;
        const isWarning = tsu.status.toLowerCase().includes('warning');
        const isAdvisory = tsu.status.toLowerCase().includes('advisory') || tsu.status.toLowerCase().includes('watch');
        const buoyColor = isWarning ? '#dc2626' : isAdvisory ? '#d97706' : '#0284c7';

        const tsuIcon = L.divIcon({
          className: 'tsunami-buoy-marker',
          html: `
            <div style="
              background-color: ${buoyColor};
              color: white;
              font-size: 10px;
              font-weight: 800;
              padding: 2px 7px;
              border-radius: 9999px;
              border: 1.5px solid white;
              box-shadow: 0 2px 6px rgba(0,0,0,0.35);
              white-space: nowrap;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 4px;
              transform: translate(-50%, -50%);
            ">
              <span>🌊</span>
              <span>${tsu.region.split(' ')[0]}: ${tsu.status.toUpperCase()}</span>
            </div>
          `,
          iconSize: [110, 22],
          iconAnchor: [55, 11]
        });

        const tsuMarker = L.marker(tsu.coordinates, { icon: tsuIcon });
        tsuMarker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; color: #0f172a; min-width: 240px; line-height: 1.4;">
            <div style="font-weight: 700; color: ${buoyColor}; font-size: 13px; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 3px; margin-bottom: 5px; display: flex; justify-content: space-between; align-items: center;">
              <span>🌊 ${tsu.title}</span>
              <span style="font-size: 9px; background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-weight: 700; color: ${buoyColor};">${tsu.status}</span>
            </div>
            <div><strong>Ocean Basin / Region:</strong> ${tsu.region}</div>
            <div><strong>Issued Time:</strong> ${tsu.issuedAt}</div>
            <div><strong>Official Bulletin:</strong> ${tsu.details}</div>
            <div style="margin-top: 5px; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 4px 6px; border-radius: 4px; font-size: 10.5px; color: #065f46;">
              ✓ <strong>Early Warning Telemetry:</strong> Live ocean monitoring integrated from ${tsu.source}.
            </div>
            <div style="margin-top: 4px; font-size: 10px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 2px;">
              Source: ${tsu.source} (Deep ocean sensor network)
            </div>
          </div>
        `);

        tsuMarker.on('click', () => {
          map.flyTo(tsu.coordinates!, Math.max(map.getZoom(), 6), { duration: 1 });
        });

        tsuMarker.addTo(layerGroup);
      });
    }

    // 4. Render Uploaded Excel Datasets
    if (visibleLayers.datasets && (activeLayer === 'all' || activeLayer === 'datasets')) {
      datasets.forEach((ds) => {
        (ds.records || []).forEach((rec) => {
          if (!rec.lat || !rec.lon) return;

          const dsIcon = L.divIcon({
            className: 'dataset-excel-pin',
            html: `
              <div style="
                background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                color: white;
                font-size: 10px;
                font-weight: 700;
                padding: 2px 7px;
                border-radius: 9999px;
                box-shadow: 0 2px 6px rgba(79, 70, 229, 0.45);
                border: 2px solid #ffffff;
                white-space: nowrap;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 4px;
                transform: translate(-50%, -50%);
              ">
                <span style="font-size: 8px; background: rgba(255,255,255,0.25); padding: 0.5px 3px; border-radius: 3px;">EXCEL</span>
                <span>${rec.location}: ${rec.tempC}°C</span>
              </div>
            `,
            iconSize: [80, 22],
            iconAnchor: [40, 11]
          });

          const dsMarker = L.marker([rec.lat, rec.lon], { icon: dsIcon });
          dsMarker.bindPopup(`
            <div style="font-family: inherit; font-size: 12px; color: #0f172a; min-width: 230px; line-height: 1.4;">
              <div style="font-weight: 700; color: #4338ca; font-size: 13px; border-bottom: 1.5px solid #e0e7ff; padding-bottom: 3px; margin-bottom: 5px; display: flex; justify-content: space-between; align-items: center;">
                <span>${rec.location}, ${rec.country}</span>
                <span style="font-size: 9px; background: #e0e7ff; color: #4338ca; padding: 1px 5px; border-radius: 4px; font-weight: 700;">UPLOADED DATASET</span>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-bottom: 5px;">
                <div><span style="color:#64748b; font-size:11px;">Temp:</span> <strong style="color:#0f172a;">${rec.tempC} °C</strong></div>
                <div><span style="color:#64748b; font-size:11px;">Rain:</span> <strong>${rec.rainfallMm} mm</strong></div>
                <div><span style="color:#64748b; font-size:11px;">Wind:</span> <strong>${rec.windKmh} km/h</strong></div>
                <div><span style="color:#64748b; font-size:11px;">Pressure:</span> <strong>${rec.pressureHpa} hPa</strong></div>
              </div>
              <div style="background: #f8fafc; padding: 4px 6px; border-radius: 4px; font-size: 11px; margin-bottom: 4px; border: 1px solid #e2e8f0;">
                <div><strong>Anomaly:</strong> <span style="font-weight:600; color:#ea580c;">${rec.anomalyType}</span></div>
                <div><strong>Risk Category:</strong> <span style="font-weight:700; color:${rec.riskCategory === 'Critical' ? '#dc2626' : '#2563eb'};">${rec.riskCategory}</span></div>
                <div><strong>ML Score:</strong> ${rec.mlScore}</div>
              </div>
              <div style="font-size: 10px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 3px; display: flex; justify-content: space-between;">
                <span>Dataset: <strong>${ds.name}</strong></span>
                <span>Click pin to inspect</span>
              </div>
            </div>
          `);

          dsMarker.on('click', () => {
            map.flyTo([rec.lat, rec.lon], Math.max(map.getZoom(), 8), { duration: 1 });
            onSelectLocation({
              name: rec.location,
              country: rec.country,
              lat: rec.lat,
              lon: rec.lon
            });
          });

          dsMarker.addTo(layerGroup);
        });
      });
    }

    // 5. Render User-Selected Location Marker with Pulsing Target
    if (selectedLocation) {
      if (selectedMarkerRef.current) {
        selectedMarkerRef.current.remove();
      }

      const selectedIcon = L.divIcon({
        className: 'selected-location-target',
        html: `
          <div style="position: relative; width: 34px; height: 34px; cursor: pointer;">
            <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: rgba(37, 99, 235, 0.35); animation: ping 1.8s infinite ease-out;"></div>
            <div style="position: absolute; top: 7px; left: 7px; width: 20px; height: 20px; border-radius: 50%; background: #2563eb; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white; font-size: 9px; font-weight: 800;">
              📍
            </div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      const selMarker = L.marker([selectedLocation.lat, selectedLocation.lon], {
        icon: selectedIcon,
        zIndexOffset: 2000
      }).addTo(layerGroup);

      selMarker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4; color: #0f172a; min-width: 200px;">
          <div style="font-weight: 800; font-size: 14px; color: #1d4ed8; margin-bottom: 2px;">
            📍 ${selectedLocation.name}
          </div>
          <div style="color: #64748b; font-size: 11px; margin-bottom: 6px;">
            ${selectedLocation.state ? `${selectedLocation.state}, ` : ''}${selectedLocation.country}
          </div>
          <div style="font-size: 11px; background: #eff6ff; padding: 4px 6px; border-radius: 4px; border: 1px solid #dbeafe;">
            <div>Coordinates: <strong>${selectedLocation.lat.toFixed(4)}°, ${selectedLocation.lon.toFixed(4)}°</strong></div>
            <div>Dashboard synced to real telemetry & forecast.</div>
          </div>
        </div>
      `);

      selectedMarkerRef.current = selMarker;
    }
  }, [gridCells, cyclones, earthquakes, tsunamis, datasets, activeLayer, visibleLayers, selectedLocation, mapMode, currentZoom]);

  // Pan map when selectedLocation changes
  useEffect(() => {
    if (mapInstanceRef.current && selectedLocation) {
      mapInstanceRef.current.flyTo([selectedLocation.lat, selectedLocation.lon], Math.max(mapInstanceRef.current.getZoom(), 7), {
        duration: 1.2
      });
    }
  }, [selectedLocation]);

  return (
    <div
      ref={mapWrapperRef}
      className={`bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs flex flex-col flex-1 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-0' : 'min-h-[480px] sm:min-h-[580px]'
      }`}
    >
      {/* 1. TOP MAP CONTROL BAR - Matching User Layout Reference */}
      <div className="px-3.5 py-2 bg-white border-b border-gray-200 flex flex-wrap items-center justify-between gap-2 z-20">
        {/* Left: Title & Geographic Status */}
        <div className="flex items-center space-x-2">
          <Globe className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-bold text-gray-900 tracking-tight">
            {mapMode === 'india' ? 'WeatherWatch India — Subcontinent Spatial Grid' : 'Global & Regional Weather Intelligence Map'}
          </h2>
          <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full border border-blue-100">
            {basemap === 'satellite' ? 'Satellite View' : basemap === 'terrain' ? 'Terrain Contours' : 'Interactive GIS'}
          </span>
        </div>

        {/* Center/Right: Quick Layer Filter Pills */}
        <div className="flex items-center space-x-1.5 text-xs overflow-x-auto py-0.5">
          <button
            onClick={() => setActiveLayer('all')}
            className={`px-2 py-1 rounded-md font-medium transition-colors ${
              activeLayer === 'all' ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All Layers
          </button>
          <button
            onClick={() => setActiveLayer('temp')}
            className={`px-2 py-1 rounded-md font-medium flex items-center space-x-1 transition-colors ${
              activeLayer === 'temp' ? 'bg-orange-50 text-orange-700 border border-orange-200 font-bold' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Thermometer className="w-3 h-3 text-orange-500" />
            <span>Temp</span>
          </button>
          <button
            onClick={() => setActiveLayer('rain')}
            className={`px-2 py-1 rounded-md font-medium flex items-center space-x-1 transition-colors ${
              activeLayer === 'rain' ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <CloudRain className="w-3 h-3 text-blue-500" />
            <span>Rain</span>
          </button>
          <button
            onClick={() => setActiveLayer('wind')}
            className={`px-2 py-1 rounded-md font-medium flex items-center space-x-1 transition-colors ${
              activeLayer === 'wind' ? 'bg-purple-50 text-purple-700 border border-purple-200 font-bold' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Wind className="w-3 h-3 text-purple-500" />
            <span>Wind</span>
          </button>
          <button
            onClick={() => setActiveLayer('hazards')}
            className={`px-2 py-1 rounded-md font-medium flex items-center space-x-1 transition-colors ${
              activeLayer === 'hazards' ? 'bg-rose-50 text-rose-700 border border-rose-200 font-bold' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-rose-500" />
            <span>Hazards</span>
          </button>
          <button
            onClick={() => setActiveLayer('datasets')}
            className={`px-2 py-1 rounded-md font-medium flex items-center space-x-1 transition-colors ${
              activeLayer === 'datasets' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold' : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Filter by uploaded Excel dataset points"
          >
            <FileSpreadsheet className="w-3 h-3 text-indigo-600" />
            <span>Datasets {totalDatasetRecords > 0 ? `(${totalDatasetRecords})` : ''}</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN MAP CANVAS & FLOATING LEAFLET GIS CONTROLS */}
      <div className="relative w-full flex-1 min-h-[400px] sm:min-h-[500px]">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-10" />

        {/* FLOATING CONTROL 1: TOP-LEFT GLOBAL / INDIA TOGGLE & BASEMAP SWITCHER */}
        <div className="absolute top-3 left-3 z-30 flex flex-col space-y-2 pointer-events-auto">
          {/* Global / India Toggle */}
          <div className="bg-white/95 backdrop-blur-xs border border-gray-300 rounded-lg p-1 shadow-md flex items-center space-x-1 text-xs">
            <button
              onClick={() => handleModeChange('global')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                mapMode === 'global' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              GLOBAL
            </button>
            <button
              onClick={() => handleModeChange('india')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                mapMode === 'india' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              INDIA
            </button>
          </div>

          {/* Map Type Switcher: OSM / SATELLITE / TERRAIN */}
          <div className="bg-white/95 backdrop-blur-xs border border-gray-300 rounded-lg p-1 shadow-md flex items-center space-x-1 text-xs">
            <button
              onClick={() => handleBasemapChange('osm')}
              className={`flex items-center space-x-1 px-2 py-1 rounded-md font-medium transition-all ${
                basemap === 'osm' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-700 hover:bg-gray-100'
              }`}
              title={`OSM-based basemap via ${getTileConfig('osm').providerLabel}`}
            >
              <MapIcon className="w-3 h-3" />
              <span>OSM</span>
            </button>
            <button
              onClick={() => handleBasemapChange('satellite')}
              className={`flex items-center space-x-1 px-2 py-1 rounded-md font-medium transition-all ${
                basemap === 'satellite' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-700 hover:bg-gray-100'
              }`}
              title="Public High-Res Satellite Imagery (Esri World Imagery)"
            >
              <Satellite className="w-3 h-3" />
              <span>SATELLITE</span>
            </button>
            <button
              onClick={() => handleBasemapChange('terrain')}
              className={`flex items-center space-x-1 px-2 py-1 rounded-md font-medium transition-all ${
                basemap === 'terrain' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-700 hover:bg-gray-100'
              }`}
              title="Terrain Elevation Contours"
            >
              <Mountain className="w-3 h-3" />
              <span>TERRAIN</span>
            </button>
            <button
              onClick={() => handleBasemapChange('carto')}
              className={`flex items-center space-x-1 px-2 py-1 rounded-md font-medium transition-all ${
                basemap === 'carto' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-700 hover:bg-gray-100'
              }`}
              title="CARTO Voyager basemap"
            >
              <MapIcon className="w-3 h-3" />
              <span>CARTO</span>
            </button>
          </div>
        </div>

        {/* FLOATING CONTROL 2: TOP-RIGHT ZOOM, LOCATE, RESET, FULLSCREEN & LAYERS */}
        <div className="absolute top-3 right-3 z-30 flex flex-col items-end space-y-2 pointer-events-auto">
          {/* Zoom Buttons Group */}
          <div className="bg-white/95 backdrop-blur-xs border border-gray-300 rounded-lg shadow-md flex flex-col divide-y divide-gray-200 overflow-hidden">
            <button
              onClick={handleZoomIn}
              disabled={currentZoom >= 20}
              className="p-2 hover:bg-gray-100 text-gray-700 transition-colors disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent"
              title="Zoom In (+)"
              aria-label="Zoom in"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              disabled={currentZoom <= 1}
              className="p-2 hover:bg-gray-100 text-gray-700 transition-colors disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent"
              title="Zoom Out (-)"
              aria-label="Zoom out"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="px-2 py-1 text-center text-[10px] font-bold tracking-wide text-gray-500" aria-live="polite">
              Z {currentZoom.toFixed(0)}
            </div>
          </div>

          {/* Action Buttons: Locate, Reset, Fullscreen, Layers */}
          <div className="bg-white/95 backdrop-blur-xs border border-gray-300 rounded-lg shadow-md flex flex-col divide-y divide-gray-200 overflow-hidden">
            <button
              onClick={handleLocateMe}
              className="p-2 hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors"
              title="Locate My Position (⌖)"
              aria-label="Locate me"
            >
              <Locate className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetView}
              className="p-2 hover:bg-gray-100 text-gray-700 transition-colors"
              title="Reset Map View (↻)"
              aria-label="Reset view"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-gray-100 text-gray-700 transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              aria-label="Toggle fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setShowLayerMenu(!showLayerMenu)}
              className={`p-2 transition-colors ${showLayerMenu ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
              title="Toggle Map Layers"
              aria-label="Layers"
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>

          {/* Layer Flyout Drawer */}
          {showLayerMenu && (
            <div className="bg-white/95 backdrop-blur-xs border border-gray-300 rounded-lg p-3 shadow-xl w-52 text-xs space-y-2 mt-1">
              <div className="font-bold text-gray-900 border-b border-gray-200 pb-1.5 flex justify-between items-center">
                <span>Map Layers</span>
                <span className="text-[10px] text-gray-400">Toggle ON/OFF</span>
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center space-x-2 cursor-pointer text-gray-700 hover:text-gray-900">
                  <input
                    type="checkbox"
                    checked={visibleLayers.weather}
                    onChange={e => setVisibleLayers({ ...visibleLayers, weather: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600"
                  />
                  <span>Weather Stations</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer text-gray-700 hover:text-gray-900">
                  <input
                    type="checkbox"
                    checked={visibleLayers.cyclones}
                    onChange={e => setVisibleLayers({ ...visibleLayers, cyclones: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600"
                  />
                  <span>Cyclone Tracks</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer text-gray-700 hover:text-gray-900">
                  <input
                    type="checkbox"
                    checked={visibleLayers.forecastTrack}
                    onChange={e => setVisibleLayers({ ...visibleLayers, forecastTrack: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600"
                  />
                  <span>Forecast Track & Cones</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer text-gray-700 hover:text-gray-900">
                  <input
                    type="checkbox"
                    checked={visibleLayers.earthquakes}
                    onChange={e => setVisibleLayers({ ...visibleLayers, earthquakes: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600"
                  />
                  <span>USGS Earthquakes</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer text-gray-700 hover:text-gray-900">
                  <input
                    type="checkbox"
                    checked={visibleLayers.datasets}
                    onChange={e => setVisibleLayers({ ...visibleLayers, datasets: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600"
                  />
                  <span>Uploaded Datasets</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* FLOATING MAP LEGEND (Bottom Left) */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs border border-gray-300 rounded-lg p-2.5 shadow-md z-20 text-[11px] space-y-1.5 pointer-events-auto max-w-[280px]">
          <div className="font-bold text-gray-800 text-[10px] uppercase tracking-wider flex items-center justify-between border-b border-gray-100 pb-1">
            <span>Map Legend</span>
            <span className="text-[9px] text-gray-500 font-normal">
              {getTileConfig(basemap).providerLabel}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-gray-600 text-[10px]">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
              <span>Mild / Normal</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
              <span>Significant Anomaly</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shrink-0"></span>
              <span>Extreme / Critical</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs shrink-0">🌀</span>
              <span>Active Cyclone</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2 rounded bg-amber-700 shrink-0"></span>
              <span>USGS Earthquake</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0"></span>
              <span>Uploaded Dataset</span>
            </div>
            <div className="flex items-center space-x-1.5 col-span-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 border border-white shadow-xs shrink-0"></span>
              <span>📍 Focused Target Location</span>
            </div>
          </div>
          <div className="text-[9px] text-gray-400 border-t border-gray-100 pt-1">
            Click map or pin to inspect live telemetry & 7-day trajectory.
          </div>
        </div>
      </div>
    </div>
  );
};
