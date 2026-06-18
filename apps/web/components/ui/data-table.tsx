import { RiInbox2Line } from "@remixicon/react";
import { type Row, type Table as TanstackTable, flexRender } from "@tanstack/react-table";

import { Button } from "@beetime/ui/components/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@beetime/ui/components/empty";
import { Frame, FrameFooter } from "@beetime/ui/components/frame";
import { Spinner } from "@beetime/ui/components/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@beetime/ui/components/table";
import { Pagination, PaginationContent, PaginationItem } from "@beetime/ui/components/pagination";
import { cn } from "@beetime/ui/lib/utils";

interface DataTableProps<TData> extends React.ComponentProps<"div"> {
  /**
   * The table instance returned from useDataTable hook with pagination, sorting, filtering, etc.
   * @type TanstackTable<TData>
   */
  table: TanstackTable<TData>;
  /**
   * Show loading overlay
   */
  loading?: boolean;
  /**
   * Custom row renderer to add custom props or event handlers to the table rows. Receives the row object as an argument.
   */
  row?: (row: Row<TData>) => React.ComponentProps<"tr">;
  /**
   * Show Pagination
   */
  hidePagination?: boolean;
}

export function DataTable<TData>({
  table,
  loading = false,
  hidePagination = false,
  row,
  className,
}: DataTableProps<TData>) {
  return (
    <Frame className={cn("w-full", className)}>
      <Table className="table-fixed">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    {...(typeof header.column.columnDef.meta?.header !== "undefined"
                      ? header.column.columnDef.meta.header(header)
                      : {})}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {!loading ? (
            table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((_row) => (
                <TableRow
                  data-state={_row.getIsSelected() && "selected"}
                  key={_row.id}
                  {...(typeof row !== "undefined" ? row(_row) : {})}
                >
                  {_row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      {...(typeof cell.column.columnDef.meta?.cell !== "undefined"
                        ? cell.column.columnDef.meta.cell(cell)
                        : {})}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="in-data-[slot=frame]:hover:bg-white">
                <TableCell colSpan={table.getAllColumns().length}>
                  <Empty className="w-full">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <RiInbox2Line />
                      </EmptyMedia>
                      <EmptyTitle>No results found</EmptyTitle>
                      <EmptyDescription>We couldn't find any results for your search.</EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            )
          ) : (
            <TableRow className="in-data-[slot=frame]:hover:bg-white">
              <TableCell colSpan={table.getAllColumns().length}>
                <Empty className="w-full">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Spinner />
                    </EmptyMedia>
                    <EmptyTitle>Processing your request</EmptyTitle>
                    <EmptyDescription>
                      Please wait while we process your request. Do not refresh the page.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {!hidePagination ? (
        <FrameFooter className="p-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <p className="text-sm text-muted-foreground">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount().toLocaleString()}
              </p>
            </div>

            <Pagination className="justify-end">
              <PaginationContent>
                <PaginationItem>
                  <Button
                    disabled={!table.getCanPreviousPage()}
                    onClick={() => table.previousPage()}
                    size="sm"
                    variant="outline"
                    aria-label="Previous Page"
                  >
                    Previous
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <Button
                    disabled={!table.getCanNextPage()}
                    onClick={() => table.nextPage()}
                    size="sm"
                    variant="outline"
                    aria-label="Next Page"
                  >
                    Next
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </FrameFooter>
      ) : null}
    </Frame>
  );
}
