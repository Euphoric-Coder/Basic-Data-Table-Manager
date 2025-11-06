"use client";

import { createSlice, nanoid, PayloadAction } from "@reduxjs/toolkit";
import type { ColumnDef, RowData, SortState } from "@/types";

const defaultColumns: ColumnDef[] = [
  { key: "name", label: "Name", type: "text", visible: true, order: 0 },
  { key: "email", label: "Email", type: "email", visible: true, order: 1 },
  { key: "age", label: "Age", type: "number", visible: true, order: 2 },
  { key: "role", label: "Role", type: "text", visible: true, order: 3 },
];

const seedRows: RowData[] = [
  {
    id: nanoid(),
    name: "Ada Lovelace",
    email: "ada@algo.dev",
    age: 28,
    role: "Engineer",
    department: "R&D",
  },
  {
    id: nanoid(),
    name: "Alan Turing",
    email: "alan@logic.ai",
    age: 31,
    role: "Scientist",
    department: "Research",
  },
  {
    id: nanoid(),
    name: "Grace Hopper",
    email: "grace@navy.mil",
    age: 35,
    role: "Admiral",
    department: "Navy",
  },
  {
    id: nanoid(),
    name: "Linus Torvalds",
    email: "linus@kernel.org",
    age: 30,
    role: "Maintainer",
    department: "OpenSource",
  },
];

interface TableState {
  columns: ColumnDef[];
  rows: RowData[];
  sort: SortState;
  page: number;
  rowsPerPage: number;
  editing: Record<string, Partial<RowData>>; // temp edits by rowId
  isEditing: boolean; // global "Save All / Cancel All"
}

const initialState: TableState = {
  columns: defaultColumns,
  rows: seedRows,
  sort: { orderBy: null, direction: "asc" },
  page: 0,
  rowsPerPage: 10,
  editing: {},
  isEditing: false,
};

const tableSlice = createSlice({
  name: "table",
  initialState,
  reducers: {
    // columns
    toggleColumnVisibility(
      state,
      action: PayloadAction<{ key: string; visible: boolean }>
    ) {
      const col = state.columns.find((c) => c.key === action.payload.key);
      if (col) col.visible = action.payload.visible;
    },
    addColumn(
      state,
      action: PayloadAction<
        Omit<ColumnDef, "order" | "visible"> & { visible?: boolean }
      >
    ) {
      if (state.columns.some((c) => c.key === action.payload.key)) return;
      const order = state.columns.length
        ? Math.max(...state.columns.map((c) => c.order)) + 1
        : 0;
      state.columns.push({
        order,
        visible: action.payload.visible ?? true,
        ...action.payload,
      });
      // add field to existing rows as empty string
      state.rows = state.rows.map((r) => ({ ...r, [action.payload.key]: "" }));
    },
    reorderColumns(
      state,
      action: PayloadAction<{ key: string; newOrder: number }>
    ) {
      const moving = state.columns.find((c) => c.key === action.payload.key);
      if (!moving) return;
      moving.order = action.payload.newOrder;
      // normalize orders (0..n-1)
      state.columns = state.columns
        .sort((a, b) => a.order - b.order)
        .map((c, idx) => ({ ...c, order: idx }));
    },

    // rows
    addRow(state) {
      const row: RowData = { id: nanoid() };
      state.columns.forEach((c) => {
        if (c.key !== "id") (row as any)[c.key] = c.type === "number" ? 0 : "";
      });
      state.rows.unshift(row);
    },
    deleteRow(state, action: PayloadAction<string>) {
      delete state.editing[action.payload];
      state.rows = state.rows.filter((r) => r.id !== action.payload);
    },

    // sorting & pagination
    setSort(state, action: PayloadAction<{ orderBy: string }>) {
      const { orderBy } = action.payload;
      if (state.sort.orderBy === orderBy) {
        state.sort.direction = state.sort.direction === "asc" ? "desc" : "asc";
      } else {
        state.sort.orderBy = orderBy;
        state.sort.direction = "asc";
      }
      state.page = 0;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    setRowsPerPage(state, action: PayloadAction<number>) {
      state.rowsPerPage = action.payload;
      state.page = 0;
    },

    // inline editing
    startEditing(state) {
      state.isEditing = true;
      state.editing = {};
    },
    stopEditing(state) {
      state.isEditing = false;
      state.editing = {};
    },
    editCell(
      state,
      action: PayloadAction<{
        rowId: string;
        key: string;
        value: string | number;
      }>
    ) {
      const { rowId, key, value } = action.payload;
      if (!state.editing[rowId]) state.editing[rowId] = {};
      state.editing[rowId][key] = value;
    },
    saveAllEdits(state) {
      for (const [rowId, patch] of Object.entries(state.editing)) {
        const idx = state.rows.findIndex((r) => r.id === rowId);
        if (idx >= 0) {
          // @ts-ignore
          state.rows[idx] = { ...state.rows[idx], ...patch };
        }
      }
      state.isEditing = false;
      state.editing = {};
    },

    // CSV import/export helpers
    replaceAllRows(state, action: PayloadAction<RowData[]>) {
      // @ts-ignore
      state.rows = action.payload.map((r) => ({ id: r.id ?? nanoid(), ...r }));
      state.page = 0;
    },
    setAllColumns(state, action: PayloadAction<ColumnDef[]>) {
      // normalize orders
      const cols = action.payload
        .map((c, i) => ({
          ...c,
          order: c.order ?? i,
          visible: c.visible ?? true,
        }))
        .sort((a, b) => a.order - b.order)
        .map((c, i) => ({ ...c, order: i }));
      state.columns = cols;
    },
  },
});

export const {
  toggleColumnVisibility,
  addColumn,
  reorderColumns,
  addRow,
  deleteRow,
  setSort,
  setPage,
  setRowsPerPage,
  startEditing,
  stopEditing,
  editCell,
  saveAllEdits,
  replaceAllRows,
  setAllColumns,
} = tableSlice.actions;

export default tableSlice.reducer;
