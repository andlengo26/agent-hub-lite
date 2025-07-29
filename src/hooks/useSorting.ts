import { useState, useMemo } from 'react';

export type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: string;
  direction: SortDirection;
}

interface UseSortingProps<T> {
  data: T[];
  defaultSortKey?: string;
  defaultSortDirection?: SortDirection;
}

interface UseSortingReturn<T> {
  sortedData: T[];
  sortConfig: SortConfig | null;
  requestSort: (key: string) => void;
  getSortDirection: (key: string) => SortDirection | null;
}

export function useSorting<T extends Record<string, any>>({ 
  data, 
  defaultSortKey,
  defaultSortDirection = 'asc'
}: UseSortingProps<T>): UseSortingReturn<T> {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(
    defaultSortKey ? { key: defaultSortKey, direction: defaultSortDirection } : null
  );

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = getNestedValue(a, sortConfig.key);
      const bValue = getNestedValue(b, sortConfig.key);

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  const requestSort = (key: string) => {
    let direction: SortDirection = 'asc';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
  };

  const getSortDirection = (key: string): SortDirection | null => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction;
  };

  return {
    sortedData,
    sortConfig,
    requestSort,
    getSortDirection,
  };
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}