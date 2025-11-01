import React, { useState } from 'react';
import {
  User,
  Building,
  Bell,
  Shield,
  CreditCard,
  Key,
  Mail,
  Phone,
  MapPin,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function SettingsDashboard() {
  const [activeTab, setActiveTab] = useState('profile');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Tabs
  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'company', label: 'Company', icon: Building },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard }
  ];

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>
          <p className="text-neutral-600 mt-1">Manage your account and preferences</p>
        </div>
        
        {saveSuccess && (
          <div className="flex items-center gap-2 px-4 py-2 bg-success-50 text-success-700 rounded-lg border border-success-200">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-medium">Changes saved successfully</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-neutral-200">
        <div className="border-b border-neutral-200">
          <nav className="flex gap-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-700'
                      : 'border-transparent text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 mb-4">Personal Information</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">Full Name</label>
                    <input
                      type="text"
                      defaultValue="Restaurant Manager"
                      className="input-field w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="label">Email Address</label>
                    <input
                      type="email"
                      defaultValue="manager@restaurant.com"
                      className="input-field w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="label">Phone Number</label>
                    <input
                      type="tel"
                      defaultValue="+60 12-345-6789"
                      className="input-field w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="label">Role</label>
                    <select className="input-field w-full">
                      <option>Manager</option>
                      <option>Owner</option>
                      <option>Staff</option>
                      <option>Admin</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-neutral-200">
                <h3 className="text-md font-bold text-neutral-900 mb-4">Profile Picture</h3>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">R</span>
                  </div>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-medium">
                      Change Photo
                    </button>
                    <button className="px-4 py-2 text-error hover:bg-error/5 rounded-lg transition-colors text-sm font-medium">
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-neutral-200">
                <button className="px-6 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-medium">
                  Cancel
                </button>
                <button onClick={handleSave} className="btn-primary px-6 py-2 text-sm">
                  <Save className="w-4 h-4 inline mr-2" />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Company Tab */}
          {activeTab === 'company' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 mb-4">Company Details</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="label">Company Name</label>
                    <input
                      type="text"
                      defaultValue="My Restaurant Chain"
                      className="input-field w-full"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="label">Business Address</label>
                    <input
                      type="text"
                      defaultValue="123 Jalan Bukit Bintang, Kuala Lumpur"
                      className="input-field w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="label">City</label>
                    <input
                      type="text"
                      defaultValue="Kuala Lumpur"
                      className="input-field w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="label">Postcode</label>
                    <input
                      type="text"
                      defaultValue="50200"
                      className="input-field w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="label">Number of Outlets</label>
                    <input
                      type="number"
                      defaultValue="8"
                      className="input-field w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="label">Industry Type</label>
                    <select className="input-field w-full">
                      <option>Coffee Shop</option>
                      <option>Restaurant</option>
                      <option>Fast Food</option>
                      <option>Hotel F&B</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-neutral-200">
                <button className="px-6 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-medium">
                  Cancel
                </button>
                <button onClick={handleSave} className="btn-primary px-6 py-2 text-sm">
                  <Save className="w-4 h-4 inline mr-2" />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 mb-4">Notification Preferences</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-neutral-200">
                    <div>
                      <h3 className="text-sm font-medium text-neutral-900">Low Stock Alerts</h3>
                      <p className="text-xs text-neutral-600 mt-1">Get notified when items reach reorder point</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border border-neutral-200">
                    <div>
                      <h3 className="text-sm font-medium text-neutral-900">Waste Reduction Milestones</h3>
                      <p className="text-xs text-neutral-600 mt-1">Celebrate when you hit waste reduction targets</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border border-neutral-200">
                    <div>
                      <h3 className="text-sm font-medium text-neutral-900">Compliance Reminders</h3>
                      <p className="text-xs text-neutral-600 mt-1">Daily reminders for compliance tasks</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border border-neutral-200">
                    <div>
                      <h3 className="text-sm font-medium text-neutral-900">Weekly Summary Reports</h3>
                      <p className="text-xs text-neutral-600 mt-1">Receive weekly performance summaries via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border border-neutral-200">
                    <div>
                      <h3 className="text-sm font-medium text-neutral-900">Staff Training Updates</h3>
                      <p className="text-xs text-neutral-600 mt-1">Notifications about team training progress</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-neutral-200">
                <button className="px-6 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-medium">
                  Reset to Default
                </button>
                <button onClick={handleSave} className="btn-primary px-6 py-2 text-sm">
                  <Save className="w-4 h-4 inline mr-2" />
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 mb-4">Change Password</h2>
                
                <div className="space-y-4 max-w-xl">
                  <div>
                    <label className="label">Current Password</label>
                    <input
                      type="password"
                      className="input-field w-full"
                      placeholder="Enter current password"
                    />
                  </div>
                  
                  <div>
                    <label className="label">New Password</label>
                    <input
                      type="password"
                      className="input-field w-full"
                      placeholder="Enter new password"
                    />
                  </div>
                  
                  <div>
                    <label className="label">Confirm New Password</label>
                    <input
                      type="password"
                      className="input-field w-full"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-neutral-200">
                <h3 className="text-md font-bold text-neutral-900 mb-4">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between p-4 rounded-lg border border-neutral-200 max-w-xl">
                  <div>
                    <h4 className="text-sm font-medium text-neutral-900">Enable 2FA</h4>
                    <p className="text-xs text-neutral-600 mt-1">Add an extra layer of security to your account</p>
                  </div>
                  <button className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-medium">
                    Setup
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-neutral-200">
                <button className="px-6 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-medium">
                  Cancel
                </button>
                <button onClick={handleSave} className="btn-primary px-6 py-2 text-sm">
                  <Save className="w-4 h-4 inline mr-2" />
                  Update Password
                </button>
              </div>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 mb-4">Current Plan</h2>
                
                <div className="p-6 rounded-lg border-2 border-primary-500 bg-primary-50 max-w-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-neutral-900">Growth System</h3>
                      <p className="text-sm text-neutral-600 mt-1">Full platform access with dedicated success manager</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-neutral-900">RM 5,997</div>
                      <div className="text-sm text-neutral-600">/month</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 text-sm">
                    <button className="flex-1 py-2 px-4 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors font-medium">
                      Change Plan
                    </button>
                    <button className="flex-1 py-2 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium">
                      Upgrade to Enterprise
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-neutral-200">
                <h3 className="text-md font-bold text-neutral-900 mb-4">Payment Method</h3>
                
                <div className="space-y-3 max-w-2xl">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-neutral-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 bg-neutral-900 rounded flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-900">•••• •••• •••• 4242</p>
                        <p className="text-xs text-neutral-500">Expires 12/2026</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-medium">
                      Update
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-neutral-200">
                <h3 className="text-md font-bold text-neutral-900 mb-4">Billing History</h3>
                
                <div className="space-y-2 max-w-2xl">
                  {[
                    { date: 'Nov 1, 2025', amount: 'RM 5,997', status: 'Paid' },
                    { date: 'Oct 1, 2025', amount: 'RM 5,997', status: 'Paid' },
                    { date: 'Sep 1, 2025', amount: 'RM 5,997', status: 'Paid' }
                  ].map((invoice, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-neutral-200">
                      <div className="flex items-center gap-4">
                        <CheckCircle2 className="w-4 h-4 text-success-500" />
                        <div>
                          <p className="text-sm font-medium text-neutral-900">{invoice.date}</p>
                          <p className="text-xs text-neutral-500">Invoice #{1000 + idx}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-neutral-900">{invoice.amount}</span>
                        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

