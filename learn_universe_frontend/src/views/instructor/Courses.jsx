import MediaImage from "../../components/MediaImage.jsx";
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import moment from 'moment'

import Sidebar from './Partials/Sidebar'
import Header from './Partials/Header'
import BaseHeader from '../partials/BaseHeader'
import BaseFooter from '../partials/BaseFooter'
import UserData from '../plugin/UserData.js'
import { apiInstance } from '../../utils/axios.js'
import Cookies from 'js-cookie'

function Courses() {
  const user = UserData
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState(null)

  const fetchCourses = () => {
    if (!user?.user_id) return
    apiInstance
      .get(`teacher/course-lists/${user.user_id}/`)
      .then(res => setCourses(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const handleDelete = async course_id => {
    if (!window.confirm('Disable this course? It will no longer be visible to students.')) return
    setDeleting(course_id)
    try {
      await apiInstance.delete(`teacher/course-delete/${course_id}/`, {
        headers: { Authorization: `Bearer ${Cookies.get('access_token')}` },
      })
      fetchCourses()
    } catch (err) {
      console.error(err)
      alert('Failed to delete course.')
    } finally {
      setDeleting(null)
    }
  }

  const filtered = courses.filter(c =>
    c.title?.toLowerCase().includes(search.toLowerCase())
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
              <div className="row mb-4">
                <h4 className="mb-0 mb-2 mt-4">
                  <i className="bi bi-grid-fill"></i> Courses
                </h4>
              </div>

              <div className="card mb-4">
                <div className="card-header">
                  <span>Manage your courses — search, view, edit or disable courses.</span>
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
                        <th>Enrolled</th>
                        <th>Level</th>
                        <th>Status</th>
                        <th>Date Created</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading && (
                        <tr>
                          <td colSpan={6} className="text-center py-4">
                            <span className="spinner-border spinner-border-sm me-2" />
                            Loading…
                          </td>
                        </tr>
                      )}
                      {!loading && filtered.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-4 text-muted">
                            {search ? 'No courses match your search.' : 'No courses yet. Create your first course!'}
                          </td>
                        </tr>
                      )}
                      {filtered.map(course => (
                        <tr key={course.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              {course.image ? (
                                <MediaImage kind="course"
                                  src={course.image}
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
                                <h5 className="mb-1 h6">{course.title}</h5>
                                <ul className="list-inline fs-6 mb-0">
                                  <li className="list-inline-item">
                                    <small>
                                      <i className="bi bi-reception-4"></i>
                                      <span className="ms-1">{course.level}</span>
                                    </small>
                                  </li>
                                  <li className="list-inline-item">
                                    <small>
                                      <i className="fas fa-dollar-sign"></i>
                                      <span className="ms-1">{course.price}</span>
                                    </small>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </td>
                          <td className="align-middle">{course.students?.length ?? 0}</td>
                          <td className="align-middle">
                            <span className="badge bg-info text-dark">{course.level}</span>
                          </td>
                          <td className="align-middle">
                            <span
                              className={`badge ${
                                course.platform_status === 'Published'
                                  ? 'bg-success'
                                  : course.platform_status === 'Disabled'
                                  ? 'bg-danger'
                                  : 'bg-warning text-dark'
                              }`}
                            >
                              {course.platform_status}
                            </span>
                          </td>
                          <td className="align-middle">{moment(course.date).format('DD MMM, YYYY')}</td>
                          <td className="align-middle">
                            <Link
                              to={`/instructor/edit-course/${course.id}/`}
                              className="btn btn-primary btn-sm me-1"
                            >
                              <i className="fas fa-edit"></i>
                            </Link>
                            <button
                              className="btn btn-danger btn-sm me-1"
                              disabled={deleting === course.id}
                              onClick={() => handleDelete(course.id)}
                            >
                              {deleting === course.id
                                ? <span className="spinner-border spinner-border-sm" />
                                : <i className="fas fa-trash"></i>}
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
  )
}

export default Courses
