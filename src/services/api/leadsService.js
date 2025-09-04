// Initialize ApperClient with Project ID and Public Key
const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

const tableName = 'lead_c';

export const getLeads = async () => {
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
        { field: { Name: "email_c" } },
        { field: { Name: "website_url_c" } },
        { field: { Name: "team_size_c" } },
        { field: { Name: "arr_c" } },
        { field: { Name: "category_c" } },
        { field: { Name: "linkedin_url_c" } },
        { field: { Name: "status_c" } },
        { field: { Name: "funding_type_c" } },
        { field: { Name: "follow_up_date_c" } },
        { field: { Name: "edition_c" } },
        { field: { Name: "product_name_c" } },
        { field: { Name: "added_by_name_c" } },
        { field: { Name: "added_by_c" } }
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
    
    const response = await apperClient.fetchRecords(tableName, params);
    
    if (!response.success) {
      console.error("Error fetching leads:", response.message);
      throw new Error(response.message);
    }
    
    const leads = response.data || [];
    return {
      leads: leads,
      deduplicationResult: null // No deduplication needed with database
    };
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error fetching leads:", error?.response?.data?.message);
    } else {
      console.error("Error fetching leads:", error);
    }
    throw error;
  }
};

export const getLeadById = async (id) => {
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
        { field: { Name: "email_c" } },
        { field: { Name: "website_url_c" } },
        { field: { Name: "team_size_c" } },
        { field: { Name: "arr_c" } },
        { field: { Name: "category_c" } },
        { field: { Name: "linkedin_url_c" } },
        { field: { Name: "status_c" } },
        { field: { Name: "funding_type_c" } },
        { field: { Name: "follow_up_date_c" } },
        { field: { Name: "edition_c" } },
        { field: { Name: "product_name_c" } },
        { field: { Name: "added_by_name_c" } },
        { field: { Name: "added_by_c" } }
      ]
    };
    
    const response = await apperClient.getRecordById(tableName, id, params);
    
    if (!response.success) {
      console.error("Error fetching lead:", response.message);
      throw new Error(response.message);
    }
    
    return response.data;
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error fetching lead:", error?.response?.data?.message);
    } else {
      console.error("Error fetching lead:", error);
    }
    throw error;
  }
};

