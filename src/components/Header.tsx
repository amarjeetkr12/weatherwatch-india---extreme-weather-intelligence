import React, { useState, useEffect, useRef } from 'react';
import { CloudSun, Search, Bell, Clock, CalendarDays, ShieldCheck, MapPin, CheckCircle2, AlertCircle, RefreshCw, ChevronDown, AlertTriangle } from 'lucide-react';
import { PRESET_GEOCODING } from '../data/defaultData';
import { UserProfileModal } from './UserProfileModal';
import { UserProfile } from '../types/weather';

interface HeaderProps {
  currentLocation?: string;
  onSelectLocation: (loc: { name: string; country: string; state?: string; lat: number; lon: number }) => void;
  lastUpdated?: string;
  timezone?: string;
  nextUpdate?: string;
  isLoading?: boolean;
  dataConnected?: boolean;
  onManualRefresh?: () => void;
  userProfile?: UserProfile;
  onUpdateUserProfile?: (profile: UserProfile) => void;
}

const DEFAULT_PROFILE: UserProfile = {
  displayName: 'Amarjeet',
  theme: 'Light (Default)',
  notifications: {
    extremeWeather: true,
    cycloneAlerts: true,
    seismicEvents: true,
    dailyDigest: false
  },
  defaultLocation: {
    name: 'Jaipur',
    country: 'India',
    lat: 26.9124,
    lon: 75.7873
  }
};

