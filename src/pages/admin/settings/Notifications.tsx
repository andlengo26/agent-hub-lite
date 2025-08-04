import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  Bell, 
  Volume2, 
  VolumeX, 
  Mail, 
  Monitor, 
  Clock,
  Settings,
  MessageCircle,
  UserPlus,
  AlertTriangle,
  TrendingUp,
  Info
} from "lucide-react";
import { toast } from "@/hooks/use-toast";


interface NotificationSettings {
  newChat: { enabled: boolean; sound: boolean; desktop: boolean; email: boolean };
  chatMessage: { enabled: boolean; sound: boolean; desktop: boolean; email: boolean };
  chatAssignment: { enabled: boolean; sound: boolean; desktop: boolean; email: boolean };
  escalation: { enabled: boolean; sound: boolean; desktop: boolean; email: boolean };
  quotaAlert: { enabled: boolean; sound: boolean; desktop: boolean; email: boolean };
  systemAlert: { enabled: boolean; sound: boolean; desktop: boolean; email: boolean };
}

interface AvailabilitySettings {
  maxConcurrentChats: number;
  workingHours: {
    enabled: boolean;
    timezone: string;
    schedule: {
      [key: string]: { start: string; end: string; enabled: boolean };
    };
  };
  autoAway: {
    enabled: boolean;
    idleTimeMinutes: number;
    awayMessage: string;
  };
}

