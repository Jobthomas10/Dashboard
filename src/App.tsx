import React, { useState } from 'react';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import KPICards from './components/KPICards';
import AnalyticsCharts from './components/AnalyticsCharts';
import RecentOrdersTable from './components/RecentOrdersTable';
import TopCustomersList from './components/TopCustomersList';
import QuickAddForm from './components/QuickAddForm';

const DashboardContent: React.FC = () => {
  const { activeTab } = useDashboard();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* High Impact summary KPIs */}
            <KPICards />
            
            {/* Visual analytics charts */}
            <AnalyticsCharts />
            
            {/* Detailed tables split panel */}
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <RecentOrdersTable />
              </div>
              <div className="space-y-6">
                <TopCustomersList />
                <QuickAddForm />
              </div>
            </div>
          </div>
        );
      
      case 'analytics':
        return (
          <div className="space-y-6">
            <KPICards />
            <AnalyticsCharts />
          </div>
        );
        
      case 'orders':
        return (
          <div className="space-y-6">
            <RecentOrdersTable />
          </div>
        );
        
      case 'customers':
        return (
          <div className="space-y-6">
            <TopCustomersList />
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#07090e] text-slate-100">
      
      {/* Collapsible Responsive Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {/* Main Panel Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header containing Filters & CSV importer controls */}
        <Header onMobileMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        {/* Main Content viewport */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-[1600px] w-full mx-auto">
          {renderActiveTabContent()}
        </main>
        
        {/* Footer */}
        <footer className="py-6 px-6 text-center text-xs text-slate-500 border-t border-slate-900 bg-slate-950/20">
          <p>© 2026 AeroSales SaaS Metrics. Fully local sandbox. Built with Tailwind CSS v4 & Recharts.</p>
        </footer>
        
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
};

export default App;
