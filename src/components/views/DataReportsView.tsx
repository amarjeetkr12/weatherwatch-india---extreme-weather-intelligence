import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  FileSpreadsheet,
  Upload,
  Download,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  History,
  GitCompare,
  Archive,
  RefreshCw,
  Search,
  CheckCircle,
  AlertCircle,
  Locate
} from 'lucide-react';
import { WeatherDataset, DatasetRecord } from '../../types/weather';

interface DataReportsViewProps {
  datasets: WeatherDataset[];
  onRefreshDatasets: () => void;
  onSelectLocation?: (loc: { name: string; country: string; lat: number; lon: number }) => void;
  onNavigateToMap?: () => void;
}

export const DataReportsView: React.FC<DataReportsViewProps> = ({
  datasets,
  onRefreshDatasets,
  onSelectLocation,
  onNavigateToMap
}) => {
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>(datasets[0]?.id || '');
  const [searchFilter, setSearchFilter] = useState('');
  const [editingRecord, setEditingRecord] = useState<DatasetRecord | null>(null);
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [newRecordData, setNewRecordData] = useState<Partial<DatasetRecord>>({
    location: '',
    country: 'India',
    tempC: 28,
    rainfallMm: 0,
    windKmh: 15,
    pressureHpa: 1012,
    anomalyType: 'Observed Anomaly',
    riskCategory: 'Moderate',
    mlScore: 0.65,
    notes: ''
  });
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renamedTitle, setRenamedTitle] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentDataset = datasets.find(d => d.id === selectedDatasetId) || datasets[0];

  const filteredRecords = (currentDataset?.records || []).filter(r =>
    r.location.toLowerCase().includes(searchFilter.toLowerCase()) ||
    r.anomalyType.toLowerCase().includes(searchFilter.toLowerCase()) ||
    r.country.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const showNotification = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3500);
  };

  // Upload Excel file (.xlsx, .xls, .csv)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawJson: any[] = XLSX.utils.sheet_to_json(ws);

        if (!rawJson || rawJson.length === 0) {
          alert('Excel file is empty or missing data headers.');
          return;
        }

        const normalizedRecords = rawJson.map((row, idx) => ({
          id: `rec-upload-${Date.now()}-${idx}`,
          timestamp: row.Timestamp || row.date || new Date().toISOString(),
          location: row.Location || row.City || row.station || `Station-${idx + 1}`,
          country: row.Country || 'Global',
          lat: Number(row.Latitude || row.lat || 20),
          lon: Number(row.Longitude || row.lon || 78),
          tempC: Number(row.Temperature || row.Temp || row.tempC || 25),
          rainfallMm: Number(row.Rainfall || row.Rain || row.rainfallMm || 0),
          windKmh: Number(row.Wind || row.windKmh || 12),
          pressureHpa: Number(row.Pressure || row.pressureHpa || 1013),
          anomalyType: row.AnomalyType || row.Anomaly || 'Imported Observation',
          riskCategory: (['Low', 'Moderate', 'High', 'Critical'].includes(row.Risk) ? row.Risk : 'Moderate') as any,
          mlScore: Number(row.MLScore || row.score || 0.5),
          notes: row.Notes || `Uploaded from ${file.name}`
        }));

        const res = await fetch('/api/datasets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: file.name.replace(/\.[^/.]+$/, ''),
            sourceType: 'Custom User Upload',
            records: normalizedRecords
          })
        });

        if (res.ok) {
          const data = await res.json();
          showNotification(`Successfully uploaded ${file.name} with ${normalizedRecords.length} records.`);
          onRefreshDatasets();
          if (data.dataset) setSelectedDatasetId(data.dataset.id);
        }
      } catch (err: any) {
        console.error('Error reading Excel file:', err);
        alert('Failed to parse Excel file. Please ensure it is a valid .xlsx, .xls, or .csv file.');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  // Export / Download dataset as Excel (.xlsx)
  const handleDownloadExcel = () => {
    if (!currentDataset) return;
    const worksheet = XLSX.utils.json_to_sheet(currentDataset.records);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'WeatherAnomalies');
    XLSX.writeFile(workbook, `${currentDataset.name.replace(/\s+/g, '_')}_${currentDataset.version}.xlsx`);
    showNotification(`Downloaded ${currentDataset.name}.xlsx`);
  };

  // Export as CSV
  const handleDownloadCSV = () => {
    if (!currentDataset) return;
    const worksheet = XLSX.utils.json_to_sheet(currentDataset.records);
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${currentDataset.name}_${currentDataset.version}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification(`Downloaded ${currentDataset.name}.csv`);
  };

  // Save edited record
  const handleSaveRecord = async () => {
    if (!editingRecord || !currentDataset) return;
    const updatedRecords = currentDataset.records.map(r => r.id === editingRecord.id ? editingRecord : r);
    try {
      const res = await fetch(`/api/datasets/${currentDataset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          records: updatedRecords,
          actionSummary: `Updated record for location ${editingRecord.location}`
        })
      });
      if (res.ok) {
        showNotification(`Saved changes to ${editingRecord.location}`);
        setEditingRecord(null);
        onRefreshDatasets();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete single record
  const handleDeleteRecord = async (recordId: string) => {
    if (!currentDataset) return;
    if (!confirm('Are you sure you want to delete this record?')) return;
    const updatedRecords = currentDataset.records.filter(r => r.id !== recordId);
    try {
      const res = await fetch(`/api/datasets/${currentDataset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          records: updatedRecords,
          actionSummary: `Deleted record ID ${recordId}`
        })
      });
      if (res.ok) {
        showNotification('Record deleted.');
        onRefreshDatasets();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add new record
  const handleAddRecord = async () => {
    if (!currentDataset || !newRecordData.location) return;
    const newRecord: DatasetRecord = {
      id: `rec-new-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      location: newRecordData.location,
      country: newRecordData.country || 'India',
      lat: Number(newRecordData.lat || 25.0),
      lon: Number(newRecordData.lon || 75.0),
      tempC: Number(newRecordData.tempC || 25),
      rainfallMm: Number(newRecordData.rainfallMm || 0),
      windKmh: Number(newRecordData.windKmh || 12),
      pressureHpa: Number(newRecordData.pressureHpa || 1012),
      anomalyType: newRecordData.anomalyType || 'Extreme Weather Pattern',
      riskCategory: (newRecordData.riskCategory as any) || 'Moderate',
      mlScore: Number(newRecordData.mlScore || 0.65),
      notes: newRecordData.notes || 'Manually added validation record'
    };

    const updatedRecords = [newRecord, ...currentDataset.records];
    try {
      const res = await fetch(`/api/datasets/${currentDataset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          records: updatedRecords,
          actionSummary: `Added record for ${newRecord.location}`
        })
      });
      if (res.ok) {
        showNotification(`Added new record for ${newRecord.location}`);
        setIsAddingRecord(false);
        setNewRecordData({ location: '', country: 'India', tempC: 28, rainfallMm: 0, windKmh: 15, pressureHpa: 1012, anomalyType: '', riskCategory: 'Moderate', mlScore: 0.65, notes: '' });
        onRefreshDatasets();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Rename dataset
  const handleRenameDataset = async () => {
    if (!currentDataset || !renamedTitle.trim()) return;
    try {
      const res = await fetch(`/api/datasets/${currentDataset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: renamedTitle.trim(),
          actionSummary: `Renamed dataset to "${renamedTitle.trim()}"`
        })
      });
      if (res.ok) {
        showNotification('Dataset renamed successfully.');
        setIsRenaming(false);
        onRefreshDatasets();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete dataset
  const handleDeleteDataset = async () => {
    if (!currentDataset) return;
    if (!confirm(`Are you sure you want to permanently delete dataset "${currentDataset.name}"?`)) return;
    try {
      const res = await fetch(`/api/datasets/${currentDataset.id}`, { method: 'DELETE' });
      if (res.ok) {
        showNotification(`Deleted dataset "${currentDataset.name}".`);
        onRefreshDatasets();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Archive toggle
  const handleArchiveToggle = async () => {
    if (!currentDataset) return;
    try {
      const res = await fetch(`/api/datasets/${currentDataset.id}/archive-toggle`, { method: 'POST' });
      if (res.ok) {
        showNotification(currentDataset.isArchived ? 'Dataset restored from archive.' : 'Dataset archived.');
        onRefreshDatasets();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div id="data-reports-view" className="space-y-4">
      {/* View Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 leading-none">
              Excel Dataset Management & Provenance
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Ingest, inspect, edit, version, and validate historical climatological datasets (.xlsx, .xls, .csv).
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Excel / CSV</span>
          </button>

          <button
            onClick={handleDownloadExcel}
            className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export .xlsx</span>
          </button>

          <button
            onClick={handleDownloadCSV}
            className="px-2.5 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
            title="Download CSV"
          >
            .csv
          </button>
        </div>
      </div>

      {message && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs px-3.5 py-2 rounded-lg flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Dataset Selector Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 overflow-x-auto">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider shrink-0">
            Active Dataset:
          </span>
          {datasets.map((ds) => (
            <button
              key={ds.id}
              onClick={() => setSelectedDatasetId(ds.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                selectedDatasetId === ds.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {ds.name} <span className="opacity-75 font-mono text-[10px]">({ds.version})</span>
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setRenamedTitle(currentDataset.name);
              setIsRenaming(true);
            }}
            className="p-1.5 hover:bg-gray-100 rounded text-gray-600 text-xs flex items-center space-x-1"
            title="Rename Dataset"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Rename</span>
          </button>

          <button
            onClick={handleArchiveToggle}
            className="p-1.5 hover:bg-gray-100 rounded text-gray-600 text-xs flex items-center space-x-1"
            title="Archive or Restore"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>{currentDataset?.isArchived ? 'Restore' : 'Archive'}</span>
          </button>

          <button
            onClick={handleDeleteDataset}
            className="p-1.5 hover:bg-rose-50 rounded text-rose-600 text-xs flex items-center space-x-1"
            title="Delete Dataset"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Rename dialog */}
      {isRenaming && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center space-x-3">
          <span className="text-xs font-semibold text-amber-900">New Dataset Name:</span>
          <input
            type="text"
            value={renamedTitle}
            onChange={(e) => setRenamedTitle(e.target.value)}
            className="px-2 py-1 bg-white border border-amber-300 rounded text-xs text-gray-800 focus:outline-none flex-1 max-w-sm"
          />
          <button
            onClick={handleRenameDataset}
            className="px-3 py-1 bg-amber-600 text-white rounded text-xs font-semibold hover:bg-amber-700"
          >
            Save Name
          </button>
          <button
            onClick={() => setIsRenaming(false)}
            className="px-2 py-1 text-gray-600 text-xs hover:text-gray-900"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Dataset Metadata Bar (matching Prompt Section 14) */}
      {currentDataset && (
        <div className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-2xs grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
          <div>
            <span className="text-[10px] text-gray-400 font-medium block">DATASET NAME</span>
            <span className="font-bold text-gray-800 truncate block">{currentDataset.name}</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-medium block">VERSION</span>
            <span className="font-bold text-blue-600 font-mono">{currentDataset.version}</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-medium block">UPLOAD TIME</span>
            <span className="font-medium text-gray-700">{new Date(currentDataset.uploadedAt).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-medium block">RECORD COUNT</span>
            <span className="font-bold text-gray-900">{currentDataset.recordCount} rows</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-medium block">DATE RANGE</span>
            <span className="font-medium text-gray-700">{currentDataset.dateRange}</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-medium block">LOCATIONS</span>
            <span className="font-medium text-gray-700 truncate block">{currentDataset.locations.slice(0, 3).join(', ')}...</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-medium block">SOURCE TYPE</span>
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-1 rounded truncate block">
              {currentDataset.sourceType}
            </span>
          </div>
        </div>
      )}

      {/* Records Table Header Controls */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter records by location or anomaly..."
            className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={() => setIsAddingRecord(true)}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Record</span>
        </button>
      </div>

      {/* Add New Record Modal / Drawer */}
      {isAddingRecord && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
              Add New Anomaly Record
            </h4>
            <button onClick={() => setIsAddingRecord(false)} className="text-emerald-700 hover:text-emerald-900">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div>
              <label className="text-[10px] text-gray-600 font-semibold block mb-0.5">Location</label>
              <input
                type="text"
                value={newRecordData.location || ''}
                onChange={e => setNewRecordData({ ...newRecordData, location: e.target.value })}
                placeholder="e.g. Pune, Maharashtra"
                className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-600 font-semibold block mb-0.5">Country</label>
              <input
                type="text"
                value={newRecordData.country || ''}
                onChange={e => setNewRecordData({ ...newRecordData, country: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-600 font-semibold block mb-0.5">Temperature (°C)</label>
              <input
                type="number"
                step="0.1"
                value={newRecordData.tempC || 0}
                onChange={e => setNewRecordData({ ...newRecordData, tempC: parseFloat(e.target.value) })}
                className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-600 font-semibold block mb-0.5">Rainfall (mm)</label>
              <input
                type="number"
                step="0.1"
                value={newRecordData.rainfallMm || 0}
                onChange={e => setNewRecordData({ ...newRecordData, rainfallMm: parseFloat(e.target.value) })}
                className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-600 font-semibold block mb-0.5">Wind (km/h)</label>
              <input
                type="number"
                step="0.1"
                value={newRecordData.windKmh || 0}
                onChange={e => setNewRecordData({ ...newRecordData, windKmh: parseFloat(e.target.value) })}
                className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-600 font-semibold block mb-0.5">Anomaly Classification</label>
              <input
                type="text"
                value={newRecordData.anomalyType || ''}
                onChange={e => setNewRecordData({ ...newRecordData, anomalyType: e.target.value })}
                placeholder="e.g. Diurnal Squall Surge"
                className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-600 font-semibold block mb-0.5">Risk Category</label>
              <select
                value={newRecordData.riskCategory || 'Moderate'}
                onChange={e => setNewRecordData({ ...newRecordData, riskCategory: e.target.value as any })}
                className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-xs"
              >
                <option value="Low">Low</option>
                <option value="Moderate">Moderate</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-600 font-semibold block mb-0.5">ML Score (0-1.0)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={newRecordData.mlScore || 0.65}
                onChange={e => setNewRecordData({ ...newRecordData, mlScore: parseFloat(e.target.value) })}
                className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={() => setIsAddingRecord(false)}
              className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded text-xs hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddRecord}
              className="px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-semibold hover:bg-emerald-700 shadow-2xs"
            >
              Append Record
            </button>
          </div>
        </div>
      )}

      {/* Records Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-gray-200">
            <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-3.5 py-2.5">Location</th>
                <th className="px-3.5 py-2.5">Timestamp</th>
                <th className="px-3.5 py-2.5">Temp (°C)</th>
                <th className="px-3.5 py-2.5">Rain (mm)</th>
                <th className="px-3.5 py-2.5">Wind (kph)</th>
                <th className="px-3.5 py-2.5">Anomaly Type</th>
                <th className="px-3.5 py-2.5">Risk</th>
                <th className="px-3.5 py-2.5">ML Score</th>
                <th className="px-3.5 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredRecords.map((r) => {
                const isEditingThis = editingRecord?.id === r.id;
                return (
                  <tr key={r.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-3.5 py-2.5 font-semibold text-gray-900">
                      {isEditingThis ? (
                        <input
                          type="text"
                          value={editingRecord.location}
                          onChange={e => setEditingRecord({ ...editingRecord, location: e.target.value })}
                          className="px-1.5 py-1 border border-blue-400 rounded text-xs w-28"
                        />
                      ) : (
                        <div>
                          <div>{r.location}</div>
                          <div className="text-[10px] text-gray-400 font-normal">{r.country}</div>
                        </div>
                      )}
                    </td>

                    <td className="px-3.5 py-2.5 text-gray-500 font-mono text-[11px]">
                      {r.timestamp}
                    </td>

                    <td className="px-3.5 py-2.5">
                      {isEditingThis ? (
                        <input
                          type="number"
                          value={editingRecord.tempC}
                          onChange={e => setEditingRecord({ ...editingRecord, tempC: parseFloat(e.target.value) })}
                          className="px-1.5 py-1 border border-blue-400 rounded text-xs w-16"
                        />
                      ) : (
                        <span className={`font-semibold ${r.tempC > 35 ? 'text-rose-600' : 'text-gray-900'}`}>
                          {r.tempC}°C
                        </span>
                      )}
                    </td>

                    <td className="px-3.5 py-2.5">
                      {isEditingThis ? (
                        <input
                          type="number"
                          value={editingRecord.rainfallMm}
                          onChange={e => setEditingRecord({ ...editingRecord, rainfallMm: parseFloat(e.target.value) })}
                          className="px-1.5 py-1 border border-blue-400 rounded text-xs w-16"
                        />
                      ) : (
                        <span className={r.rainfallMm > 20 ? 'font-semibold text-blue-600' : 'text-gray-600'}>
                          {r.rainfallMm} mm
                        </span>
                      )}
                    </td>

                    <td className="px-3.5 py-2.5 text-gray-600">
                      {isEditingThis ? (
                        <input
                          type="number"
                          value={editingRecord.windKmh}
                          onChange={e => setEditingRecord({ ...editingRecord, windKmh: parseFloat(e.target.value) })}
                          className="px-1.5 py-1 border border-blue-400 rounded text-xs w-16"
                        />
                      ) : (
                        `${r.windKmh} kph`
                      )}
                    </td>

                    <td className="px-3.5 py-2.5 font-medium text-gray-700">
                      {isEditingThis ? (
                        <input
                          type="text"
                          value={editingRecord.anomalyType}
                          onChange={e => setEditingRecord({ ...editingRecord, anomalyType: e.target.value })}
                          className="px-1.5 py-1 border border-blue-400 rounded text-xs w-36"
                        />
                      ) : (
                        r.anomalyType
                      )}
                    </td>

                    <td className="px-3.5 py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        r.riskCategory === 'Critical' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                        r.riskCategory === 'High' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                        r.riskCategory === 'Moderate' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                        'bg-emerald-100 text-emerald-800 border-emerald-200'
                      }`}>
                        {r.riskCategory}
                      </span>
                    </td>

                    <td className="px-3.5 py-2.5 font-mono text-[11px] text-gray-700 font-semibold">
                      {r.mlScore.toFixed(2)}
                    </td>

                    <td className="px-3.5 py-2.5 text-right">
                      {isEditingThis ? (
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={handleSaveRecord}
                            className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                            title="Save Record"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingRecord(null)}
                            className="p-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end space-x-1">
                          {onSelectLocation && (
                            <button
                              onClick={() => {
                                onSelectLocation({
                                  name: r.location,
                                  country: r.country,
                                  lat: r.lat,
                                  lon: r.lon
                                });
                                if (onNavigateToMap) onNavigateToMap();
                              }}
                              className="p-1 hover:bg-blue-50 rounded text-blue-600 hover:text-blue-800"
                              title={`Visualize ${r.location} on Weather Map`}
                            >
                              <Locate className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => setEditingRecord(r)}
                            className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-blue-600"
                            title="Edit Record"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(r.id)}
                            className="p-1 hover:bg-rose-50 rounded text-gray-400 hover:text-rose-600"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
