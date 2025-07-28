/**
 * Notes Section component with continuous scroll
 * Displays all notes in one scrollable list separated by horizontal lines
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow } from 'date-fns';
import { Save, Plus } from 'lucide-react';

interface NotesSectionProps {
  chatId: string;
  onNotesCountChange?: (count: number) => void;
}

// Mock notes data
const mockNotes = [
  {
    id: '1',
    content: 'Customer is a premium member. Handle with priority and ensure fast resolution.',
    author: 'Sarah Agent',
    timestamp: '2025-01-27T10:00:00Z'
  },
  {
    id: '2',
    content: 'Previous issue with billing resolved. Customer was satisfied with solution.',
    author: 'Mike Support', 
    timestamp: '2025-01-26T15:30:00Z'
  },
  {
    id: '3',
    content: 'Customer prefers email communication over phone calls.',
    author: 'Lisa Manager',
    timestamp: '2025-01-25T11:45:00Z'
  },
  {
    id: '4',
    content: 'Has had three support interactions this month. Monitor for escalation.',
    author: 'Sarah Agent',
    timestamp: '2025-01-24T09:20:00Z'
  }
];

export function NotesSection({ chatId, onNotesCountChange }: NotesSectionProps) {
  const [newNote, setNewNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);

  // Update parent component with notes count
  useEffect(() => {
    onNotesCountChange?.(mockNotes.length);
  }, [onNotesCountChange]);

  const handleSaveNote = async () => {
    if (!newNote.trim()) return;
    
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setNewNote('');
    setIsSaving(false);
    setShowAddNote(false);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Add Note Button */}
      {!showAddNote && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddNote(true)}
          className="mb-space-3 justify-start text-xs"
        >
          <Plus className="h-3 w-3 mr-space-2" />
          Add Note
        </Button>
      )}

      {/* Add New Note Form */}
      {showAddNote && (
        <div className="mb-space-3 p-space-3 border border-border rounded-radius-sm bg-surface/50">
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add internal note about this customer..."
            rows={2}
            className="mb-space-2 text-xs"
          />
          
          <div className="flex gap-space-2">
            <Button
              variant="default"
              size="sm"
              onClick={handleSaveNote}
              disabled={!newNote.trim() || isSaving}
              className="text-xs h-6"
            >
              <Save className="h-3 w-3 mr-space-1" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowAddNote(false);
                setNewNote('');
              }}
              className="text-xs h-6"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Notes List with Continuous Scroll */}
      <ScrollArea className="flex-1">
        <div className="space-y-0">
          {mockNotes.map((note, index) => (
            <div key={note.id}>
              <div className="py-space-4 px-space-2">
                <p className="text-xs text-text-primary mb-space-3 leading-relaxed">
                  {note.content}
                </p>
                
                <div className="text-xs text-text-secondary">
                  <span className="font-medium">{note.author}</span>
                  <span className="mx-space-2">•</span>
                  <span>
                    {formatDistanceToNow(new Date(note.timestamp), { addSuffix: true })}
                  </span>
                </div>
              </div>
              
              {/* Separator between notes (not after the last one) */}
              {index < mockNotes.length - 1 && (
                <Separator className="my-0" />
              )}
            </div>
          ))}
          
          {mockNotes.length === 0 && (
            <div className="text-center py-space-6 text-xs text-text-secondary">
              No notes available for this chat
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}