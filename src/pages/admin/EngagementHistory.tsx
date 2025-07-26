import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, Column } from "@/components/admin/DataTable";

interface Engagement {
  id: string;
  customerName: string;
  customerEmail: string;
  engagementCount: number;
  lastEngagedAt: string;
  agentsInvolved: string[];
}

const engagementColumns: Column<Engagement>[] = [
  { key: "customerName", header: "Customer" },
  { key: "customerEmail", header: "Email" },
  { key: "engagementCount", header: "Engagements" },
  { key: "lastEngagedAt", header: "Last Contact" },
  { key: "agentsInvolved", header: "Agents", cell: (value) => value.length },
];

export default function EngagementHistory() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Engagement History</h1>
        <p className="text-muted-foreground">
          Review customer interaction history and AI summaries
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon: Engagement History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-6">
              Engagement tracking and analytics features will be available soon.
            </p>
            <DataTable 
              data={[]} 
              columns={engagementColumns}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}