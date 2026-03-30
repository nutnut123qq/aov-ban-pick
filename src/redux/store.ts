import { configureStore } from "@reduxjs/toolkit"
import { 
    tabsReducer,
    courseReducer,
    userReducer,
} from "./slices"

export const store = configureStore({
    reducer: {
        tabs: tabsReducer,
        course: courseReducer,
        user: userReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false,
    }),
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
