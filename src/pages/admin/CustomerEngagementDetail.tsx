import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Eye, Edit, Trash2 } from "lucide-react";
import { CustomerEngagement } from "@/types";
import { useCustomerEngagements } from "@/hooks/useCustomerEngagements";
import { FormModal } from "@/components/common/FormModal";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
const channelOptions = [{
  label: "Chat",
  value: "chat"
}, {
  label: "Email",
  value: "email"
}, {
  label: "Phone",
  value: "phone"
}];
const availableTags = [{
  label: "Technical",
  value: "technical"
}, {
  label: "Billing",
  value: "billing"
}, {
  label: "Enterprise",
  value: "enterprise"
}, {
  label: "Integration",
  value: "integration"
}, {
  label: "Training",
  value: "training"
}, {
  label: "Demo",
  value: "demo"
}, {
  label: "Support",
  value: "support"
}, {
  label: "Sales",
  value: "sales"
}];
const engagementColumns: Column<CustomerEngagement>[] = [{
  key: "date",
  label: "Date",
  sortable: true,
  render: value => new Date(value).toLocaleDateString()
}, {
  key: "aiSummary",
  label: "AI Summary",
  sortable: true,
  render: value => <div className="max-w-xs truncate" title={value}>
        {value}
      </div>
}, {
  key: "channel",
  label: "Channel",
  sortable: true,
  render: value => <Badge variant="outline" className="capitalize">
        {value}
      </Badge>
}, {
  key: "agentName",
  label: "Agent",
  sortable: true
}, {
  key: "agentNotes",
  label: "Notes",
  render: value => <div className="max-w-xs truncate" title={value}>
        {value}
      </div>
}];
export default function CustomerEngagementDetail() {
  const {
    customerId
  } = useParams<{
    customerId: string;
  }>();
  const navigate = useNavigate();
  const [selectedEngagement, setSelectedEngagement] = useState<CustomerEngagement | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date(),
    channel: '',
    agentName: '',
    aiSummary: '',
    agentNotes: '',
    tags: [] as string[]
  });
  if (!customerId) {
    return <div>Customer ID not found</div>;
  }
  const {
    data: customerData,
    isLoading,
    error
  } = useCustomerEngagements(customerId);
  const handleBack = () => {
    navigate('/chats/history');
  };
  const handleAddEngagement = () => {
    setFormData({
      date: new Date(),
      channel: '',
      agentName: '',
      aiSummary: '',
      agentNotes: '',
      tags: []
    });
    setIsAddModalOpen(true);
  };
  const handleEditEngagement = (engagement: CustomerEngagement) => {
    setSelectedEngagement(engagement);
    setFormData({
      date: new Date(engagement.date),
      channel: engagement.channel,
      agentName: engagement.agentName,
      aiSummary: engagement.aiSummary,
      agentNotes: engagement.agentNotes,
      tags: engagement.tags
    });
    setIsEditModalOpen(true);
  };
  const handleViewDetails = (engagement: CustomerEngagement) => {
    setSelectedEngagement(engagement);
    setIsViewModalOpen(true);
  };
  const handleDeleteEngagement = (engagement: CustomerEngagement) => {
    toast({
      title: "Engagement deleted",
      description: `Engagement from ${new Date(engagement.date).toLocaleDateString()} has been deleted.`
    });
  };
  const handleSaveEngagement = () => {
    toast({
      title: "Engagement saved",
      description: "Engagement has been saved successfully."
    });
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
  };
  const handleBulkDelete = () => {
    toast({
      title: "Engagements deleted",
      description: "Selected engagements have been deleted."
    });
  };
  const customActions = [{
    id: "view",
    label: "View Details",
    icon: <Eye className="w-4 h-4" />,
    onClick: handleViewDetails
  }, {
    id: "edit",
    label: "Edit",
    icon: <Edit className="w-4 h-4" />,
    onClick: handleEditEngagement
  }, {
    id: "delete",
    label: "Delete",
    icon: <Trash2 className="w-4 h-4" />,
    variant: "destructive" as const,
    onClick: handleDeleteEngagement
  }];
  const bulkActions = [{
    id: "delete",
    label: "Delete Selected",
    icon: <Trash2 className="w-4 h-4" />,
    variant: "destructive" as const,
    onClick: handleBulkDelete
  }];
  if (isLoading) {
    return <div>Loading customer engagement details...</div>;
  }
  if (error) {
    return <div>Error loading customer engagement details: {error.message}</div>;
  }
  if (!customerData) {
    return <div>Customer data not found</div>;
  }
  return <div className="space-y-space-6">
      {/* Header with breadcrumb and back button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-space-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to History
          </Button>
          <div>
            
            
          </div>
        </div>
        <Button onClick={handleAddEngagement}>
          <Plus className="w-4 h-4 mr-2" />
          Add Engagement
        </Button>
      </div>

      {/* Customer Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-space-6">
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">Email</h3>
              <p>{customerData.customerEmail}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">Phone</h3>
              <p>{customerData.contactNumber}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">Total Engagements</h3>
              <Badge variant="outline">{customerData.pagination.total}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Engagements Table */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement History</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable data={customerData.engagements} columns={engagementColumns} loading={isLoading} searchable selectable pagination customActions={customActions} bulkActions={bulkActions} emptyMessage="No engagements found" emptyDescription="Customer engagements will appear here once available." />
        </CardContent>
      </Card>

      {/* Add/Edit Engagement Modal */}
      <FormModal isOpen={isAddModalOpen || isEditModalOpen} onClose={() => {
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
    }} title={isEditModalOpen ? "Edit Engagement" : "Add Engagement"} submitLabel="Save" onSubmit={handleSaveEngagement} size="lg">
        <div className="space-y-space-4">
          <div>
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formData.date && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={formData.date} onSelect={date => date && setFormData({
                ...formData,
                date
              })} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="channel">Channel</Label>
            <Select value={formData.channel} onValueChange={value => setFormData({
            ...formData,
            channel: value
          })}>
              <SelectTrigger>
                <SelectValue placeholder="Select channel" />
              </SelectTrigger>
              <SelectContent>
                {channelOptions.map(option => <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="agentName">Agent Name</Label>
            <Input id="agentName" value={formData.agentName} onChange={e => setFormData({
            ...formData,
            agentName: e.target.value
          })} placeholder="Enter agent name" />
          </div>

          <div>
            <Label htmlFor="aiSummary">AI Summary</Label>
            <Textarea id="aiSummary" value={formData.aiSummary} onChange={e => setFormData({
            ...formData,
            aiSummary: e.target.value
          })} placeholder="Enter AI summary" rows={3} />
          </div>

          <div>
            <Label htmlFor="agentNotes">Agent Notes</Label>
            <Textarea id="agentNotes" value={formData.agentNotes} onChange={e => setFormData({
            ...formData,
            agentNotes: e.target.value
          })} placeholder="Enter agent notes" rows={4} />
          </div>

          <div>
            <Label htmlFor="tags">Tags</Label>
            <MultiSelect options={availableTags} selected={formData.tags} onChange={tags => setFormData({
            ...formData,
            tags
          })} placeholder="Select tags" />
          </div>
        </div>
      </FormModal>

      {/* View Details Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Engagement Details" size="lg">
        {selectedEngagement && <div className="space-y-space-6">
            <div className="grid grid-cols-2 gap-space-4">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">Date</h3>
                <p>{new Date(selectedEngagement.date).toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">Channel</h3>
                <Badge variant="outline" className="capitalize">
                  {selectedEngagement.channel}
                </Badge>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">Agent</h3>
                <p>{selectedEngagement.agentName}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">Tags</h3>
                <div className="flex flex-wrap gap-1">
                  {selectedEngagement.tags.map(tag => <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>)}
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-space-2">AI Summary</h3>
              <p className="text-sm bg-muted p-space-3 rounded-md">{selectedEngagement.aiSummary}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-space-2">Agent Notes</h3>
              <p className="text-sm bg-muted p-space-3 rounded-md">{selectedEngagement.agentNotes}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-space-2">Transcript</h3>
              <div className="text-sm bg-muted p-space-3 rounded-md max-h-64 overflow-y-auto">
                <pre className="whitespace-pre-wrap">{selectedEngagement.transcript}</pre>
              </div>
            </div>
          </div>}
      </Modal>
    </div>;
}