"use client";

import { Button, Stack, TextField, Tooltip, IconButton } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import SettingsIcon from "@mui/icons-material/Settings";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import AddIcon from "@mui/icons-material/Add";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setSearch,
  setManageColumnsOpen,
  toggleTheme,
} from "@/features/prefs/prefsSlice";
import { exportCsv, parseCsv } from "@/lib/csv";
import {
  replaceAllRows,
  setAllColumns,
  addRow,
} from "@/features/table/tableSlice";
import React from "react";

export default function TopBar() {
  const dispatch = useAppDispatch();
  const search = useAppSelector((s) => s.prefs.globalSearch);
  const themeMode = useAppSelector((s) => s.prefs.themeMode);
  const columns = useAppSelector((s) => s.table.columns);
  const rows = useAppSelector((s) => s.table.rows);
  const visibleCols = [...columns]
    .filter((c) => c.visible)
    .sort((a, b) => a.order - b.order);

  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const { columns: cols, rows: rs } = parseCsv(text);
      dispatch(setAllColumns(cols));
      dispatch(replaceAllRows(rs));
    } catch (err: any) {
      alert(`CSV Import Error: ${err.message ?? String(err)}`);
    } finally {
      e.target.value = "";
    }
  };

  const onExport = () => {
    exportCsv(visibleCols, rows);
  };

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1.5}
      alignItems="center"
      justifyContent="space-between"
    >
      <TextField
        size="small"
        label="Global search"
        value={search}
        onChange={(e) => dispatch(setSearch(e.target.value))}
        sx={{ minWidth: 260, flex: 1 }}
      />
      <Stack direction="row" spacing={1}>
        <Button
          startIcon={<AddIcon />}
          variant="outlined"
          onClick={() => dispatch(addRow())}
        >
          Add Row
        </Button>
        <input
          id="csvInput"
          type="file"
          accept=".csv,text/csv"
          hidden
          onChange={onImport}
        />
        <Tooltip title="Import CSV">
          <label htmlFor="csvInput">
            <IconButton component="span">
              <UploadFileIcon />
            </IconButton>
          </label>
        </Tooltip>
        <Tooltip title="Export visible columns">
          <span>
            <IconButton onClick={onExport}>
              <DownloadIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Manage Columns">
          <IconButton onClick={() => dispatch(setManageColumnsOpen(true))}>
            <SettingsIcon />
          </IconButton>
        </Tooltip>
        <Tooltip
          title={themeMode === "light" ? "Switch to dark" : "Switch to light"}
        >
          <IconButton onClick={() => dispatch(toggleTheme())}>
            {themeMode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
        </Tooltip>
      </Stack>
    </Stack>
  );
}
