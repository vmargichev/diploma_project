import MediaImage from "../../components/MediaImage.jsx";
import React, { useEffect, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import moment from 'moment'

import Sidebar from './Partials/Sidebar'
import Header from './Partials/Header'
import BaseHeader from '../partials/BaseHeader'
import BaseFooter from '../partials/BaseFooter'
import UserData from '../plugin/UserData.js'
import { apiInstance } from '../../utils/axios.js'

const FALLBACK_AVATAR = 'https://ui-avatars.com/api/?background=6c757d&color=fff&size=40&name='

function Avatar({ profile }) {
  const name = encodeURIComponent(profile?.full_name || 'U')
  const src = profile?.image || `${FALLBACK_AVATAR}${name}`
  return (
    <MediaImage kind="avatar"
      src={src}
      alt="avatar"
      style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      onError={e => { e.target.src = `${FALLBACK_AVATAR}${name}` }}
    />
  )
}

function QADetail() {
  const { course_id } = useParams()
  const { state } = useLocation()
  const courseName = state?.courseName || 'This Course'
  const user = UserData

  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(true)
  const [newQ, setNewQ] = useState({ title: '', message: '' })
  const [replies, setReplies] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const fetchThreads = () => {
    apiInstance
      .get(`student/question-answer-list-create/${course_id}/`)
      .then(res => setThreads(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchThreads()
  }, [course_id])

  const handleNewQuestion = async e => {
    e.preventDefault()
    if (!newQ.title.trim() || !newQ.message.trim()) return
    setSubmitting(true)
    try {
      await apiInstance.post(`student/question-answer-list-create/${course_id}/`, {
        course_id,
        user_id: user?.user_id,
        title: newQ.title,
        message: newQ.message,
      })
      setNewQ({ title: '', message: '' })
      fetchThreads()
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReply = async (e, qa_id) => {
    e.preventDefault()
    const message = replies[qa_id] || ''
    if (!message.trim()) return
    setSubmitting(true)
    try {
      await apiInstance.post('student/question-answer-message-create/', {
        course_id,
        qa_id,
        user_id: user?.user_id,
        message,
      })
      setReplies(prev => ({ ...prev, [qa_id]: '' }))
      fetchThreads()
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
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
              <h4 className="mb-1">
                <i className="fas fa-envelope me-2"></i>Q&amp;A
              </h4>
              <p className="text-muted mb-4">
                Course: <strong>{courseName}</strong> &mdash; {threads.length} thread{threads.length !== 1 ? 's' : ''}
              </p>

              {/* New question form */}
              <div className="card mb-4">
                <div className="card-header fw-semibold">
                  <i className="fas fa-plus-circle me-2"></i>Ask a New Question
                </div>
                <div className="card-body">
                  <form onSubmit={handleNewQuestion}>
                    <input
                      className="form-control mb-2"
                      placeholder="Question title"
                      value={newQ.title}
                      onChange={e => setNewQ(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                    <textarea
                      className="form-control mb-3"
                      rows={2}
                      placeholder="Describe your question in more detail…"
                      value={newQ.message}
                      onChange={e => setNewQ(prev => ({ ...prev, message: e.target.value }))}
                      required
                    />
                    <button className="btn btn-primary btn-sm" type="submit" disabled={submitting}>
                      {submitting ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                      Post Question <i className="fas fa-paper-plane ms-1"></i>
                    </button>
                  </form>
                </div>
              </div>

              {/* Thread list */}
              {loading && (
                <div className="text-center py-5">
                  <span className="spinner-border" />
                </div>
              )}

              {!loading && threads.length === 0 && (
                <div className="text-muted text-center py-4">
                  No questions yet — be the first to ask!
                </div>
              )}

              {threads.map(thread => (
                <div className="card mb-4" key={thread.qa_id}>
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <strong>{thread.title}</strong>
                    <span className="text-muted" style={{ fontSize: 12 }}>
                      {moment(thread.date).fromNow()}
                    </span>
                  </div>

                  <div className="card-body p-3">
                    {/* Messages */}
                    <ul className="list-unstyled mb-3">
                      {thread.messages?.map(msg => (
                        <li key={msg.qam_id} className="d-flex mb-3">
                          <Avatar profile={msg.profile} />
                          <div className="ms-2 bg-light rounded p-3 w-100">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <span className="fw-semibold" style={{ fontSize: 14 }}>
                                {msg.profile?.full_name || 'Unknown'}
                              </span>
                              <span className="text-muted" style={{ fontSize: 12 }}>
                                {moment(msg.date).fromNow()}
                              </span>
                            </div>
                            <p className="mb-0">{msg.message}</p>
                          </div>
                        </li>
                      ))}
                    </ul>

                    {/* Reply form */}
                    <form onSubmit={e => handleReply(e, thread.qa_id)} className="d-flex gap-2">
                      <textarea
                        className="form-control"
                        rows={1}
                        placeholder="Write a reply…"
                        value={replies[thread.qa_id] || ''}
                        onChange={e =>
                          setReplies(prev => ({ ...prev, [thread.qa_id]: e.target.value }))
                        }
                      />
                      <button
                        className="btn btn-outline-primary btn-sm"
                        type="submit"
                        disabled={submitting}
                        title="Send reply"
                      >
                        <i className="fas fa-paper-plane"></i>
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <BaseFooter />
    </>
  )
}

export default QADetail
