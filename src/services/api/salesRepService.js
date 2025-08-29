// Initialize ApperClient with Project ID and Public Key
const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

const tableName = 'sales_rep_c';

export const getSalesReps = async () => {
  try {
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "Owner" } },
        { field: { Name: "CreatedOn" } },
        { field: { Name: "CreatedBy" } },
        { field: { Name: "ModifiedOn" } },
        { field: { Name: "ModifiedBy" } },
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
      ],
      pagingInfo: {
        limit: 1000,
        offset: 0
      }
    };
    
    const response = await apperClient.fetchRecords(tableName, params);
    
    if (!response.success) {
      console.error("Error fetching sales reps:", response.message);
      throw new Error(response.message);
    }
    
    return response.data || [];
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error fetching sales reps:", error?.response?.data?.message);
    } else {
      console.error("Error fetching sales reps:", error);
    }
    throw error;
  }
};

export const getSalesRepById = async (id) => {
  try {
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "Owner" } },
        { field: { Name: "CreatedOn" } },
        { field: { Name: "CreatedBy" } },
        { field: { Name: "ModifiedOn" } },
        { field: { Name: "ModifiedBy" } },
        { field: { Name: "leads_contacted_c" } },
        { field: { Name: "meetings_booked_c" } },
        { field: { Name: "deals_closed_c" } },
        { field: { Name: "total_revenue_c" } }
      ]
    };
    
    const response = await apperClient.getRecordById(tableName, id, params);
    
    if (!response.success) {
      console.error("Error fetching sales rep:", response.message);
      throw new Error(response.message);
    }
    
    return response.data;
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error fetching sales rep:", error?.response?.data?.message);
    } else {
      console.error("Error fetching sales rep:", error);
    }
    throw error;
  }
};

export const createSalesRep = async (repData) => {
  try {
    const params = {
      records: [
        {
          Name: repData.Name || repData.name || "",
          leads_contacted_c: parseInt(repData.leads_contacted_c || repData.leadsContacted || 0),
          meetings_booked_c: parseInt(repData.meetings_booked_c || repData.meetingsBooked || 0),
          deals_closed_c: parseInt(repData.deals_closed_c || repData.dealsClosed || 0),
          total_revenue_c: parseFloat(repData.total_revenue_c || repData.totalRevenue || 0)
        }
      ]
    };
    
    const response = await apperClient.createRecord(tableName, params);
    
    if (!response.success) {
      console.error("Error creating sales rep:", response.message);
      throw new Error(response.message);
    }
    
    if (response.results) {
      const successfulRecords = response.results.filter(result => result.success);
      const failedRecords = response.results.filter(result => !result.success);
      
      if (failedRecords.length > 0) {
        console.error(`Failed to create sales rep records:${JSON.stringify(failedRecords)}`);
        
        failedRecords.forEach(record => {
          record.errors?.forEach(error => {
            throw new Error(`${error.fieldLabel}: ${error}`);
          });
          if (record.message) throw new Error(record.message);
        });
      }
      
      return successfulRecords[0]?.data;
    }
    
    return null;
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error creating sales rep:", error?.response?.data?.message);
    } else {
      console.error("Error creating sales rep:", error);
    }
    throw error;
  }
};

export const updateSalesRep = async (id, updates) => {
  try {
    // Prepare update data with only Updateable fields
    const updateData = {
      Id: id
    };
    
    // Map old field names to new database field names
    if (updates.Name !== undefined || updates.name !== undefined) updateData.Name = updates.Name || updates.name;
    if (updates.leads_contacted_c !== undefined || updates.leadsContacted !== undefined) updateData.leads_contacted_c = parseInt(updates.leads_contacted_c || updates.leadsContacted);
    if (updates.meetings_booked_c !== undefined || updates.meetingsBooked !== undefined) updateData.meetings_booked_c = parseInt(updates.meetings_booked_c || updates.meetingsBooked);
    if (updates.deals_closed_c !== undefined || updates.dealsClosed !== undefined) updateData.deals_closed_c = parseInt(updates.deals_closed_c || updates.dealsClosed);
    if (updates.total_revenue_c !== undefined || updates.totalRevenue !== undefined) updateData.total_revenue_c = parseFloat(updates.total_revenue_c || updates.totalRevenue);
    
    const params = {
      records: [updateData]
    };
    
    const response = await apperClient.updateRecord(tableName, params);
    
    if (!response.success) {
      console.error("Error updating sales rep:", response.message);
      throw new Error(response.message);
    }
    
    if (response.results) {
      const successfulUpdates = response.results.filter(result => result.success);
      const failedUpdates = response.results.filter(result => !result.success);
      
      if (failedUpdates.length > 0) {
        console.error(`Failed to update sales rep records:${JSON.stringify(failedUpdates)}`);
        
        failedUpdates.forEach(record => {
          record.errors?.forEach(error => {
            throw new Error(`${error.fieldLabel}: ${error}`);
          });
          if (record.message) throw new Error(record.message);
        });
      }
      
      return successfulUpdates[0]?.data;
    }
    
    return null;
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error updating sales rep:", error?.response?.data?.message);
    } else {
      console.error("Error updating sales rep:", error);
    }
    throw error;
  }
};

export const deleteSalesRep = async (id) => {
  try {
    const params = {
      RecordIds: [id]
    };
    
    const response = await apperClient.deleteRecord(tableName, params);
    
    if (!response.success) {
      console.error("Error deleting sales rep:", response.message);
      throw new Error(response.message);
    }
    
    if (response.results) {
      const failedDeletions = response.results.filter(result => !result.success);
      
      if (failedDeletions.length > 0) {
        console.error(`Failed to delete sales rep records:${JSON.stringify(failedDeletions)}`);
        
        failedDeletions.forEach(record => {
          if (record.message) throw new Error(record.message);
        });
      }
      
      return { success: true };
    }
    
    return { success: true };
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error deleting sales rep:", error?.response?.data?.message);
    } else {
      console.error("Error deleting sales rep:", error);
    }
    throw error;
  }
};