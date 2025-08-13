import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bug, 
  Lightbulb, 
  Layout, 
  Zap, 
  Database, 
  Link, 
  CreditCard, 
  HelpCircle,
  Plus,
  Search,
  Filter,
  MessageSquare,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  FileText,
  Upload,
  Calendar,
  User,
  Building
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import apiService from '../../services/api';

interface Issue {
  id: string;
  title: string;
  description: string;
  category: {
    name: string;
    description: string;
    icon: string;
    color: string;
  };
  priority: {
    name: string;
    description: string;
    color: string;
  };
  status: {
    name: string;
    description: string;
    color: string;
  };
  outlet?: {
    outlet_name: string;
    address: string;
  };
  created_at: string;
  updated_at: string;
  comments: any[];
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface Priority {
  id: string;
  name: string;
  description: string;
  color: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  template_content: string;
  category: Category;
  priority: Priority;
}

interface Outlet {
  id: string;
  outlet_name: string;
  address: string;
  city: string;
  state: string;
}

export default function IssueReporting() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    outletId: ''
  });

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    priorityId: '',
    outletId: '',
    attachments: [] as File[]
  });

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
    } else {
      navigate('/login');
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load all data in parallel
      const [issuesRes, categoriesRes, prioritiesRes, templatesRes, outletsRes, statsRes] = await Promise.all([
        apiService.get('/issues', { params: filters }),
        apiService.get('/issues/categories'),
        apiService.get('/issues/priorities'),
        apiService.get('/issues/templates'),
        apiService.get('/issues/outlets'),
        apiService.get('/issues/stats/overview')
      ]);

      setIssues(issuesRes.issues || []);
      setCategories(categoriesRes.categories || []);
      setPriorities(prioritiesRes.priorities || []);
      setTemplates(templatesRes.templates || []);
      setOutlets(outletsRes.outlets || []);
      setStats(statsRes.stats || {});
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const issueData = {
        ...formData,
        browserInfo: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform
        },
        deviceInfo: {
          screenWidth: window.screen.width,
          screenHeight: window.screen.height,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight
        },
        pageUrl: window.location.href,
        userAgent: navigator.userAgent,
        screenResolution: `${window.screen.width}x${window.screen.height}`
      };

      const response = await apiService.post('/issues', issueData);
      
      setIssues([response.issue, ...issues]);
      setShowCreateForm(false);
      setFormData({
        title: '',
        description: '',
        categoryId: '',
        priorityId: '',
        outletId: '',
        attachments: []
      });
      
      // Reload stats
      const statsRes = await apiService.get('/issues/stats/overview');
      setStats(statsRes.stats);
    } catch (error) {
      console.error('Error creating issue:', error);
    }
  };

  const handleTemplateSelect = (template: Template) => {
    setFormData({
      ...formData,
      categoryId: template.category.id,
      priorityId: template.priority.id,
      description: template.template_content
    });
  };

  const getCategoryIcon = (iconName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      bug: <Bug className="w-4 h-4" />,
      feature_request: <Lightbulb className="w-4 h-4" />,
      ui_ux: <Layout className="w-4 h-4" />,
      performance: <Zap className="w-4 h-4" />,
      data: <Database className="w-4 h-4" />,
      integration: <Link className="w-4 h-4" />,
      billing: <CreditCard className="w-4 h-4" />,
      general: <HelpCircle className="w-4 h-4" />
    };
    return iconMap[iconName] || <FileText className="w-4 h-4" />;
  };

  const getStatusIcon = (statusName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      open: <AlertCircle className="w-4 h-4" />,
      in_progress: <Clock className="w-4 h-4" />,
      waiting_for_user: <MessageSquare className="w-4 h-4" />,
      resolved: <CheckCircle className="w-4 h-4" />,
      closed: <CheckCircle className="w-4 h-4" />,
      duplicate: <XCircle className="w-4 h-4" />,
      wont_fix: <XCircle className="w-4 h-4" />
    };
    return iconMap[statusName] || <FileText className="w-4 h-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading issue reporting system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Issue Reporting</h1>
              <p className="text-gray-600">Report bugs, request features, and get support</p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Report Issue
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Issues</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.total_issues || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Open Issues</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.open_issues || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Resolved</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.resolved_issues || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Avg Resolution</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.avg_resolution_time_hours ? 
                        `${Math.round(stats.avg_resolution_time_hours)}h` : 
                        'N/A'
                      }
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="waiting_for_user">Waiting for User</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.description}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Priorities</option>
                  {priorities.map(priority => (
                    <option key={priority.id} value={priority.name}>
                      {priority.description}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Outlet</label>
                <select
                  value={filters.outletId}
                  onChange={(e) => setFilters({ ...filters, outletId: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Outlets</option>
                  {outlets.map(outlet => (
                    <option key={outlet.id} value={outlet.id}>
                      {outlet.outlet_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Issues List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Your Issues</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {issues.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No issues found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by reporting your first issue.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Report Issue
                  </button>
                </div>
              </div>
            ) : (
              issues.map(issue => (
                <div key={issue.id} className="px-6 py-4 hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedIssue(issue)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: issue.category.color + '20' }}
                        >
                          <div style={{ color: issue.category.color }}>
                            {getCategoryIcon(issue.category.icon)}
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {issue.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {issue.category.description} • {issue.priority.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: issue.status.color }}
                        ></div>
                        <span className="text-sm text-gray-500">{issue.status.description}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(issue.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Issue Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Report New Issue</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              {/* Templates */}
              {templates.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Templates</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {templates.map(template => (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateSelect(template)}
                        className="text-left p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50"
                      >
                        <div className="font-medium text-sm text-gray-900">{template.name}</div>
                        <div className="text-xs text-gray-500">{template.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <form onSubmit={handleCreateIssue}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Brief description of the issue"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Category</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.description}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                      </label>
                      <select
                        value={formData.priorityId}
                        onChange={(e) => setFormData({ ...formData, priorityId: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Priority</option>
                        {priorities.map(priority => (
                          <option key={priority.id} value={priority.id}>
                            {priority.description}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {outlets.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Outlet (Optional)
                      </label>
                      <select
                        value={formData.outletId}
                        onChange={(e) => setFormData({ ...formData, outletId: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Outlet</option>
                        {outlets.map(outlet => (
                          <option key={outlet.id} value={outlet.id}>
                            {outlet.outlet_name} - {outlet.city}, {outlet.state}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Please provide a detailed description of the issue..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Attachments (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-2">
                        <label className="cursor-pointer">
                          <span className="text-blue-600 hover:text-blue-500">Upload files</span>
                          <input
                            type="file"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              setFormData({ ...formData, attachments: files });
                            }}
                          />
                        </label>
                        <span className="text-gray-500"> or drag and drop</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, PDF up to 10MB each
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Submit Issue
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Issue Detail Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{selectedIssue.title}</h3>
                <p className="text-sm text-gray-500">
                  Created {formatDate(selectedIssue.created_at)}
                </p>
              </div>
              <button
                onClick={() => setSelectedIssue(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedIssue.description}</p>
                </div>
                
                {/* Comments */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Comments ({selectedIssue.comments?.length || 0})</h4>
                  <div className="space-y-3">
                    {selectedIssue.comments?.map((comment: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            {comment.user?.first_name} {comment.user?.last_name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Status</h4>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: selectedIssue.status.color }}
                      ></div>
                      <span className="text-sm text-gray-700">{selectedIssue.status.description}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Category</h4>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: selectedIssue.category.color + '20' }}
                      >
                        <div style={{ color: selectedIssue.category.color }}>
                          {getCategoryIcon(selectedIssue.category.icon)}
                        </div>
                      </div>
                      <span className="text-sm text-gray-700">{selectedIssue.category.description}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Priority</h4>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: selectedIssue.priority.color }}
                      ></div>
                      <span className="text-sm text-gray-700">{selectedIssue.priority.description}</span>
                    </div>
                  </div>
                  
                  {selectedIssue.outlet && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Outlet</h4>
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{selectedIssue.outlet.outlet_name}</span>
                      </div>
                      <p className="text-xs text-gray-500 ml-6">{selectedIssue.outlet.address}</p>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Last Updated</h4>
                    <p className="text-sm text-gray-700">{formatDate(selectedIssue.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
