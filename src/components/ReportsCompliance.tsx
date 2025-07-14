import React, { useState } from 'react';
import { FileText, Download, Calendar, TrendingUp, AlertTriangle, CheckCircle, Filter, Search } from 'lucide-react';

const ReportsCompliance: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [activeTab, setActiveTab] = useState('reports');

  const reports = [
    {
      id: 1,
      name: 'Monthly Food Safety Report',
      type: 'Safety',
      date: '2024-01-15',
      status: 'completed',
      size: '2.3 MB',
      format: 'PDF'
    },
    {
      id: 2,
      name: 'Waste Analysis Report',
      type: 'Sustainability',
      date: '2024-01-14',
      status: 'completed',
      size: '1.8 MB',
      format: 'PDF'
    },
    {
      id: 3,
      name: 'Inventory Compliance Report',
      type: 'Operations',
      date: '2024-01-13',
      status: 'completed',
      size: '3.1 MB',
      format: 'PDF'
    },
    {
      id: 4,
      name: 'Financial Performance Report',
      type: 'Finance',
      date: '2024-01-12',
      status: 'processing',
      size: '2.7 MB',
      format: 'PDF'
    }
  ];

  const complianceItems = [
    {
      id: 1,
      requirement: 'Monthly Food Safety Inspection',
      status: 'compliant',
      lastCheck: '2024-01-10',
      nextDue: '2024-02-10',
      responsible: 'John Doe'
    },
    {
      id: 2,
      requirement: 'Waste Disposal Documentation',
      status: 'compliant',
      lastCheck: '2024-01-08',
      nextDue: '2024-02-08',
      responsible: 'Jane Smith'
    },
    {
      id: 3,
      requirement: 'Temperature Log Review',
      status: 'warning',
      lastCheck: '2024-01-05',
      nextDue: '2024-01-19',
      responsible: 'Mike Johnson'
    },
    {
      id: 4,
      requirement: 'Supplier Certification Update',
      status: 'overdue',
      lastCheck: '2023-12-15',
      nextDue: '2024-01-15',
      responsible: 'Sarah Wilson'
    }
  ];

  const kpiData = [
    { metric: 'Compliance Rate', value: '94%', change: '+2%', trend: 'up' },
    { metric: 'Generated Reports', value: '28', change: '+5', trend: 'up' },
    { metric: 'Overdue Items', value: '3', change: '-1', trend: 'down' },
    { metric: 'Audit Score', value: '92', change: '+4', trend: 'up' }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'compliant':
      case 'completed':
        return 'glass-badge-success';
      case 'warning':
      case 'processing':
        return 'glass-badge-warning';
      case 'overdue':
        return 'glass-badge-error';
      default:
        return 'glass-badge-info';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
      case 'completed':
        return <CheckCircle size={14} className="text-success" />;
      case 'warning':
      case 'processing':
        return <AlertTriangle size={14} className="text-warning" />;
      case 'overdue':
        return <AlertTriangle size={14} className="text-error" />;
      default:
        return <AlertTriangle size={14} className="text-text-secondary" />;
    }
  };

  return (
    <div className="space-y-lg">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text-primary">Reports & Compliance</h1>
        <div className="flex space-x-md">
          <select
            className="glass-input"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button className="glass-button">
            Generate Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-lg">
        {kpiData.map((kpi, index) => (
          <div key={index} className="glass-card p-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">{kpi.metric}</p>
                <p className="text-xl font-semibold text-text-primary">{kpi.value}</p>
              </div>
              <div className="flex items-center">
                {kpi.trend === 'up' ? (
                  <TrendingUp className="text-success" size={20} />
                ) : (
                  <TrendingUp className="text-error transform rotate-180" size={20} />
                )}
              </div>
            </div>
            <p className={`text-sm mt-sm ${kpi.trend === 'up' ? 'text-success' : 'text-error'}`}>
              {kpi.change} from last period
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="glass-card">
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-lg">
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-md px-xs border-b-2 font-medium text-sm transition-default ${
                activeTab === 'reports'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Reports
            </button>
            <button
              onClick={() => setActiveTab('compliance')}
              className={`py-md px-xs border-b-2 font-medium text-sm transition-default ${
                activeTab === 'compliance'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Compliance
            </button>
          </nav>
        </div>

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="p-lg">
            <div className="flex items-center justify-between mb-lg">
              <div className="flex items-center space-x-md">
                <div className="relative">
                  <Search className="absolute left-md top-1/2 transform -translate-y-1/2 text-text-secondary" size={16} />
                  <input
                    type="text"
                    placeholder="Search reports..."
                    className="glass-input pl-10"
                  />
                </div>
                <button className="glass-button-secondary flex items-center space-x-sm">
                  <Filter size={16} />
                  <span>Filter</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
              {reports.map((report) => (
                <div key={report.id} className="border border-border rounded-md p-lg hover:shadow-card transition-default">
                  <div className="flex items-start justify-between mb-md">
                    <div className="flex items-center">
                      <FileText className="text-primary mr-md" size={20} />
                      <div>
                        <h3 className="text-sm font-medium text-text-primary">{report.name}</h3>
                        <p className="text-xs text-text-secondary">{report.type}</p>
                      </div>
                    </div>
                    {getStatusIcon(report.status)}
                  </div>

                  <div className="space-y-sm mb-md">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Date:</span>
                      <span className="text-text-primary">{report.date}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Size:</span>
                      <span className="text-text-primary">{report.size}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Format:</span>
                      <span className="text-text-primary">{report.format}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`${getStatusBadge(report.status)}`}>
                      {report.status}
                    </span>
                    <button className="flex items-center space-x-xs text-primary hover:text-primary-hover transition-default">
                      <Download size={14} />
                      <span className="text-sm">Download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compliance Tab */}
        {activeTab === 'compliance' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="glass-table-header">
                <tr>
                  <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Requirement
                  </th>
                  <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Last Check
                  </th>
                  <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Next Due
                  </th>
                  <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Responsible
                  </th>
                  <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {complianceItems.map((item) => (
                  <tr key={item.id} className="hover:bg-white/40 transition-default">
                    <td className="px-lg py-md whitespace-nowrap">
                      <div className="text-sm font-medium text-text-primary">{item.requirement}</div>
                    </td>
                    <td className="px-lg py-md whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(item.status)}
                        <span className={`ml-sm ${getStatusBadge(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-lg py-md whitespace-nowrap text-sm text-text-primary">
                      {item.lastCheck}
                    </td>
                    <td className="px-lg py-md whitespace-nowrap text-sm text-text-primary">
                      {item.nextDue}
                    </td>
                    <td className="px-lg py-md whitespace-nowrap text-sm text-text-primary">
                      {item.responsible}
                    </td>
                    <td className="px-lg py-md whitespace-nowrap text-sm text-text-primary">
                      <div className="flex space-x-sm">
                        <button className="text-primary hover:text-primary-hover transition-default">Update</button>
                        <button className="text-success hover:opacity-80 transition-default">Complete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Compliance Summary */}
      <div className="glass-card p-lg">
        <h3 className="text-md font-semibold text-text-primary mb-md">Compliance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-success/10 rounded-lg flex items-center justify-center mb-sm">
              <CheckCircle size={32} className="text-success" />
            </div>
            <p className="text-xl font-semibold text-text-primary">12</p>
            <p className="text-sm text-text-secondary">Compliant Items</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-warning/10 rounded-lg flex items-center justify-center mb-sm">
              <AlertTriangle size={32} className="text-warning" />
            </div>
            <p className="text-xl font-semibold text-text-primary">2</p>
            <p className="text-sm text-text-secondary">Warning Items</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-error/10 rounded-lg flex items-center justify-center mb-sm">
              <AlertTriangle size={32} className="text-error" />
            </div>
            <p className="text-xl font-semibold text-text-primary">1</p>
            <p className="text-sm text-text-secondary">Overdue Items</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsCompliance;