// import React from "react";
// import { Link } from "react-router-dom";
// import logo from "../../assets/logo_navbar.png";
//
// function BaseHeader() {
//   return (
//     <div style={{ paddingTop: '35px' }}>
//       <nav
//           className="navbar navbar-expand-lg bg-body-tertiary fixed-top"
//           data-bs-theme="dark"
//       >
//
//           <div className="container">
//             <Link className="navbar-brand" to="/">
//               {/*LearnUniverse*/}
//               <img
//                   src={logo}
//                   alt="LearnUniverse"
//                   height="30"
//                   className="d-inline-block align-middle me-2"
//               />
//             </Link>
//             <button
//                 className="navbar-toggler"
//                 type="button"
//                 data-bs-toggle="collapse"
//                 data-bs-target="#navbarSupportedContent"
//                 aria-controls="navbarSupportedContent"
//                 aria-expanded="false"
//                 aria-label="Toggle navigation"
//             >
//               <span className="navbar-toggler-icon"/>
//             </button>
//             <div className="collapse navbar-collapse" id="navbarSupportedContent">
//               <ul className="navbar-nav me-auto mb-2 mb-lg-0">
//                 <li className="nav-item dropdown">
//                   <a
//                       className="nav-link dropdown-toggle"
//                       href="#"
//                       role="button"
//                       data-bs-toggle="dropdown"
//                       aria-expanded="false"
//                   >
//                     <i className="fas fa-graduation-cap"></i> Student
//                   </a>
//                   <ul className="dropdown-menu">
//                     <li>
//                       <Link className="dropdown-item" to={`/student/dashboard/`}>
//                         {" "}
//                         <i className="bi bi-grid-fill"></i> Dashboard
//                       </Link>
//                     </li>
//                     <li>
//                       <Link className="dropdown-item" to={`/student/courses/`}>
//                         {" "}
//                         <i className="fas fa-shopping-cart"></i>My Courses
//                       </Link>
//                     </li>
//
//                     <li>
//                       <Link className="dropdown-item" to={`/student/wishlist/`}>
//                         {" "}
//                         <i className="fas fa-heart"></i> Wishlist{" "}
//                       </Link>
//                     </li>
//                     <li>
//                       <Link
//                           className="dropdown-item"
//                           to={`/student/question-answer/`}
//                       >
//                         {" "}
//                         <i className="fas fa-envelope"></i> Q/A{" "}
//                       </Link>
//                     </li>
//                     <li>
//                       <Link className="dropdown-item" to={`/student/profile/`}>
//                         {" "}
//                         <i className="fas fa-gear"></i> Profile & Settings
//                       </Link>
//                     </li>
//                   </ul>
//                 </li>
//                 <li className="nav-item dropdown">
//                   <a
//                       className="nav-link dropdown-toggle"
//                       href="#"
//                       role="button"
//                       data-bs-toggle="dropdown"
//                       aria-expanded="false"
//                   >
//                     <i className="fas fa-chalkboard-user"></i> Instructor
//                   </a>
//                   <ul className="dropdown-menu">
//                     <li>
//                       <Link
//                           className="dropdown-item"
//                           to={`/instructor/dashboard/`}
//                       >
//                         <i className="bi bi-grid-fill"></i> Dashboard
//                       </Link>
//                     </li>
//                     <li>
//                       <Link className="dropdown-item" to={`/instructor/courses/`}>
//                         <i className="fas fa-shopping-cart"></i> My Courses
//                       </Link>
//                     </li>
//                     <li>
//                       <Link
//                           className="dropdown-item"
//                           to={`/instructor/create-course/`}
//                       >
//                         <i className="fas fa-plus"></i> Create Course
//                       </Link>
//                     </li>
//                     <li>
//                       <Link className="dropdown-item" to={`/instructor/reviews/`}>
//                         <i className="fas fa-star"></i> Reviews{" "}
//                       </Link>
//                     </li>
//                     <li>
//                       <Link
//                           className="dropdown-item"
//                           to={`/instructor/question-answer/`}
//                       >
//                         <i className="fas fa-envelope"></i> Q/A{" "}
//                       </Link>
//                     </li>
//                     <li>
//                       <Link
//                           className="dropdown-item"
//                           to={`/instructor/students/`}
//                       >
//                         <i className="fas fa-users"></i> Students{" "}
//                       </Link>
//                     </li>
//                     <li>
//                       <Link className="dropdown-item" to={`/instructor/earning/`}>
//                         <i className="fas fa-dollar-sign"></i> Earning{" "}
//                       </Link>
//                     </li>
//
//                     <li>
//                       <Link className="dropdown-item" to={`/instructor/profile/`}>
//                         <i className="fas fa-gear"></i> Settings & Profile{" "}
//                       </Link>
//                     </li>
//                   </ul>
//                 </li>
//
//               </ul>
//               <form className="d-flex align-items-center" role="search" style={{maxWidth: "600px"}}>
//                 <div className="input-group">
//                   <input
//                       className="form-control"
//                       type="search"
//                       placeholder="Search Courses"
//                       aria-label="Search Courses"
//                   />
//                   <button
//                       className="btn btn-gradient-search"
//                       type="submit"
//                       style={{minWidth: "100px"}}
//                   >
//                     <i className="fas fa-search ms-2"></i> Search
//                   </button>
//                 </div>
//               </form>
//               <Link
//                   to="/login/"
//                   className="btn ms-2 btn-gradient-search"
//                   type="submit"
//                   style={{minWidth: "100px"}}
//               >
//                 Login <i className="fas fa-sign-in-alt"></i>
//               </Link>
//               <Link
//                   to="/register/"
//                   className="btn ms-2 btn-gradient-search"
//                   type="submit"
//                   style={{minWidth: "100px"}}
//               >
//                 Register <i className="fas fa-user-plus"> </i>
//               </Link>
//               <Link
//                   to="/cart/"
//                   className="btn btn-success position-relative ms-2"
//                   style={{
//                     minWidth: "100px",
//                     transition: "all 0.3s ease",
//                   }}
//               >
//                 <i className="fas fa-shopping-cart me-2"></i>
//                 Cart
//                 <span
//                     className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
//                     style={{
//                       fontSize: "0.6rem",
//                       padding: "4px 6px",
//                     }}
//                 >
//                 3<span className="visually-hidden">items in cart</span>
//               </span>
//               </Link>
//             </div>
//           </div>
//       </nav>
//     </div>
// );
// }
//
// export default BaseHeader;

