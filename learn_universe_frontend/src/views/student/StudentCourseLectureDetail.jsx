import MediaImage from "../../components/MediaImage.jsx";
import React, { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import moment from 'moment'
import ReactPlayer from 'react-player'

import BaseHeader from '../partials/BaseHeader'
import BaseFooter from '../partials/BaseFooter'
import Sidebar from './Partials/Sidebar'
import Header from './Partials/Header'
import UserData from '../plugin/UserData.js'
import { apiInstance } from '../../utils/axios.js'

const FALLBACK_AVATAR = 'https://ui-avatars.com/api/?background=6c757d&color=fff&size=40&name='

function Avatar({ name, src }) {
  const fallback = `${FALLBACK_AVATAR}${encodeURIComponent(name || 'U')}`
  return (
    <MediaImage kind="avatar"
      src={src || fallback}
      alt="avatar"
      style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      onError={e => { e.target.src = fallback }}
    />
  )
}

function StudentCourseLectureDetail() {
  const { enrollment_id } = useParams()
  const user = UserData

  const [enrollment, setEnrollment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeLesson, setActiveLesson] = useState(null)

  // Notes
  const [noteForm, setNoteForm] = useState({ title: '', note: '' })
  const [editNoteId, setEditNoteId] = useState(null)
  const [noteSaving, setNoteSaving] = useState(false)

  // Discussion
  const [threads, setThreads] = useState([])
  const [newQ, setNewQ] = useState({ title: '', message: '' })
  const [replies, setReplies] = useState({})
  const [threadLoading, setThreadLoading] = useState(false)
  const [qaSubmitting, setQaSubmitting] = useState(false)

  // Review
  const [reviewForm, setReviewForm] = useState({ rating: 5, review: '' })
  const [reviewSaving, setReviewSaving] = useState(false)
  const [reviewMsg, setReviewMsg] = useState(null)

  const fetchEnrollment = useCallback(() => {
    if (!user?.user_id) return
    apiInstance
      .get(`student/course-detail/${user.user_id}/${enrollment_id}/`)
      .then(res => {
        setEnrollment(res.data)
        if (!activeLesson) {
          const first = res.data.curriculum?.[0]?.variant_items?.[0]
          if (first) setActiveLesson(first)
        }
        if (res.data.review) {
          setReviewForm({ rating: res.data.review.rating, review: res.data.review.review })
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [enrollment_id, user?.user_id])

  useEffect(() => {
    fetchEnrollment()
  }, [fetchEnrollment])

  const fetchThreads = useCallback(() => {
    const courseId = enrollment?.course?.id
    if (!courseId) return
    setThreadLoading(true)
    apiInstance
      .get(`student/question-answer-list-create/${courseId}/`)
      .then(res => setThreads(res.data))
      .catch(err => console.error(err))
      .finally(() => setThreadLoading(false))
  }, [enrollment?.course?.id])

  useEffect(() => {
    if (enrollment?.course?.id) fetchThreads()
  }, [enrollment?.course?.id, fetchThreads])

  const isCompleted = itemId =>
    enrollment?.completed_lesson?.some(cl => cl.variant_item === itemId) ?? false

  const toggleComplete = itemId => {
    apiInstance
      .post('student/course-completed/', {
        user_id: user.user_id,
        course_id: enrollment.course.id,
        variant_item_id: itemId,
      })
      .then(() => fetchEnrollment())
      .catch(err => console.error(err))
  }

  // --- Notes ---
  const startEditNote = note => {
    setEditNoteId(note.id)
    setNoteForm({ title: note.title, note: note.note })
  }

  const cancelEdit = () => {
    setEditNoteId(null)
    setNoteForm({ title: '', note: '' })
  }

  const saveNote = () => {
    if (!noteForm.title.trim() || !noteForm.note.trim()) return
    setNoteSaving(true)
    const req = editNoteId
      ? apiInstance.patch(
          `student/course-note-detail/${user.user_id}/${enrollment_id}/${editNoteId}/`,
          noteForm
        )
      : apiInstance.post(`student/course-note/${user.user_id}/${enrollment_id}/`, {
          user_id: user.user_id,
          enrollment_id,
          ...noteForm,
        })

    req
      .then(() => {
        setNoteForm({ title: '', note: '' })
        setEditNoteId(null)
        fetchEnrollment()
      })
      .catch(err => console.error(err))
      .finally(() => setNoteSaving(false))
  }

  const deleteNote = noteId => {
    if (!window.confirm('Delete this note?')) return
    apiInstance
      .delete(`student/course-note-detail/${user.user_id}/${enrollment_id}/${noteId}/`)
      .then(() => fetchEnrollment())
      .catch(err => console.error(err))
  }

  // --- Q&A ---
  const handleNewQuestion = e => {
    e.preventDefault()
    if (!newQ.title.trim() || !newQ.message.trim()) return
    setQaSubmitting(true)
    apiInstance
      .post(`student/question-answer-list-create/${enrollment.course.id}/`, {
        course_id: enrollment.course.id,
        user_id: user.user_id,
        title: newQ.title,
        message: newQ.message,
      })
      .then(() => {
        setNewQ({ title: '', message: '' })
        fetchThreads()
      })
      .catch(err => console.error(err))
      .finally(() => setQaSubmitting(false))
  }

  const handleReply = (e, qa_id) => {
    e.preventDefault()
    const message = replies[qa_id] || ''
    if (!message.trim()) return
    setQaSubmitting(true)
    apiInstance
      .post('student/question-answer-message-create/', {
        course_id: enrollment.course.id,
        qa_id,
        user_id: user.user_id,
        message,
      })
      .then(() => {
        setReplies(prev => ({ ...prev, [qa_id]: '' }))
        fetchThreads()
      })
      .catch(err => console.error(err))
      .finally(() => setQaSubmitting(false))
  }

  // --- Review ---
  const handleSubmitReview = e => {
    e.preventDefault()
    setReviewSaving(true)
    setReviewMsg(null)

    const req = enrollment?.review?.id
      ? apiInstance.patch(
          `student/review-detail/${user.user_id}/${enrollment.review.id}/`,
          reviewForm
        )
      : apiInstance.post('student/rate-course/', {
          user_id: user.user_id,
          course_id: enrollment.course.id,
          rating: reviewForm.rating,
          review: reviewForm.review,
        })

    req
      .then(() => {
        setReviewMsg({ type: 'success', text: 'Review saved successfully.' })
        fetchEnrollment()
      })
      .catch(() => setReviewMsg({ type: 'danger', text: 'Failed to save review.' }))
      .finally(() => setReviewSaving(false))
  }

  if (loading) {
    return (
      <>
        <BaseHeader />
        <div className="container py-5 text-center">
          <span className="spinner-border" />
        </div>
        <BaseFooter />
      </>
    )
  }

  if (!enrollment) {
    return (
      <>
        <BaseHeader />
        <div className="container py-5 text-center text-muted">Enrollment not found.</div>
        <BaseFooter />
      </>
    )
  }

  const notes = enrollment.note || []
  const completedCount = enrollment.completed_lesson?.length ?? 0
  const totalLectures = enrollment.lectures?.length ?? 0

  return (
    <>
      <BaseHeader />

      <section className="pt-5 pb-5">
        <div className="container">
          <Header />
          <div className="row mt-0 mt-md-4">
            <Sidebar />
            <div className="col-lg-9 col-md-8 col-12">

              {/* Video Player */}
              <div className="mb-4 bg-dark rounded overflow-hidden">
                {activeLesson?.file ? (
                  <ReactPlayer
                    url={activeLesson.file}
                    width="100%"
                    height={420}
                    controls
                  />
                ) : (
                  <div
                    className="d-flex align-items-center justify-content-center text-white"
                    style={{ height: 420 }}
                  >
                    <div className="text-center">
                      <i className="fas fa-play-circle fa-4x mb-3 opacity-50"></i>
                      <p className="mb-0">
                        {activeLesson
                          ? activeLesson.title
                          : 'Select a lecture from the curriculum below'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {activeLesson && (
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="mb-0">{activeLesson.title}</h5>
                  <button
                    className={`btn btn-sm ${isCompleted(activeLesson.id) ? 'btn-success' : 'btn-outline-success'}`}
                    onClick={() => toggleComplete(activeLesson.variant_item_id)}
                  >
                    <i className={`fas fa-${isCompleted(activeLesson.id) ? 'check-circle' : 'circle'} me-1`}></i>
                    {isCompleted(activeLesson.id) ? 'Completed' : 'Mark Complete'}
                  </button>
                </div>
              )}

              {/* Progress bar */}
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-1">
                  <small className="text-muted">Progress</small>
                  <small className="text-muted">
                    {completedCount} / {totalLectures} lectures
                  </small>
                </div>
                <div className="progress" style={{ height: 8 }}>
                  <div
                    className="progress-bar bg-success"
                    style={{
                      width: totalLectures
                        ? `${Math.round((completedCount / totalLectures) * 100)}%`
                        : '0%',
                    }}
                  />
                </div>
              </div>

              {/* Tabs */}
              <div className="card shadow rounded-2 p-0">
                <div className="card-header border-bottom px-4 pt-3 pb-0">
                  <ul className="nav nav-bottom-line py-0" role="tablist">
                    {[
                      ['course-pills-1', 'Course Lectures'],
                      ['course-pills-2', 'Notes'],
                      ['course-pills-3', 'Discussion'],
                      ['course-pills-4', 'Leave a Review'],
                    ].map(([target, label], i) => (
                      <li key={target} className="nav-item me-2 me-sm-4" role="presentation">
                        <button
                          className={`nav-link mb-2 mb-md-0${i === 0 ? ' active' : ''}`}
                          data-bs-toggle="pill"
                          data-bs-target={`#${target}`}
                          type="button"
                          role="tab"
                        >
                          {label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="card-body p-sm-4">
                  <div className="tab-content">

                    {/* Tab 1: Curriculum */}
                    <div className="tab-pane fade show active" id="course-pills-1" role="tabpanel">
                      <div className="accordion" id="curriculumAccordion">
                        {enrollment.curriculum?.map((variant, vi) => (
                          <div className="accordion-item border mb-2" key={variant.id}>
                            <h2 className="accordion-header">
                              <button
                                className="accordion-button collapsed fw-semibold"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target={`#section-${vi}`}
                              >
                                {variant.title}
                                <span className="ms-2 text-muted fw-normal" style={{ fontSize: 13 }}>
                                  ({variant.variant_items?.length ?? 0} lectures)
                                </span>
                              </button>
                            </h2>
                            <div id={`section-${vi}`} className="accordion-collapse collapse">
                              <div className="accordion-body p-0">
                                <ul className="list-group list-group-flush">
                                  {variant.variant_items?.map(item => (
                                    <li
                                      key={item.id}
                                      className={`list-group-item d-flex align-items-center justify-content-between px-3 py-2 ${
                                        activeLesson?.id === item.id ? 'bg-light' : ''
                                      }`}
                                      style={{ cursor: 'pointer' }}
                                      onClick={() => setActiveLesson(item)}
                                    >
                                      <div className="d-flex align-items-center gap-2">
                                        <i
                                          className={`fas fa-${
                                            isCompleted(item.id) ? 'check-circle text-success' : 'play-circle text-primary'
                                          }`}
                                        ></i>
                                        <span>{item.title}</span>
                                        {item.preview && (
                                          <span className="badge bg-info text-dark ms-1" style={{ fontSize: 10 }}>
                                            Preview
                                          </span>
                                        )}
                                      </div>
                                      <small className="text-muted">
                                        {item.content_duration || ''}
                                      </small>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tab 2: Notes */}
                    <div className="tab-pane fade" id="course-pills-2" role="tabpanel">
                      <div className="mb-4">
                        <h5 className="mb-3">{editNoteId ? 'Edit Note' : 'Add a Note'}</h5>
                        <input
                          className="form-control mb-2"
                          placeholder="Note title"
                          value={noteForm.title}
                          onChange={e => setNoteForm(f => ({ ...f, title: e.target.value }))}
                        />
                        <textarea
                          className="form-control mb-2"
                          rows={3}
                          placeholder="Write your note…"
                          value={noteForm.note}
                          onChange={e => setNoteForm(f => ({ ...f, note: e.target.value }))}
                        />
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={saveNote}
                            disabled={noteSaving}
                          >
                            {noteSaving
                              ? <span className="spinner-border spinner-border-sm me-1" />
                              : null}
                            {editNoteId ? 'Update Note' : 'Save Note'}
                          </button>
                          {editNoteId && (
                            <button className="btn btn-secondary btn-sm" onClick={cancelEdit}>
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>

                      {notes.length === 0 ? (
                        <p className="text-muted">No notes yet. Add your first note above.</p>
                      ) : (
                        <div className="vstack gap-3">
                          {notes.map(note => (
                            <div className="card" key={note.id}>
                              <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start">
                                  <div>
                                    <h6 className="mb-1">{note.title}</h6>
                                    <p className="mb-0 text-muted" style={{ whiteSpace: 'pre-wrap' }}>
                                      {note.note}
                                    </p>
                                  </div>
                                  <div className="d-flex gap-2 ms-3">
                                    <button
                                      className="btn btn-outline-primary btn-sm"
                                      onClick={() => startEditNote(note)}
                                    >
                                      <i className="fas fa-edit"></i>
                                    </button>
                                    <button
                                      className="btn btn-outline-danger btn-sm"
                                      onClick={() => deleteNote(note.id)}
                                    >
                                      <i className="fas fa-trash"></i>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Tab 3: Discussion */}
                    <div className="tab-pane fade" id="course-pills-3" role="tabpanel">
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
                              onChange={e => setNewQ(q => ({ ...q, title: e.target.value }))}
                              required
                            />
                            <textarea
                              className="form-control mb-3"
                              rows={2}
                              placeholder="Describe your question…"
                              value={newQ.message}
                              onChange={e => setNewQ(q => ({ ...q, message: e.target.value }))}
                              required
                            />
                            <button className="btn btn-primary btn-sm" type="submit" disabled={qaSubmitting}>
                              {qaSubmitting ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                              Post Question <i className="fas fa-paper-plane ms-1"></i>
                            </button>
                          </form>
                        </div>
                      </div>

                      {threadLoading && (
                        <div className="text-center py-3">
                          <span className="spinner-border spinner-border-sm" />
                        </div>
                      )}

                      {!threadLoading && threads.length === 0 && (
                        <p className="text-muted text-center py-3">No questions yet — be the first!</p>
                      )}

                      {threads.map(thread => (
                        <div className="card mb-3" key={thread.qa_id}>
                          <div className="card-header d-flex justify-content-between align-items-center">
                            <strong>{thread.title}</strong>
                            <small className="text-muted">{moment(thread.date).fromNow()}</small>
                          </div>
                          <div className="card-body p-3">
                            <ul className="list-unstyled mb-3">
                              {thread.messages?.map(msg => (
                                <li key={msg.qam_id} className="d-flex mb-3">
                                  <Avatar
                                    name={msg.profile?.full_name}
                                    src={msg.profile?.image}
                                  />
                                  <div className="ms-2 bg-light rounded p-3 w-100">
                                    <div className="d-flex justify-content-between mb-1">
                                      <span className="fw-semibold" style={{ fontSize: 14 }}>
                                        {msg.profile?.full_name || 'Unknown'}
                                      </span>
                                      <small className="text-muted">{moment(msg.date).fromNow()}</small>
                                    </div>
                                    <p className="mb-0">{msg.message}</p>
                                  </div>
                                </li>
                              ))}
                            </ul>

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
                                disabled={qaSubmitting}
                              >
                                <i className="fas fa-paper-plane"></i>
                              </button>
                            </form>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Tab 4: Leave a Review */}
                    <div className="tab-pane fade" id="course-pills-4" role="tabpanel">
                      <h5 className="mb-3">
                        {enrollment.review ? 'Update Your Review' : 'Leave a Review'}
                      </h5>

                      {reviewMsg && (
                        <div className={`alert alert-${reviewMsg.type} py-2 mb-3`}>
                          {reviewMsg.text}
                        </div>
                      )}

                      <form onSubmit={handleSubmitReview}>
                        <div className="mb-3">
                          <label className="form-label fw-semibold">Rating</label>
                          <div className="d-flex gap-2">
                            {[1, 2, 3, 4, 5].map(star => (
                              <button
                                key={star}
                                type="button"
                                className="btn p-0 border-0"
                                onClick={() => setReviewForm(f => ({ ...f, rating: star }))}
                                style={{ fontSize: 28 }}
                              >
                                <i
                                  className={`fas fa-star ${
                                    star <= reviewForm.rating ? 'text-warning' : 'text-muted'
                                  }`}
                                ></i>
                              </button>
                            ))}
                            <span className="align-self-center ms-2 text-muted">
                              {reviewForm.rating} / 5
                            </span>
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-semibold">Your Review</label>
                          <textarea
                            className="form-control"
                            rows={4}
                            placeholder="Share your experience with this course…"
                            value={reviewForm.review}
                            onChange={e => setReviewForm(f => ({ ...f, review: e.target.value }))}
                            required
                          />
                        </div>

                        <button className="btn btn-primary" type="submit" disabled={reviewSaving}>
                          {reviewSaving
                            ? <><span className="spinner-border spinner-border-sm me-1" />Saving…</>
                            : <><i className="fas fa-star me-1"></i>
                              {enrollment.review ? 'Update Review' : 'Submit Review'}</>}
                        </button>
                      </form>
                    </div>

                  </div>
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

export default StudentCourseLectureDetail
