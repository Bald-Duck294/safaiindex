// // src/store/store.js
// import { configureStore } from '@reduxjs/toolkit';
// import authReducer from './slices/authSlice';
// import { configurationApi } from './slices/configurationApi';
// import { reviewApi } from './slices/reviewSlice';
// // import { shiftApi } from "./slices/shiftApi.js"
// import { shiftApi } from "./slices/shiftApi.js"

// export const store = configureStore({
//   reducer: {
//     auth: authReducer,
//     [configurationApi.reducerPath]: configurationApi.reducer,
//     [reviewApi.reducerPath]: reviewApi.reducer,
//     [shiftApi.reducerPath]: shiftApi.reducer
//   },

//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware().concat(
//       configurationApi.middleware,
//       reviewApi.middleware,
//       shiftApi.middleware
//     ),
// });

// // ✅ Export types for TypeScript (optional, but good practice)
// // export type RootState = ReturnType<typeof store.getState>;
// // export type AppDispatch = typeof store.dispatch;


// src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // uses localStorage
import authReducer from './slices/authSlice';
import { configurationApi } from './slices/configurationApi';
import { reviewApi } from './slices/reviewSlice';
import { shiftApi } from "./slices/shiftApi.js";
import { notificationApi } from './slices/notificationApi';
import notificationReducer from './slices/notificationSlice';
// ✅ Persist config for auth only
const persistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'token', 'isAuthenticated'], // only persist these fields
};

// ✅ Wrap auth reducer with persistReducer
const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    notifications: notificationReducer,
    [configurationApi.reducerPath]: configurationApi.reducer,
    [reviewApi.reducerPath]: reviewApi.reducer,
    [shiftApi.reducerPath]: shiftApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // ✅ Ignore redux-persist actions
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(
      configurationApi.middleware,
      reviewApi.middleware,
      shiftApi.middleware,
      notificationApi.middleware
    ),
});

// ✅ Create persistor
export const persistor = persistStore(store);
