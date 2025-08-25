import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Chart from "react-apexcharts";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import MetricCard from "@/components/molecules/MetricCard";
import { getSalesReps } from "@/services/api/salesRepService";
import { getDailyWebsiteUrls } from "@/services/api/reportService";
import { 
getDashboardMetrics, 
getDetailedRecentActivity, 
getLeadPerformanceChart, 
getPendingFollowUps as getDashboardPendingFollowUps, 
getRecentActivity, 
getRevenueTrendsData, 
getTeamPerformanceRankings, 
getTodaysMeetings 
} from "@/services/api/dashboardService";
const Dashboard = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState([]);
  const [activity, setActivity] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [pendingFollowUps, setPendingFollowUps] = useState([]);
  const [leadChart, setLeadChart] = useState(null);
  const [teamPerformance, setTeamPerformance] = useState([]);
const [revenueTrends, setRevenueTrends] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [detailedActivity, setDetailedActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Daily Leads Report state
  const [salesReps, setSalesReps] = useState([]);
  const [selectedSalesRep, setSelectedSalesRep] = useState(null);
  const [dailyDateFilter, setDailyDateFilter] = useState('today');
  const [customDate, setCustomDate] = useState('');
  const [dailyUrls, setDailyUrls] = useState([]);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [showCustomDate, setShowCustomDate] = useState(false);
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      
const [
        metricsData, 
        activityData, 
        meetingsData, 
        followUpsData,
        leadChartData,
        teamPerformanceData,
        revenueTrendsData,
        detailedActivityData
] = await Promise.all([
        getDashboardMetrics(),
        getRecentActivity(),
        getTodaysMeetings(),
        getDashboardPendingFollowUps(),
getLeadPerformanceChart(),
        getTeamPerformanceRankings(),
        getRevenueTrendsData(selectedYear),
        getDetailedRecentActivity()
      ]);
      
setMetrics(metricsData);
      setActivity(activityData);
      setMeetings(meetingsData);
      setPendingFollowUps(followUpsData);
      setLeadChart(leadChartData);
      setTeamPerformance(teamPerformanceData);
      setRevenueTrends(revenueTrendsData);
      setDetailedActivity(detailedActivityData);
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

const loadSalesReps = async () => {
    try {
      const repsData = await getSalesReps();
      setSalesReps(repsData);
      if (repsData.length > 0) {
        setSelectedSalesRep(repsData[0]);
      }
    } catch (err) {
      toast.error("Failed to load sales reps");
    }
  };

  const loadDailyData = async (repId = selectedSalesRep?.Id, dateFilter = dailyDateFilter, customDateValue = customDate) => {
    if (!repId) return;
    
    try {
      setDailyLoading(true);
      let targetDate = '';
      
      if (dateFilter === 'today') {
        targetDate = new Date().toISOString().split('T')[0];
      } else if (dateFilter === 'yesterday') {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        targetDate = yesterday.toISOString().split('T')[0];
      } else if (dateFilter === 'custom' && customDateValue) {
        targetDate = customDateValue;
      }
      
      const data = await getDailyWebsiteUrls(repId, targetDate);
      setDailyUrls(data);
      
    } catch (err) {
      toast.error("Failed to load daily data");
      setDailyUrls([]);
    } finally {
      setDailyLoading(false);
    }
  };

  const handleSalesRepChange = (rep) => {
    setSelectedSalesRep(rep);
    loadDailyData(rep.Id, dailyDateFilter, customDate);
  };

  const handleDateFilterChange = (filter) => {
    setDailyDateFilter(filter);
    setShowCustomDate(filter === 'custom');
    if (filter !== 'custom') {
      loadDailyData(selectedSalesRep?.Id, filter, customDate);
    }
  };

  const handleCustomDateChange = (date) => {
    setCustomDate(date);
    if (date) {
      loadDailyData(selectedSalesRep?.Id, 'custom', date);
    }
};

  const handleYearChange = async (year) => {
    setSelectedYear(year);
    try {
      const newRevenueTrends = await getRevenueTrendsData(year);
      setRevenueTrends(newRevenueTrends);
    } catch (err) {
      toast.error("Failed to load revenue data for selected year");
    }
  };
useEffect(() => {
    loadDashboardData();
    loadSalesReps();
  }, []);

  useEffect(() => {
    if (selectedSalesRep) {
      loadDailyData();
    }
  }, [selectedSalesRep]);

  if (loading) return <Loading type="cards" />;
  if (error) return <Error message={error} onRetry={loadDashboardData} />;

  return (
    <div className="space-y-8">
    <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your sales.</p>
        </div>
    </div>
    {/* Metrics Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => <MetricCard
            key={metric.id}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            trend={metric.trend}
            trendValue={metric.trendValue}
            color={metric.color}
            delay={index * 0.1} />)}
</div>
    
    {/* Comprehensive Reports Dashboard */}
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Sales Reports & Analytics</h2>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/website-url-report')}>
            <ApperIcon name="FileText" size={16} className="mr-2" />
            URL Report
          </Button>
          <Button variant="outline" onClick={() => navigate('/analytics')}>
            <ApperIcon name="BarChart3" size={16} className="mr-2" />
            Analytics
          </Button>
        </div>
      </div>

{/* Lead Performance Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Lead Performance</h3>
              <p className="text-sm text-gray-600">Daily lead generation trends</p>
            </div>
            <ApperIcon name="TrendingUp" size={20} className="text-primary-600" />
          </div>
          {leadChart && (
            <Chart
              options={{
                chart: { type: 'area', height: 280, toolbar: { show: false } },
                colors: ['#8B5CF6'],
                dataLabels: { enabled: false },
                stroke: { curve: 'smooth', width: 3 },
                fill: {
                  type: 'gradient',
                  gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.1 }
                },
                grid: { show: true, borderColor: '#E5E7EB' },
                xaxis: { categories: leadChart.categories },
                yaxis: { labels: { formatter: (val) => `${val}` } },
                tooltip: { y: { formatter: (val) => `${val} leads` } }
              }}
              series={leadChart.series}
              type="area"
              height={280}
            />
          )}
</Card>
      </div>

{/* Team Performance & Daily Leads Report */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Team Performance</h3>
              <p className="text-sm text-gray-600">Top performing sales reps</p>
            </div>
            <ApperIcon name="Users" size={20} className="text-primary-600" />
          </div>
          <div className="space-y-4">
            {teamPerformance.slice(0, 5).map((rep, index) => (
              <div key={rep.Id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {rep.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{rep.name}</p>
                    <p className="text-xs text-gray-500">{rep.weekLeads} leads this week</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary-600">{rep.totalLeads}</p>
                  <p className="text-xs text-gray-500">total</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className={`p-6 border-2 transition-colors ${
          dailyUrls.length >= 10 ? 'border-green-500' : 'border-red-500'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Daily Leads Report</h3>
              <p className="text-sm text-gray-600">Website URLs added by sales rep</p>
            </div>
            <ApperIcon name="FileText" size={20} className="text-primary-600" />
          </div>
          
          {/* Sales Rep Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sales Representative
            </label>
            <div className="relative">
              <select
                value={selectedSalesRep?.Id || ''}
                onChange={(e) => {
                  const rep = salesReps.find(r => r.Id === parseInt(e.target.value));
                  if (rep) handleSalesRepChange(rep);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {salesReps.map(rep => (
                  <option key={rep.Id} value={rep.Id}>{rep.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Filter
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {['today', 'yesterday', 'custom'].map((filter) => (
                <Button
                  key={filter}
                  variant={dailyDateFilter === filter ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleDateFilterChange(filter)}
                  className="text-xs"
                >
                  {filter === 'today' ? 'Today' : 
                   filter === 'yesterday' ? 'Yesterday' : 'Custom Date'}
                </Button>
              ))}
            </div>
            
            {showCustomDate && (
              <input
                type="date"
                value={customDate}
                onChange={(e) => handleCustomDateChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            )}
          </div>

          {/* Website URLs List */}
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {dailyLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : dailyUrls.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-700">
                    {dailyUrls.length} website URLs found
                  </span>
                  <span className={`text-sm font-medium ${
                    dailyUrls.length >= 10 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {dailyUrls.length >= 10 ? 'Target Met' : 'Below Target'}
                  </span>
                </div>
                {dailyUrls.slice(0, 10).map((url, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">
                        {url.websiteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                      </div>
                      <div className="text-xs text-gray-500">{url.category}</div>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge 
                        variant={
                          url.status === 'Connected' || url.status === 'Meeting Done' ? 'success' :
                          url.status === 'Meeting Booked' ? 'warning' :
                          url.status === 'Rejected' ? 'error' : 'default'
                        }
                        size="sm"
                        className="text-xs"
                      >
                        {url.status}
                      </Badge>
                      <div className="text-xs text-gray-500">
                        {new Date(url.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <ApperIcon name="FileText" size={48} className="mx-auto mb-3 text-gray-300" />
                <p>No website URLs for selected date</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Revenue Trends - Full Width */}
{/* Revenue Trends - Full Width */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Revenue Trends</h3>
              <p className="text-sm text-gray-600">Monthly revenue tracking</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Year:</label>
                <select
                  value={selectedYear}
                  onChange={(e) => handleYearChange(parseInt(e.target.value))}
                  className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
<ApperIcon name="DollarSign" size={20} className="text-primary-600" />
            </div>
          </div>
          {revenueTrends && (
            <Chart
              options={{
                chart: { type: 'line', height: 280, toolbar: { show: false } },
                colors: ['#10B981'],
                dataLabels: { enabled: false },
                stroke: { curve: 'smooth', width: 4 },
                grid: { show: true, borderColor: '#E5E7EB' },
                xaxis: { categories: revenueTrends.categories },
                yaxis: { labels: { formatter: (val) => `$${(val/1000).toFixed(0)}K` } },
                tooltip: { y: { formatter: (val) => `$${(val/1000).toFixed(1)}K Revenue` } }
              }}
              series={revenueTrends.series}
              type="line"
              height={280}
            />
          )}
        </Card>
      </div>

      {/* Meetings Today & Pending Follow-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Meetings Today</h3>
          <div className="space-y-3">
            {meetings.length > 0 ? meetings.map((meeting, index) => (
              <motion.div
                key={meeting.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">{meeting.title}</div>
                    <div className="text-xs text-gray-500">{meeting.client}</div>
                  </div>
                  <div className="text-xs font-medium text-primary-600">
                    {meeting.time}
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="text-center text-gray-500 py-8">
                <ApperIcon name="Calendar" size={48} className="mx-auto mb-3 text-gray-300" />
                <p>No meetings today</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Follow-ups</h3>
          <div className="space-y-3">
            {pendingFollowUps.length > 0 ? pendingFollowUps.slice(0, 5).map((followUp, index) => (
              <motion.div
                key={followUp.Id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">
                      {followUp.websiteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    </div>
                    <div className="text-xs text-gray-500">{followUp.category}</div>
                  </div>
                  <div className="text-xs font-medium text-primary-600">
                    {new Date(followUp.followUpDate).toLocaleDateString()}
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="text-center text-gray-500 py-8">
                <ApperIcon name="Calendar" size={48} className="mx-auto mb-3 text-gray-300" />
                <p>No pending follow-ups</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {detailedActivity.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`w-2 h-2 rounded-full ${
                  item.type === "meeting" ? "bg-blue-500" : 
                  item.type === "deal" ? "bg-green-500" : "bg-yellow-500"
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </div>
</div>
  );
};

export default Dashboard;