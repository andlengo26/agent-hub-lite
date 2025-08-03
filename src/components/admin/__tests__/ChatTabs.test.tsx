/**
 * Test suite for ChatTabs component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatTabs } from '../agent-console/ChatTabs';
import { AgentConsoleContext } from '@/contexts/AgentConsoleContext';
import { createMockChat } from '@/lib/test-utils';

const mockContextValue = {
  activeChats: [
    createMockChat({ id: 'chat_001', requesterName: 'John Doe', unreadCount: 2 }),
    createMockChat({ id: 'chat_002', requesterName: 'Jane Smith', unreadCount: 0 }),
  ],
  currentChatId: 'chat_001',
  switchToChat: jest.fn(),
  closeChat: jest.fn(),
  acceptChat: jest.fn(),
  acceptAIHandoff: jest.fn(),
  escalateChat: jest.fn(),
  processHumanRequest: jest.fn(),
};

const renderWithContext = (contextValue = mockContextValue) => {
  return render(
    <AgentConsoleContext.Provider value={contextValue}>
      <ChatTabs />
    </AgentConsoleContext.Provider>
  );
};

describe('ChatTabs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when there is only one chat', () => {
    const singleChatContext = {
      ...mockContextValue,
      activeChats: [createMockChat()],
    };
    
    const { container } = renderWithContext(singleChatContext);
    expect(container.firstChild).toBeNull();
  });

  it('renders tabs for multiple chats', () => {
    renderWithContext();
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('shows unread count badge when chat has unread messages', () => {
    renderWithContext();
    
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('calls switchToChat when tab is clicked', () => {
    renderWithContext();
    
    fireEvent.click(screen.getByText('Jane Smith'));
    expect(mockContextValue.switchToChat).toHaveBeenCalledWith('chat_002');
  });

  it('calls closeChat when close button is clicked', () => {
    renderWithContext();
    
    const closeButtons = screen.getAllByRole('button');
    const closeButton = closeButtons.find(btn => btn.querySelector('svg'));
    
    if (closeButton) {
      fireEvent.click(closeButton);
      expect(mockContextValue.closeChat).toHaveBeenCalled();
    }
  });

  it('truncates long requester names', () => {
    const longNameContext = {
      ...mockContextValue,
      activeChats: [
        createMockChat({ 
          id: 'chat_001', 
          requesterName: 'This is a very long name that should be truncated' 
        }),
      ],
    };
    
    renderWithContext(longNameContext);
    
    const nameElement = screen.getByText(/This is a very long name/);
    expect(nameElement).toHaveClass('truncate', 'max-w-24');
  });
});