import MediaImage from "../../components/MediaImage.jsx";
import React, {useEffect, useState} from 'react';
import Sidebar from './Partials/Sidebar';
import Header from './Partials/Header';
import BaseHeader from '../partials/BaseHeader';
import BaseFooter from '../partials/BaseFooter';
import {apiInstance} from "../../utils/axios.js";
import UserData from "../plugin/UserData.js";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import {Link} from "react-router-dom";

function Dashboard() {
    const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
    const [courses, setCourses] = useState([]);

    const userId = UserData.user_id

    const fetchCourses = () => {
      apiInstance.get(`teacher/course-lists/${userId}`).then((res) => {
          setCourses(res.data)
      })
    };

    const handleDeleteCourse = (courseId) => {
        apiInstance.delete(`/teacher/course-delete/${courseId}/`, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${Cookies.get("access_token")}`
            }
          }).then((res) => {

            Swal.fire({
            toast: true,
            position: "top",
            icon: "success",
            title: res.data.message,
            showConfirmButton: false,
            timer: 1600,
            });
            fetchCourses();
        })


    };

    useEffect(() => {
        fetchCourses()

    }, []);

    return (
        <>
            <BaseHeader />

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
                                                                <MediaImage kind="course"
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
                                                    <td><p className='mt-3'>{course?.students?.length}</p></td>
                                                    <td>
                                                        <span className={`mt-3 badge ${course.level === 'Intermediate' ? 'bg-success' : 'bg-primary'}`}>
                                                            {course.level}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`mt-3 badge ${course.platform_status === 'Published' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                                                            {course.platform_status}
                                                        </span>
                                                    </td>
                                                    <td><p className='mt-3'>{course.date}</p></td>
                                                    <td>
                                                        <Link
                                                            to={`/instructor/edit-course/${course.id}/`}
                                                            className="btn btn-primary btn-sm mt-3 me-1"
                                                            title="Edit Course"
                                                          >
                                                            <i className="fas fa-edit"></i>
                                                          </Link>
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