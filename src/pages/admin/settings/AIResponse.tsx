import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";


export default function AIResponse() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Auto AI Response</h1>
        <p className="text-muted-foreground">
          Configure automatic AI response settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Response Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-response">Enable Auto Response</Label>
              <p className="text-sm text-muted-foreground">
                Automatically respond to customer inquiries
              </p>
            </div>
            <Switch id="auto-response" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="smart-routing">Smart Routing</Label>
              <p className="text-sm text-muted-foreground">
                Route complex queries to human agents
              </p>
            </div>
            <Switch id="smart-routing" defaultChecked />
          </div>

          <div className="space-y-2">
            <Label htmlFor="response-delay">Response Delay (seconds)</Label>
            <Input id="response-delay" type="number" defaultValue="2" min="0" max="10" />
          </div>

          <Button>Save Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}