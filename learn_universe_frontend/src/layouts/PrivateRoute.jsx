import {useEffect} from "react";
import {Navigate} from "react-router-dom";
import {useAuthStore} from "../store/auths.js";

export const PrivateRoute = ({children}) => {
    const loggedIn = useAuthStore((state) => state.isLoggedIn)();

    return loggedIn ? <>{children}</> : <Navigate to="/login/" />;
};

