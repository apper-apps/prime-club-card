import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { deleteLead, getLeads, updateLead } from "@/services/api/leadsService";
import { createDeal, getDeals, updateDeal } from "@/services/api/dealsService";
import ApperIcon from "@/components/ApperIcon";
import SearchBar from "@/components/molecules/SearchBar";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Badge from "@/components/atoms/Badge";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";

const Hotlist = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('');
  const [fundingFilter, setFundingFilter] = useState('');
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [updateTimeouts, setUpdateTimeouts] = useState({});
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getLeads();
      
      // Filter only hotlist leads
      const hotlistLeads = response.leads.filter(lead => lead.status === 'Hotlist');
      setLeads(hotlistLeads);
      
      if (response.deduplicationResult) {
        toast.info(`${response.deduplicationResult.duplicateCount} duplicate leads were automatically removed`);
      }
    } catch (err) {
      console.error('Error loading hotlist leads:', err);
      setError(err.message || 'Failed to load hotlist leads');
      toast.error('Failed to load hotlist leads');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      const updatedLead = await updateLead(leadId, { status: newStatus });
      
      if (newStatus === 'Hotlist') {
        // Update the lead in current list
        setLeads(prev => prev.map(lead => 
          lead.Id === leadId ? updatedLead : lead
        ));
      } else {
        // Remove from hotlist when status changes
        setLeads(prev => prev.filter(lead => lead.Id !== leadId));
      }
      
      toast.success(`Lead status updated to ${newStatus}`);
      
      // Handle deal creation for specific statuses
      const statusToStageMap = {
        'Connected': 'Connected',
        'Locked': 'Locked',
        'Meeting Booked': 'Meeting Booked',
        'Meeting Done': 'Meeting Done',
        'Negotiation': 'Negotiation',
        'Closed Lost': 'Lost'
      };
      
const targetStage = statusToStageMap[newStatus];
      if (targetStage) {
        const currentDeals = await getDeals();
        const existingDeal = currentDeals.find(deal => deal.leadId === leadId.toString());
        
        if (existingDeal) {
          await updateDeal(existingDeal.Id, { stage: targetStage });
          toast.info(`Deal stage updated to ${targetStage}`);
} else {
          const dealData = {
            name: updatedLead.productName || `${updatedLead.websiteUrl.replace('https://', '').replace('www.', '')} - ${updatedLead.category}`,
            leadName: updatedLead.name || updatedLead.websiteUrl.replace('https://', '').replace('www.', ''),
            leadId: leadId.toString(),
            value: updatedLead.arr || 0,
            stage: targetStage,
            assignedRep: 'Unassigned',
            startMonth: new Date().toISOString().split('T')[0],
            endMonth: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            edition: updatedLead.edition || 'Select Edition'
          };
          
          await createDeal(dealData);
          toast.success(`Deal created and moved to ${targetStage}`);
        }
      }
    } catch (err) {
      console.error('Error updating lead status:', err);
      toast.error('Failed to update lead status');
    }
  };

  const handleDelete = async (leadId) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    
    try {
      await deleteLead(leadId);
      setLeads(prev => prev.filter(lead => lead.Id !== leadId));
      toast.success('Lead deleted successfully');
    } catch (err) {
      console.error('Error deleting lead:', err);
      toast.error('Failed to delete lead');
    }
};

  const handleBulkDelete = async () => {
    if (!selectedLeads.length) return;
    
    try {
      let successCount = 0;
      let failCount = 0;

      for (const leadId of selectedLeads) {
        try {
          await deleteLead(leadId);
          setLeads(prev => prev.filter(lead => lead.Id !== leadId));
          successCount++;
        } catch (err) {
          console.error(`Error deleting lead ${leadId}:`, err);
          failCount++;
        }
      }
      
      setSelectedLeads([]);
      setShowBulkDeleteDialog(false);
      
      if (successCount > 0) {
        toast.success(`${successCount} lead(s) deleted successfully`);
      }
      if (failCount > 0) {
        toast.error(`Failed to delete ${failCount} lead(s)`);
      }
    } catch (err) {
      console.error('Error in bulk delete:', err);
      toast.error('Failed to delete leads');
      setShowBulkDeleteDialog(false);
    }
  };

  const handleFieldUpdate = async (leadId, field, value) => {
    try {
      const processedValue = field === 'arr' ? parseInt(value) || 0 : value;
      const updates = { [field]: processedValue };
      
      const updatedLead = await updateLead(leadId, updates);
      
      if (field === 'status' && value !== 'Hotlist') {
        // Remove from hotlist when status changes
        setLeads(prev => prev.filter(lead => lead.Id !== leadId));
      } else {
        setLeads(prev => prev.map(lead => 
          lead.Id === leadId ? updatedLead : lead
        ));
      }
      
      toast.success(`Lead ${field} updated successfully`);
    } catch (err) {
      console.error(`Error updating lead ${field}:`, err);
      toast.error(`Failed to update lead ${field}`);
    }
  };

  const handleFieldUpdateDebounced = (leadId, field, value) => {
    const timeoutKey = `${leadId}-${field}`;
    
    if (updateTimeouts[timeoutKey]) {
      clearTimeout(updateTimeouts[timeoutKey]);
    }
    
    const timeout = setTimeout(() => {
      handleFieldUpdate(leadId, field, value);
    }, 500);
    
    setUpdateTimeouts(prev => ({ ...prev, [timeoutKey]: timeout }));
  };

  const toggleLeadSelection = (leadId) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedLeads(prev => 
      prev.length === leads.length ? [] : leads.map(lead => lead.Id)
    );
  };

  const clearSelection = () => {
    setSelectedLeads([]);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Launched on AppSumo': 'success',
      'Launched on Prime Club': 'primary',
      'Keep an Eye': 'info',
      'Rejected': 'error',
      'Unsubscribed': 'warning',
      'Outdated': 'default',
      'Hotlist': 'primary',
      'Out of League': 'error',
      'Connected': 'info',
      'Locked': 'warning',
      'Meeting Booked': 'primary',
      'Meeting Done': 'success',
      'Negotiation': 'accent',
      'Closed Lost': 'error'
    };
    return colors[status] || 'default';
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const teamSizeOptions = ['1-3', '4-10', '11-50', '51-100', '101-500', '501-1000', '1001+'];
  const statusOptions = ['Launched on AppSumo', 'Launched on Prime Club', 'Keep an Eye', 'Rejected', 'Unsubscribed', 'Outdated', 'Hotlist', 'Out of League', 'Connected', 'Locked', 'Meeting Booked', 'Meeting Done', 'Negotiation', 'Closed Lost'];
  const fundingTypeOptions = ['Bootstrapped', 'Pre-seed', 'Y Combinator', 'Seed', 'Series A', 'Series B', 'Series C'];

