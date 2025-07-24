import dealsData from "@/services/mockData/deals.json";

let deals = [...dealsData];

export const getDeals = async (year = null) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (year) {
    const currentYear = new Date().getFullYear();
    const filteredDeals = deals.filter(deal => {
      const dealYear = deal.year || currentYear;
      return dealYear === year;
    });
    return [...filteredDeals];
  }
  
  return [...deals];
};

export const getDealById = async (id) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const deal = deals.find(d => d.Id === id);
  if (!deal) {
    throw new Error("Deal not found");
  }
  
  return { ...deal };
};

export const createDeal = async (dealData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const maxId = Math.max(...deals.map(d => d.Id));
  const newDeal = {
    ...dealData,
    leadName: dealData.leadName || dealData.name || "Unknown Lead",
    Id: maxId + 1,
    createdAt: new Date().toISOString()
  };
  
  deals.push(newDeal);
  return { ...newDeal };
};

export const updateDeal = async (id, updates) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = deals.findIndex(d => d.Id === id);
  if (index === -1) {
    throw new Error("Deal not found");
  }
  
  deals[index] = { ...deals[index], ...updates };
  return { ...deals[index] };
};

export const deleteDeal = async (id) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = deals.findIndex(d => d.Id === id);
  if (index === -1) {
    throw new Error("Deal not found");
  }
  
  deals.splice(index, 1);
  return { success: true };
};