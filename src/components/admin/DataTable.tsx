import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, Edit, Eye } from "lucide-react";

export interface Column<T> {
  key: keyof T;
  header: string;
  cell?: (value: any, row: T) => React.ReactNode;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onView?: (row: T) => void;
  selectable?: boolean;
  className?: string;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  onRowClick,
  onEdit,
  onDelete,
  onView,
  selectable = false,
  className,
}: DataTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const toggleRowSelection = (rowId: string) => {
    setSelectedRows((prev) =>
      prev.includes(rowId)
        ? prev.filter((id) => id !== rowId)
        : [...prev, rowId]
    );
  };

  const toggleAllSelection = () => {
    if (selectedRows.length === data.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(data.map((row) => row.id));
    }
  };

  const renderCellContent = (column: Column<T>, row: T) => {
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

    return String(value);
  };

  const hasActions = onEdit || onDelete || onView;

  return (
    <div className={`rounded-md border ${className}`}>
      <Table>
        <TableHeader>
          <TableRow>
            {selectable && (
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedRows.length === data.length}
                  onCheckedChange={toggleAllSelection}
                />
              </TableHead>
            )}
            {columns.map((column) => (
              <TableHead key={String(column.key)} className="font-medium">
                {column.header}
              </TableHead>
            ))}
            {hasActions && <TableHead className="w-12">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell 
                colSpan={columns.length + (selectable ? 1 : 0) + (hasActions ? 1 : 0)} 
                className="h-24 text-center text-muted-foreground"
              >
                No data available
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
            <TableRow
              key={row.id}
              className={`${onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}`}
              onClick={() => onRowClick?.(row)}
            >
              {selectable && (
                <TableCell>
                  <Checkbox
                    checked={selectedRows.includes(row.id)}
                    onCheckedChange={() => toggleRowSelection(row.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell key={String(column.key)}>
                  {renderCellContent(column, row)}
                </TableCell>
              ))}
              {hasActions && (
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
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
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}