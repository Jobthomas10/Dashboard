import React, { useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { Users, Award, ShieldCheck, Gem } from 'lucide-react';

export const TopCustomersList: React.FC = () => {
  const { filteredData } = useDashboard();

  // Aggregate customer value metrics
  const customersList = useMemo(() => {
    const customerMap: { 
      [key: string]: { 
        name: string; 
        totalSpend: number; 
        orderCount: number; 
        categoriesMap: { [key: string]: number };
      } 
    } = {};

    filteredData.forEach(r => {
      if (!customerMap[r.customerName]) {
        customerMap[r.customerName] = {
          name: r.customerName,
          totalSpend: 0,
          orderCount: 0,
          categoriesMap: {}
        };
      }
      const client = customerMap[r.customerName];
      client.totalSpend += r.revenue;
      client.orderCount += 1;
      client.categoriesMap[r.category] = (client.categoriesMap[r.category] || 0) + 1;
    });

    return Object.values(customerMap)
      .map(c => {
        // Find most purchased category
        const favoriteCategory = Object.entries(c.categoriesMap)
          .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Electronics';
          
        return {
          name: c.name,
          totalSpend: c.totalSpend,
          orderCount: c.orderCount,
          favoriteCategory
        };
      })
      .sort((a, b) => b.totalSpend - a.totalSpend)
      .slice(0, 6); // Display top 6 VIP clients
  }, [filteredData]);

  // Max spend baseline to calculate relative progress bar weights
  const maxSpend = useMemo(() => {
    if (customersList.length === 0) return 1;
    return Math.max(...customersList.map(c => c.totalSpend));
  }, [customersList]);

  // Generate beautiful avatars with deterministic gradient colors
  const getAvatarStyles = (name: string) => {
    const code = name.charCodeAt(0) + (name.charCodeAt(1) || 0);
    const gradients = [
      "from-indigo-500 to-purple-500 shadow-indigo-500/20",
      "from-cyan-500 to-blue-500 shadow-cyan-500/20",
      "from-emerald-500 to-teal-500 shadow-emerald-500/20",
      "from-pink-500 to-rose-500 shadow-pink-500/20",
      "from-amber-500 to-orange-500 shadow-amber-500/20"
    ];
    return gradients[code % gradients.length];
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="p-6 rounded-2xl glass-card flex flex-col justify-between min-h-[480px]">
      
      {/* Title Header */}
      <div className="pb-6 border-b border-slate-800/60 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-white tracking-wide">Top Client Accounts</h4>
          <p className="text-xs text-slate-400 mt-1">Ranking highest spending customers in current dataset.</p>
        </div>
        <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
          <Gem className="w-5 h-5 text-indigo-400" />
        </div>
      </div>

      {/* Customers List Container */}
      <div className="flex-1 mt-6 space-y-5">
        {customersList.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-xs text-slate-500 font-medium gap-2">
            <Users className="w-8 h-8 text-slate-750" />
            No customer accounts found matching filters.
          </div>
        ) : (
          customersList.map((client, idx) => (
            <div 
              key={client.name}
              className="flex items-center gap-4 group p-1.5 rounded-xl hover:bg-slate-900/15 transition-all"
            >
              
              {/* Ranking Number or Leader Badge */}
              <div className="flex-shrink-0 w-6 text-center text-xs font-extrabold text-slate-500 group-hover:text-indigo-400 transition-colors">
                {idx === 0 ? (
                  <Award className="w-5 h-5 mx-auto text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
                ) : idx === 1 ? (
                  <ShieldCheck className="w-5 h-5 mx-auto text-slate-300" />
                ) : (
                  `#${idx + 1}`
                )}
              </div>

              {/* Glowing Initial Avatar */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-tr flex items-center justify-center text-white text-xs font-bold shadow-md ${getAvatarStyles(client.name)}`}>
                {getInitials(client.name)}
              </div>

              {/* Customer Spending Info & Progress Bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
                    {client.name}
                  </span>
                  <span className="text-xs font-extrabold text-white">
                    {formatCurrency(client.totalSpend)}
                  </span>
                </div>

                {/* relative progress bar */}
                <div className="mt-2 w-full bg-slate-900/80 rounded-full h-1.5 overflow-hidden border border-white/5 relative">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${(client.totalSpend / maxSpend) * 100}%` }}
                  />
                </div>

                {/* Sub-label indicators */}
                <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                  <span>{client.orderCount} orders placed</span>
                  <span className="text-indigo-400/80">{client.favoriteCategory} buyer</span>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};
export default TopCustomersList;
