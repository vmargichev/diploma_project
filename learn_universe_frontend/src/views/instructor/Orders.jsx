import React, { useEffect, useState } from 'react'
import moment from 'moment'

import Sidebar from './Partials/Sidebar'
import Header from './Partials/Header'
import BaseHeader from '../partials/BaseHeader'
import BaseFooter from '../partials/BaseFooter'
import UserData from '../plugin/UserData.js'
import { apiInstance } from '../../utils/axios.js'

function Orders() {
  const user = UserData
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.user_id) return
    apiInstance
      .get(`teacher/course-order-list/${user.user_id}/`)
      .then(res => setOrders(res.data))
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
              <div className="card mb-4">
                <div className="card-header border-bottom-0">
                  <h3 className="mb-0">Orders</h3>
                  <span>Order Dashboard is a quick overview of all current orders.</span>
                </div>

                <div className="table-responsive">
                  <table className="table mb-0 text-nowrap table-hover table-centered">
                    <thead className="table-light">
                      <tr>
                        <th>Course</th>
                        <th>Amount</th>
                        <th>Invoice</th>
                        <th>Status</th>
                        <th>Date</th>
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
                      {!loading && orders.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center py-4 text-muted">
                            No orders found.
                          </td>
                        </tr>
                      )}
                      {orders.map(order => (
                        <tr key={order.oid}>
                          <td>
                            <h5 className="mb-0">{order.course?.title || '—'}</h5>
                          </td>
                          <td>${order.price}</td>
                          <td>#{order.oid}</td>
                          <td>
                            <span
                              className={`badge ${
                                order.order?.payment_status === 'Paid'
                                  ? 'bg-success'
                                  : 'bg-warning text-dark'
                              }`}
                            >
                              {order.order?.payment_status || 'Processing'}
                            </span>
                          </td>
                          <td>{moment(order.date).format('MMM D, YYYY')}</td>
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

export default Orders
