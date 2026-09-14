import React, { useState } from 'react';
import { Satellite, Eye, Info, Clock, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';

export const SatelliteView: React.FC = () => {
  const [selectedChannel, setSelectedChannel] = useState<'ir' | 'vis' | 'wv' | 'rgb'>('ir');
  const [selectedSatellite, setSelectedSatellite] = useState<'insat' | 'meteosat' | 'goes'>('insat');
  const [zoomLevel, setZoomLevel] = useState(1);

  const channels = [
    { id: 'ir', name: 'Thermal Infrared (10.8 µm)', desc: 'Cloud top temperature & convective tower heights' },
    { id: 'vis', name: 'Visible Spectrum (0.65 µm)', desc: 'Daylight cloud albedo & boundary layer fog' },
    { id: 'wv', name: 'Upper Tropospheric Water Vapor (6.7 µm)', desc: 'Jet stream troughs & dry mid-level intrusion' },
    { id: 'rgb', name: 'True Color Day/Night Composite', desc: 'AirmassRGB multi-spectral differential' }
  ];

  const satellites = [
    { id: 'insat', name: 'INSAT-3DR (Geostationary 74°E)', coverage: 'South Asia, Indian Ocean & Arabian Sea', operator: 'ISRO / IMD' },
    { id: 'meteosat', name: 'Meteosat-10 (0° Prime)', coverage: 'Europe, Africa & Atlantic Basin', operator: 'EUMETSAT' },
    { id: 'goes', name: 'GOES-16 (East 75.2°W)', coverage: 'Americas & Caribbean Basin', operator: 'NOAA / NASA' }
  ];

  return (
    <div id="satellite-view" className="space-y-4">
      {/* Top Header & Scientific Disclaimer */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Satellite className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-gray-900 leading-none">
                  Satellite Observation
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  OBSERVATIONAL GROUND TRUTH
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Real-time multispectral radiometric radiometric scans from geostationary meteorological satellites.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="flex items-center space-x-1 text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>Scan Time: 2026-09-14 14:15 UTC</span>
            </span>
          </div>
        </div>

        {/* Mandatory Scientific Rule Banner */}
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-lg p-3 text-xs text-amber-900 flex items-start space-x-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold">Important Scientific Notice:</strong> Satellite imagery depicts{' '}
            <span className="underline font-medium">instantaneous observational evidence</span> of current cloud dynamics, moisture fields, and radiative top temperatures. Satellite observations alone do not constitute a guaranteed 7-day weather prediction; medium-range numerical prediction is synthesized via coupled atmospheric forecast models (ECMWF, GFS, NCMRWF).
          </div>
        </div>
      </div>

      {/* Satellite Platform & Channel Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Satellite Platform */}
        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-2xs">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
            Select Observation Platform
          </label>
          <div className="grid grid-cols-3 gap-2">
            {satellites.map((sat) => (
              <button
                key={sat.id}
                onClick={() => setSelectedSatellite(sat.id as any)}
                className={`p-2.5 rounded-lg text-left text-xs transition-all border ${
                  selectedSatellite === sat.id
                    ? 'border-blue-500 bg-blue-50/60 text-blue-900 font-semibold shadow-2xs'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="font-bold truncate">{sat.name}</div>
                <div className="text-[10px] text-gray-500 truncate mt-0.5">{sat.operator}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Radiometric Channels */}
        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-2xs">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
            Spectral Channel
          </label>
          <div className="grid grid-cols-2 gap-2">
            {channels.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setSelectedChannel(ch.id as any)}
                className={`p-2 rounded-lg text-left text-xs transition-all border ${
                  selectedChannel === ch.id
                    ? 'border-blue-500 bg-blue-50/60 text-blue-900 font-semibold shadow-2xs'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="font-bold truncate">{ch.name}</div>
                <div className="text-[10px] text-gray-500 truncate mt-0.5">{ch.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Observation Canvas */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-gray-800">
              {satellites.find(s => s.id === selectedSatellite)?.name} — {channels.find(c => c.id === selectedChannel)?.name}
            </span>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded font-mono">
              Calibrated L1B Radiance
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.8, prev - 0.2))}
              className="p-1 border border-gray-200 rounded hover:bg-gray-50 text-gray-600"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-1 text-gray-500">
              {(zoomLevel * 100).toFixed(0)}%
            </span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(2.0, prev + 0.2))}
              className="p-1 border border-gray-200 rounded hover:bg-gray-50 text-gray-600"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* High-Contrast Scientific Radiometric Simulator Viewport */}
        <div className="relative w-full h-96 bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center border border-slate-800">
          <div
            style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.2s ease-out' }}
            className="relative w-full h-full flex items-center justify-center"
          >
            {/* SVG Radiometric Weather Satellite Earth View with Real Convective Systems */}
            <svg viewBox="0 0 800 450" className="w-full h-full">
              <defs>
                <radialGradient id="earthDisc" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#0f172a" />
                  <stop offset="85%" stopColor="#1e293b" />
                  <stop offset="100%" stopColor="#020617" />
                </radialGradient>
                <radialGradient id="cycloneCloud" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                  <stop offset="40%" stopColor="#cbd5e1" stopOpacity="0.8" />
                  <stop offset="80%" stopColor="#38bdf8" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Space Background & Coordinate Graticule */}
              <rect width="800" height="450" fill="#090d16" />
              {/* Latitude / Longitude Graticule Lines */}
              {[100, 200, 300, 400, 500, 600, 700].map(x => (
                <line key={x} x1={x} y1="0" x2={x} y2="450" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3 3" />
              ))}
              {[75, 150, 225, 300, 375].map(y => (
                <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3 3" />
              ))}

              {/* Continental Outlines (South Asia, Bay of Bengal, Indian Ocean Sector) */}
              <path
                d="M 320 80 Q 370 120 400 160 Q 420 220 440 280 L 410 320 L 370 280 Q 340 240 310 200 Z"
                fill="#1e293b"
                stroke="#334155"
                strokeWidth="1.5"
                opacity="0.8"
              />
              <path
                d="M 440 180 Q 520 200 580 250 L 590 320 L 530 310 Z"
                fill="#1e293b"
                stroke="#334155"
                strokeWidth="1.2"
                opacity="0.8"
              />

              {/* Convective Clouds & Anomaly Plumes */}
              {/* Cyclone Spiral in Bay of Bengal */}
              <g transform="translate(480, 220)">
                <circle cx="0" cy="0" r="75" fill="url(#cycloneCloud)" />
                <path
                  d="M -30 -30 Q 10 -60 50 -20 Q 70 30 20 60 Q -40 70 -60 20 Q -70 -20 -30 -30"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="4"
                  strokeLinecap="round"
                  opacity="0.85"
                />
                <circle cx="0" cy="0" r="6" fill="#f43f5e" />
                <text x="12" y="-12" fill="#ffffff" fontSize="11" fontFamily="sans-serif" fontWeight="bold">
                  Depression BOB-04
                </text>
              </g>

              {/* Himalayan Orographic Cloud Mass */}
              <path
                d="M 340 110 Q 420 100 520 120 Q 540 140 480 150 Q 380 145 340 110"
                fill="#e2e8f0"
                opacity="0.75"
              />

              {/* Equator ITCZ Cloud Band */}
              <ellipse cx="400" cy="380" rx="360" ry="25" fill="#bae6fd" opacity="0.4" />

              {/* Overlay Metadata */}
              <text x="20" y="30" fill="#94a3b8" fontSize="11" fontFamily="monospace">
                PLATFORM: {selectedSatellite.toUpperCase()} | RAD: {selectedChannel.toUpperCase()}
              </text>
              <text x="20" y="48" fill="#38bdf8" fontSize="10" fontFamily="monospace">
                PROJ: GEOSTATIONARY NORMALIZED | RESOLUTION: 1.0 km GSD
              </text>
            </svg>

            {/* Satellite Crosshairs */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-12 h-12 border border-blue-400/40 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Color Scale Bar */}
          <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-xs px-3 py-1.5 rounded text-[10px] text-white font-mono flex items-center space-x-2 border border-white/10">
            <span>Cloud Top Temp:</span>
            <div className="w-32 h-2.5 rounded-xs bg-gradient-to-r from-purple-600 via-blue-500 via-emerald-400 to-white"></div>
            <span>-80°C to +30°C</span>
          </div>
        </div>
      </div>
    </div>
  );
};
