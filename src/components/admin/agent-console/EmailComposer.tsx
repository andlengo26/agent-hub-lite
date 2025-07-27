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
  ChevronUp
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
  const [formData, setFormData] = useState({
    from: 'support@yourcompany.com',
    to: chat.requesterEmail,
    cc: '',
    bcc: '',
    subject: `Follow-up regarding your recent inquiry - ${chat.requesterName}`,
    body: `Dear ${chat.requesterName},

I hope this email finds you well. I noticed that we weren't able to connect during your recent chat session on ${new Date(chat.createdAt).toLocaleDateString()}.

I wanted to personally reach out to ensure your question or concern is addressed. Please feel free to reply to this email with any details about what you were looking for, and I'll be happy to assist you.

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

  const isFormValid = formData.to.trim() && formData.subject.trim() && formData.body.trim();

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="pb-space-4">
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

        <div className="px-space-4 flex-1 min-h-0 overflow-y-auto">
          <div className="space-y-space-4 pb-space-6">
            {/* Basic Email Fields */}
            <div className="space-y-space-3">
              <div className="grid grid-cols-2 gap-space-3">
                <div>
                  <Label htmlFor="from">From</Label>
                  <Input
                    id="from"
                    value={formData.from}
                    onChange={(e) => handleInputChange('from', e.target.value)}
                    placeholder="support@yourcompany.com"
                  />
                </div>
                <div>
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
                className="w-full justify-between p-space-2 h-auto"
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
                <div className="grid grid-cols-2 gap-space-3 animate-fade-in">
                  <div>
                    <Label htmlFor="cc">CC</Label>
                    <Input
                      id="cc"
                      value={formData.cc}
                      onChange={(e) => handleInputChange('cc', e.target.value)}
                      placeholder="Optional CC recipients"
                    />
                  </div>
                  <div>
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

              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="Email subject"
                  required
                />
              </div>

              <div>
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
            </div>

            <Separator />

            {/* Chat Context */}
            <div className="bg-surface p-space-3 rounded-radius-md">
              <h4 className="text-sm font-medium text-text-primary mb-space-2">
                Original Chat Context
              </h4>
              <div className="text-xs text-text-secondary space-y-1">
                <p><strong>Chat ID:</strong> {chat.id}</p>
                <p><strong>Date:</strong> {new Date(chat.createdAt).toLocaleString()}</p>
                <p><strong>Page:</strong> {chat.pageUrl}</p>
                <p><strong>Browser:</strong> {chat.browser}</p>
              </div>
            </div>
          </div>
        </div>

        <DrawerFooter className="pt-space-4">
          <div className="flex flex-col sm:flex-row gap-space-2">
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