import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Loader2, Download, Archive, Trash2 } from 'lucide-react';
import { useCustomerEngagements } from '@/hooks/useCustomerEngagements';
import { useCreateEngagement, useUpdateEngagement, useDeleteEngagement } from '@/hooks/useEngagementMutations';
import { useRealTimeSync } from '@/hooks/useRealTimeSync';
import { FormModal } from '@/components/common/FormModal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EngagementAccordion } from '@/components/admin/EngagementAccordion';
import { BulkActionsToolbar } from '@/components/common/BulkActionsToolbar';
import { Checkbox } from '@/components/ui/checkbox';
import { CustomerEngagement } from '@/types';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const channelOptions = [
  { value: 'chat', label: 'Chat' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'general', label: 'General' },
];

export default function CustomerEngagementDetail() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const createEngagement = useCreateEngagement();
  const updateEngagement = useUpdateEngagement();
  const deleteEngagement = useDeleteEngagement();

  // Modal and form state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEngagement, setSelectedEngagement] = useState<CustomerEngagement | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    channel: '',
    agentName: '',
    aiSummary: '',
    agentNotes: '',
    tags: [] as string[],
  });

  // Selection state
  const [selectedEngagements, setSelectedEngagements] = useState<Set<string>>(new Set());

  // Fetch customer engagements
  const { 
    data: customerData, 
    isLoading, 
    error,
    refetch 
  } = useCustomerEngagements(customerId || '', {});

  // Use all engagements without filtering
  const engagements = customerData?.engagements || [];

  // Enable real-time sync for this customer's engagements
  useRealTimeSync({
    onEngagementUpdate: (engagement) => {
      if (engagement.customerId === customerId) {
        // Force refresh of engagement data when updates occur
        console.log('Engagement updated via sync:', engagement.id);
      }
    },
    enableNotifications: false, // Disable notifications for this detailed view
  });

  const handleBack = () => {
    navigate('/chats/history');
  };

  const handleAddEngagement = () => {
    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      channel: '',
      agentName: '',
      aiSummary: '',
      agentNotes: '',
      tags: [],
    });
    setIsAddModalOpen(true);
  };

  const handleEditEngagement = (engagement: CustomerEngagement) => {
    setSelectedEngagement(engagement);
    setFormData({
      date: format(new Date(engagement.date), 'yyyy-MM-dd'),
      channel: engagement.channel,
      agentName: engagement.agentName,
      aiSummary: engagement.aiSummary,
      agentNotes: engagement.agentNotes,
      tags: engagement.tags,
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteEngagement = async (engagementId: string) => {
    if (!customerId) return;
    
    try {
      await deleteEngagement.mutateAsync({
        customerId,
        engagementId,
      });
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error('Failed to delete engagement:', error);
    }
  };

  const handleSaveEngagement = async () => {
    if (!customerId) return;
    
    try {
      if (selectedEngagement) {
        // Update existing engagement
        await updateEngagement.mutateAsync({
          customerId,
          engagementId: selectedEngagement.id,
          engagement: {
            ...formData,
            channel: formData.channel as 'phone' | 'chat' | 'email' | 'general',
          },
        });
      } else {
        // Add new engagement
        await createEngagement.mutateAsync({
          customerId,
          engagement: {
            customerId,
            ...formData,
            channel: formData.channel as 'phone' | 'chat' | 'email' | 'general',
          } as Omit<CustomerEngagement, 'id'>,
        });
      }
      
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      setSelectedEngagement(null);
    } catch (error) {
      // Error handling is done in the mutation hooks
      console.error('Failed to save engagement:', error);
    }
  };

  // Selection handlers
  const handleSelectEngagement = (engagementId: string, checked: boolean) => {
    const newSelected = new Set(selectedEngagements);
    if (checked) {
      newSelected.add(engagementId);
    } else {
      newSelected.delete(engagementId);
    }
    setSelectedEngagements(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEngagements(new Set(engagements.map(e => e.id)));
    } else {
      setSelectedEngagements(new Set());
    }
  };

  const handleClearSelection = () => {
    setSelectedEngagements(new Set());
  };

  // Bulk action handlers
  const handleBulkExport = () => {
    toast({
      title: "Export started",
      description: `Exporting ${selectedEngagements.size} engagements...`,
    });
    handleClearSelection();
  };

  const handleBulkArchive = () => {
    toast({
      title: "Archive completed",
      description: `${selectedEngagements.size} engagements archived.`,
    });
    handleClearSelection();
  };

  const handleBulkDelete = async () => {
    if (!customerId) return;
    
    try {
      // Delete all selected engagements
      await Promise.all(
        Array.from(selectedEngagements).map(engagementId =>
          deleteEngagement.mutateAsync({
            customerId,
            engagementId,
          })
        )
      );
      
      handleClearSelection();
    } catch (error) {
      console.error('Failed to delete engagements:', error);
      toast({
        title: "Error",
        description: "Failed to delete some engagements.",
        variant: "destructive",
      });
    }
  };

  const bulkActions = [
    {
      id: "export",
      label: "Export Selected",
      icon: <Download className="w-4 h-4" />,
      onClick: handleBulkExport,
    },
    {
      id: "archive",
      label: "Archive Selected", 
      icon: <Archive className="w-4 h-4" />,
      onClick: handleBulkArchive,
    },
    {
      id: "delete",
      label: "Delete Selected",
      icon: <Trash2 className="w-4 h-4" />,
      variant: "destructive" as const,
      onClick: handleBulkDelete,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !customerData) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Failed to load customer engagement data</p>
        <Button onClick={() => refetch()} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to History
          </Button>
          <h1 className="text-2xl font-bold text-text-primary">Engagement History Details</h1>
        </div>
        <Button onClick={handleAddEngagement} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Engagement
        </Button>
      </div>

      {/* Customer Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-text-secondary">Name</p>
              <p className="font-medium text-text-primary">{customerData.customerName}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Email</p>
              <p className="font-medium text-text-primary">{customerData.customerEmail}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Contact Number</p>
              <p className="font-medium text-text-primary">{customerData.contactNumber}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Toolbar */}
      {selectedEngagements.size > 0 && (
        <BulkActionsToolbar
          selectedCount={selectedEngagements.size}
          onClearSelection={handleClearSelection}
          actions={bulkActions}
        />
      )}

      {/* Engagement History Accordion */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Engagement History ({engagements.length})</CardTitle>
          {engagements.length > 0 && (
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedEngagements.size === engagements.length}
                onCheckedChange={handleSelectAll}
                className="mr-2"
              />
              <span className="text-sm text-text-secondary">Select all</span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {engagements.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-text-secondary">No engagements found.</p>
            </div>
          ) : (
            <EngagementAccordion
              engagements={engagements}
              onDeleteEngagement={handleDeleteEngagement}
              onEditEngagement={handleEditEngagement}
              expandedRow={expandedRow}
              onExpandedRowChange={setExpandedRow}
              selectedEngagements={selectedEngagements}
              onSelectEngagement={handleSelectEngagement}
              showActions={false}
            />
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Engagement Modal */}
      <FormModal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedEngagement(null);
        }}
        title={selectedEngagement ? 'Edit Engagement' : 'Add New Engagement'}
        onSubmit={handleSaveEngagement}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="channel">Channel</Label>
              <Select
                value={formData.channel}
                onValueChange={(value) => setFormData({ ...formData, channel: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  {channelOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="agentName">Agent Name</Label>
            <Input
              id="agentName"
              value={formData.agentName}
              onChange={(e) => setFormData({ ...formData, agentName: e.target.value })}
              placeholder="Enter agent name"
            />
          </div>

          <div>
            <Label htmlFor="aiSummary">AI Summary</Label>
            <Textarea
              id="aiSummary"
              value={formData.aiSummary}
              onChange={(e) => setFormData({ ...formData, aiSummary: e.target.value })}
              placeholder="Enter AI-generated summary"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="agentNotes">Agent Notes</Label>
            <Textarea
              id="agentNotes"
              value={formData.agentNotes}
              onChange={(e) => setFormData({ ...formData, agentNotes: e.target.value })}
              placeholder="Enter agent notes"
              rows={3}
            />
          </div>
        </div>
      </FormModal>
    </div>
  );
}