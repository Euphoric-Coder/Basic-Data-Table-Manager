"use client";

import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import tableReducer from "@/features/table/tableSlice";
import prefsReducer from "@/features/prefs/prefsSlice";

const rootReducer = combineReducers({
  table: tableReducer,
  prefs: prefsReducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["prefs", "table"], // persist both: column visibility, added fields, data edits
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefault) => getDefault({ serializableCheck: false }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
