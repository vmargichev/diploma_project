import React, { useEffect, useState } from 'react'
import moment from 'moment'

import Sidebar from './Partials/Sidebar'
import Header from './Partials/Header'
import BaseHeader from '../partials/BaseHeader'
import BaseFooter from '../partials/BaseFooter'
import UserData from '../plugin/UserData.js'
import { apiInstance } from '../../utils/axios.js'

function TeacherNotification() {
  const user = UserData
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = () => {
    if (!user?.user_id) return
    apiInstance
      .get(`teacher/noti-list/${user.user_id}/`)
      .then(res => setNotifications(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const markAsSeen = noti_id => {
    apiInstance
      .patch(`teacher/noti-detail/${user.user_id}/${noti_id}`, { seen: true })
      .then(() => setNotifications(prev => prev.filter(n => n.id !== noti_id)))
      .catch(err => console.error(err))
  }

  return (
    <>
      <BaseHeader />

      <section className="pt-5 pb-5">
        <div className="container">
          <Header />
          <div className="row mt-0 mt-md-4">
            <Sidebar />
            <div className="col-lg-9 col-md-8 col-12">
              <div className="card mb-4">
                <div className="card-header d-lg-flex align-items-center justify-content-between">
                  <div className="mb-3 mb-lg-0">
                    <h3 className="mb-0">Notifications</h3>
                    <span>Manage all your notifications from here</span>
                  </div>
                  {notifications.length > 0 && (
                    <span className="badge bg-danger fs-6">{notifications.length} unread</span>
                  )}
                </div>

                <div className="card-body">
                  {loading && (
                    <div className="text-center py-4">
                      <span className="spinner-border" />
                    </div>
                  )}

                  {!loading && notifications.length === 0 && (
                    <p className="text-muted text-center py-4">No new notifications.</p>
                  )}

                  <ul className="list-group list-group-flush">
                    {notifications.map(noti => (
                      <li key={noti.id} className="list-group-item p-4 shadow rounded-3 mb-3">
                        <div className="d-flex">
                          <div className="ms-3 mt-2 w-100">
                            <div className="d-flex align-items-center justify-content-between">
                              <h4 className="mb-0">{noti.type}</h4>
                            </div>
                            <div className="mt-2">
                              <p className="mt-1">
                                <span className="me-2 fw-bold">
                                  Date:{' '}
                                  <span className="fw-light">
                                    {moment(noti.date).format('DD/MM/YY')}
                                  </span>
                                </span>
                              </p>
                              <button
                                className="btn btn-outline-secondary btn-sm"
                                type="button"
                                onClick={() => markAsSeen(noti.id)}
                              >
                                Mark as Seen <i className="fas fa-check ms-1"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
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

export default TeacherNotification
