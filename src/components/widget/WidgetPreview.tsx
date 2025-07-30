/**
 * Widget Preview component for live preview of widget appearance
 */

import { useWidgetSettings } from '@/hooks/useWidgetSettings';

interface WidgetPreviewProps {
  className?: string;
}

export function WidgetPreview({ className }: WidgetPreviewProps) {
  const { settings } = useWidgetSettings();

  if (!settings) return null;

  const { appearance, aiSettings } = settings;

  return (
    <div className={className}>
      <div 
        className="max-w-sm mx-auto bg-white rounded-lg shadow-lg border"
        style={{ borderColor: appearance.primaryColor }}
      >
        {/* Widget Header */}
        <div 
          className="px-4 py-3 rounded-t-lg text-white"
          style={{ backgroundColor: appearance.primaryColor }}
        >
          <h3 className="font-medium text-sm">{appearance.headerText}</h3>
          {appearance.subheaderText && (
            <p className="text-xs opacity-90 mt-1">{appearance.subheaderText}</p>
          )}
        </div>
        
        {/* Widget Body */}
        <div className="p-4">
          <div className="flex items-start space-x-3">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
              style={{ backgroundColor: appearance.secondaryColor }}
            >
              AI
            </div>
            <div className="flex-1">
              <div className="bg-gray-100 rounded-lg px-3 py-2">
                <p className="text-sm text-gray-800">{aiSettings.welcomeMessage}</p>
              </div>
            </div>
          </div>
          
          {/* Sample input area */}
          <div className="mt-4">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ 
                  '--tw-ring-color': appearance.primaryColor,
                  focusRingColor: appearance.primaryColor 
                } as any}
                disabled
              />
              <button
                className="px-3 py-2 text-white text-sm rounded-lg"
                style={{ backgroundColor: appearance.highlightColor }}
                disabled
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Minimized Widget Preview */}
      <div className="mt-4 text-center">
        <div className="inline-flex items-center space-x-2">
          <span className="text-sm text-gray-600">Minimized:</span>
          <div 
            className="px-3 py-2 rounded-full text-white text-sm shadow-lg cursor-pointer"
            style={{ backgroundColor: appearance.primaryColor }}
          >
            {appearance.minimizedText}
          </div>
        </div>
      </div>
    </div>
  );
}