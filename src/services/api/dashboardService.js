// Dashboard Service - Centralized data management for dashboard components
// ApperClient will be initialized within functions as needed
// Initialize ApperClient for database operations
const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

// Standardized API delay for consistent UX
const API_DELAY = 300;

// Helper function to simulate API calls with consistent delay
const simulateAPICall = (delay = API_DELAY) => 
  new Promise(resolve => setTimeout(resolve, delay));

// Helper function to safely access external services
const safeServiceCall = async (serviceCall, fallback = null) => {
  try {
    return await serviceCall();
  } catch (error) {
    console.warn('Service call failed, using fallback:', error.message);
    return fallback;
  }
};

// Helper function to get current date with consistent timezone handling
const getCurrentDate = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

// Helper function to calculate date ranges
const getDateRange = (period) => {
  const today = getCurrentDate();
  
  switch (period) {
    case 'today':
      return {
        start: today,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      };
    case 'yesterday':
      return {
        start: new Date(today.getTime() - 24 * 60 * 60 * 1000),
        end: today
      };
    case 'week':
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      return {
        start: weekStart,
        end: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
      };
    case 'month':
      return {
        start: new Date(today.getFullYear(), today.getMonth(), 1),
        end: new Date(today.getFullYear(), today.getMonth() + 1, 1)
      };
    default:
      return {
        start: today,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      };
  }
};

// Helper function to validate and sanitize user input
const validateUserId = (userId) => {
  if (typeof userId === 'string') {
    const parsed = parseInt(userId, 10);
    return isNaN(parsed) ? null : parsed;
  }
  return typeof userId === 'number' ? userId : null;
};

// Core dashboard metrics from static data
export const getDashboardMetrics = async () => {
  await simulateAPICall();
  
  try {
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "title_c" } },
        { field: { Name: "value_c" } },
        { field: { Name: "icon_c" } },
        { field: { Name: "trend_c" } },
        { field: { Name: "trend_value_c" } },
        { field: { Name: "color_c" } }
      ],
      pagingInfo: { limit: 20, offset: 0 }
    };
    
    const response = await apperClient.fetchRecords('dashboard_metric_c', params);
    
    if (!response.success) {
      console.error('Error fetching dashboard metrics:', response.message);
      return [];
    }
    
    return (response.data || []).map(metric => ({
      id: metric.Id,
      title: metric.title_c || metric.Name || 'Untitled Metric',
      value: metric.value_c || '0',
      icon: metric.icon_c || 'BarChart3',
      trend: metric.trend_c || 'neutral',
      trendValue: metric.trend_value_c || '0%',
      color: metric.color_c || 'primary'
    }));
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    return [];
  }
};

// Recent activity from static data
export const getRecentActivity = async () => {
  await simulateAPICall();
  
  try {
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "title_c" } },
        { field: { Name: "type_c" } },
        { field: { Name: "time_c" } },
        { field: { Name: "CreatedOn" } }
      ],
      orderBy: [{ fieldName: "CreatedOn", sorttype: "DESC" }],
      pagingInfo: { limit: 10, offset: 0 }
    };
    
    const response = await apperClient.fetchRecords('recent_activity_c', params);
    
    if (!response.success) {
      console.error('Error fetching recent activity:', response.message);
      return [];
    }
    
    return (response.data || []).map(activity => ({
      id: activity.Id,
      title: activity.title_c || activity.Name || 'Untitled Activity',
      time: activity.time_c || new Date(activity.CreatedOn).toLocaleTimeString(),
      type: activity.type_c || 'general'
    }));
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
};

// Today's meetings from static data
export const getTodaysMeetings = async () => {
  await simulateAPICall();
  
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "title_c" } },
        { field: { Name: "time_c" } },
        { field: { Name: "duration_c" } },
        { field: { Name: "type_c" } },
        { field: { Name: "client_c" } },
        { field: { Name: "CreatedOn" } }
      ],
      where: [
        {
          FieldName: "CreatedOn",
          Operator: "RelativeMatch",
          Values: ["Today"]
        }
      ],
      orderBy: [{ fieldName: "time_c", sorttype: "ASC" }],
      pagingInfo: { limit: 20, offset: 0 }
    };
    
    const response = await apperClient.fetchRecords('meeting_c', params);
    
    if (!response.success) {
      console.error('Error fetching today\'s meetings:', response.message);
      return [];
    }
    
    return (response.data || []).map(meeting => ({
      id: meeting.Id,
      title: meeting.title_c || meeting.Name || 'Untitled Meeting',
      time: meeting.time_c || 'TBD',
      duration: meeting.duration_c || '30 mins',
      type: meeting.type_c || 'meeting',
      client: meeting.client_c || 'Unknown Client'
    }));
  } catch (error) {
    console.error('Error fetching today\'s meetings:', error);
    return [];
  }
};

