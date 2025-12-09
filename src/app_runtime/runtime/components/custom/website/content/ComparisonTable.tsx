import * as React from 'react';
import { cn } from '@/lib/utils'; // Assuming a utility for class names
import { DynamicRenderer } from '@/components/DynamicRenderer'; // Assuming this path

// Assuming shadcn/ui paths
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/runtime/components/ui/table";

// Assuming interfaces are imported from their respective files in your project.
import { 
    ComparisonTableProps,
    TableColumnDef,
    TableRowData,
    CellValue
} from '@/interfaces/components/website/content/content';
import {ComponentProps, SubComponentProps} from '@/interfaces/components/common/core';

/**
 * Renders the content of a single table cell. It can handle primitive
 * values (string, number, boolean) or render a full component configuration
 * using the DynamicRenderer.
 */
const CellRenderer = ({ value }: { value: CellValue }) => {
    // Check if the value is a primitive type
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return <>{value.toString()}</>;
    }
    // Check if the value is a valid component configuration object
    if (typeof value === 'object' && value !== null && 'componentType' in value) {
        return <DynamicRenderer component={value as ComponentProps} />;
    }
    // Return null or a placeholder for invalid cell data
    return null;
};


/**
 * A data-driven component for creating a tabular comparison of items.
 * This component is SSR-compatible by default.
 */
export const ComparisonTable = ({
  title,
  subtitle,
  columns,
  rows,
  featuredColumnKey,
  stickyHeader = false,
  stickyFirstColumn = false,
  zebraStriping = false,
  classes,
}: ComparisonTableProps) => {
  return (
    <div className={cn("w-full", classes)}>
      {/* Optional Title and Subtitle */}
      {(title || subtitle) && (
        <div className="mb-6 text-center">
          {title && <h2 className="text-3xl font-bold tracking-tight">{title}</h2>}
          {subtitle && <p className="mt-2 text-lg text-muted-foreground">{subtitle}</p>}
        </div>
      )}

      <div className="relative overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader className={cn(stickyHeader && "sticky top-0 bg-background z-10")}>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.uuid}
                  className={cn(
                    "font-bold",
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    stickyFirstColumn && 'first:sticky first:left-0 first:bg-background',
                    column.accessorKey === featuredColumnKey && 'bg-muted'
                  )}
                  style={{ width: column.width }}
                >
                  {typeof column.header === 'string' ? (
                    column.header
                  ) : (
                    <DynamicRenderer component={column.header} />
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow
                key={row.id}
                className={cn(zebraStriping && rowIndex % 2 !== 0 && "bg-muted/50")}
              >
                {columns.map((column, colIndex) => {
                  const cellValue = row.values[column.accessorKey];
                  return (
                    <TableCell
                      key={`${row.id}-${column.accessorKey}`}
                      className={cn(
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right',
                        stickyFirstColumn && colIndex === 0 && 'sticky left-0 bg-background',
                        column.accessorKey === featuredColumnKey && 'bg-muted'
                      )}
                    >
                      <CellRenderer value={cellValue} />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
