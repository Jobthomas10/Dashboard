import React, { useState, useRef } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { parseCSV, generateSampleCSVString } from '../utils/csvParser';
import { 
  Upload, 
  Calendar, 
  MapPin, 
  Tag, 
  Download, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Menu,
  RotateCcw,
  Plus
} from 'lucide-react';

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle }) => {
  const { 
    activeTab, 
    filters, 
    setFilters, 
    importCSVData, 
    addSalesRecord,
    availableRegions, 
    availableCategories
  } = useDashboard();

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual Transaction Form States
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);
  const [formDate, setFormDate] = useState('2026-05-28');
  const [formRevenue, setFormRevenue] = useState('');
  const [formProfit, setFormProfit] = useState('');
  const [formCategory, setFormCategory] = useState<'Electronics' | 'Apparel' | 'Home' | 'Software'>('Electronics');
  const [formRegion, setFormRegion] = useState<'North America' | 'Europe' | 'Asia' | 'LATAM' | 'Middle East'>('North America');
  const [formCustomer, setFormCustomer] = useState('');
  const [formProduct, setFormProduct] = useState('');
  const [formAlert, setFormAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleAddRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormAlert(null);

    const revenueNum = parseFloat(formRevenue);
    const profitNum = parseFloat(formProfit);

    if (isNaN(revenueNum) || revenueNum <= 0) {
      setFormAlert({ type: 'error', message: 'Sales amount must be a positive number.' });
      return;
    }
    if (isNaN(profitNum) || profitNum < 0) {
      setFormAlert({ type: 'error', message: 'Profit amount must be a non-negative number.' });
      return;
    }
    if (profitNum > revenueNum) {
      setFormAlert({ type: 'error', message: 'Profit amount cannot exceed sales amount.' });
      return;
    }
    if (!formDate) {
      setFormAlert({ type: 'error', message: 'Please select a transaction date/month.' });
      return;
    }

    const newRecord = {
      id: `ORD-${Date.now()}`,
      date: formDate,
      customerName: formCustomer.trim() || 'Direct Client',
      productName: formProduct.trim() || 'Manual Purchase',
      category: formCategory,
      region: formRegion,
      revenue: revenueNum,
      profit: profitNum,
      status: 'Delivered' as const
    };

    const success = await addSalesRecord(newRecord);
    if (success) {
      setFormAlert({ type: 'success', message: 'Transaction successfully persisted and synchronized!' });
      setFormRevenue('');
      setFormProfit('');
      setFormCustomer('');
      setFormProduct('');
      setTimeout(() => {
        setIsAddRecordOpen(false);
        setFormAlert(null);
      }, 1500);
    } else {
      setFormAlert({ type: 'error', message: 'Failed to persist record in database.' });
    }
  };

  // Define dynamic text based on active tab
  const tabMetadata = {
    overview: { title: "Executive Sales Overview", desc: "Real-time summary of sales, margin performance, and high-impact growth trends." },
    analytics: { title: "Deep-Dive Analytics", desc: "Interactive charts tracking historical revenue streams and product breakdowns." },
    orders: { title: "Recent Customer Orders", desc: "Comprehensive transactional log. Filter and search sales records." },
    customers: { title: "Top-Performing Customers", desc: "Identify your highest value buyers and their cumulative spending habits." },
  }[activeTab];

  // Handle filter changes
  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, region: e.target.value }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, category: e.target.value }));
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({
      ...prev,
      dateRange: { ...prev.dateRange, startDate: e.target.value }
    }));
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({
      ...prev,
      dateRange: { ...prev.dateRange, endDate: e.target.value }
    }));
  };

  const clearFilters = () => {
    setFilters({
      dateRange: { startDate: "2026-01-01", endDate: "2026-05-28" },
      region: "All",
      category: "All"
    });
  };

  // CSV Drag and Drop Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (file && file.name.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          const parsedRecords = parseCSV(text);
          if (parsedRecords.length > 0) {
            importCSVData(parsedRecords);
            setImportStatus({
              type: 'success',
              message: `Successfully imported ${parsedRecords.length} records into the dashboard!`
            });
            setTimeout(() => {
              setIsUploadOpen(false);
              setImportStatus(null);
            }, 3000);
          } else {
            setImportStatus({
              type: 'error',
              message: "Parsed 0 records. Please check the CSV structure."
            });
          }
        } catch (err) {
          setImportStatus({
            type: 'error',
            message: "Failed to parse CSV. Please verify formatting."
          });
        }
      };
      reader.readAsText(file);
    } else {
      setImportStatus({
        type: 'error',
        message: "Invalid file format. Please upload a .csv file."
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // CSV Template download helper
  const downloadSampleTemplate = () => {
    const csvContent = generateSampleCSVString();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "sales_dashboard_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <header className="relative flex flex-col gap-6 px-6 py-6 border-b border-slate-800 bg-[#07090e]/60 backdrop-blur-md">
      
      {/* Top row: Tab titles & actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        
        {/* Mobile menu button and Title */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onMobileMenuToggle}
            className="flex items-center justify-center w-10 h-10 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white lg:hidden transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              {tabMetadata.title}
            </h1>
            <p className="mt-1 text-xs text-slate-400 sm:text-sm max-w-2xl">
              {tabMetadata.desc}
            </p>
          </div>
        </div>

        {/* Global CSV and Data Controls */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            onClick={() => setIsAddRecordOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.25)] transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Record
          </button>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-all cursor-pointer active:scale-95"
          >
            <Upload className="w-4 h-4" />
            Upload CSV
          </button>
        </div>
      </div>

      {/* Dynamic Filters Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl glass-card">
        
        <div className="flex flex-wrap items-center gap-4">
          {/* Region selector */}
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-400" />
            <select
              value={filters.region}
              onChange={handleRegionChange}
              className="px-3 py-1.5 text-xs text-slate-300 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg outline-none cursor-pointer transition-all"
            >
              {availableRegions.map(reg => (
                <option key={reg} value={reg} className="bg-slate-950 text-slate-300">{reg} Region</option>
              ))}
            </select>
          </div>

          {/* Category selector */}
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-purple-400" />
            <select
              value={filters.category}
              onChange={handleCategoryChange}
              className="px-3 py-1.5 text-xs text-slate-300 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg outline-none cursor-pointer transition-all"
            >
              {availableCategories.map(cat => (
                <option key={cat} value={cat} className="bg-slate-950 text-slate-300">{cat} Category</option>
              ))}
            </select>
          </div>

          {/* Date range picker */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={filters.dateRange.startDate}
                onChange={handleStartDateChange}
                className="px-2 py-1 text-xs text-slate-300 bg-slate-900/80 border border-slate-800 focus:border-indigo-500 rounded-lg outline-none cursor-pointer transition-all [color-scheme:dark]"
              />
              <span className="text-xs text-slate-500 font-medium">to</span>
              <input
                type="date"
                value={filters.dateRange.endDate}
                onChange={handleEndDateChange}
                className="px-2 py-1 text-xs text-slate-300 bg-slate-900/80 border border-slate-800 focus:border-indigo-500 rounded-lg outline-none cursor-pointer transition-all [color-scheme:dark]"
              />
            </div>
          </div>
        </div>

        {/* Clear Filters indicator */}
        {(filters.region !== "All" || filters.category !== "All" || filters.dateRange.startDate !== "2026-01-01" || filters.dateRange.endDate !== "2026-05-28") && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/5 rounded-lg border border-slate-800 hover:border-indigo-500/20 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        )}
      </div>

      {/* CSV Uploader Modal Popup */}
      {isUploadOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto transition-all duration-300 cursor-pointer"
          onClick={() => {
            setIsUploadOpen(false);
            setImportStatus(null);
          }}
        >
          <div 
            className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl border border-slate-800 bg-[#0c101b] shadow-2xl transition-all overflow-hidden cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800/80 bg-[#0c101b]">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Import Transactional CSV</h3>
              </div>
              <button 
                onClick={() => {
                  setIsUploadOpen(false);
                  setImportStatus(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Modal Content Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[calc(90vh-80px)] bg-[#0c101b]">
              {/* Modal Description */}
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Dynamically load your customized orders. Your columns will be automatically mapped. 
                Don't have a CSV? Down below, download our structured sample to get started.
              </p>

              {/* Drag and Drop Zone */}
              <div 
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center py-8 px-6 border-2 border-dashed rounded-xl cursor-pointer transition-all
                  ${dragActive 
                    ? 'border-indigo-500 bg-indigo-500/5' 
                    : 'border-slate-800 hover:border-slate-700 bg-slate-900/20 hover:bg-slate-900/40'
                  }
                `}
              >
                <input 
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileInput}
                  className="hidden" 
                />
                
                <Upload className={`w-10 h-10 mb-3 transition-transform ${dragActive ? 'scale-110 text-indigo-400' : 'text-slate-500'}`} />
                
                <p className="text-xs sm:text-sm font-semibold text-slate-200 text-center">
                  Drag and drop your sales `.csv` here, or <span className="text-indigo-400 hover:underline">browse files</span>
                </p>
                <p className="mt-1.5 text-xs text-slate-500 text-center">
                  Supports columns: Date, Customer, Product, Revenue, Profit, Region, etc.
                </p>
              </div>

              {/* Template Downloader */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/50 border border-slate-800">
                <span className="text-xs font-medium text-slate-400">Download formatted starting spreadsheet:</span>
                <button
                  onClick={downloadSampleTemplate}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700/60 hover:border-indigo-500/30 rounded-lg transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Template.csv
                </button>
              </div>

              {/* Status alerts */}
              {importStatus && (
                <div className={`p-4 rounded-xl flex items-start gap-3 border transition-all animate-fadeIn
                  ${importStatus.type === 'success' 
                    ? 'bg-emerald-500/5 border-emerald-500/25 text-emerald-400' 
                    : 'bg-rose-500/5 border-rose-500/25 text-rose-400'
                  }
                `}>
                  {importStatus.type === 'success' 
                    ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" /> 
                    : <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  }
                  <div className="text-xs sm:text-sm font-medium">
                    {importStatus.message}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Manual Add Record Modal Popup */}
      {isAddRecordOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto cursor-pointer"
          onClick={() => {
            setIsAddRecordOpen(false);
            setFormAlert(null);
          }}
        >
          <div 
            className="relative w-full max-w-md max-h-[90vh] flex flex-col rounded-2xl border border-slate-800 bg-[#0c101b] shadow-2xl transition-all overflow-hidden cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800/80 bg-[#0c101b]">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Add Custom Sales Entry</h3>
              </div>
              <button 
                onClick={() => {
                  setIsAddRecordOpen(false);
                  setFormAlert(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Modal Form Fields Body */}
            <form onSubmit={handleAddRecordSubmit} className="flex-1 flex flex-col min-h-0 bg-[#0c101b]">
              <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[calc(90vh-150px)]">
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Date/Month Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date / Month</label>
                    <input
                      type="date"
                      required
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs text-white bg-slate-955 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl outline-none transition-all [color-scheme:dark]"
                    />
                  </div>

                  {/* Category Dropdown */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Product Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs text-slate-200 bg-slate-955 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl outline-none transition-all cursor-pointer"
                    >
                      <option value="Electronics" className="bg-slate-950">Electronics</option>
                      <option value="Apparel" className="bg-slate-950">Apparel</option>
                      <option value="Home" className="bg-slate-950">Home</option>
                      <option value="Software" className="bg-slate-950">Software</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Sales Amount in ₹ */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sales Amount (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 50000"
                        value={formRevenue}
                        onChange={(e) => setFormRevenue(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 text-xs text-white bg-slate-955 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl outline-none transition-all placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  {/* Profit Amount in ₹ */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Profit Amount (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 20000"
                        value={formProfit}
                        onChange={(e) => setFormProfit(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 text-xs text-white bg-slate-955 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl outline-none transition-all placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Region Dropdown */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Region</label>
                    <select
                      value={formRegion}
                      onChange={(e) => setFormRegion(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs text-slate-200 bg-slate-955 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl outline-none transition-all cursor-pointer"
                    >
                      <option value="North America" className="bg-slate-950">North America</option>
                      <option value="Europe" className="bg-slate-950">Europe</option>
                      <option value="Asia" className="bg-slate-950">Asia</option>
                      <option value="LATAM" className="bg-slate-950">LATAM</option>
                      <option value="Middle East" className="bg-slate-950">Middle East</option>
                    </select>
                  </div>

                  {/* Customer Account */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Customer Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Aditi Sharma"
                      value={formCustomer}
                      onChange={(e) => setFormCustomer(e.target.value)}
                      className="w-full px-3 py-2 text-xs text-white bg-slate-955 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl outline-none transition-all placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {/* Product Sold Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Product Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Cursor Pro License"
                    value={formProduct}
                    onChange={(e) => setFormProduct(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-white bg-slate-955 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl outline-none transition-all placeholder:text-slate-500"
                  />
                </div>

                {/* Form Status Alert */}
                {formAlert && (
                  <div className={`p-3 rounded-xl border flex items-start gap-2.5 transition-all animate-fadeIn text-[11px] font-medium
                    ${formAlert.type === 'success' 
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' 
                      : 'bg-rose-500/5 border-rose-500/20 text-rose-400'
                    }
                  `}>
                    {formAlert.type === 'success' 
                      ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" /> 
                      : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    }
                    <div>{formAlert.message}</div>
                  </div>
                )}

              </div>

              {/* Sticky Footer Button Bar */}
              <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-800/80 bg-[#0c101b] rounded-b-2xl mt-auto">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddRecordOpen(false);
                    setFormAlert(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.25)] transition-all cursor-pointer active:scale-95"
                >
                  Add Data
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </header>
  );
};
export default Header;