export const Header: React.FC<HeaderProps> = ({
  currentLocation = 'Jaipur, Rajasthan',
  onSelectLocation,
  lastUpdated = '14 Sep 2026, 14:40 IST',
  timezone = 'Asia/Kolkata',
  nextUpdate = '15:10 IST',
  isLoading = false,
  dataConnected = true,
  onManualRefresh,
  userProfile: initialProfile,
  onUpdateUserProfile
}) => {

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ name: string; country: string; state?: string; lat: number; lon: number }>>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [showLiveTooltip, setShowLiveTooltip] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isSpinningRefresh, setIsSpinningRefresh] = useState(false);

  // Local storage persisted user profile (Default "Amarjeet")
  const [profile, setProfile] = useState<UserProfile>(() => {
    if (initialProfile) return initialProfile;
    try {
      const saved = localStorage.getItem('weatherwatch_user_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_PROFILE;
  });

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Compute initials: "AJ" or "A" for Amarjeet, or first 2 letters
  const getInitials = (name: string) => {
    const trimmed = (name || '').trim();
    if (!trimmed) return 'A';
    if (trimmed.toLowerCase().startsWith('amarjeet')) return 'AJ';
    const parts = trimmed.split(/\s+/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return trimmed.slice(0, 1).toUpperCase();
  };

  const handleSaveProfile = (updated: UserProfile) => {
    setProfile(updated);
    try {
      localStorage.setItem('weatherwatch_user_profile', JSON.stringify(updated));
    } catch (e) {}
    if (onUpdateUserProfile) onUpdateUserProfile(updated);
  };

  const handleRefreshClick = () => {
    setIsSpinningRefresh(true);
    if (onManualRefresh) onManualRefresh();
    setTimeout(() => setIsSpinningRefresh(false), 900);
  };

  // Live time ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const datePart = new Intl.DateTimeFormat('en-IN', {
        timeZone: timezone,
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).format(now);
      const timePart = new Intl.DateTimeFormat('en-IN', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(now);
      setCurrentDate(datePart);
      setCurrentTime(timePart);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle clicking outside of search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced geocoding search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/geocoding?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.slice(0, 6));
          setShowDropdown(true);
        }
      } catch (err) {
        console.warn('Geocode search failed', err);
        // Fallback to presets
        const q = searchQuery.toLowerCase();
        const matches = Object.entries(PRESET_GEOCODING)
          .filter(([k]) => k.includes(q))
          .map(([, v]) => v);
        setSuggestions(matches.slice(0, 5));
        setShowDropdown(true);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelect = (item: { name: string; country: string; state?: string; lat: number; lon: number }) => {
    onSelectLocation(item);
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      handleSelect(suggestions[0]);
    } else if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const preset = PRESET_GEOCODING[q];
      if (preset) {
        handleSelect(preset);
      } else {
        // Trigger server geocoding directly
        fetch(`/api/geocoding?q=${encodeURIComponent(searchQuery.trim())}`)
          .then(res => res.json())
          .then(data => {
            if (data && data.length > 0) {
              handleSelect(data[0]);
            }
          });
      }
    }
  };

  return (
    <header id="main-header" className="bg-white border-b border-gray-200 px-3 sm:px-4 py-2.5 flex flex-wrap items-center gap-2 sm:gap-3 sticky top-0 z-50 shadow-xs">
      {/* Left: Brand Identity matching reference screenshot */}
      <div className="flex items-center space-x-3 shrink-0">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-sm">
          <CloudSun className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center space-x-1.5">
            <h1 className="text-base font-bold text-gray-900 leading-none tracking-tight">
              WeatherWatch India
            </h1>
          </div>
          <p className="text-[11px] text-gray-500 font-medium leading-tight mt-0.5">
            Extreme Weather Intelligence
          </p>
        </div>
      </div>

      {/* Center: Large Location Search Box */}
      <div ref={searchRef} className="relative order-3 basis-full w-full max-w-none mx-0 lg:order-none lg:basis-auto lg:max-w-xl lg:mx-4 lg:flex-1">
        <form onSubmit={handleFormSubmit} className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="location-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchQuery.trim() || suggestions.length > 0) setShowDropdown(true);
            }}
            placeholder="Search location (e.g., Delhi, Mumbai, New York, Tokyo)"
            className="w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-2xs"
          />
          {isSearching && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </form>

        {/* Autocomplete Dropdown */}
        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
            <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-medium">
              <span>Suggested Global & India Locations</span>
              <span>Select to inspect</span>
            </div>
            {suggestions.length > 0 ? (
              <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                {suggestions.map((item, idx) => (
                  <button
                    key={`${item.name}-${idx}`}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className="w-full px-3.5 py-2.5 text-left flex items-center justify-between hover:bg-blue-50/70 transition-colors"
                  >
                    <div className="flex items-center space-x-2.5">
                      <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                      <div>
                        <div className="text-sm font-semibold text-gray-800 leading-snug">
                          {item.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.state ? `${item.state}, ` : ''}{item.country}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] text-gray-400 font-mono">
                      {item.lat.toFixed(2)}°, {item.lon.toFixed(2)}°
                    </span>
                  </button>
                ))}
              </div>
            ) : searchQuery.trim() ? (
              <div className="p-4 text-center text-xs text-gray-500">
                No location match found. Press enter to search worldwide.
              </div>
            ) : (
              <div className="p-2 grid grid-cols-2 gap-1 text-xs">
                {['New Delhi', 'Mumbai', 'Jaipur', 'Tokyo', 'New York', 'Shimla'].map((presetKey) => {
                  const p = PRESET_GEOCODING[presetKey.toLowerCase()];
                  return (
                    <button
                      key={presetKey}
                      onClick={() => handleSelect(p)}
                      className="px-2.5 py-1.5 rounded hover:bg-gray-100 text-left text-gray-700 flex items-center space-x-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      <span>{presetKey}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Date/Time, Live Status, Notifications, User Profile */}
      <div className="ml-auto flex items-center space-x-2 sm:space-x-3 shrink-0 text-sm">
        {/* Date / Time */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-gray-600" title="Live India Standard Time">
          <CalendarDays className="w-3.5 h-3.5 text-blue-500" />
          <span className="whitespace-nowrap">{currentDate || 'Loading date...'}</span>
          <span className="h-4 w-px bg-gray-200" aria-hidden="true" />
          <Clock className="w-3.5 h-3.5 text-gray-400" />
          <span className="font-mono tabular-nums whitespace-nowrap">{currentTime || '--:--:--'} IST</span>
        </div>

        {/* Live Data Status Indicator with Tooltip & Quick Refresh */}
        <div
          className="relative flex items-center space-x-1"
          onMouseEnter={() => setShowLiveTooltip(true)}
          onMouseLeave={() => setShowLiveTooltip(false)}
        >
          <div className="flex items-center space-x-1.5 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full text-green-700 font-medium text-xs shadow-2xs hover:bg-green-100 transition-colors">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span>Live Data</span>
          </div>

          {/* Quick Refresh Button */}
          <button
            onClick={handleRefreshClick}
            title="Refresh Live Data from Backend / Open-Meteo"
            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSpinningRefresh || isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          {/* Live Data Provenance Tooltip */}
          {showLiveTooltip && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-xl p-3 z-50 text-xs">
              <div className="flex items-center justify-between font-semibold text-gray-800 border-b border-gray-100 pb-1.5 mb-2">
                <span className="flex items-center space-x-1 text-green-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Real-Time Ingestion Active</span>
                </span>
                <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-mono">
                  PROVENANCE
                </span>
              </div>
              <div className="space-y-1.5 text-gray-600 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-gray-400">Primary Provider:</span>
                  <span className="font-medium text-gray-800">Open-Meteo & IMD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Seismic Source:</span>
                  <span className="font-medium text-gray-800">USGS Real-Time Feed</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Ingested:</span>
                  <span className="font-medium text-gray-800">{lastUpdated || 'Dynamically Synchronized'}</span>
                </div>
                {nextUpdate && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Next Scheduled:</span>
                    <span className="font-medium text-gray-800">{nextUpdate}</span>
                  </div>
                )}
                <div className="pt-1.5 border-t border-gray-100 text-[10px] text-gray-400">
                  Auto-refreshes every 5 minutes. Click refresh to query backend now.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            id="notifications-bell-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Hazard Notifications"
            className="relative p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl p-3 z-50 text-xs">
              <div className="flex items-center justify-between font-bold text-gray-900 border-b border-gray-100 pb-2 mb-2">
                <span>Extreme Weather Advisories</span>
                <span className="text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded font-mono">
                  ACTIVE
                </span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                <div className="p-2 bg-amber-50/70 border border-amber-100 rounded-lg text-[11px]">
                  <div className="font-semibold text-amber-900 flex items-center space-x-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Heavy Rainfall & Squally Wind</span>
                  </div>
                  <p className="text-gray-600 mt-1">Coastal Odisha and West Bengal (Deep Depression)</p>
                  <span className="text-[10px] text-gray-400 block mt-1">IMD Official Bulletin</span>
                </div>
                <div className="p-2 bg-blue-50/70 border border-blue-100 rounded-lg text-[11px]">
                  <div className="font-semibold text-blue-900">Diurnal Temperature Fall Alert</div>
                  <p className="text-gray-600 mt-1">North-West India, Punjab & Haryana (Cold advection)</p>
                  <span className="text-[10px] text-gray-400 block mt-1">NCMRWF Coupled Model</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 1: User Profile / Settings Button (Amarjeet with AJ/A avatar) */}
        <button
          id="user-profile-btn"
          onClick={() => setShowProfileModal(true)}
          className="flex items-center space-x-2 pl-1 pr-2.5 py-1 rounded-full hover:bg-gray-100 transition-colors border border-gray-200/80 bg-white shadow-2xs cursor-pointer group"
          title={`User Profile: ${profile.displayName} (Click to open Settings)`}
        >
          <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover:bg-blue-700 transition-colors">
            {getInitials(profile.displayName)}
          </div>
          <span className="font-semibold text-xs text-gray-800 hidden sm:inline-block max-w-[120px] truncate">
            {profile.displayName}
          </span>
          <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-gray-600 hidden sm:inline-block" />
        </button>
      </div>

      {/* User Profile & Settings Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        profile={profile}
        onSave={handleSaveProfile}
        onSetLocation={onSelectLocation}
      />
    </header>
  );
};
