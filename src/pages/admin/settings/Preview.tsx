import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Preview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Widget Preview</h1>
        <p className="text-muted-foreground">Preview your chat widget configuration</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 bg-muted/30">
            <div className="text-center text-muted-foreground">
              <div className="w-80 h-96 mx-auto bg-white rounded-lg shadow-lg border flex flex-col">
                <div className="bg-primary text-primary-foreground p-4 rounded-t-lg">
                  <h3 className="font-semibold">Customer Support</h3>
                  <p className="text-sm">We're here to help</p>
                </div>
                <div className="flex-1 p-4 space-y-2">
                  <div className="bg-muted p-2 rounded text-sm">Hello! How can I help you today?</div>
                </div>
                <div className="p-4 border-t">
                  <div className="bg-muted rounded p-2 text-sm text-muted-foreground">Type your message...</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}