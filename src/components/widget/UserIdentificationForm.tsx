/**
 * User identification form for the chat widget
 * Supports both manual form submission and Moodle authentication
 */

import React, { useState } from 'react';
import { AlertCircle, User, Mail, Phone, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { MoodleLoginButton } from './MoodleLoginButton';
import { WidgetSettings } from '@/hooks/useWidgetSettings';
import { IdentificationFormData, IdentificationValidationResult, IdentificationSession } from '@/types/user-identification';

interface UserIdentificationFormProps {
  settings: WidgetSettings;
  formData: IdentificationFormData;
  validationResult: IdentificationValidationResult | null;
  onUpdateFormData: (field: keyof IdentificationFormData, value: string) => void;
  onSubmit: () => Promise<boolean>;
  onMoodleAuth?: (session: IdentificationSession) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  appearance: {
    primaryColor: string;
    textColor: string;
  };
  getIdentificationMethodPriority: () => { methods: string[]; prioritizeMoodle: boolean };
}

export function UserIdentificationForm({
  settings,
  formData,
  validationResult,
  onUpdateFormData,
  onSubmit,
  onMoodleAuth,
  onCancel,
  isSubmitting,
  appearance,
  getIdentificationMethodPriority
}: UserIdentificationFormProps) {
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingLocal || isSubmitting) return;

    setIsSubmittingLocal(true);
    try {
      const success = await onSubmit();
      // Always reset the local submitting state
      setIsSubmittingLocal(false);
    } catch (error) {
      console.error('Form submission error:', error);
      setIsSubmittingLocal(false);
    }
  };

  const { methods, prioritizeMoodle } = getIdentificationMethodPriority();
  
  const showMoodleAuth = settings.userInfo?.enableMoodleAuth && 
    settings.integrations?.moodle?.enabled && 
    methods.includes('moodle_authentication');

  const showManualForm = settings.userInfo?.enableManualForm !== false && 
    methods.includes('manual_form_submission');

  return (
    <div className="p-3 bg-white border-t border-gray-200">
      <div className="space-y-3">
        <div className="text-center">
          <h3 className="text-sm font-medium text-gray-900">Identify Yourself</h3>
          <p className="text-xs text-gray-500 mt-1">
            {settings.userInfo?.customWelcomeMessage || 
             "Please provide your information to continue."}
          </p>
          {prioritizeMoodle && showMoodleAuth && (
            <p className="text-xs text-blue-600 mt-1">
              Moodle authentication is prioritized for this chat.
            </p>
          )}
        </div>

        {/* Moodle Authentication */}
        {showMoodleAuth && settings.integrations.moodle && (
          <div className="space-y-2">
            <span className="text-xs font-medium text-gray-700">Moodle Login</span>
            <MoodleLoginButton
              config={settings.integrations.moodle}
              onAuthSuccess={onMoodleAuth || (() => {})}
              onAuthError={(error) => console.error('Moodle auth error:', error)}
              appearance={appearance}
              disabled={isSubmitting}
            />
          </div>
        )}

        {/* Separator if both methods are available */}
        {showMoodleAuth && showManualForm && (
          <div className="flex items-center gap-2">
            <Separator className="flex-1" />
            <span className="text-xs text-gray-400">OR</span>
            <Separator className="flex-1" />
          </div>
        )}

        {/* Manual Form */}
        {showManualForm && (
          <div className="space-y-2">
            {showMoodleAuth && (
              <span className="text-xs font-medium text-gray-700">Manual Entry</span>
            )}

            <form onSubmit={handleSubmit} className="space-y-2">
              {/* Name field */}
              {settings.userInfo.requiredFields.name && (
                <div>
                  <Label htmlFor="name" className="text-xs font-medium text-gray-700">
                    Name {settings.userInfo.requiredFields.name && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => onUpdateFormData('name', e.target.value)}
                    placeholder="Enter your name"
                    className={`text-sm ${validationResult?.errors.name ? 'border-red-500' : ''}`}
                    disabled={isSubmittingLocal}
                  />
                  {validationResult?.errors.name && (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 text-red-500" />
                      <span className="text-xs text-red-500">{validationResult.errors.name}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Email field */}
              {settings.userInfo.requiredFields.email && (
                <div>
                  <Label htmlFor="email" className="text-xs font-medium text-gray-700">
                    Email {settings.userInfo.requiredFields.email && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => onUpdateFormData('email', e.target.value)}
                    placeholder="Enter your email"
                    className={`text-sm ${validationResult?.errors.email ? 'border-red-500' : ''}`}
                    disabled={isSubmittingLocal}
                  />
                  {validationResult?.errors.email && (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 text-red-500" />
                      <span className="text-xs text-red-500">{validationResult.errors.email}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile field */}
              {settings.userInfo.requiredFields.mobile && (
                <div>
                  <Label htmlFor="mobile" className="text-xs font-medium text-gray-700">
                    Phone {settings.userInfo.requiredFields.mobile && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    id="mobile"
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => onUpdateFormData('mobile', e.target.value)}
                    placeholder="Enter your phone number"
                    className={`text-sm ${validationResult?.errors.mobile ? 'border-red-500' : ''}`}
                    disabled={isSubmittingLocal}
                  />
                  {validationResult?.errors.mobile && (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 text-red-500" />
                      <span className="text-xs text-red-500">{validationResult.errors.mobile}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmittingLocal}
                  className="flex-1 text-sm"
                  size="sm"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingLocal}
                  className="flex-1 text-sm"
                  size="sm"
                  style={{
                    backgroundColor: appearance.primaryColor,
                    color: appearance.textColor,
                    borderColor: appearance.primaryColor
                  }}
                >
                  {isSubmittingLocal ? 'Submitting...' : 'Continue'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}