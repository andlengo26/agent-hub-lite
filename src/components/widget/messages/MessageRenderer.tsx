import { MessageFeedback } from "@/components/widget/MessageFeedback";
import { IdentificationMessage } from "./IdentificationMessage";
import { Message } from "@/types/message";
import { IdentificationFormData, IdentificationValidationResult, IdentificationSession } from "@/types/user-identification";
import { WidgetSettings } from "@/hooks/useWidgetSettings";
import { Bot, User } from "lucide-react";

interface MessageRendererProps {
  message: Message;
  appearance: {
    primaryColor: string;
    secondaryColor: string;
    highlightColor: string;
  };
  aiSettings: {
    assistantName: string;
    enableFeedback?: boolean;
  };
  conversationStatus: string;
  onFeedback: (messageId: string, feedback: 'positive' | 'negative', comment?: string) => void;
  // Identification props (only needed for identification messages)
  settings?: WidgetSettings;
  formData?: IdentificationFormData;
  validationResult?: IdentificationValidationResult | null;
  onUpdateFormData?: (field: keyof IdentificationFormData, value: string) => void;
  onSubmitIdentification?: () => Promise<boolean>;
  onMoodleAuth?: (session: IdentificationSession) => void;
  isSubmittingIdentification?: boolean;
  getIdentificationMethodPriority?: () => 'moodle' | 'manual';
}

export function MessageRenderer({
  message,
  appearance,
  aiSettings,
  conversationStatus,
  onFeedback,
  settings,
  formData,
  validationResult,
  onUpdateFormData,
  onSubmitIdentification,
  onMoodleAuth,
  isSubmittingIdentification,
  getIdentificationMethodPriority
}: MessageRendererProps) {
  if (message.type === 'identification') {
    if (!settings || !formData || !onUpdateFormData || !onSubmitIdentification || !onMoodleAuth || !getIdentificationMethodPriority) {
      return null;
    }

    return (
      <div className="flex justify-start">
        <div className="max-w-[80%]">
          <div className="flex items-center space-x-2 mb-2">
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
              style={{ backgroundColor: appearance.secondaryColor }}
            >
              AI
            </div>
            <span className="text-xs text-muted-foreground">{aiSettings.assistantName}</span>
          </div>
          
          <IdentificationMessage
            settings={settings}
            formData={formData}
            validationResult={validationResult}
            onUpdateFormData={onUpdateFormData}
            onSubmit={onSubmitIdentification}
            onMoodleAuth={onMoodleAuth}
            isSubmitting={isSubmittingIdentification || false}
            appearance={{
              primaryColor: appearance.primaryColor,
              textColor: '#FFFFFF'
            }}
            getIdentificationMethodPriority={getIdentificationMethodPriority}
          />
          
          <div className="text-xs text-muted-foreground mt-2">
            {message.timestamp.toLocaleTimeString()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] ${message.type === 'user' ? 'order-1' : 'order-2'}`}>
        {message.type === 'ai' && (
          <div className="flex items-center space-x-2 mb-1">
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
              style={{ backgroundColor: appearance.secondaryColor }}
            >
              AI
            </div>
            <span className="text-xs text-muted-foreground">{aiSettings.assistantName}</span>
          </div>
        )}
        <div 
          className={`rounded-lg px-3 py-2 text-sm ${
            message.type === 'user' 
              ? `text-white ml-auto ${message.isPending ? 'opacity-70 border border-dashed border-white/50' : ''}` 
              : 'bg-muted'
          }`}
          style={message.type === 'user' ? { backgroundColor: appearance.primaryColor } : {}}
        >
          {message.type === 'user' && message.isPending && (
            <div className="text-xs opacity-70 mb-1">
              Pending identification...
            </div>
          )}
          {message.type === 'ai' ? message.content : (message.type === 'user' ? message.content : '')}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {message.timestamp.toLocaleTimeString()}
        </div>
        
        {/* Feedback buttons for AI messages */}
        {message.type === 'ai' && !message.id.includes('welcome') && aiSettings.enableFeedback && !message.feedbackSubmitted && (
          <MessageFeedback
            messageId={message.id}
            onFeedback={onFeedback}
            appearance={appearance}
            disabled={conversationStatus !== 'active'}
          />
        )}
      </div>
    </div>
  );
}