import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import DealCard from "@/components/molecules/DealCard";
import DealEditModal from "@/components/molecules/DealEditModal";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import { getDeals, updateDeal } from "@/services/api/dealsService";

const Pipeline = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const stages = [
    { id: "Connected", name: "Connected", color: "bg-blue-500" },
    { id: "Locked", name: "Locked", color: "bg-purple-500" },
    { id: "Meeting Booked", name: "Meeting Booked", color: "bg-yellow-500" },
    { id: "Meeting Done", name: "Meeting Done", color: "bg-orange-500" },
    { id: "Negotiation", name: "Negotiation", color: "bg-red-500" },
    { id: "Closed", name: "Closed", color: "bg-green-500" },
    { id: "Lost", name: "Lost", color: "bg-gray-500" }
  ];

  const loadDeals = async () => {
    try {
      setLoading(true);
      setError("");
      
      const data = await getDeals();
      setDeals(data);
    } catch (err) {
      setError("Failed to load deals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeals();
  }, []);

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const dealId = parseInt(draggableId);
    const newStage = destination.droppableId;

try {
      await updateDeal(dealId, { stage_c: newStage });
      
      const updatedDeals = deals.map(deal =>
        deal.Id === dealId ? { ...deal, stage_c: newStage } : deal
      );
      setDeals(updatedDeals);
      
      toast.success(`Deal moved to ${newStage}`);
    } catch (err) {
      toast.error("Failed to update deal stage");
    }
};

  const handleEditDeal = (deal) => {
    setEditingDeal(deal);
    setShowEditModal(true);
  };

const handleSaveDeal = async (dealId, updatedData) => {
    const updatedDeal = await updateDeal(dealId, updatedData);

    // Update the state with the new deal data
    const updatedDeals = deals.map(deal =>
      deal.Id === dealId ? { ...deal, ...updatedData } : deal
    );
    setDeals(updatedDeals);
    setShowEditModal(false);
    setEditingDeal(null);
  };

const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingDeal(null);
  };

const getDealsForStage = (stage) => {
    return deals.filter(deal => deal.stage_c === stage);
  };
  
  const getTotalValue = (stage) => {
    const stageDeals = getDealsForStage(stage);
    return stageDeals.reduce((sum, deal) => sum + (deal.value_c || 0), 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) return <Loading type="kanban" />;
  if (error) return <Error message={error} onRetry={loadDeals} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deal Pipeline</h1>
          <p className="text-gray-600 mt-1">Track and manage your sales opportunities</p>
        </div>
        <Button>
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Add Deal
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4">
          {stages.map((stage) => {
            const stageDeals = getDealsForStage(stage.id);
            const totalValue = getTotalValue(stage.id);

            return (
              <div key={stage.id} className="flex-shrink-0 w-80">
                <Card className="h-full">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${stage.color} mr-2`} />
                        <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                      </div>
                      <Badge variant="default" size="sm">
                        {stageDeals.length}
                      </Badge>
                    </div>
                    {totalValue > 0 && (
                      <p className="text-sm font-medium text-green-600">
                        {formatCurrency(totalValue)}
                      </p>
                    )}
                  </div>

                  <Droppable droppableId={stage.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`p-4 min-h-[400px] transition-colors ${
                          snapshot.isDraggingOver ? "bg-primary-50" : ""
                        }`}
                      >
                        {stageDeals.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                            <ApperIcon name="Package" size={32} className="mb-2" />
                            <p className="text-sm">No deals in this stage</p>
                          </div>
                        ) : (
                          stageDeals.map((deal, index) => (
                            <DealCard
key={deal.Id}
                              deal={deal}
                              index={index}
                              onEdit={handleEditDeal}
                            />
                          ))
                        )}
                        {provided.placeholder}
                      </div>
)}
                  </Droppable>
                </Card>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      <DealEditModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
deal={editingDeal}
        onSave={handleSaveDeal}
      />
    </div>
  );
};

export default Pipeline;