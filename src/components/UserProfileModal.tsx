import React, { useState } from 'react';
import { X, User, Bell, MapPin, Moon, Sun, Monitor, Check, Save } from 'lucide-react';
import { UserProfile } from '../types/weather';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (updated: UserProfile) => void;
  onSetLocation?: (loc: { name: string; country: string; lat: number; lon: number }) => void;
}

const PRESET_LOCATIONS = [
  { name: 'Jaipur', country: 'India', lat: 26.9124, lon: 75.7873 },
  { name: 'New Delhi', country: 'India', lat: 28.6139, lon: 77.2090 },
  { name: 'Mumbai', country: 'India', lat: 19.0760, lon: 72.8777 },
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503 },
  { name: 'New York', country: 'United States', lat: 40.7128, lon: -74.0060 },
  { name: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278 }
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
  onSetLocation
}) => {
  const [displayName, setDisplayName] = useState(profile.displayName || 'Amarjeet');
  const [theme, setTheme] = useState(profile.theme || 'Light (Default)');
  const [notifications, setNotifications] = useState(
    profile.notifications || {
      extremeWeather: true,
      cycloneAlerts: true,
      seismicEvents: true,
      dailyDigest: false
    }
  );
  const [selectedLocation, setSelectedLocation] = useState(
    profile.defaultLocation || { name: 'Jaipur', country: 'India', lat: 26.9124, lon: 75.7873 }
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      displayName: displayName.trim() || 'Amarjeet',
      theme,
      notifications,
      defaultLocation: selectedLocation
    };
    onSave(updated);
    if (onSetLocation) {
      onSetLocation(selectedLocation);
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-indigo-50/30">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {displayName.trim().slice(0, 1).toUpperCase() || 'A'}
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 leading-tight">
                User Profile & Settings
              </h3>
              <p className="text-[11px] text-gray-500 font-medium">
                Operational Preferences & Local Storage
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto text-xs">
          {/* Display Name */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Display Name</span>
              </span>
              <span className="text-[10px] text-gray-400 font-normal">Shown in top header</span>
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter name (e.g. Amarjeet)"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-[10px] text-gray-400 mt-1">
              Default is &ldquo;Amarjeet&rdquo;. Saved locally in browser storage.
            </p>
          </div>

          {/* Theme Preference */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1.5 flex items-center space-x-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Theme Preference</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Light (Default)', icon: Sun, label: 'Light' },
                { id: 'System', icon: Monitor, label: 'System' },
                { id: 'Dark', icon: Moon, label: 'Dark' }
              ].map((t) => {
                const Icon = t.icon;
                const isSelected = theme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id as any)}
                    className={`p-2 rounded-lg border text-center font-medium flex items-center justify-center space-x-1.5 transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/60 text-blue-700 font-semibold shadow-2xs'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Default Location */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1 flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>Default Focus Location</span>
            </label>
            <select
              value={selectedLocation.name}
              onChange={(e) => {
                const found = PRESET_LOCATIONS.find(l => l.name === e.target.value);
                if (found) setSelectedLocation(found);
              }}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PRESET_LOCATIONS.map(loc => (
                <option key={loc.name} value={loc.name}>
                  {loc.name}, {loc.country} ({loc.lat.toFixed(2)}°, {loc.lon.toFixed(2)}°)
                </option>
              ))}
            </select>
          </div>

          {/* Notification Preferences */}
          <div className="border-t border-gray-100 pt-3">
            <label className="block text-gray-700 font-semibold mb-2 flex items-center space-x-1.5">
              <Bell className="w-3.5 h-3.5 text-indigo-500" />
              <span>Notification Preferences</span>
            </label>
            <div className="space-y-2 bg-gray-50/80 p-3 rounded-xl border border-gray-100">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-700">Extreme Weather & Heatwave Alerts</span>
                <input
                  type="checkbox"
                  checked={notifications.extremeWeather}
                  onChange={(e) => setNotifications({ ...notifications, extremeWeather: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-700">Tropical Cyclone Tracking Bulletins</span>
                <input
                  type="checkbox"
                  checked={notifications.cycloneAlerts}
                  onChange={(e) => setNotifications({ ...notifications, cycloneAlerts: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-700">Recent Seismic Observations (&gt;M4.5)</span>
                <input
                  type="checkbox"
                  checked={notifications.seismicEvents}
                  onChange={(e) => setNotifications({ ...notifications, seismicEvents: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-700">Daily Regional Risk Digest</span>
                <input
                  type="checkbox"
                  checked={notifications.dailyDigest}
                  onChange={(e) => setNotifications({ ...notifications, dailyDigest: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center space-x-1.5 transition-colors"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Settings</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
