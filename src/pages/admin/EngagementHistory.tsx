import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Download, Archive, Trash2 } from "lucide-react";
import { Engagement } from "@/types";
import { useEngagements } from "@/hooks/useEngagements";
import { Modal } from "@/components/ui/Modal";
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
  const [selectedEngagement, setSelectedEngagement] = useState<Engagement | null>(null);

  const { data: engagementsResponse, isLoading, error } = useEngagements({});

  const engagements = engagementsResponse?.data || [];

  const handleViewDetails = (engagement: Engagement) => {
    setSelectedEngagement(engagement);
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
            onView={handleViewDetails}
            bulkActions={bulkActions}
            emptyMessage="No engagements found"
            emptyDescription="Customer engagements will appear here once available."
          />
        </CardContent>
      </Card>

      <Modal
        isOpen={!!selectedEngagement}
        onClose={() => setSelectedEngagement(null)}
        title="Engagement Details"
        size="lg"
      >
        {selectedEngagement && (
          <div className="space-y-space-4">
            <div className="grid grid-cols-2 gap-space-4">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">Customer</h3>
                <p>{selectedEngagement.customerName}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">Email</h3>
                <p>{selectedEngagement.customerEmail}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">Contact Number</h3>
                <p>{selectedEngagement.contactNumber}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">Total Engagements</h3>
                <Badge variant="outline">{selectedEngagement.engagementCount}</Badge>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">Last Contact</h3>
                <p>{new Date(selectedEngagement.lastEngagedAt).toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">Agents Involved</h3>
                <p>{selectedEngagement.agentsInvolved.length} agents</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-space-2">AI Summary</h3>
              <p className="text-sm bg-muted p-space-3 rounded-md">{selectedEngagement.aiSummary}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}