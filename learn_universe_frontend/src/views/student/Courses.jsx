import MediaImage from "../../components/MediaImage.jsx";
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import moment from 'moment'

import BaseHeader from '../partials/BaseHeader'
import BaseFooter from '../partials/BaseFooter'
import Sidebar from './Partials/Sidebar'
import Header from './Partials/Header'
import UserData from '../plugin/UserData.js'
import { apiInstance } from '../../utils/axios.js'

function Courses() {
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const user = UserData

  useEffect(() => {
    if (!user?.user_id) return
    apiInstance
      .get(`student/course-list/${user.user_id}/`)
      .then(res => setEnrollments(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const filtered = enrollments.filter(e =>
    e.course?.title?.toLowerCase().includes(search.toLowerCase())
  )

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
                <i className="fas fa-shopping-cart"></i> My Courses
              </h4>

              <div className="card mb-4">
                <div className="card-header">
                  <span>Start watching courses now from your dashboard page.</span>
                </div>
                <div className="card-body">
                  <input
                    type="search"
                    className="form-control"
                    placeholder="Search Your Courses"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>

                <div className="table-responsive overflow-y-hidden">
                  <table className="table mb-0 text-nowrap table-hover table-centered">
                    <thead className="table-light">
                      <tr>
                        <th>Courses</th>
                        <th>Date Enrolled</th>
                        <th>Lectures</th>
                        <th>Completed</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading && (
                        <tr>
                          <td colSpan={5} className="text-center py-4">
                            <span className="spinner-border spinner-border-sm me-2" />
                            Loading…
                          </td>
                        </tr>
                      )}
                      {!loading && filtered.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center py-4 text-muted">
                            {search
                              ? 'No courses match your search.'
                              : 'You are not enrolled in any courses yet.'}
                          </td>
                        </tr>
                      )}
                      {filtered.map(enrollment => (
                        <tr key={enrollment.enrollment_id}>
                          <td>
                            <div className="d-flex align-items-center">
                              {enrollment.course?.image ? (
                                <MediaImage kind="course"
                                  src={enrollment.course.image}
                                  alt="course"
                                  className="rounded"
                                  style={{ width: 100, height: 70, objectFit: 'cover', flexShrink: 0 }}
                                />
                              ) : (
                                <div
                                  className="bg-secondary rounded d-flex align-items-center justify-content-center"
                                  style={{ width: 100, height: 70, flexShrink: 0 }}
                                >
                                  <i className="fas fa-book text-white fs-4"></i>
                                </div>
                              )}
                              <div className="ms-3">
                                <h5 className="mb-1 h6">{enrollment.course?.title}</h5>
                                <ul className="list-inline fs-6 mb-0">
                                  <li className="list-inline-item">
                                    <i className="bi bi-reception-4"></i>
                                    <span className="ms-1">{enrollment.course?.level}</span>
                                  </li>
                                  <li className="list-inline-item">
                                    <i className="bi bi-mic"></i>
                                    <span className="ms-1">{enrollment.course?.language}</span>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </td>
                          <td className="align-middle">
                            {moment(enrollment.date).format('D/M/YYYY')}
                          </td>
                          <td className="align-middle">
                            {enrollment.lectures?.length ?? 0}
                          </td>
                          <td className="align-middle">
                            {enrollment.completed_lesson?.length ?? 0}
                          </td>
                          <td className="align-middle">
                            <Link
                              to={`/student/courses/${enrollment.enrollment_id}/`}
                              className="btn btn-primary btn-sm"
                            >
                              Continue <i className="fas fa-arrow-right ms-1"></i>
                            </Link>
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
  )
}

export default Courses
