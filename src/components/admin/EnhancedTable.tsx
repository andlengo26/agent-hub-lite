import React, { useState, useMemo, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Download, Archive, Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export interface Column<T> {
  key: keyof T;
  label: string;
  width?: number;
  cell?: (value: any, row: T) => React.ReactNode;
  render?: (row: T) => React.ReactNode;
}

export interface EnhancedTableProps<T> {
  columns: Column<T>[];
  data: T[];
  pagination?: boolean;
  selectable?: boolean;
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  onSelectionChange?: (selectedRows: T[]) => void;
  onExport?: (data: T[]) => void;
  onArchive?: (rows: T[]) => void;
  onEmailReply?: (row: T) => void;
  pageSize?: number;
  showActions?: boolean;
}

export function EnhancedTable<T extends { id: string; status?: string }>({
  columns,
  data,
  pagination = false,
  selectable = false,
  loading = false,
  error = null,
  emptyMessage = "No data available",
  onRowClick,
  onSelectionChange,
  onExport,
  onArchive,
  onEmailReply,
  pageSize = 10,
  showActions = false
}: EnhancedTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

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

  // Selection handlers with useCallback optimization
  const handleRowSelection = useCallback((rowId: string, selected: boolean) => {
    const newSelection = selected 
      ? [...selectedRows, rowId]
      : selectedRows.filter(id => id !== rowId);
    
    setSelectedRows(newSelection);
    
    if (onSelectionChange) {
      const selectedData = data.filter(row => newSelection.includes(row.id));
      onSelectionChange(selectedData);
    }
  }, [selectedRows, data, onSelectionChange]);

  const handleSelectAll = useCallback((selected: boolean) => {
    const newSelection = selected ? paginatedData.map(row => row.id) : [];
    setSelectedRows(newSelection);
    
    if (onSelectionChange) {
      const selectedData = data.filter(row => newSelection.includes(row.id));
      onSelectionChange(selectedData);
    }
  }, [paginatedData, data, onSelectionChange]);

  // Action handlers with loading states
  const handleExport = useCallback(async () => {
    if (!onExport) return;
    
    setIsProcessing('export');
    try {
      await onExport(data);
      toast({
        title: "Export Complete",
        description: "Data has been exported successfully",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(null);
    }
  }, [data, onExport]);

  const handleArchive = useCallback(async (rows: T[]) => {
    if (!onArchive) return;
    
    setIsProcessing('archive');
    try {
      await onArchive(rows);
      toast({
        title: "Archive Complete",
        description: `${rows.length} item(s) archived successfully`,
      });
    } catch (error) {
      toast({
        title: "Archive Failed", 
        description: "Failed to archive items",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(null);
    }
  }, [onArchive]);

  const handleEmailReply = useCallback(async (row: T) => {
    if (!onEmailReply) return;
    
    setIsProcessing(`email-${row.id}`);
    try {
      await onEmailReply(row);
      toast({
        title: "Email Sent",
        description: "Reply email has been sent successfully",
      });
    } catch (error) {
      toast({
        title: "Email Failed",
        description: "Failed to send reply email",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(null);
    }
  }, [onEmailReply]);

  // Error state
  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Loading state with skeleton
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
      {/* Action Bar */}
      {(selectable || showActions) && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectable && selectedRows.length > 0 && (
              <>
                <span className="text-sm text-muted-foreground">
                  {selectedRows.length} selected
                </span>
                {onArchive && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const selectedData = data.filter(row => selectedRows.includes(row.id));
                      handleArchive(selectedData);
                    }}
                    disabled={isProcessing === 'archive'}
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </Button>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={isProcessing === 'export'}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </div>
      )}

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
            {showActions && <TableHead className="w-12">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.length === 0 ? (
            <TableRow>
              <TableCell 
                colSpan={columns.length + (selectable ? 1 : 0) + (showActions ? 1 : 0)} 
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
                      ? column.render(row)
                      : column.cell
                      ? column.cell(row[column.key], row)
                      : String(row[column.key] || '-')
                    }
                  </TableCell>
                ))}
                {showActions && (
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {row.status === 'missed' && onEmailReply && (
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEmailReply(row);
                            }}
                            disabled={isProcessing === `email-${row.id}`}
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Reply via Email
                          </DropdownMenuItem>
                        )}
                        {onArchive && (
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleArchive([row]);
                            }}
                            disabled={isProcessing === 'archive'}
                          >
                            <Archive className="h-4 w-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
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