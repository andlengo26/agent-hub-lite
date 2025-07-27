/**
 * Common Section wrapper component
 * Provides consistent spacing and styling for content sections
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
}

export function Section({
  children,
  className,
  title,
  description,
  padding = 'md',
  border = false,
}: SectionProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-space-3',
    md: 'p-space-4',
    lg: 'p-space-6',
  };

  return (
    <section className={cn(
      paddingClasses[padding],
      border && 'border border-border rounded-radius-md',
      className
    )}>
      {(title || description) && (
        <div className="mb-space-4">
          {title && (
            <h3 className="text-lg font-medium text-text-primary mb-space-1">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-text-secondary">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}