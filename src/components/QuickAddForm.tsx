import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { Plus, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import type { SalesRecord } from '../data/mockData';

export const QuickAddForm: React.FC = () => {
  const { addSalesRecord } = useDashboard();

  // Form states managed with standard React useState
  const [formDate, setFormDate] = useState('2026-05-28');
  const [formRevenue, setFormRevenue] = useState('');
  const [formProfit, setFormProfit] = useState('');
  const [formCategory, setFormCategory] = useState<'Electronics' | 'Apparel' | 'Home' | 'Software'>('Electronics');
  const [formRegion, setFormRegion] = useState<'North America' | 'Europe' | 'Asia' | 'LATAM' | 'Middle East'>('North America');
  const [formCustomer, setFormCustomer] = useState('');
  const [formAlert, setFormAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
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

    const newRecord: SalesRecord = {
      id: `ORD-${Date.now()}`,
      date: formDate,
      customerName: formCustomer.trim() || 'Direct Client',
      productName: 'Direct Purchase',
      category: formCategory,
      region: formRegion,
      revenue: revenueNum,
      profit: profitNum,
      status: 'Delivered'
    };

    const success = await addSalesRecord(newRecord);
    if (success) {
      setFormAlert({ type: 'success', message: 'Record added successfully!' });
      // Reset currency fields
      setFormRevenue('');
      setFormProfit('');
      setFormCustomer('');
      setTimeout(() => setFormAlert(null), 3000);
    } else {
      setFormAlert({ type: 'error', message: 'Failed to persist record in database.' });
    }
  };

  return (
    <div className="p-6 rounded-2xl glass-card border border-indigo-500/10 shadow-[0_4px_30px_rgba(99,102,241,0.04)] flex flex-col justify-between">
      
      {/* Title Header */}
      <div className="pb-4 border-b border-slate-800/60 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-white tracking-wide flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Quick Add Transaction
          </h4>
          <p className="text-xs text-slate-400 mt-1">Insert a persistent order directly onto your charts.</p>
        </div>
      </div>

      {/* Entry Form */}
      <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
        
        {/* Date / Month Picker */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date / Month</label>
          <input
            type="date"
            required
            value={formDate}
            onChange={(e) => setFormDate(e.target.value)}
            className="w-full px-3 py-2 text-xs text-white bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl outline-none transition-all [color-scheme:dark]"
          />
        </div>

        {/* Currency inputs side-by-side */}
        <div className="grid grid-cols-2 gap-3">
          {/* Sales Amount */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sales (₹)</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs text-slate-400 font-bold">₹</span>
              <input
                type="number"
                required
                placeholder="e.g. 50000"
                value={formRevenue}
                onChange={(e) => setFormRevenue(e.target.value)}
                className="w-full pl-6.5 pr-2.5 py-2 text-xs text-white bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl outline-none transition-all placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Profit Amount */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Profit (₹)</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs text-slate-400 font-bold">₹</span>
              <input
                type="number"
                required
                placeholder="e.g. 20000"
                value={formProfit}
                onChange={(e) => setFormProfit(e.target.value)}
                className="w-full pl-6.5 pr-2.5 py-2 text-xs text-white bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl outline-none transition-all placeholder:text-slate-600"
              />
            </div>
          </div>
        </div>

        {/* Category & Region side-by-side */}
        <div className="grid grid-cols-2 gap-3">
          {/* Category Dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category</label>
            <select
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value as any)}
              className="w-full px-3 py-2 text-xs text-slate-200 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl outline-none transition-all cursor-pointer"
            >
              <option value="Electronics">Electronics</option>
              <option value="Apparel">Apparel</option>
              <option value="Home">Home</option>
              <option value="Software">Software</option>
            </select>
          </div>

          {/* Region Dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Region</label>
            <select
              value={formRegion}
              onChange={(e) => setFormRegion(e.target.value as any)}
              className="w-full px-3 py-2 text-xs text-slate-200 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl outline-none transition-all cursor-pointer"
            >
              <option value="North America">North America</option>
              <option value="Europe">Europe</option>
              <option value="Asia">Asia</option>
              <option value="LATAM">LATAM</option>
              <option value="Middle East">Middle East</option>
            </select>
          </div>
        </div>

        {/* Customer Account */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Customer Name</label>
          <input
            type="text"
            placeholder="e.g. Aditi Sharma (Optional)"
            value={formCustomer}
            onChange={(e) => setFormCustomer(e.target.value)}
            className="w-full px-3 py-2 text-xs text-white bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl outline-none transition-all placeholder:text-slate-600"
          />
        </div>

        {/* Validation Status Banner */}
        {formAlert && (
          <div className={`p-2.5 rounded-xl border flex items-start gap-2 transition-all animate-fadeIn text-[11px] font-medium
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

        {/* Glowing Submit Button */}
        <button
          type="submit"
          className="w-full mt-2 py-2 px-4 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Custom Record
        </button>

      </form>
    </div>
  );
};
export default QuickAddForm;
