import MediaImage from "../../components/MediaImage.jsx";
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import BaseHeader from '../partials/BaseHeader'
import BaseFooter from '../partials/BaseFooter'
import Sidebar from './Partials/Sidebar'
import Header from './Partials/Header'
import UserData from '../plugin/UserData.js'
import { apiInstance } from '../../utils/axios.js'

function QA() {
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const user = UserData

  useEffect(() => {
    if (!user?.user_id) return
    apiInstance
      .get(`student/course-list/${user.user_id}/`)
      .then(res => setEnrollments(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <BaseHeader />

      <section className="pt-5 pb-5">
        <div className="container">
          <Header />
          <div className="row mt-0 mt-md-4">
            <Sidebar />
            <div className="col-lg-9 col-md-8 col-12">
              <h4 className="mb-4">
                <i className="fas fa-envelope me-2"></i>Question and Answer
              </h4>

              <div className="card mb-4">
                <div className="card-header">
                  <span>All Questions and Answers are listed here</span>
                </div>
                <div className="table-responsive">
                  <table className="table mb-0 table-hover table-centered">
                    <thead className="table-light">
                      <tr>
                        <th>Course</th>
                        <th>Questions</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading && (
                        <tr>
                          <td colSpan={3} className="text-center py-4">
                            <span className="spinner-border spinner-border-sm me-2" />
                            Loading…
                          </td>
                        </tr>
                      )}
                      {!loading && enrollments.length === 0 && (
                        <tr>
                          <td colSpan={3} className="text-center py-4 text-muted">
                            You are not enrolled in any courses yet.
                          </td>
                        </tr>
                      )}
                      {enrollments.map(enrollment => (
                        <tr key={enrollment.enrollment_id}>
                          <td>
                            <div className="d-flex align-items-center">
                              {enrollment.course?.image ? (
                                <MediaImage kind="course"
                                  src={enrollment.course.image}
                                  alt="course"
                                  style={{ width: 80, height: 55, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
                                  className="me-3"
                                />
                              ) : (
                                <div
                                  className="me-3 bg-secondary d-flex align-items-center justify-content-center"
                                  style={{ width: 80, height: 55, borderRadius: 4, flexShrink: 0 }}
                                >
                                  <i className="fas fa-book text-white"></i>
                                </div>
                              )}
                              <span className="fw-semibold">{enrollment.course?.title}</span>
                            </div>
                          </td>
                          <td className="align-middle">
                            {enrollment.question_answer?.length ?? 0}
                          </td>
                          <td className="align-middle">
                            <Link
                              to={`/student/question-answer/${enrollment.course?.id}/`}
                              state={{ courseName: enrollment.course?.title }}
                              className="btn btn-primary btn-sm"
                            >
                              Join Conversation <i className="fas fa-arrow-right ms-1"></i>
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

export default QA
