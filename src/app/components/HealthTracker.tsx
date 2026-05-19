import { useState } from 'react';
import { Activity, Heart, Droplet, Thermometer, Weight, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function HealthTracker() {
  const [activeMetric, setActiveMetric] = useState('bloodPressure');

  const metrics = [
    { id: 'bloodPressure', label: 'Blood Pressure', icon: Activity, unit: 'mmHg', color: '#3b82f6' },
    { id: 'heartRate', label: 'Heart Rate', icon: Heart, unit: 'bpm', color: '#ef4444' },
    { id: 'bloodSugar', label: 'Blood Sugar', icon: Droplet, unit: 'mg/dL', color: '#8b5cf6' },
    { id: 'temperature', label: 'Temperature', icon: Thermometer, unit: '°F', color: '#f59e0b' },
    { id: 'weight', label: 'Weight', icon: Weight, unit: 'lbs', color: '#10b981' },
  ];

  const chartData = {
    bloodPressure: [
      { date: 'May 1', value: 120 },
      { date: 'May 5', value: 118 },
      { date: 'May 10', value: 122 },
      { date: 'May 15', value: 119 },
      { date: 'May 19', value: 121 },
    ],
    heartRate: [
      { date: 'May 1', value: 72 },
      { date: 'May 5', value: 75 },
      { date: 'May 10', value: 70 },
      { date: 'May 15', value: 73 },
      { date: 'May 19', value: 71 },
    ],
    bloodSugar: [
      { date: 'May 1', value: 95 },
      { date: 'May 5', value: 98 },
      { date: 'May 10', value: 92 },
      { date: 'May 15', value: 96 },
      { date: 'May 19', value: 94 },
    ],
    temperature: [
      { date: 'May 1', value: 98.2 },
      { date: 'May 5', value: 98.4 },
      { date: 'May 10', value: 98.1 },
      { date: 'May 15', value: 98.3 },
      { date: 'May 19', value: 98.2 },
    ],
    weight: [
      { date: 'May 1', value: 165 },
      { date: 'May 5', value: 164 },
      { date: 'May 10', value: 163 },
      { date: 'May 15', value: 162 },
      { date: 'May 19', value: 161 },
    ],
  };

  const currentMetric = metrics.find(m => m.id === activeMetric);
  const currentData = chartData[activeMetric as keyof typeof chartData];
  const latestValue = currentData[currentData.length - 1].value;
  const previousValue = currentData[currentData.length - 2].value;
  const trend = latestValue > previousValue ? 'up' : 'down';

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Track Your Health Progress
          </h2>
          <p className="text-xl text-gray-600">
            Monitor your vital signs and health metrics over time
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Metrics Cards */}
          <div className="lg:col-span-1 space-y-4">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              const isActive = activeMetric === metric.id;
              const data = chartData[metric.id as keyof typeof chartData];
              const value = data[data.length - 1].value;

              return (
                <button
                  key={metric.id}
                  onClick={() => setActiveMetric(metric.id)}
                  className={`w-full p-6 rounded-2xl text-left transition-all ${
                    isActive
                      ? 'bg-white shadow-xl border-2 border-blue-600'
                      : 'bg-white border-2 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${metric.color}20` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: metric.color }} />
                    </div>
                    {isActive && (
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <h3 className="text-sm text-gray-600 mb-1">{metric.label}</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {value} <span className="text-sm font-normal text-gray-500">{metric.unit}</span>
                  </p>
                </button>
              );
            })}
          </div>

          {/* Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {currentMetric?.label}
                  </h3>
                  <p className="text-gray-600">Last 30 days trend</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Current Reading</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {latestValue} <span className="text-base font-normal text-gray-500">{currentMetric?.unit}</span>
                  </p>
                  <p className={`text-sm ${trend === 'up' ? 'text-red-600' : 'text-green-600'}`}>
                    {trend === 'up' ? '↑' : '↓'} {Math.abs(latestValue - previousValue).toFixed(1)} from last reading
                  </p>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={currentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={currentMetric?.color}
                    strokeWidth={3}
                    dot={{ fill: currentMetric?.color, r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>

              <div className="mt-8 grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Average</p>
                  <p className="text-xl font-bold text-gray-900">
                    {(currentData.reduce((sum, d) => sum + d.value, 0) / currentData.length).toFixed(1)} {currentMetric?.unit}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Lowest</p>
                  <p className="text-xl font-bold text-gray-900">
                    {Math.min(...currentData.map(d => d.value))} {currentMetric?.unit}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Highest</p>
                  <p className="text-xl font-bold text-gray-900">
                    {Math.max(...currentData.map(d => d.value))} {currentMetric?.unit}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
