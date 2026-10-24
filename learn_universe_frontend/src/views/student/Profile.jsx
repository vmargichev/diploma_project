import MediaImage from "../../components/MediaImage.jsx";
import React, { useEffect, useState } from 'react'
import BaseHeader from '../partials/BaseHeader'
import BaseFooter from '../partials/BaseFooter'
import Sidebar from './Partials/Sidebar'
import Header from './Partials/Header'
import UserData from '../plugin/UserData.js'
import { apiInstance } from '../../utils/axios.js'

const FALLBACK = 'https://ui-avatars.com/api/?background=6c757d&color=fff&size=100&name='

function Profile() {
  const user = UserData
  const [profile, setProfile] = useState({ full_name: '', about: '', country: '', image: '' })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    if (!user?.user_id) return
    apiInstance.get(`user/get-user/${user.user_id}/`).then(res => {
      const p = res.data
      setProfile({
        full_name: p.full_name || '',
        about: p.about || '',
        country: p.country || '',
        image: p.image || '',
      })
    }).catch(err => console.error(err))
  }, [])

  const handleImageChange = e => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!user?.user_id) return
    setSaving(true)
    setMessage(null)

    const formData = new FormData()
    formData.append('full_name', profile.full_name)
    formData.append('about', profile.about)
    formData.append('country', profile.country)
    if (imageFile) formData.append('image', imageFile)

    try {
      await apiInstance.patch(`user/get-user/${user.user_id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setMessage({ type: 'success', text: 'Profile updated successfully.' })
      setImageFile(null)
    } catch (err) {
      setMessage({ type: 'danger', text: 'Failed to update profile.' })
    } finally {
      setSaving(false)
    }
  }

  const avatarSrc =
    imagePreview ||
    profile.image ||
    `${FALLBACK}${encodeURIComponent(profile.full_name || 'U')}`

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
                  <h3 className="mb-0">Profile Details</h3>
                  <p className="mb-0">You have full control to manage your own account settings.</p>
                </div>

                <form className="card-body" onSubmit={handleSubmit}>
                  {message && (
                    <div className={`alert alert-${message.type} py-2`}>{message.text}</div>
                  )}

                  <div className="d-lg-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center mb-4 mb-lg-0">
                      <MediaImage kind="avatar"
                        src={avatarSrc}
                        id="img-uploaded"
                        className="avatar-xl rounded-circle"
                        alt="avatar"
                        style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover' }}
                        onError={e => {
                          e.target.src = `${FALLBACK}${encodeURIComponent(profile.full_name || 'U')}`
                        }}
                      />
                      <div className="ms-3">
                        <h4 className="mb-0">Your avatar</h4>
                        <p className="mb-0">PNG or JPG no bigger than 800px wide and tall.</p>
                        <input
                          type="file"
                          className="form-control mt-3"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </div>
                    </div>
                  </div>

                  <hr className="my-5" />

                  <div>
                    <h4 className="mb-0">Personal Details</h4>
                    <p className="mb-4">Edit your personal information and address.</p>

                    <div className="row gx-3">
                      <div className="mb-3 col-12">
                        <label className="form-label" htmlFor="fname">Full Name</label>
                        <input
                          type="text"
                          id="fname"
                          className="form-control"
                          placeholder="Full Name"
                          value={profile.full_name}
                          onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="mb-3 col-12">
                        <label className="form-label">About Me</label>
                        <textarea
                          rows="5"
                          className="form-control"
                          placeholder="Tell us about yourself…"
                          value={profile.about}
                          onChange={e => setProfile(p => ({ ...p, about: e.target.value }))}
                        />
                      </div>

                      <div className="mb-3 col-12">
                        <label className="form-label" htmlFor="country">Country</label>
                        <input
                          type="text"
                          id="country"
                          className="form-control"
                          placeholder="Country"
                          value={profile.country}
                          onChange={e => setProfile(p => ({ ...p, country: e.target.value }))}
                        />
                      </div>

                      <div className="col-12">
                        <button className="btn btn-primary" type="submit" disabled={saving}>
                          {saving
                            ? <><span className="spinner-border spinner-border-sm me-1" />Saving…</>
                            : <><i className="fas fa-check-circle me-1"></i>Update Profile</>}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <BaseFooter />
    </>
  )
}

export default Profile
