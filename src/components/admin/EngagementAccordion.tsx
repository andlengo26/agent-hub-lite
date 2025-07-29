import React, { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChatPanel } from '@/components/admin/ChatPanel';
import { CustomerEngagement } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  MoreHorizontal, 
  Trash2, 
  Edit, 
  MessageSquare, 
  Mail, 
  Phone,
  User,
  Calendar,
  FileText,
  Play,
  Pause,
  Volume2
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface EngagementAccordionProps {
  engagements: CustomerEngagement[];
  onDeleteEngagement: (id: string) => void;
  onEditEngagement: (engagement: CustomerEngagement) => void;
  expandedRow: string | null;
  onExpandedRowChange: (id: string | null) => void;
  selectedEngagements?: Set<string>;
  onSelectEngagement?: (id: string, checked: boolean) => void;
  showActions?: boolean;
}

interface AudioPlayerProps {
  src: string;
  duration: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, duration }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-surface rounded-lg border border-border">
      <Button
        variant="outline"
        size="sm"
        onClick={togglePlay}
        className="w-10 h-10 rounded-full p-0"
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      
      <div className="flex-1">
        <div className="flex items-center justify-between text-sm text-text-secondary mb-1">
          <span>Call Recording</span>
          <span>{duration}</span>
        </div>
        <div className="w-full bg-border rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentTime / 100) * 100}%` }}
          />
        </div>
      </div>
      
      <Volume2 className="h-4 w-4 text-text-secondary" />
    </div>
  );
};

const getChannelIcon = (channel: string) => {
  switch (channel) {
    case 'chat':
      return <MessageSquare className="h-4 w-4" />;
    case 'email':
      return <Mail className="h-4 w-4" />;
    case 'phone':
      return <Phone className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const getChannelColor = (channel: string) => {
  switch (channel) {
    case 'chat':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'email':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'phone':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

export function EngagementAccordion({
  engagements,
  onDeleteEngagement,
  onEditEngagement,
  expandedRow,
  onExpandedRowChange,
  selectedEngagements,
  onSelectEngagement,
  showActions = true,
}: EngagementAccordionProps) {
  const { toast } = useToast();
  const [editingRow, setEditingRow] = useState<string | null>(null);

  const handleRowExpand = (id: string) => {
    onExpandedRowChange(expandedRow === id ? null : id);
  };

  const handleDelete = (engagement: CustomerEngagement) => {
    onDeleteEngagement(engagement.id);
    toast({
      title: "Engagement deleted",
      description: "The engagement has been successfully removed.",
    });
  };

  const handleEdit = (engagement: CustomerEngagement) => {
    setEditingRow(engagement.id);
    onEditEngagement(engagement);
  };

  const renderChannelContent = (engagement: CustomerEngagement) => {
    switch (engagement.channel) {
      case 'chat':
        // Create a mock Chat object for ChatPanel
        const mockChat = {
          id: engagement.id,
          requesterName: engagement.customerId,
          requesterEmail: '',
          requesterPhone: '',
          ipAddress: '192.168.1.1',
          browser: 'Chrome',
          pageUrl: 'https://example.com',
          status: 'closed' as const,
          assignedAgentId: engagement.agentId,
          createdAt: engagement.date,
          lastUpdatedAt: engagement.date,
          geo: 'US',
          summary: engagement.aiSummary,
        };
        return <ChatPanel chat={mockChat} />;

      case 'phone':
        return (
          <div className="space-y-4">
            <AudioPlayer 
              src="/mock-audio.mp3" 
              duration="5:23" 
            />
            <div className="space-y-2">
              <h4 className="font-medium text-text-primary">Call Summary</h4>
              <p className="text-sm text-text-secondary">{engagement.aiSummary}</p>
            </div>
          </div>
        );

      case 'email':
        return (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">Support Request</CardTitle>
                  <p className="text-sm text-text-secondary mt-1">
                    From: customer@example.com
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {format(new Date(engagement.date), 'MMM dd, yyyy')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium text-text-primary mb-2">Email Content</h4>
                <div className="p-3 bg-surface rounded border border-border text-sm">
                  {engagement.transcript}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-text-primary mb-2">AI Summary</h4>
                <p className="text-sm text-text-secondary">{engagement.aiSummary}</p>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return (
          <div className="space-y-3">
            <div className="prose prose-sm max-w-none">
              <h4 className="font-medium text-text-primary">General Engagement</h4>
              <div className="text-sm text-text-secondary space-y-2">
                <p><strong>Summary:</strong> {engagement.aiSummary}</p>
                <p><strong>Details:</strong> {engagement.transcript}</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-2">
      <Accordion
        type="single"
        collapsible
        value={expandedRow || ''}
        onValueChange={onExpandedRowChange}
      >
        {engagements.map((engagement) => (
          <AccordionItem
            key={engagement.id}
            value={engagement.id}
            className="border border-border rounded-lg px-4 bg-background"
          >
            <div className="flex items-center gap-3">
              {onSelectEngagement && (
                <Checkbox
                  checked={selectedEngagements?.has(engagement.id) || false}
                  onCheckedChange={(checked) => onSelectEngagement(engagement.id, checked as boolean)}
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              
              <AccordionTrigger
                className="flex-1 py-4 hover:no-underline [&>svg]:ml-auto"
                onClick={() => handleRowExpand(engagement.id)}
              >
                <div className="flex items-center gap-4 flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <Badge className={cn("gap-1 text-xs", getChannelColor(engagement.channel))}>
                      {getChannelIcon(engagement.channel)}
                      {engagement.channel}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(engagement.date), 'MMM dd, yyyy')}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <User className="h-3 w-3" />
                    {engagement.agentName}
                  </div>
                  
                  <div className="flex-1 text-sm text-text-primary truncate">
                    {engagement.aiSummary}
                  </div>
                </div>
              </AccordionTrigger>

              {showActions && (
                <div className="flex items-center gap-2">
                  {expandedRow === engagement.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(engagement);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                      <DropdownMenuItem onClick={() => handleRowExpand(engagement.id)}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(engagement)}>
                        Edit
                      </DropdownMenuItem>
                      <Separator className="my-1" />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-3 w-3 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Engagement</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this engagement? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(engagement)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>

            <AccordionContent className="pb-4">
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-text-primary">Engagement Details</h3>
                  {expandedRow === engagement.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(engagement)}
                      className="text-text-secondary hover:text-text-primary"
                    >
                      <Edit className="h-3 w-3 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  {renderChannelContent(engagement)}
                  
                  {engagement.agentNotes && (
                    <div>
                      <h4 className="font-medium text-text-primary mb-2">Agent Notes</h4>
                      <div className="p-3 bg-surface rounded border border-border text-sm text-text-secondary">
                        {engagement.agentNotes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}