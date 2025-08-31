import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    currentUser: null,
    error: null,
    loading: null,
    timestamp: null
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        signInStart: (state) => {
            state.loading = true;
        },
        signInSuccess: (state, action) => {
            state.currentUser = action.payload;
            state.loading = false;
            state.error = false;
            state.timestamp = Date.now();
        },
        signInFailure: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        signOutSuccess: (state) => {
            state.currentUser = null;
            state.loading = false;
            state.error = null;
            state.timestamp = null;
        },
        checkExpiration: (state) => {
            const now = Date.now();
            const nintyDays = 80 * 24 * 60 * 60 * 1000;
            if (state.timestamp && now - state.timestamp > nintyDays) {
                state.currentUser = null;
                state.error = "Session expired";
                state.timestamp = null;
            }
        }
    }
});

export const { signInStart, signInSuccess, signInFailure, signOutSuccess, checkExpiration } = userSlice.actions;

export default userSlice.reducer;