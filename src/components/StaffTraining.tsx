import React, { useState } from 'react';
import { Users, BookOpen, Award, TrendingUp, Clock, CheckCircle, Play, Star } from 'lucide-react';

const StaffTraining: React.FC = () => {
  const [activeTab, setActiveTab] = useState('training');

  const trainingModules = [
    {
      id: 1,
      title: 'Food Safety & Hygiene',
      description: 'Essential food safety protocols and hygiene standards',
      duration: 45,
      completions: 23,
      totalStaff: 28,
      rating: 4.8,
      category: 'Safety',
      status: 'active'
    },
    {
      id: 2,
      title: 'Waste Reduction Techniques',
      description: 'Best practices for minimizing food waste',
      duration: 30,
      completions: 18,
      totalStaff: 28,
      rating: 4.6,
      category: 'Sustainability',
      status: 'active'
    },
    {
      id: 3,
      title: 'Inventory Management',
      description: 'Proper storage and rotation procedures',
      duration: 35,
      completions: 25,
      totalStaff: 28,
      rating: 4.7,
      category: 'Operations',
      status: 'active'
    },
    {
      id: 4,
      title: 'Customer Service Excellence',
      description: 'Delivering exceptional customer experiences',
      duration: 40,
      completions: 21,
      totalStaff: 28,
      rating: 4.9,
      category: 'Service',
      status: 'active'
    }
  ];

  const staffPerformance = [
    {
      id: 1,
      name: 'John Doe',
      role: 'Kitchen Manager',
      completedModules: 4,
      totalModules: 6,
      score: 92,
      certifications: ['Food Safety', 'Waste Management'],
      lastActivity: '2024-01-16'
    },
    {
      id: 2,
      name: 'Jane Smith',
      role: 'Sous Chef',
      completedModules: 3,
      totalModules: 6,
      score: 88,
      certifications: ['Food Safety'],
      lastActivity: '2024-01-15'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      role: 'Server',
      completedModules: 5,
      totalModules: 6,
      score: 94,
      certifications: ['Food Safety', 'Customer Service'],
      lastActivity: '2024-01-16'
    },
    {
      id: 4,
      name: 'Sarah Wilson',
      role: 'Prep Cook',
      completedModules: 2,
      totalModules: 6,
      score: 78,
      certifications: ['Food Safety'],
      lastActivity: '2024-01-14'
    }
  ];

  const engagementMetrics = [
    { metric: 'Course Completion Rate', value: '78%', change: '+5%', trend: 'up' },
    { metric: 'Average Score', value: '88%', change: '+2%', trend: 'up' },
    { metric: 'Active Learners', value: '24', change: '+3', trend: 'up' },
    { metric: 'Certifications Earned', value: '67', change: '+12', trend: 'up' }
  ];

  const getCompletionPercentage = (completed: number, total: number) => {
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="space-y-lg">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text-primary">Staff Engagement & Training</h1>
        <button className="glass-button">
          Create New Module
        </button>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-lg">
        {engagementMetrics.map((metric, index) => (
          <div key={index} className="glass-card p-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">{metric.metric}</p>
                <p className="text-xl font-semibold text-text-primary">{metric.value}</p>
              </div>
              <div className="flex items-center">
                <TrendingUp className="text-success" size={20} />
              </div>
            </div>
            <p className="text-sm text-success mt-sm">{metric.change} from last month</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="glass-card">
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-lg">
            <button
              onClick={() => setActiveTab('training')}
              className={`py-md px-xs border-b-2 font-medium text-sm transition-default ${
                activeTab === 'training'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Training Modules
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`py-md px-xs border-b-2 font-medium text-sm transition-default ${
                activeTab === 'performance'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Staff Performance
            </button>
          </nav>
        </div>

        {/* Training Modules Tab */}
        {activeTab === 'training' && (
          <div className="p-lg">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
              {trainingModules.map((module) => (
                <div key={module.id} className="border border-border rounded-md p-lg">
                  <div className="flex items-start justify-between mb-md">
                    <div>
                      <h3 className="text-md font-semibold text-text-primary">{module.title}</h3>
                      <p className="text-sm text-text-secondary mt-xs">{module.description}</p>
                    </div>
                    <span className="glass-badge-primary">
                      {module.category}
                    </span>
                  </div>

                  <div className="space-y-md mb-md">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">Duration:</span>
                      <span className="font-medium">{module.duration} minutes</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">Completion:</span>
                      <span className="font-medium">{module.completions}/{module.totalStaff}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">Rating:</span>
                      <div className="flex items-center">
                        <Star className="text-warning mr-xs" size={14} />
                        <span className="font-medium">{module.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-md">
                    <div className="flex items-center justify-between text-sm mb-xs">
                      <span className="text-text-secondary">Progress</span>
                      <span className="font-medium">{getCompletionPercentage(module.completions, module.totalStaff)}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-default"
                        style={{ width: `${getCompletionPercentage(module.completions, module.totalStaff)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex space-x-sm">
                    <button className="flex-1 glass-button text-sm flex items-center justify-center">
                      <Play size={14} className="mr-xs" />
                      Preview
                    </button>
                    <button className="flex-1 glass-button-secondary text-sm">
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Staff Performance Tab */}
        {activeTab === 'performance' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="glass-table-header">
                <tr>
                  <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Staff Member
                  </th>
                  <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Certifications
                  </th>
                  <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Last Activity
                  </th>
                  <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {staffPerformance.map((staff) => (
                  <tr key={staff.id} className="hover:bg-white/40 transition-default">
                    <td className="px-lg py-md whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                          <Users size={16} className="text-text-secondary" />
                        </div>
                        <div className="ml-md">
                          <div className="text-sm font-medium text-text-primary">{staff.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-lg py-md whitespace-nowrap text-sm text-text-primary">
                      {staff.role}
                    </td>
                    <td className="px-lg py-md whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-secondary rounded-full h-2 mr-sm">
                          <div
                            className="bg-success h-2 rounded-full transition-default"
                            style={{ width: `${getCompletionPercentage(staff.completedModules, staff.totalModules)}%` }}
                          />
                        </div>
                        <span className="text-sm text-text-primary">
                          {staff.completedModules}/{staff.totalModules}
                        </span>
                      </div>
                    </td>
                    <td className="px-lg py-md whitespace-nowrap">
                      <div className="text-sm font-medium text-text-primary">{staff.score}%</div>
                    </td>
                    <td className="px-lg py-md whitespace-nowrap">
                      <div className="flex flex-wrap gap-xs">
                        {staff.certifications.map((cert, index) => (
                          <span key={index} className="glass-badge-success flex items-center">
                            <Award size={10} className="mr-xs" />
                            {cert}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-lg py-md whitespace-nowrap text-sm text-text-primary">
                      {staff.lastActivity}
                    </td>
                    <td className="px-lg py-md whitespace-nowrap text-sm text-text-primary">
                      <div className="flex space-x-sm">
                        <button className="text-primary hover:text-primary-hover transition-default">View</button>
                        <button className="text-success hover:opacity-80 transition-default">Assign</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffTraining;