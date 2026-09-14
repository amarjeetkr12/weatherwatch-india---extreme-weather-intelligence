import React, { useState } from 'react';
import {
  TrendingUp,
  Thermometer,
  CloudRain,
  Wind,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { ForecastDay, WeatherData } from '../../types/weather';

interface ForecastViewProps {
  weather: WeatherData;
  forecast: ForecastDay[];
}

export const ForecastView: React.FC<ForecastViewProps> = ({ weather, forecast }) => {
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const activeDay = forecast[selectedDayIdx] || forecast[0];

  // Synthesize hourly trajectory curve for selected forecast day
  const hourlyData = Array.from({ length: 8 }, (_, i) => {
    const hour = i * 3;
    const hourLabel = `${hour.toString().padStart(2, '0')}:00`;
    const tempVariation = Math.sin((hour - 6) / 18 * Math.PI) * ((activeDay.maxTemp - activeDay.minTemp) / 2);
    const hourlyTemp = Number(((activeDay.maxTemp + activeDay.minTemp) / 2 + tempVariation).toFixed(1));
    return {
      hour: hourLabel,
      temp: hourlyTemp,
      humidity: Math.max(35, Math.min(95, Math.round(75 - tempVariation * 2.5))),
      rainChance: activeDay.precipitation > 0 ? Math.min(90, Math.round(activeDay.rainProbability + (i % 3) * 10)) : 5
    };
  });

  return (
    <div id="forecast-view" className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 leading-none">
              7-Day Medium-Range Forecast & Risk Trajectory
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Multi-model ensemble synthesis for {weather.location} ({weather.country}) • Coupled ECMWF / GFS / NCMRWF.
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
            Model Run: 06Z Operational Cycle
          </span>
        </div>
      </div>

      {/* 7-Day Day Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {forecast.map((f, idx) => {
          const isSelected = selectedDayIdx === idx;
          return (
            <button
              key={idx}
              onClick={() => setSelectedDayIdx(idx)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-blue-50/90 border-blue-500 shadow-2xs ring-1 ring-blue-500'
                  : 'bg-white border-gray-200 hover:bg-gray-50 shadow-2xs'
              }`}
            >
              <div className="text-[11px] font-bold text-gray-500 uppercase">{f.dayName}</div>
              <div className="text-[10px] text-gray-400 font-mono">{f.date}</div>

              <div className="my-1.5">
                <div className="text-lg font-extrabold text-gray-900 leading-none">
                  {f.maxTemp}°
                </div>
                <div className="text-[11px] text-gray-500 font-medium mt-0.5">
                  Min: {f.minTemp}°
                </div>
              </div>

              <div className="text-[10px] font-medium text-gray-600 truncate">
                {f.condition}
              </div>

              <div className="mt-1.5 pt-1.5 border-t border-gray-100 flex items-center justify-between text-[10px]">
                <span className="text-blue-600 font-semibold">{f.precipitation}mm</span>
                <span className={`px-1 rounded font-bold ${
                  f.riskLevel === 'Critical' ? 'bg-rose-100 text-rose-800' :
                  f.riskLevel === 'High' ? 'bg-orange-100 text-orange-800' :
                  f.riskLevel === 'Moderate' ? 'bg-amber-100 text-amber-800' :
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  {f.riskLevel}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Hourly Trajectory Chart for Selected Day */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-gray-800">
              Diurnal Temperature & Moisture Curve — {activeDay.dayName} ({activeDay.date})
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">Expected: {activeDay.condition}</span>
          </div>
          <div className="text-gray-500 font-mono text-[11px]">
            Peak Wind: {activeDay.windSpeed} km/h
          </div>
        </div>

        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} unit="°C" />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white p-2.5 border border-gray-200 rounded-lg shadow-md text-xs">
                        <div className="font-bold text-gray-800">{label}</div>
                        <div className="text-orange-600 font-semibold">Temperature: {d.temp}°C</div>
                        <div className="text-blue-600">Relative Humidity: {d.humidity}%</div>
                        <div className="text-gray-500">Precip Chance: {d.rainChance}%</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="temp" stroke="#ea580c" strokeWidth={2.5} fillOpacity={1} fill="url(#tempGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trajectory Table with Full Parameter Breakdown */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="px-4 py-3 bg-gray-50/70 border-b border-gray-200 font-bold text-xs text-gray-700 uppercase tracking-wider">
          Complete Trajectory Risk Matrix
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-gray-200">
            <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-2.5">Horizon</th>
                <th className="px-4 py-2.5">Max Temp</th>
                <th className="px-4 py-2.5">Min Temp</th>
                <th className="px-4 py-2.5">Precip Sum</th>
                <th className="px-4 py-2.5">Precip Prob</th>
                <th className="px-4 py-2.5">Max Wind</th>
                <th className="px-4 py-2.5">Anomaly Deviation</th>
                <th className="px-4 py-2.5">Risk Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {forecast.map((f, i) => (
                <tr key={i} className="hover:bg-blue-50/30">
                  <td className="px-4 py-2.5 font-semibold text-gray-900">{f.dayName} ({f.date})</td>
                  <td className="px-4 py-2.5 font-bold text-orange-600">{f.maxTemp}°C</td>
                  <td className="px-4 py-2.5 text-blue-600 font-medium">{f.minTemp}°C</td>
                  <td className="px-4 py-2.5 text-gray-700">{f.precipitation} mm</td>
                  <td className="px-4 py-2.5 text-gray-700">{f.rainProbability}%</td>
                  <td className="px-4 py-2.5 text-gray-700">{f.windSpeed} km/h</td>
                  <td className="px-4 py-2.5 font-mono text-[11px]">{(f.anomalyScore * 10).toFixed(1)}σ deviation</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      f.riskLevel === 'Critical' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                      f.riskLevel === 'High' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                      f.riskLevel === 'Moderate' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                      'bg-emerald-100 text-emerald-800 border-emerald-200'
                    }`}>
                      {f.riskLevel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
