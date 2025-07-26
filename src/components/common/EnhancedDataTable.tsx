import React, { useState, useMemo, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2, Edit, Eye } from 'lucide-react';
import { BulkActionsToolbar } from './BulkActionsToolbar';
import { SearchInput } from './SearchInput';
import { EmptyState } from './EmptyState';

export interface Column<T> {
  key: keyof T;
  header: string;
  cell?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  hideOnMobile?: boolean;
}

interface BulkAction<T = any> {
  id: string;
  label: string;
  icon: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  onClick: (selectedRows: T[]) => void;
}

export interface EnhancedDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onView?: (row: T) => void;
  selectable?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  bulkActions?: BulkAction<T>[];
  loading?: boolean;
  emptyState?: {
    title: string;
    description: string;
    illustration?: 'users' | 'organizations' | 'documents' | 'default';
    actionLabel?: string;
    onAction?: () => void;
  };
  className?: string;
}

export function EnhancedDataTable<T extends { id: string }>({
  data,
  columns,
  onRowClick,
  onEdit,
  onDelete,
  onView,
  selectable = false,
  searchable = false,
  searchPlaceholder = "Search...",
  bulkActions = [],
  loading = false,
  emptyState,
  className = '',
}: EnhancedDataTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    
    const query = searchQuery.toLowerCase();
    return data.filter((row) =>
      columns.some((column) => {
        const value = row[column.key];
        return String(value || '').toLowerCase().includes(query);
      })
    );
  }, [data, searchQuery, columns]);

  const selectedRowsData = useMemo(() => {
    return filteredData.filter((row) => selectedRows.includes(row.id));
  }, [filteredData, selectedRows]);

  const toggleRowSelection = useCallback((rowId: string, event?: React.KeyboardEvent) => {
    // Handle spacebar selection
    if (event && event.key !== ' ') return;
    if (event) event.preventDefault();
    
    setSelectedRows((prev) =>
      prev.includes(rowId)
        ? prev.filter((id) => id !== rowId)
        : [...prev, rowId]
    );
  }, []);

  const toggleAllSelection = useCallback(() => {
    if (selectedRows.length === filteredData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredData.map((row) => row.id));
    }
  }, [selectedRows.length, filteredData]);

  const clearSelection = useCallback(() => {
    setSelectedRows([]);
  }, []);

  const handleRowClick = useCallback((row: T, event: React.MouseEvent | React.KeyboardEvent) => {
    // Handle Enter key navigation
    if ('key' in event && event.key !== 'Enter') return;
    
    if (selectable && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      toggleRowSelection(row.id);
    } else if (onRowClick) {
      onRowClick(row);
    }
  }, [onRowClick, selectable, toggleRowSelection]);

  const handleRowKeyDown = useCallback((row: T, event: React.KeyboardEvent) => {
    if (event.key === ' ') {
      event.preventDefault();
      toggleRowSelection(row.id, event);
    } else if (event.key === 'Enter') {
      handleRowClick(row, event);
    }
  }, [handleRowClick, toggleRowSelection]);

  const renderCellContent = useCallback((column: Column<T>, row: T) => {
    const value = row[column.key];
    
    if (column.cell) {
      return column.cell(value, row);
    }

    // Default rendering for common types
    if (typeof value === "boolean") {
      return <Badge variant={value ? "default" : "secondary"}>{value ? "Yes" : "No"}</Badge>;
    }

    if (typeof value === "string" && value.includes("@")) {
      return <span className="text-muted-foreground">{value}</span>;
    }

    if (typeof value === "string" && value.includes("T") && value.includes("Z")) {
      return <span className="text-sm text-muted-foreground">
        {new Date(value).toLocaleDateString()}
      </span>;
    }

    return String(value || '');
  }, []);

  const hasActions = onEdit || onDelete || onView;

  // Enhanced bulk actions with row data
  const enhancedBulkActions = useMemo(() =>
    bulkActions.map(action => ({
      ...action,
      onClick: () => action.onClick(selectedRowsData),
    })),
  [bulkActions, selectedRowsData]);

  if (loading) {
    return (
      <div className="space-y-4">
        {searchable && <Skeleton className="h-10 w-full max-w-sm" />}
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (filteredData.length === 0 && !loading) {
    if (searchQuery.trim()) {
      return (
        <div className="space-y-4">
          {searchable && (
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={searchPlaceholder}
              className="max-w-sm"
            />
          )}
          <EmptyState
            title="No results found"
            description={`No items match your search for "${searchQuery}"`}
            className={className}
          />
        </div>
      );
    }

    return emptyState ? (
      <div className="space-y-4">
        {searchable && (
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={searchPlaceholder}
            className="max-w-sm"
          />
        )}
        <EmptyState {...emptyState} className={className} />
      </div>
    ) : (
      <EmptyState
        title="No data available"
        description="There are no items to display"
        className={className}
      />
    );
  }

  return (
    <div className="space-y-4">
      {searchable && (
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={searchPlaceholder}
          className="max-w-sm"
        />
      )}

      {selectable && (
        <BulkActionsToolbar
          selectedCount={selectedRows.length}
          onClearSelection={clearSelection}
          actions={enhancedBulkActions}
        />
      )}

      <div className={`rounded-md border ${className}`}>
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-12" style={{ width: '48px' }}>
                  <Checkbox
                    checked={selectedRows.length === filteredData.length}
                    onCheckedChange={toggleAllSelection}
                    aria-label="Select all rows"
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead 
                  key={String(column.key)} 
                  className={`font-medium ${column.hideOnMobile ? 'hidden md:table-cell' : ''}`}
                  style={column.width ? { width: column.width } : undefined}
                >
                  {column.header}
                </TableHead>
              ))}
              {hasActions && <TableHead className="w-12">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((row) => (
              <TableRow
                key={row.id}
                className={`${onRowClick ? "cursor-pointer" : ""} ${selectedRows.includes(row.id) ? "bg-muted/50" : ""}`}
                onClick={(e) => handleRowClick(row, e)}
                onKeyDown={(e) => handleRowKeyDown(row, e)}
                tabIndex={onRowClick ? 0 : -1}
                role={onRowClick ? "button" : undefined}
                aria-selected={selectable ? selectedRows.includes(row.id) : undefined}
              >
                {selectable && (
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.includes(row.id)}
                      onCheckedChange={() => toggleRowSelection(row.id)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select row ${row.id}`}
                    />
                  </TableCell>
                )}
                {columns.map((column) => (
                  <TableCell 
                    key={String(column.key)}
                    className={column.hideOnMobile ? 'hidden md:table-cell' : ''}
                  >
                    {renderCellContent(column, row)}
                  </TableCell>
                ))}
                {hasActions && (
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onView && (
                          <DropdownMenuItem onClick={() => onView(row)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                        )}
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(row)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem
                            onClick={() => onDelete(row)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}