export const createLead = async (leadData) => {
  try {
    const params = {
      records: [
        {
          Name: leadData.Name || leadData.name || "",
          email_c: leadData.email_c || leadData.email || "",
          website_url_c: leadData.website_url_c || leadData.websiteUrl || "",
          team_size_c: leadData.team_size_c || leadData.teamSize || "1-3",
          arr_c: parseFloat(leadData.arr_c || leadData.arr || 0),
          category_c: leadData.category_c || leadData.category || "",
          linkedin_url_c: leadData.linkedin_url_c || leadData.linkedinUrl || "",
          status_c: leadData.status_c || leadData.status || "Keep an Eye",
          funding_type_c: leadData.funding_type_c || leadData.fundingType || "Bootstrapped",
          follow_up_date_c: leadData.follow_up_date_c || leadData.followUpDate || null,
          edition_c: leadData.edition_c || leadData.edition || "Select Edition",
          product_name_c: leadData.product_name_c || leadData.productName || "",
          added_by_name_c: leadData.added_by_name_c || leadData.addedByName || "",
          added_by_c: parseInt(leadData.added_by_c || leadData.addedBy || 1)
        }
      ]
    };
    
    const response = await apperClient.createRecord(tableName, params);
    
    if (!response.success) {
      console.error("Error creating lead:", response.message);
      throw new Error(response.message);
    }
    
    if (response.results) {
      const successfulRecords = response.results.filter(result => result.success);
      const failedRecords = response.results.filter(result => !result.success);
      
      if (failedRecords.length > 0) {
        console.error(`Failed to create lead records:${JSON.stringify(failedRecords)}`);
        
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
      console.error("Error creating lead:", error?.response?.data?.message);
    } else {
      console.error("Error creating lead:", error);
    }
    throw error;
  }
};

export const updateLead = async (id, updates) => {
  try {
    // Prepare update data with only Updateable fields
    const updateData = {
      Id: id
    };
    
    // Map old field names to new database field names
    if (updates.Name !== undefined || updates.name !== undefined) updateData.Name = updates.Name || updates.name;
    if (updates.email_c !== undefined || updates.email !== undefined) updateData.email_c = updates.email_c || updates.email;
    if (updates.website_url_c !== undefined || updates.websiteUrl !== undefined) updateData.website_url_c = updates.website_url_c || updates.websiteUrl;
    if (updates.team_size_c !== undefined || updates.teamSize !== undefined) updateData.team_size_c = updates.team_size_c || updates.teamSize;
    if (updates.arr_c !== undefined || updates.arr !== undefined) updateData.arr_c = parseFloat(updates.arr_c || updates.arr);
    if (updates.category_c !== undefined || updates.category !== undefined) updateData.category_c = updates.category_c || updates.category;
    if (updates.linkedin_url_c !== undefined || updates.linkedinUrl !== undefined) updateData.linkedin_url_c = updates.linkedin_url_c || updates.linkedinUrl;
    if (updates.status_c !== undefined || updates.status !== undefined) updateData.status_c = updates.status_c || updates.status;
    if (updates.funding_type_c !== undefined || updates.fundingType !== undefined) updateData.funding_type_c = updates.funding_type_c || updates.fundingType;
    if (updates.follow_up_date_c !== undefined || updates.followUpDate !== undefined) updateData.follow_up_date_c = updates.follow_up_date_c || updates.followUpDate;
    if (updates.edition_c !== undefined || updates.edition !== undefined) updateData.edition_c = updates.edition_c || updates.edition;
    if (updates.product_name_c !== undefined || updates.productName !== undefined) updateData.product_name_c = updates.product_name_c || updates.productName;
    if (updates.added_by_name_c !== undefined || updates.addedByName !== undefined) updateData.added_by_name_c = updates.added_by_name_c || updates.addedByName;
    if (updates.added_by_c !== undefined || updates.addedBy !== undefined) updateData.added_by_c = parseInt(updates.added_by_c || updates.addedBy);
    
    const params = {
      records: [updateData]
    };
    
    const response = await apperClient.updateRecord(tableName, params);
    
    if (!response.success) {
      console.error("Error updating lead:", response.message);
      throw new Error(response.message);
    }
    
    let updatedLead = null;
    
    if (response.results) {
      const successfulUpdates = response.results.filter(result => result.success);
      const failedUpdates = response.results.filter(result => !result.success);
      
      if (failedUpdates.length > 0) {
        console.error(`Failed to update lead records:${JSON.stringify(failedUpdates)}`);
        
        failedUpdates.forEach(record => {
          record.errors?.forEach(error => {
            throw new Error(`${error.fieldLabel}: ${error}`);
          });
          if (record.message) throw new Error(record.message);
        });
      }
      
      updatedLead = successfulUpdates[0]?.data;
    }
    
    // Check if status was updated to a qualifying status for deal creation
    const newStatus = updates.status_c || updates.status;
    const qualifyingStatuses = ["Connected", "Locked", "Meeting Booked", "Meeting Done", "Lost", "Closed", "Negotiation"];
    
    if (newStatus && qualifyingStatuses.includes(newStatus)) {
      try {
        // Get the current lead data to create deal
        const leadData = await getLeadById(id);
        
        if (leadData) {
          // Import createDeal function dynamically to avoid circular imports
          const { createDeal } = await import('./dealsService.js');
          
          // Map lead status to deal stage
          const statusToStageMap = {
            "Connected": "Connected",
            "Locked": "Locked",
            "Meeting Booked": "Meeting Booked", 
            "Meeting Done": "Meeting Done",
            "Negotiation": "Negotiation",
            "Lost": "Lost",
            "Closed": "Closed"
          };
          
          // Prepare deal data from lead information
          const dealData = {
Name: leadData.product_name_c || `Deal - ${leadData.Name || 'Unnamed Lead'}`,
            lead_name_c: leadData.Name || '',
            lead_id_c: leadData.Id?.toString() || id.toString(),
            value_c: leadData.arr_c || 0,
            stage_c: statusToStageMap[newStatus] || newStatus,
            assigned_rep_c: leadData.added_by_name_c || 'Unassigned',
            edition_c: leadData.edition_c || 'Select Edition',
            start_month_c: new Date().getMonth() + 1,
            end_month_c: (new Date().getMonth() + 13) % 12 || 12
          };
          
          // Create the deal
          await createDeal(dealData);
          console.log(`Deal automatically created for lead ${id} with status ${newStatus}`);
        }
      } catch (dealError) {
        // Log deal creation error but don't fail the lead update
        console.error(`Error creating deal for lead ${id}:`, dealError?.response?.data?.message || dealError.message || dealError);
      }
    }
    
    return updatedLead;
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error updating lead:", error?.response?.data?.message);
    } else {
      console.error("Error updating lead:", error);
    }
    throw error;
  }
};

