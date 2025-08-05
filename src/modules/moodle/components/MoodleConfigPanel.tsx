/**
 * Consolidated Moodle Configuration Panel
 * Replaces the scattered configuration components
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, ExternalLink, TestTube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MoodleConfigService } from '../services/MoodleConfigService';
import { MoodleConfig } from '../types';

interface MoodleConfigPanelProps {
  config: MoodleConfig;
  onConfigChange: (config: MoodleConfig) => void;
  onSave?: () => void;
  saving?: boolean;
}

export function MoodleConfigPanel({
  config,
  onConfigChange,
  onSave,
  saving = false
}: MoodleConfigPanelProps) {
  const { toast } = useToast();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleConfigChange = (field: keyof MoodleConfig, value: any) => {
    const updatedConfig = { ...config, [field]: value };
    onConfigChange(MoodleConfigService.sanitizeConfig(updatedConfig));
  };

  const handleRequiredFieldChange = (field: string, value: boolean) => {
    const updatedConfig = {
      ...config,
      requiredFields: {
        ...config.requiredFields,
        [field]: value
      }
    };
    onConfigChange(updatedConfig);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const result = await MoodleConfigService.testConfig(config);
      setTestResult(result);
      
      if (result.success) {
        toast({
          title: "Connection Test Successful",
          description: "Moodle integration is properly configured",
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

  const setupInstructions = MoodleConfigService.getSetupInstructions();

  return (
    <div className="space-y-6">
      {/* Main Configuration */}
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
              checked={config.enabled}
              onCheckedChange={(checked) => handleConfigChange('enabled', checked)}
            />
          </div>

          {/* Moodle URL */}
          <div className="space-y-2">
            <Label htmlFor="moodle-url">Moodle Site URL</Label>
            <Input
              id="moodle-url"
              placeholder="https://your-moodle-site.edu"
              value={config.moodleUrl}
              onChange={(e) => handleConfigChange('moodleUrl', e.target.value)}
              disabled={!config.enabled}
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
              value={config.apiToken}
              onChange={(e) => handleConfigChange('apiToken', e.target.value)}
              disabled={!config.enabled}
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
              checked={config.autoLogin}
              onCheckedChange={(checked) => handleConfigChange('autoLogin', checked)}
              disabled={!config.enabled}
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
                  checked={config.requiredFields.studentId}
                  onCheckedChange={(checked) => handleRequiredFieldChange('studentId', checked)}
                  disabled={!config.enabled}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Department</Label>
                  <p className="text-sm text-muted-foreground">Require department information</p>
                </div>
                <Switch
                  checked={config.requiredFields.department}
                  onCheckedChange={(checked) => handleRequiredFieldChange('department', checked)}
                  disabled={!config.enabled}
                />
              </div>
            </div>
          </div>

          {/* Test Connection */}
          <div className="space-y-4">
            <Button
              onClick={handleTestConnection}
              disabled={!config.enabled || testing || !config.moodleUrl || !config.apiToken}
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
          {onSave && (
            <div className="flex justify-end">
              <Button onClick={onSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Configuration'}
              </Button>
            </div>
          )}
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
            {setupInstructions.map((instruction) => (
              <div key={instruction.step} className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  {instruction.step}
                </div>
                <div>
                  <h4 className="font-medium">{instruction.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {instruction.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}