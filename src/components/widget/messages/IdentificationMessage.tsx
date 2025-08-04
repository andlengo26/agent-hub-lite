import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoodleLoginButton } from "@/components/widget/MoodleLoginButton";
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit();
  };

  const priority = getIdentificationMethodPriority();
  const showMoodle = settings.userInfo.enableMoodleAuth && settings.integrations.moodle?.enabled;
  const showManualForm = settings.userInfo.enableManualForm;
  const showBoth = showMoodle && showManualForm;

  return (
    <div className="bg-muted rounded-lg p-4 max-w-sm">
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Please provide your details to continue:
        </div>

        {/* Moodle Authentication (if enabled and priority) */}
        {showMoodle && priority === 'moodle' && (
          <div className="space-y-3">
            <MoodleLoginButton
              config={settings.integrations.moodle!}
              onAuthSuccess={onMoodleAuth}
              onAuthError={(error) => console.error('Moodle auth error:', error)}
              appearance={appearance}
            />
            {showBoth && (
              <div className="text-center text-xs text-muted-foreground">
                or
              </div>
            )}
          </div>
        )}

        {/* Manual Form */}
        {showManualForm && (
          <form onSubmit={handleSubmit} className="space-y-3">
            {settings.userInfo.requiredFields.name && (
              <div className="space-y-1">
                <Label htmlFor="name" className="text-xs">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => onUpdateFormData('name', e.target.value)}
                  disabled={isSubmitting}
                  className="text-sm h-8"
                />
                {validationResult?.errors.name && (
                  <p className="text-xs text-destructive">{validationResult.errors.name}</p>
                )}
              </div>
            )}

            {settings.userInfo.requiredFields.email && (
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => onUpdateFormData('email', e.target.value)}
                  disabled={isSubmitting}
                  className="text-sm h-8"
                />
                {validationResult?.errors.email && (
                  <p className="text-xs text-destructive">{validationResult.errors.email}</p>
                )}
              </div>
            )}

            {settings.userInfo.requiredFields.mobile && (
              <div className="space-y-1">
                <Label htmlFor="mobile" className="text-xs">Mobile</Label>
                <Input
                  id="mobile"
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => onUpdateFormData('mobile', e.target.value)}
                  disabled={isSubmitting}
                  className="text-sm h-8"
                />
                {validationResult?.errors.mobile && (
                  <p className="text-xs text-destructive">{validationResult.errors.mobile}</p>
                )}
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full text-sm h-8"
              style={{ 
                backgroundColor: appearance.primaryColor,
                color: appearance.textColor 
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Continue'}
            </Button>
          </form>
        )}

        {/* Moodle Authentication (if enabled but not priority) */}
        {showMoodle && priority !== 'moodle' && showBoth && (
          <div className="space-y-3">
            <div className="text-center text-xs text-muted-foreground">
              or
            </div>
            <MoodleLoginButton
              config={settings.integrations.moodle!}
              onAuthSuccess={onMoodleAuth}
              onAuthError={(error) => console.error('Moodle auth error:', error)}
              appearance={appearance}
            />
          </div>
        )}
      </div>
    </div>
  );
}