const filteredAndSortedData = React.useMemo(() => {
let filtered = leads.filter(lead => {
      const matchesSearch = !searchQuery || 
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.websiteUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lead.productName && lead.productName.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = !statusFilter || lead.status === statusFilter;
      const matchesFunding = !fundingFilter || lead.fundingType === fundingFilter;
      
      return matchesSearch && matchesStatus && matchesFunding;
    });

    return filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortBy === 'arr') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
}, [leads, searchQuery, statusFilter, fundingFilter, sortBy, sortOrder]);

  // Pagination calculations
  const totalItems = filteredAndSortedData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredAndSortedData.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadLeads} />;

  return (
    <div className="space-y-6">
      {/* Header */}
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hotlist</h1>
          <p className="text-sm text-gray-600">
            {totalItems} high-priority leads ({paginatedData.length} showing)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadLeads}
            className="flex items-center gap-2"
          >
            <ApperIcon name="RefreshCw" size={16} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by website, category, or sales rep..."
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Statuses</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <select
              value={fundingFilter}
              onChange={(e) => setFundingFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Funding Types</option>
              {fundingTypeOptions.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedLeads.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {selectedLeads.length} lead(s) selected
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelection}
              >
                Clear Selection
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBulkDeleteDialog(true)}
                className="text-red-600 hover:text-red-700"
              >
                <ApperIcon name="Trash2" size={16} />
                Delete Selected
              </Button>
            </div>
          </div>
        </Card>
      )}

