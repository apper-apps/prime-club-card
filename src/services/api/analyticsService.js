// Initialize ApperClient for database operations
const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

// Import mock data
import { leads, salesReps } from '@/data/mockData';

// Helper function to get date ranges
const getDateRange = (period) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (period) {
    case 'today':
      return {
        start: today,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      };
    case 'yesterday':
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      return {
        start: yesterday,
        end: today
      };
    case 'week':
      const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return {
        start: weekStart,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      };
    case 'month':
      const monthStart = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      return {
        start: monthStart,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      };
    default:
      return {
        start: new Date(0),
        end: new Date()
      };
  }
};

// Helper function to filter leads by date range and user
const filterLeads = (period = 'all', userId = 'all') => {
  let filteredLeads = [...leads];
  
  // Filter by user
  if (userId !== 'all') {
    filteredLeads = filteredLeads.filter(lead => lead.addedBy === parseInt(userId));
  }
  
  // Filter by date range
  if (period !== 'all') {
    const { start, end } = getDateRange(period);
    filteredLeads = filteredLeads.filter(lead => {
      const leadDate = new Date(lead.createdAt);
      return leadDate >= start && leadDate < end;
    });
  }
  
  return filteredLeads;
};

export const getLeadsAnalytics = async (period = 'all', userId = 'all') => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const filteredLeads = filterLeads(period, userId);
  
  // Enhance leads with sales rep names
  const leadsWithRepNames = filteredLeads.map(lead => {
    const salesRep = salesReps.find(rep => rep.Id === lead.addedBy);
    return {
      ...lead,
      addedByName: salesRep ? salesRep.name : 'Unknown'
    };
  });
  
  return {
    leads: leadsWithRepNames,
    totalCount: filteredLeads.length
  };
};

export const getDailyLeadsChart = async (userId = 'all', days = 30) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const now = new Date();
  const chartData = [];
  
  // Generate data for the last X days
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    
    // Filter leads for this specific day and user
    const dayLeads = leads.filter(lead => {
      const leadDate = lead.createdAt.split('T')[0];
      const userMatch = userId === 'all' || lead.addedBy === parseInt(userId);
      return leadDate === dateStr && userMatch;
    });
    
    chartData.push({
      date: dateStr,
      count: dayLeads.length,
      formattedDate: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    });
  }
  
  return {
    chartData,
    categories: chartData.map(item => item.formattedDate),
    series: [
      {
        name: 'New Leads',
        data: chartData.map(item => item.count)
      }
    ]
  };
};

export const getLeadsMetrics = async (userId = 'all') => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 250));
  
  const today = filterLeads('today', userId);
  const yesterday = filterLeads('yesterday', userId);
  const thisWeek = filterLeads('week', userId);
  const thisMonth = filterLeads('month', userId);
  
  // Calculate trends
  const todayCount = today.length;
  const yesterdayCount = yesterday.length;
  const weekCount = thisWeek.length;
  const monthCount = thisMonth.length;
  
  // Calculate percentage changes
  const todayTrend = yesterdayCount === 0 ? 100 : 
    Math.round(((todayCount - yesterdayCount) / yesterdayCount) * 100);
  
  // Get status distribution for the filtered leads
  const allFilteredLeads = filterLeads('all', userId);
  const statusCounts = allFilteredLeads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {});
  
  // Get category distribution
  const categoryCounts = allFilteredLeads.reduce((acc, lead) => {
    acc[lead.category] = (acc[lead.category] || 0) + 1;
    return acc;
  }, {});
  
  return {
    metrics: {
      today: {
        count: todayCount,
        trend: todayTrend,
        label: 'Today'
      },
      yesterday: {
        count: yesterdayCount,
        label: 'Yesterday'
      },
      week: {
        count: weekCount,
        label: 'This Week'
      },
      month: {
        count: monthCount,
        label: 'This Month'
      }
    },
    statusDistribution: statusCounts,
    categoryDistribution: categoryCounts,
    totalLeads: allFilteredLeads.length
  };
};

export const getUserPerformance = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const userStats = salesReps.map(rep => {
    const userLeads = leads.filter(lead => lead.addedBy === rep.Id);
    const todayLeads = filterLeads('today', rep.Id.toString());
    const weekLeads = filterLeads('week', rep.Id.toString());
    const monthLeads = filterLeads('month', rep.Id.toString());
    
    return {
      ...rep,
      totalLeads: userLeads.length,
      todayLeads: todayLeads.length,
      weekLeads: weekLeads.length,
      monthLeads: monthLeads.length,
      conversionRate: rep.meetingsBooked > 0 ? 
        Math.round((rep.dealsClosed / rep.meetingsBooked) * 100) : 0
    };
  });
  
  return userStats.sort((a, b) => b.totalLeads - a.totalLeads);
};