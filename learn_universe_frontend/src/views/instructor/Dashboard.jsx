// import React from 'react'
// import Sidebar from './Partials/Sidebar'
// import Header from './Partials/Header'
//
// import BaseHeader from '../partials/BaseHeader'
// import BaseFooter from '../partials/BaseFooter'
//
// function Dashboard() {
//
//     return (
//         <>
//             <BaseHeader />
//
//             <section className="pt-5 pb-5">
//                 <div className="container">
//                     {/* Header Here */}
//                     <Header />
//                     <div className="row mt-0 mt-md-4">
//                         {/* Sidebar Here */}
//                         <Sidebar />
//                         <div className="col-lg-9 col-md-8 col-12">
//                             <div className="row mb-4">
//                                 <h4 className="mb-0 mb-4"> <i className='bi bi-grid-fill'></i> Dashboard</h4>
//                                 {/* Counter item */}
//
//                                 <div className="col-sm-6 col-lg-4 mb-3 mb-lg-0">
//                                     <div className="d-flex justify-content-center align-items-center p-4 bg-warning bg-opacity-10 rounded-3">
//                                         <span className="display-6 lh-1 text-orange mb-0">
//                                             <i className="fas fa-tv fa-fw text-warning" />
//                                         </span>
//                                         <div className="ms-4">
//                                             <div className="d-flex">
//                                                 <h5 className="purecounter mb-0 fw-bold" >0</h5>
//                                             </div>
//                                             <p className="mb-0 h6 fw-light">Total Courses</p>
//                                         </div>
//                                     </div>
//                                 </div>
//                                 {/* Counter item */}
//                                 <div className="col-sm-6 col-lg-4 mb-3 mb-lg-0">
//                                     <div className="d-flex justify-content-center align-items-center p-4 bg-danger bg-opacity-10 rounded-3">
//                                         <span className="display-6 lh-1 text-purple mb-0">
//                                             <i className="fas fa-graduation-cap text-danger fa-fw" />
//                                         </span>
//                                         <div className="ms-4">
//                                             <div className="d-flex">
//                                                 <h5 className="purecounter mb-0 fw-bold" >0</h5>
//                                             </div>
//                                             <p className="mb-0 h6 fw-light">Total Students</p>
//                                         </div>
//                                     </div>
//                                 </div>
//                                 {/* Counter item */}
//                                 <div className="col-sm-6 col-lg-4 mb-3 mb-lg-0">
//                                     <div className="d-flex justify-content-center align-items-center p-4 bg-success bg-opacity-10 rounded-3">
//                                         <span className="display-6 lh-1 text-success mb-0">
//                                             <i className="fas fa-euro-sign fa-fw" />
//                                         </span>
//                                         <div className="ms-4">
//                                             <div className="d-flex">
//                                                 <h5 className="purecounter mb-0 fw-bold" >€0.00</h5>
//                                             </div>
//                                             <p className="mb-0 h6 fw-light">Total Revenue</p>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//
//                             <div className="card mb-4">
//                                 <div className="card-header">
//                                     <h3 className="mb-0">Courses</h3>
//                                     <span>
//                                         Manage your courses from here, earch, view, edit or delete courses.
//                                     </span>
//                                 </div>
//                                 <div className="card-body">
//                                     <form className="row gx-3">
//                                         <div className="col-lg-12 col-md-12 col-12 mb-lg-0 mb-2">
//                                             <input
//                                                 type="search"
//                                                 className="form-control"
//                                                 placeholder="Search Your Courses"
//                                             />
//                                         </div>
//                                     </form>
//                                 </div>
//                                 <div className="table-responsive overflow-y-hidden">
//                                     <table className="table mb-0 text-nowrap table-hover table-centered text-nowrap">
//                                         <thead className="table-light">
//                                             <tr>
//                                                 <th>Courses</th>
//                                                 <th>Enrolled</th>
//                                                 <th>Level</th>
//                                                 <th>Status</th>
//                                                 <th>Date Created</th>
//                                                 <th>Action</th>
//                                                 <th />
//                                             </tr>
//                                         </thead>
//                                         <tbody>
//                                             <tr>
//                                                 <td>
//                                                     <div className="d-flex align-items-center">
//                                                         <div>
//                                                             <a href="#">
//                                                                 <img src="https://geeksui.codescandy.com/geeks/assets/images/course/course-python.jpg" alt="course" className="rounded img-4by3-lg" style={{ width: "100px", height: "70px", borderRadius: "50%", objectFit: "cover" }} />
//                                                             </a>
//                                                         </div>
//                                                         <div className="ms-3">
//                                                             <h4 className="mb-1 h6">
//                                                                 <a href="#" className="text-inherit text-decoration-none text-dark">
//                                                                     Create a Website with WordPress
//                                                                 </a>
//                                                             </h4>
//                                                             <ul className="list-inline fs-6 mb-0">
//                                                                 <li className="list-inline-item">
//                                                                     <small><i className='bi bi-clock-history'></i>
//                                                                         <span className='ms-1'>1hr 30 Mins</span>
//                                                                     </small>
//                                                                 </li>
//                                                                 <li className="list-inline-item">
//                                                                     <small>
//                                                                         <i className='bi bi-reception-4'></i>
//                                                                         <span className='ms-1'>Beginner</span>
//                                                                     </small>
//                                                                 </li>
//                                                                 <li className="list-inline-item">
//                                                                     <small>
//                                                                         <i className='fas fa-euro-sign'></i>
//                                                                         <span>30.99</span>
//                                                                     </small>
//                                                                 </li>
//                                                             </ul>
//                                                         </div>
//                                                     </div>
//                                                 </td>
//                                                 <td><p className='mt-3'>71</p></td>
//                                                 <td><p className='mt-3 badge bg-success' >Intermediate</p></td>
//                                                 <td><p className='mt-3 badge bg-warning text-dark' >Intermediate</p></td>
//                                                 <td><p className='mt-3'>07 Aug, 2025</p></td>
//                                                 <td>
//                                                     <button className='btn btn-primary btn-sm mt-3 me-1'><i className='fas fa-edit'></i></button>
//                                                     <button className='btn btn-danger btn-sm mt-3 me-1'><i className='fas fa-trash'></i></button>
//                                                     <button className='btn btn-secondary btn-sm mt-3 me-1'><i className='fas fa-eye'></i></button>
//                                                 </td>
//                                             </tr>
//
//                                             <tr>
//                                                 <td>
//                                                     <div className="d-flex align-items-center">
//                                                         <div>
//                                                             <a href="#">
//                                                                 <img src="https://geeksui.codescandy.com/geeks/assets/images/course/course-react.jpg" alt="course" className="rounded img-4by3-lg" style={{ width: "100px", height: "70px", borderRadius: "50%", objectFit: "cover" }} />
//                                                             </a>
//                                                         </div>
//                                                         <div className="ms-3">
//                                                             <h4 className="mb-1 h6">
//                                                                 <a href="#" className="text-inherit text-decoration-none text-dark">
//                                                                     Create a Website with WordPress
//                                                                 </a>
//                                                             </h4>
//                                                             <ul className="list-inline fs-6 mb-0">
//                                                                 <li className="list-inline-item">
//                                                                     <small><i className='bi bi-clock-history'></i>
//                                                                         <span className='ms-1'>1hr 30 Mins</span>
//                                                                     </small>
//                                                                 </li>
//                                                                 <li className="list-inline-item">
//                                                                     <small>
//                                                                         <i className='bi bi-reception-4'></i>
//                                                                         <span className='ms-1'>Beginner</span>
//                                                                     </small>
//                                                                 </li>
//                                                                 <li className="list-inline-item">
//                                                                     <small>
//                                                                         <i className='fas fa-euro-sign'></i>
//                                                                         <span>30.99</span>
//                                                                     </small>
//                                                                 </li>
//                                                             </ul>
//                                                         </div>
//                                                     </div>
//                                                 </td>
//                                                 <td><p className='mt-3'>71</p></td>
//                                                 <td><p className='mt-3 badge bg-success' >Intermediate</p></td>
//                                                 <td><p className='mt-3 badge bg-warning text-dark' >Intermediate</p></td>
//                                                 <td><p className='mt-3'>07 Aug, 2025</p></td>
//                                                 <td>
//                                                     <button className='btn btn-primary btn-sm mt-3 me-1'><i className='fas fa-edit'></i></button>
//                                                     <button className='btn btn-danger btn-sm mt-3 me-1'><i className='fas fa-trash'></i></button>
//                                                     <button className='btn btn-secondary btn-sm mt-3 me-1'><i className='fas fa-eye'></i></button>
//                                                 </td>
//                                             </tr>
//                                         </tbody>
//                                     </table>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </section>
//
//             <BaseFooter />
//         </>
//     )
// }
//
// export default Dashboard

