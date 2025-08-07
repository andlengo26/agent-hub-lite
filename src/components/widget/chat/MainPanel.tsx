/**
 * Main Panel Component
 * Handles the main widget interface with tabs and content
 */

import { Search, MessageSquare, User, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TabType } from './NavigationTabs';
import { FAQ, Resource, ChatHistory, IdentificationSession } from '@/types/main-panel';

interface MainPanelProps {
  activeTab: TabType;
  hasActiveChat: boolean;
  onStartChat: () => void;
  onContinueChat: () => void;
  onFAQDetail: (faq: any) => void;
  onResourceDetail: (resource: any) => void;
  onMessageDetail: (chat: any) => void;
  appearance: {
    primaryColor: string;
  };
  aiSettings: {
    welcomeMessage?: string;
  };
  searchQuery: string;
  onSearchChange: (value: string) => void;
  faqQuery: string;
  onFAQSearch: (value: string) => void;
  
  // Data props
  faqs: FAQ[];
  resources: Resource[];
  chats: ChatHistory[];
  
  // Loading states
  faqLoading: boolean;
  resourcesLoading: boolean;
  chatsLoading: boolean;
  
  // Search functions
  searchResources: (query: string) => Resource[];
  
  // User identification
  userIdentification: {
    session: IdentificationSession | null;
    [key: string]: any; // Allow additional properties
  };
}

export function MainPanel({
  activeTab,
  hasActiveChat,
  onStartChat,
  onContinueChat,
  onFAQDetail,
  onResourceDetail,
  onMessageDetail,
  appearance,
  aiSettings,
  searchQuery,
  onSearchChange,
  faqQuery,
  onFAQSearch,
  faqs,
  resources,
  chats,
  faqLoading,
  resourcesLoading,
  chatsLoading,
  searchResources,
  userIdentification
}: MainPanelProps) {
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-4">
            {/* Welcome Greeting */}
            <div className="text-center py-4">
              <h2 className="text-lg font-semibold text-foreground">
                {aiSettings.welcomeMessage || "How can we help you today?"}
              </h2>
            </div>

            {/* Chat Button */}
            <div className="space-y-3">
              <Button
                onClick={hasActiveChat ? onContinueChat : onStartChat}
                className="w-full text-white py-3 text-base font-medium"
                style={{ backgroundColor: appearance.primaryColor }}
              >
                {hasActiveChat ? "Continue with the Chat" : "Chat With Us"}
              </Button>
            </div>

            {/* FAQ Search */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={faqQuery}
                  onChange={(e) => onFAQSearch(e.target.value)}
                  placeholder="Search frequently asked questions..."
                  className="pl-10"
                />
              </div>
              
              {faqLoading ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  Loading FAQs...
                </div>
              ) : faqs.length > 0 ? (
                <div className="space-y-2">
                  {faqs.slice(0, 5).map((faq) => (
                    <div
                      key={faq.id}
                      className="p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => onFAQDetail(faq)}
                    >
                      <h3 className="font-medium text-sm text-foreground">{faq.question}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              ) : faqQuery ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No FAQs found matching "{faqQuery}"
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  Type above to search FAQs
                </div>
              )}
            </div>
          </div>
        );

      case 'messages':
        return (
          <div className="space-y-4">
            {userIdentification.session ? (
              <div>
                {chatsLoading ? (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    Loading chat history...
                  </div>
                ) : chats.length > 0 ? (
                  <div className="space-y-3">
                    {chats.map((chat) => (
                      <div
                        key={chat.id}
                        className="p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => onMessageDetail(chat)}
                      >
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-sm text-foreground">
                            {new Date(chat.timestamp).toLocaleDateString()}
                          </h3>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            chat.status === 'active' ? 'bg-green-100 text-green-800' :
                            chat.status === 'ended' ? 'bg-gray-100 text-gray-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {chat.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {chat.messages.length} messages
                        </p>
                        {chat.messages.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            Last: {chat.messages[chat.messages.length - 1]?.content}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No previous conversations</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-lg font-semibold text-foreground mb-2">Sign in to view messages</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Sign in to access your chat history and previous conversations.
                </p>
                <p className="text-sm text-muted-foreground">
                  Start a chat to complete your identification and access message history.
                </p>
              </div>
            )}
          </div>
        );

      case 'resources':
        return (
          <div className="space-y-4">
            {resourcesLoading ? (
              <div className="text-center py-4 text-muted-foreground text-sm">
                Loading resources...
              </div>
            ) : (
              <div className="space-y-3">
                {searchResources(searchQuery).map((resource) => (
                  <div
                    key={resource.id}
                    className="p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => onResourceDetail(resource)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {resource.type === 'document' && <FileText className="h-5 w-5 text-blue-500" />}
                        {resource.type === 'video' && <FileText className="h-5 w-5 text-red-500" />}
                        {resource.type === 'link' && <FileText className="h-5 w-5 text-green-500" />}
                        {resource.type === 'template' && <FileText className="h-5 w-5 text-purple-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-foreground truncate">
                          {resource.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {resource.aiInstructions}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {searchResources(searchQuery).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      {searchQuery ? `No resources found for "${searchQuery}"` : 'No resources available'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return renderContent();
}