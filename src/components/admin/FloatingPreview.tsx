import { useState } from "react";
import { Eye, X, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FloatingPreview() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  if (!isExpanded) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsExpanded(true)}
          className="h-12 w-12 rounded-full shadow-lg"
          size="icon"
        >
          <Eye className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed z-50 bg-background border rounded-lg shadow-lg ${
      isMaximized 
        ? "top-4 left-4 right-4 bottom-4" 
        : "bottom-6 right-6 w-96 h-64"
    }`}>
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm">Live Preview</CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsMaximized(!isMaximized)}
            >
              {isMaximized ? (
                <Minimize2 className="h-3 w-3" />
              ) : (
                <Maximize2 className="h-3 w-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsExpanded(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-2">
          <div className="w-full h-full bg-muted rounded border-2 border-dashed border-border flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Eye className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Widget Preview</p>
              <p className="text-xs">Live customer view</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}