/**
 * Email Composer Drawer for Missed Chat Follow-up
 * Provides a slide-up drawer interface for composing follow-up emails
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose
} from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Chat, EmailMessage } from '@/types';
import { 
  Send, 
  X, 
  Mail,
  Loader2,
  ChevronDown,
  ChevronUp,
  Paperclip
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmailComposerProps {
  isOpen: boolean;
  onClose: () => void;
  chat: Chat;
  onSendEmail?: (emailData: Omit<EmailMessage, 'id' | 'sentAt' | 'sentById'>) => Promise<void>;
}

export function EmailComposer({ 
  isOpen, 
  onClose, 
  chat, 
  onSendEmail 
}: EmailComposerProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    from: 'support@yourcompany.com',
    to: chat.requesterEmail,
    cc: '',
    bcc: '',
    subject: `Follow-up regarding your recent inquiry - ${chat.requesterName}`,
    body: `Dear ${chat.requesterName},

I hope this email finds you well. I noticed that we weren't able to connect during your recent chat session on ${new Date(chat.createdAt).toLocaleDateString()}.

I wanted to personally reach out to ensure your question or concern is addressed. Please feel free to reply to this email with any details about what you were looking for, and I'll be happy to assist you.

ORIGINAL CHAT CONTEXT:
Chat ID: ${chat.id}
Date: ${new Date(chat.createdAt).toLocaleString()}
Page: ${chat.pageUrl}
Browser: ${chat.browser}
Customer: ${chat.requesterName} (${chat.requesterEmail})

Alternatively, you can:
- Visit our website to start a new chat session
- Call our support line during business hours
- Browse our FAQ section for common questions

Thank you for your patience, and I look forward to helping you soon.

Best regards,
Customer Support Team`
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSendEmail = async () => {
    if (!onSendEmail) return;
    
    setIsSending(true);
    try {
      await onSendEmail({
        from: formData.from,
        to: formData.to,
        cc: formData.cc || undefined,
        bcc: formData.bcc || undefined,
        subject: formData.subject,
        body: formData.body,
        chatId: chat.id
      });
      onClose();
    } catch (error) {
      console.error('Failed to send email:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendAndClose = async () => {
    await handleSendEmail();
    // Additional logic for closing the chat could go here
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const isFormValid = formData.to.trim() && formData.subject.trim() && formData.body.trim();

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="pb-space-6 px-space-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-3">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <DrawerTitle>Compose Follow-up Email</DrawerTitle>
                <DrawerDescription>
                  Send a follow-up email for missed chat with {chat.requesterName}
                </DrawerDescription>
              </div>
            </div>
            <Badge variant="secondary" className="ml-auto">
              Missed Chat
            </Badge>
          </div>
        </DrawerHeader>

        <div className="px-space-6 flex-1 min-h-0 overflow-y-auto">
          <div className="space-y-space-6 pb-space-8">
            {/* Basic Email Fields */}
            <div className="space-y-space-4">
              <div className="grid grid-cols-2 gap-space-4">
                <div className="space-y-space-2">
                  <Label htmlFor="from">From</Label>
                  <Input
                    id="from"
                    value={formData.from}
                    onChange={(e) => handleInputChange('from', e.target.value)}
                    placeholder="support@yourcompany.com"
                  />
                </div>
                <div className="space-y-space-2">
                  <Label htmlFor="to">To</Label>
                  <Input
                    id="to"
                    value={formData.to}
                    onChange={(e) => handleInputChange('to', e.target.value)}
                    placeholder="customer@email.com"
                    required
                  />
                </div>
              </div>

              {/* Advanced Fields Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                className="w-full justify-between p-space-3 h-auto"
              >
                <span className="text-sm text-text-secondary">
                  Advanced Options (CC/BCC)
                </span>
                {isAdvancedOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>

              {/* Advanced Fields */}
              {isAdvancedOpen && (
                <div className="grid grid-cols-2 gap-space-4 animate-fade-in">
                  <div className="space-y-space-2">
                    <Label htmlFor="cc">CC</Label>
                    <Input
                      id="cc"
                      value={formData.cc}
                      onChange={(e) => handleInputChange('cc', e.target.value)}
                      placeholder="Optional CC recipients"
                    />
                  </div>
                  <div className="space-y-space-2">
                    <Label htmlFor="bcc">BCC</Label>
                    <Input
                      id="bcc"
                      value={formData.bcc}
                      onChange={(e) => handleInputChange('bcc', e.target.value)}
                      placeholder="Optional BCC recipients"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-space-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="Email subject"
                  required
                />
              </div>

              <div className="space-y-space-2">
                <Label htmlFor="body">Message</Label>
                <Textarea
                  id="body"
                  value={formData.body}
                  onChange={(e) => handleInputChange('body', e.target.value)}
                  placeholder="Compose your follow-up message..."
                  className="min-h-[200px] resize-none"
                  required
                />
              </div>

              {/* File Attachments */}
              <div className="space-y-space-2">
                <Label>Attachments</Label>
                <div className="flex flex-col gap-space-2">
                  <input
                    type="file"
                    id="file-input"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('file-input')?.click()}
                    className="w-fit"
                  >
                    <Paperclip className="h-4 w-4 mr-2" />
                    Attach Files
                  </Button>
                  
                  {/* Display attached files */}
                  {attachments.length > 0 && (
                    <div className="space-y-space-1">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-space-2 bg-surface rounded-radius-sm">
                          <span className="text-sm text-text-primary truncate">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(index)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator className="my-space-6" />

            {/* Chat Context */}
            <div className="bg-surface p-space-4 rounded-radius-md">
              <h4 className="text-sm font-medium text-text-primary mb-space-3">
                Original Chat Context
              </h4>
              <div className="text-xs text-text-secondary space-y-space-2">
                <p><strong>Chat ID:</strong> {chat.id}</p>
                <p><strong>Date:</strong> {new Date(chat.createdAt).toLocaleString()}</p>
                <p><strong>Page:</strong> {chat.pageUrl}</p>
                <p><strong>Browser:</strong> {chat.browser}</p>
              </div>
            </div>
          </div>
        </div>

        <DrawerFooter className="pt-space-6 px-space-6">
          <div className="flex flex-col sm:flex-row gap-space-3">
            <Button
              variant="default"
              onClick={handleSendAndClose}
              disabled={!isFormValid || isSending}
              className="flex-1"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send & Close Chat
            </Button>
            <Button
              variant="outline"
              onClick={handleSendEmail}
              disabled={!isFormValid || isSending}
              className="flex-1"
            >
              <Mail className="h-4 w-4 mr-2" />
              Send Only
            </Button>
            <DrawerClose asChild>
              <Button variant="ghost" disabled={isSending}>
                <X className="h-4 w-4 mr-2" />
                Close Drawer
              </Button>
            </DrawerClose>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}