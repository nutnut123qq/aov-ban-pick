import { createSlice, PayloadAction } from "@reduxjs/toolkit"

/**
 * The tabs for the authentication modal.
 */
export enum AuthenticationModalTab {
    SignIn = "signIn",
    SignUp = "signUp",
}

/**
 * The tabs for the learn page.
 */
export enum LearnTab {
    LessonVideos = "lessonVideos",
    Foundations = "foundations",
    Challenges = "challenges",
    TopAchievers = "topAchievers",
}

/**
 * The slice for the authentication modal.
 */
export interface TabsSlice {
    authenticationModalTab: AuthenticationModalTab
    learnTab: LearnTab
}

/**
 * The initial state of the authentication modal slice.
 */
const initialState: TabsSlice = {
    authenticationModalTab: AuthenticationModalTab.SignIn,
    learnTab: LearnTab.LessonVideos,
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
            state.authenticationModalTab = action.payload
        },
        resetAuthenticationModalTab: (state) => {
            state.authenticationModalTab = AuthenticationModalTab.SignIn
        },
        setLearnTab: (
            state,
            action: PayloadAction<LearnTab>
        ) => {
            state.learnTab = action.payload
        },
        resetLearnTab: (state) => {
            state.learnTab = LearnTab.LessonVideos
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
    setLearnTab,
    resetLearnTab,
} = tabsSlice.actions