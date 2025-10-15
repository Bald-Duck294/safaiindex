// src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import { configurationApi } from './slices/configurationApi'; 
import { reviewApi } from './slices/reviewSlice'; 

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [configurationApi.reducerPath]: configurationApi.reducer,
    [reviewApi.reducerPath]: reviewApi.reducer, 
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      configurationApi.middleware,
      reviewApi.middleware
    ),
});

// ✅ Export types for TypeScript (optional, but good practice)
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
