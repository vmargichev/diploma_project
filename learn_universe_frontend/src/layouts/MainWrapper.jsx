import { useEffect, useState } from 'react';
import {logout, setUser} from '../utils/auth';
import { useNavigate } from "react-router-dom";


export const MainWrapper = ({children}) => {
    const navigate = useNavigate();
    const [ loading, setLoading ] = useState(true);
    useEffect(() => {
        const handler = async () => {
            setLoading(true);
            try{
                await setUser();
            }catch (error) {
                console.log("Auth error:", error);
                logout()
                navigate("/login/")
            }

            setLoading(false);
        };

        handler();
    }, []);
    return <>{loading ? null : children}</>;
};