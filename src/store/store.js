// // src/store/store.js

// import { configureStore } from '@reduxjs/toolkit';
// import authReducer from './slices/authSlice'; // Import the reducer from your slice

// export const makeStore = () => {
//   return configureStore({
//     reducer: {
//       // Add your reducers here
//       auth: authReducer,
//       // You can add more slices here, e.g., locations: locationsReducer
//     },
//   });
// };

// src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});
