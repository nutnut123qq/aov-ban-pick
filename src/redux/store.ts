import { configureStore } from "@reduxjs/toolkit"

// Chưa có slice nào — reducer {} rỗng làm combineReducers ném
// "Store does not have a valid reducer" trên console. Giữ store hợp lệ
// bằng reducer no-op cho tới khi có slice thật.
const noopReducer = (state: Record<string, never> = {}): Record<string, never> => state

export const store = configureStore({
    reducer: noopReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false,
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppStore = typeof store

