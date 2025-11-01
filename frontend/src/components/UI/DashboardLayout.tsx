import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingDown, 
  Package, 
  Users, 
  FileText, 
  Settings, 
  Bell,
  Search,
  HelpCircle,
  LogOut,
  ChevronDown,
  BarChart3,
  Target,
  Briefcase,
  CreditCard
} from 'lucide-react';
import { supabase } from '../../supabaseClient';

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userData] = useState({
    name: 'Restaurant Manager',
    email: 'manager@restaurant.com',
    plan: 'Growth System'
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navigation = [
    {
      name: 'Overview',
      icon: LayoutDashboard,
      path: '/dashboard',
      active: location.pathname === '/dashboard'
    },
    {
      name: 'Waste Analytics',
      icon: TrendingDown,
      path: '/dashboard/waste',
      active: location.pathname.includes('/waste')
    },
    {
      name: 'Inventory',
      icon: Package,
      path: '/dashboard/inventory',
      active: location.pathname.includes('/inventory')
    },
    {
      name: 'Demand Forecast',
      icon: Target,
      path: '/dashboard/forecast',
      active: location.pathname.includes('/forecast')
    },
    {
      name: 'Staff Training',
      icon: Users,
      path: '/dashboard/staff',
      active: location.pathname.includes('/staff')
    },
    {
      name: 'Reports',
      icon: BarChart3,
      path: '/dashboard/reports',
      active: location.pathname.includes('/reports')
    },
    {
      name: 'Suppliers',
      icon: Briefcase,
      path: '/dashboard/suppliers',
      active: location.pathname.includes('/suppliers')
    }
  ];

  const accountNavigation = [
    {
      name: 'Billing',
      icon: CreditCard,
      path: '/dashboard/billing',
      active: location.pathname.includes('/billing')
    },
    {
      name: 'Settings',
      icon: Settings,
      path: '/dashboard/settings',
      active: location.pathname.includes('/settings')
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-neutral-200 z-40">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-neutral-200">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center space-x-3"
          >
            <div className="w-8 h-8 bg-primary-500 rounded flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <span className="text-lg font-bold text-neutral-900">Servora AI</span>
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="px-3 py-4 space-y-1 flex-1 overflow-y-auto">
          <div className="mb-1 px-3 py-2">
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Main</p>
          </div>
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${item.active 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-neutral-700 hover:bg-neutral-100'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </button>
            );
          })}

          {/* Account Section */}
          <div className="mt-6 mb-1 px-3 py-2">
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Account</p>
          </div>
          {accountNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${item.active 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-neutral-700 hover:bg-neutral-100'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-3 border-t border-neutral-200">
          
          {/* User Menu */}
          <div className="mt-2 relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-neutral-100 transition-all"
            >
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {userData.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-neutral-900 truncate">
                  {userData.name}
                </div>
                <div className="text-xs text-neutral-500 truncate">
                  {userData.plan}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-neutral-500" />
            </button>

            {userMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-neutral-200 rounded-lg shadow-elevated">
                <div className="py-2">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="ml-64">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-neutral-200 fixed top-0 right-0 left-64 z-30">
          <div className="h-full px-6 flex items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search waste data, inventory, reports..."
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 ml-6">
              <button className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
                <HelpCircle className="w-5 h-5" />
              </button>
              <button className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-cta-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="pt-16 min-h-screen">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}

