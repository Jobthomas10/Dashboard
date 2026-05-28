import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { 
  LayoutDashboard, 
  BarChart3, 
  ShoppingBag, 
  Users, 
  ChevronLeft, 
  ChevronRight, 
  Database,
  TrendingUp,
  Trash2
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { activeTab, setActiveTab, resetToMockData, clearAllSalesRecords, salesData } = useDashboard();

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'orders', label: 'Recent Orders', icon: ShoppingBag },
    { id: 'customers', label: 'Customers', icon: Users },
  ] as const;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex flex-col h-screen border-r border-slate-800 bg-[#07090e]/95 backdrop-blur-md transition-all duration-300 lg:sticky lg:z-10
          ${isOpen ? 'w-64 translate-x-0' : 'w-20 lg:translate-x-0 -translate-x-full'}
        `}
      >
        {/* Brand/Logo Section */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            {isOpen && (
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent truncate">
                AeroSales
              </span>
            )}
          </div>

          {/* Desktop Toggle Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="hidden lg:flex items-center justify-center w-6 h-6 rounded-md border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700 hover:bg-slate-800 transition-all"
            title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  // Auto-close on mobile
                  if (window.innerWidth < 1024) {
                    setIsOpen(false);
                  }
                }}
                className={`flex items-center w-full gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/5 text-indigo-400 border-l-2 border-indigo-500 font-medium' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border-l-2 border-transparent'
                  }
                `}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105
                  ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-300'}
                `} />
                
                {isOpen && <span className="text-sm tracking-wide truncate">{item.label}</span>}
                
                {/* Tooltip for Collapsed State */}
                {!isOpen && (
                  <div className="absolute left-full ml-4 px-2.5 py-1.5 bg-slate-950 text-slate-200 text-xs rounded border border-slate-800 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 shadow-xl whitespace-nowrap">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Workspace info & Reset Button */}
        <div className="p-4 border-t border-slate-800/80">
          {isOpen ? (
            <div className="p-4 rounded-xl glass-card flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                <Database className="w-3.5 h-3.5" />
                Data Source
              </div>
              <div className="text-xs text-slate-400 truncate">
                Records: <span className="font-semibold text-indigo-400">{salesData.length}</span>
              </div>
              <button
                onClick={resetToMockData}
                className="w-full py-2 px-3 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700/50 hover:border-indigo-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                Reset to Mock Data
              </button>
              <button
                onClick={clearAllSalesRecords}
                className="w-full py-2 px-3 text-xs font-medium bg-rose-950/20 hover:bg-rose-900/35 text-rose-450 hover:text-rose-300 rounded-lg border border-rose-900/30 hover:border-rose-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                Clear Database
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <button
                onClick={resetToMockData}
                className="flex items-center justify-center w-12 h-12 mx-auto rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white hover:border-indigo-500/30 transition-all cursor-pointer group relative"
                title="Reset Data"
              >
                <Database className="w-5 h-5 group-hover:animate-pulse" />
                <div className="absolute left-full ml-4 px-2.5 py-1.5 bg-slate-950 text-slate-200 text-xs rounded border border-slate-800 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 shadow-xl whitespace-nowrap">
                  Reset Mock Data
                </div>
              </button>
              <button
                onClick={clearAllSalesRecords}
                className="flex items-center justify-center w-12 h-12 mx-auto rounded-xl bg-rose-950/20 border border-rose-900/30 text-rose-450 hover:text-rose-300 hover:border-rose-500/30 transition-all cursor-pointer group relative"
                title="Clear Database"
              >
                <Trash2 className="w-5 h-5 group-hover:animate-bounce" />
                <div className="absolute left-full ml-4 px-2.5 py-1.5 bg-slate-950 text-rose-300 text-xs rounded border border-slate-800 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 shadow-xl whitespace-nowrap">
                  Delete All Records
                </div>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
export default Sidebar;
