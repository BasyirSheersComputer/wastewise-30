import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  Award,
  TrendingUp,
  BookOpen,
  Video,
  FileText,
  Target
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function StaffDashboard() {
  const [searchTerm, setSearchTerm] = useState('');

  // Training Metrics
  const metrics = [
    {
      id: 1,
      name: 'Active Staff',
      value: '24',
      change: '+2',
      trend: 'up',
      icon: Users,
      color: 'primary'
    },
    {
      id: 2,
      name: 'Training Completion',
      value: '87.5%',
      change: '+12.3%',
      trend: 'up',
      icon: CheckCircle2,
      color: 'success'
    },
    {
      id: 3,
      name: 'Avg. Training Hours',
      value: '8.2 hrs',
      change: '+1.5 hrs',
      trend: 'up',
      icon: Clock,
      color: 'primary'
    },
    {
      id: 4,
      name: 'Certified Staff',
      value: '18/24',
      change: '+3',
      trend: 'up',
      icon: Award,
      color: 'success'
    }
  ];

  // Training Modules
  const trainingModules = [
    {
      id: 1,
      title: 'Waste Logging Fundamentals',
      category: 'Core',
      duration: '45 min',
      enrolled: 24,
      completed: 21,
      completionRate: 87.5,
      type: 'video',
      priority: 'high'
    },
    {
      id: 2,
      title: 'Inventory Management Best Practices',
      category: 'Advanced',
      duration: '60 min',
      enrolled: 18,
      completed: 14,
      completionRate: 77.8,
      type: 'interactive',
      priority: 'medium'
    },
    {
      id: 3,
      title: 'Food Safety & Compliance',
      category: 'Core',
      duration: '90 min',
      enrolled: 24,
      completed: 22,
      completionRate: 91.7,
      type: 'video',
      priority: 'high'
    },
    {
      id: 4,
      title: 'Efficient Portion Control',
      category: 'Core',
      duration: '30 min',
      enrolled: 20,
      completed: 18,
      completionRate: 90.0,
      type: 'document',
      priority: 'medium'
    },
    {
      id: 5,
      title: 'Advanced Forecasting Techniques',
      category: 'Advanced',
      duration: '120 min',
      enrolled: 12,
      completed: 8,
      completionRate: 66.7,
      type: 'interactive',
      priority: 'low'
    }
  ];

  // Staff Members
  const staffMembers = [
    {
      id: 1,
      name: 'Ahmad Ibrahim',
      role: 'Barista',
      email: 'ahmad@restaurant.com',
      modulesCompleted: 4,
      totalModules: 5,
      trainingHours: 9.5,
      lastActive: '2 hours ago',
      certifications: ['Waste Logging', 'Food Safety'],
      status: 'active'
    },
    {
      id: 2,
      name: 'Siti Nurhaliza',
      role: 'Kitchen Staff',
      email: 'siti@restaurant.com',
      modulesCompleted: 5,
      totalModules: 5,
      trainingHours: 12.0,
      lastActive: '1 day ago',
      certifications: ['Waste Logging', 'Food Safety', 'Portion Control'],
      status: 'active'
    },
    {
      id: 3,
      name: 'Kumar Raj',
      role: 'Supervisor',
      email: 'kumar@restaurant.com',
      modulesCompleted: 3,
      totalModules: 5,
      trainingHours: 6.5,
      lastActive: '5 hours ago',
      certifications: ['Waste Logging'],
      status: 'in-progress'
    },
    {
      id: 4,
      name: 'Chen Wei',
      role: 'Barista',
      email: 'chen@restaurant.com',
      modulesCompleted: 4,
      totalModules: 5,
      trainingHours: 8.0,
      lastActive: 'Today',
      certifications: ['Waste Logging', 'Portion Control'],
      status: 'active'
    }
  ];

  // Completion by Category
  const categoryData = [
    { name: 'Core', value: 89.7, color: '#00A7A7' },
    { name: 'Advanced', value: 72.3, color: '#FF6B35' },
    { name: 'Optional', value: 54.2, color: '#2D9F4B' }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'interactive': return Target;
      case 'document': return FileText;
      default: return BookOpen;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-error/10 text-error';
      case 'medium': return 'bg-warning/10 text-warning';
      case 'low': return 'bg-primary-50 text-primary-700';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Staff Training</h1>
          <p className="text-neutral-600 mt-1">Manage training programs and track team progress</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-medium">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium">
            <Plus className="w-4 h-4" />
            <span>Add Module</span>
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

      {/* Training Modules & Progress Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Training Modules List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-bold text-neutral-900 mb-4">Training Modules</h2>
          
          <div className="space-y-3">
            {trainingModules.map((module) => {
              const TypeIcon = getTypeIcon(module.type);
              
              return (
                <div key={module.id} className="p-4 rounded-lg border border-neutral-200 hover:border-primary-500 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                        <TypeIcon className="w-5 h-5 text-primary-500" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-medium text-neutral-900">{module.title}</h3>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(module.priority)}`}>
                            {module.priority}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-neutral-500">
                          <span>{module.category}</span>
                          <span>• {module.duration}</span>
                          <span>• {module.enrolled} enrolled</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm font-medium text-neutral-900">{module.completionRate}%</p>
                      <p className="text-xs text-neutral-500">{module.completed}/{module.enrolled}</p>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary-500 rounded-full"
                        style={{ width: `${module.completionRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Completion Chart */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-bold text-neutral-900 mb-4">Completion by Category</h2>
          
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="space-y-2 mt-4">
            {categoryData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-neutral-700">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-neutral-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Staff Members Table */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-neutral-900">Team Members</h2>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm w-64"
              />
            </div>
            
            <button className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-medium">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">Role</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">Progress</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">Training Hours</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">Certifications</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">Last Active</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {staffMembers.map((staff) => (
                <tr key={staff.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                  <td className="py-4 px-4">
                    <div>
                      <div className="text-sm font-medium text-neutral-900">{staff.name}</div>
                      <div className="text-xs text-neutral-500">{staff.email}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-neutral-700">{staff.role}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary-500 rounded-full"
                          style={{ width: `${(staff.modulesCompleted / staff.totalModules) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-neutral-600">{staff.modulesCompleted}/{staff.totalModules}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm font-medium text-neutral-900">{staff.trainingHours} hrs</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1">
                      {staff.certifications.slice(0, 2).map((cert, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-success-50 text-success-700 text-xs rounded">
                          {cert}
                        </span>
                      ))}
                      {staff.certifications.length > 2 && (
                        <span className="px-2 py-0.5 bg-neutral-100 text-neutral-600 text-xs rounded">
                          +{staff.certifications.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-neutral-600">{staff.lastActive}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                      staff.status === 'active' ? 'bg-success-50 text-success-700' : 'bg-primary-50 text-primary-700'
                    }`}>
                      {staff.status === 'active' ? 'Active' : 'In Progress'}
                    </span>
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

