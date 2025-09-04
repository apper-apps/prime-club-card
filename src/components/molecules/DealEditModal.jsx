import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import ApperIcon from "@/components/ApperIcon";

const DealEditModal = ({ isOpen, onClose, deal, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    leadName: "",
    value: "",
    stage: "",
    edition: "",
    assignedRep: "",
    startMonth: "",
    endMonth: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const stages = [
    "Connected",
    "Locked", 
    "Meeting Booked",
    "Meeting Done",
    "Negotiation",
    "Closed",
    "Lost"
  ];

  const editions = [
    "Select Edition",
    "Limited Edition",
    "Collector's Edition", 
    "Black Edition"
  ];

  const salesReps = [
    "Sarah Johnson",
    "Mike Davis",
    "Tom Wilson"
  ];

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" }
  ];

useEffect(() => {
    if (deal && isOpen) {
      setFormData({
        name: deal.Name || "",
        leadName: deal.lead_name_c || "",
        value: deal.value_c?.toString() || "",
        stage: deal.stage_c || "",
        edition: deal.edition_c || "",
        assignedRep: deal.assigned_rep_c || "",
        startMonth: deal.start_month_c?.toString() || "",
        endMonth: deal.end_month_c?.toString() || ""
      });
      setErrors({});
    }
  }, [deal, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Deal name is required";
    }
    
    if (!formData.leadName.trim()) {
      newErrors.leadName = "Lead name is required";
    }
    
    if (!formData.value || isNaN(formData.value) || Number(formData.value) <= 0) {
      newErrors.value = "Please enter a valid deal value";
    }
    
    if (!formData.stage) {
      newErrors.stage = "Stage is required";
    }
    
    if (!formData.assignedRep) {
      newErrors.assignedRep = "Assigned rep is required";
    }

    if (formData.startMonth && formData.endMonth) {
      if (Number(formData.startMonth) > Number(formData.endMonth)) {
        newErrors.endMonth = "End month must be after start month";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const updatedDeal = {
        ...formData,
        value: Number(formData.value),
        startMonth: formData.startMonth ? Number(formData.startMonth) : null,
        endMonth: formData.endMonth ? Number(formData.endMonth) : null
      };
      
      await onSave(deal.Id, updatedDeal);
      toast.success("Deal updated successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to update deal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={handleClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Deal</h2>
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                >
                  <ApperIcon name="X" size={20} className="text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deal Name *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter deal name"
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lead Name *
                    </label>
                    <Input
                      value={formData.leadName}
                      onChange={(e) => handleInputChange("leadName", e.target.value)}
                      placeholder="Enter lead name"
                      className={errors.leadName ? "border-red-500" : ""}
                    />
                    {errors.leadName && (
                      <p className="text-red-500 text-sm mt-1">{errors.leadName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deal Value * ($)
                    </label>
                    <Input
                      type="number"
                      value={formData.value}
                      onChange={(e) => handleInputChange("value", e.target.value)}
                      placeholder="Enter deal value"
                      min="0"
                      step="1000"
                      className={errors.value ? "border-red-500" : ""}
                    />
                    {errors.value && (
                      <p className="text-red-500 text-sm mt-1">{errors.value}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stage *
                    </label>
                    <select
                      value={formData.stage}
                      onChange={(e) => handleInputChange("stage", e.target.value)}
                      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                        errors.stage ? "border-red-500" : ""
                      }`}
                    >
                      <option value="">Select stage</option>
                      {stages.map(stage => (
                        <option key={stage} value={stage}>{stage}</option>
                      ))}
                    </select>
                    {errors.stage && (
                      <p className="text-red-500 text-sm mt-1">{errors.stage}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Edition
                    </label>
                    <select
                      value={formData.edition}
                      onChange={(e) => handleInputChange("edition", e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {editions.map(edition => (
                        <option key={edition} value={edition}>{edition}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assigned Rep *
                    </label>
                    <select
                      value={formData.assignedRep}
                      onChange={(e) => handleInputChange("assignedRep", e.target.value)}
                      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                        errors.assignedRep ? "border-red-500" : ""
                      }`}
                    >
                      <option value="">Select rep</option>
                      {salesReps.map(rep => (
                        <option key={rep} value={rep}>{rep}</option>
                      ))}
                    </select>
                    {errors.assignedRep && (
                      <p className="text-red-500 text-sm mt-1">{errors.assignedRep}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Month
                    </label>
                    <select
                      value={formData.startMonth}
                      onChange={(e) => handleInputChange("startMonth", e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select month</option>
                      {months.map(month => (
                        <option key={month.value} value={month.value}>{month.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Month
                    </label>
                    <select
                      value={formData.endMonth}
                      onChange={(e) => handleInputChange("endMonth", e.target.value)}
                      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                        errors.endMonth ? "border-red-500" : ""
                      }`}
                    >
                      <option value="">Select month</option>
                      {months.map(month => (
                        <option key={month.value} value={month.value}>{month.label}</option>
                      ))}
                    </select>
                    {errors.endMonth && (
                      <p className="text-red-500 text-sm mt-1">{errors.endMonth}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="min-w-[120px]"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Saving...
                      </div>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DealEditModal;