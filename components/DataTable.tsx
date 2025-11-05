"use client";

import * as React from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  IconButton,
  TextField,
  Stack,
  Button,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import type { ColumnDef, RowData } from "@/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  deleteRow,
  editCell,
  saveAllEdits,
  setPage,
  setRowsPerPage,
  setSort,
  startEditing,
  stopEditing,
} from "@/features/table/tableSlice";

function applySearch(rows: RowData[], q: string) {
  const needle = q.trim().toLowerCase();
  if (!needle) return rows;
  return rows.filter((r) =>
    Object.values(r).some((v) =>
      String(v ?? "")
        .toLowerCase()
        .includes(needle)
    )
  );
}
function applySort(
  rows: RowData[],
  columns: ColumnDef[],
  orderBy: string | null,
  direction: "asc" | "desc"
) {
  if (!orderBy) return rows;
  const col = columns.find((c) => c.key === orderBy);
  if (!col) return rows;
  const sorted = [...rows].sort((a, b) => {
    const A = a[orderBy];
    const B = b[orderBy];
    if (A === B) return 0;
    if (A == null) return -1;
    if (B == null) return 1;
    if (typeof A === "number" && typeof B === "number") return A - B;
    return String(A).localeCompare(String(B));
  });
  return direction === "asc" ? sorted : sorted.reverse();
}

export default function DataTable() {
  const dispatch = useAppDispatch();
  const { rows, columns, sort, page, rowsPerPage, editing, isEditing } =
    useAppSelector((s) => s.table);
  const search = useAppSelector((s) => s.prefs.globalSearch);

  const visibleCols = React.useMemo(
    () =>
      [...columns].filter((c) => c.visible).sort((a, b) => a.order - b.order),
    [columns]
  );

  const filtered = React.useMemo(
    () => applySearch(rows, search),
    [rows, search]
  );
  const sorted = React.useMemo(
    () => applySort(filtered, columns, sort.orderBy, sort.direction),
    [filtered, columns, sort]
  );
  const paged = React.useMemo(
    () => sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [sorted, page, rowsPerPage]
  );

  const [confirm, setConfirm] = React.useState<{
    open: boolean;
    rowId?: string;
  }>({ open: false });

  const handleChangePage = (_: any, newPage: number) =>
    dispatch(setPage(newPage));
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setRowsPerPage(parseInt(e.target.value, 10)));
  };

  const onCellEdit = (rowId: string, key: string, value: string) => {
    const col = columns.find((c) => c.key === key);
    if (!col) return;
    let v: string | number = value;
    if (col.type === "number") {
      const n = Number(value);
      if (!Number.isFinite(n)) return; // basic validation
      v = n;
    }
    dispatch(editCell({ rowId, key, value: v }));
  };

  const renderCell = (row: RowData, col: ColumnDef) => {
    const ed = editing[row.id]?.[col.key];
    const current = ed ?? row[col.key] ?? (col.type === "number" ? 0 : "");
    if (isEditing) {
      return (
        <TextField
          size="small"
          type={
            col.type === "number"
              ? "number"
              : col.type === "email"
              ? "email"
              : "text"
          }
          value={String(current)}
          onChange={(e) => onCellEdit(row.id, col.key, e.target.value)}
          sx={{ minWidth: 120 }}
          inputProps={{ "aria-label": `${col.label} input` }}
        />
      );
    }
    return <>{String(current)}</>;
  };

  return (
    <Box>
      <Stack
        direction="row"
        spacing={1}
        justifyContent="flex-end"
        sx={{ mb: 1 }}
      >
        {!isEditing ? (
          <Button
            startIcon={<EditIcon />}
            variant="outlined"
            onClick={() => dispatch(startEditing())}
          >
            Inline Edit
          </Button>
        ) : (
          <>
            <Button
              startIcon={<SaveIcon />}
              variant="contained"
              onClick={() => dispatch(saveAllEdits())}
            >
              Save All
            </Button>
            <Button
              startIcon={<CloseIcon />}
              variant="text"
              onClick={() => dispatch(stopEditing())}
            >
              Cancel All
            </Button>
          </>
        )}
      </Stack>

      <TableContainer>
        <Table size="small" aria-label="dynamic data table">
          <TableHead>
            <TableRow>
              {visibleCols.map((col) => (
                <TableCell
                  key={col.key}
                  sortDirection={
                    sort.orderBy === col.key ? sort.direction : false
                  }
                >
                  <TableSortLabel
                    active={sort.orderBy === col.key}
                    direction={
                      sort.orderBy === col.key ? sort.direction : "asc"
                    }
                    onClick={() => dispatch(setSort({ orderBy: col.key }))}
                  >
                    {col.label}
                  </TableSortLabel>
                </TableCell>
              ))}
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paged.map((row) => (
              <TableRow key={row.id} hover>
                {visibleCols.map((col) => (
                  <TableCell key={`${row.id}-${col.key}`}>
                    {renderCell(row, col)}
                  </TableCell>
                ))}
                <TableCell align="right">
                  <Tooltip title="Delete row">
                    <span>
                      <IconButton
                        color="error"
                        onClick={() =>
                          setConfirm({ open: true, rowId: row.id })
                        }
                        aria-label="delete"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}

            {paged.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={visibleCols.length + 1}
                  align="center"
                  sx={{ py: 6, color: "text.secondary" }}
                >
                  No rows to display
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        rowsPerPageOptions={[5, 10, 25, 50]}
        count={sorted.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <Dialog open={confirm.open} onClose={() => setConfirm({ open: false })}>
        <DialogTitle>Delete row?</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this row? This action cannot be
          undone.
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirm({ open: false })}
            startIcon={<CloseIcon />}
          >
            Cancel
          </Button>
          <Button
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => {
              if (confirm.rowId) dispatch(deleteRow(confirm.rowId));
              setConfirm({ open: false });
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
