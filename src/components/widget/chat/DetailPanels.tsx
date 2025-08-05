/**
 * Detail Panels Component
 * Handles FAQ, Resource, and Message detail views
 */

import React from 'react';
import { FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DetailPanelsProps {
  selectedFAQ?: any;
  selectedResource?: any;
  selectedChat?: any;
  appearance: {
    primaryColor: string;
  };
}

export function FAQDetailPanel({ selectedFAQ }: { selectedFAQ?: any }) {
  if (!selectedFAQ) return null;
  
  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{selectedFAQ.question}</CardTitle>
            <div className="flex gap-1 flex-wrap">
              {selectedFAQ.tags.map((tag: string, index: number) => (
                <span key={index} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                  {tag}
                </span>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {selectedFAQ.answer}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function ResourceDetailPanel({ 
  selectedResource, 
  appearance 
}: { 
  selectedResource?: any; 
  appearance: { primaryColor: string };
}) {
  if (!selectedResource) return null;
  
  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{selectedResource.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Type</h4>
              <p className="text-sm text-muted-foreground capitalize">{selectedResource.type}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">{selectedResource.aiInstructions}</p>
            </div>

            {selectedResource.contentPreview && (
              <div>
                <h4 className="text-sm font-medium mb-2">Preview</h4>
                <p className="text-sm text-muted-foreground">{selectedResource.contentPreview}</p>
              </div>
            )}

            <div className="space-y-2">
              <Button 
                size="sm" 
                onClick={() => window.open(selectedResource.url, '_blank')}
                className="w-full"
                style={{ backgroundColor: appearance.primaryColor }}
              >
                View Resource
                <FileText className="h-3 w-3 ml-1" />
              </Button>
              
              {selectedResource.fileName && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.open(selectedResource.url, '_blank')}
                  className="w-full"
                >
                  Download ({selectedResource.fileSize ? `${Math.round(selectedResource.fileSize / 1024)}KB` : 'Unknown size'})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function MessageDetailPanel({ selectedChat }: { selectedChat?: any }) {
  if (!selectedChat) return null;
  
  return (
    <div className="space-y-4">
      {/* Header with date and AI summary */}
      <div className="bg-muted/30 p-3 rounded-lg border">
        <div className="flex justify-between items-start mb-2">
          <span className="text-sm font-medium text-foreground">
            {new Date(selectedChat.timestamp).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded ${
            selectedChat.status === 'active' ? 'bg-green-100 text-green-800' :
            selectedChat.status === 'ended' ? 'bg-gray-100 text-gray-800' :
            'bg-orange-100 text-orange-800'
          }`}>
            {selectedChat.status}
          </span>
        </div>
        <div className="bg-primary/5 p-2 rounded border-l-2 border-primary/20">
          <p className="text-xs font-medium text-primary mb-1">AI Summary</p>
          <p className="text-xs text-muted-foreground">
            {selectedChat.summary || `Conversation with ${selectedChat.messages.length} messages. Topics discussed include customer support inquiries and general assistance.`}
          </p>
        </div>
      </div>
      
      {/* Messages */}
      {selectedChat.messages.map((message: any, index: number) => (
        <div
          key={index}
          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[80%] p-3 rounded-lg ${
              message.type === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <p className="text-sm">{message.content}</p>
            <span className="text-xs opacity-70 mt-1 block">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}