// Pending follow-ups from leads service
export const getPendingFollowUps = async () => {
  await simulateAPICall();
  
  const fallback = [];
  return safeServiceCall(async () => {
    const { getPendingFollowUps } = await import("@/services/api/leadsService");
    const followUps = await getPendingFollowUps();
    
    if (!Array.isArray(followUps)) {
      return fallback;
    }
    
    return followUps.map(followUp => ({
      ...followUp,
      Id: followUp.Id || Math.random(),
      websiteUrl: followUp.websiteUrl || 'Unknown URL',
      category: followUp.category || 'General',
      followUpDate: followUp.followUpDate || new Date().toISOString()
    }));
  }, fallback);
};

// Lead performance chart data
export const getLeadPerformanceChart = async () => {
  await simulateAPICall();
  
  const fallback = {
    categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    series: [{ name: 'Leads', data: [12, 19, 15, 27, 22, 31, 28] }]
  };
  
  return safeServiceCall(async () => {
    const { getDailyLeadsChart } = await import("@/services/api/analyticsService");
    const chartData = await getDailyLeadsChart('all', 14);
    
    if (!chartData || !chartData.categories || !chartData.series) {
      return fallback;
    }
    
    return {
      categories: chartData.categories,
      series: chartData.series.map(series => ({
        name: series.name || 'Leads',
        data: Array.isArray(series.data) ? series.data : []
      }))
    };
  }, fallback);
};

// Sales funnel analysis
export const getSalesFunnelAnalysis = async () => {
  await simulateAPICall();
  
  const fallback = {
    categories: ['Leads', 'Connected', 'Meetings', 'Closed'],
    series: [{ name: 'Conversion Rate', data: [100, 25, 12, 8] }]
  };
  
  return safeServiceCall(async () => {
    const { getLeadsAnalytics } = await import("@/services/api/analyticsService");
    const analyticsData = await getLeadsAnalytics('all', 'all');
    
    if (!analyticsData?.leads || !Array.isArray(analyticsData.leads)) {
      return fallback;
    }
    
    const totalLeads = analyticsData.leads.length;
    if (totalLeads === 0) {
      return fallback;
    }
    
    const statusCounts = analyticsData.leads.reduce((acc, lead) => {
      const status = lead.status || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    const funnelStages = [
      { name: 'Leads', count: totalLeads },
      { name: 'Connected', count: statusCounts['Connected'] || 0 },
      { name: 'Meetings', count: statusCounts['Meeting Booked'] || 0 },
      { name: 'Closed', count: statusCounts['Meeting Done'] || 0 }
    ];
    
    return {
      categories: funnelStages.map(stage => stage.name),
      series: [{
        name: 'Conversion Rate',
        data: funnelStages.map(stage => 
          Math.round((stage.count / totalLeads) * 100)
        )
      }]
    };
  }, fallback);
};

// Team performance rankings
export const getTeamPerformanceRankings = async () => {
  await simulateAPICall();
  
  return safeServiceCall(async () => {
    // First try to fetch live sales rep data from database
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "leads_contacted_c" } },
          { field: { Name: "meetings_booked_c" } },
          { field: { Name: "deals_closed_c" } }
        ]
      };

      const response = await apperClient.fetchRecords('sales_rep_c', params);
      
      if (response.success && response.data && response.data.length > 0) {
        return response.data.map(rep => ({
          Id: rep.Id,
          name: rep.Name || 'Unknown Rep',
          totalLeads: rep.leads_contacted_c || 0,
          weekLeads: Math.floor((rep.leads_contacted_c || 0) * 0.2) + Math.floor(Math.random() * 5),
          todayLeads: Math.floor((rep.leads_contacted_c || 0) * 0.05) + Math.floor(Math.random() * 3)
        }));
      }
    } catch (error) {
      console.error('Error fetching sales reps from database:', error);
    }
    
    // Fallback to analytics service
    const { getUserPerformance } = await import("@/services/api/analyticsService");
    const performanceData = await getUserPerformance();
    
    if (!Array.isArray(performanceData)) {
      return [];
    }
    
    return performanceData
      .map(rep => ({
        Id: rep.Id || Math.random(),
        name: rep.name || 'Unknown Rep',
        totalLeads: rep.totalLeads || 0,
        weekLeads: rep.weekLeads || 0,
        todayLeads: rep.todayLeads || 0
      }))
      .sort((a, b) => b.totalLeads - a.totalLeads);
  }, []);
};

