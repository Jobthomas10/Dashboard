import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Percent, 
  ArrowUpRight, 
  ArrowDownRight,
  Coins
} from 'lucide-react';

export const KPICards: React.FC = () => {
  const { kpis } = useDashboard();

  // Currency formatter helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const percentageFormatter = (val: number) => {
    return `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`;
  };

  const cardsData = [
    {
      id: "revenue",
      title: "Total Revenue",
      value: formatCurrency(kpis.totalRevenue),
      subtext: `From ${kpis.orderCount} total orders`,
      icon: DollarSign,
      glowClass: "border-b-2 border-cyan-500/80 shadow-[0_4px_25px_-5px_rgba(6,182,212,0.15)]",
      iconColor: "text-cyan-400 bg-cyan-500/10",
      pillContent: null
    },
    {
      id: "profit",
      title: "Total Profit",
      value: formatCurrency(kpis.totalProfit),
      subtext: `Implied margin rate`,
      icon: Coins,
      glowClass: "border-b-2 border-emerald-500/80 shadow-[0_4px_25px_-5px_rgba(16,185,129,0.15)]",
      iconColor: "text-emerald-400 bg-emerald-500/10",
      pillContent: (
        <span className="flex items-center gap-0.5 px-2 py-0.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
          {kpis.profitMargin.toFixed(1)}% Margin
        </span>
      )
    },
    {
      id: "growth",
      title: "Monthly Sales Growth",
      value: percentageFormatter(kpis.monthlyGrowth),
      subtext: "Compared to previous period",
      icon: kpis.monthlyGrowth >= 0 ? TrendingUp : TrendingDown,
      glowClass: "border-b-2 border-indigo-500/80 shadow-[0_4px_25px_-5px_rgba(99,102,241,0.15)]",
      iconColor: kpis.monthlyGrowth >= 0 ? "text-indigo-400 bg-indigo-500/10" : "text-rose-400 bg-rose-500/10",
      pillContent: (
        <span className={`flex items-center gap-0.5 px-2 py-0.5 text-xs font-semibold rounded-md border
          ${kpis.monthlyGrowth >= 0 
            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
            : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
          }
        `}>
          {kpis.monthlyGrowth >= 0 ? (
            <ArrowUpRight className="w-3.5 h-3.5" />
          ) : (
            <ArrowDownRight className="w-3.5 h-3.5" />
          )}
          {Math.abs(kpis.monthlyGrowth).toFixed(0)}%
        </span>
      )
    },
    {
      id: "conversion",
      title: "Conversion Rate",
      value: `${kpis.conversionRate.toFixed(2)}%`,
      subtext: `Active visitor sessions`,
      icon: Percent,
      glowClass: "border-b-2 border-violet-500/80 shadow-[0_4px_25px_-5px_rgba(139,92,246,0.15)]",
      iconColor: "text-violet-400 bg-violet-500/10",
      pillContent: (
        <span className="flex items-center gap-0.5 px-2 py-0.5 text-xs font-semibold text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-md">
          SaaS Opt
        </span>
      )
    }
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {cardsData.map((card) => {
        const Icon = card.icon;
        
        return (
          <div 
            key={card.id}
            className={`p-6 rounded-2xl glass-card relative overflow-hidden flex flex-col justify-between ${card.glowClass}`}
          >
            {/* Background Glow Overlay */}
            <div className="absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 rounded-full bg-slate-900/10 opacity-30 blur-2xl" />

            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {card.title}
                </span>
                <h3 className="mt-2 text-2xl font-bold tracking-tight text-white md:text-3xl">
                  {card.value}
                </h3>
              </div>

              {/* Icon Capsule */}
              <div className={`p-2.5 rounded-xl border border-white/5 ${card.iconColor}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            {/* Sparkline track or Info row */}
            <div className="mt-6 flex items-center justify-between gap-2 border-t border-slate-800/40 pt-4">
              <span className="text-xs font-medium text-slate-500 truncate">
                {card.subtext}
              </span>
              
              {/* Conditional Pill Badge */}
              {card.pillContent}
            </div>

            {/* Extra Progress bar for conversion for added wow factor */}
            {card.id === 'conversion' && (
              <div className="mt-3 w-full bg-slate-900 rounded-full h-1 overflow-hidden border border-white/5">
                <div 
                  className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${(kpis.conversionRate / 5) * 100}%` }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
export default KPICards;
