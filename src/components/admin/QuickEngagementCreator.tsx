/**
 * Quick Engagement Creator Component
 * Allows agents to quickly create engagements from different channels
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useCreateEngagementFromEmail, useCreateEngagementFromPhone } from '@/hooks/useEngagementService';
import { MessageSquare, Phone, Mail } from 'lucide-react';

interface QuickEngagementCreatorProps {
  onEngagementCreated?: () => void;
}

export function QuickEngagementCreator({ onEngagementCreated }: QuickEngagementCreatorProps) {
  const [channel, setChannel] = useState<'email' | 'phone'>('email');
  const [formData, setFormData] = useState({
    customerEmail: '',
    customerPhone: '',
    customerName: '',
    subject: '', // For email
    content: '', // For email
    duration: '', // For phone
    summary: '', // For phone
    aiSummary: '',
    notes: '',
  });

  const createEmailEngagement = useCreateEngagementFromEmail();
  const createPhoneEngagement = useCreateEngagementFromPhone();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const currentUser = { id: 'agent_001', name: 'Current Agent' }; // This would come from auth context

      if (channel === 'email') {
        if (!formData.customerEmail || !formData.subject) {
          toast({
            title: "Validation Error",
            description: "Customer email and subject are required for email engagements",
            variant: "destructive",
          });
          return;
        }

        await createEmailEngagement.mutateAsync({
          customerEmail: formData.customerEmail,
          customerName: formData.customerName,
          agentId: currentUser.id,
          agentName: currentUser.name,
          subject: formData.subject,
          content: formData.content,
          aiSummary: formData.aiSummary,
          notes: formData.notes ? [formData.notes] : [],
        });
      } else if (channel === 'phone') {
        if (!formData.customerPhone || !formData.duration || !formData.summary) {
          toast({
            title: "Validation Error",
            description: "Customer phone, duration, and summary are required for phone engagements",
            variant: "destructive",
          });
          return;
        }

        await createPhoneEngagement.mutateAsync({
          customerPhone: formData.customerPhone,
          customerName: formData.customerName,
          agentId: currentUser.id,
          agentName: currentUser.name,
          duration: parseInt(formData.duration),
          summary: formData.summary,
          aiSummary: formData.aiSummary,
          notes: formData.notes ? [formData.notes] : [],
        });
      }

      // Reset form
      setFormData({
        customerEmail: '',
        customerPhone: '',
        customerName: '',
        subject: '',
        content: '',
        duration: '',
        summary: '',
        aiSummary: '',
        notes: '',
      });

      onEngagementCreated?.();
    } catch (error) {
      console.error('Failed to create engagement:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isLoading = createEmailEngagement.isPending || createPhoneEngagement.isPending;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {channel === 'email' ? (
            <>
              <Mail className="h-5 w-5" />
              Quick Email Engagement
            </>
          ) : (
            <>
              <Phone className="h-5 w-5" />
              Quick Phone Engagement
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Channel Selection */}
          <div>
            <Label htmlFor="channel">Channel</Label>
            <Select value={channel} onValueChange={(value: 'email' | 'phone') => setChannel(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                </SelectItem>
                <SelectItem value="phone">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Customer Info */}
          <div>
            <Label htmlFor="customerName">Customer Name (Optional)</Label>
            <Input
              id="customerName"
              value={formData.customerName}
              onChange={(e) => handleInputChange('customerName', e.target.value)}
              placeholder="Enter customer name"
            />
          </div>

          {channel === 'email' ? (
            <>
              <div>
                <Label htmlFor="customerEmail">Customer Email *</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                  placeholder="customer@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="Email subject"
                  required
                />
              </div>
              <div>
                <Label htmlFor="content">Email Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Email content..."
                  rows={4}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <Label htmlFor="customerPhone">Customer Phone *</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>
              <div>
                <Label htmlFor="duration">Call Duration (minutes) *</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  placeholder="15"
                  min="1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="summary">Call Summary *</Label>
                <Textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => handleInputChange('summary', e.target.value)}
                  placeholder="Brief summary of the call..."
                  rows={3}
                  required
                />
              </div>
            </>
          )}

          {/* AI Summary */}
          <div>
            <Label htmlFor="aiSummary">AI Summary</Label>
            <Textarea
              id="aiSummary"
              value={formData.aiSummary}
              onChange={(e) => handleInputChange('aiSummary', e.target.value)}
              placeholder="AI-generated summary..."
              rows={2}
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Initial Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Add any initial notes..."
              rows={2}
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Creating...' : `Create ${channel === 'email' ? 'Email' : 'Phone'} Engagement`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}