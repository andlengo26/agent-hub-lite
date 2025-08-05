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
  return (
    <div className="bg-muted rounded-lg p-4 max-w-sm">
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">
          Please sign in to continue the conversation. You can complete your identification using the form below.
        </div>
        <div className="text-xs text-muted-foreground/80">
          Complete your details in the input area below to proceed.
        </div>
      </div>
    </div>
  );
}