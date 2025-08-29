// Initialize ApperClient with Project ID and Public Key
const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

const tableName = 'contact_c';

export const getContacts = async () => {
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
        { field: { Name: "company_c" } },
        { field: { Name: "status_c" } },
        { field: { Name: "assigned_rep_c" } },
        { field: { Name: "notes_c" } }
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
      console.error("Error fetching contacts:", response.message);
      throw new Error(response.message);
    }
    
    return response.data || [];
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error fetching contacts:", error?.response?.data?.message);
    } else {
      console.error("Error fetching contacts:", error);
    }
    throw error;
  }
};

export const getContactById = async (id) => {
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
        { field: { Name: "company_c" } },
        { field: { Name: "status_c" } },
        { field: { Name: "assigned_rep_c" } },
        { field: { Name: "notes_c" } }
      ]
    };
    
    const response = await apperClient.getRecordById(tableName, id, params);
    
    if (!response.success) {
      console.error("Error fetching contact:", response.message);
      throw new Error(response.message);
    }
    
    return response.data;
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error fetching contact:", error?.response?.data?.message);
    } else {
      console.error("Error fetching contact:", error);
    }
    throw error;
  }
};

export const createContact = async (contactData) => {
  try {
    const params = {
      records: [
        {
          Name: contactData.Name || contactData.name || "",
          email_c: contactData.email_c || contactData.email || "",
          company_c: contactData.company_c || contactData.company || "",
          status_c: contactData.status_c || contactData.status || "New",
          assigned_rep_c: contactData.assigned_rep_c || contactData.assignedRep || "",
          notes_c: contactData.notes_c || contactData.notes || ""
        }
      ]
    };
    
    const response = await apperClient.createRecord(tableName, params);
    
    if (!response.success) {
      console.error("Error creating contact:", response.message);
      throw new Error(response.message);
    }
    
    if (response.results) {
      const successfulRecords = response.results.filter(result => result.success);
      const failedRecords = response.results.filter(result => !result.success);
      
      if (failedRecords.length > 0) {
        console.error(`Failed to create contact records:${JSON.stringify(failedRecords)}`);
        
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
      console.error("Error creating contact:", error?.response?.data?.message);
    } else {
      console.error("Error creating contact:", error);
    }
    throw error;
  }
};

export const updateContact = async (id, updates) => {
  try {
    // Prepare update data with only Updateable fields
    const updateData = {
      Id: id
    };
    
    // Map old field names to new database field names
    if (updates.Name !== undefined || updates.name !== undefined) updateData.Name = updates.Name || updates.name;
    if (updates.email_c !== undefined || updates.email !== undefined) updateData.email_c = updates.email_c || updates.email;
    if (updates.company_c !== undefined || updates.company !== undefined) updateData.company_c = updates.company_c || updates.company;
    if (updates.status_c !== undefined || updates.status !== undefined) updateData.status_c = updates.status_c || updates.status;
    if (updates.assigned_rep_c !== undefined || updates.assignedRep !== undefined) updateData.assigned_rep_c = updates.assigned_rep_c || updates.assignedRep;
    if (updates.notes_c !== undefined || updates.notes !== undefined) updateData.notes_c = updates.notes_c || updates.notes;
    
    const params = {
      records: [updateData]
    };
    
    const response = await apperClient.updateRecord(tableName, params);
    
    if (!response.success) {
      console.error("Error updating contact:", response.message);
      throw new Error(response.message);
    }
    
    if (response.results) {
      const successfulUpdates = response.results.filter(result => result.success);
      const failedUpdates = response.results.filter(result => !result.success);
      
      if (failedUpdates.length > 0) {
        console.error(`Failed to update contact records:${JSON.stringify(failedUpdates)}`);
        
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
      console.error("Error updating contact:", error?.response?.data?.message);
    } else {
      console.error("Error updating contact:", error);
    }
    throw error;
  }
};

export const deleteContact = async (id) => {
  try {
    const params = {
      RecordIds: [id]
    };
    
    const response = await apperClient.deleteRecord(tableName, params);
    
    if (!response.success) {
      console.error("Error deleting contact:", response.message);
      throw new Error(response.message);
    }
    
    if (response.results) {
      const failedDeletions = response.results.filter(result => !result.success);
      
      if (failedDeletions.length > 0) {
        console.error(`Failed to delete contact records:${JSON.stringify(failedDeletions)}`);
        
        failedDeletions.forEach(record => {
          if (record.message) throw new Error(record.message);
        });
      }
      
      return { success: true };
    }
    
    return { success: true };
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error deleting contact:", error?.response?.data?.message);
    } else {
      console.error("Error deleting contact:", error);
    }
    throw error;
  }
};