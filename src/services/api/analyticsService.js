// Initialize ApperClient for database operations
const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

// Helper function to initialize ApperClient
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};
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

// Helper function to get leads from database with filtering
const getLeadsData = async (period = 'all', userId = 'all') => {
  try {
    const apperClient = getApperClient();
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "CreatedOn" } },
        { field: { Name: "status_c" } },
        { field: { Name: "category_c" } },
        { field: { Name: "added_by_c" } },
        { field: { Name: "added_by_name_c" } }
      ],
      where: [],
      orderBy: [
        {
          fieldName: "CreatedOn",
          sorttype: "DESC"
        }
      ],
      pagingInfo: {
        limit: 1000,
        offset: 0
      }
    };

    // Add user filter if specified
    if (userId !== 'all') {
      params.where.push({
        FieldName: "added_by_c",
        Operator: "EqualTo",
        Values: [parseInt(userId)]
      });
    }

    // Add date filter if specified
    if (period !== 'all') {
      let dateValue;
      switch (period) {
        case 'today':
          dateValue = "Today";
          break;
        case 'yesterday':
          dateValue = "Yesterday";
          break;
        case 'week':
          dateValue = "this week";
          break;
        case 'month':
          dateValue = "this month";
          break;
        default:
          dateValue = null;
      }
      
      if (dateValue) {
        params.where.push({
          FieldName: "CreatedOn",
          Operator: "RelativeMatch",
          Values: [dateValue]
        });
      }
    }

    const response = await apperClient.fetchRecords('lead_c', params);
    
    if (!response.success) {
      console.error('Error fetching leads:', response.message);
      return [];
    }

    return response.data || [];
  } catch (error) {
    console.error('Error in getLeadsData:', error);
    return [];
  }
};

// Helper function to get sales reps data
const getSalesRepsData = async () => {
  try {
    const apperClient = getApperClient();
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "leads_contacted_c" } },
        { field: { Name: "meetings_booked_c" } },
        { field: { Name: "deals_closed_c" } },
        { field: { Name: "total_revenue_c" } }
      ],
      orderBy: [
        {
          fieldName: "Name",
          sorttype: "ASC"
        }
      ]
    };

    const response = await apperClient.fetchRecords('sales_rep_c', params);
    
    if (!response.success) {
      console.error('Error fetching sales reps:', response.message);
      return [];
    }

    return response.data || [];
  } catch (error) {
    console.error('Error in getSalesRepsData:', error);
    return [];
  }
};

export const getLeadsAnalytics = async (period = 'all', userId = 'all') => {
  try {
    const leads = await getLeadsData(period, userId);
    
    // Transform data to match expected format
    const transformedLeads = leads.map(lead => ({
      Id: lead.Id,
      name: lead.Name,
      status: lead.status_c,
      category: lead.category_c,
      createdAt: lead.CreatedOn,
      addedBy: lead.added_by_c?.Id || lead.added_by_c,
      addedByName: lead.added_by_name_c || lead.added_by_c?.Name || 'Unknown'
    }));

    return {
      leads: transformedLeads,
      totalCount: transformedLeads.length
    };
  } catch (error) {
    console.error('Error in getLeadsAnalytics:', error);
    return {
      leads: [],
      totalCount: 0
    };
  }
};

export const getDailyLeadsChart = async (userId = 'all', days = 30) => {
  try {
    // Get all leads data (we'll filter by date on the frontend since we need specific day-by-day data)
    const leads = await getLeadsData('all', userId);
    
    const now = new Date();
    const chartData = [];
    
    // Generate data for the last X days
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      // Filter leads for this specific day
      const dayLeads = leads.filter(lead => {
        if (!lead.CreatedOn) return false;
        const leadDate = new Date(lead.CreatedOn).toISOString().split('T')[0];
        return leadDate === dateStr;
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
  } catch (error) {
    console.error('Error in getDailyLeadsChart:', error);
    return {
      chartData: [],
      categories: [],
      series: [{ name: 'New Leads', data: [] }]
    };
  }
};

export const getLeadsMetrics = async (userId = 'all') => {
  try {
    const [today, yesterday, thisWeek, thisMonth, allLeads] = await Promise.all([
      getLeadsData('today', userId),
      getLeadsData('yesterday', userId),
      getLeadsData('week', userId),
      getLeadsData('month', userId),
      getLeadsData('all', userId)
    ]);
    
    // Calculate counts
    const todayCount = today.length;
    const yesterdayCount = yesterday.length;
    const weekCount = thisWeek.length;
    const monthCount = thisMonth.length;
    
    // Calculate percentage changes
    const todayTrend = yesterdayCount === 0 ? 100 : 
      Math.round(((todayCount - yesterdayCount) / yesterdayCount) * 100);
    
    // Get status distribution
    const statusCounts = allLeads.reduce((acc, lead) => {
      const status = lead.status_c || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    // Get category distribution
    const categoryCounts = allLeads.reduce((acc, lead) => {
      const category = lead.category_c || 'Unknown';
      acc[category] = (acc[category] || 0) + 1;
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
      totalLeads: allLeads.length
    };
  } catch (error) {
    console.error('Error in getLeadsMetrics:', error);
    return {
      metrics: {
        today: { count: 0, trend: 0, label: 'Today' },
        yesterday: { count: 0, label: 'Yesterday' },
        week: { count: 0, label: 'This Week' },
        month: { count: 0, label: 'This Month' }
      },
      statusDistribution: {},
      categoryDistribution: {},
      totalLeads: 0
    };
  }
};

export const getUserPerformance = async () => {
  try {
    const salesReps = await getSalesRepsData();
    
    const userStats = await Promise.all(
      salesReps.map(async (rep) => {
        const [userLeads, todayLeads, weekLeads, monthLeads] = await Promise.all([
          getLeadsData('all', rep.Id.toString()),
          getLeadsData('today', rep.Id.toString()),
          getLeadsData('week', rep.Id.toString()),
          getLeadsData('month', rep.Id.toString())
        ]);
        
        const meetingsBooked = rep.meetings_booked_c || 0;
        const dealsClosed = rep.deals_closed_c || 0;
        
        return {
          Id: rep.Id,
          name: rep.Name,
          leadsContacted: rep.leads_contacted_c || 0,
          meetingsBooked: meetingsBooked,
          dealsClosed: dealsClosed,
          totalRevenue: rep.total_revenue_c || 0,
          totalLeads: userLeads.length,
          todayLeads: todayLeads.length,
          weekLeads: weekLeads.length,
          monthLeads: monthLeads.length,
          conversionRate: meetingsBooked > 0 ? 
            Math.round((dealsClosed / meetingsBooked) * 100) : 0
        };
      })
    );
    
    return userStats.sort((a, b) => b.totalLeads - a.totalLeads);
  } catch (error) {
    console.error('Error in getUserPerformance:', error);
    return [];
  }
};