import React from 'react';
import {
  Home,
  Map,
  Satellite,
  TrendingUp,
  AlertTriangle,
  FileSpreadsheet,
  Globe2,
  GitCommit,
  Layers,
  FileText,
  Activity,
  Cpu
} from 'lucide-react';

export type MainTab =
  | 'overview'
  | 'live-map'
  | 'satellite'
  | 'forecast'
  | 'alerts'
  | 'data-reports'
  // 6 intelligence sections
  | 'intel-global-map'
  | 'intel-forecast-trajectory'
  | 'intel-events'
  | 'intel-anomaly-registry'
  | 'intel-advisory-feed'
  | 'intel-diagnostics';

interface SidebarProps {
  activeTab: MainTab;
  onTabChange?: (tab: MainTab) => void;
  onSelectTab?: (tab: MainTab) => void;
  unreadAlertsCount?: number;
  hazardsCount?: number;
  anomaliesCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onSelectTab,
  unreadAlertsCount = 3,
  hazardsCount,
  anomaliesCount
}) => {
  const handleTabSelect = (tab: MainTab) => {
    if (typeof onTabChange === 'function') {
      onTabChange(tab);
    }
    if (typeof onSelectTab === 'function') {
      onSelectTab(tab);
    }
  };

  const primaryNavItems: Array<{ id: MainTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'live-map', label: 'Live Map', icon: Map },
    { id: 'satellite', label: 'Satellite', icon: Satellite },
    { id: 'forecast', label: 'Forecast', icon: TrendingUp },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
    { id: 'data-reports', label: 'Data & Reports', icon: FileSpreadsheet }
  ];

  const intelligenceSections: Array<{ id: MainTab; label: string; num: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'intel-global-map', label: 'Global Spatial Map', num: '1', icon: Globe2 },
    { id: 'intel-forecast-trajectory', label: 'Forecast Trajectory & Risk', num: '2', icon: Activity },
    { id: 'intel-events', label: 'Spatio-Temporal Events', num: '3', icon: GitCommit },
    { id: 'intel-anomaly-registry', label: 'Anomaly Registry', num: '4', icon: Layers },
    { id: 'intel-advisory-feed', label: 'Advisory Feed', num: '5', icon: FileText },
    { id: 'intel-diagnostics', label: 'Diagnostics & Quality', num: '6', icon: Cpu }
  ];

  return (
    <aside
      id="main-sidebar"
      className="w-full lg:w-56 shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 flex lg:flex-col justify-between py-2 lg:py-3 h-auto lg:h-[calc(100vh-53px)] lg:sticky lg:top-[53px] overflow-hidden lg:overflow-y-auto select-none"
    >
      <div className="space-y-4">
        {/* Main Navigation matching Reference Screenshot */}
        <div className="px-2 flex lg:block gap-1 overflow-x-auto pb-1 lg:pb-0">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleTabSelect(item.id)}
                className={`w-auto lg:w-full shrink-0 flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-blue-600' : 'text-gray-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.id === 'alerts' && unreadAlertsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                    {unreadAlertsCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Six Major Intelligence Sections (Preserved & Prominently Accessible) */}
        <div className="pt-2 border-t border-gray-100 px-2">
          <div className="px-3 pb-1.5 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Intelligence Suites
            </span>
            <span className="text-[9px] font-semibold bg-gray-100 text-gray-500 px-1 rounded">
              6 CORE
            </span>
          </div>

          <div className="flex lg:block gap-1 space-y-0.5 overflow-x-auto pb-1 lg:pb-0">
            {intelligenceSections.map((sec) => {
              const SecIcon = sec.icon;
              const isActive = activeTab === sec.id;
              return (
                <button
                  key={sec.id}
                  id={`sidebar-intel-${sec.id}`}
                  onClick={() => handleTabSelect(sec.id)}
                  className={`w-auto lg:w-full shrink-0 flex items-center space-x-2 px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors text-left ${
                    isActive
                      ? 'bg-blue-50/80 text-blue-600 font-semibold'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-[10px] font-mono text-gray-400 w-3 shrink-0">
                    {sec.num}.
                  </span>
                  <SecIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">{sec.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sidebar Footer: System Status */}
      <div className="px-3 pt-2 border-t border-gray-100 text-[11px] text-gray-400">
        <div className="flex items-center justify-between font-mono text-[10px]">
          <span>ML ENGINE</span>
          <span className="text-green-600 font-semibold">ISO-FOREST v2</span>
        </div>
        <div className="text-[10px] text-gray-400 mt-0.5 truncate">
          WMO Climatological Normal
        </div>
      </div>
    </aside>
  );
};
