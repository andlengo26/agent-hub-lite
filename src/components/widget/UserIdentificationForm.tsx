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
      if (!success) {
        setIsSubmittingLocal(false);
      }
    } catch (error) {
      setIsSubmittingLocal(false);
    }
  };

  const { methods, prioritizeMoodle } = getIdentificationMethodPriority();
  
  const showMoodleAuth = settings.userInfo?.enableMoodleAuth && 
    settings.userInfo?.moodleConfig?.enabled && 
    methods.includes('moodle_authentication');

  const showManualForm = settings.userInfo?.enableManualForm !== false && 
    methods.includes('manual_form_submission');

  return (
    <div className="p-4 bg-white border-t border-gray-200">
      <div className="space-y-4">
        <div className="text-center">
          <User className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <h3 className="font-medium text-gray-900">Identify Yourself</h3>
          <p className="text-sm text-gray-500 mt-1">
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
        {showMoodleAuth && settings.userInfo.moodleConfig && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Moodle Login</span>
            </div>
            <MoodleLoginButton
              config={settings.userInfo.moodleConfig}
              onAuthSuccess={onMoodleAuth || (() => {})}
              onAuthError={(error) => console.error('Moodle auth error:', error)}
              appearance={appearance}
              disabled={isSubmitting}
            />
          </div>
        )}

        {/* Separator if both methods are available */}
        {showMoodleAuth && showManualForm && (
          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-gray-400 uppercase tracking-wide">OR</span>
            <Separator className="flex-1" />
          </div>
        )}

        {/* Manual Form */}
        {showManualForm && (
          <div className="space-y-3">
            {showMoodleAuth && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Manual Entry</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Name field */}
              {settings.userInfo.requiredFields.name && (
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Name {settings.userInfo.requiredFields.name && <span className="text-red-500">*</span>}
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => onUpdateFormData('name', e.target.value)}
                      placeholder="Enter your name"
                      className={validationResult?.errors.name ? 'border-red-500' : ''}
                      disabled={isSubmittingLocal}
                    />
                    <User className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
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
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email {settings.userInfo.requiredFields.email && <span className="text-red-500">*</span>}
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => onUpdateFormData('email', e.target.value)}
                      placeholder="Enter your email"
                      className={validationResult?.errors.email ? 'border-red-500' : ''}
                      disabled={isSubmittingLocal}
                    />
                    <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
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
                  <Label htmlFor="mobile" className="text-sm font-medium text-gray-700">
                    Phone {settings.userInfo.requiredFields.mobile && <span className="text-red-500">*</span>}
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="mobile"
                      type="tel"
                      value={formData.mobile}
                      onChange={(e) => onUpdateFormData('mobile', e.target.value)}
                      placeholder="Enter your phone number"
                      className={validationResult?.errors.mobile ? 'border-red-500' : ''}
                      disabled={isSubmittingLocal}
                    />
                    <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  {validationResult?.errors.mobile && (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 text-red-500" />
                      <span className="text-xs text-red-500">{validationResult.errors.mobile}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmittingLocal}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingLocal}
                  className="flex-1"
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