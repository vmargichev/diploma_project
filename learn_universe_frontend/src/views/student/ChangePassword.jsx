import React, { useState } from 'react'
import BaseHeader from '../partials/BaseHeader'
import BaseFooter from '../partials/BaseFooter'
import Sidebar from './Partials/Sidebar'
import Header from './Partials/Header'
import UserData from '../plugin/UserData.js'
import { apiInstance } from '../../utils/axios.js'

function ChangePassword() {
  const user = UserData
  const [form, setForm] = useState({ old_password: '', new_password: '', confirm_password: '' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setMessage(null)

    if (form.new_password !== form.confirm_password) {
      setMessage({ type: 'danger', text: 'New passwords do not match.' })
      return
    }
    if (form.new_password.length < 8) {
      setMessage({ type: 'danger', text: 'New password must be at least 8 characters.' })
      return
    }

    setSaving(true)
    try {
      await apiInstance.post('user/update-password/', {
        user_id: user?.user_id,
        old_password: form.old_password,
        new_password: form.new_password,
      })
      setMessage({ type: 'success', text: 'Password updated successfully.' })
      setForm({ old_password: '', new_password: '', confirm_password: '' })
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to update password.'
      setMessage({ type: 'danger', text: errMsg })
    } finally {
      setSaving(false)
    }
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
              <div className="card">
                <div className="card-header">
                  <h3 className="mb-0">Change Password</h3>
                </div>

                <div className="card-body">
                  {message && (
                    <div className={`alert alert-${message.type} py-2`}>{message.text}</div>
                  )}

                  <form onSubmit={handleSubmit} className="row gx-3">
                    <div className="mb-3 col-12">
                      <label className="form-label" htmlFor="old_password">Current Password</label>
                      <input
                        type="password"
                        id="old_password"
                        name="old_password"
                        className="form-control"
                        placeholder="**************"
                        value={form.old_password}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-3 col-12">
                      <label className="form-label" htmlFor="new_password">New Password</label>
                      <input
                        type="password"
                        id="new_password"
                        name="new_password"
                        className="form-control"
                        placeholder="**************"
                        value={form.new_password}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-3 col-12">
                      <label className="form-label" htmlFor="confirm_password">Confirm New Password</label>
                      <input
                        type="password"
                        id="confirm_password"
                        name="confirm_password"
                        className="form-control"
                        placeholder="**************"
                        value={form.confirm_password}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <button className="btn btn-primary" type="submit" disabled={saving}>
                        {saving
                          ? <><span className="spinner-border spinner-border-sm me-1" />Saving…</>
                          : <><i className="fas fa-check-circle me-1"></i>Save New Password</>}
                      </button>
                    </div>
                  </form>
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

export default ChangePassword
