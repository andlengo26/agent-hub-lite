import { useState, useEffect } from 'react';

export interface ChatSession {
  id: string;
  userId: string;
  username: string;
  timestamp: string;
  status: 'active' | 'ended' | 'idle_timeout';
  messages: Array<{
    id: string;
    type: 'ai' | 'user';
    content: string;
    timestamp: string;
  }>;
}

interface ChatHistoryResponse {
  sessions: ChatSession[];
}

export function useChats() {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadChats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/mocks/chat-history.json');
      const data: ChatHistoryResponse = await response.json();
      setChats(data.sessions || []);
      setError(null);
    } catch (err) {
      setError('Failed to load chat history');
      console.error('Error loading chat history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChats();
  }, []);

  return {
    chats,
    loading,
    error,
    refetch: loadChats
  };
}