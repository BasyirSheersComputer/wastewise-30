import React, { useState } from 'react';
import { Users, BookOpen, Award, Clock, CheckCircle, Play, Pause, Download, Plus, Eye, Edit, Trash2, Filter, Search, BarChart3, Target, Calendar, X, Building2, MessageSquare, TrendingUp, AlertTriangle, Settings, Zap } from 'lucide-react';
import LLMRecommendations from './LLMRecommendations';

const StaffTraining: React.FC = () => {
  const [activeTab, setActiveTab] = useState('modules');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedOutlet, setSelectedOutlet] = useState('all');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCommunicationModal, setShowCommunicationModal] = useState(false);
  const [newModule, setNewModule] = useState({
    title: '',
    category: '',
    duration: '',
    difficulty: 'Beginner',
    description: '',
    topics: '',
    status: 'active'
  });

  // Multi-outlet structure
  const outlets = [
    { id: 'all', name: 'All Outlets', location: 'Chain-wide' },
    { id: 'outlet-1', name: 'Downtown Branch', location: 'Kuala Lumpur' },
    { id: 'outlet-2', name: 'Mall Location', location: 'Petaling Jaya' },
    { id: 'outlet-3', name: 'Airport Branch', location: 'KLIA' },
    { id: 'outlet-4', name: 'Suburban Branch', location: 'Shah Alam' }
  ];

  // Enhanced training modules with multi-outlet support
  const trainingModules = [
    {
      id: 1,
      title: 'Food Safety & Hygiene',
      category: 'Safety',
      duration: 45,
      difficulty: 'Beginner',
      completionRate: 92,
      enrolled: selectedOutlet === 'all' ? 60 : 15,
      completed: selectedOutlet === 'all' ? 55 : 14,
      status: 'active',
      lastUpdated: '2024-01-15',
      description: 'Essential food safety practices and hygiene standards for restaurant staff.',
      topics: ['Hand washing', 'Cross-contamination', 'Temperature control', 'Cleaning procedures'],
      outlets: ['All']
    },
    {
      id: 2,
      title: 'Customer Service Excellence',
      category: 'Service',
      duration: 60,
      difficulty: 'Intermediate',
      completionRate: 78,
      enrolled: selectedOutlet === 'all' ? 48 : 12,
      completed: selectedOutlet === 'all' ? 37 : 9,
      status: 'active',
      lastUpdated: '2024-01-10',
      description: 'Advanced customer service techniques and conflict resolution strategies.',
      topics: ['Communication skills', 'Problem solving', 'Upselling', 'Complaint handling'],
      outlets: ['All']
    },
    {
      id: 3,
      title: 'Kitchen Equipment Safety',
      category: 'Safety',
      duration: 30,
      difficulty: 'Beginner',
      completionRate: 85,
      enrolled: selectedOutlet === 'all' ? 72 : 18,
      completed: selectedOutlet === 'all' ? 61 : 15,
      status: 'active',
      lastUpdated: '2024-01-12',
      description: 'Safe operation and maintenance of kitchen equipment and appliances.',
      topics: ['Knife safety', 'Equipment operation', 'Maintenance', 'Emergency procedures'],
      outlets: ['All']
    },
    {
      id: 4,
      title: 'Menu Knowledge & Upselling',
      category: 'Sales',
      duration: 40,
      difficulty: 'Intermediate',
      completionRate: 65,
      enrolled: selectedOutlet === 'all' ? 40 : 10,
      completed: selectedOutlet === 'all' ? 26 : 6,
      status: 'draft',
      lastUpdated: '2024-01-08',
      description: 'Comprehensive menu knowledge and effective upselling techniques.',
      topics: ['Menu items', 'Ingredients', 'Allergens', 'Upselling techniques'],
      outlets: ['All']
    },
    {
      id: 5,
      title: 'Inventory Management',
      category: 'Operations',
      duration: 50,
      difficulty: 'Advanced',
      completionRate: 45,
      enrolled: selectedOutlet === 'all' ? 32 : 8,
      completed: selectedOutlet === 'all' ? 14 : 4,
      status: 'active',
      lastUpdated: '2024-01-14',
      description: 'Advanced inventory tracking and management systems.',
      topics: ['Stock tracking', 'Ordering', 'Waste reduction', 'Cost control'],
      outlets: ['All']
    }
  ];

  // Enhanced staff progress with multi-outlet support
  const staffProgress = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Server',
      outlet: 'Downtown Branch',
      modulesCompleted: 8,
      totalModules: 12,
      completionRate: 67,
      lastTraining: '2024-01-16',
      nextDue: '2024-01-23',
      status: 'on-track',
      performance: 85,
      sales: 1250,
      customerRating: 4.8
    },
    {
      id: 2,
      name: 'Mike Chen',
      role: 'Kitchen Staff',
      outlet: 'Mall Location',
      modulesCompleted: 10,
      totalModules: 12,
      completionRate: 83,
      lastTraining: '2024-01-15',
      nextDue: '2024-01-22',
      status: 'excellent',
      performance: 92,
      sales: 0,
      customerRating: 0
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      role: 'Server',
      outlet: 'Airport Branch',
      modulesCompleted: 6,
      totalModules: 12,
      completionRate: 50,
      lastTraining: '2024-01-14',
      nextDue: '2024-01-21',
      status: 'needs-attention',
      performance: 72,
      sales: 980,
      customerRating: 4.2
    },
    {
      id: 4,
      name: 'David Thompson',
      role: 'Kitchen Staff',
      outlet: 'Suburban Branch',
      modulesCompleted: 11,
      totalModules: 12,
      completionRate: 92,
      lastTraining: '2024-01-16',
      nextDue: '2024-01-23',
      status: 'excellent',
      performance: 95,
      sales: 0,
      customerRating: 0
    }
  ];

  // Shift scheduling data
  const shiftSchedule = [
    {
      id: 1,
      staffName: 'Sarah Johnson',
      role: 'Server',
      outlet: 'Downtown Branch',
      date: '2024-01-20',
      startTime: '09:00',
      endTime: '17:00',
      hours: 8,
      status: 'confirmed',
      performance: 85
    },
    {
      id: 2,
      staffName: 'Mike Chen',
      role: 'Kitchen Staff',
      outlet: 'Mall Location',
      date: '2024-01-20',
      startTime: '10:00',
      endTime: '18:00',
      hours: 8,
      status: 'confirmed',
      performance: 92
    },
    {
      id: 3,
      staffName: 'Emily Rodriguez',
      role: 'Server',
      outlet: 'Airport Branch',
      date: '2024-01-20',
      startTime: '08:00',
      endTime: '16:00',
      hours: 8,
      status: 'pending',
      performance: 72
    },
    {
      id: 4,
      staffName: 'David Thompson',
      role: 'Kitchen Staff',
      outlet: 'Suburban Branch',
      date: '2024-01-20',
      startTime: '11:00',
      endTime: '19:00',
      hours: 8,
      status: 'confirmed',
      performance: 95
    }
  ];

  // Communication hub data
  const communications = [
    {
      id: 1,
      type: 'announcement',
      title: 'New Food Safety Protocol',
      content: 'Updated food safety protocols effective immediately across all outlets.',
      author: 'Management',
      timestamp: '2024-01-16 10:30',
      priority: 'high',
      outlets: ['All']
    },
    {
      id: 2,
      type: 'training',
      title: 'Customer Service Training',
      content: 'Mandatory customer service training session this Friday.',
      author: 'HR Department',
      timestamp: '2024-01-15 14:20',
      priority: 'medium',
      outlets: ['Downtown', 'Mall']
    },
    {
      id: 3,
      type: 'policy',
      title: 'Updated Dress Code',
      content: 'New dress code policy for all front-of-house staff.',
      author: 'Management',
      timestamp: '2024-01-14 09:15',
      priority: 'medium',
      outlets: ['All']
    },
    {
      id: 4,
      type: 'event',
      title: 'Team Building Event',
      content: 'Monthly team building event scheduled for next week.',
      author: 'HR Department',
      timestamp: '2024-01-13 16:45',
      priority: 'low',
      outlets: ['All']
    }
  ];

  const categories = ['all', 'Safety', 'Service', 'Sales', 'Operations'];
  const difficulties = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  const totalModules = trainingModules.length;
  const activeModules = trainingModules.filter(m => m.status === 'active').length;
  const avgCompletionRate = trainingModules.reduce((sum, m) => sum + m.completionRate, 0) / trainingModules.length;
  const totalEnrolled = trainingModules.reduce((sum, m) => sum + m.enrolled, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStaffStatusBadge = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'bg-green-100 text-green-800';
      case 'on-track':
        return 'bg-blue-100 text-blue-800';
      case 'needs-attention':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getShiftStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCommunicationPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddModule = () => {
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setNewModule({
      title: '',
      category: '',
      duration: '',
      difficulty: 'Beginner',
      description: '',
      topics: '',
      status: 'active'
    });
  };

  const handleSubmitModule = () => {
    // Here you would typically save to your backend
    console.log('Adding new training module:', newModule);
    handleCloseModal();
  };

  const handleInputChange = (field: string, value: string) => {
    setNewModule(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const filteredModules = trainingModules.filter(module => {
    const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
    return matchesCategory;
  });

  const filteredStaff = staffProgress.filter(staff => {
    const matchesOutlet = selectedOutlet === 'all' || staff.outlet === outlets.find(o => o.id === selectedOutlet)?.name;
    return matchesOutlet;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600 mt-1">Manage training modules, staff performance, and scheduling</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedOutlet}
            onChange={(e) => setSelectedOutlet(e.target.value)}
          >
            {outlets.map(outlet => (
              <option key={outlet.id} value={outlet.id}>
                {outlet.name}
              </option>
            ))}
          </select>
          <button 
            onClick={handleAddModule}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Module</span>
          </button>
        </div>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Staff</p>
              <p className="text-2xl font-bold text-gray-900">
                {selectedOutlet === 'all' ? '48' : '12'}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-blue-600 mt-2">
            {selectedOutlet === 'all' ? 'Across all outlets' : 'This outlet'}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Training Hours</p>
              <p className="text-2xl font-bold text-gray-900">
                {selectedOutlet === 'all' ? '900' : '225'}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-orange-600 mt-2">This month</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Performance</p>
              <p className="text-2xl font-bold text-gray-900">86%</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">Staff rating</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Shifts</p>
              <p className="text-2xl font-bold text-gray-900">
                {selectedOutlet === 'all' ? '32' : '8'}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-purple-600 mt-2">Today</p>
        </div>
      </div>

      {/* Enhanced Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('modules')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'modules'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Training Modules
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'progress'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Staff Progress
            </button>
            <button
              onClick={() => setActiveTab('scheduling')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'scheduling'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Shift Scheduling
            </button>
            <button
              onClick={() => setActiveTab('communication')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'communication'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Communication Hub
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'modules' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredModules.map((module) => (
                  <div key={module.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{module.title}</h3>
                        <p className="text-sm text-gray-600">{module.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(module.status)}`}>
                          {module.status}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getDifficultyBadge(module.difficulty)}`}>
                          {module.difficulty}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{module.duration} min</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{module.enrolled} enrolled</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{module.completed} completed</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{module.completionRate}% completion</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-sm font-medium text-gray-900 mb-2">Topics Covered:</div>
                      <div className="flex flex-wrap gap-1">
                        {module.topics.map((topic, index) => (
                          <span key={index} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Updated: {module.lastUpdated}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Play className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Member</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outlet</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Training</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStaff.map((staff) => (
                      <tr key={staff.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{staff.role}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{staff.outlet}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {staff.modulesCompleted}/{staff.totalModules} modules
                          </div>
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${staff.completionRate}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900">{staff.completionRate}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{staff.performance}%</div>
                          {staff.sales > 0 && (
                            <div className="text-xs text-gray-500">Sales: ${staff.sales}</div>
                          )}
                          {staff.customerRating > 0 && (
                            <div className="text-xs text-gray-500">Rating: {staff.customerRating}/5</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staff.lastTraining}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStaffStatusBadge(staff.status)}`}>
                            {staff.status}
                          </span>
                        </td>
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

          {activeTab === 'scheduling' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Shift Scheduling</h3>
                <button 
                  onClick={() => setShowScheduleModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Create Shift</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Member</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outlet</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {shiftSchedule.map((shift) => (
                      <tr key={shift.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{shift.staffName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{shift.role}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{shift.outlet}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{shift.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {shift.startTime} - {shift.endTime}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{shift.hours}h</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{shift.performance}%</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getShiftStatusBadge(shift.status)}`}>
                            {shift.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <CheckCircle className="w-4 h-4" />
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

          {activeTab === 'communication' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Communication Hub</h3>
                <button 
                  onClick={() => setShowCommunicationModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>New Message</span>
                </button>
              </div>

              <div className="space-y-4">
                {communications.map((comm) => (
                  <div key={comm.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{comm.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{comm.content}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCommunicationPriorityBadge(comm.priority)}`}>
                          {comm.priority}
                        </span>
                        <span className="text-xs text-gray-500">{comm.type}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        <span>By {comm.author} • {comm.timestamp}</span>
                        <div className="text-xs text-gray-500 mt-1">
                          Outlets: {comm.outlets.join(', ')}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Recommendations */}
      <LLMRecommendations section="staff-training" />

      {/* Add Training Module Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Add New Training Module</h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Module Title *
                  </label>
                  <input
                    type="text"
                    value={newModule.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter module title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={newModule.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select category</option>
                    <option value="Safety">Safety</option>
                    <option value="Service">Service</option>
                    <option value="Sales">Sales</option>
                    <option value="Operations">Operations</option>
                    <option value="Compliance">Compliance</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Hygiene">Hygiene</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    value={newModule.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="30"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={newModule.difficulty}
                    onChange={(e) => handleInputChange('difficulty', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={newModule.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={newModule.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Brief description of the training module"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Topics Covered
                  </label>
                  <textarea
                    value={newModule.topics}
                    onChange={(e) => handleInputChange('topics', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="List topics covered (comma separated)"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitModule}
                disabled={!newModule.title || !newModule.category || !newModule.duration || !newModule.description}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add Training Module
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffTraining;