export type ColumnType = "text" | "number" | "email" | "select";

export interface ColumnDef {
  key: string; // e.g. "name", "email"
  label: string; // UI label
  type: ColumnType; // for validation / editors
  visible: boolean; // toggled via Manage Columns
  order: number; // for reordering
  options?: string[]; // if type === 'select'
}

export interface RowData {
  id: string;
  // dynamic index signature: all additional fields are strings | number
  [key: string]: string | number;
}

export interface SortState {
  orderBy: string | null;
  direction: "asc" | "desc";
}
