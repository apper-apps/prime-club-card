// Initialize ApperClient with Project ID and Public Key
const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

const tableName = 'team_c';

export const getTeamMembers = async () => {
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
        { field: { Name: "role_c" } },
        { field: { Name: "permissions_c" } },
        { field: { Name: "status_c" } },
        { field: { Name: "last_login_c" } }
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
      console.error("Error fetching team members:", response.message);
      throw new Error(response.message);
    }
    
    // Parse permissions from MultilineText format
    const members = (response.data || []).map(member => ({
      ...member,
      permissions: member.permissions_c ? JSON.parse(member.permissions_c) : {}
    }));
    
    return members;
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error fetching team members:", error?.response?.data?.message);
    } else {
      console.error("Error fetching team members:", error);
    }
    throw error;
  }
};

export const getTeamMemberById = async (id) => {
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
        { field: { Name: "role_c" } },
        { field: { Name: "permissions_c" } },
        { field: { Name: "status_c" } },
        { field: { Name: "last_login_c" } }
      ]
    };
    
    const response = await apperClient.getRecordById(tableName, id, params);
    
    if (!response.success) {
      console.error("Error fetching team member:", response.message);
      throw new Error(response.message);
    }
    
    const member = response.data;
    return {
      ...member,
      permissions: member.permissions_c ? JSON.parse(member.permissions_c) : {}
    };
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error fetching team member:", error?.response?.data?.message);
    } else {
      console.error("Error fetching team member:", error);
    }
    throw error;
  }
};

export const inviteTeamMember = async (memberData) => {
  try {
    // Validate required fields
    if (!memberData.name || !memberData.name.trim()) {
      throw new Error("Member name is required");
    }
    
    if (!memberData.email || !memberData.email.trim()) {
      throw new Error("Member email is required");
    }
    
    const params = {
      records: [
        {
          Name: memberData.name.trim(),
          email_c: memberData.email.trim().toLowerCase(),
          role_c: memberData.role || "viewer",
          permissions_c: JSON.stringify(memberData.permissions || {
            dashboard: true,
            leads: false,
            hotlist: false,
            pipeline: false,
            calendar: false,
            analytics: false,
            leaderboard: false,
            contacts: false
          }),
          status_c: "pending",
          last_login_c: null
        }
      ]
    };
    
    const response = await apperClient.createRecord(tableName, params);
    
    if (!response.success) {
      console.error("Error creating team member:", response.message);
      throw new Error(response.message);
    }
    
    if (response.results) {
      const successfulRecords = response.results.filter(result => result.success);
      const failedRecords = response.results.filter(result => !result.success);
      
      if (failedRecords.length > 0) {
        console.error(`Failed to create team member records:${JSON.stringify(failedRecords)}`);
        
        failedRecords.forEach(record => {
          record.errors?.forEach(error => {
            throw new Error(`${error.fieldLabel}: ${error}`);
          });
          if (record.message) throw new Error(record.message);
        });
      }
      
      const member = successfulRecords[0]?.data;
      return {
        ...member,
        permissions: member.permissions_c ? JSON.parse(member.permissions_c) : {}
      };
    }
    
    return null;
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error creating team member:", error?.response?.data?.message);
    } else {
      console.error("Error creating team member:", error);
    }
    throw error;
  }
};

export const updateTeamMember = async (id, updates) => {
  try {
    // Prepare update data with only Updateable fields
    const updateData = {
      Id: id
    };
    
    // Map old field names to new database field names
    if (updates.Name !== undefined || updates.name !== undefined) updateData.Name = updates.Name || updates.name;
    if (updates.email_c !== undefined || updates.email !== undefined) updateData.email_c = updates.email_c || updates.email;
    if (updates.role_c !== undefined || updates.role !== undefined) updateData.role_c = updates.role_c || updates.role;
    if (updates.permissions_c !== undefined || updates.permissions !== undefined) {
      const permissions = updates.permissions_c || updates.permissions;
      updateData.permissions_c = typeof permissions === 'string' ? permissions : JSON.stringify(permissions);
    }
    if (updates.status_c !== undefined || updates.status !== undefined) updateData.status_c = updates.status_c || updates.status;
    if (updates.last_login_c !== undefined || updates.lastLogin !== undefined) updateData.last_login_c = updates.last_login_c || updates.lastLogin;
    
    const params = {
      records: [updateData]
    };
    
    const response = await apperClient.updateRecord(tableName, params);
    
    if (!response.success) {
      console.error("Error updating team member:", response.message);
      throw new Error(response.message);
    }
    
    if (response.results) {
      const successfulUpdates = response.results.filter(result => result.success);
      const failedUpdates = response.results.filter(result => !result.success);
      
      if (failedUpdates.length > 0) {
        console.error(`Failed to update team member records:${JSON.stringify(failedUpdates)}`);
        
        failedUpdates.forEach(record => {
          record.errors?.forEach(error => {
            throw new Error(`${error.fieldLabel}: ${error}`);
          });
          if (record.message) throw new Error(record.message);
        });
      }
      
      const member = successfulUpdates[0]?.data;
      return {
        ...member,
        permissions: member.permissions_c ? JSON.parse(member.permissions_c) : {}
      };
    }
    
    return null;
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error updating team member:", error?.response?.data?.message);
    } else {
      console.error("Error updating team member:", error);
    }
    throw error;
  }
};

export const removeTeamMember = async (id) => {
  try {
    const params = {
      RecordIds: [id]
    };
    
    const response = await apperClient.deleteRecord(tableName, params);
    
    if (!response.success) {
      console.error("Error deleting team member:", response.message);
      throw new Error(response.message);
    }
    
    if (response.results) {
      const failedDeletions = response.results.filter(result => !result.success);
      
      if (failedDeletions.length > 0) {
        console.error(`Failed to delete team member records:${JSON.stringify(failedDeletions)}`);
        
        failedDeletions.forEach(record => {
          if (record.message) throw new Error(record.message);
        });
      }
      
      return { success: true };
    }
    
    return { success: true };
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error deleting team member:", error?.response?.data?.message);
    } else {
      console.error("Error deleting team member:", error);
    }
    throw error;
  }
};

export const getTeamMemberPerformance = async (id) => {
  try {
    // Mock performance data for team members since no performance table is provided
    const mockPerformance = {
      totalLeads: Math.floor(Math.random() * 50) + 20,
      totalDeals: Math.floor(Math.random() * 10) + 5,
      totalRevenue: Math.floor(Math.random() * 50000) + 10000,
      totalMeetings: Math.floor(Math.random() * 20) + 10,
      conversionRate: Math.floor(Math.random() * 15) + 5,
      avgDealSize: 0
    };
    
    mockPerformance.avgDealSize = mockPerformance.totalDeals > 0 ? 
      Math.round(mockPerformance.totalRevenue / mockPerformance.totalDeals) : 0;
    
    return mockPerformance;
  } catch (error) {
    console.error("Error fetching team member performance:", error);
    throw error;
  }
};

export const activateTeamMember = async (id) => {
  return await updateTeamMember(id, { status_c: "active" });
};

export const deactivateTeamMember = async (id) => {
  return await updateTeamMember(id, { status_c: "inactive" });
};