export const deleteLead = async (id) => {
  try {
    const params = {
      RecordIds: [id]
    };
    
    const response = await apperClient.deleteRecord(tableName, params);
    
    if (!response.success) {
      console.error("Error deleting lead:", response.message);
      throw new Error(response.message);
    }
    
    if (response.results) {
      const failedDeletions = response.results.filter(result => !result.success);
      
      if (failedDeletions.length > 0) {
        console.error(`Failed to delete lead records:${JSON.stringify(failedDeletions)}`);
        
        failedDeletions.forEach(record => {
          if (record.message) throw new Error(record.message);
        });
      }
      
      return { success: true };
    }
    
    return { success: true };
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error deleting lead:", error?.response?.data?.message);
    } else {
      console.error("Error deleting lead:", error);
    }
    throw error;
  }
};

export const getDailyLeadsReport = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "CreatedOn" } },
        { field: { Name: "added_by_name_c" } },
        { field: { Name: "added_by_c" } }
      ],
      where: [
        {
          FieldName: "CreatedOn",
          Operator: "RelativeMatch",
          Values: ["Today"]
        }
      ],
      orderBy: [
        {
          fieldName: "CreatedOn",
          sorttype: "DESC"
        }
      ]
    };
    
    const response = await apperClient.fetchRecords(tableName, params);
    
    if (!response.success) {
      console.error("Error fetching daily leads:", response.message);
      return [];
    }
    
    const todaysLeads = response.data || [];
    
    return [{
      salesRep: 'Daily Leads',
      salesRepId: 0,
      leads: todaysLeads,
      leadCount: todaysLeads.length,
      lowPerformance: todaysLeads.length < 5
    }];
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error fetching daily leads:", error?.response?.data?.message);
    } else {
      console.error("Error fetching daily leads:", error);
    }
    return [];
  }
};

export const getPendingFollowUps = async () => {
  try {
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "website_url_c" } },
        { field: { Name: "category_c" } },
        { field: { Name: "follow_up_date_c" } }
      ],
      where: [
        {
          FieldName: "follow_up_date_c",
          Operator: "RelativeMatch",
          Values: ["next 7 days"]
        }
      ],
      orderBy: [
        {
          fieldName: "follow_up_date_c",
          sorttype: "ASC"
        }
      ]
    };
    
    const response = await apperClient.fetchRecords(tableName, params);
    
    if (!response.success) {
      console.error("Error fetching pending follow-ups:", response.message);
      return [];
    }
    
    return response.data || [];
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error fetching pending follow-ups:", error?.response?.data?.message);
    } else {
      console.error("Error fetching pending follow-ups:", error);
    }
    return [];
  }
};

export const getFreshLeadsOnly = async (leadsArray) => {
  // For database implementation, return all leads as they are already fresh
  return leadsArray || [];
};