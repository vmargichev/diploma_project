import MediaImage from "../../components/MediaImage.jsx";
import React, {useEffect, useRef, useState, useContext} from 'react'
import {Link, useNavigate} from 'react-router-dom'

import BaseHeader from '../partials/BaseHeader'
import BaseFooter from '../partials/BaseFooter'
import Sidebar from './Partials/Sidebar'
import Header from './Partials/Header'

import Cookies from "js-cookie";
import Cookie from "js-cookie";

import {apiInstance} from "../../utils/axios.js";
import {CartContext} from "../plugin/Context.js";
import UserData from "../plugin/UserData.js";
import Rater from "react-rater";
import {useAuthStore} from "../../store/auths.js";
import Swal from "sweetalert2";
import useCurrentAddress from "../plugin/UserCountry.js";




function Wishlist() {
    const [wishlist, setWishlist] = useState([])
    const userId = UserData?.user_id
    const cartId = localStorage.getItem("cartId");
    const country = useCurrentAddress().country;
    const navigate = useNavigate();
    const { isLoggedIn, token } = useAuthStore.getState();
    const [cartCount, setCartCount] = useContext(CartContext);

    const fetchWishlist = async () => {
        try{
            const res = await apiInstance.get(`student/wishlist/${userId}/`)
            setWishlist(res.data)
        } catch (error) {
            console.log(error.data)
        }

    }

    const addToCart = async (courseId, userId, country, cartId) => {
      if (!isLoggedIn()) {
    await Swal.fire({
      icon: 'warning',
      title: 'Authentication Required',
      text: 'Please login to add items to your cart',
      showConfirmButton: true,
      confirmButtonText: 'Go to Login',
      showCancelButton: true,
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        // Redirect to login page
       navigate('/login');
      }
    });
    return null;
  }

  try {

    const formdata = new FormData();

    formdata.append("course", courseId);
    formdata.append("user", userId);
    formdata.append("country", country);
    console.log(country)
    const existingCartId = localStorage.getItem("cartId");
    if (existingCartId) {
      formdata.append("cart_id", existingCartId);
    }

    const response = await apiInstance.post("course/cart", formdata);
    console.log(response?.data?.cart_id || "No Cart ID");

    if (response?.data?.cart_id) {
      localStorage.setItem("cartId", response.data.cart_id);
    }
    apiInstance.get(`course/cart-list/${localStorage.getItem("cartId")}/`).then((res) => {
      setCartCount(res?.data?.length || 0);
    })

    await Swal.fire({
      icon: 'success',
      title: 'Added to cart!',
      showConfirmButton: false,
      timer: 1500
    });

    return response.data;

  } catch (error) {
    let errorMessage = "Failed to add to cart";

    if (error.response) {

      errorMessage = error.response.data?.detail ||
                    error.response.data?.message ||
                    `Server error: ${error.response.status}`;
    } else if (error.request) {// Request was made but no response
      errorMessage = "Network error - please check your connection";
    }


    await Swal.fire({
      icon: "error",
      title: "Error",
      text: errorMessage,
      showConfirmButton: true,
    });

    throw error;
  }
};
    const handleAddDeleteFromWishlist = (courseId) => {
      const formdata = new FormData();
      formdata.append("user_id", userId)
        formdata.append("course_id", courseId)

        apiInstance.post(`student/wishlist/${userId}/`, formdata).then((res) =>
        {
            fetchWishlist()
            Swal.fire({
            toast: true,
            position: "top",
                icon: "success",
              title: res.data.message,
              showConfirmButton: false,
            });

        })
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    return (
      <>
        <BaseHeader />

        <section className="pt-5 pb-5">
          <div className="container">

            <Header />
            <div className="row mt-0 mt-md-4">

              <Sidebar />
              <div className="col-lg-9 col-md-8 col-12">
                <h4 className="mb-0 mb-4">
                  {" "}<a>
                    <i className="fas fa-heart" ></i> Wishlist{" "}
                </a>

                </h4>

                <div className="row">
                  <div className="col-md-12">
                    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
                      <div className="col-lg-4">
                        {wishlist?.map((c, index) => (
                    <div className="col" key={index}>
                      {/* Card */}
                      <div className="card card-hover">
                        <Link to={`/course-detail/${c?.course.slug}/`}>
                          <MediaImage kind="course"
                            src={c?.course.image}
                            alt="course"
                            className="card-img-top"
                            style={{
                              width: "100%",
                              height: "200px",
                              objectFit: "cover",
                            }}
                          />
                        </Link>
                        {/* Card Body */}
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                              <span className="badge bg-info">{c?.course.level}</span>
                              <span className="badge bg-info ms-2">
                                {c?.course.language}
                              </span>
                            </div>

                            <a onClick={() => handleAddDeleteFromWishlist(c?.course?.id)} className="fs-5">
                              <i className="fas fa-heart text-danger align-middle" />
                            </a>
                          </div>
                          <h4 className="mb-2 text-truncate-line-2 ">
                            <Link
                              to={`/course-detail/slug/`}
                              className="text-inherit text-decoration-none text-dark fs-5"
                            >
                              {c?.course.title}
                            </Link>
                          </h4>
                          <small>By: {c?.course?.teacher?.full_name}</small> <br />
                          <small>{c?.course?.students?.length} Students</small> <br />
                          <div className="lh-1 mt-3 d-flex">
                            <span className="align-text-top">
                              <span className="fs-6">
                                <Rater
                                  total={5}
                                  rating={c?.course?.average_rating || 0}
                                />

                                {/*<StarRatings rating={c.average_rating || 0} numberOfStars={5} starDimension={"15px"} />*/}
                              </span>
                            </span>
                            <span className="text-warning ms-2">
                              {c?.course?.average_rating || 0}
                            </span>
                            <span className="fs-6 ms-2">
                              ({c?.course?.reviews?.length} Reviews)
                            </span>
                          </div>
                        </div>
                        {/* Card Footer */}
                        <div className="card-footer">
                          <div className="row align-items-center g-0">
                            <div className="col">
                              <h5 className="mb-0">€{c?.course?.price}</h5>
                            </div>
                            <div className="col-auto">
                              <button
                                type="button"
                                onClick={() =>
                                  addToCart(c?.course.id, userId, country || "Bulgaria")
                                }
                                className="text-inherit text-decoration-none btn btn-primary me-2"
                              >
                                <i className="fas fa-shopping-cart text-primary text-white" />
                              </button>
                              <Link
                                to={""}
                                className="text-inherit text-decoration-none btn btn-primary"
                              >
                                Enroll Now{" "}
                                <i className="fas fa-arrow-right text-primary align-middle me-2 text-white" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <BaseFooter />
      </>
    );
}

export default Wishlist