import React, { useState } from 'react';
import Sidebar from './Partials/Sidebar';
import Header from './Partials/Header';
import BaseHeader from '../partials/BaseHeader';
import BaseFooter from '../partials/BaseFooter';

function Dashboard() {
    const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
    const [courses, setCourses] = useState([
        {
            id: 1,
            title: "Create a Website with WordPress",
            image: "https://geeksui.codescandy.com/geeks/assets/images/course/course-python.jpg",
            duration: "1hr 30 Mins",
            level: "Beginner",
            price: "30.99",
            enrolled: 71,
            difficulty: "Intermediate",
            status: "Published",
            date: "07 Aug, 2025"
        },
        {
            id: 2,
            title: "React Fundamentals",
            image: "https://geeksui.codescandy.com/geeks/assets/images/course/course-react.jpg",
            duration: "2hr 15 Mins",
            level: "Beginner",
            price: "45.99",
            enrolled: 89,
            difficulty: "Beginner",
            status: "Draft",
            date: "15 Jul, 2025"
        }
    ]);

    const handleDeleteCourse = (courseId) => {
        // In a real app, you would call your API here
        // await axios.delete(`/api/courses/${courseId}`);

        // For demo purposes:
        setCourses(courses.filter(course => course.id !== courseId));
        setShowDeleteSuccess(true);

        // Hide the message after 3 seconds
        setTimeout(() => setShowDeleteSuccess(false), 30000);
    };

    return (
        <>
            <BaseHeader />

            {/* Success Alert */}
            {showDeleteSuccess && (
                <div className="alert alert-success alert-dismissible fade show mb-0 text-center" role="alert">
                    Course successfully deleted!
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setShowDeleteSuccess(false)}
                        aria-label="Close"
                    ></button>
                </div>
            )}

            <section className="pt-5 pb-5">
                <div className="container">
                    <Header />
                    <div className="row mt-0 mt-md-4">
                        <Sidebar />
                        <div className="col-lg-9 col-md-8 col-12">
                            {/* ... existing counter cards ... */}

                            <div className="card mb-4">
                                <div className="card-header">
                                    <h3 className="mb-0">Courses</h3>
                                    <span>
                                        Manage your courses from here, search, view, edit or delete courses.
                                    </span>
                                </div>
                                <div className="card-body">
                                    {/* ... existing search form ... */}
                                </div>
                                <div className="table-responsive overflow-y-hidden">
                                    <table className="table mb-0 text-nowrap table-hover table-centered">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Courses</th>
                                                <th>Enrolled</th>
                                                <th>Level</th>
                                                <th>Status</th>
                                                <th>Date Created</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {courses.map((course) => (
                                                <tr key={course.id}>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <div>
                                                                <img
                                                                    src={course.image}
                                                                    alt={course.title}
                                                                    className="rounded img-4by3-lg"
                                                                    style={{ width: "100px", height: "70px", objectFit: "cover" }}
                                                                />
                                                            </div>
                                                            <div className="ms-3">
                                                                <h4 className="mb-1 h6">
                                                                    <a href="#" className="text-inherit text-decoration-none text-dark">
                                                                        {course.title}
                                                                    </a>
                                                                </h4>
                                                                <ul className="list-inline fs-6 mb-0">
                                                                    <li className="list-inline-item">
                                                                        <small>
                                                                            <i className='bi bi-clock-history'></i>
                                                                            <span className='ms-1'>{course.duration}</span>
                                                                        </small>
                                                                    </li>
                                                                    <li className="list-inline-item">
                                                                        <small>
                                                                            <i className='bi bi-reception-4'></i>
                                                                            <span className='ms-1'>{course.level}</span>
                                                                        </small>
                                                                    </li>
                                                                    <li className="list-inline-item">
                                                                        <small>
                                                                            <i className='fas fa-euro-sign'></i>
                                                                            <span>{course.price}</span>
                                                                        </small>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td><p className='mt-3'>{course.enrolled}</p></td>
                                                    <td>
                                                        <span className={`mt-3 badge ${course.difficulty === 'Intermediate' ? 'bg-success' : 'bg-primary'}`}>
                                                            {course.difficulty}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`mt-3 badge ${course.status === 'Published' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                                                            {course.status}
                                                        </span>
                                                    </td>
                                                    <td><p className='mt-3'>{course.date}</p></td>
                                                    <td>
                                                        <button className='btn btn-primary btn-sm mt-3 me-1'>
                                                            <i className='fas fa-edit'></i>
                                                        </button>
                                                        <button
                                                            className='btn btn-danger btn-sm mt-3 me-1'
                                                            onClick={() => handleDeleteCourse(course.id)}
                                                        >
                                                            <i className='fas fa-trash'></i>
                                                        </button>
                                                        <button className='btn btn-secondary btn-sm mt-3 me-1'>
                                                            <i className='fas fa-eye'></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
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

export default Dashboard;