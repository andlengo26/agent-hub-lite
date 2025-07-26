import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/admin/DataTable";
import { mockScraperJobs, ScraperJob } from "@/lib/mock-data";
import { Play, Edit } from "lucide-react";

const scraperColumns: Column<ScraperJob>[] = [
  { key: "url", header: "URL" },
  { key: "linkDepth", header: "Depth" },
  { key: "frequency", header: "Frequency" },
  { 
    key: "status", 
    header: "Status",
    cell: (value) => (
      <Badge variant={value === "completed" ? "default" : value === "failed" ? "destructive" : "secondary"}>
        {value}
      </Badge>
    )
  },
  { key: "lastScrapedAt", header: "Last Run" },
];

export default function URLScraper() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">URL Scraper</h1>
        <p className="text-muted-foreground">Manage website scraping jobs</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Scraper Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable 
            data={mockScraperJobs} 
            columns={scraperColumns} 
            onView={(job) => console.log("Run Now", job)}
            onEdit={(job) => console.log("Edit", job)} 
          />
        </CardContent>
      </Card>
    </div>
  );
}