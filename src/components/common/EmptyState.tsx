import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface EmptyStateProps {
  title: string;
  description: string;
  illustration?: 'users' | 'organizations' | 'documents' | 'default';
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  illustration = 'default',
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  const getIllustration = () => {
    const baseClasses = "mx-auto h-16 w-16 text-muted-foreground mb-4";
    
    switch (illustration) {
      case 'users':
        return (
          <svg className={baseClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197V9a3 3 0 00-3-3m3 3a3 3 0 013 3v1" />
          </svg>
        );
      case 'organizations':
        return (
          <svg className={baseClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'documents':
        return (
          <svg className={baseClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      default:
        return (
          <svg className={baseClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        );
    }
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="text-center">
        {getIllustration()}
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">{description}</p>
        {actionLabel && onAction && (
          <Button onClick={onAction} size="sm">
            {actionLabel}
          </Button>
        )}
      </div>
    </Card>
  );
}