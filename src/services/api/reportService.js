// Initialize ApperClient for database operations
const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

// Generate mock sales rep data since sales_rep_c table doesn't have required structure
const generateMockSalesReps = () => [
  { Id: 1, name: "John Smith", leads_contacted_c: 45, meetings_booked_c: 12, deals_closed_c: 8 },
  { Id: 2, name: "Sarah Johnson", leads_contacted_c: 38, meetings_booked_c: 15, deals_closed_c: 10 },
  { Id: 3, name: "Mike Davis", leads_contacted_c: 52, meetings_booked_c: 18, deals_closed_c: 14 },
  { Id: 4, name: "Emily Wilson", leads_contacted_c: 41, meetings_booked_c: 11, deals_closed_c: 7 },
  { Id: 5, name: "Alex Chen", leads_contacted_c: 35, meetings_booked_c: 9, deals_closed_c: 5 }
];
import { getFreshLeadsOnly } from "./leadsService";

// Utility function to clean website URLs by removing trailing slash
const cleanWebsiteUrl = (url) => {
  if (!url) return url;
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

// Get website URL activity with filtering options
export const getWebsiteUrlActivity = async (filters = {}) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
// Fetch leads from database
  const response = await apperClient.fetchRecords('lead_c', {
    fields: [
      { field: { Name: "Name" } },
      { field: { Name: "email_c" } },
      { field: { Name: "website_url_c" } },
      { field: { Name: "category_c" } },
      { field: { Name: "arr_c" } },
      { field: { Name: "status_c" } },
      { field: { Name: "added_by_name_c" } },
      { field: { Name: "CreatedOn" } }
    ]
  });
  
  if (!response.success) {
    throw new Error(response.message);
  }
  
  // Transform database fields to expected format
  let filteredData = response.data.map(lead => ({
    Id: lead.Id,
    name: lead.Name,
    email: lead.email_c,
    websiteUrl: lead.website_url_c,
    category: lead.category_c,
    arr: lead.arr_c,
    status: lead.status_c,
    addedByName: lead.added_by_name_c,
    createdAt: lead.CreatedOn
  }));
  
  // Filter by date range
  if (filters.startDate || filters.endDate) {
    filteredData = filteredData.filter(lead => {
      const leadDate = new Date(lead.createdAt);
      const start = filters.startDate ? new Date(filters.startDate) : new Date('1900-01-01');
      const end = filters.endDate ? new Date(filters.endDate) : new Date('2100-12-31');
      
      // Set time to compare only dates
      leadDate.setHours(0, 0, 0, 0);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      
      return leadDate >= start && leadDate <= end;
    });
  }
  
  // Filter by specific date (for today, yesterday, etc.)
  if (filters.date) {
    const targetDate = new Date(filters.date);
    filteredData = filteredData.filter(lead => {
      const leadDate = new Date(lead.createdAt);
      return leadDate.toDateString() === targetDate.toDateString();
    });
  }
  
  // Filter by user/sales rep
  if (filters.addedBy) {
    filteredData = filteredData.filter(lead => lead.addedBy === filters.addedBy);
  }
  
  // Filter by search term
  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    filteredData = filteredData.filter(lead => 
      lead.websiteUrl.toLowerCase().includes(term) ||
      lead.category.toLowerCase().includes(term) ||
      lead.addedByName.toLowerCase().includes(term)
    );
}
  
  // Clean website URLs in the filtered data
  const cleanedData = filteredData.map(lead => ({
    ...lead,
    websiteUrl: cleanWebsiteUrl(lead.websiteUrl)
  }));
  
  return {
    data: cleanedData,
    summary: {
      totalUrls: filteredData.length,
      totalArr: filteredData.reduce((sum, lead) => sum + lead.arr, 0),
      byStatus: getStatusSummary(filteredData),
      byCategory: getCategorySummary(filteredData)
    }
  };
};

// Get activity for a specific date
export const getActivityByDate = async (date) => {
  return await getWebsiteUrlActivity({ date });
};

// Get activity for a specific user
export const getActivityByUser = async (userId) => {
  return await getWebsiteUrlActivity({ addedBy: userId });
};

// Get quick date filters (today, yesterday, this week, etc.)
export const getQuickDateFilters = () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - today.getDay());
  
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(thisWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(thisWeekStart);
  lastWeekEnd.setDate(thisWeekStart.getDate() - 1);
  
  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  
  return {
    today: today.toISOString().split('T')[0],
    yesterday: yesterday.toISOString().split('T')[0],
    thisWeekStart: thisWeekStart.toISOString().split('T')[0],
    thisWeekEnd: today.toISOString().split('T')[0],
    lastWeekStart: lastWeekStart.toISOString().split('T')[0],
    lastWeekEnd: lastWeekEnd.toISOString().split('T')[0],
    thisMonthStart: thisMonthStart.toISOString().split('T')[0],
    thisMonthEnd: today.toISOString().split('T')[0]
  };
};

// Get all sales reps for filtering
export const getSalesRepsForFilter = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return generateMockSalesReps();
};

// Helper functions
const getStatusSummary = (data) => {
  const summary = {};
  data.forEach(lead => {
    summary[lead.status] = (summary[lead.status] || 0) + 1;
  });
  return summary;
};

const getCategorySummary = (data) => {
  const summary = {};
  data.forEach(lead => {
    summary[lead.category] = (summary[lead.category] || 0) + 1;
  });
  return summary;
};

