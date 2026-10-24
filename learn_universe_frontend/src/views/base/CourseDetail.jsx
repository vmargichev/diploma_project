import MediaImage from "../../components/MediaImage.jsx";
import React, {useContext} from 'react'
import {useState, useEffect} from "react"
import {apiInstance} from "../../utils/axios.js";
import {useNavigate, useParams} from "react-router-dom";
import { Link } from 'react-router-dom'
import Swal from "sweetalert2";

import BaseHeader from '../partials/BaseHeader'
import BaseFooter from '../partials/BaseFooter'
import moment from "moment";
import {useAuthStore} from "../../store/auths.js";
import useCurrentAddress from "../plugin/UserCountry.js";
import UserData from "../plugin/UserData.js";
import {CartContext} from "../plugin/Context.js";

function CourseDetail() {
    const address = useCurrentAddress();
    const [course, setCourse] = useState([])
  const [cartCount, setCartCount] = useContext(CartContext);
    const [isLoading, setIsLoading] = useState(true)
    const { isLoggedIn, token } = useAuthStore.getState();
    const [addedToCart, setAddedToCart] = useState("Add to Cart")
    const param = useParams();
    const navigate = useNavigate();
    const slug = param.slug


    const [relatedCourses, setRelatedCourses] = useState([]);
    useEffect(() => {
        let active = true;
        setIsLoading(true);
        setCourse(null);
        setRelatedCourses([]);
        apiInstance.get(`course/course-detail/${slug}/`)
            .then(({ data }) => { if (active) setCourse(data); })
            .catch(() => { if (active) setCourse(null); })
            .finally(() => { if (active) setIsLoading(false); });
        apiInstance.get(`course/course-detail/${slug}/related/`)
            .then(({ data }) => { if (active) setRelatedCourses(data); })
            .catch(() => { if (active) setRelatedCourses([]); });
        return () => { active = false; };
    }, [slug]);

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center my-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!course) {
        return <p className="text-center text-danger">Course not found.</p>;
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

    setAddedToCart("Adding to Cart");

    const formdata = new FormData();

    formdata.append("course", courseId);
    formdata.append("user", userId);
    formdata.append("country", country);

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
    setAddedToCart("Added To Cart");
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

    setAddedToCart("Add to Cart");

    throw error;
  }
};

    return (
      <>
        <BaseHeader />

        <>
          <section className="bg-light py-0 py-sm-5">
            <div className="container">
              <div className="row py-5">
                <div className="col-lg-8">
                  {/* Badge */}
                  <h6 className="mb-3 font-base bg-primary text-white py-2 px-4 rounded-2 d-inline-block">
                    {course?.category_name || "No Category"}
                  </h6>
                  {/* Title */}
                  <h1 className="mb-3">{course?.title}</h1>
                  <p
                    className="mb-3"
                    dangerouslySetInnerHTML={{
                      __html: course?.description?.slice(0, 200) || "",
                    }}
                  ></p>
                  {/* Content */}
                  <ul className="list-inline mb-0">
                    <li className="list-inline-item h6 me-3 mb-1 mb-sm-0">
                      <i className="fas fa-star text-warning me-2" />
                      {course?.average_rating || 0}/5
                    </li>
                    <li className="list-inline-item h6 me-3 mb-1 mb-sm-0">
                      <i className="fas fa-user-graduate text-orange me-2" />
                      {course?.students?.length || 0} Enrolled
                    </li>
                    <li className="list-inline-item h6 me-3 mb-1 mb-sm-0">
                      <i className="fas fa-signal text-success me-2" />
                      {course?.level || "Level not defined"}
                    </li>
                    <li className="list-inline-item h6 me-3 mb-1 mb-sm-0">
                      <i className="bi bi-patch-exclamation-fill text-danger me-2" />
                      Date Published{" "}
                      {moment(course?.date).format("DD MMM, YYYY")}
                    </li>
                    <li className="list-inline-item h6 mb-0">
                      <i className="fas fa-globe text-info me-2" />
                      {course?.language || "English"}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
          <section className="pb-0 py-lg-5">
            <div className="container">
              <div className="row">
                {/* Main content START */}
                <div className="col-lg-8">
                  <div className="card shadow rounded-2 p-0">
                    {/* Tabs START */}
                    <div className="card-header border-bottom px-4 py-3">
                      <ul
                        className="nav nav-pills nav-tabs-line py-0"
                        id="course-pills-tab"
                        role="tablist"
                      >
                        {/* Tab item */}
                        <li
                          className="nav-item me-2 me-sm-4"
                          role="presentation"
                        >
                          <button
                            className="nav-link mb-2 mb-md-0 active"
                            id="course-pills-tab-1"
                            data-bs-toggle="pill"
                            data-bs-target="#course-pills-1"
                            type="button"
                            role="tab"
                            aria-controls="course-pills-1"
                            aria-selected="true"
                          >
                            Overview
                          </button>
                        </li>
                        {/* Tab item */}
                        <li
                          className="nav-item me-2 me-sm-4"
                          role="presentation"
                        >
                          <button
                            className="nav-link mb-2 mb-md-0"
                            id="course-pills-tab-2"
                            data-bs-toggle="pill"
                            data-bs-target="#course-pills-2"
                            type="button"
                            role="tab"
                            aria-controls="course-pills-2"
                            aria-selected="false"
                          >
                            Curriculum
                          </button>
                        </li>
                        {/* Tab item */}
                        <li
                          className="nav-item me-2 me-sm-4"
                          role="presentation"
                        >
                          <button
                            className="nav-link mb-2 mb-md-0"
                            id="course-pills-tab-3"
                            data-bs-toggle="pill"
                            data-bs-target="#course-pills-3"
                            type="button"
                            role="tab"
                            aria-controls="course-pills-3"
                            aria-selected="false"
                          >
                            Instructor
                          </button>
                        </li>
                        {/* Tab item */}
                        <li
                          className="nav-item me-2 me-sm-4"
                          role="presentation"
                        >
                          <button
                            className="nav-link mb-2 mb-md-0"
                            id="course-pills-tab-4"
                            data-bs-toggle="pill"
                            data-bs-target="#course-pills-4"
                            type="button"
                            role="tab"
                            aria-controls="course-pills-4"
                            aria-selected="false"
                          >
                            Reviews
                          </button>
                        </li>
                        {/* Tab item */}
                        <li
                          className="nav-item me-2 me-sm-4 d-none"
                          role="presentation"
                        >
                          <button
                            className="nav-link mb-2 mb-md-0"
                            id="course-pills-tab-5"
                            data-bs-toggle="pill"
                            data-bs-target="#course-pills-5"
                            type="button"
                            role="tab"
                            aria-controls="course-pills-5"
                            aria-selected="false"
                          >
                            FAQs
                          </button>
                        </li>
                        {/* Tab item */}
                        <li
                          className="nav-item me-2 me-sm-4 d-none"
                          role="presentation"
                        >
                          <button
                            className="nav-link mb-2 mb-md-0"
                            id="course-pills-tab-6"
                            data-bs-toggle="pill"
                            data-bs-target="#course-pills-6"
                            type="button"
                            role="tab"
                            aria-controls="course-pills-6"
                            aria-selected="false"
                          >
                            Comment
                          </button>
                        </li>
                      </ul>
                    </div>
                    {/* Tabs END */}
                    {/* Tab contents START */}
                    <div className="card-body p-4">
                      <div
                        className="tab-content pt-2"
                        id="course-pills-tabContent"
                      >
                        {/* Content START */}
                        <div
                          className="tab-pane fade show active"
                          id="course-pills-1"
                          role="tabpanel"
                          aria-labelledby="course-pills-tab-1"
                        >
                          <h5 className="mb-3">Course Description</h5>
                          <p
                            className="mb-3"
                            dangerouslySetInnerHTML={{
                              __html: course?.description || "",
                            }}
                          ></p>
                        </div>
                        {/* Content END */}
                        {/* Content START */}
                        <div
                          className="tab-pane fade"
                          id="course-pills-2"
                          role="tabpanel"
                          aria-labelledby="course-pills-tab-2"
                        >
                          {/* Course accordion START */}
                          <div
                            className="accordion accordion-icon accordion-bg-light"
                            id="accordionExample2"
                          >
                            {/* Item */}
                            {course?.variants?.map((variant, variantIndex) => (
                              <div
                                className="accordion-item mb-3"
                                key={variant.variant_id || variantIndex}
                              >
                                <h6
                                  className="accordion-header font-base"
                                  id={`heading-${variant.variant_id}`}
                                >
                                  <button
                                    className="accordion-button fw-bold rounded d-sm-flex d-inline-block collapsed"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target={`#collapse-${variant.variant_id}`}
                                    aria-expanded="false"
                                    aria-controls={`collapse-${variant.variant_id}`}
                                  >
                                    {variant.title || "Untitled Section"}
                                    <span className="small ms-0 ms-sm-2">
                                      ({variant.variant_items?.length || 0}{" "}
                                      Lectures)
                                    </span>
                                  </button>
                                </h6>
                                <div
                                  id={`collapse-${variant.variant_id}`}
                                  className="accordion-collapse collapse"
                                  aria-labelledby={`heading-${variant.variant_id}`}
                                  data-bs-parent="#accordionExample2"
                                >
                                  <div className="accordion-body mt-3">
                                    {variant?.variant_items?.map(
                                      (item, itemIndex) => (
                                        <div
                                          key={
                                            item.variant_item_id || itemIndex
                                          }
                                        >
                                          <div className="d-flex justify-content-between align-items-center">
                                            <div className="position-relative d-flex align-items-center">
                                              <a
                                                href="#"
                                                className="btn btn-danger-soft btn-round btn-sm mb-0 stretched-link position-static"
                                              >
                                                {item?.preview === true ? (
                                                  <i className="fas fa-play me-0" />
                                                ) : (
                                                  <i className="fas fa-lock me-0" />
                                                )}
                                              </a>
                                              <span className="d-inline-block text-truncate ms-2 mb-0 h6 fw-light w-100px w-sm-200px w-md-400px">
                                                {item.title ||
                                                  "Untitled Lecture"}
                                              </span>
                                            </div>
                                            <p className="mb-0">
                                              {item.content_duration || "0m"}
                                            </p>
                                          </div>
                                          {itemIndex <
                                            variant.variant_items.length -
                                              1 && <hr />}
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          {/* Course accordion END */}
                        </div>
                        {/* Content END */}
                        {/* Content START */}
                        <div
                          className="tab-pane fade"
                          id="course-pills-3"
                          role="tabpanel"
                          aria-labelledby="course-pills-tab-3"
                        >
                          {/* Card START */}
                          <div className="card mb-0 mb-md-4">
                            <div className="row g-0 align-items-center">
                              <div className="col-md-5">
                                {/* Image */}
                                <MediaImage kind="avatar"
                                  src={course?.teacher?.image}
                                  className="img-fluid rounded-3"
                                  alt="instructor-image"
                                />
                              </div>
                              <div className="col-md-7">
                                {/* Card body */}
                                <div className="card-body">
                                  {/* Title */}
                                  <h3 className="card-title mb-0">
                                    {course?.teacher?.full_name}
                                  </h3>
                                  <p className="mb-2">{course?.teacher?.bio}</p>
                                  {/* Social button */}
                                  <ul className="list-inline mb-3">
                                    <li className="list-inline-item me-3">
                                      {course?.teacher?.twitter ? (
                                        <a
                                          href={course.teacher.twitter}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="fs-5 text-twitter hover:opacity-75 transition-opacity"
                                          aria-label="Twitter profile"
                                        >
                                          <i className="fab fa-twitter-square" />
                                        </a>
                                      ) : (
                                        <span className="fs-5 text-gray-400">
                                          <i className="fab fa-twitter-square" />
                                        </span>
                                      )}
                                    </li>

                                    <li className="list-inline-item me-3">
                                      {course?.teacher?.facebook ? (
                                        <a
                                          href={course.teacher.facebook}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="fs-5 text-facebook hover:opacity-75 transition-opacity"
                                          aria-label="Facebook profile"
                                        >
                                          <i className="fab fa-facebook-square" />
                                        </a>
                                      ) : (
                                        <span className="fs-5 text-gray-400">
                                          <i className="fab fa-facebook-square" />
                                        </span>
                                      )}
                                    </li>

                                    <li className="list-inline-item me-3">
                                      {course?.teacher?.linkedin ? (
                                        <a
                                          href={course.teacher.linkedin}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="fs-5 text-linkedin hover:opacity-75 transition-opacity"
                                          aria-label="LinkedIn profile"
                                        >
                                          <i className="fab fa-linkedin" />
                                        </a>
                                      ) : (
                                        <span className="fs-5 text-gray-400">
                                          <i className="fab fa-linkedin" />
                                        </span>
                                      )}
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                          {/* Card END */}
                          {/* Instructor info */}
                          <h5 className="mb-3">About Instructor</h5>
                          <p className="mb-3">{course?.teacher?.about}</p>
                        </div>
                        <div
                          className="tab-pane fade"
                          id="course-pills-4"
                          role="tabpanel"
                          aria-labelledby="course-pills-tab-4"
                        >
                          {/* Review START */}
                          <div className="row mb-1">
                            <h5 className="mb-4">Our Student Reviews</h5>
                          </div>

                          <div className="row">
                            <div className="d-md-flex my-4">
                              <div className="avatar avatar-xl me-4 flex-shrink-0">
                                <MediaImage kind="avatar"
                                  className="avatar-img rounded-circle"
                                  src="https://geeksui.codescandy.com/geeks/assets/images/avatar/avatar-1.jpg"
                                  style={{
                                    width: "50px",
                                    height: "50px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                  }}
                                  alt="avatar"
                                />
                              </div>
                              {/* Text */}
                              <div>
                                <div className="d-sm-flex mt-1 mt-md-0 align-items-center">
                                  <h5 className="me-3 mb-0">Sam Jay</h5>
                                  {/* Review star */}
                                  <ul className="list-inline mb-0">
                                    <i className="fas fa-star text-warning" />
                                    <i className="fas fa-star text-warning" />
                                    <i className="fas fa-star text-warning" />
                                    <i className="fas fa-star text-warning" />
                                    <i className="far fa-star text-warning" />
                                  </ul>
                                </div>
                                {/* Info */}
                                <p className="small mb-2">5 days ago</p>
                                <p className="mb-2">
                                  Perceived end knowledge certainly day
                                  sweetness why cordially. Ask a quick six seven
                                  offer see among. Handsome met debating sir
                                  dwelling age material. As style lived he worse
                                  dried. Offered related so visitors we private
                                  removed. Moderate do subjects to distance.
                                </p>
                                {/* Like and dislike button */}
                              </div>
                            </div>
                            {/* Comment children level 1 */}
                            <hr />
                            {/* Review item END */}
                            {/* Review item START */}
                            <div className="d-md-flex my-4">
                              {/* Avatar */}
                              <div className="avatar avatar-xl me-4 flex-shrink-0">
                                <MediaImage kind="avatar"
                                  className="avatar-img rounded-circle"
                                  src="https://geeksui.codescandy.com/geeks/assets/images/avatar/avatar-1.jpg"
                                  style={{
                                    width: "50px",
                                    height: "50px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                  }}
                                  alt="avatar"
                                />
                              </div>
                              {/* Text */}
                              <div>
                                <div className="d-sm-flex mt-1 mt-md-0 align-items-center">
                                  <h5 className="me-3 mb-0">Benny Doggo</h5>
                                  {/* Review star */}
                                  <ul className="list-inline mb-0">
                                    <li className="list-inline-item me-0">
                                      <i className="fas fa-star text-warning" />
                                    </li>
                                    <li className="list-inline-item me-0">
                                      <i className="fas fa-star text-warning" />
                                    </li>
                                    <li className="list-inline-item me-0">
                                      <i className="fas fa-star text-warning" />
                                    </li>
                                    <li className="list-inline-item me-0">
                                      <i className="fas fa-star text-warning" />
                                    </li>
                                    <li className="list-inline-item me-0">
                                      <i className="far fa-star text-warning" />
                                    </li>
                                  </ul>
                                </div>
                                {/* Info */}
                                <p className="small mb-2">2 days ago</p>
                                <p className="mb-2">
                                  Handsome met debating sir dwelling age
                                  material. As style lived he worse dried.
                                  Offered related so visitors we private
                                  removed. Moderate do subjects to distance.
                                </p>
                              </div>
                            </div>
                            {/* Review item END */}
                            {/* Divider */}
                            <hr />
                          </div>
                          {/* Student review END */}
                          {/* Leave Review START */}
                          <div className="mt-2">
                            <h5 className="mb-4">Leave a Review</h5>
                            <form className="row g-3">
                              {/* Rating */}
                              <div className="col-12 bg-light-input">
                                {/*<select*/}
                                {/*    id="inputState2"*/}
                                {/*    className="form-select js-choice"*/}
                                {/*>*/}
                                {/*    <option selected="">★★★★★ (5/5)</option>*/}
                                {/*    <option>★★★★☆ (4/5)</option>*/}
                                {/*    <option>★★★☆☆ (3/5)</option>*/}
                                {/*    <option>★★☆☆☆ (2/5)</option>*/}
                                {/*    <option>★☆☆☆☆ (1/5)</option>*/}
                                {/*</select>*/}
                              </div>
                              {/* Message */}
                              <div className="col-12 bg-light-input">
                                <textarea
                                  className="form-control"
                                  id="exampleFormControlTextarea1"
                                  placeholder="Your review"
                                  rows={3}
                                  defaultValue={""}
                                />
                              </div>
                              {/* Button */}
                              <div className="col-12">
                                <button
                                  type="submit"
                                  className="btn btn-primary mb-0"
                                >
                                  Post Review
                                </button>
                              </div>
                            </form>
                          </div>
                          {/* Leave Review END */}
                        </div>
                        {/* Content END */}
                        {/* Content START */}
                        <div
                          className="tab-pane fade"
                          id="course-pills-5"
                          role="tabpanel"
                          aria-labelledby="course-pills-tab-5"
                        >
                          {/* Title */}
                          <h5 className="mb-3">Frequently Asked Questions</h5>
                          {/* Accordion START */}
                          <div
                            className="accordion accordion-flush"
                            id="accordionExample"
                          >
                            {/* Item */}
                            <div className="accordion-item">
                              <h2 className="accordion-header" id="headingOne">
                                <button
                                  className="accordion-button collapsed"
                                  type="button"
                                  data-bs-toggle="collapse"
                                  data-bs-target="#collapseOne"
                                  aria-expanded="true"
                                  aria-controls="collapseOne"
                                >
                                  <span className="text-secondary fw-bold me-3">
                                    01
                                  </span>
                                  <span className="h6 mb-0">
                                    How Digital Marketing Work?
                                  </span>
                                </button>
                              </h2>
                              <div
                                id="collapseOne"
                                className="accordion-collapse collapse show"
                                aria-labelledby="headingOne"
                                data-bs-parent="#accordionExample"
                              >
                                <div className="accordion-body pt-0">
                                  Comfort reached gay perhaps chamber his six
                                  detract besides add. Moonlight newspaper up
                                  its enjoyment agreeable depending. Timed voice
                                  share led him to widen noisy young. At
                                  weddings believed laughing although the
                                  material does the exercise of. Up attempt
                                  offered ye civilly so sitting to. She new
                                  course gets living within Elinor joy. She
                                  rapturous suffering concealed.
                                </div>
                              </div>
                            </div>
                            {/* Item */}
                            <div className="accordion-item">
                              <h2 className="accordion-header" id="headingTwo">
                                <button
                                  className="accordion-button collapsed"
                                  type="button"
                                  data-bs-toggle="collapse"
                                  data-bs-target="#collapseTwo"
                                  aria-expanded="false"
                                  aria-controls="collapseTwo"
                                >
                                  <span className="text-secondary fw-bold me-3">
                                    02
                                  </span>
                                  <span className="h6 mb-0">What is SEO?</span>
                                </button>
                              </h2>
                              <div
                                id="collapseTwo"
                                className="accordion-collapse collapse"
                                aria-labelledby="headingTwo"
                                data-bs-parent="#accordionExample"
                              >
                                <div className="accordion-body pt-0">
                                  Pleasure and so read the was hope entire first
                                  decided the so must have as on was want up of
                                  I will rival in came this touched got a
                                  physics to travelling so all especially
                                  refinement monstrous desk they was arrange the
                                  overall helplessly out of particularly ill are
                                  purer.
                                  <p className="mt-2">
                                    Person she control of to beginnings view
                                    looked eyes Than continues its and because
                                    and given and shown creating curiously to
                                    more in are man were smaller by we instead
                                    the these sighed Avoid in the sufficient me
                                    real man longer of his how her for countries
                                    to brains warned notch important Finds be to
                                    the of on the increased explain noise of
                                    power deep asking contribution this live of
                                    suppliers goals bit separated poured sort
                                    several the was organization the if
                                    relations go work after mechanic But we've
                                    area wasn't everything needs of and doctor
                                    where would.
                                  </p>
                                  Go he prisoners And mountains in just
                                  switching city steps Might rung line what Mr
                                  Bulk; Was or between towards the have phase
                                  were its world my samples are the was royal he
                                  luxury the about trying And on he to my enough
                                  is was the remember a although lead in were
                                  through serving their assistant fame day have
                                  for its after would cheek dull have what in go
                                  feedback assignment Her of a any help if the a
                                  of semantics is rational overhauls following
                                  in from our hazardous and used more he
                                  themselves the parents up just regulatory.
                                </div>
                              </div>
                            </div>
                            {/* Item */}
                            <div className="accordion-item">
                              <h2
                                className="accordion-header"
                                id="headingThree"
                              >
                                <button
                                  className="accordion-button collapsed"
                                  type="button"
                                  data-bs-toggle="collapse"
                                  data-bs-target="#collapseThree"
                                  aria-expanded="false"
                                  aria-controls="collapseThree"
                                >
                                  <span className="text-secondary fw-bold me-3">
                                    03
                                  </span>
                                  <span className="h6 mb-0">
                                    Who should join this course?
                                  </span>
                                </button>
                              </h2>
                              <div
                                id="collapseThree"
                                className="accordion-collapse collapse"
                                aria-labelledby="headingThree"
                                data-bs-parent="#accordionExample"
                              >
                                <div className="accordion-body pt-0">
                                  Post no so what deal evil rent by real in. But
                                  her ready least set lived spite solid.
                                  September how men saw tolerably two behavior
                                  arranging. She offices for highest and replied
                                  one venture pasture. Applauded no discovery in
                                  newspaper allowance am northward. Frequently
                                  partiality possession resolution at or
                                  appearance unaffected me. Engaged its was the
                                  evident pleased husband. Ye goodness felicity
                                  do disposal dwelling no. First am plate jokes
                                  to began to cause a scale.
                                  <strong>
                                    Subjects he prospect elegance followed no
                                    overcame
                                  </strong>
                                  possible it on.
                                </div>
                              </div>
                            </div>
                            {/* Item */}
                            <div className="accordion-item">
                              <h2 className="accordion-header" id="headingFour">
                                <button
                                  className="accordion-button collapsed"
                                  type="button"
                                  data-bs-toggle="collapse"
                                  data-bs-target="#collapseFour"
                                  aria-expanded="false"
                                  aria-controls="collapseFour"
                                >
                                  <span className="text-secondary fw-bold me-3">
                                    04
                                  </span>
                                  <span className="h6 mb-0">
                                    What are the T&amp;C for this program?
                                  </span>
                                </button>
                              </h2>
                              <div
                                id="collapseFour"
                                className="accordion-collapse collapse"
                                aria-labelledby="headingFour"
                                data-bs-parent="#accordionExample"
                              >
                                <div className="accordion-body pt-0">
                                  Night signs creeping yielding green Seasons
                                  together man green fruitful make fish behold
                                  earth unto you'll lights living moving sea
                                  open for fish day multiply tree good female
                                  god had fruitful of creature fill shall don't
                                  day fourth lesser he the isn't let multiply
                                  may Creeping earth under was You're without
                                  which image stars in Own creeping night of
                                  wherein Heaven years their he over doesn't
                                  whose won't kind seasons light Won't that fish
                                  him whose won't also it dominion heaven
                                  fruitful Whales created And likeness doesn't
                                  that Years without divided saying morning
                                  creeping hath you'll seas cattle in multiply
                                  under together in us said above dry tree herb
                                  saw living darkness without have won't for i
                                  behold meat brought winged Moving living
                                  second beast Over fish place beast image very
                                  him evening Thing they're fruit together forth
                                  day Seed lights Land creature together
                                  Multiply waters form brought.
                                </div>
                              </div>
                            </div>
                            {/* Item */}
                            <div className="accordion-item">
                              <h2 className="accordion-header" id="headingFive">
                                <button
                                  className="accordion-button collapsed"
                                  type="button"
                                  data-bs-toggle="collapse"
                                  data-bs-target="#collapseFive"
                                  aria-expanded="false"
                                  aria-controls="collapseFive"
                                >
                                  <span className="text-secondary fw-bold me-3">
                                    05
                                  </span>
                                  <span className="h6 mb-0">
                                    What certificates will I be received for
                                    this program?
                                  </span>
                                </button>
                              </h2>
                              <div
                                id="collapseFive"
                                className="accordion-collapse collapse"
                                aria-labelledby="headingFive"
                                data-bs-parent="#accordionExample"
                              >
                                <div className="accordion-body pt-0">
                                  Smile spoke total few great had never their
                                  too Amongst moments do in arrived at my
                                  replied Fat weddings servants but man believed
                                  prospect Companions understood is as
                                  especially pianoforte connection introduced
                                  Nay newspaper can sportsman are admitting
                                  gentleman belonging his Is oppose no he summer
                                  lovers twenty in Not his difficulty boisterous
                                  surrounded bed Seems folly if in given scale
                                  Sex contented dependent conveying advantage.
                                </div>
                              </div>
                            </div>
                          </div>
                          {/* Accordion END */}
                        </div>
                        {/* Content END */}
                        {/* Content START */}
                        <div
                          className="tab-pane fade"
                          id="course-pills-6"
                          role="tabpanel"
                          aria-labelledby="course-pills-tab-6"
                        >
                          {/* Review START */}
                          <div className="row">
                            <div className="col-12">
                              <h5 className="mb-4">Group Chat & Q/A Forum</h5>

                              {/* Comment item START */}
                              <div className="border p-2 p-sm-4 rounded-3 mb-4">
                                <ul className="list-unstyled mb-0">
                                  <li className="comment-item">
                                    <div className="d-flex mb-3">
                                      <div className="ms-2">
                                        {/* Comment by */}
                                        <div className="bg-light p-3 rounded">
                                          <div className="d-flex justify-content-center">
                                            <div className="me-2">
                                              <h6 className="mb-1 lead fw-bold">
                                                <a
                                                  href="#!"
                                                  className="text-decoration-none text-dark"
                                                >
                                                  <span className="text-secondary">
                                                    By:
                                                  </span>{" "}
                                                  Frances Guerrero{" "}
                                                </a>
                                              </h6>
                                              <p className="mb-0">
                                                Removed demands expense account
                                                in outward tedious do.
                                                Particular waythoroughly
                                                unaffected projection ar
                                                waythoroughly unaffected
                                                projection?...
                                              </p>
                                              <p className="mt-4 fw-bold">
                                                16 Replies
                                              </p>
                                            </div>
                                            <small>5hr</small>
                                          </div>
                                        </div>
                                        {/* Comment react */}
                                        <ul className="nav nav-divider py-2 small">
                                          <li className="nav-item">
                                            <a
                                              className="btn btn-primary btn-sm"
                                              href="#"
                                            >
                                              Join Conversation{" "}
                                              <i className="fas fa-arrow-right"></i>
                                            </a>
                                          </li>
                                        </ul>
                                      </div>
                                    </div>
                                  </li>

                                  <li className="comment-item">
                                    <div className="d-flex mb-3">
                                      <div className="ms-2">
                                        {/* Comment by */}
                                        <div className="bg-light p-3 rounded">
                                          <div className="d-flex justify-content-center">
                                            <div className="me-2">
                                              <h6 className="mb-1 lead fw-bold">
                                                <a
                                                  href="#!"
                                                  className="text-decoration-none text-dark"
                                                >
                                                  <span className="text-secondary">
                                                    By:
                                                  </span>{" "}
                                                  Frances Guerrero{" "}
                                                </a>
                                              </h6>
                                              <p className="mb-0">
                                                Removed demands expense account
                                                in outward tedious do.
                                                Particular waythoroughly
                                                unaffected projection ar
                                                waythoroughly unaffected
                                                projection?...
                                              </p>
                                              <p className="mt-4 fw-bold">
                                                16 Replies
                                              </p>
                                            </div>
                                            <small>5hr</small>
                                          </div>
                                        </div>
                                        {/* Comment react */}
                                        <ul className="nav nav-divider py-2 small">
                                          <li className="nav-item">
                                            <a
                                              className="btn btn-primary btn-sm"
                                              href="#"
                                            >
                                              Join Conversation{" "}
                                              <i className="fas fa-arrow-right"></i>
                                            </a>
                                          </li>
                                        </ul>
                                      </div>
                                    </div>
                                  </li>
                                </ul>
                              </div>
                              {/* Chat Detail Page */}
                              <div className="border p-2 p-sm-4 rounded-3">
                                <ul
                                  className="list-unstyled mb-0"
                                  style={{
                                    overflowY: "scroll",
                                    height: "500px",
                                  }}
                                >
                                  <li className="comment-item mb-3">
                                    <div className="d-flex">
                                      <div className="avatar avatar-sm flex-shrink-0">
                                        <a href="#">
                                          <MediaImage kind="avatar"
                                            className="avatar-img rounded-circle"
                                            src="https://geeksui.codescandy.com/geeks/assets/images/avatar/avatar-3.jpg"
                                            style={{
                                              width: "40px",
                                              height: "40px",
                                              borderRadius: "50%",
                                              objectFit: "cover",
                                            }}
                                            alt="womans image"
                                          />
                                        </a>
                                      </div>
                                      <div className="ms-2">
                                        {/* Comment by */}
                                        <div className="bg-light p-3 rounded w-100">
                                          <div className="d-flex w-100 justify-content-center">
                                            <div className="me-2 ">
                                              <h6 className="mb-1 lead fw-bold">
                                                <a
                                                  href="#!"
                                                  className="text-decoration-none text-dark"
                                                >
                                                  {" "}
                                                  Louis Ferguson{" "}
                                                </a>
                                                <br />
                                                <span
                                                  style={{
                                                    fontSize: "12px",
                                                    color: "gray",
                                                  }}
                                                >
                                                  5hrs Ago
                                                </span>
                                              </h6>
                                              <p className="mb-0 mt-3  ">
                                                Removed demands expense account
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </li>

                                  <li className="comment-item mb-3">
                                    <div className="d-flex">
                                      <div className="avatar avatar-sm flex-shrink-0">
                                        <a href="#">
                                          <MediaImage kind="avatar"
                                            className="avatar-img rounded-circle"
                                            src="https://geeksui.codescandy.com/geeks/assets/images/avatar/avatar-3.jpg"
                                            style={{
                                              width: "40px",
                                              height: "40px",
                                              borderRadius: "50%",
                                              objectFit: "cover",
                                            }}
                                            alt="womans image"
                                          />
                                        </a>
                                      </div>
                                      <div className="ms-2">
                                        {/* Comment by */}
                                        <div className="bg-light p-3 rounded w-100">
                                          <div className="d-flex w-100 justify-content-center">
                                            <div className="me-2 ">
                                              <h6 className="mb-1 lead fw-bold">
                                                <a
                                                  href="#!"
                                                  className="text-decoration-none text-dark"
                                                >
                                                  {" "}
                                                  Louis Ferguson{" "}
                                                </a>
                                                <br />
                                                <span
                                                  style={{
                                                    fontSize: "12px",
                                                    color: "gray",
                                                  }}
                                                >
                                                  5hrs Ago
                                                </span>
                                              </h6>
                                              <p className="mb-0 mt-3  ">
                                                Removed demands expense account
                                                from the debby building in a
                                                hall town tak with
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </li>

                                  <li className="comment-item mb-3">
                                    <div className="d-flex">
                                      <div className="avatar avatar-sm flex-shrink-0">
                                        <a href="#">
                                          <MediaImage kind="avatar"
                                            className="avatar-img rounded-circle"
                                            src="https://geeksui.codescandy.com/geeks/assets/images/avatar/avatar-3.jpg"
                                            style={{
                                              width: "40px",
                                              height: "40px",
                                              borderRadius: "50%",
                                              objectFit: "cover",
                                            }}
                                            alt="womans image"
                                          />
                                        </a>
                                      </div>
                                      <div className="ms-2">
                                        {/* Comment by */}
                                        <div className="bg-light p-3 rounded w-100">
                                          <div className="d-flex w-100 justify-content-center">
                                            <div className="me-2 ">
                                              <h6 className="mb-1 lead fw-bold">
                                                <a
                                                  href="#!"
                                                  className="text-decoration-none text-dark"
                                                >
                                                  {" "}
                                                  Louis Ferguson{" "}
                                                </a>
                                                <br />
                                                <span
                                                  style={{
                                                    fontSize: "12px",
                                                    color: "gray",
                                                  }}
                                                >
                                                  5hrs Ago
                                                </span>
                                              </h6>
                                              <p className="mb-0 mt-3  ">
                                                Removed demands expense account
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </li>

                                  <li className="comment-item mb-3">
                                    <div className="d-flex">
                                      <div className="avatar avatar-sm flex-shrink-0">
                                        <a href="#">
                                          <MediaImage kind="avatar"
                                            className="avatar-img rounded-circle"
                                            src="https://geeksui.codescandy.com/geeks/assets/images/avatar/avatar-3.jpg"
                                            style={{
                                              width: "40px",
                                              height: "40px",
                                              borderRadius: "50%",
                                              objectFit: "cover",
                                            }}
                                            alt="womans image"
                                          />
                                        </a>
                                      </div>
                                      <div className="ms-2">
                                        {/* Comment by */}
                                        <div className="bg-light p-3 rounded w-100">
                                          <div className="d-flex w-100 justify-content-center">
                                            <div className="me-2 ">
                                              <h6 className="mb-1 lead fw-bold">
                                                <a
                                                  href="#!"
                                                  className="text-decoration-none text-dark"
                                                >
                                                  {" "}
                                                  Louis Ferguson{" "}
                                                </a>
                                                <br />
                                                <span
                                                  style={{
                                                    fontSize: "12px",
                                                    color: "gray",
                                                  }}
                                                >
                                                  5hrs Ago
                                                </span>
                                              </h6>
                                              <p className="mb-0 mt-3  ">
                                                Removed demands expense account
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </li>
                                </ul>

                                <form className="w-100 d-flex">
                                  <textarea
                                    className="one form-control pe-4 bg-light w-75"
                                    id="autoheighttextarea"
                                    rows="1"
                                    placeholder="Write a message..."
                                  ></textarea>
                                  <button
                                    className="btn btn-primary ms-2 mb-0 w-25"
                                    type="button"
                                  >
                                    Post <i className="fas fa-paper-plane"></i>
                                  </button>
                                </form>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Main content END */}
                {/* Right sidebar START */}
                <div className="col-lg-4 pt-5 pt-lg-0">
                  <div className="row mb-5 mb-lg-0">
                    <div className="col-md-6 col-lg-12">
                      {/* Video START */}
                      <div className="card shadow p-2 mb-4 z-index-9">
                        <div className="overflow-hidden rounded-3">
                          <MediaImage kind="course"
                            src={course.image}
                            className="card-img"
                            alt="course image"
                          />
                          <div className="p-3">
                            {course.file ? (
                              <video controls preload="metadata" src={course.file} poster={course.image || undefined} style={{ width: "100%" }} aria-label="Course introduction video" />
                            ) : <p className="text-muted mb-0">No introduction video has been uploaded yet.</p>}
                          </div>
                        </div>
                        {/* Card body */}
                        <div className="card-body px-3">
                          {/* Info */}
                          <div className="d-flex justify-content-between align-items-center">
                            {/* Price and time */}
                            <div>
                              <div className="d-flex align-items-center">
                                <h3 className="fw-bold mb-0 me-2">
                                  €{course.price}
                                </h3>
                              </div>
                            </div>
                            {/* Share button with dropdown */}
                            <div className="dropdown">
                              {/* Share button */}
                              <a
                                href="#"
                                className="btn btn-sm btn-light rounded small"
                                role="button"
                                id="dropdownShare"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                <i className="fas fa-fw fa-share-alt" />
                              </a>
                              {/* dropdown button */}
                              <ul
                                className="dropdown-menu dropdown-w-sm dropdown-menu-end min-w-auto shadow rounded"
                                aria-labelledby="dropdownShare"
                              >
                                <li>
                                  <a className="dropdown-item" href="#">
                                    <i className="fab fa-twitter-square me-2" />
                                    Twitter
                                  </a>
                                </li>
                                <li>
                                  <a className="dropdown-item" href="#">
                                    <i className="fab fa-facebook-square me-2" />
                                    Facebook
                                  </a>
                                </li>
                                <li>
                                  <a className="dropdown-item" href="#">
                                    <i className="fab fa-linkedin me-2" />
                                    LinkedIn
                                  </a>
                                </li>
                                <li>
                                  <a className="dropdown-item" href="#">
                                    <i className="fas fa-copy me-2" />
                                    Copy link
                                  </a>
                                </li>
                              </ul>
                            </div>
                          </div>
                          {/* Buttons */}
                          <div className="mt-3 d-sm-flex justify-content-sm-between">
                            {/* Add to Cart Button */}
                            <button
                              type="button"
                              className="btn btn-primary mb-0 w-100 me-2 position-relative"
                              onClick={async () => {
                                try {
                                  await addToCart(
                                    course?.id,
                                    UserData?.user_id,
                                    address?.country || "Bulgaria",
                                  );
                                } catch (error) {
                                  console.error("Add to cart error:", error);
                                }
                              }}
                              disabled={addedToCart !== "Add to Cart"}
                            >
                              <span
                                className={
                                  addedToCart === "Adding to Cart"
                                    ? "invisible"
                                    : ""
                                }
                              >
                                {addedToCart === "Add to Cart" && (
                                  <>
                                    <i className="fas fa-shopping-cart me-2"></i>
                                    Add To Cart
                                  </>
                                )}
                                {addedToCart === "Added To Cart" && (
                                  <>
                                    <i className="fas fa-check-circle me-2"></i>
                                    Added To Cart
                                  </>
                                )}
                              </span>

                              {addedToCart === "Adding to Cart" && (
                                <span className="position-absolute d-flex align-items-center">
                                  <i className="fas fa-spinner fa-spin me-2"></i>
                                  Adding To Cart
                                </span>
                              )}
                            </button>

                            {/* Enroll Now Button */}
                            <Link
                              to="/cart/"
                              className="btn btn-success mb-0 w-100"
                            >
                              Enroll Now <i className="fas fa-arrow-right"></i>
                            </Link>
                          </div>
                        </div>
                      </div>
                      {/* Video END */}
                      {/* Course info START */}
                      <div className="card card-body shadow p-4 mb-4">
                        {/* Title */}
                        <h4 className="mb-3">This course includes</h4>
                        <ul className="list-group list-group-borderless">
                          <li className="list-group-item d-flex justify-content-between align-items-center">
                            <span className="h6 fw-light mb-0">
                              <i className="fas fa-fw fa-book-open text-primary me-2" />
                              Lectures
                            </span>
                            <span>{course?.lectures?.length || 0}</span>
                          </li>
                          <li className="list-group-item d-flex justify-content-between align-items-center d-none">
                            <span className="h6 fw-light mb-0">
                              <i className="fas fa-fw fa-clock text-primary me-2" />
                              Duration
                            </span>
                            <span>4h 50m</span>
                          </li>
                          <li className="list-group-item d-flex justify-content-between align-items-center">
                            <span className="h6 fw-light mb-0">
                              <i className="fas fa-fw fa-signal text-primary me-2" />
                              Skills
                            </span>
                            <span>{course?.level || "All Levels"}</span>
                          </li>
                          <li className="list-group-item d-flex justify-content-between align-items-center">
                            <span className="h6 fw-light mb-0">
                              <i className="fas fa-fw fa-globe text-primary me-2" />
                              Language
                            </span>
                            <span>{course?.language || "English"}</span>
                          </li>
                          <li className="list-group-item d-flex justify-content-between align-items-center">
                            <span className="h6 fw-light mb-0">
                              <i className="fas fa-fw fa-user-clock text-primary me-2" />
                              Published
                            </span>
                            {/*<span>7th August, 2025</span>*/}
                            <span>
                              {new Date(course.date).toLocaleDateString(
                                "en-US",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          </li>
                          <li className="list-group-item d-flex justify-content-between align-items-center">
                            <span className="h6 fw-light mb-0">
                              <i className="fas fa-fw fa-medal text-primary me-2" />
                              Certificate
                            </span>
                            <span>Yes</span>
                          </li>
                        </ul>
                      </div>
                      {/* Course info END */}
                    </div>
                  </div>
                  {/* Row End */}
                </div>
                {/* Right sidebar END */}
              </div>
              {/* Row END */}
            </div>
          </section>
          <section className="mb-5">
            <div className="container">
              <h2>Related Courses</h2>
              <p>Explore more courses in the same category.</p>
              {relatedCourses.length === 0 && <p className="text-muted">No related courses are available yet.</p>}
              <div className="row g-4">
                {relatedCourses.map((related) => (
                  <div className="col-md-6 col-lg-3" key={related.id}>
                    <article className="card h-100">
                      <Link to={`/course-detail/${related.slug}/`}>
                        <MediaImage src={related.image} alt={related.title} className="card-img-top" style={{ aspectRatio: "16 / 9", objectFit: "cover" }} />
                      </Link>
                      <div className="card-body">
                        <small>{related.level} · {related.language}</small>
                        <h3 className="h5 mt-2"><Link to={`/course-detail/${related.slug}/`}>{related.title}</Link></h3>
                        <p>By {related.teacher_name || "Learn Universe"}</p>
                        <strong>€{Number(related.price).toFixed(2)}</strong>
                      </div>
                      <div className="card-footer"><Link className="btn btn-primary" to={`/course-detail/${related.slug}/`}>View course</Link></div>
                    </article>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>

        <BaseFooter />
      </>
    );
}

export default CourseDetail