import { useAuthStore } from "../../store/auths.js";

// A live export keeps existing consumers current after login/logout.
let userData = useAuthStore.getState().userData;
useAuthStore.subscribe((state) => { userData = state.userData; });
export { userData as default };
