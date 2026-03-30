import { 
    UserEntity 
} from "@/modules/types"
import { 
    createSlice, 
    PayloadAction 
} from "@reduxjs/toolkit"

/**
 * The slice for the user.
 */
export interface UserSlice {
    /** The user. */
    user: UserEntity | null
    /** Whether the user is authenticated. */
    authenticated: boolean
}

/**
 * The initial state of the user slice.
 */
const initialState: UserSlice = {
    /** The user. */
    user: null,
    /** Whether the user is authenticated. */
    authenticated: false,
}

/**
 * The slice for the user.
 */
export const userSlice = createSlice(
    {
        /** The name of the slice. */
        name: "user",
        /** The initial state of the slice. */
        initialState,
        /** The reducers of the slice. */
        reducers: {
            /** The action to set the user. */
            setUser: (
                state, 
                action: PayloadAction<UserEntity | null>
            ) => {
                state.user = action.payload
            },
            /** The action to set the authenticated state. */
            setAuthenticated: (
                state, 
                action: PayloadAction<boolean>
            ) => {
                state.authenticated = action.payload
            },
        },
    },
)

/**
 * The reducer for the user slice.
 */
export const userReducer = userSlice.reducer
export const { 
    setUser,
    setAuthenticated,
} = userSlice.actions