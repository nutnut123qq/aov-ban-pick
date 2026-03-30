import { 
    CourseEntity 
} from "@/modules/types"
import { 
    createSlice, 
    PayloadAction 
} from "@reduxjs/toolkit"

/**
 * The slice for the course.
 */
export interface CourseSlice {
    /** The course id. */
    id: string | null
    /** The course. */
    course: CourseEntity | null
    /** The courses. */
    courses: Array<CourseEntity>
}

/**
 * The initial state of the course slice.
 */
const initialState: CourseSlice = {
    /** The course id. */
    id: null,
    /** The course. */
    course: null,
    /** The courses. */
    courses: [],
}

/**
 * The slice for the course.
 */
export const courseSlice = createSlice(
    {
        /** The name of the slice. */
        name: "course",
        /** The initial state of the slice. */
        initialState,
        /** The reducers of the slice. */
        reducers: {
            /** The action to set the course. */
            setCourse: (
                state, 
                action: PayloadAction<CourseEntity | null>
            ) => {
                state.course = action.payload
            },
            /** The action to set the courses. */
            setCourses: (
                state, 
                action: PayloadAction<Array<CourseEntity>>
            ) => {
                state.courses = action.payload
            },
            /** The action to set the course id. */
            setCourseId: (
                state, 
                action: PayloadAction<string | null>
            ) => {
                state.id = action.payload
            },
        },
    }
)

/**
 * The reducer for the course slice.
 */
export const courseReducer = courseSlice.reducer
export const { 
    setCourse,
    setCourses,
    setCourseId,
} = courseSlice.actions