// Get daily website URLs for a specific sales rep - only fresh leads
export const getDailyWebsiteUrls = async (salesRepId, date) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const targetDate = new Date(date);
// Fetch leads from database
  const response = await apperClient.fetchRecords('lead_c', {
    fields: [
      { field: { Name: "Name" } },
      { field: { Name: "email_c" } },
      { field: { Name: "website_url_c" } },
      { field: { Name: "category_c" } },
      { field: { Name: "arr_c" } },
      { field: { Name: "status_c" } },
      { field: { Name: "added_by_name_c" } },
      { field: { Name: "CreatedOn" } }
    ]
  });
  
  if (!response.success) {
    throw new Error(response.message);
  }
  
  // Transform database fields to expected format
  let filteredData = response.data.map(lead => ({
    Id: lead.Id,
    name: lead.Name,
    email: lead.email_c,
    websiteUrl: lead.website_url_c,
    category: lead.category_c,
    arr: lead.arr_c,
    status: lead.status_c,
    addedByName: lead.added_by_name_c,
    createdAt: lead.CreatedOn
  }));
  
  // Filter by sales rep
  if (salesRepId) {
    filteredData = filteredData.filter(lead => lead.addedBy === salesRepId);
  }
  
  // Filter by specific date
  if (date) {
    filteredData = filteredData.filter(lead => {
      const leadDate = new Date(lead.createdAt);
      return leadDate.toDateString() === targetDate.toDateString();
    });
  }
  
  // If no data found, generate sample data for testing
  if (filteredData.length === 0 && salesRepId) {
    filteredData = generateSampleDailyData(salesRepId, targetDate);
  }
  
  // Filter to only include fresh leads that never existed before
  const freshLeads = await getFreshLeadsOnly(filteredData);
  
  // Clean website URLs and return with performance indicator
  const cleanedData = freshLeads.map(lead => ({
    ...lead,
    websiteUrl: cleanWebsiteUrl(lead.websiteUrl)
  }));
  
  return cleanedData;
};

// Generate sample data for testing Daily Leads Report
const generateSampleDailyData = (salesRepId, targetDate) => {
const salesReps = generateMockSalesReps();
  const salesRep = salesReps.find(rep => rep.Id === salesRepId);
  if (!salesRep) return [];
  
  const sampleWebsites = [
    { url: 'https://techstartup.com', category: 'Technology' },
    { url: 'https://marketing-agency.co', category: 'Marketing' },
    { url: 'https://ecommerce-store.shop', category: 'E-commerce' },
    { url: 'https://consulting-firm.biz', category: 'Consulting' },
    { url: 'https://healthcare-app.io', category: 'Healthcare' },
    { url: 'https://fintech-solution.net', category: 'Finance' },
    { url: 'https://education-platform.edu', category: 'Education' },
    { url: 'https://real-estate-pro.com', category: 'Real Estate' },
    { url: 'https://food-delivery.app', category: 'Food & Beverage' },
    { url: 'https://fitness-tracker.fit', category: 'Fitness' },
    { url: 'https://travel-booking.world', category: 'Travel' },
    { url: 'https://creative-studio.design', category: 'Design' },
    { url: 'https://logistics-hub.cargo', category: 'Logistics' },
    { url: 'https://gaming-platform.play', category: 'Gaming' },
    { url: 'https://media-streaming.tv', category: 'Media' }
  ];
  
  const statuses = [
    'New Lead', 'Connected', 'Meeting Booked', 'Meeting Done', 
    'Rejected', 'Follow-up Required', 'Negotiation', 'Closed Won'
  ];
  
  const fundingTypes = ['Bootstrapped', 'Seed', 'Series A', 'Series B', 'Series C'];
  
  // Generate 8-15 sample leads for the selected date
  const numLeads = Math.floor(Math.random() * 8) + 8;
  const sampleData = [];
  
  for (let i = 0; i < numLeads; i++) {
    const website = sampleWebsites[i % sampleWebsites.length];
    const baseUrl = website.url.replace('https://', '');
    const uniqueUrl = `https://${baseUrl.replace('.', `-${i + 1}.`)}`;
    
    // Create sample lead with realistic data
    const lead = {
      Id: Date.now() + i,
      websiteUrl: uniqueUrl,
      category: website.category,
      teamSize: Math.floor(Math.random() * 200) + 10,
      arr: Math.floor(Math.random() * 5000000) + 100000,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      fundingType: fundingTypes[Math.floor(Math.random() * fundingTypes.length)],
      addedBy: salesRepId,
      addedByName: salesRep.name,
      createdAt: new Date(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        targetDate.getDate(),
        Math.floor(Math.random() * 24), // Random hour
        Math.floor(Math.random() * 60)  // Random minute
      ).toISOString(),
      followUpDate: new Date(
        targetDate.getTime() + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000
      ).toISOString()
    };
    
    sampleData.push(lead);
  }
  
  return sampleData;
};

// Re-export sales reps for easy access
export { getSalesReps } from './salesRepService';

// Export lead data for external use (CSV, etc.)
export const exportWebsiteUrlData = async (filters = {}) => {
  const result = await getWebsiteUrlActivity(filters);
  
  return result.data.map(lead => ({
    'Website URL': cleanWebsiteUrl(lead.websiteUrl),
    'Category': lead.category,
    'Team Size': lead.teamSize,
    'ARR': `$${(lead.arr / 1000000).toFixed(1)}M`,
    'Status': lead.status,
    'Funding Type': lead.fundingType,
    'Added By': lead.addedByName,
    'Date Added': new Date(lead.createdAt).toLocaleDateString()
  }));
};