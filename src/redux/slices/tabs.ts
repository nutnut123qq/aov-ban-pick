import { createSlice, PayloadAction } from "@reduxjs/toolkit"

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
 * The slice for the tabs.
 */
export interface TabsSlice {
    learnTab: LearnTab
}

/**
 * The initial state of the tabs slice.
 */
const initialState: TabsSlice = {
    learnTab: LearnTab.LessonVideos,
}

/**
 * The slice for the tabs.
 */
export const tabsSlice = createSlice({
    name: "tabs",
    initialState,
    reducers: {
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
    setLearnTab,
    resetLearnTab,
} = tabsSlice.actions
