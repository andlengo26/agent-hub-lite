/**
 * Typing indicator component for AI responses
 */

import { Bot } from "lucide-react";

interface TypingIndicatorProps {
  appearance?: {
    primaryColor?: string;
    secondaryColor?: string;
    highlightColor?: string;
  };
}

export function TypingIndicator({ appearance }: TypingIndicatorProps) {
  return (
    <div className="flex justify-start">
      <div className="bg-muted text-muted-foreground p-3 rounded-lg max-w-[80%]">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4" />
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}