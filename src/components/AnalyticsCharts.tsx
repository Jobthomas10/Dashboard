import React, { useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// Custom Glowing Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3.5 bg-slate-950/95 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl">
        <p className="text-xs font-semibold text-slate-400 mb-2">{label}</p>
        {payload.map((p: any) => {
          const value = typeof p.value === 'number' 
            ? p.name === 'Orders' 
              ? p.value.toLocaleString() 
              : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p.value)
            : p.value;
            
          return (
            <div key={p.name} className="flex items-center justify-between gap-4 text-xs py-0.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
                <span className="text-slate-400 font-medium">{p.name}:</span>
              </div>
              <span className="text-white font-bold">{value}</span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

export const AnalyticsCharts: React.FC = () => {
  const { filteredData } = useDashboard();

  // 1. Aggregating Monthly Trend Data (Revenue, Profit, Order count)
  const monthlyData = useMemo(() => {
    const monthlyMap: { [key: string]: { monthKey: string, monthName: string, revenue: number, profit: number, orders: number } } = {};
    
    // Seed default baseline months (Jan to May 2026) to make sure they display cleanly
    const monthNames = ["Jan 2026", "Feb 2026", "Mar 2026", "Apr 2026", "May 2026"];
    const monthKeys = ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05"];
    
    monthKeys.forEach((key, i) => {
      monthlyMap[key] = {
        monthKey: key,
        monthName: monthNames[i],
        revenue: 0,
        profit: 0,
        orders: 0
      };
    });

    filteredData.forEach(r => {
      const monthKey = r.date.substring(0, 7); // "YYYY-MM"
      if (monthlyMap[monthKey]) {
        monthlyMap[monthKey].revenue += r.revenue;
        monthlyMap[monthKey].profit += r.profit;
        monthlyMap[monthKey].orders += 1;
      } else {
        // Fallback for custom CSV uploaded years/dates
        const parsedDate = new Date(r.date);
        const name = parsedDate.toLocaleString('default', { month: 'short' });
        const nameFull = `${name} ${parsedDate.getFullYear()}`;
        
        monthlyMap[monthKey] = {
          monthKey,
          monthName: nameFull,
          revenue: r.revenue,
          profit: r.profit,
          orders: 1
        };
      }
    });

    return Object.values(monthlyMap).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
  }, [filteredData]);

  // 2. Aggregating Top Products (Top 5 by Revenue)
  const topProductsData = useMemo(() => {
    const productMap: { [key: string]: number } = {};
    filteredData.forEach(r => {
      productMap[r.productName] = (productMap[r.productName] || 0) + r.revenue;
    });

    return Object.entries(productMap)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .reverse(); // reverse so highest is at the top of Recharts horizontal bar
  }, [filteredData]);

  // 3. Aggregating Sales by Category (Electronics, Apparel, Home, Software)
  const categoryData = useMemo(() => {
    const categoryMap: { [key: string]: { name: string, value: number, profit: number } } = {
      Electronics: { name: "Electronics", value: 0, profit: 0 },
      Apparel: { name: "Apparel", value: 0, profit: 0 },
      Home: { name: "Home", value: 0, profit: 0 },
      Software: { name: "Software", value: 0, profit: 0 }
    };

    filteredData.forEach(r => {
      if (categoryMap[r.category]) {
        categoryMap[r.category].value += r.revenue;
        categoryMap[r.category].profit += r.profit;
      }
    });

    return Object.values(categoryMap).filter(c => c.value > 0);
  }, [filteredData]);

  // Category Color Scheme Map matching custom classes
  const CATEGORY_COLORS = {
    Electronics: '#6366f1', // Indigo
    Apparel: '#f43f5e',     // Rose
    Home: '#10b981',        // Emerald
    Software: '#06b6d4'     // Cyan
  };

  const currencyFormatter = (value: number) => {
    return "₹" + (value >= 100000 ? (value / 100000).toFixed(1) + "L" : (value / 1000).toFixed(0) + "k");
  };

  return (
    <div className="space-y-6">
      
      {/* Top Row: Revenue Trends Area Chart & Category Pie Chart */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Revenue trends Area Chart (Takes 2 columns on desktop) */}
        <div className="p-6 rounded-2xl glass-card lg:col-span-2 flex flex-col justify-between min-h-[380px]">
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wide">Revenue & Profit Trends</h4>
            <p className="text-xs text-slate-400 mt-1">Monthly progression of total gross revenue versus net profit margins.</p>
          </div>
          
          <div className="h-64 mt-4 w-full">
            {filteredData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 font-medium">No sales recorded inside current filters.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="monthName" stroke="#475569" fontSize={10} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} tickFormatter={currencyFormatter} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                  <Area type="monotone" name="Revenue" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area type="monotone" name="Profit" dataKey="profit" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Category distribution Donut Chart (Takes 1 column) */}
        <div className="p-6 rounded-2xl glass-card flex flex-col justify-between min-h-[380px]">
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wide">Sales by Category</h4>
            <p className="text-xs text-slate-400 mt-1">Relative division of total revenue across sectors.</p>
          </div>
          
          <div className="h-64 mt-4 w-full relative flex items-center justify-center">
            {categoryData.length === 0 ? (
              <div className="text-xs text-slate-500 font-medium">No category records.</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryData.map((entry) => (
                        <Cell 
                          key={`cell-${entry.name}`} 
                          fill={CATEGORY_COLORS[entry.name as keyof typeof CATEGORY_COLORS] || '#cbd5e1'} 
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Donut Center Core Labels */}
                <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-extrabold text-white">
                    {categoryData.length}
                  </span>
                  <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    Categories
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Glowing Custom Legend */}
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-800/40">
            {categoryData.map(entry => (
              <div key={entry.name} className="flex items-center gap-2">
                <span 
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: CATEGORY_COLORS[entry.name as keyof typeof CATEGORY_COLORS] }} 
                />
                <span className="text-slate-400 truncate">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Monthly Sales Quantity Line Chart & Top Products Bar Chart */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Line Chart: Monthly transaction count */}
        <div className="p-6 rounded-2xl glass-card flex flex-col justify-between min-h-[350px]">
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wide">Monthly Order Volumes</h4>
            <p className="text-xs text-slate-400 mt-1">Transaction counts mapped across calendar periods.</p>
          </div>
          
          <div className="h-60 mt-4 w-full">
            {filteredData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 font-medium">No order volume.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="monthName" stroke="#475569" fontSize={10} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" name="Orders" dataKey="orders" stroke="#a855f7" strokeWidth={3} activeDot={{ r: 6 }} dot={{ strokeWidth: 2, r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Horizontal Bar Chart: Top Products */}
        <div className="p-6 rounded-2xl glass-card flex flex-col justify-between min-h-[350px]">
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wide">Top Products by Revenue</h4>
            <p className="text-xs text-slate-400 mt-1">Ranked comparison of top 5 products sold.</p>
          </div>
          
          <div className="h-60 mt-4 w-full">
            {topProductsData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 font-medium">No product revenue.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProductsData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" horizontal={false} />
                  <XAxis type="number" stroke="#475569" fontSize={10} tickLine={false} tickFormatter={currencyFormatter} />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} width={110} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar name="Revenue" dataKey="revenue" fill="#38bdf8" radius={[0, 4, 4, 0]} barSize={16}>
                    {topProductsData.map((_, i) => (
                      <Cell key={`cell-${i}`} fill={`url(#barGlow-${i})`} />
                    ))}
                  </Bar>
                  {/* Glowing linear gradient for bar fills */}
                  <defs>
                    {topProductsData.map((_, i) => (
                      <linearGradient key={`gradient-${i}`} id={`barGlow-${i}`} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#312e81" stopOpacity={0.4} />
                        <stop offset="70%" stopColor="#38bdf8" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity={1} />
                      </linearGradient>
                    ))}
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
export default AnalyticsCharts;
