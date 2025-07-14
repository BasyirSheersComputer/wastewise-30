import React, { useState } from 'react';
import { 
  BarChart3, 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  FileText, 
  Truck, 
  Trash2,
  Menu,
  X
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import InventoryManager from './components/InventoryManager';
import DemandForecasting from './components/DemandForecasting';
import WasteTracking from './components/WasteTracking';
import SupplierManager from './components/SupplierManager';
import MenuOptimization from './components/MenuOptimization';
import StaffTraining from './components/StaffTraining';
import ReportsCompliance from './components/ReportsCompliance';

type ActiveView = 'dashboard' | 'inventory' | 'forecasting' | 'waste' | 'suppliers' | 'menu' | 'staff' | 'reports';

function App() {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'forecasting', label: 'Demand Forecasting', icon: TrendingUp },
    { id: 'waste', label: 'Waste Tracking', icon: Trash2 },
    { id: 'suppliers', label: 'Suppliers', icon: Truck },
    { id: 'menu', label: 'Menu Optimization', icon: Menu },
    { id: 'staff', label: 'Staff Training', icon: Users },
    { id: 'reports', label: 'Reports & Compliance', icon: FileText },
  ];

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return <InventoryManager />;
      case 'forecasting':
        return <DemandForecasting />;
      case 'waste':
        return <WasteTracking />;
      case 'suppliers':
        return <SupplierManager />;
      case 'menu':
        return <MenuOptimization />;
      case 'staff':
        return <StaffTraining />;
      case 'reports':
        return <ReportsCompliance />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 glass-sidebar transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-default lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-lg border-b border-border">
          <h1 className="text-lg font-semibold text-text-primary">F&B Operations</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-text-secondary hover:text-text-primary transition-default"
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="mt-lg px-sm">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id as ActiveView);
                  setSidebarOpen(false);
                }}
                className={`glass-nav-item w-full ${
                  activeView === item.id ? 'active' : ''
                }`}
              >
                <Icon size={18} className="mr-md" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header */}
        <header className="glass-card border-b border-border lg:hidden">
          <div className="flex items-center justify-between h-16 px-lg">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-text-secondary hover:text-text-primary transition-default"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-md font-semibold text-text-primary">F&B Operations</h1>
            <div className="w-5" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-lg">
          {renderActiveView()}
        </main>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default App;