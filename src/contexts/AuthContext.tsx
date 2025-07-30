import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  switchUser: (userId: string) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const switchUser = (userId: string) => {
    const users = [
      {
        id: "user_001",
        avatarUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
        firstName: "Alice",
        lastName: "Johnson",
        email: "alice@techcorp.com",
        role: "admin" as const,
        onlineStatus: "online" as const,
        createdAt: "2025-01-15T10:00:00Z",
        organizationId: "org_001"
      },
      {
        id: "user_002",
        avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
        firstName: "Bob",
        lastName: "Smith",
        email: "bob@startupxyz.io",
        role: "agent" as const,
        onlineStatus: "online" as const,
        createdAt: "2025-01-20T12:00:00Z",
        organizationId: "org_001"
      },
      {
        id: "user_003",
        avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
        firstName: "Carol",
        lastName: "Davis",
        email: "carol@retailco.com",
        role: "manager" as const,
        onlineStatus: "away" as const,
        createdAt: "2025-01-22T14:00:00Z",
        organizationId: "org_002"
      }
    ];
    
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUserId', userId);
    }
  };

  useEffect(() => {
    // Simulate authentication - in real app this would check tokens, etc.
    // For demo purposes, we'll set a default user (Alice Johnson - admin)
    const initAuth = async () => {
      try {
        // In a real app, you'd validate stored tokens here
        // For demo, get user from localStorage or default to Alice
        const savedUserId = localStorage.getItem('currentUserId') || 'user_001';
        
        const users = [
          {
            id: "user_001",
            avatarUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
            firstName: "Alice",
            lastName: "Johnson",
            email: "alice@techcorp.com",
            role: "admin" as const,
            onlineStatus: "online" as const,
            createdAt: "2025-01-15T10:00:00Z",
            organizationId: "org_001"
          },
          {
            id: "user_002",
            avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
            firstName: "Bob",
            lastName: "Smith",
            email: "bob@startupxyz.io",
            role: "agent" as const,
            onlineStatus: "online" as const,
            createdAt: "2025-01-20T12:00:00Z",
            organizationId: "org_001"
          },
          {
            id: "user_003",
            avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
            firstName: "Carol",
            lastName: "Davis",
            email: "carol@retailco.com",
            role: "manager" as const,
            onlineStatus: "away" as const,
            createdAt: "2025-01-22T14:00:00Z",
            organizationId: "org_002"
          }
        ];
        
        const defaultUser = users.find(u => u.id === savedUserId) || users[0];
        setCurrentUser(defaultUser);
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, switchUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}