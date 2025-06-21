import {useState, useEffect} from "react";

function useCurrentAddress () {
    const [address, setAddress] = useState("")

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            pos => {
            const {latitude, longitude} = pos.coords;
            const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;

            fetch(url)
              .then(res => res.json())
              .then(data => setAddress(data.address))
              .catch(error => console.error('Error fetching address:', error));
        },
            error => {
                console.log("Geo", error)
            })
    }, []);

    return address|| "Bulgaria"
}

export default useCurrentAddress