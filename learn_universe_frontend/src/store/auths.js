import { create } from "zustand";
import { mountStoreDevtool } from "simple-zustand-devtools";

const useAuthStore = create((set, get) => ({
    userData: null,
    loading: false,

    user: () => ({
    user_id: get().userData.user_id || null,
    username: get().userData.username || null,
}),
    setUser: (user) =>
        set({
           userData: user,
           }),
        setLoading: (loading) => set({ loading }),

    isLoggedIn: () => get().userData !== null,
}));

if (import.meta.env.DEV) {
    mountStoreDevtool("Store", useAuthStore);

}
export { useAuthStore };