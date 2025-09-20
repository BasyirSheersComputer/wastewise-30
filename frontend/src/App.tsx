import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
  useNavigate,
} from "react-router-dom";
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
  X,
  CreditCard,
  Settings,
  Upload,
  Brain,
} from "lucide-react";
import Dashboard from "./components/UI/Dashboard";
import InventoryManager from "./components/UI/InventoryManager";
import DemandForecasting from "./components/UI/DemandForecasting";
import StatisticalInsights from "./components/UI/StatisticalInsights";
import WasteTracking from "./components/UI/WasteTracking";
import SupplierManager from "./components/UI/SupplierManager";
import MenuOptimization from "./components/UI/MenuOptimization";
import StaffTraining from "./components/UI/StaffTraining";
import ReportsCompliance from "./components/UI/ReportsCompliance";
import SubscriptionManager from "./components/UI/SubscriptionManager";
import CSVUpload from "./components/UI/CSVUpload";
import Login from "./components/Auth/Login";
import EmailConfirmation from "./components/Auth/EmailConfirmation";
import WelcomeToTrial from "./components/Auth/WelcomeToTrial";

import HomePage from "./components/Marketing/LandingPage";
import DetailedLandingPage from "./components/Marketing/DetailedLandingPage";
import GrandSlamOffer from "./components/Marketing/GrandSlamOffer";
import PricingPage from "./components/Marketing/PricingPage";
import CheckoutPage from "./components/Checkout/CheckoutPage";
import CheckoutSuccess from "./components/Checkout/CheckoutSuccess";
import Signup from "./components/Auth/Signup";
import OnboardingForm from "./components/Auth/OnboardingForm";
import TrialEnded from "./components/Auth/TrialEnded";

import { supabase } from "./supabaseClient";

import UserSettings from "./components/UI/UserSettings";
import IdleWarning from "./components/UI/IdleWarning";
import useIdleLogout from "./hooks/useIdleLogout";
import IssueReporting from "./components/UI/IssueReporting";
import ProductDemo from "./components/UI/ProductDemo";

const navigationItems = [
  { id: "dashboard", label: "Operational Intelligence", icon: BarChart3 },
  { id: "inventory", label: "Recipe & Inventory", icon: Package },
  { id: "forecasting", label: "Demand Forecasting", icon: TrendingUp },
  { id: "statistical-insights", label: "Statistical Insights", icon: Brain },
  { id: "waste", label: "Waste Tracking", icon: Trash2 },
  { id: "suppliers", label: "Suppliers", icon: Truck },
  { id: "menu", label: "Menu Optimization", icon: Menu },
  { id: "staff", label: "Staff Training", icon: Users },
  { id: "reports", label: "Reports & Compliance", icon: FileText },
  { id: "csv-upload", label: "CSV Upload", icon: Upload },
  { id: "issues", label: "Issue Reporting", icon: AlertTriangle },
  { id: "subscription", label: "My Subscription", icon: CreditCard },
  { id: "settings", label: "Settings", icon: Settings },
];

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span className="ml-3 text-text-secondary">Loading...</span>
    </div>
  );
}

function Sidebar({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [session, setSession] = React.useState<unknown>(null);
  const [loading, setLoading] = React.useState(true);
  const { extendSession } = useIdleLogout();
  
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // Redirect to login page after successful logout
      navigate('/login');
    } catch {
      // Still redirect to login even if there's an error
      navigate('/login');
    }
  };

  const handleNavClick = () => {
    setSidebarOpen(false);
    extendSession(); // Reset idle timer on navigation
  };
  
  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 glass-sidebar transform ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } transition-default lg:translate-x-0 lg:static lg:inset-0`}
    >
      <div className="flex items-center justify-between h-16 px-lg border-b border-border">
        <h1 className="text-lg font-semibold text-text-primary">
          WasteWise
        </h1>
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
              onClick={handleNavClick}
              className={`glass-nav-item w-full ${isActive ? "active" : ""}`}
            >
              <Icon size={18} className="mr-md" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
        {session && !loading && (
          <button onClick={handleLogout} className="glass-button w-full mt-lg">
            Logout
          </button>
        )}
      </nav>
    </div>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<unknown>(null);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { isIdle, timeUntilLogout, extendSession } = useIdleLogout();
  
  return (
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
            <h1 className="text-md font-semibold text-text-primary">
              WasteWise
            </h1>
            <div className="w-5" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-lg">
          {children}
        </main>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Idle Warning */}
      {isIdle && timeUntilLogout && (
        <IdleWarning
          timeUntilLogout={timeUntilLogout}
          onExtendSession={extendSession}
          onDismiss={() => {}} // Dismiss functionality can be added later
        />
      )}
    </div>
  );
}

function App() {

  return (
    <Router>
      <Routes>
        {/* Public Routes - No Sidebar */}
        <Route path="/" element={<HomePage />} />
        <Route path="/landing" element={<DetailedLandingPage />} />
        <Route path="/offer" element={<GrandSlamOffer />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/checkout/success" element={<CheckoutSuccess />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/email-confirmation" element={<EmailConfirmation />} />
        <Route path="/demo" element={<ProductDemo />} />

        {/* Onboarding/Trial - With Sidebar */}
        <Route
          path="/onboarding"
          element={
            <RequireAuth>
              <AuthenticatedLayout>
                <OnboardingForm />
              </AuthenticatedLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/trial-ended"
          element={
            <RequireAuth>
              <AuthenticatedLayout>
                <TrialEnded />
              </AuthenticatedLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/welcome-trial"
          element={
            <RequireAuth>
              <WelcomeToTrial />
            </RequireAuth>
          }
        />

        {/* Protected Routes - With Sidebar */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <AuthenticatedLayout>
                <Dashboard />
              </AuthenticatedLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/inventory"
          element={
            <RequireAuth>
              <AuthenticatedLayout>
                <InventoryManager />
              </AuthenticatedLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/forecasting"
          element={
            <RequireAuth>
              <AuthenticatedLayout>
                <DemandForecasting />
              </AuthenticatedLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/statistical-insights"
          element={
            <RequireAuth>
              <AuthenticatedLayout>
                <StatisticalInsights />
              </AuthenticatedLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/waste"
          element={
            <RequireAuth>
              <AuthenticatedLayout>
                <WasteTracking />
              </AuthenticatedLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/suppliers"
          element={
            <RequireAuth>
              <AuthenticatedLayout>
                <SupplierManager />
              </AuthenticatedLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/menu"
          element={
            <RequireAuth>
              <AuthenticatedLayout>
                <MenuOptimization />
              </AuthenticatedLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/staff"
          element={
            <RequireAuth>
              <AuthenticatedLayout>
                <StaffTraining />
              </AuthenticatedLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/reports"
          element={
            <RequireAuth>
              <AuthenticatedLayout>
                <ReportsCompliance />
              </AuthenticatedLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/csv-upload"
          element={
            <RequireAuth>
              <AuthenticatedLayout>
                <CSVUpload />
              </AuthenticatedLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/issues"
          element={
            <RequireAuth>
              <AuthenticatedLayout>
                <IssueReporting />
              </AuthenticatedLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireAuth>
              <AuthenticatedLayout>
                <UserSettings />
              </AuthenticatedLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/subscription"
          element={
            <RequireAuth>
              <AuthenticatedLayout>
                <SubscriptionManager />
              </AuthenticatedLayout>
            </RequireAuth>
          }
        />

        {/* 404 Fallback */}
        <Route
          path="*"
          element={
            <div className="p-lg text-error">404: Page Not Found</div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
