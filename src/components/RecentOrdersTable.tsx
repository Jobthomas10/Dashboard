import React, { useState, useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import type { SalesRecord } from '../data/mockData';
import { Search, ChevronLeft, ChevronRight, ShieldAlert } from 'lucide-react';

export const RecentOrdersTable: React.FC = () => {
  const { filteredData } = useDashboard();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Reset pagination to first page if data filters or search change
  useMemo(() => {
    setCurrentPage(1);
  }, [filteredData, searchTerm]);

  // Apply search query
  const searchedData = useMemo(() => {
    if (!searchTerm.trim()) return filteredData;
    const query = searchTerm.toLowerCase();
    return filteredData.filter(r => 
      r.customerName.toLowerCase().includes(query) ||
      r.productName.toLowerCase().includes(query) ||
      r.id.toLowerCase().includes(query) ||
      r.category.toLowerCase().includes(query) ||
      r.region.toLowerCase().includes(query)
    );
  }, [filteredData, searchTerm]);

  // Paginate search-filtered data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return searchedData.slice(startIndex, startIndex + itemsPerPage);
  }, [searchedData, currentPage]);

  const totalPages = Math.max(1, Math.ceil(searchedData.length / itemsPerPage));

  // Currency Formatter
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val);
  };

  const getStatusBadge = (status: SalesRecord['status']) => {
    const styles = {
      Delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      Shipped: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      Processing: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      Cancelled: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    }[status];

    return (
      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${styles}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="p-6 rounded-2xl glass-card flex flex-col justify-between min-h-[580px]">
      
      {/* Table Title and Search Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-800/60">
        <div>
          <h4 className="text-sm font-semibold text-white tracking-wide">Transactional Logs</h4>
          <p className="text-xs text-slate-400 mt-1">Listing orders matching filters. Click search to query fields.</p>
        </div>

        {/* Search capsule */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search orders, clients, goods..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs text-slate-300 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-750 focus:border-indigo-500 focus:bg-slate-950 rounded-xl outline-none transition-all placeholder:text-slate-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Main Table Container */}
      <div className="flex-1 mt-4 overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-800/80 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              <th className="py-3 px-4">Order ID</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Product</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4 text-right">Revenue</th>
              <th className="py-3 px-4 text-right">Profit</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-850 text-xs text-slate-300">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500 font-medium">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <ShieldAlert className="w-8 h-8 text-slate-600" />
                    <span>No matching records found.</span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((order) => (
                <tr 
                  key={order.id}
                  className="hover:bg-slate-900/35 transition-colors group"
                >
                  <td className="py-3 px-4 font-mono font-semibold text-indigo-400">{order.id}</td>
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap">{order.date}</td>
                  <td className="py-3 px-4 font-medium text-white">{order.customerName}</td>
                  <td className="py-3 px-4 text-slate-300 font-medium whitespace-nowrap max-w-[150px] truncate" title={order.productName}>
                    {order.productName}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] text-slate-400 px-2 py-0.5 bg-slate-900 border border-slate-800 rounded-md">
                      {order.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-slate-100">{formatCurrency(order.revenue)}</td>
                  <td className="py-3 px-4 text-right font-semibold text-emerald-400">{formatCurrency(order.profit)}</td>
                  <td className="py-3 px-4 text-center">{getStatusBadge(order.status)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {searchedData.length > 0 && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-6 border-t border-slate-800/60 mt-4">
          <div className="text-xs text-slate-400 font-medium text-center sm:text-left">
            Showing <span className="text-white font-semibold">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
            <span className="text-white font-semibold">
              {Math.min(currentPage * itemsPerPage, searchedData.length)}
            </span> of{' '}
            <span className="text-indigo-400 font-semibold">{searchedData.length}</span> entries
          </div>

          <div className="flex items-center justify-center gap-2 self-center sm:self-auto">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`flex items-center justify-center p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer select-none
                ${currentPage === 1 
                  ? 'opacity-40 pointer-events-none' 
                  : 'bg-slate-900/60 hover:bg-slate-900'
                }
              `}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="text-xs text-slate-300 font-semibold px-4 py-2 rounded-xl bg-slate-900 border border-slate-800">
              Page {currentPage} of {totalPages}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`flex items-center justify-center p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer select-none
                ${currentPage === totalPages 
                  ? 'opacity-40 pointer-events-none' 
                  : 'bg-slate-900/60 hover:bg-slate-900'
                }
              `}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
export default RecentOrdersTable;
