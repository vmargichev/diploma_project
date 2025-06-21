import React, {useState, useEffect, useContext} from 'react'
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

function Index() {

  const [courses, setCourses] = useState([]);
  const country = useCurrentAddress().country;
  const userId = UserData.user_id;
  const cartId = localStorage.getItem("cartId");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useContext(CartContext);
  const { isLoggedIn, token } = useAuthStore.getState();

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

  useEffect(() => {
    fetchCourse();
  }, []);

  console.log(courses)

    return (
      <>
        <BaseHeader />

        <section className="py-lg-8 py-5">
          {/* container */}
          <div className="container my-lg-8">
            {/* row */}
            <div className="row align-items-center">
              {/* col */}
              <div className="col-lg-6 mb-6 mb-lg-0">
                <div>
                  {/* heading */}
                  <h1 className="display-3 fw-bold mb-3">
                    Grow your skills and advance career
                  </h1>
                  {/* para */}
                  <p className="pe-lg-10 mb-5">
                    Whether you're just starting out or looking to advance, our platform helps you take the next step in your programming journey.
                  </p>
                  {/* btn */}
                  <a
                    href="#"
                    className="btn btn-primary fs-4 text-inherit ms-3"
                  >
                    Join Free Now <i className="fas fa-plus"></i>
                  </a>
                  <a
                    href="https://www.youtube.com/watch?v=Nfzi7034Kbg"
                    className="btn btn-outline-success fs-4 text-inherit ms-3"
                  >
                    Watch Demo <i className="fas fa-video"></i>
                  </a>
                </div>
              </div>
              {/* col */}
              <div className="col-lg-6 d-flex justify-content-center">
                {/* images */}
                <div className="position-relative">
                  <img
                    src="https://geeksui.codescandy.com/geeks/assets/images/background/acedamy-img/girl-image.png"
                    alt="girl"
                    className="end-0 bottom-0"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/*<section className="pb-8">*/}
        {/*    <div className="container mb-lg-8">*/}
        {/*        /!* row *!/*/}
        {/*        <div className="row mb-5">*/}
        {/*            <div className="col-md-6 col-lg-3 border-top-md border-top pb-4  border-end-md">*/}
        {/*                /!* text *!/*/}
        {/*                <div className="py-7 text-center">*/}
        {/*                    <div className="mb-3">*/}
        {/*                        <i className="fe fe-award fs-2 text-info" />*/}
        {/*                    </div>*/}
        {/*                    <div className="lh-1">*/}
        {/*                        <h2 className="mb-1">316,000+</h2>*/}
        {/*                        <span>Qualified Instructor</span>*/}
        {/*                    </div>*/}
        {/*                </div>*/}
        {/*            </div>*/}
        {/*            <div className="col-md-6 col-lg-3 border-top-md border-top border-end-lg">*/}
        {/*                /!* icon *!/*/}
        {/*                <div className="py-7 text-center">*/}
        {/*                    <div className="mb-3">*/}
        {/*                        <i className="fe fe-users fs-2 text-warning" />*/}
        {/*                    </div>*/}
        {/*                    /!* text *!/*/}
        {/*                    <div className="lh-1">*/}
        {/*                        <h2 className="mb-1">1.8 Billion+</h2>*/}
        {/*                        <span>Course enrolments</span>*/}
        {/*                    </div>*/}
        {/*                </div>*/}
        {/*            </div>*/}
        {/*            <div className="col-md-6 col-lg-3 border-top-lg border-top border-end-md">*/}
        {/*                /!* icon *!/*/}
        {/*                <div className="py-7 text-center">*/}
        {/*                    <div className="mb-3">*/}
        {/*                        <i className="fe fe-tv fs-2 text-primary" />*/}
        {/*                    </div>*/}
        {/*                    /!* text *!/*/}
        {/*                    <div className="lh-1">*/}
        {/*                        <h2 className="mb-1">41,000+</h2>*/}
        {/*                        <span>Courses in 42 languages</span>*/}
        {/*                    </div>*/}
        {/*                </div>*/}
        {/*            </div>*/}
        {/*            <div className="col-md-6 col-lg-3 border-top-lg border-top">*/}
        {/*                /!* icon *!/*/}
        {/*                <div className="py-7 text-center">*/}
        {/*                    <div className="mb-3">*/}
        {/*                        <i className="fe fe-film fs-2 text-success" />*/}
        {/*                    </div>*/}
        {/*                    /!* text *!/*/}
        {/*                    <div className="lh-1">*/}
        {/*                        <h2 className="mb-1">179,000+</h2>*/}
        {/*                        <span>Online Videos</span>*/}
        {/*                    </div>*/}
        {/*                </div>*/}
        {/*            </div>*/}
        {/*        </div>*/}
        {/*    </div>*/}
        {/*</section>*/}

        <section className="mb-5">
          <div className="container mb-lg-8 ">
            <div className="row mb-5 mt-3">
              {/* col */}
              <div className="col-12">
                <div className="mb-6">
                  <h2 className="mb-1 h1">🔥Most Popular Courses</h2>
                  <p>
                    These are the most popular courses among Geeks Courses
                    learners worldwide in year 2025
                  </p>
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
                              <i className="fas fa-heart text-danger align-middle" />
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
                          <small>By: {c.teacher.full_name}</small> <br />
                          <small>{c.students?.length} Students</small> <br />
                          <div className="lh-1 mt-3 d-flex">
                            <span className="align-text-top">
                              <span className="fs-6">
                                <Rater total={5} rating={c.average_rating || 0} />

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
                <nav aria-label="Page navigation example">
                  <ul className="pagination justify-content-center">
                    <li className="page-item disabled">
                      <a className="page-link" href="#" tabIndex="-1">
                        Previous
                      </a>
                    </li>
                    <li className="page-item">
                      <a className="page-link" href="#">
                        1
                      </a>
                    </li>
                    <li className="page-item">
                      <a className="page-link" href="#">
                        2
                      </a>
                    </li>
                    <li className="page-item">
                      <a className="page-link" href="#">
                        3
                      </a>
                    </li>
                    <li className="page-item">
                      <a className="page-link" href="#">
                        Next
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </section>

        <BaseFooter />
      </>
    );
}

export default Index
