import { motion } from "framer-motion";
import { Draggable } from "react-beautiful-dnd";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Avatar from "@/components/atoms/Avatar";
import ApperIcon from "@/components/ApperIcon";

const DealCard = ({ deal, index, onEdit }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStageColor = (stage) => {
    const colors = {
      "Connected": "default",
      "Locked": "info",
      "Meeting Booked": "warning",
      "Meeting Done": "primary",
      "Negotiation": "warning",
      "Closed": "success",
      "Lost": "error"
    };
    return colors[stage] || "default";
  };

  return (
    <Draggable draggableId={deal.Id.toString()} index={index}>
      {(provided, snapshot) => (
        <motion.div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`mb-3 ${snapshot.isDragging ? "rotate-3" : ""}`}
        >
          <Card className={`p-4 cursor-grab active:cursor-grabbing transition-all duration-200 ${
            snapshot.isDragging ? "shadow-2xl ring-2 ring-primary-500 bg-primary-50" : "hover:shadow-md"
          }`}>
<div className="flex items-start justify-between mb-3">
              <div className="flex-1">
<h4 className="font-semibold text-gray-900 mb-1">{deal.Name}</h4>
                <p className="text-sm text-gray-600">{deal.lead_name_c}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
{deal.edition_c && deal.edition_c !== "Select Edition" && (
                  <Badge variant="primary" size="sm" className="text-xs">
                    {deal.edition_c}
                  </Badge>
                )}
<button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(deal);
                  }}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  title="Edit deal"
                >
                  <ApperIcon name="MoreHorizontal" size={16} className="text-gray-400" />
                </button>
              </div>
            </div>
            
<div className="flex items-center justify-between mb-3">
              <span className="text-lg font-bold text-green-600">
{formatCurrency(deal.value_c)}
              </span>
{!["Connected", "Locked", "Meeting Done"].includes(deal.stage_c) && (
                <Badge variant={getStageColor(deal.stage_c)} size="sm">
                  {deal.stage_c}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
<Avatar name={deal.assigned_rep_c} size="sm" />
                <span className="ml-2 text-sm text-gray-600">{deal.assigned_rep_c}</span>
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <ApperIcon name="Calendar" size={12} className="mr-1" />
<span>{new Date(deal.CreatedOn).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </Draggable>
  );
};

export default DealCard;