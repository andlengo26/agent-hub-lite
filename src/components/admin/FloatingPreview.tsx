import { useState } from "react";
import { Eye, X, Maximize2, Minimize2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWidgetSettings } from "@/hooks/useWidgetSettings";

export function FloatingPreview() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const { settings } = useWidgetSettings();

  if (!settings) return null;

  const { appearance, aiSettings } = settings;
  
  // Get position classes based on buttonPosition setting
  const getPositionClasses = () => {
    switch (appearance.buttonPosition) {
      case 'bottom-left':
        return 'bottom-6 left-6';
      case 'top-right':
        return 'top-6 right-6';
      case 'top-left':
        return 'top-6 left-6';
      default: // bottom-right
        return 'bottom-6 right-6';
    }
  };

  const getExpandedPositionClasses = () => {
    if (isMaximized) return "top-4 left-4 right-4 bottom-4";
    
    switch (appearance.buttonPosition) {
      case 'bottom-left':
        return 'bottom-6 left-6 w-96 h-64';
      case 'top-right':
        return 'top-6 right-6 w-96 h-64';
      case 'top-left':
        return 'top-6 left-6 w-96 h-64';
      default: // bottom-right
        return 'bottom-6 right-6 w-96 h-64';
    }
  };

  if (!isExpanded) {
    return (
      <div className={`fixed z-50 ${getPositionClasses()}`}>
        <Button
          onClick={() => setIsExpanded(true)}
          className="h-12 w-12 rounded-full shadow-lg text-white"
          style={{ backgroundColor: appearance.primaryColor }}
          size="icon"
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed z-50 bg-background border rounded-lg shadow-lg ${getExpandedPositionClasses()}`}>
      <Card className="h-full">
        <CardHeader 
          className="flex flex-row items-center justify-between pb-2 text-white rounded-t-lg"
          style={{ backgroundColor: appearance.primaryColor }}
        >
          <CardTitle className="text-sm">{appearance.headerText}</CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-white hover:bg-white/20"
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
              className="h-6 w-6 text-white hover:bg-white/20"
              onClick={() => setIsExpanded(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Welcome message */}
            <div className="flex items-start space-x-3 mb-4">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
                style={{ backgroundColor: appearance.secondaryColor }}
              >
                AI
              </div>
              <div className="flex-1">
                <div className="bg-muted rounded-lg px-3 py-2">
                  <p className="text-sm">{aiSettings.welcomeMessage}</p>
                </div>
              </div>
            </div>
            
            {/* Input area */}
            <div className="mt-auto">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 text-sm border border-input rounded-lg bg-background"
                  disabled
                />
                <button
                  className="px-3 py-2 text-white text-sm rounded-lg"
                  style={{ backgroundColor: appearance.highlightColor }}
                  disabled
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}