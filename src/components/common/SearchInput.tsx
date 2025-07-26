import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  debounceMs = 300,
  className = '',
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (internalValue !== value) {
        onChange(internalValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [internalValue, onChange, value, debounceMs]);

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        placeholder={placeholder}
        className="pl-10"
        aria-label="Search"
      />
    </div>
  );
}