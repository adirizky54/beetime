import type { Cell, Header } from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    header?: (props: Header<TData, TValue>) => React.ComponentProps<"th">;
    cell?: (props: Cell<TData, TValue>) => React.ComponentProps<"td">;
  }
}
