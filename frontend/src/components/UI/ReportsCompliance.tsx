import React, { useState } from 'react';
import { FileText, Download, Calendar, TrendingUp, AlertTriangle, CheckCircle, Filter, Search, BarChart3, Clock, Shield, Eye, Edit, Plus, RefreshCw, Mail, Share2 } from 'lucide-react';
import LLMRecommendations from './LLMRecommendations';

const ReportsCompliance: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('reports');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  const reports = [
    {
      id: 1,
      name: 'Monthly Food Safety Report',
      type: 'Safety',
      date: '2024-01-15',
      status: 'completed',
      size: '2.3 MB',
      format: 'PDF',
      description: 'Comprehensive food safety compliance report including temperature logs, hygiene checks, and staff training records.',
      generatedBy: 'John Doe',
      downloadCount: 12,
      lastViewed: '2024-01-16'
    },
    {
      id: 2,
      name: 'Waste Analysis Report',
      type: 'Sustainability',
      date: '2024-01-14',
      status: 'completed',
      size: '1.8 MB',
      format: 'PDF',
      description: 'Detailed waste tracking and analysis with cost breakdown and reduction recommendations.',
      generatedBy: 'Jane Smith',
      downloadCount: 8,
      lastViewed: '2024-01-15'
    },
    {
      id: 3,
      name: 'Inventory Compliance Report',
      type: 'Operations',
      date: '2024-01-13',
      status: 'completed',
      size: '3.1 MB',
      format: 'PDF',
      description: 'Inventory levels, supplier compliance, and stock rotation analysis.',
      generatedBy: 'Mike Johnson',
      downloadCount: 15,
      lastViewed: '2024-01-14'
    },
    {
      id: 4,
      name: 'Financial Performance Report',
      type: 'Finance',
      date: '2024-01-12',
      status: 'processing',
      size: '2.7 MB',
      format: 'PDF',
      description: 'Revenue analysis, cost breakdown, and profitability metrics.',
      generatedBy: 'Sarah Wilson',
      downloadCount: 6,
      lastViewed: '2024-01-13'
    },
    {
      id: 5,
      name: 'Staff Training Compliance',
      type: 'HR',
      date: '2024-01-11',
      status: 'completed',
      size: '1.5 MB',
      format: 'PDF',
      description: 'Staff training completion rates, certification status, and compliance tracking.',
      generatedBy: 'Alex Brown',
      downloadCount: 10,
      lastViewed: '2024-01-12'
    }
  ];

  const complianceItems = [
    {
      id: 1,
      requirement: 'Monthly Food Safety Inspection',
      status: 'compliant',
      lastCheck: '2024-01-10',
      nextDue: '2024-02-10',
      responsible: 'John Doe',
      priority: 'high',
      description: 'Complete food safety audit including temperature monitoring and hygiene practices'
    },
    {
      id: 2,
      requirement: 'Waste Disposal Documentation',
      status: 'compliant',
      lastCheck: '2024-01-08',
      nextDue: '2024-02-08',
      responsible: 'Jane Smith',
      priority: 'medium',
      description: 'Documentation of waste disposal procedures and environmental compliance'
    },
    {
      id: 3,
      requirement: 'Temperature Log Review',
      status: 'warning',
      lastCheck: '2024-01-05',
      nextDue: '2024-01-19',
      responsible: 'Mike Johnson',
      priority: 'high',
      description: 'Daily temperature monitoring and log verification for food safety'
    },
    {
      id: 4,
      requirement: 'Supplier Certification Update',
      status: 'overdue',
      lastCheck: '2023-12-15',
      nextDue: '2024-01-15',
      responsible: 'Sarah Wilson',
      priority: 'urgent',
      description: 'Annual supplier certification and compliance verification'
    },
    {
      id: 5,
      requirement: 'Fire Safety Inspection',
      status: 'compliant',
      lastCheck: '2024-01-12',
      nextDue: '2024-02-12',
      responsible: 'David Thompson',
      priority: 'high',
      description: 'Fire safety equipment inspection and emergency procedures review'
    }
  ];

  const reportTemplates = [
    { name: 'Food Safety Report', type: 'Safety', duration: '5 min' },
    { name: 'Waste Analysis Report', type: 'Sustainability', duration: '3 min' },
    { name: 'Financial Report', type: 'Finance', duration: '8 min' },
    { name: 'Inventory Report', type: 'Operations', duration: '4 min' },
    { name: 'Staff Training Report', type: 'HR', duration: '6 min' }
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
        return 'bg-green-100 text-green-800';
      case 'warning':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
      case 'processing':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleGenerateReport = async (template: any) => {
    setIsGenerating(true);
    // Simulate PDF generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsGenerating(false);
    console.log(`Generated ${template.name} report`);
  };

  const handleDownloadReport = (report: any) => {
    console.log(`Downloading ${report.name}`);
  };

  const handleViewReport = (report: any) => {
    setSelectedReport(report);
  };

  const totalReports = reports.length;
  const completedReports = reports.filter(r => r.status === 'completed').length;
  const totalCompliance = complianceItems.length;
  const compliantItems = complianceItems.filter(c => c.status === 'compliant').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Compliance</h1>
          <p className="text-gray-600 mt-1">Generate reports and monitor compliance requirements</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedTimeFilter}
            onChange={(e) => setSelectedTimeFilter(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
            <option value="custom">Custom Range</option>
          </select>
          <button 
            onClick={() => setActiveTab('generate')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">{totalReports}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-blue-600 mt-2">{completedReports} completed</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Compliance Rate</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round((compliantItems / totalCompliance) * 100)}%</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">{compliantItems}/{totalCompliance} compliant</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue Items</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-sm text-red-600 mt-2">Require attention</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Audit Score</p>
              <p className="text-2xl font-bold text-gray-900">92</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-purple-600 mt-2">Out of 100</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reports'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Reports
            </button>
            <button
              onClick={() => setActiveTab('compliance')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'compliance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Compliance
            </button>
            <button
              onClick={() => setActiveTab('generate')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'generate'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Generate
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {reports.map((report) => (
                  <div key={report.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{report.name}</h3>
                        <p className="text-sm text-gray-600">{report.description}</p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(report.status)}`}>
                        {report.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{report.date}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{report.size}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Download className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{report.downloadCount} downloads</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Last: {report.lastViewed}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Generated by: {report.generatedBy}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewReport(report)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDownloadReport(report)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requirement</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Check</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Due</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsible</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {complianceItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.requirement}</div>
                            <div className="text-sm text-gray-500">{item.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(item.status)}
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(item.status)}`}>
                              {item.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadge(item.priority)}`}>
                            {item.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.lastCheck}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.nextDue}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.responsible}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'generate' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reportTemplates.map((template, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                        <p className="text-sm text-gray-600">{template.type} Report</p>
                      </div>
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>Generation time: {template.duration}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleGenerateReport(template)}
                      disabled={isGenerating}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>Generate PDF</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Recommendations */}
      <LLMRecommendations section="reports-compliance" />
    </div>
  );
};

export default ReportsCompliance;