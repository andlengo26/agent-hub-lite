/**
 * Unified DataTable component following KB design system
 * Consolidates all table implementations into a single, reusable component
 */

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
import { MoreHorizontal, Trash2, Edit, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { SearchInput } from '@/components/common/SearchInput';
import { EmptyState } from '@/components/common/EmptyState';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: keyof T;
  label: string;
  width?: string;
  sortable?: boolean;
  hideOnMobile?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

interface BulkAction<T = any> {
  id: string;
  label: string;
  icon: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  onClick: (selectedRows: T[]) => void;
}

interface CustomAction<T = any> {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: (row: T) => void;
  variant?: 'default' | 'destructive';
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  // Row interactions
  onRowClick?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onView?: (row: T) => void;
  // Custom actions
  customActions?: CustomAction<T>[];
  // Table features
  selectable?: boolean;
  searchable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  // Bulk actions
  bulkActions?: BulkAction<T>[];
  onSelectionChange?: (selectedRows: T[]) => void;
  // UI states
  loading?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  className?: string;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  onRowClick,
  onEdit,
  onDelete,
  onView,
  customActions = [],
  selectable = false,
  searchable = false,
  pagination = false,
  pageSize = 10,
  bulkActions = [],
  onSelectionChange,
  loading = false,
  emptyMessage = "No data available",
  emptyDescription,
  className,
}: DataTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchable || !searchQuery.trim()) return data;
    
    const query = searchQuery.toLowerCase();
    return data.filter((row) => {
      return columns.some((column) => {
        const value = row[column.key];
        if (value == null) return false;
        return String(value).toLowerCase().includes(query);
      });
    });
  }, [data, searchQuery, searchable, columns]);

  // Paginate filtered data
  const paginatedData = useMemo(() => {
    if (!pagination) return filteredData;
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage, pageSize, pagination]);

  const totalPages = useMemo(() => {
    if (!pagination) return 1;
    return Math.ceil(filteredData.length / pageSize);
  }, [filteredData.length, pageSize, pagination]);

  // Selection handlers
  const handleRowSelection = useCallback((rowId: string, checked: boolean) => {
    setSelectedRows(prev => {
      const newSelection = checked 
        ? [...prev, rowId]
        : prev.filter(id => id !== rowId);
      
      const selectedRowObjects = data.filter(row => newSelection.includes(row.id));
      onSelectionChange?.(selectedRowObjects);
      return newSelection;
    });
  }, [data, onSelectionChange]);

  const handleSelectAll = useCallback((checked: boolean) => {
    const newSelection = checked ? paginatedData.map(row => row.id) : [];
    setSelectedRows(newSelection);
    
    const selectedRowObjects = data.filter(row => newSelection.includes(row.id));
    onSelectionChange?.(selectedRowObjects);
  }, [paginatedData, data, onSelectionChange]);

  // Render cell content with proper formatting
  const renderCellContent = useCallback((column: Column<T>, row: T) => {
    const value = row[column.key];
    
    if (column.render) {
      return column.render(value, row);
    }
    
    // Default formatting
    if (typeof value === 'boolean') {
      return <Badge variant={value ? 'default' : 'secondary'}>{value ? 'Yes' : 'No'}</Badge>;
    }
    
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    
    if (typeof value === 'string' && value.includes('@')) {
      return <span className="text-text-secondary">{value}</span>;
    }
    
    return String(value || '');
  }, []);

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        {searchable && <Skeleton className="h-10 w-full" />}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {selectable && <TableHead className="w-12"><Skeleton className="h-4 w-4" /></TableHead>}
                {columns.map((column, index) => (
                  <TableHead key={index}><Skeleton className="h-4 w-20" /></TableHead>
                ))}
                <TableHead className="w-12"><Skeleton className="h-4 w-4" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: pageSize }).map((_, index) => (
                <TableRow key={index}>
                  {selectable && <TableCell><Skeleton className="h-4 w-4" /></TableCell>}
                  {columns.map((_, colIndex) => (
                    <TableCell key={colIndex}><Skeleton className="h-4 w-24" /></TableCell>
                  ))}
                  <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (filteredData.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        {searchable && (
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search..."
          />
        )}
        <EmptyState 
          title={emptyMessage}
          description={emptyDescription}
        />
      </div>
    );
  }

  const hasActions = onEdit || onDelete || onView || customActions.length > 0;
  const isAllSelected = paginatedData.length > 0 && paginatedData.every(row => selectedRows.includes(row.id));
  const isSomeSelected = selectedRows.length > 0 && selectedRows.length < paginatedData.length;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and bulk actions */}
      {(searchable || (selectable && bulkActions.length > 0)) && (
        <div className="flex items-center justify-between gap-4">
          {searchable && (
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search..."
              className="max-w-sm"
            />
          )}
          
          {selectable && selectedRows.length > 0 && bulkActions.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-secondary">
                {selectedRows.length} selected
              </span>
              {bulkActions.map((action) => (
                <Button
                  key={action.id}
                  variant={action.variant || 'outline'}
                  size="sm"
                  onClick={() => {
                    const selectedRowObjects = data.filter(row => selectedRows.includes(row.id));
                    action.onClick(selectedRowObjects);
                  }}
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) {
                        const checkboxEl = el.querySelector('input');
                        if (checkboxEl) checkboxEl.indeterminate = isSomeSelected;
                      }
                    }}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all rows"
                  />
                </TableHead>
              )}
              {columns.map((column, index) => (
                <TableHead 
                  key={index}
                  style={column.width ? { width: column.width } : undefined}
                  className={cn(
                    column.hideOnMobile && "hidden md:table-cell"
                  )}
                >
                  {column.label}
                </TableHead>
              ))}
              {hasActions && <TableHead className="w-12" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((row) => (
              <TableRow
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  onRowClick && "cursor-pointer",
                  selectedRows.includes(row.id) && "bg-muted/50"
                )}
              >
                {selectable && (
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.includes(row.id)}
                      onCheckedChange={(checked) => handleRowSelection(row.id, !!checked)}
                      aria-label={`Select row ${row.id}`}
                    />
                  </TableCell>
                )}
                {columns.map((column, index) => (
                  <TableCell 
                    key={index}
                    className={cn(
                      column.hideOnMobile && "hidden md:table-cell"
                    )}
                  >
                    {renderCellContent(column, row)}
                  </TableCell>
                ))}
                {hasActions && (
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                       <DropdownMenuContent align="end">
                         {customActions.map((action) => (
                           <DropdownMenuItem 
                             key={action.id}
                             onClick={() => action.onClick(row)}
                             className={action.variant === 'destructive' ? 'text-destructive' : ''}
                           >
                             <span className="mr-2">{action.icon}</span>
                             {action.label}
                           </DropdownMenuItem>
                         ))}
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

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-text-secondary">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} entries
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}