import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const userToken = localStorage.getItem('userToken') ? localStorage.getItem('userToken') : null;
const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const login = createAsyncThunk('auth/login', async (credentials, thunkAPI) => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, credentials);
        localStorage.setItem('userToken', response.data.token);
        localStorage.setItem('userInfo', JSON.stringify(response.data));
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data.message || error.message);
    }
});

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        userInfo,
        userToken,
        loading: false,
        error: null,
    },
    reducers: {
        logout: (state) => {
            localStorage.removeItem('userToken');
            localStorage.removeItem('userInfo');
            state.userInfo = null;
            state.userToken = null;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(login.pending, (state) => { state.loading = true; state.error = null; })
               .addCase(login.fulfilled, (state, action) => { state.loading = false; state.userInfo = action.payload; state.userToken = action.payload.token; })
               .addCase(login.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
    }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
