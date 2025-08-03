/**
 * Moodle Configuration Settings Page
 * Allows administrators to configure Moodle integration settings
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, ExternalLink, TestTube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MoodleAuthService } from '@/services/moodleAuthService';
import { useWidgetSettings } from '@/hooks/useWidgetSettings';

export function MoodleConfiguration() {
  const { settings, updateSettings, saveSettings, saving } = useWidgetSettings();
  const { toast } = useToast();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!settings) {
    return <div>Loading...</div>;
  }

  const moodleConfig = settings.userInfo.moodleConfig || {
    moodleUrl: '',
    apiToken: '',
    enabled: false,
    autoLogin: true,
    requiredFields: {
      studentId: true,
      department: false
    }
  };

  const handleMoodleConfigChange = (field: string, value: any) => {
    updateSettings('userInfo', {
      ...settings.userInfo,
      moodleConfig: {
        ...moodleConfig,
        [field]: value
      }
    });
  };

  const handleRequiredFieldChange = (field: string, value: boolean) => {
    updateSettings('userInfo', {
      ...settings.userInfo,
      moodleConfig: {
        ...moodleConfig,
        requiredFields: {
          ...moodleConfig.requiredFields,
          [field]: value
        }
      }
    });
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      // Validate configuration first
      const errors = MoodleAuthService.validateConfig(moodleConfig);
      
      if (errors.length > 0) {
        setTestResult({
          success: false,
          message: errors.join(', ')
        });
        return;
      }

      // Test the connection
      const result = await MoodleAuthService.authenticateWithMoodle(moodleConfig);
      
      if (result.success) {
        setTestResult({
          success: true,
          message: 'Connection successful! Moodle integration is properly configured.'
        });
      } else {
        setTestResult({
          success: false,
          message: result.error || 'Connection failed'
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Test failed'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    const success = await saveSettings(settings);
    if (success) {
      toast({
        title: "Success",
        description: "Moodle configuration saved successfully",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Moodle Integration Settings
          </CardTitle>
          <CardDescription>
            Configure integration with your Moodle LMS for seamless user authentication.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable Moodle Integration */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Enable Moodle Integration</Label>
              <p className="text-sm text-muted-foreground">
                Allow users to authenticate using their Moodle credentials
              </p>
            </div>
            <Switch
              checked={moodleConfig.enabled}
              onCheckedChange={(checked) => handleMoodleConfigChange('enabled', checked)}
            />
          </div>

          {/* Moodle URL */}
          <div className="space-y-2">
            <Label htmlFor="moodle-url">Moodle Site URL</Label>
            <Input
              id="moodle-url"
              placeholder="https://your-moodle-site.edu"
              value={moodleConfig.moodleUrl}
              onChange={(e) => handleMoodleConfigChange('moodleUrl', e.target.value)}
              disabled={!moodleConfig.enabled}
            />
            <p className="text-sm text-muted-foreground">
              The base URL of your Moodle installation
            </p>
          </div>

          {/* API Token */}
          <div className="space-y-2">
            <Label htmlFor="api-token">Moodle Web Service Token</Label>
            <Input
              id="api-token"
              type="password"
              placeholder="Enter your Moodle web service token"
              value={moodleConfig.apiToken}
              onChange={(e) => handleMoodleConfigChange('apiToken', e.target.value)}
              disabled={!moodleConfig.enabled}
            />
            <p className="text-sm text-muted-foreground">
              Token with access to core_webservice_get_site_info and core_user_get_users_by_field functions
            </p>
          </div>

          {/* Auto Login */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Auto Login</Label>
              <p className="text-sm text-muted-foreground">
                Automatically attempt Moodle login when widget loads in Moodle context
              </p>
            </div>
            <Switch
              checked={moodleConfig.autoLogin}
              onCheckedChange={(checked) => handleMoodleConfigChange('autoLogin', checked)}
              disabled={!moodleConfig.enabled}
            />
          </div>

          {/* Required Fields */}
          <div className="space-y-4">
            <Label className="text-base">Required User Information</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Student ID</Label>
                  <p className="text-sm text-muted-foreground">Require student ID from Moodle</p>
                </div>
                <Switch
                  checked={moodleConfig.requiredFields.studentId}
                  onCheckedChange={(checked) => handleRequiredFieldChange('studentId', checked)}
                  disabled={!moodleConfig.enabled}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Department</Label>
                  <p className="text-sm text-muted-foreground">Require department information</p>
                </div>
                <Switch
                  checked={moodleConfig.requiredFields.department}
                  onCheckedChange={(checked) => handleRequiredFieldChange('department', checked)}
                  disabled={!moodleConfig.enabled}
                />
              </div>
            </div>
          </div>

          {/* Test Connection */}
          <div className="space-y-4">
            <Button
              onClick={handleTestConnection}
              disabled={!moodleConfig.enabled || testing || !moodleConfig.moodleUrl || !moodleConfig.apiToken}
              variant="outline"
              className="w-full"
            >
              <TestTube className="h-4 w-4 mr-2" />
              {testing ? 'Testing Connection...' : 'Test Moodle Connection'}
            </Button>

            {testResult && (
              <Alert variant={testResult.success ? 'default' : 'destructive'}>
                {testResult.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  {testResult.message}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
          <CardDescription>
            Follow these steps to set up Moodle integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <h4 className="font-medium">Enable Web Services in Moodle</h4>
                <p className="text-sm text-muted-foreground">
                  Go to Site administration → Advanced features → Enable web services
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <h4 className="font-medium">Create External Service</h4>
                <p className="text-sm text-muted-foreground">
                  Add required functions: core_webservice_get_site_info, core_user_get_users_by_field
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <h4 className="font-medium">Generate Token</h4>
                <p className="text-sm text-muted-foreground">
                  Create a web service token for the service and copy it above
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                4
              </div>
              <div>
                <h4 className="font-medium">Test Configuration</h4>
                <p className="text-sm text-muted-foreground">
                  Use the test button above to verify the connection works
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}