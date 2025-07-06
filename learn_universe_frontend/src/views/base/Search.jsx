import React, {useContext, useEffect, useState} from "react";
import BaseHeader from '../partials/BaseHeader'
import BaseFooter from '../partials/BaseFooter'
import Rater from 'react-rater';
import "react-rater/lib/react-rater.css"
import {Link, useNavigate} from 'react-router-dom'
import {apiInstance} from "../../utils/axios.js";
import StarRatings from "react-star-ratings/build/star-ratings.js";
import Swal from "sweetalert2";
import {useAuthStore} from "../../store/auths.js";
import {CartContext} from "../plugin/Context.js";
import useCurrentAddress from "../plugin/UserCountry.js";
import UserData from "../plugin/UserData.js";

function Search() {

  const [courses, setCourses] = useState([]);
  const country = useCurrentAddress().country;
  const userId = UserData.user_id;
  const cartId = localStorage.getItem("cartId");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useContext(CartContext);
  const { isLoggedIn, token } = useAuthStore.getState();
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCourse = async () => {
    try {
      const response = await apiInstance.get('course/course-list');
      setCourses(response.data);
      setIsLoading(false);
    } catch (e) {
      console.error("Error fetching courses:", e);
      setIsLoading(false);
    }
  };

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
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase()
    setSearchQuery(query);

    if (query === ""){
      fetchCourse();
    } else {
      const course = courses.filter((course) => {
        return course.title.toLowerCase().includes(query);
      })
      setCourses(course);
    }
    }
    useEffect(() => {
    fetchCourse();
  }, []);

  return (
    <>
      <BaseHeader />

      <section className="mb-5" style={{ marginTop: "100px" }}>
        <div className="container mb-lg-8 ">
          <div className="row mb-5 mt-3">
            {/* col */}
            <div className="col-12">
              <div className="mb-6">
                <h2 className="mb-1 h1">
                  Showing Results for "{searchQuery}"
                </h2>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-6">
                <input
                  type="text"
                  className="form-control lg mt-3"
                  placeholder="Search Courses..."
                  name=""
                  id=""
                  onChange={(e) => handleSearch(e)}
                />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
                {courses?.map((c, index) => (
                    <div className="col" key={c.id}>
                      {/* Card */}
                      <div className="card card-hover">
                        <Link to={`/course-detail/${c.slug}/`}>
                          <img
                              src={c.image}
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
                              <span className="badge bg-info">{c.level}</span>
                              <span className="badge bg-info ms-2">{c.language}</span>
                            </div>

                            <a href="#" className="fs-5">
                              <i className="fas fa-heart text-danger align-middle"/>
                            </a>
                          </div>
                          <h4 className="mb-2 text-truncate-line-2 ">
                            <Link
                                to={`/course-detail/slug/`}
                                className="text-inherit text-decoration-none text-dark fs-5"
                            >
                              {c.title}
                            </Link>
                          </h4>
                          <small>By: {c.teacher.full_name}</small> <br/>
                          <small>{c.students?.length} Students</small> <br/>
                          <div className="lh-1 mt-3 d-flex">
                            <span className="align-text-top">
                              <span className="fs-6">
                                <Rater total={5} rating={c.average_rating || 0}/>

                                {/*<StarRatings rating={c.average_rating || 0} numberOfStars={5} starDimension={"15px"} />*/}
                              </span>
                            </span>
                            <span className="text-warning ms-2">{c.average_rating || 0}</span>
                            <span className="fs-6 ms-2">({c.reviews?.length} Reviews)</span>
                          </div>
                        </div>
                        {/* Card Footer */}
                        <div className="card-footer">
                          <div className="row align-items-center g-0">
                            <div className="col">
                              <h5 className="mb-0">€{c.price}</h5>
                            </div>
                            <div className="col-auto">
                              <button
                                  type="button"
                                  onClick={() => addToCart(
                                      c.id,
                                      userId,
                                      country || "Bulgaria",
                                  )}
                                  className="text-inherit text-decoration-none btn btn-primary me-2"
                              >
                                <i className="fas fa-shopping-cart text-primary text-white"/>
                              </button>
                              <Link
                                  to={""}
                                  className="text-inherit text-decoration-none btn btn-primary"
                              >
                                Enroll Now{" "}
                                <i className="fas fa-arrow-right text-primary align-middle me-2 text-white"/>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                ))}

              </div>

              <nav className="d-flex mt-5">
                <ul className="pagination">
                  <li className="">
                    <button className="page-link me-1">
                      <i className="ci-arrow-left me-2"/>
                      Previous
                    </button>
                  </li>
                </ul>
                <ul className="pagination">
                  <li key={1} className="active">
                    <button className="page-link">1</button>
                  </li>
                </ul>
                <ul className="pagination">
                  <li className={`totalPages`}>
                    <button className="page-link ms-1">
                      Next
                      <i className="ci-arrow-right ms-3"/>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </section>

      <BaseFooter/>
    </>
  );
}

export default Search;
