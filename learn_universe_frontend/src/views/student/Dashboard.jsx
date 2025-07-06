import React, {useEffect, useState} from 'react'
import { Link } from 'react-router-dom'

import BaseHeader from '../partials/BaseHeader'
import BaseFooter from '../partials/BaseFooter'
import Sidebar from './Partials/Sidebar'
import Header from './Partials/Header'
import UserData from "../plugin/UserData.js";
import {apiInstance} from "../../utils/axios.js";
import moment from "moment";


function Dashboard() {

    const [courses, setCourses] = useState([]);
    const [stats, setStats] = useState([]);
    const [fetching, setFetching] = useState(true);
    const [search, setSearch] = useState("");
    const user = UserData;
    const fetchData = async () => {
        try{
            const res = await apiInstance.get(`student/summary/${user.user_id}/`)
            setStats(res.data[0])

        } catch (error) {
            console.log("Error: ", error.data.message)
        }
        try{
            const res = await apiInstance.get(`student/course-list/${user.user_id}/`)
            setCourses(res.data)

        } catch (error) {
            console.log("Error: ", error.data.message)
        }

    }

    const handleSearch = (event) => {
            const query = event.target.value.toLowerCase();

        if ( query === "") {
            fetchData();
        } else {
            const filtered = courses.filter((course) => {
                return course.course.title.toLowerCase().includes(query)
            })
            setCourses(filtered);
        }
        }

    useEffect(() => {
        fetchData();
    }, []);


    return (
        <>
            <BaseHeader />

            <section className="pt-5 pb-5">
                <div className="container">
                    {/* Header Here */}
                    <Header />
                    <div className="row mt-0 mt-md-4">
                        {/* Sidebar Here */}
                        <Sidebar />
                        <div className="col-lg-9 col-md-8 col-12">
                            <div className="row mb-4">
                                <h4 className="mb-0 mb-4"> <i className='bi bi-grid-fill'></i> Dashboard</h4>
                                {/* Counter item */}

                                <div className="col-sm-6 col-lg-4 mb-3 mb-lg-0">
                                    <div className="d-flex justify-content-center align-items-center p-4 bg-warning bg-opacity-10 rounded-3">
                                        <span className="display-6 lh-1 text-orange mb-0">
                                            <i className="fas fa-tv fa-fw" />
                                        </span>
                                        <div className="ms-4">
                                            <div className="d-flex">
                                                <h5 className="purecounter mb-0 fw-bold" >{stats.total_courses || 0}</h5>
                                            </div>
                                            <p className="mb-0 h6 fw-light">Total Courses</p>
                                        </div>
                                    </div>
                                </div>
                                {/* Counter item */}
                                <div className="col-sm-6 col-lg-4 mb-3 mb-lg-0">
                                    <div className="d-flex justify-content-center align-items-center p-4 bg-danger bg-opacity-10 rounded-3">
                                        <span className="display-6 lh-1 text-purple mb-0">
                                            <i className="fas fa-clipboard-check fa-fw" />
                                        </span>
                                        <div className="ms-4">
                                            <div className="d-flex">
                                                <h5 className="purecounter mb-0 fw-bold" > {stats.completed_lessons || 0 }</h5>
                                            </div>
                                            <p className="mb-0 h6 fw-light">Complete lessons</p>
                                        </div>
                                    </div>
                                </div>
                                {/* Counter item */}
                                <div className="col-sm-6 col-lg-4 mb-3 mb-lg-0">
                                    <div className="d-flex justify-content-center align-items-center p-4 bg-success bg-opacity-10 rounded-3">
                                        <span className="display-6 lh-1 text-success mb-0">
                                            <i className="fas fa-medal fa-fw" />
                                        </span>
                                        <div className="ms-4">
                                            <div className="d-flex">
                                                <h5 className="purecounter mb-0 fw-bold" > {stats.achieved_certificates || 0 }</h5>
                                            </div>
                                            <p className="mb-0 h6 fw-light">Achieved Certificates</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card mb-4">
                                <div className="card-header">
                                    <h3 className="mb-0">Courses</h3>
                                    <span>
                                        Start watching courses now from your dashboard page.
                                    </span>
                                </div>
                                <div className="card-body">
                                    <form className="row gx-3">
                                        <div className="col-lg-12 col-md-12 col-12 mb-lg-0 mb-2">
                                            <input
                                                type="search"
                                                className="form-control"
                                                placeholder="Search Your Courses"
                                                onChange={handleSearch}
                                            />
                                        </div>
                                    </form>
                                </div>
                                <div className="table-responsive overflow-y-hidden">
                                    <table className="table mb-0 text-nowrap table-hover table-centered text-nowrap">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Courses</th>
                                                <th>Date Enrolled</th>
                                                <th>Lectures</th>
                                                <th>Completed</th>
                                                <th>Action</th>
                                                <th />
                                            </tr>
                                        </thead>
                                        <tbody>
                                        {courses?.map((course, index) => (
                                            <tr key={course.id}>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div>
                                                            <Link to={`/student/courses/${course.enrollment_id}`} className="text-decoration-none">
                                                                <img
                                                                    src={course.course.image}
                                                                    alt={course.course.title}
                                                                    className="rounded img-4by3-lg"
                                                                    style={{
                                                                        width: "100px",
                                                                        height: "70px",
                                                                        borderRadius: "50%",
                                                                        objectFit: "cover"
                                                                    }}
                                                                />
                                                            </Link>
                                                        </div>
                                                        <div className="ms-3">
                                                            <h4 className="mb-1 h5">
                                                                <a href="#"
                                                                   className="text-inherit text-decoration-none text-dark">
                                                                    {course.course.title}
                                                                </a>
                                                            </h4>
                                                            <ul className="list-inline fs-6 mb-0">
                                                                <li className="list-inline-item">
                                                                    <i className='fas fa-user'></i>
                                                                    <span className='ms-1'>{course.course.language}</span>
                                                                </li>
                                                                <li className="list-inline-item">
                                                                    <i className='bi bi-reception-4'></i>
                                                                    <span className='ms-1'>{course.course.level}</span>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><p className='mt-3'>{moment(course.date).format("DD/MM/YY")}</p></td>
                                                <td><p className='mt-3'>{course.course.lectures.length}</p></td>
                                                <td><p className='mt-3'>{course.completed_lesson.length}</p></td>
                                                <td>
                                                    <Link to={`/student/courses/${course.enrollment_id}`} className="text-decoration-none">
                                                    <button className='btn btn-primary btn-sm mt-3'>Continue Course <i
                                                        className='fas fa-arrow-right'></i></button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                        <tr>
                                            <td>
                                               {courses?.length < 1 &&
                                        <p className="mt-4 p-4">No courses found</p>
                                        }
                                            </td>
                                        </tr>

                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <BaseFooter/>
        </>
    )
}

export default Dashboard