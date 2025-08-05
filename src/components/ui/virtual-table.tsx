/**
 * Optimized Data Table with Virtual Scrolling
 * High-performance table for large datasets
 */

import React, { useMemo, useCallback, useState } from 'react';
import { VirtualScroll } from './virtual-scroll';
import { useDebounced, usePerformanceMonitor } from '@/utils/performance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronDown, ChevronUp, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VirtualColumn<T> {
  key: keyof T;
  label: string;
  width?: number;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
  className?: string;
}

interface VirtualTableProps<T> {
  data: T[];
  columns: VirtualColumn<T>[];
  itemHeight?: number;
  containerHeight?: number;
  selectable?: boolean;
  searchable?: boolean;
  onSelectionChange?: (selectedItems: T[]) => void;
  onItemClick?: (item: T) => void;
  className?: string;
  loading?: boolean;
  emptyMessage?: string;
}

export function VirtualTable<T extends { id: string }>({
  data,
  columns,
  itemHeight = 48,
  containerHeight = 400,
  selectable = false,
  searchable = false,
  onSelectionChange,
  onItemClick,
  className,
  loading = false,
  emptyMessage = 'No data available'
}: VirtualTableProps<T>) {
  // Performance monitoring
  usePerformanceMonitor('VirtualTable');

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Debounced search for performance
  const debouncedSearch = useDebounced(searchQuery, 300);

  // Filtered and sorted data
  const processedData = useMemo(() => {
    let result = [...data];

    // Filter by search query
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      result = result.filter(item =>
        columns.some(column => {
          const value = item[column.key];
          return String(value).toLowerCase().includes(query);
        })
      );
    }

    // Sort data
    if (sortColumn) {
      result.sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        
        let comparison = 0;
        if (aValue < bValue) comparison = -1;
        if (aValue > bValue) comparison = 1;
        
        return sortDirection === 'desc' ? -comparison : comparison;
      });
    }

    return result;
  }, [data, debouncedSearch, sortColumn, sortDirection, columns]);

  // Selection handlers
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(processedData.map(item => item.id)));
    } else {
      setSelectedIds(new Set());
    }
  }, [processedData]);

  const handleSelectItem = useCallback((itemId: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }
    setSelectedIds(newSelected);
  }, [selectedIds]);

  // Sorting handlers
  const handleSort = useCallback((column: keyof T) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  }, [sortColumn]);

  // Effect to notify parent of selection changes
  React.useEffect(() => {
    if (onSelectionChange) {
      const selectedItems = processedData.filter(item => selectedIds.has(item.id));
      onSelectionChange(selectedItems);
    }
  }, [selectedIds, processedData, onSelectionChange]);

  // Render table row
  const renderRow = useCallback((item: T, index: number) => {
    const isSelected = selectedIds.has(item.id);
    
    return (
      <div
        className={cn(
          "flex items-center border-b border-border/50 hover:bg-muted/50 transition-colors",
          isSelected && "bg-muted/30"
        )}
        style={{ height: itemHeight }}
        onClick={() => onItemClick?.(item)}
      >
        {selectable && (
          <div className="w-12 flex justify-center">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
        
        {columns.map((column) => {
          const value = item[column.key];
          const content = column.render ? column.render(value, item) : String(value || '');
          
          return (
            <div
              key={String(column.key)}
              className={cn(
                "flex items-center px-3 py-2 text-sm",
                column.className
              )}
              style={{ 
                width: column.width || `${100 / columns.length}%`,
                minWidth: column.width || 100 
              }}
            >
              {content}
            </div>
          );
        })}
      </div>
    );
  }, [columns, itemHeight, selectable, selectedIds, handleSelectItem, onItemClick]);

  // Render table header
  const renderHeader = () => (
    <div
      className="flex items-center border-b-2 border-border bg-muted/30 font-medium text-sm"
      style={{ height: itemHeight }}
    >
      {selectable && (
        <div className="w-12 flex justify-center">
          <Checkbox
            checked={selectedIds.size === processedData.length && processedData.length > 0}
            onCheckedChange={handleSelectAll}
            className={selectedIds.size > 0 && selectedIds.size < processedData.length ? 'data-[state=checked]:bg-primary data-[state=checked]:opacity-50' : ''}
          />
        </div>
      )}
      
      {columns.map((column) => (
        <div
          key={String(column.key)}
          className={cn(
            "flex items-center px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors",
            column.sortable && "select-none",
            column.className
          )}
          style={{ 
            width: column.width || `${100 / columns.length}%`,
            minWidth: column.width || 100 
          }}
          onClick={() => column.sortable && handleSort(column.key)}
        >
          <span className="truncate">{column.label}</span>
          {column.sortable && sortColumn === column.key && (
            <div className="ml-2">
              {sortDirection === 'asc' ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted/30 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {(searchable || selectable) && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4">
            {searchable && (
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            )}
            
            {selectable && selectedIds.size > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {selectedIds.size} selected
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedIds(new Set())}
                >
                  Clear
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
      )}
      
      <CardContent className="p-0">
        <div className="border rounded-lg overflow-hidden">
          {renderHeader()}
          
          {processedData.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {debouncedSearch ? `No results found for "${debouncedSearch}"` : emptyMessage}
            </div>
          ) : (
            <VirtualScroll
              items={processedData}
              itemHeight={itemHeight}
              containerHeight={containerHeight}
              renderItem={renderRow}
              overscan={5}
              className="overflow-hidden"
            />
          )}
        </div>
        
        {processedData.length > 0 && (
          <div className="flex items-center justify-between p-4 text-sm text-muted-foreground border-t">
            <span>
              Showing {processedData.length} of {data.length} items
              {debouncedSearch && ` (filtered by "${debouncedSearch}")`}
            </span>
            
            {selectable && selectedIds.size > 0 && (
              <span>
                {selectedIds.size} item{selectedIds.size !== 1 ? 's' : ''} selected
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Memoized table for better performance
export const MemoizedVirtualTable = React.memo(VirtualTable) as typeof VirtualTable;