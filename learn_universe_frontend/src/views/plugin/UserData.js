import Cookie from "js-cookie";
import jwt_decode from "jwt-decode";

function UserData() {
    let access_token = Cookie.get("access_token")
    let refresh_token = Cookie.get("refresh_token")

    if (access_token && refresh_token) {
        return jwt_decode(refresh_token)
    } else {
    //pass
    }
}
export default UserData();
