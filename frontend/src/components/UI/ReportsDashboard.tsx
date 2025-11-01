import React, { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  Plus,
  CheckCircle2,
  Clock,
  TrendingUp,
  BarChart3,
  PieChart,
  FileBarChart,
  Shield,
  AlertCircle
} from 'lucide-react';

export default function ReportsDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Report Metrics
  const metrics = [
    {
      id: 1,
      name: 'Reports Generated',
      value: '48',
      change: '+12',
      trend: 'up',
      icon: FileText,
      color: 'primary'
    },
    {
      id: 2,
      name: 'Compliance Rate',
      value: '98.5%',
      change: '+2.1%',
      trend: 'up',
      icon: Shield,
      color: 'success'
    },
    {
      id: 3,
      name: 'Data Accuracy',
      value: '96.2%',
      change: '+1.8%',
      trend: 'up',
      icon: CheckCircle2,
      color: 'success'
    },
    {
      id: 4,
      name: 'Time Saved',
      value: '22 hrs',
      change: '+5 hrs',
      trend: 'up',
      icon: Clock,
      color: 'primary'
    }
  ];

  // Report Templates
  const reportTemplates = [
    {
      id: 1,
      name: 'Monthly Waste Summary',
      category: 'Waste Management',
      frequency: 'Monthly',
      lastGenerated: '2 days ago',
      icon: PieChart,
      status: 'ready',
      description: 'Comprehensive waste analysis with cost breakdown'
    },
    {
      id: 2,
      name: 'Inventory Valuation',
      category: 'Inventory',
      frequency: 'Weekly',
      lastGenerated: 'Yesterday',
      icon: BarChart3,
      status: 'ready',
      description: 'Stock levels, value, and turnover analysis'
    },
    {
      id: 3,
      name: 'Compliance Checklist',
      category: 'Compliance',
      frequency: 'Daily',
      lastGenerated: 'Today',
      icon: Shield,
      status: 'ready',
      description: 'Food safety and regulatory compliance status'
    },
    {
      id: 4,
      name: 'Demand Forecast Accuracy',
      category: 'Forecasting',
      frequency: 'Weekly',
      lastGenerated: '3 days ago',
      icon: TrendingUp,
      status: 'ready',
      description: 'Prediction accuracy and variance analysis'
    },
    {
      id: 5,
      name: 'Staff Training Progress',
      category: 'Training',
      frequency: 'Monthly',
      lastGenerated: '5 days ago',
      icon: FileBarChart,
      status: 'generating',
      description: 'Team completion rates and certifications'
    },
    {
      id: 6,
      name: 'Cost Savings Analysis',
      category: 'Financial',
      frequency: 'Monthly',
      lastGenerated: '1 week ago',
      icon: TrendingUp,
      status: 'ready',
      description: 'Waste reduction impact on bottom line'
    }
  ];

  // Recent Reports
  const recentReports = [
    {
      id: 1,
      name: 'October 2025 Waste Summary',
      type: 'Monthly Waste Summary',
      generatedOn: 'Nov 1, 2025',
      size: '2.4 MB',
      format: 'PDF',
      status: 'completed'
    },
    {
      id: 2,
      name: 'Week 44 Inventory Report',
      type: 'Inventory Valuation',
      generatedOn: 'Oct 31, 2025',
      size: '1.8 MB',
      format: 'Excel',
      status: 'completed'
    },
    {
      id: 3,
      name: 'Daily Compliance Oct 31',
      type: 'Compliance Checklist',
      generatedOn: 'Oct 31, 2025',
      size: '856 KB',
      format: 'PDF',
      status: 'completed'
    },
    {
      id: 4,
      name: 'Forecast Accuracy Sept',
      type: 'Demand Forecast Accuracy',
      generatedOn: 'Oct 28, 2025',
      size: '3.1 MB',
      format: 'PDF',
      status: 'completed'
    }
  ];

  // Compliance Alerts
  const complianceAlerts = [
    {
      id: 1,
      title: 'Temperature Log Due',
      message: 'Daily refrigeration temperature log needs to be completed',
      priority: 'high',
      dueIn: '2 hours'
    },
    {
      id: 2,
      title: 'Staff Training Renewal',
      message: '3 staff certifications expire in 7 days',
      priority: 'medium',
      dueIn: '7 days'
    },
    {
      id: 3,
      title: 'Waste Report Submission',
      message: 'Monthly waste report due for regulatory submission',
      priority: 'high',
      dueIn: '3 days'
    }
  ];

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Reports & Compliance</h1>
          <p className="text-neutral-600 mt-1">Generate insights and maintain regulatory compliance</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium">
            <Plus className="w-4 h-4" />
            <span>Create Custom Report</span>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          
          return (
            <div key={metric.id} className="bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  metric.color === 'success' ? 'bg-success-50' : 'bg-primary-50'
                }`}>
                  <Icon className={`w-6 h-6 ${
                    metric.color === 'success' ? 'text-success-500' : 'text-primary-500'
                  }`} />
                </div>
                
                <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-success-50 text-success-700">
                  <TrendingUp className="w-3 h-3" />
                  <span>{metric.change}</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-neutral-600 mb-1">{metric.name}</h3>
                <p className="text-3xl font-bold text-neutral-900">{metric.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Templates & Compliance Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Templates */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-bold text-neutral-900 mb-4">Report Templates</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {reportTemplates.map((template) => {
              const Icon = template.icon;
              
              return (
                <div key={template.id} className="p-4 rounded-lg border border-neutral-200 hover:border-primary-500 hover:shadow-sm transition-all">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary-500" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-neutral-900 mb-1">{template.name}</h3>
                      <p className="text-xs text-neutral-500 mb-2">{template.description}</p>
                      
                      <div className="flex items-center gap-3 text-xs text-neutral-500">
                        <span>{template.category}</span>
                        <span>• {template.frequency}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                    <span className="text-xs text-neutral-500">Last: {template.lastGenerated}</span>
                    {template.status === 'ready' ? (
                      <button className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700">
                        <Download className="w-3 h-3" />
                        <span>Generate</span>
                      </button>
                    ) : (
                      <span className="text-xs text-warning">Generating...</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Compliance Alerts */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-bold text-neutral-900 mb-4">Compliance Alerts</h2>
          
          <div className="space-y-3">
            {complianceAlerts.map((alert) => (
              <div key={alert.id} className={`p-4 rounded-lg border-2 ${
                alert.priority === 'high' ? 'border-error/20 bg-error/5' : 'border-warning/20 bg-warning/5'
              }`}>
                <div className="flex items-start gap-3">
                  <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    alert.priority === 'high' ? 'text-error' : 'text-warning'
                  }`} />
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-neutral-900 mb-1">{alert.title}</h3>
                    <p className="text-xs text-neutral-600 mb-2">{alert.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-500">Due in {alert.dueIn}</span>
                      <button className={`text-xs font-medium ${
                        alert.priority === 'high' ? 'text-error' : 'text-warning'
                      }`}>
                        Complete →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Reports Table */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-bold text-neutral-900 mb-4">Recent Reports</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">Report Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">Generated</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">Format</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">Size</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">Status</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentReports.map((report) => (
                <tr key={report.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="text-sm font-medium text-neutral-900">{report.name}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-neutral-700">{report.type}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-neutral-600">{report.generatedOn}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-1 bg-neutral-100 text-neutral-700 text-xs rounded">
                      {report.format}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-neutral-600">{report.size}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex px-2 py-1 rounded text-xs font-medium bg-success-50 text-success-700">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Completed
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="flex items-center gap-1 px-3 py-1.5 text-primary-600 hover:bg-primary-50 rounded transition-colors text-sm font-medium">
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

