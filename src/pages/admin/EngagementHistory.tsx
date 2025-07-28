import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, Column } from "@/components/ui/data-table";
import { SearchInput } from "@/components/common/SearchInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Engagement } from "@/types";
import { useEngagements } from "@/hooks/useEngagements";
import { Modal } from "@/components/ui/Modal";

const engagementColumns: Column<Engagement>[] = [
  { key: "customerName", label: "Customer" },
  { key: "customerEmail", label: "Email" },
  { key: "engagementCount", label: "Engagements", render: (value) => (
    <Badge variant="outline">{value}</Badge>
  )},
  { key: "lastEngagedAt", label: "Last Contact", render: (value) => 
    new Date(value).toLocaleDateString()
  },
  { key: "agentsInvolved", label: "Agents", render: (value) => value.length },
];

export default function EngagementHistory() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('lastEngagedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedEngagement, setSelectedEngagement] = useState<Engagement | null>(null);

  const { data: engagementsResponse, isLoading, error } = useEngagements({
    search,
    sortBy,
    sortOrder,
  });

  const engagements = engagementsResponse?.data || [];

  const handleViewDetails = (engagement: Engagement) => {
    setSelectedEngagement(engagement);
  };

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
          <div className="flex gap-space-4 items-center mt-space-4">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search customers, emails, or summaries..."
              className="flex-1"
            />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lastEngagedAt">Last Contact</SelectItem>
                <SelectItem value="customerName">Customer Name</SelectItem>
                <SelectItem value="engagementCount">Engagement Count</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Desc</SelectItem>
                <SelectItem value="asc">Asc</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable 
            data={engagements} 
            columns={engagementColumns}
            onView={handleViewDetails}
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