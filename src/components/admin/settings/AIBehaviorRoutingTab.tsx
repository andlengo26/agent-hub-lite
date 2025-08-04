/**
 * AI Behavior & Routing Settings Tab
 * Controls AI personality, conversation flow, handoff rules, and lifecycle management
 */

import { WidgetSettings } from '@/hooks/useWidgetSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface AIBehaviorRoutingTabProps {
  settings: WidgetSettings;
  updateSettings: (section: keyof WidgetSettings, updates: any) => void;
}

export function AIBehaviorRoutingTab({ settings, updateSettings }: AIBehaviorRoutingTabProps) {
  return (
    <div className="space-y-6">
      {/* AI Personality */}
      <Card>
        <CardHeader>
          <CardTitle>AI Personality</CardTitle>
          <CardDescription>Configure your AI assistant's identity and communication style</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="assistantName">Assistant Name</Label>
            <Input
              id="assistantName"
              value={settings?.aiSettings?.assistantName || ''}
              onChange={(e) => updateSettings('aiSettings', { assistantName: e.target.value })}
              placeholder="AI Assistant"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="welcomeMessage">Welcome Message</Label>
            <Textarea
              id="welcomeMessage"
              value={settings?.aiSettings?.welcomeMessage || ''}
              onChange={(e) => updateSettings('aiSettings', { welcomeMessage: e.target.value })}
              placeholder="Hello! How can I help you today?"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tone">Conversation Tone</Label>
            <Select
              value={settings?.aiSettings?.tone || ''}
              onValueChange={(value) => updateSettings('aiSettings', { tone: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="empathetic">Empathetic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customPrompt">Custom AI Instructions</Label>
            <Textarea
              id="customPrompt"
              value={settings?.aiSettings?.customPrompt || ''}
              onChange={(e) => updateSettings('aiSettings', { customPrompt: e.target.value })}
              placeholder="Additional instructions for the AI assistant..."
              rows={4}
            />
            <p className="text-sm text-muted-foreground">
              Provide specific guidance on how the AI should behave and respond
            </p>
          </div>
        </CardContent>
      </Card>

      {/* AI-First Routing */}
      <Card>
        <CardHeader>
          <CardTitle>AI-First Routing</CardTitle>
          <CardDescription>Configure when and how conversations are escalated to human agents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable AI-First Routing</Label>
              <p className="text-sm text-muted-foreground">AI handles conversations before escalating to humans</p>
            </div>
            <Switch
              checked={settings?.aiSettings?.enableAIFirst || false}
              onCheckedChange={(checked) => 
                updateSettings('aiSettings', { enableAIFirst: checked })
              }
            />
          </div>

          {settings?.aiSettings?.enableAIFirst && (
            <>
              <div className="space-y-2">
                <Label htmlFor="requestWaitingTime">AI Response Time (minutes)</Label>
                <Input
                  id="requestWaitingTime"
                  type="number"
                  min="1"
                  max="60"
                  value={settings?.aiSettings?.requestWaitingTime || 5}
                  onChange={(e) => 
                    updateSettings('aiSettings', { requestWaitingTime: parseInt(e.target.value) })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  How long AI attempts to resolve issues before offering human handoff
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxAIAttempts">Maximum AI Attempts</Label>
                <Input
                  id="maxAIAttempts"
                  type="number"
                  min="1"
                  max="10"
                  value={settings?.aiSettings?.aiHandoffRules?.maxAIAttempts || 3}
                  onChange={(e) => 
                    updateSettings('aiSettings', {
                      aiHandoffRules: {
                        ...settings?.aiSettings?.aiHandoffRules,
                        maxAIAttempts: parseInt(e.target.value)
                      }
                    })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Number of AI responses before suggesting human agent
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="escalateKeywords">Escalation Keywords</Label>
                <Textarea
                  id="escalateKeywords"
                  value={settings?.aiSettings?.aiHandoffRules?.escalateOnKeywords?.join(', ') || ''}
                  onChange={(e) => 
                    updateSettings('aiSettings', {
                      aiHandoffRules: {
                        ...settings?.aiSettings?.aiHandoffRules,
                        escalateOnKeywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
                      }
                    })
                  }
                  placeholder="urgent, complaint, refund, manager"
                  rows={2}
                />
                <p className="text-sm text-muted-foreground">
                  Comma-separated keywords that trigger immediate human escalation
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Human for Complex Issues</Label>
                  <p className="text-sm text-muted-foreground">Automatically escalate when AI detects complexity</p>
                </div>
                <Switch
                  checked={settings?.aiSettings?.aiHandoffRules?.requireHumanForComplex || false}
                  onCheckedChange={(checked) => 
                    updateSettings('aiSettings', {
                      aiHandoffRules: {
                        ...settings?.aiSettings?.aiHandoffRules,
                        requireHumanForComplex: checked
                      }
                    })
                  }
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Conversation Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Conversation Controls</CardTitle>
          <CardDescription>Manage user options for conversation flow and escalation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show "Talk to Human" Button</Label>
              <p className="text-sm text-muted-foreground">Allow users to request human agent at any time</p>
            </div>
            <Switch
              checked={settings?.aiSettings?.showTalkToHumanButton || false}
              onCheckedChange={(checked) => 
                updateSettings('aiSettings', { showTalkToHumanButton: checked })
              }
            />
          </div>

          {settings?.aiSettings?.showTalkToHumanButton && (
            <div className="space-y-2">
              <Label htmlFor="talkToHumanText">Button Text</Label>
              <Input
                id="talkToHumanText"
                value={settings?.aiSettings?.talkToHumanButtonText || ''}
                onChange={(e) => updateSettings('aiSettings', { talkToHumanButtonText: e.target.value })}
                placeholder="Talk to Human Agent"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show "End Conversation" Button</Label>
              <p className="text-sm text-muted-foreground">Allow users to end conversations manually</p>
            </div>
            <Switch
              checked={settings?.aiSettings?.showEndConversationButton || false}
              onCheckedChange={(checked) => 
                updateSettings('aiSettings', { showEndConversationButton: checked })
              }
            />
          </div>

          {settings?.aiSettings?.showEndConversationButton && (
            <div className="space-y-2">
              <Label htmlFor="endConversationText">Button Text</Label>
              <Input
                id="endConversationText"
                value={settings?.aiSettings?.endConversationButtonText || ''}
                onChange={(e) => updateSettings('aiSettings', { endConversationButtonText: e.target.value })}
                placeholder="End Conversation"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feedback Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback Collection</CardTitle>
          <CardDescription>Configure how and when to collect user feedback</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Feedback Collection</Label>
              <p className="text-sm text-muted-foreground">Ask users to rate their experience</p>
            </div>
            <Switch
              checked={settings?.aiSettings?.enableFeedback || false}
              onCheckedChange={(checked) => 
                updateSettings('aiSettings', { enableFeedback: checked })
              }
            />
          </div>

          {settings?.aiSettings?.enableFeedback && (
            <div className="space-y-2">
              <Label htmlFor="feedbackPrompt">Feedback Prompt</Label>
              <Textarea
                id="feedbackPrompt"
                value={settings?.aiSettings?.feedbackPrompt || ''}
                onChange={(e) => updateSettings('aiSettings', { feedbackPrompt: e.target.value })}
                placeholder="How would you rate your experience today?"
                rows={2}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}