import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Download, Archive, Trash2, Eye } from "lucide-react";
import { Engagement } from "@/types";
import { useEngagements } from "@/hooks/useEngagements";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { EngagementFilters } from '@/components/admin/EngagementFilters';
import { DateRange } from 'react-day-picker';

const engagementColumns: Column<Engagement>[] = [
  { key: "customerName", label: "Customer", sortable: true },
  { key: "customerEmail", label: "Email", sortable: true },
  { key: "engagementCount", label: "Engagements", sortable: true, render: (value) => (
    <Badge variant="outline">{value}</Badge>
  )},
  { key: "lastEngagedAt", label: "Last Contact", sortable: true, render: (value) => 
    new Date(value).toLocaleDateString()
  },
  { key: "agentsInvolved", label: "Agents", sortable: true, render: (value) => value.length },
];

export default function EngagementHistory() {
  const navigate = useNavigate();
  const { data: engagementsResponse, isLoading, error } = useEngagements({});

  // Filter state
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const engagements = engagementsResponse?.data || [];

  // Get unique agents for filter
  const availableAgents = useMemo(() => {
    if (!engagements) return [];
    const agentSet = new Set(engagements.flatMap(e => e.agentsInvolved));
    return Array.from(agentSet).map(name => ({ value: name, label: name }));
  }, [engagements]);

  // Filter engagements
  const filteredEngagements = useMemo(() => {
    if (!engagements) return [];
    
    return engagements.filter(engagement => {
      const agentMatch = selectedAgents.length === 0 || 
        selectedAgents.some(agent => engagement.agentsInvolved.includes(agent));
      
      const dateMatch = !dateRange?.from || !dateRange?.to ||
        (new Date(engagement.lastEngagedAt) >= dateRange.from && 
         new Date(engagement.lastEngagedAt) <= dateRange.to);
        
      return agentMatch && dateMatch;
    });
  }, [engagements, selectedAgents, dateRange]);

  const hasActiveFilters = selectedAgents.length > 0 || !!dateRange;

  const handleViewDetails = (engagement: Engagement) => {
    navigate(`/chats/history/${engagement.id}`);
  };

  const handleClearFilters = () => {
    setSelectedAgents([]);
    setDateRange(undefined);
  };

  const handleBulkExport = () => {
    toast({
      title: "Export started",
      description: "Exporting selected engagements...",
    });
  };

  const handleBulkArchive = () => {
    toast({
      title: "Archive completed",
      description: "Selected engagements archived.",
    });
  };

  const handleBulkDelete = () => {
    toast({
      title: "Delete completed",
      description: "Selected engagements deleted.",
    });
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

  const customActions = [
    {
      id: "view",
      label: "View Details",
      icon: <Eye className="w-4 h-4" />,
      onClick: handleViewDetails,
    },
  ];

  if (isLoading) {
    return <div>Loading engagement history...</div>;
  }

  if (error) {
    return <div>Error loading engagement history: {error.message}</div>;
  }

  return (
    <div className="space-y-space-6">
      <div>
        <h1 className="text-3xl font-bold">Engagement History</h1>
        <p className="text-muted-foreground">
          Review customer interaction history and AI summaries
        </p>
      </div>

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

      <Card>
        <CardHeader>
          <CardTitle>Customer Engagements ({filteredEngagements.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable 
            data={filteredEngagements} 
            columns={engagementColumns}
            loading={isLoading}
            searchable
            selectable
            pagination
            bulkActions={bulkActions}
            customActions={customActions}
            emptyMessage="No engagements found"
            emptyDescription="Customer engagements will appear here once available."
          />
        </CardContent>
      </Card>

    </div>
  );
}