import { createSlice, PayloadAction } from "@reduxjs/toolkit"

/**
 * The tabs for the authentication modal.
 */
export enum AuthenticationModalTab {
    SignIn = "signIn",
    SignUp = "signUp",
}

/**
 * The slice for the authentication modal.
 */
export interface AuthenticationModalSlice {
    tab: AuthenticationModalTab
}

/**
 * The initial state of the authentication modal slice.
 */
const initialState: AuthenticationModalSlice = {
    tab: AuthenticationModalTab.SignIn,
}

/**
 * The slice for the tabs.
 */
export const tabsSlice = createSlice({
    name: "tabs",
    initialState,
    reducers: {
        setAuthenticationModalTab: (
            state,
            action: PayloadAction<AuthenticationModalTab>
        ) => {
            state.tab = action.payload
        },
        resetAuthenticationModalTab: (state) => {
            state.tab = AuthenticationModalTab.SignIn
        },
    },
})

/**
 * The reducer for the tabs.
 */
export const tabsReducer = tabsSlice.reducer

/**
 * The actions for the tabs.
 */
export const {
    setAuthenticationModalTab,
    resetAuthenticationModalTab,
} = tabsSlice.actions
