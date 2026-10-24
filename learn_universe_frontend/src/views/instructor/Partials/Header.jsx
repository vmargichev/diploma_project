import MediaImage from "../../../components/MediaImage.jsx";
import React, {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {apiInstance} from "../../../utils/axios.js";
import UserData from "../../plugin/UserData.js";
import Cookies from "js-cookie";

function Header() {

    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    const fetchUser = () => {
        apiInstance.get(`user/get-user/${UserData?.user_id}/`, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${Cookies.get("access_token")}`
            }
          }).then((res) => {
          setUser(res.data)
        })

    }

    useEffect(() => {
        fetchUser()
    }, []);

    return (
        <div className="row align-items-center">
            <div className="col-xl-12 col-lg-12 col-md-12 col-12">
                <div className="card px-4 pt-2 pb-4 shadow-sm rounded-3">
                    <div className="d-flex align-items-end justify-content-between">
                        <div className="d-flex align-items-center">
                            <div className="me-2 position-relative d-flex justify-content-end align-items-end mt-n5">
                                <MediaImage kind="avatar" src={user?.image} className="avatar-xl rounded-circle border border-4 border-white" alt="avatar" style={{ width: "70px", height: "70px", borderRadius: "50%", objectFit: "cover" }} />
                            </div>
                            <div className="lh-1">
                                <h2 className="mb-0"> {user?.full_name}</h2>
                                <p className="mb-0 d-block">@{user?.user?.username}</p>
                            </div>
                        </div>
                        <div>
                            <div className="d-flex">
                                <a onClick={() => navigate('/instructor/create-course/')} className="btn btn-primary btn-sm d-none d-md-block ms-2" > Create New Course <i className='fas fa-plus'></i></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Header