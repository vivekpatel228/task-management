import { configureStore, combineReducers } from '@reduxjs/toolkit'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import tasksReducer from './slices/tasks.slice'
import authReducer from './slices/auth.slice'
import uiReducer from './slices/ui.slice'
import settingsReducer from './slices/settings.slice'
import projectsReducer from './slices/projects.slice'
import { PERSIST_KEY } from '@/lib/constants'

const rootReducer = combineReducers({
  tasks: tasksReducer,
  auth: authReducer,
  ui: uiReducer,
  settings: settingsReducer,
  projects: projectsReducer,
})

const persistConfig = {
  key: PERSIST_KEY,
  storage,
  whitelist: ['tasks', 'auth', 'settings', 'projects'],
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)

// RootState derived from rootReducer (not persistedReducer) to omit _persist key
export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = typeof store.dispatch
