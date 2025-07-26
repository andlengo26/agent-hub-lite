import React, { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface Column<T> {
  key: keyof T;
  label: string;
  width?: number;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface EnhancedDataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  pagination?: boolean;
  selectable?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  onSelectionChange?: (selectedRows: T[]) => void;
  pageSize?: number;
}

export function EnhancedDataTable<T extends { id: string }>({
  columns,
  data,
  pagination = false,
  selectable = false,
  loading = false,
  emptyMessage = "No data available",
  onRowClick,
  onSelectionChange,
  pageSize = 10
}: EnhancedDataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Memoized pagination
  const paginatedData = useMemo(() => {
    if (!pagination) return data;
    const startIndex = (currentPage - 1) * pageSize;
    return data.slice(startIndex, startIndex + pageSize);
  }, [data, currentPage, pageSize, pagination]);

  const totalPages = useMemo(() => {
    if (!pagination) return 1;
    return Math.ceil(data.length / pageSize);
  }, [data.length, pageSize, pagination]);

  // Selection handlers
  const handleRowSelection = (rowId: string, selected: boolean) => {
    const newSelection = selected 
      ? [...selectedRows, rowId]
      : selectedRows.filter(id => id !== rowId);
    
    setSelectedRows(newSelection);
    
    if (onSelectionChange) {
      const selectedData = data.filter(row => newSelection.includes(row.id));
      onSelectionChange(selectedData);
    }
  };

  const handleSelectAll = (selected: boolean) => {
    const newSelection = selected ? paginatedData.map(row => row.id) : [];
    setSelectedRows(newSelection);
    
    if (onSelectionChange) {
      const selectedData = data.filter(row => newSelection.includes(row.id));
      onSelectionChange(selectedData);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            {selectable && (
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedRows.length === paginatedData.length && paginatedData.length > 0}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all rows"
                />
              </TableHead>
            )}
            {columns.map((column) => (
              <TableHead 
                key={String(column.key)} 
                style={column.width ? { width: column.width } : undefined}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.length === 0 ? (
            <TableRow>
              <TableCell 
                colSpan={columns.length + (selectable ? 1 : 0)} 
                className="text-center py-8 text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            paginatedData.map((row) => (
              <TableRow
                key={row.id}
                className={`${onRowClick ? 'cursor-pointer' : ''} ${
                  selectedRows.includes(row.id) ? 'bg-muted/50' : ''
                }`}
                onClick={() => onRowClick?.(row)}
              >
                {selectable && (
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.includes(row.id)}
                      onCheckedChange={(checked) => 
                        handleRowSelection(row.id, checked as boolean)
                      }
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select row ${row.id}`}
                    />
                  </TableCell>
                )}
                {columns.map((column) => (
                  <TableCell key={String(column.key)}>
                    {column.render 
                      ? column.render(row[column.key], row)
                      : String(row[column.key] || '-')
                    }
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * pageSize) + 1} to{' '}
            {Math.min(currentPage * pageSize, data.length)} of {data.length} results
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
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
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}