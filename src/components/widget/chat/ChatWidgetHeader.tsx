/**
 * Widget Header Component
 * Handles all header logic including navigation, titles, and controls
 */

import React from 'react';
import { ArrowLeft, X, Maximize2, Minimize2, Phone, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardTitle, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CountdownBadge } from '@/components/widget/CountdownBadge';

export type PanelType = 'main' | 'chat' | 'faq-detail' | 'resource-detail' | 'message-detail';
export type TabType = 'home' | 'messages' | 'resources';

interface ChatWidgetHeaderProps {
  currentPanel: PanelType;
  activeTab: TabType;
  appearance: {
    primaryColor: string;
    headerText: string;
    subheaderText?: string;
  };
  currentOrg?: {
    logoUrl?: string;
  };
  selectedResource?: { title: string };
  selectedFAQ?: any;
  selectedChat?: any;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onBackToMain: () => void;
  onToggleMaximize: () => void;
  onMinimize: () => void;
  onVoiceCall?: () => void;
  isMaximized: boolean;
  enableVoiceCalls: boolean;
  sessionTimer?: {
    timerState: { isActive: boolean };
    getRemainingMinutes: () => number;
  };
}

export function ChatWidgetHeader({
  currentPanel,
  activeTab,
  appearance,
  currentOrg,
  selectedResource,
  selectedFAQ,
  selectedChat,
  searchQuery,
  onSearchChange,
  onBackToMain,
  onToggleMaximize,
  onMinimize,
  onVoiceCall,
  isMaximized,
  enableVoiceCalls,
  sessionTimer
}: ChatWidgetHeaderProps) {
  const renderHeaderContent = () => {
    switch (currentPanel) {
      case 'main':
        switch (activeTab) {
          case 'home':
            return (
              <div className="flex items-center gap-3">
                {currentOrg?.logoUrl && (
                  <img 
                    src={currentOrg.logoUrl} 
                    alt="Organization Logo" 
                    className="h-8 w-8 rounded object-contain bg-white/10 p-1"
                  />
                )}
                <div>
                  <CardTitle className="text-sm font-medium">{appearance.headerText}</CardTitle>
                  {appearance.subheaderText && (
                    <p className="text-xs opacity-90 mt-1">{appearance.subheaderText}</p>
                  )}
                </div>
              </div>
            );
          case 'messages':
            return <CardTitle className="text-sm font-medium">Messages</CardTitle>;
          case 'resources':
            return (
              <div className="flex items-center gap-3 flex-1">
                <CardTitle className="text-sm font-medium">Resources</CardTitle>
                <div className="flex-1 max-w-sm">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-white/70" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => onSearchChange(e.target.value)}
                      placeholder="Search resources..."
                      className="pl-9 h-7 text-xs bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30"
                    />
                  </div>
                </div>
              </div>
            );
        }
        break;
      case 'resource-detail':
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onBackToMain} className="p-0 h-auto text-white hover:bg-white/20 widget-interactive-element" data-critical="true">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-sm font-medium">{selectedResource?.title}</CardTitle>
          </div>
        );
      case 'faq-detail':
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onBackToMain} className="p-0 h-auto text-white hover:bg-white/20 widget-interactive-element" data-critical="true">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-sm font-medium">FAQ</CardTitle>
          </div>
        );
      case 'message-detail':
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onBackToMain} className="p-0 h-auto text-white hover:bg-white/20 widget-interactive-element" data-critical="true">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
          </div>
        );
      case 'chat':
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onBackToMain} className="p-0 h-auto text-white hover:bg-white/20 widget-interactive-element" data-critical="true">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-sm font-medium">Chat</CardTitle>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <CardHeader 
      className="flex flex-row items-center justify-between py-3 text-white rounded-t-lg shrink-0"
      style={{ backgroundColor: appearance.primaryColor }}
    >
      <div className="flex items-center gap-2 flex-1">
        {renderHeaderContent()}
      </div>
      
      <div className="flex items-center gap-1">
        {/* Session Timer Countdown Badge */}
        {sessionTimer?.timerState.isActive && sessionTimer.getRemainingMinutes() <= 5 && (
          <CountdownBadge
            remainingMinutes={sessionTimer.getRemainingMinutes()}
            showCountdown={true}
            variant={sessionTimer.getRemainingMinutes() <= 2 ? 'danger' : 'warning'}
          />
        )}
        
        {enableVoiceCalls && onVoiceCall && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-white hover:bg-white/20"
            onClick={onVoiceCall}
          >
            <Phone className="h-4 w-4" />
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-white hover:bg-white/20 widget-interactive-element"
          onClick={onToggleMaximize}
          data-critical="true"
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
          className="h-7 w-7 text-white hover:bg-white/20 widget-interactive-element"
          onClick={onMinimize}
          data-critical="true"
          aria-label="minimize widget"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </CardHeader>
  );
}