// Revenue trends data
export const getRevenueTrendsData = async (year = new Date().getFullYear()) => {
  await simulateAPICall();
  
  const fallback = {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    series: [{ name: 'Monthly Revenue', data: [45000, 52000, 48000, 61000, 55000, 67000, 72000, 58000, 63000, 69000, 74000, 81000] }]
  };
  
  return safeServiceCall(async () => {
    const { getWebsiteUrlActivity } = await import("@/services/api/reportService");
    const urlActivity = await getWebsiteUrlActivity();
    
    if (!urlActivity?.data || !Array.isArray(urlActivity.data)) {
      return fallback;
    }
    
const leads = urlActivity.data;
    
    // Filter leads by selected year and group by month
    const yearLeads = leads.filter(lead => {
      if (!lead.createdAt) return false;
      const leadYear = new Date(lead.createdAt).getFullYear();
      return leadYear === year;
    });
    
    // Group leads by month and calculate monthly revenue
    const monthlyData = yearLeads.reduce((acc, lead) => {
      if (!lead.createdAt) return acc;
      
      const month = new Date(lead.createdAt).toISOString().slice(0, 7);
      if (!acc[month]) {
        acc[month] = { count: 0, revenue: 0 };
      }
      acc[month].count += 1;
      acc[month].revenue += lead.revenue || lead.arr || 0;
      return acc;
    }, {});
    
// Generate all months for the selected year
    const allMonths = Array.from({ length: 12 }, (_, i) => {
      const month = String(i + 1).padStart(2, '0');
      return `${year}-${month}`;
    });
    
    // Create revenue data for each month
    const trendData = allMonths.map(month => {
      return monthlyData[month] ? monthlyData[month].revenue : 0;
    });
    
return {
      categories: allMonths.map(month => {
        const date = new Date(month);
        return date.toLocaleDateString('en-US', { month: 'short' });
      }),
      series: [{ name: 'Monthly Revenue', data: trendData }]
    };
  }, fallback);
};

// Detailed recent activity
export const getDetailedRecentActivity = async () => {
  await simulateAPICall();
  
const fallback = [];
  
  return safeServiceCall(async () => {
    const { getWebsiteUrlActivity } = await import("@/services/api/reportService");
    const urlActivity = await getWebsiteUrlActivity();
    
    if (!urlActivity?.data || !Array.isArray(urlActivity.data)) {
      return fallback;
    }
    
    const recentLeads = urlActivity.data.slice(0, 10);
    
    const detailedActivity = recentLeads.map(lead => ({
      id: lead.Id || Math.random(),
      title: `New lead added: ${(lead.websiteUrl || 'Unknown URL').replace(/^https?:\/\//, '').replace(/\/$/, '')}`,
      type: "contact",
      time: lead.createdAt ? new Date(lead.createdAt).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }) : 'Unknown time',
      date: lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : new Date().toLocaleDateString()
    }));
    
    // Combine with dashboard activity
    const combinedActivity = [...detailedActivity, ...fallback];
    
    return combinedActivity
      .sort((a, b) => {
        const dateA = new Date(a.date || Date.now());
        const dateB = new Date(b.date || Date.now());
        return dateB - dateA;
      })
      .slice(0, 15);
  }, fallback);
};

// User leads report with period filtering
export const getUserLeadsReport = async (userId, period = 'today') => {
  await simulateAPICall();
  
  const validUserId = validateUserId(userId);
  if (!validUserId) {
    console.warn('Invalid user ID provided:', userId);
    return [];
  }
  
  const fallback = [];
  
  return safeServiceCall(async () => {
    const { getLeads } = await import("@/services/api/leadsService");
    const leadsData = await getLeads();
    
    if (!leadsData?.leads || !Array.isArray(leadsData.leads)) {
      return fallback;
    }
    
    const allLeads = leadsData.leads;
    
    // Filter leads by user
    const userLeads = allLeads.filter(lead => 
      lead.addedBy === validUserId
    );
    
    // Get date range for filtering
    const { start: startDate, end: endDate } = getDateRange(period);
    
    // Filter leads by date range
    const filteredLeads = userLeads.filter(lead => {
      if (!lead.createdAt) return false;
      
      const leadDate = new Date(lead.createdAt);
      return leadDate >= startDate && leadDate < endDate;
    });
    
    // Sort by creation date (most recent first) and ensure data integrity
    return filteredLeads
      .map(lead => ({
        ...lead,
        Id: lead.Id || Math.random(),
        websiteUrl: lead.websiteUrl || 'Unknown URL',
        category: lead.category || 'General',
        createdAt: lead.createdAt || new Date().toISOString()
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, fallback);
};