/**
 * Navigation Tabs Component
 * Handles bottom navigation between Home, Messages, and Resources
 */

import React from 'react';
import { Home, MessageSquare, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type TabType = 'home' | 'messages' | 'resources';

interface NavigationTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onMessageTabClick?: () => void;
}

export function NavigationTabs({ 
  activeTab, 
  onTabChange, 
  onMessageTabClick 
}: NavigationTabsProps) {
  const handleTabClick = (tab: TabType) => {
    if (tab === 'messages' && onMessageTabClick) {
      onMessageTabClick();
    } else {
      onTabChange(tab);
    }
  };

  return (
    <div className="border-t bg-background p-1 shrink-0">
      <div className="flex justify-around">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleTabClick('home')}
          className={`flex-1 flex-col h-auto py-1 space-y-0.5 text-xs widget-interactive-element ${
            activeTab === 'home' ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <Home className="h-3 w-3" />
          <span>Home</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleTabClick('messages')}
          className={`flex-1 flex-col h-auto py-1 space-y-0.5 text-xs widget-interactive-element ${
            activeTab === 'messages' ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <MessageSquare className="h-3 w-3" />
          <span>Messages</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleTabClick('resources')}
          className={`flex-1 flex-col h-auto py-1 space-y-0.5 text-xs widget-interactive-element ${
            activeTab === 'resources' ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <FileText className="h-3 w-3" />
          <span>Resources</span>
        </Button>
      </div>
    </div>
  );
}