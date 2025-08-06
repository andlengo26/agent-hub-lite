import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoodleLoginButton } from "@/modules/moodle/components/MoodleLoginButton";
import { IdentificationFormData, IdentificationValidationResult, IdentificationSession } from "@/types/user-identification";
import { WidgetSettings } from "@/hooks/useWidgetSettings";

interface IdentificationMessageProps {
  settings: WidgetSettings;
  formData: IdentificationFormData;
  validationResult: IdentificationValidationResult | null;
  onUpdateFormData: (field: keyof IdentificationFormData, value: string) => void;
  onSubmit: () => Promise<boolean>;
  onMoodleAuth: (session: IdentificationSession) => void;
  isSubmitting: boolean;
  appearance: {
    primaryColor: string;
    textColor: string;
  };
  getIdentificationMethodPriority: () => 'moodle' | 'manual';
}

export function IdentificationMessage({
  settings,
  formData,
  validationResult,
  onUpdateFormData,
  onSubmit,
  onMoodleAuth,
  isSubmitting,
  appearance,
  getIdentificationMethodPriority
}: IdentificationMessageProps) {
  const showMoodle = settings?.userInfo?.enableMoodleAuth && 
                     settings?.integrations?.moodle?.enabled &&
                     getIdentificationMethodPriority() === 'moodle';
  
  const showManual = settings?.userInfo?.enableManualForm;

  return (
    <div className="bg-muted rounded-lg p-4 max-w-sm space-y-4">
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">
          Please complete your identification to continue the conversation.
        </div>
      </div>

      {/* Manual Form */}
      {showManual && (
        <div className="space-y-3">
          {settings.userInfo.requiredFields.name && (
            <div className="space-y-1">
              <Label htmlFor="id-name" className="text-xs">Name</Label>
              <Input
                id="id-name"
                type="text"
                value={formData.name}
                onChange={(e) => onUpdateFormData('name', e.target.value)}
                className="text-sm h-8"
                disabled={isSubmitting}
              />
              {validationResult?.errors.name && (
                <p className="text-xs text-destructive">{validationResult.errors.name}</p>
              )}
            </div>
          )}

          {settings.userInfo.requiredFields.email && (
            <div className="space-y-1">
              <Label htmlFor="id-email" className="text-xs">Email</Label>
              <Input
                id="id-email"
                type="email"
                value={formData.email}
                onChange={(e) => onUpdateFormData('email', e.target.value)}
                className="text-sm h-8"
                disabled={isSubmitting}
              />
              {validationResult?.errors.email && (
                <p className="text-xs text-destructive">{validationResult.errors.email}</p>
              )}
            </div>
          )}

          {settings.userInfo.requiredFields.mobile && (
            <div className="space-y-1">
              <Label htmlFor="id-mobile" className="text-xs">Mobile</Label>
              <Input
                id="id-mobile"
                type="tel"
                value={formData.mobile}
                onChange={(e) => onUpdateFormData('mobile', e.target.value)}
                className="text-sm h-8"
                disabled={isSubmitting}
              />
              {validationResult?.errors.mobile && (
                <p className="text-xs text-destructive">{validationResult.errors.mobile}</p>
              )}
            </div>
          )}

          <Button
            onClick={onSubmit}
            className="w-full text-sm h-8"
            disabled={isSubmitting}
            style={{ 
              backgroundColor: appearance.primaryColor,
              color: appearance.textColor
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Continue'}
          </Button>
        </div>
      )}
    </div>
  );
}