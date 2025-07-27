/**
 * Detail Modal component for history and notes
 * Reusable modal with mode-based content
 */

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Section } from '@/components/common/Section';
import { Engagement } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { 
  History, 
  FileText, 
  Save, 
  MessageCircle, 
  Mail, 
  Phone, 
  Video,
  User,
  Clock,
  Star
} from 'lucide-react';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  mode: 'history' | 'notes';
  chatId: string;
  engagements?: Engagement[];
}

// Channel icons mapping
const getChannelIcon = (type: string) => {
  switch (type) {
    case 'chat': return MessageCircle;
    case 'email': return Mail;
    case 'phone': return Phone;
    case 'video': return Video;
    default: return MessageCircle;
  }
};

// Mock channel types for detailed engagements
const mockDetailedChannelTypes = ['chat', 'email', 'phone', 'video'];

// Mock data for demo
const mockHistory = [
  {
    id: '1',
    type: 'interaction',
    summary: 'Initial inquiry about shipping delay',
    agent: 'Sarah Agent',
    status: 'resolved',
    timestamp: '2025-01-26T14:30:00Z'
  },
  {
    id: '2',
    type: 'interaction', 
    summary: 'Follow-up on refund request',
    agent: 'Mike Support',
    status: 'pending',
    timestamp: '2025-01-25T09:15:00Z'
  }
];

const mockNotes = [
  {
    id: '1',
    content: 'Customer is a premium member. Handle with priority.',
    author: 'Sarah Agent',
    timestamp: '2025-01-27T10:00:00Z'
  },
  {
    id: '2',
    content: 'Previous issue with billing resolved. Customer was satisfied with solution.',
    author: 'Mike Support', 
    timestamp: '2025-01-26T15:30:00Z'
  }
];

export function DetailModal({
  isOpen,
  onClose,
  title,
  mode,
  chatId,
  engagements = [],
}: DetailModalProps) {
  const [newNote, setNewNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveNote = async () => {
    if (!newNote.trim()) return;
    
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setNewNote('');
    setIsSaving(false);
  };

  const renderHistoryContent = () => (
    <Section padding="none">
      <ScrollArea className="h-96">
        <div className="space-y-space-4">
          {engagements.length > 0 ? (
            engagements.map((engagement, index) => {
              const channelType = mockDetailedChannelTypes[index % mockDetailedChannelTypes.length];
              const ChannelIcon = getChannelIcon(channelType);
              
              return (
                <div
                  key={engagement.id}
                  className="p-space-4 border border-border rounded-radius-md bg-surface"
                >
                  <div className="flex items-start justify-between mb-space-3">
                    <div className="flex items-center gap-space-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                        <ChannelIcon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-space-2 mb-space-1">
                          <Badge variant="outline" className="text-xs capitalize">
                            {channelType}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {engagement.engagementCount} interactions
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-text-primary">
                          {engagement.customerName}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-text-secondary text-right">
                      {formatDistanceToNow(new Date(engagement.lastEngagedAt), { addSuffix: true })}
                    </div>
                  </div>

                  <Separator className="my-space-3" />
                  
                  <div className="mb-space-3">
                    <h4 className="text-sm font-medium text-text-primary mb-space-2">AI Summary</h4>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {engagement.aiSummary}
                    </p>
                  </div>

                  <Separator className="my-space-3" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-2">
                      <User className="h-3 w-3 text-text-secondary" />
                      <span className="text-xs text-text-secondary">
                        Agents: {engagement.agentsInvolved.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-space-2">
                      <Star className="h-3 w-3 text-highlight" />
                      <span className="text-xs text-text-secondary">
                        Contact: {engagement.contactNumber}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-space-8 text-text-secondary">
              <History className="h-12 w-12 mx-auto mb-space-4 opacity-50" />
              <h3 className="font-medium mb-space-2">No engagement history</h3>
              <p className="text-sm">This customer has no previous interactions</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </Section>
  );

  const renderNotesContent = () => (
    <Section padding="none">
      <div className="space-y-space-4">
        {/* Add new note */}
        <div className="p-space-4 border border-border rounded-radius-md">
          <div className="flex items-center gap-space-2 mb-space-3">
            <FileText className="h-4 w-4 text-text-secondary" />
            <span className="font-medium text-text-primary">Add Note</span>
          </div>
          
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add internal note about this customer..."
            rows={3}
            className="mb-space-3"
          />
          
          <Button
            variant="default"
            size="sm"
            onClick={handleSaveNote}
            disabled={!newNote.trim() || isSaving}
          >
            <Save className="h-4 w-4 mr-space-2" />
            {isSaving ? 'Saving...' : 'Save Note'}
          </Button>
        </div>

        {/* Existing notes */}
        <ScrollArea className="h-64">
          <div className="space-y-space-3">
            {mockNotes.map((note) => (
              <div
                key={note.id}
                className="p-space-3 bg-surface rounded-radius-md"
              >
                <p className="text-sm text-text-primary mb-space-2">
                  {note.content}
                </p>
                
                <div className="text-xs text-text-secondary">
                  <span>{note.author}</span>
                  <span className="mx-space-2">•</span>
                  <span>
                    {formatDistanceToNow(new Date(note.timestamp), { addSuffix: true })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </Section>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
      footer={
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      }
    >
      {mode === 'history' ? renderHistoryContent() : renderNotesContent()}
    </Modal>
  );
}
