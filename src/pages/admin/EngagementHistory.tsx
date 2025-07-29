import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Download, Archive, Trash2 } from "lucide-react";
import { Engagement } from "@/types";
import { useEngagements } from "@/hooks/useEngagements";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

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

  const engagements = engagementsResponse?.data || [];

  const handleViewDetails = (engagement: Engagement) => {
    navigate(`/chats/history/${engagement.id}`);
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

      <Card>
        <CardHeader>
          <CardTitle>Customer Engagements</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable 
            data={engagements} 
            columns={engagementColumns}
            loading={isLoading}
            searchable
            selectable
            pagination
            onRowClick={handleViewDetails}
            bulkActions={bulkActions}
            emptyMessage="No engagements found"
            emptyDescription="Customer engagements will appear here once available."
          />
        </CardContent>
      </Card>

    </div>
  );
}