// InteractiveChart.tsx - Universal interactive chart with time filters
import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Calendar, TrendingUp, Download } from 'lucide-react';

type ChartType = 'line' | 'bar' | 'area';
type TimeFilter = '7d' | '30d' | '90d' | '1y' | 'all' | 'custom';

interface InteractiveChartProps {
  data: any[];
  type?: ChartType;
  dataKeys: {
    x: string;
    y: string | string[];
    label?: string | string[];
  };
  title?: string;
  subtitle?: string;
  colors?: string[];
  showTimeFilter?: boolean;
  showDownload?: boolean;
  height?: number;
  onDataChange?: (filteredData: any[]) => void;
  className?: string;
}

export default function InteractiveChart({
  data,
  type = 'line',
  dataKeys,
  title,
  subtitle,
  colors = ['#00A7A7', '#FF6B35', '#2D9F4B'],
  showTimeFilter = true,
  showDownload = false,
  height = 300,
  onDataChange,
  className = ''
}: InteractiveChartProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('30d');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });

  // Filter data based on selected time range
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const now = new Date();
    let startDate: Date;

    switch (timeFilter) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case 'custom':
        if (customRange.start && customRange.end) {
          return data.filter(item => {
            const itemDate = new Date(item[dataKeys.x]);
            return itemDate >= new Date(customRange.start) && itemDate <= new Date(customRange.end);
          });
        }
        return data;
      case 'all':
      default:
        return data;
    }

    return data.filter(item => {
      const itemDate = new Date(item[dataKeys.x]);
      return itemDate >= startDate && itemDate <= now;
    });
  }, [data, timeFilter, customRange, dataKeys.x]);

  // Notify parent of data changes
  React.useEffect(() => {
    if (onDataChange) {
      onDataChange(filteredData);
    }
  }, [filteredData]);

  const timeFilters: { value: TimeFilter; label: string }[] = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' },
    { value: 'all', label: 'All Time' }
  ];

  const handleDownload = () => {
    // Convert filtered data to CSV
    const csv = convertToCSV(filteredData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'chart-data'}-${timeFilter}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const convertToCSV = (jsonData: any[]) => {
    if (!jsonData || jsonData.length === 0) return '';
    
    const headers = Object.keys(jsonData[0]);
    const rows = jsonData.map(row => 
      headers.map(header => JSON.stringify(row[header] || '')).join(',')
    );
    
    return [headers.join(','), ...rows].join('\n');
  };

  const renderChart = () => {
    const yKeys = Array.isArray(dataKeys.y) ? dataKeys.y : [dataKeys.y];
    const labels = dataKeys.label 
      ? (Array.isArray(dataKeys.label) ? dataKeys.label : [dataKeys.label])
      : yKeys;

    const commonProps = {
      data: filteredData,
      margin: { top: 10, right: 30, left: 0, bottom: 0 }
    };

    switch (type) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
            <XAxis 
              dataKey={dataKeys.x} 
              stroke="#737373" 
              fontSize={12}
              tick={{ fill: '#737373' }}
            />
            <YAxis 
              stroke="#737373" 
              fontSize={12}
              tick={{ fill: '#737373' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E5E5',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Legend />
            {yKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
                name={labels[index]}
                radius={[8, 8, 0, 0]}
              />
            ))}
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              {yKeys.map((key, index) => (
                <linearGradient key={key} id={`color${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0.1}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
            <XAxis 
              dataKey={dataKeys.x} 
              stroke="#737373" 
              fontSize={12}
              tick={{ fill: '#737373' }}
            />
            <YAxis 
              stroke="#737373" 
              fontSize={12}
              tick={{ fill: '#737373' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E5E5',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Legend />
            {yKeys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                fill={`url(#color${index})`}
                name={labels[index]}
              />
            ))}
          </AreaChart>
        );

      case 'line':
      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
            <XAxis 
              dataKey={dataKeys.x} 
              stroke="#737373" 
              fontSize={12}
              tick={{ fill: '#737373' }}
            />
            <YAxis 
              stroke="#737373" 
              fontSize={12}
              tick={{ fill: '#737373' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E5E5',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Legend />
            {yKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                name={labels[index]}
                dot={{ fill: colors[index % colors.length], r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        );
    }
  };

  return (
    <div className={`bg-white rounded-xl border border-neutral-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          {title && <h3 className="text-lg font-bold text-neutral-900 mb-1">{title}</h3>}
          {subtitle && <p className="text-sm text-neutral-600">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2">
          {showDownload && (
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              title="Download data as CSV"
            >
              <Download className="w-4 h-4 text-neutral-600" />
            </button>
          )}
        </div>
      </div>

      {/* Time Filters */}
      {showTimeFilter && (
        <div className="mb-6 flex items-center gap-2 flex-wrap">
          <Calendar className="w-4 h-4 text-neutral-500" />
          <div className="flex items-center gap-2">
            {timeFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setTimeFilter(filter.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  timeFilter === filter.value
                    ? 'bg-primary-500 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Custom Date Range (Optional) */}
          {timeFilter === 'custom' && (
            <div className="flex items-center gap-2 ml-2">
              <input
                type="date"
                value={customRange.start}
                onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                className="px-3 py-1.5 border border-neutral-300 rounded-lg text-sm"
              />
              <span className="text-neutral-500">to</span>
              <input
                type="date"
                value={customRange.end}
                onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                className="px-3 py-1.5 border border-neutral-300 rounded-lg text-sm"
              />
            </div>
          )}
        </div>
      )}

      {/* Data Count */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs text-neutral-500">
          Showing {filteredData.length} of {data.length} data points
        </p>
        
        {filteredData.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-success-600">
            <TrendingUp className="w-3 h-3" />
            <span>Data loaded</span>
          </div>
        )}
      </div>

      {/* Chart */}
      {filteredData.length > 0 ? (
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center" style={{ height }}>
          <p className="text-neutral-500">No data available for selected time range</p>
        </div>
      )}
    </div>
  );
}