export default function UserPreferences() {
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    newChat: { enabled: true, sound: true, desktop: true, email: false },
    chatMessage: { enabled: true, sound: true, desktop: true, email: false },
    chatAssignment: { enabled: true, sound: true, desktop: true, email: true },
    escalation: { enabled: true, sound: true, desktop: true, email: true },
    quotaAlert: { enabled: true, sound: false, desktop: true, email: true },
    systemAlert: { enabled: true, sound: true, desktop: true, email: true }
  });

  const [availabilitySettings, setAvailabilitySettings] = useState<AvailabilitySettings>({
    maxConcurrentChats: 3,
    workingHours: {
      enabled: true,
      timezone: 'UTC',
      schedule: {
        monday: { start: '09:00', end: '17:00', enabled: true },
        tuesday: { start: '09:00', end: '17:00', enabled: true },
        wednesday: { start: '09:00', end: '17:00', enabled: true },
        thursday: { start: '09:00', end: '17:00', enabled: true },
        friday: { start: '09:00', end: '17:00', enabled: true },
        saturday: { start: '10:00', end: '14:00', enabled: false },
        sunday: { start: '10:00', end: '14:00', enabled: false }
      }
    },
    autoAway: {
      enabled: true,
      idleTimeMinutes: 10,
      awayMessage: "I'm currently away from my desk. I'll respond as soon as I'm back."
    }
  });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationSound, setNotificationSound] = useState('chime');

  const notificationTypes = [
    {
      key: 'newChat' as keyof NotificationSettings,
      label: 'New Chat Assignment',
      description: 'When you are assigned a new chat',
      icon: UserPlus,
      priority: 'high'
    },
    {
      key: 'chatMessage' as keyof NotificationSettings,
      label: 'New Chat Messages',
      description: 'When customers send new messages',
      icon: MessageCircle,
      priority: 'normal'
    },
    {
      key: 'chatAssignment' as keyof NotificationSettings,
      label: 'Chat Reassignment',
      description: 'When chats are transferred to you',
      icon: UserPlus,
      priority: 'high'
    },
    {
      key: 'escalation' as keyof NotificationSettings,
      label: 'Chat Escalations',
      description: 'When chats are escalated',
      icon: AlertTriangle,
      priority: 'urgent'
    },
    {
      key: 'quotaAlert' as keyof NotificationSettings,
      label: 'Quota Alerts',
      description: 'Daily/monthly quota warnings',
      icon: TrendingUp,
      priority: 'normal'
    },
    {
      key: 'systemAlert' as keyof NotificationSettings,
      label: 'System Alerts',
      description: 'System maintenance and updates',
      icon: Info,
      priority: 'low'
    }
  ];

  const handleNotificationToggle = (
    type: keyof NotificationSettings,
    channel: 'enabled' | 'sound' | 'desktop' | 'email',
    value: boolean
  ) => {
    setNotificationSettings(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [channel]: value
      }
    }));
  };

  const handleSaveSettings = () => {
    toast({
      title: 'Settings Saved',
      description: 'Your notification preferences have been updated.'
    });
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive" className="text-xs">Urgent</Badge>;
      case 'high':
        return <Badge variant="secondary" className="text-xs">High</Badge>;
      case 'normal':
        return <Badge variant="outline" className="text-xs">Normal</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-xs opacity-60">Low</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Agent User Preferences</h1>
        <p className="text-muted-foreground">
          Configure your notification preferences and availability settings
        </p>
      </div>

      {/* Global Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Global Notification Settings
          </CardTitle>
          <CardDescription>
            Control how and when you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                Sound Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Play sounds for new notifications
              </p>
            </div>
            <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
          </div>

          {soundEnabled && (
            <div className="ml-6 space-y-2">
              <Label htmlFor="notification-sound">Notification Sound</Label>
              <div className="flex items-center gap-2">
                <Select 
                  value={notificationSound} 
                  onValueChange={(value) => {
                    setNotificationSound(value);
                    // Auto-play the selected sound
                    toast({
                      title: "Sound Preview",
                      description: `Playing ${value} sound...`
                    });
                  }}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chime">Chime</SelectItem>
                    <SelectItem value="bell">Bell</SelectItem>
                    <SelectItem value="ding">Ding</SelectItem>
                    <SelectItem value="ping">Ping</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Manual sound preview
                    toast({
                      title: "Sound Preview",
                      description: `Playing ${notificationSound} sound...`
                    });
                  }}
                >
                  <Volume2 className="h-4 w-4 mr-1" />
                  Preview
                </Button>
              </div>
            </div>
          )}

          <Separator />

          <div className="space-y-4">
            <Label className="text-base font-medium">Notification Channels</Label>
            {notificationTypes.map((type) => {
              const IconComponent = type.icon;
              const settings = notificationSettings[type.key];
              
              return (
                <div key={type.key} className="space-y-3 p-space-4 bg-muted/20 rounded-radius-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-5 h-5 text-primary" />
                      <div>
                        <div className="flex items-center gap-2">
                          <Label className="font-medium">{type.label}</Label>
                          {getPriorityBadge(type.priority)}
                        </div>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.enabled} 
                      onCheckedChange={(checked) => handleNotificationToggle(type.key, 'enabled', checked)}
                    />
                  </div>

                  {settings.enabled && (
                    <div className="grid grid-cols-3 gap-4 ml-8">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-muted-foreground" />
                        <Label className="text-sm">Sound</Label>
                        <Switch 
                          checked={settings.sound && soundEnabled} 
                          disabled={!soundEnabled}
                          onCheckedChange={(checked) => handleNotificationToggle(type.key, 'sound', checked)}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-muted-foreground" />
                        <Label className="text-sm">Desktop</Label>
                        <Switch 
                          checked={settings.desktop} 
                          onCheckedChange={(checked) => handleNotificationToggle(type.key, 'desktop', checked)}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <Label className="text-sm">Email</Label>
                        <Switch 
                          checked={settings.email} 
                          onCheckedChange={(checked) => handleNotificationToggle(type.key, 'email', checked)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Availability Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Availability Settings
          </CardTitle>
          <CardDescription>
            Configure your working hours and chat capacity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="max-chats">Maximum Concurrent Chats</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  id="max-chats"
                  type="number"
                  min="1"
                  max="10"
                  value={availabilitySettings.maxConcurrentChats}
                  onChange={(e) => setAvailabilitySettings(prev => ({
                    ...prev,
                    maxConcurrentChats: parseInt(e.target.value) || 1
                  }))}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">chats at once</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Working Hours</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically set availability based on your schedule
                  </p>
                </div>
                <Switch 
                  checked={availabilitySettings.workingHours.enabled}
                  onCheckedChange={(checked) => setAvailabilitySettings(prev => ({
                    ...prev,
                    workingHours: { ...prev.workingHours, enabled: checked }
                  }))}
                />
              </div>

              {availabilitySettings.workingHours.enabled && (
                <div className="ml-6 space-y-3 p-space-4 bg-muted/20 rounded-radius-md">
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select 
                      value={availabilitySettings.workingHours.timezone} 
                      onValueChange={(value) => setAvailabilitySettings(prev => ({
                        ...prev,
                        workingHours: { ...prev.workingHours, timezone: value }
                      }))}
                    >
                      <SelectTrigger className="w-48 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="Europe/London">GMT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Weekly Schedule</Label>
                    <div className="text-xs text-muted-foreground mb-3">
                      Set your available hours for each day of the week
                    </div>
                    {Object.entries(availabilitySettings.workingHours.schedule).map(([day, schedule]) => (
                      <div key={day} className="flex items-center gap-4 text-sm">
                        <div className="w-20 capitalize font-medium">{day}</div>
                        <Switch 
                          checked={schedule.enabled}
                          onCheckedChange={(checked) => setAvailabilitySettings(prev => ({
                            ...prev,
                            workingHours: {
                              ...prev.workingHours,
                              schedule: {
                                ...prev.workingHours.schedule,
                                [day]: { ...schedule, enabled: checked }
                              }
                            }
                          }))}
                        />
                        {schedule.enabled && (
                          <>
                            <Input
                              type="time"
                              value={schedule.start}
                              onChange={(e) => setAvailabilitySettings(prev => ({
                                ...prev,
                                workingHours: {
                                  ...prev.workingHours,
                                  schedule: {
                                    ...prev.workingHours.schedule,
                                    [day]: { ...schedule, start: e.target.value }
                                  }
                                }
                              }))}
                              className="w-28"
                            />
                            <span className="text-muted-foreground">to</span>
                            <Input
                              type="time"
                              value={schedule.end}
                              onChange={(e) => setAvailabilitySettings(prev => ({
                                ...prev,
                                workingHours: {
                                  ...prev.workingHours,
                                  schedule: {
                                    ...prev.workingHours.schedule,
                                    [day]: { ...schedule, end: e.target.value }
                                  }
                                }
                              }))}
                              className="w-28"
                            />
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Auto-Away</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically set status to away after period of inactivity
                  </p>
                </div>
                <Switch 
                  checked={availabilitySettings.autoAway.enabled}
                  onCheckedChange={(checked) => setAvailabilitySettings(prev => ({
                    ...prev,
                    autoAway: { ...prev.autoAway, enabled: checked }
                  }))}
                />
              </div>

              {availabilitySettings.autoAway.enabled && (
                <div className="ml-6 space-y-3 p-space-4 bg-muted/20 rounded-radius-md">
                  <div>
                    <Label htmlFor="idle-time">Idle Time (minutes)</Label>
                    <Input
                      id="idle-time"
                      type="number"
                      min="1"
                      max="60"
                      value={availabilitySettings.autoAway.idleTimeMinutes}
                      onChange={(e) => setAvailabilitySettings(prev => ({
                        ...prev,
                        autoAway: { ...prev.autoAway, idleTimeMinutes: parseInt(e.target.value) || 5 }
                      }))}
                      className="w-20 mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="away-message">Away Message</Label>
                    <Input
                      id="away-message"
                      value={availabilitySettings.autoAway.awayMessage}
                      onChange={(e) => setAvailabilitySettings(prev => ({
                        ...prev,
                        autoAway: { ...prev.autoAway, awayMessage: e.target.value }
                      }))}
                      className="mt-1"
                      placeholder="Enter your away message..."
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} className="gap-2">
          <Settings className="w-4 h-4" />
          Save All Settings
        </Button>
      </div>
    </div>
  );
}