import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Chart from "react-apexcharts";
import ApperIcon from "@/components/ApperIcon";
import MetricCard from "@/components/molecules/MetricCard";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Leads from "@/components/pages/Leads";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import { getDailyLeadsChart, getLeadsAnalytics, getLeadsMetrics, getUserPerformance } from "@/services/api/analyticsService";
import { getSalesReps } from "@/services/api/salesRepService";
import { getLeads } from "@/services/api/leadsService";

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
const [chartData, setChartData] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [userPerformance, setUserPerformance] = useState([]);
  const [salesReps, setSalesReps] = useState([]);
  const [analytics, setAnalytics] = useState(null);
// Filters
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [chartDays, setChartDays] = useState(30);
  const [chartPeriod, setChartPeriod] = useState(30);
  const periods = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'all', label: 'All Time' }
  ];

  const chartPeriods = [
    { value: 7, label: '7 Days' },
    { value: 15, label: '15 Days' },
    { value: 30, label: '30 Days' },
    { value: 60, label: '60 Days' }
  ];

const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        analyticsData,
        chartResult,
        metricsData,
        performanceData
      ] = await Promise.all([
        getLeadsAnalytics(selectedPeriod, selectedUser),
        getDailyLeadsChart(selectedUser, chartDays),
        getLeadsMetrics(selectedUser),
        getUserPerformance()
      ]);
      
      // Load sales reps and filtered leads data
      const [salesRepsData, leadsData] = await Promise.all([
        getSalesReps(),
        getLeads({ period: selectedPeriod, userId: selectedUser, limit: 10 })
      ]);
      
      setMetrics(metricsData);
      setChartData(chartResult);
      setAnalytics(analyticsData);
      setUserPerformance(performanceData);
      setSalesReps(salesRepsData);
      setFilteredLeads(leadsData?.data || []);
    } catch (err) {
      console.error('Failed to load analytics data:', err);
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
    loadAnalyticsData();
  }, [selectedUser, selectedPeriod, chartDays]);

  const chartOptions = {
    chart: {
      type: 'area',
      height: 350,
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      }
    },
    colors: ['#8B5CF6'],
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.1,
        stops: [0, 90, 100]
      }
    },
    grid: {
      show: true,
      borderColor: '#E5E7EB'
    },
    xaxis: {
      categories: chartData?.categories || [],
      labels: {
        style: {
          colors: '#6B7280'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#6B7280'
        }
      }
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (value) => `${value} leads`
      }
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadAnalyticsData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-2">
            Track lead generation performance and sales metrics
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
          >
            <option value="all">All Sales Reps</option>
{salesReps.map(rep => (
              <option key={rep.Id} value={rep.Id.toString()}>
                {rep.Name}
              </option>
            ))}
          </select>
          
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
          >
            {periods.map(period => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Today"
            value={metrics.metrics.today.count}
            icon="Calendar"
            color="primary"
            trend={metrics.metrics.today.trend}
          />
          <MetricCard
            title="Yesterday"
            value={metrics.metrics.yesterday.count}
            icon="Clock"
            color="info"
          />
          <MetricCard
            title="This Week"
            value={metrics.metrics.week.count}
            icon="BarChart3"
            color="success"
          />
          <MetricCard
            title="This Month"
            value={metrics.metrics.month.count}
            icon="TrendingUp"
            color="warning"
          />
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Leads Chart */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                New Leads Per Day
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Daily lead generation trends
              </p>
            </div>
<select
              value={chartDays}
              onChange={(e) => setChartDays(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-sm"
            >
              {chartPeriods.map(period => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Chart container with dimension validation */}
          <div className="min-h-[350px] w-full viewport-capture-ready">
            {chartData && chartData.series && chartData.series.length > 0 ? (
              <div className="w-full h-full">
                <Chart
                  options={{
                    ...chartOptions,
                    chart: {
                      ...chartOptions.chart,
                      width: '100%',
                      height: 350,
                      parentHeightOffset: 0,
                      toolbar: {
                        show: false
                      }
                    }
                  }}
                  series={chartData.series}
                  type="area"
                  height={350}
                  width="100%"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-[350px] bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3"></div>
                  <p className="text-gray-500">Loading chart data...</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Status Distribution */}
        <Card className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Lead Status Distribution
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Current status breakdown
            </p>
          </div>
          
          {metrics?.statusDistribution && (
            <div className="space-y-4">
              {Object.entries(metrics.statusDistribution)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 6)
                .map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">{status}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* User Performance & Recent Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Sales Rep Performance
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Lead generation by team member
            </p>
          </div>
          
<div className="space-y-4">
            {userPerformance && userPerformance.length > 0 ? (
              userPerformance.slice(0, 6).map((rep, index) => (
                <div key={rep.Id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {rep.name?.charAt(0) || 'N'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{rep.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">
                        {rep.todayLeads || 0} today • {rep.weekLeads || 0} this week
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{rep.totalLeads || 0}</p>
                    <p className="text-xs text-gray-500">total leads</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No performance data available</p>
              </div>
            )}
          </div>
        </Card>

        {/* Recent Filtered Leads */}
        <Card className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Leads
            </h3>
<p className="text-sm text-gray-600 mt-1">
              {selectedPeriod === 'all' ? 'Latest' : periods.find(p => p.value === selectedPeriod)?.label} leads
              {selectedUser !== 'all' && ` by ${salesReps.find(r => r.Id.toString() === selectedUser)?.Name || 'Unknown Rep'}`}
            </p>
          </div>
          
<div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredLeads && filteredLeads.length > 0 ? (
              filteredLeads.slice(0, 10).map((lead) => (
                <div key={lead.Id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {lead.websiteUrl?.replace(/^https?:\/\//, '') || 'Unknown URL'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {lead.addedByName || 'Unknown'}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'Unknown date'}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      lead.status === 'Hotlist' ? 'bg-red-100 text-red-800' :
                      lead.status === 'Connected' ? 'bg-green-100 text-green-800' :
                      lead.status === 'Meeting Booked' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {lead.status || 'Unknown'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ApperIcon name="Search" size={48} className="mx-auto mb-3 text-gray-300" />
                <p>No leads found for the selected filters</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Additional Insights */}
      {metrics?.categoryDistribution && (
        <Card className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Lead Categories
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Distribution by industry category
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(metrics.categoryDistribution)
              .sort(([,a], [,b]) => b - a)
              .map(([category, count]) => (
              <div key={category} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-primary-600">{count}</p>
                <p className="text-sm text-gray-600 mt-1">{category}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Analytics;