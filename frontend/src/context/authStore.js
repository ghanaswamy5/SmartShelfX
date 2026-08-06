import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api/client';

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,

            login: async (username, password) => {
                set({ isLoading: true });
                try {
                    const response = await authApi.login({ username, password });
                    const { token, ...user } = response.data;
                    localStorage.setItem('token', token);
                    set({
                        user,
                        token,
                        isAuthenticated: true,
                        isLoading: false
                    });
                    return { success: true };
                } catch (error) {
                    set({ isLoading: false });
                    return {
                        success: false,
                        error: error.response?.data?.error || 'Login failed'
                    };
                }
            },

            register: async (userData) => {
                set({ isLoading: true });
                try {
                    const response = await authApi.register(userData);
                    const { token, ...user } = response.data;
                    localStorage.setItem('token', token);
                    set({
                        user,
                        token,
                        isAuthenticated: true,
                        isLoading: false
                    });
                    return { success: true };
                } catch (error) {
                    set({ isLoading: false });
                    return {
                        success: false,
                        error: error.response?.data?.error || 'Registration failed'
                    };
                }
            },

            logout: () => {
                localStorage.removeItem('token');
                set({ user: null, token: null, isAuthenticated: false });
            },

            updateUser: (userData) => {
                set((state) => ({
                    user: { ...state.user, ...userData }
                }));
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);

export default useAuthStore;