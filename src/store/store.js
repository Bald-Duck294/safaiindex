// src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import { configurationApi } from './slices/configurationApi'; // ✅ Add this import

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [configurationApi.reducerPath]: configurationApi.reducer, // ✅ This was missing the import
  },
  // ✅ Add the middleware - this was completely missing
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      configurationApi.middleware
    ),
});

// ✅ Export types for TypeScript (optional, but good practice)
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
