import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { DataTable, Column } from "@/components/admin/DataTable";
import { mockEngagements, Engagement } from "@/lib/mock-data";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const engagementColumns: Column<Engagement>[] = [
  { key: "customerName", header: "Customer" },
  { key: "customerEmail", header: "Email" },
  { key: "engagementCount", header: "Engagements" },
  { key: "lastEngagedAt", header: "Last Contact" },
  { key: "agentsInvolved", header: "Agents", cell: (value) => value.length },
];

export default function EngagementHistory() {
  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  const toggleRow = (id: string) => {
    setExpandedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

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
          <CardTitle>Customer Engagements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockEngagements.map((engagement) => (
              <div key={engagement.id} className="border rounded-lg">
                <Collapsible
                  open={expandedRows.includes(engagement.id)}
                  onOpenChange={() => toggleRow(engagement.id)}
                >
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer">
                      <div className="flex items-center gap-4">
                        {expandedRows.includes(engagement.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <div>
                          <p className="font-medium">{engagement.customerName}</p>
                          <p className="text-sm text-muted-foreground">{engagement.customerEmail}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{engagement.engagementCount} interactions</p>
                        <p className="text-sm text-muted-foreground">
                          Last: {new Date(engagement.lastEngagedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-4 pb-4 space-y-4">
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">AI Summary</h4>
                        <p className="text-sm">{engagement.aiSummary}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm"><strong>Contact:</strong> {engagement.contactNumber}</p>
                          <p className="text-sm"><strong>Agents:</strong> {engagement.agentsInvolved.length}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          View Full Transcript
                        </Button>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}