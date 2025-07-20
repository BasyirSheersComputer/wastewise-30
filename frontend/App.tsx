import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate
} from 'react-router-dom';
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
import Login from './components/Login';
import { supabase } from './supabaseClient';
import { useEffect } from 'react';

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

function Sidebar({ sidebarOpen, setSidebarOpen }: { sidebarOpen: boolean; setSidebarOpen: (v: boolean) => void }) {
  const location = useLocation();
  const [session, setSession] = React.useState<any>(null);
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => { listener?.subscription.unsubscribe(); };
  }, []);
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };
  return (
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
          const to = `/${item.id}`;
          const isActive = location.pathname === to;
          return (
            <Link
              key={item.id}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={`glass-nav-item w-full ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} className="mr-md" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
        {session && (
          <button
            onClick={handleLogout}
            className="glass-button w-full mt-lg"
          >
            Logout
          </button>
        )}
      </nav>
    </div>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<any>(null);
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => { listener?.subscription.unsubscribe(); };
  }, []);
  if (session === null) return null;
  if (!session) {
    window.location.href = '/';
    return null;
  }
  return <>{children}</>;
}

function useAutoLogout(timeoutMs: number = 30 * 60 * 1000) {
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
      }, timeoutMs);
    };
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();
    return () => {
      clearTimeout(timer);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [timeoutMs]);
}

function App() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  useAutoLogout();

  return (
    <Router basename={import.meta.env.BASE_URL}>
      <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

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
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
              <Route path="/inventory" element={<RequireAuth><InventoryManager /></RequireAuth>} />
              <Route path="/forecasting" element={<RequireAuth><DemandForecasting /></RequireAuth>} />
              <Route path="/waste" element={<RequireAuth><WasteTracking /></RequireAuth>} />
              <Route path="/suppliers" element={<RequireAuth><SupplierManager /></RequireAuth>} />
              <Route path="/menu" element={<RequireAuth><MenuOptimization /></RequireAuth>} />
              <Route path="/staff" element={<RequireAuth><StaffTraining /></RequireAuth>} />
              <Route path="/reports" element={<RequireAuth><ReportsCompliance /></RequireAuth>} />
            </Routes>
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
    </Router>
  );
}

export default App;