{/* Pagination Controls - Top */}
      {totalItems > 0 && (
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Show:</span>
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-gray-700">per page</span>
              </div>
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} leads
              </div>
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1"
                >
                  <ApperIcon name="ChevronLeft" size={16} />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNumber)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1"
                >
                  Next
                  <ApperIcon name="ChevronRight" size={16} />
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Table */}
      <Card>
        {totalItems === 0 ? (
          <Empty
            icon="Flame"
            title="No hotlist leads found"
            description="No leads are currently marked as hotlist. Mark important leads as hotlist to see them here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
<thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-4">
                    <input
                      type="checkbox"
                      checked={selectedLeads.length === filteredAndSortedData.length}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                  <th className="text-left p-4">
                    <button
                      onClick={() => handleSort('productName')}
                      className="flex items-center gap-2 font-medium text-gray-700 hover:text-gray-900"
                    >
                      Product Name
                      <ApperIcon name="ArrowUpDown" size={14} />
                    </button>
                  </th>
                  <th className="text-left p-4">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-2 font-medium text-gray-700 hover:text-gray-900"
                    >
                      Name
                      <ApperIcon name="ArrowUpDown" size={14} />
                    </button>
                  </th>
                  <th className="text-left p-4">
                    <button
                      onClick={() => handleSort('email')}
                      className="flex items-center gap-2 font-medium text-gray-700 hover:text-gray-900"
                    >
                      Email
                      <ApperIcon name="ArrowUpDown" size={14} />
                    </button>
                  </th>
                  <th className="text-left p-4">
                    <button
                      onClick={() => handleSort('websiteUrl')}
                      className="flex items-center gap-2 font-medium text-gray-700 hover:text-gray-900"
                    >
                      Website
                      <ApperIcon name="ArrowUpDown" size={14} />
                    </button>
                  </th>
                  <th className="text-left p-4">
                    <button
                      onClick={() => handleSort('teamSize')}
                      className="flex items-center gap-2 font-medium text-gray-700 hover:text-gray-900"
                    >
                      Team Size
                      <ApperIcon name="ArrowUpDown" size={14} />
                    </button>
                  </th>
                  <th className="text-left p-4">
                    <button
                      onClick={() => handleSort('arr')}
                      className="flex items-center gap-2 font-medium text-gray-700 hover:text-gray-900"
                    >
                      ARR
                      <ApperIcon name="ArrowUpDown" size={14} />
                    </button>
                  </th>
                  <th className="text-left p-4">
                    <button
                      onClick={() => handleSort('category')}
                      className="flex items-center gap-2 font-medium text-gray-700 hover:text-gray-900"
                    >
                      Category
                      <ApperIcon name="ArrowUpDown" size={14} />
                    </button>
                  </th>
                  <th className="text-left p-4">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center gap-2 font-medium text-gray-700 hover:text-gray-900"
                    >
                      Status
                      <ApperIcon name="ArrowUpDown" size={14} />
                    </button>
                  </th>
<th className="text-left p-4">
                    <button
                      onClick={() => handleSort('fundingType')}
                      className="flex items-center gap-2 font-medium text-gray-700 hover:text-gray-900"
                    >
                      Funding
                      <ApperIcon name="ArrowUpDown" size={14} />
                    </button>
                  </th>
                  <th className="text-left p-4">LinkedIn</th>
                  <th className="text-left p-4">
                    <button
                      onClick={() => handleSort('followUpDate')}
                      className="flex items-center gap-2 font-medium text-gray-700 hover:text-gray-900"
                    >
                      Follow-up Date
                      <ApperIcon name="ArrowUpDown" size={14} />
                    </button>
                  </th>
                  <th className="text-left p-4">
                    <button
                      onClick={() => handleSort('createdAt')}
                      className="flex items-center gap-2 font-medium text-gray-700 hover:text-gray-900"
                    >
                      Created
                      <ApperIcon name="ArrowUpDown" size={14} />
                    </button>
                  </th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
{paginatedData.map((lead) => (
                  <tr key={lead.Id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.Id)}
                        onChange={() => toggleLeadSelection(lead.Id)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
<td className="p-4">
                      <span className="text-sm text-gray-900">
                        {lead.productName || "—"}
                      </span>
                    </td>
<td className="p-4">
                      <span className="text-sm font-medium text-gray-900">
                        {lead.name || "—"}
                      </span>
                    </td>
<td className="p-4">
                      <span className="text-sm text-gray-900">
                        {lead.email || "—"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <ApperIcon name="Globe" size={16} className="text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {lead.websiteUrl.replace('https://', '').replace('www.', '')}
                          </span>
                        </div>
                        {lead.linkedinUrl && (
                          <a
                            href={lead.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <ApperIcon name="Linkedin" size={16} />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <select
                        value={lead.teamSize}
                        onChange={(e) => handleFieldUpdateDebounced(lead.Id, 'teamSize', e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        {teamSizeOptions.map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </td>
<td className="p-4">
                      <Input
                        type="number"
                        value={lead.arr || ''}
                        onChange={(e) => handleFieldUpdateDebounced(lead.Id, 'arr', e.target.value)}
                        className="w-20 px-2 py-1 text-sm"
                        placeholder="0"
                      />
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-700">{lead.category}</span>
                    </td>
                    <td className="p-4">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.Id, e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        {statusOptions.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4">
                      <select
                        value={lead.fundingType}
                        onChange={(e) => handleFieldUpdateDebounced(lead.Id, 'fundingType', e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        {fundingTypeOptions.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
</select>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900">
                          {lead.linkedinUrl || "—"}
                        </span>
                        {lead.linkedinUrl && (
                          <a
                            href={lead.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-800 flex-shrink-0"
                          >
                            <ApperIcon name="Linkedin" size={16} />
                          </a>
                        )}
</div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-900">
                        {lead.followUpDate ? new Date(lead.followUpDate).toLocaleDateString() : "—"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-700">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(lead.Id)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                        >
                          <ApperIcon name="Trash2" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
</div>
        )}
      </Card>

      {/* Pagination Controls - Bottom */}
      {totalItems > 0 && totalPages > 1 && (
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} leads
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1"
              >
                <ApperIcon name="ChevronLeft" size={16} />
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNumber)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1"
              >
                Next
                <ApperIcon name="ChevronRight" size={16} />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Bulk Delete Confirmation Dialog */}
      {showBulkDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Bulk Delete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {selectedLeads.length} selected lead(s)? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowBulkDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
              >
                Delete {selectedLeads.length} Lead(s)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hotlist;