/**
 * Inline user identification form for the chat widget
 * Handles manual form submission with real-time validation
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, User } from 'lucide-react';
import { WidgetSettings } from '@/hooks/useWidgetSettings';
import { IdentificationFormData, IdentificationValidationResult } from '@/types/user-identification';

interface UserIdentificationFormProps {
  settings: WidgetSettings;
  formData: IdentificationFormData;
  validationResult: IdentificationValidationResult | null;
  onUpdateFormData: (field: keyof IdentificationFormData, value: string) => void;
  onSubmit: () => Promise<boolean>;
  onCancel: () => void;
  isSubmitting?: boolean;
  appearance: WidgetSettings['appearance'];
}

export function UserIdentificationForm({
  settings,
  formData,
  validationResult,
  onUpdateFormData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  appearance
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

  const { requiredFields } = settings.userInfo;

  return (
    <div className="border rounded-lg bg-background p-4 mx-4 mb-4 space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center text-white"
          style={{ backgroundColor: appearance.primaryColor }}
        >
          <User className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-medium">Please Identify Yourself</h3>
          <p className="text-xs text-muted-foreground">
            We need some information to provide better assistance
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {requiredFields.name && (
          <div className="space-y-1">
            <Label htmlFor="id-name" className="text-xs font-medium">
              Name *
            </Label>
            <Input
              id="id-name"
              type="text"
              value={formData.name}
              onChange={(e) => onUpdateFormData('name', e.target.value)}
              placeholder="Enter your full name"
              className={`h-8 text-sm ${
                validationResult?.errors.name ? 'border-destructive' : ''
              }`}
              disabled={isSubmittingLocal || isSubmitting}
              autoComplete="name"
            />
            {validationResult?.errors.name && (
              <div className="flex items-center space-x-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                <span>{validationResult.errors.name}</span>
              </div>
            )}
          </div>
        )}

        {requiredFields.email && (
          <div className="space-y-1">
            <Label htmlFor="id-email" className="text-xs font-medium">
              Email *
            </Label>
            <Input
              id="id-email"
              type="email"
              value={formData.email}
              onChange={(e) => onUpdateFormData('email', e.target.value)}
              placeholder="Enter your email address"
              className={`h-8 text-sm ${
                validationResult?.errors.email ? 'border-destructive' : ''
              }`}
              disabled={isSubmittingLocal || isSubmitting}
              autoComplete="email"
            />
            {validationResult?.errors.email && (
              <div className="flex items-center space-x-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                <span>{validationResult.errors.email}</span>
              </div>
            )}
          </div>
        )}

        {requiredFields.mobile && (
          <div className="space-y-1">
            <Label htmlFor="id-mobile" className="text-xs font-medium">
              Phone Number *
            </Label>
            <Input
              id="id-mobile"
              type="tel"
              value={formData.mobile}
              onChange={(e) => onUpdateFormData('mobile', e.target.value)}
              placeholder="Enter your phone number"
              className={`h-8 text-sm ${
                validationResult?.errors.mobile ? 'border-destructive' : ''
              }`}
              disabled={isSubmittingLocal || isSubmitting}
              autoComplete="tel"
            />
            {validationResult?.errors.mobile && (
              <div className="flex items-center space-x-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                <span>{validationResult.errors.mobile}</span>
              </div>
            )}
          </div>
        )}

        {/* Identification Type Indicator */}
        <div className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1">
          <div className="flex items-center space-x-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>Identification Type: Manual Form Submission</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isSubmittingLocal || isSubmitting}
            className="flex-1 text-xs h-8"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmittingLocal || isSubmitting}
            className="flex-1 text-xs h-8"
            style={{ backgroundColor: appearance.primaryColor }}
          >
            {isSubmittingLocal || isSubmitting ? 'Submitting...' : 'Continue'}
          </Button>
        </div>
      </form>

      {/* Privacy Notice */}
      <div className="text-xs text-muted-foreground border-t pt-2">
        <p>
          Your information will be used to provide personalized support and will be stored securely.
        </p>
      </div>
    </div>
  );
}