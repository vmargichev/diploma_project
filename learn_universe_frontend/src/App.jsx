import {Route, Routes, BrowserRouter} from "react-router-dom";
import {MainWrapper} from "./layouts/MainWrapper.jsx";
import {PrivateRoute} from "./layouts/PrivateRoute.jsx";
import Register from "./views/auth/Register.jsx";
import Login from "./views/auth/Login.jsx";
import './App.css'
import Logout from "./views/auth/Logout.jsx";
import ForgotPassword from "./views/auth/ForgotPassword.jsx";
import CreateNewPassword from "./views/auth/CreateNewPassword.jsx";
import Index from "./views/base/Index.jsx";
import CourseDetail from "./views/base/CourseDetail.jsx";
import Courses from "./views/instructor/Courses.jsx";
import Cart from "./views/base/Cart";
import Checkout from "./views/base/Checkout";
import Success from "./views/base/Success";
import Search from "./views/base/Search";

import StudentDashboard from "./views/student/Dashboard";
import StudentCourses from "./views/student/Courses";
import StudentCourseDetail from "./views/student/CourseDetail";
import Wishlist from "./views/student/Wishlist";
import StudentProfile from "./views/student/Profile";
import StudentChangePassword from "./views/student/ChangePassword";
import Dashboard from "./views/instructor/Dashboard";
import Review from "./views/instructor/Review";
import Students from "./views/instructor/Students";
import Earning from "./views/instructor/Earning";
import Orders from "./views/instructor/Orders";
import Coupon from "./views/instructor/Coupon";
import TeacherNotification from "./views/instructor/TeacherNotification";
import QA from "./views/instructor/QA";
import ChangePassword from "./views/instructor/ChangePassword";
import Profile from "./views/instructor/Profile";
import CourseCreate from "./views/instructor/CourseCreate";
import CourseEdit from "./views/instructor/CourseEdit";
import {useEffect, useState} from "react";
import {apiInstance} from "./utils/axios.js";
import {useContext} from "react";
import {CartContext} from "./views/plugin/Context.js";
// import CourseEditCurriculum from "./views/instructor/CourseEditCurriculum";

function App() {
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
  const fetchCartCount = async () => {
    const existingCartId = localStorage.getItem("cartId");
    if (existingCartId) {
      try {
        const res = await apiInstance.get(`course/cart-list/${existingCartId}/`);
        setCartCount(res.data.length);
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  fetchCartCount();
}, []);
 return (

     <CartContext.Provider value = {[cartCount, setCartCount]}>
         <BrowserRouter>
      <MainWrapper>
       <Routes>
        <Route path="/register/" element={<Register />} />;
        <Route path="/login/" element={<Login />} />;
        <Route path="/logout/" element={<Logout />} />;
           <Route path="/forgot-password/" element={<ForgotPassword />} />;
           <Route path="/create-new-pass/" element={<CreateNewPassword />} />;

           <Route path="" element={<Index />} />;
           <Route path="/course-detail/:slug/" element={<CourseDetail />} />
           <Route path="/cart/" element={<Cart />} />
                            <Route path="/checkout/:order_oid/" element={<Checkout />} />
                            <Route path="/payment-success/:order_oid/" element={<Success />} />
                            <Route path="/search/" element={<Search />} />

                            <Route
                                path="/student/dashboard/"
                                element={
                                    <PrivateRoute>
                                        <StudentDashboard />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/student/courses/"
                                element={
                                    <PrivateRoute>
                                        <StudentCourses />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/student/courses/:enrollment_id/"
                                element={
                                    <PrivateRoute>
                                        <StudentCourseDetail />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/student/wishlist/"
                                element={
                                    <PrivateRoute>
                                        <Wishlist />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/student/profile/"
                                element={
                                    <PrivateRoute>
                                        <StudentProfile />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/student/change-password/"
                                element={
                                    <PrivateRoute>
                                        <StudentChangePassword />
                                    </PrivateRoute>
                                }
                            />

                            {/* Teacher Routes */}

                            <Route
                                path="/instructor/dashboard/"
                                element={
                                    <PrivateRoute>
                                        <Dashboard />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/instructor/dashboard/"
                                element={
                                    <PrivateRoute>
                                        <Dashboard />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/instructor/courses/"
                                element={
                                    <PrivateRoute>
                                        <Courses />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/instructor/reviews/"
                                element={
                                    <PrivateRoute>
                                        <Review />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/instructor/students/"
                                element={
                                    <PrivateRoute>
                                        <Students />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/instructor/earning/"
                                element={
                                    <PrivateRoute>
                                        <Earning />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/instructor/orders/"
                                element={
                                    <PrivateRoute>
                                        <Orders />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/instructor/coupon/"
                                element={
                                    <PrivateRoute>
                                        <Coupon />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/instructor/notifications/"
                                element={
                                    <PrivateRoute>
                                        <TeacherNotification />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/instructor/question-answer/"
                                element={
                                    <PrivateRoute>
                                        <QA />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/instructor/change-password/"
                                element={
                                    <PrivateRoute>
                                        <ChangePassword />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/instructor/profile/"
                                element={
                                    <PrivateRoute>
                                        <Profile />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/instructor/create-course/"
                                element={
                                    <PrivateRoute>
                                        <CourseCreate />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/instructor/edit-course/:course_id/"
                                element={
                                    <PrivateRoute>
                                        <CourseEdit />
                                    </PrivateRoute>
                                }
                            />

       </Routes>
      </MainWrapper>
     </BrowserRouter>
     </CartContext.Provider>

 )
}

export default App