import React, {useContext} from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo_navbar.png";
import { useAuthStore } from "../../store/auths.js";
import {CartContext} from "../plugin/Context.js";

function BaseHeader() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const isAuthenticated = !!user;
  const [cartCount, setCartCount] = useContext(CartContext);

  return (
      <div style={{paddingTop: '35px'}}>
        <nav className="navbar navbar-expand-lg bg-body-tertiary fixed-top" data-bs-theme="dark">
          <div className="container">
            <Link className="navbar-brand" to="/">
              <img
                  src={logo}
                  alt="LearnUniverse"
                  height="30"
                  className="d-inline-block align-middle me-2"
              />
            </Link>

            <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent"
                aria-expanded="false"
                aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"/>
            </button>

            <div className="collapse navbar-collapse" id="navbarSupportedContent">
              {isAuthenticated && (
                  <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                    {/* Student dropdown - shown to all logged in users */}
                    <li className="nav-item dropdown">
                      <Link
                          className="nav-link dropdown-toggle"
                          to="#"
                          role="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                      >
                        <i className="fas fa-graduation-cap"></i> Student
                      </Link>
                      <ul className="dropdown-menu">
                        <li>
                          <Link className="dropdown-item" to="/student/dashboard/">
                            <i className="bi bi-grid-fill"></i> Dashboard
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/student/courses/">
                            <i className="fas fa-shopping-cart"></i> My Courses
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/student/wishlist/">
                            <i className="fas fa-heart"></i> Wishlist
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/student/question-answer/">
                            <i className="fas fa-envelope"></i> Q/A
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/student/profile/">
                            <i className="fas fa-gear"></i> Profile & Settings
                          </Link>
                        </li>
                      </ul>
                    </li>

                    {/* Instructor dropdown - shown to all logged in users */}
                    <li className="nav-item dropdown">
                      <Link
                          className="nav-link dropdown-toggle"
                          to="#"
                          role="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                      >
                        <i className="fas fa-chalkboard-user"></i> Instructor
                      </Link>
                      <ul className="dropdown-menu">
                        <li>
                          <Link className="dropdown-item" to="/instructor/dashboard/">
                            <i className="bi bi-grid-fill"></i> Dashboard
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/instructor/courses/">
                            <i className="fas fa-shopping-cart"></i> My Courses
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/instructor/create-course/">
                            <i className="fas fa-plus"></i> Create Course
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/instructor/reviews/">
                            <i className="fas fa-star"></i> Reviews
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/instructor/question-answer/">
                            <i className="fas fa-envelope"></i> Q/A
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/instructor/students/">
                            <i className="fas fa-users"></i> Students
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/instructor/earning/">
                            <i className="fas fa-dollar-sign"></i> Earning
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/instructor/profile/">
                            <i className="fas fa-gear"></i> Settings & Profile
                          </Link>
                        </li>
                      </ul>
                    </li>
                  </ul>
              )}

              {/* Search Form */}
              <form className="d-flex align-items-center" role="search" style={{maxWidth: "600px"}}>
                <div className="input-group">
                  <input
                      className="form-control"
                      type="search"
                      placeholder="Search Courses"
                      aria-label="Search Courses"
                  />
                  <button
                      className="btn btn-gradient-search"
                      type="submit"
                      style={{minWidth: "100px"}}
                  >
                    <i className="fas fa-search ms-2"></i> Search
                  </button>
                </div>
              </form>

              {/* Auth Buttons */}
              <div className="d-flex ms-2">
                {isAuthenticated ? (
                    <>
                      <Link
                          to="/cart/"
                          className="btn btn-success position-relative"
                          style={{minWidth: "100px"}}
                      >
                        <i className="fas fa-shopping-cart me-2"></i>
                        Cart
                        <span
                            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {cartCount}<span className="visually-hidden">items in cart</span>
                  </span>
                      </Link>
                      <button
                          onClick={() => {
                            navigate("/logout");
                          }}
                          className="btn btn-danger ms-2"
                          style={{minWidth: "100px"}}
                      >
                        Logout <i className="fas fa-sign-out-alt"></i>
                      </button>
                    </>
                ) : (
                    <>
                      <Link
                          to="/login/"
                          className="btn btn-gradient-search"
                          style={{minWidth: "100px"}}
                      >
                        Login <i className="fas fa-sign-in-alt"></i>
                      </Link>
                      <Link
                          to="/register/"
                          className="btn btn-gradient-search ms-2"
                          style={{minWidth: "100px"}}
                      >
                        Register <i className="fas fa-user-plus"></i>
                      </Link>
                    </>
                )}
              </div>
            </div>
          </div>
        </nav>
        </div>
        );
        }

        export default BaseHeader;