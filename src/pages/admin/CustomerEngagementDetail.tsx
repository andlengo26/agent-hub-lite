import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { useCustomerEngagements } from '@/hooks/useCustomerEngagements';
import { FormModal } from '@/components/common/FormModal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EngagementFilters } from '@/components/admin/EngagementFilters';
import { EngagementAccordion } from '@/components/admin/EngagementAccordion';
import { CustomerEngagement } from '@/types';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { DateRange } from 'react-day-picker';

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

  // Filter state
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Fetch customer engagements
  const { 
    data: customerData, 
    isLoading, 
    error,
    refetch 
  } = useCustomerEngagements(customerId || '', {});

  // Get unique agents for filter
  const availableAgents = useMemo(() => {
    if (!customerData?.engagements) return [];
    const agentSet = new Set(customerData.engagements.map(e => e.agentName));
    return Array.from(agentSet).map(name => ({ value: name, label: name }));
  }, [customerData?.engagements]);

  // Filter engagements
  const filteredEngagements = useMemo(() => {
    if (!customerData?.engagements) return [];
    
    return customerData.engagements.filter(engagement => {
      const agentMatch = selectedAgents.length === 0 || selectedAgents.includes(engagement.agentName);
      
      const dateMatch = !dateRange?.from || !dateRange?.to ||
        (new Date(engagement.date) >= dateRange.from && new Date(engagement.date) <= dateRange.to);
        
      return agentMatch && dateMatch;
    });
  }, [customerData?.engagements, selectedAgents, dateRange]);

  const hasActiveFilters = selectedAgents.length > 0 || !!dateRange;

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
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "Engagement deleted",
        description: "The engagement has been successfully removed.",
      });
      
      refetch();
    } catch (error) {
      console.error('Failed to delete engagement:', error);
      toast({
        title: "Error",
        description: "Failed to delete engagement. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveEngagement = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const action = selectedEngagement ? 'updated' : 'added';
      toast({
        title: `Engagement ${action}`,
        description: `The engagement has been successfully ${action}.`,
      });
      
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      setSelectedEngagement(null);
      refetch();
    } catch (error) {
      console.error('Failed to save engagement:', error);
      toast({
        title: "Error",
        description: "Failed to save engagement. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClearFilters = () => {
    setSelectedAgents([]);
    setDateRange(undefined);
  };

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

      {/* Filters */}
      <EngagementFilters
        agents={availableAgents}
        selectedAgents={selectedAgents}
        onAgentsChange={setSelectedAgents}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Engagement History Accordion */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement History ({filteredEngagements.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEngagements.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-text-secondary">
                {hasActiveFilters ? 'No engagements match your filters.' : 'No engagements found.'}
              </p>
            </div>
          ) : (
            <EngagementAccordion
              engagements={filteredEngagements}
              onDeleteEngagement={handleDeleteEngagement}
              onEditEngagement={handleEditEngagement}
              expandedRow={expandedRow}
              onExpandedRowChange={setExpandedRow}
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