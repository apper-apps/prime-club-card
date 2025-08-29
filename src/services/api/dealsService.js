// Initialize ApperClient with Project ID and Public Key
const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

const tableName = 'deal_c';

export const getDeals = async (year = null) => {
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
        { field: { Name: "lead_name_c" } },
        { field: { Name: "lead_id_c" } },
        { field: { Name: "value_c" } },
        { field: { Name: "stage_c" } },
        { field: { Name: "assigned_rep_c" } },
        { field: { Name: "edition_c" } },
        { field: { Name: "start_month_c" } },
        { field: { Name: "end_month_c" } }
      ],
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
    
    // Add year filter if specified
    if (year) {
      params.where = [
        {
          FieldName: "CreatedOn",
          Operator: "ExactMatch",
          SubOperator: "Year",
          Values: [year.toString()]
        }
      ];
    }
    
    const response = await apperClient.fetchRecords(tableName, params);
    
    if (!response.success) {
      console.error("Error fetching deals:", response.message);
      throw new Error(response.message);
    }
    
    return response.data || [];
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error fetching deals:", error?.response?.data?.message);
    } else {
      console.error("Error fetching deals:", error);
    }
    throw error;
  }
};

export const getDealById = async (id) => {
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
        { field: { Name: "lead_name_c" } },
        { field: { Name: "lead_id_c" } },
        { field: { Name: "value_c" } },
        { field: { Name: "stage_c" } },
        { field: { Name: "assigned_rep_c" } },
        { field: { Name: "edition_c" } },
        { field: { Name: "start_month_c" } },
        { field: { Name: "end_month_c" } }
      ]
    };
    
    const response = await apperClient.getRecordById(tableName, id, params);
    
    if (!response.success) {
      console.error("Error fetching deal:", response.message);
      throw new Error(response.message);
    }
    
    return response.data;
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error fetching deal:", error?.response?.data?.message);
    } else {
      console.error("Error fetching deal:", error);
    }
    throw error;
  }
};

export const createDeal = async (dealData) => {
  try {
    const params = {
      records: [
        {
          Name: dealData.Name || dealData.name || "",
          lead_name_c: dealData.lead_name_c || dealData.leadName || "",
          lead_id_c: dealData.lead_id_c || dealData.leadId || "",
          value_c: parseFloat(dealData.value_c || dealData.value || 0),
          stage_c: dealData.stage_c || dealData.stage || "",
          assigned_rep_c: dealData.assigned_rep_c || dealData.assignedRep || "",
          edition_c: dealData.edition_c || dealData.edition || "Select Edition",
          start_month_c: parseInt(dealData.start_month_c || dealData.startMonth || 0),
          end_month_c: parseInt(dealData.end_month_c || dealData.endMonth || 0)
        }
      ]
    };
    
    const response = await apperClient.createRecord(tableName, params);
    
    if (!response.success) {
      console.error("Error creating deal:", response.message);
      throw new Error(response.message);
    }
    
    if (response.results) {
      const successfulRecords = response.results.filter(result => result.success);
      const failedRecords = response.results.filter(result => !result.success);
      
      if (failedRecords.length > 0) {
        console.error(`Failed to create deal records:${JSON.stringify(failedRecords)}`);
        
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
      console.error("Error creating deal:", error?.response?.data?.message);
    } else {
      console.error("Error creating deal:", error);
    }
    throw error;
  }
};

export const updateDeal = async (id, updates) => {
  try {
    // Prepare update data with only Updateable fields
    const updateData = {
      Id: id
    };
    
    // Map old field names to new database field names
    if (updates.Name !== undefined || updates.name !== undefined) updateData.Name = updates.Name || updates.name;
    if (updates.lead_name_c !== undefined || updates.leadName !== undefined) updateData.lead_name_c = updates.lead_name_c || updates.leadName;
    if (updates.lead_id_c !== undefined || updates.leadId !== undefined) updateData.lead_id_c = updates.lead_id_c || updates.leadId;
    if (updates.value_c !== undefined || updates.value !== undefined) updateData.value_c = parseFloat(updates.value_c || updates.value);
    if (updates.stage_c !== undefined || updates.stage !== undefined) updateData.stage_c = updates.stage_c || updates.stage;
    if (updates.assigned_rep_c !== undefined || updates.assignedRep !== undefined) updateData.assigned_rep_c = updates.assigned_rep_c || updates.assignedRep;
    if (updates.edition_c !== undefined || updates.edition !== undefined) updateData.edition_c = updates.edition_c || updates.edition;
    if (updates.start_month_c !== undefined || updates.startMonth !== undefined) updateData.start_month_c = parseInt(updates.start_month_c || updates.startMonth);
    if (updates.end_month_c !== undefined || updates.endMonth !== undefined) updateData.end_month_c = parseInt(updates.end_month_c || updates.endMonth);
    
    const params = {
      records: [updateData]
    };
    
    const response = await apperClient.updateRecord(tableName, params);
    
    if (!response.success) {
      console.error("Error updating deal:", response.message);
      throw new Error(response.message);
    }
    
    if (response.results) {
      const successfulUpdates = response.results.filter(result => result.success);
      const failedUpdates = response.results.filter(result => !result.success);
      
      if (failedUpdates.length > 0) {
        console.error(`Failed to update deal records:${JSON.stringify(failedUpdates)}`);
        
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
      console.error("Error updating deal:", error?.response?.data?.message);
    } else {
      console.error("Error updating deal:", error);
    }
    throw error;
  }
};

export const deleteDeal = async (id) => {
  try {
    const params = {
      RecordIds: [id]
    };
    
    const response = await apperClient.deleteRecord(tableName, params);
    
    if (!response.success) {
      console.error("Error deleting deal:", response.message);
      throw new Error(response.message);
    }
    
    if (response.results) {
      const failedDeletions = response.results.filter(result => !result.success);
      
      if (failedDeletions.length > 0) {
        console.error(`Failed to delete deal records:${JSON.stringify(failedDeletions)}`);
        
        failedDeletions.forEach(record => {
          if (record.message) throw new Error(record.message);
        });
      }
      
      return { success: true };
    }
    
    return { success: true };
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error deleting deal:", error?.response?.data?.message);
    } else {
      console.error("Error deleting deal:", error);
    }
throw error;
  }
};