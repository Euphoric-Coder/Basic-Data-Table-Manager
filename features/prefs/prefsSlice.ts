"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type Mode = "light" | "dark";

interface PrefsState {
  themeMode: Mode;
  globalSearch: string;
  manageColumnsOpen: boolean;
}

const initialState: PrefsState = {
  themeMode: "light",
  globalSearch: "",
  manageColumnsOpen: false,
};

const prefsSlice = createSlice({
  name: "prefs",
  initialState,
  reducers: {
    toggleTheme(state) {
      state.themeMode = state.themeMode === "light" ? "dark" : "light";
    },
    setSearch(state, action: PayloadAction<string>) {
      state.globalSearch = action.payload;
    },
    setManageColumnsOpen(state, action: PayloadAction<boolean>) {
      state.manageColumnsOpen = action.payload;
    },
  },
});

export const { toggleTheme, setSearch, setManageColumnsOpen } =
  prefsSlice.actions;
export default prefsSlice.reducer;
