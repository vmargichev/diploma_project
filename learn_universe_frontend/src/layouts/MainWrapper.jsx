import { useEffect, useState } from 'react';
import {logout, setUser} from '../utils/auth';



export const MainWrapper = ({children}) => {

    const [ loading, setLoading ] = useState(true);
    useEffect(() => {
        const handler = async () => {
            setLoading(true);
            try{
                await setUser();
            }catch (error) {
                console.log("Auth error:", error);
                logout()

            }

            setLoading(false);
        };

        handler();
    }, []);
    return <>{loading ? null : children}</>;
};