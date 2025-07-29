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
import { Save, Plus, Edit, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

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
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editNoteContent, setEditNoteContent] = useState('');
  const [notes, setNotes] = useState(mockNotes);
  const { toast } = useToast();

  // Update parent component with notes count
  useEffect(() => {
    onNotesCountChange?.(notes.length);
  }, [onNotesCountChange, notes.length]);

  const handleSaveNote = async () => {
    if (!newNote.trim()) return;
    
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Add new note to the beginning of the list
    const newNoteObject = {
      id: Date.now().toString(),
      content: newNote.trim(),
      author: 'Current Agent',
      timestamp: new Date().toISOString()
    };
    setNotes([newNoteObject, ...notes]);
    
    setNewNote('');
    setIsSaving(false);
    setShowAddNote(false);
    
    toast({
      title: "Note added",
      description: "Your note has been saved successfully.",
    });
  };

  const handleEditNote = (note: typeof mockNotes[0]) => {
    setEditingNoteId(note.id);
    setEditNoteContent(note.content);
  };

  const handleSaveEdit = async (noteId: string) => {
    if (!editNoteContent.trim()) return;
    
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update the note in the list
    setNotes(notes.map(note => 
      note.id === noteId 
        ? { ...note, content: editNoteContent.trim() }
        : note
    ));
    
    setEditingNoteId(null);
    setEditNoteContent('');
    setIsSaving(false);
    
    toast({
      title: "Note updated",
      description: "Your note has been updated successfully.",
    });
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditNoteContent('');
  };

  const handleDeleteNote = async (noteId: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Remove note from the list
    setNotes(notes.filter(note => note.id !== noteId));
    
    toast({
      title: "Note deleted",
      description: "The note has been removed successfully.",
    });
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
          {notes.map((note, index) => (
            <div key={note.id}>
              <div className="py-space-4 px-space-2">
                {editingNoteId === note.id ? (
                  // Edit mode
                  <div className="space-y-space-3">
                    <Textarea
                      value={editNoteContent}
                      onChange={(e) => setEditNoteContent(e.target.value)}
                      rows={3}
                      className="text-xs"
                    />
                    <div className="flex gap-space-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleSaveEdit(note.id)}
                        disabled={!editNoteContent.trim() || isSaving}
                        className="text-xs h-6"
                      >
                        <Save className="h-3 w-3 mr-space-1" />
                        {isSaving ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                        className="text-xs h-6"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div className="group">
                    <div className="flex items-start justify-between">
                      <p className="text-xs text-text-primary mb-space-3 leading-relaxed flex-1 pr-space-2">
                        {note.content}
                      </p>
                      
                      {/* Action buttons - show on hover */}
                      <div className="flex items-center gap-space-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditNote(note)}
                          className="h-6 w-6 p-0 text-text-secondary hover:text-text-primary"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-text-secondary hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Note</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this note? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteNote(note.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    
                    <div className="text-xs text-text-secondary">
                      <span className="font-medium">{note.author}</span>
                      <span className="mx-space-2">•</span>
                      <span>
                        {formatDistanceToNow(new Date(note.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Separator between notes (not after the last one) */}
              {index < notes.length - 1 && (
                <Separator className="my-0" />
              )}
            </div>
          ))}
          
          {notes.length === 0 && (
            <div className="text-center py-space-6 text-xs text-text-secondary">
              No notes available for this chat
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}