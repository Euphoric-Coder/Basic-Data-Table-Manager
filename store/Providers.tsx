"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import React from "react";
import { persistor, store, useAppSelector } from "./store";

function Themed({ children }: { children: React.ReactNode }) {
  const mode = useAppSelector((s) => s.prefs.themeMode);
  const theme = React.useMemo(() => createTheme({ palette: { mode } }), [mode]);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor} loading={null}>
        <Themed>{children}</Themed>
      </PersistGate>
    </Provider>
  );
}
