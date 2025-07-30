import { useState, useMemo } from "react";
import { Card } from "./card";
import { Input } from "./input";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import { Badge } from "./badge";
import { Skeleton } from "./skeleton";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "./dropdown-menu";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "./table";
import { MoreHorizontal, Search, Edit, Trash2, Eye, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { BulkActionsToolbar } from "../common/BulkActionsToolbar";
import { EmptyState } from "../common/EmptyState";
import { StandardPagination } from "./StandardPagination";
import { usePagination } from "@/hooks/usePagination";
import { useSorting } from "@/hooks/useSorting";

// Column interface with enhanced sorting support
export interface Column<T> {
  key: string;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
  width?: number;
  className?: string;
  sortable?: boolean;
  sortKey?: string; // If different from key, for nested properties
}

// Bulk action interface
interface BulkAction<T> {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: (selectedItems: T[]) => void;
  variant?: 'default' | 'destructive';
}

// Custom action interface
interface CustomAction<T> {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: (item: T) => void;
  variant?: 'default' | 'destructive';
}

// Main props interface
export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  searchable?: boolean;
  selectable?: boolean;
  pagination?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  className?: string;
  customActions?: CustomAction<T>[];
  bulkActions?: BulkAction<T>[];
  // Pagination props
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  showPageInfo?: boolean;
  showFirstLast?: boolean;
  // Sorting props
  defaultSortKey?: string;
  defaultSortDirection?: 'asc' | 'desc';
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  onRowClick,
  onEdit,
  onDelete,
  onView,
  searchable = true,
  selectable = false,
  pagination = true,
  loading = false,
  emptyMessage = "No data available",
  emptyDescription,
  className,
  customActions = [],
  bulkActions = [],
  defaultPageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  showPageSizeSelector = true,
  showPageInfo = true,
  showFirstLast = false,
  defaultSortKey,
  defaultSortDirection = 'asc'
}: DataTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    
    return data.filter(item =>
      columns.some(column => {
        const value = item[column.key];
        return value?.toString().toLowerCase().includes(searchQuery.toLowerCase());
      })
    );
  }, [data, searchQuery, columns]);

  // Use sorting hook
  const { sortedData, requestSort, getSortDirection } = useSorting({
    data: filteredData,
    defaultSortKey,
    defaultSortDirection
  });

  // Use pagination hook
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedData,
    setCurrentPage,
    setPageSize
  } = usePagination({
    data: sortedData,
    defaultPageSize
  });

  // Get final data (paginated if pagination is enabled)
  const displayData = pagination ? paginatedData : sortedData;

  const handleRowSelection = (rowId: string, checked: boolean) => {
    const newSelectedRows = new Set(selectedRows);
    if (checked) {
      newSelectedRows.add(rowId);
    } else {
      newSelectedRows.delete(rowId);
    }
    setSelectedRows(newSelectedRows);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(displayData.map(item => item.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const renderCellContent = (column: Column<T>, item: T | undefined) => {
    // Step 3: Guard against undefined items in DataTable
    if (!item) {
      return <span className="text-muted-foreground">—</span>;
    }
    
    const value = item[column.key];
    
    if (column.render) {
      return column.render(value, item);
    }
    
    return value?.toString() || '';
  };

  if (loading) {
    return (
      <Card className={className}>
        <div className="p-6">
          {searchable && <Skeleton className="h-10 w-full mb-4" />}
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="p-6">
        {/* Search Input */}
        {searchable && (
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {selectable && selectedRows.size > 0 && bulkActions.length > 0 && (
          <BulkActionsToolbar
            selectedCount={selectedRows.size}
            actions={bulkActions.map(action => ({
              ...action,
              onClick: () => {
                const selectedItems = displayData.filter(item => selectedRows.has(item.id));
                action.onClick(selectedItems);
              }
            }))}
            onClearSelection={() => setSelectedRows(new Set())}
          />
        )}

        {/* Table */}
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                {selectable && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedRows.size === displayData.length && displayData.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                )}
                {columns.map((column) => (
                  <TableHead 
                    key={column.key} 
                    className={cn(
                      column.className,
                      column.sortable && "cursor-pointer hover:bg-muted/50 select-none"
                    )}
                    style={{ width: column.width }}
                    onClick={() => column.sortable && requestSort(column.sortKey || column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable && (
                        <div className="flex flex-col">
                          {getSortDirection(column.sortKey || column.key) === 'asc' && (
                            <ArrowUp className="h-3 w-3" />
                          )}
                          {getSortDirection(column.sortKey || column.key) === 'desc' && (
                            <ArrowDown className="h-3 w-3" />
                          )}
                          {!getSortDirection(column.sortKey || column.key) && (
                            <ArrowUpDown className="h-3 w-3 opacity-50" />
                          )}
                        </div>
                      )}
                    </div>
                  </TableHead>
                ))}
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: pageSize }).map((_, index) => (
                  <TableRow key={index}>
                    {selectable && (
                      <TableCell>
                        <Skeleton className="h-4 w-4" />
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell key={column.key}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                    <TableCell>
                      <Skeleton className="h-8 w-8" />
                    </TableCell>
                  </TableRow>
                ))
              ) : displayData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (selectable ? 1 : 0) + 1} className="h-24 text-center">
                    <EmptyState 
                      title={emptyMessage}
                      description="No items found."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                displayData.map((item) => (
                  <TableRow key={item.id} onClick={() => onRowClick?.(item)} className={onRowClick ? "cursor-pointer" : ""}>
                    {selectable && (
                      <TableCell>
                        <Checkbox
                          checked={selectedRows.has(item.id)}
                          onCheckedChange={(checked) => handleRowSelection(item.id, !!checked)}
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell key={column.key} className={column.className}>
                        {renderCellContent(column, item)}
                      </TableCell>
                    ))}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {customActions.map((action, index) => (
                            <DropdownMenuItem
                              key={index}
                              onClick={() => action.onClick(item)}
                            >
                              {action.icon}
                              {action.label}
                            </DropdownMenuItem>
                          ))}
                          {onView && (
                            <DropdownMenuItem onClick={() => onView(item)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                          )}
                          {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(item)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <DropdownMenuItem 
                              onClick={() => onDelete(item)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination && !loading && displayData.length > 0 && (
          <StandardPagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={pageSizeOptions}
            showPageSizeSelector={showPageSizeSelector}
            showPageInfo={showPageInfo}
            showFirstLast={showFirstLast}
          />
        )}
      </div>
    </Card>
  );
}