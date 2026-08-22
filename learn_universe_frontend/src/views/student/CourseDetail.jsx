import React, {useEffect, useRef, useState} from 'react'
import BaseHeader from '../partials/BaseHeader'
import BaseFooter from '../partials/BaseFooter'
import Sidebar from './Partials/Sidebar'
import Header from './Partials/Header'

import ReactPlayer from 'react-player'

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import {apiInstance} from "../../utils/axios.js";
import UserData from "../plugin/UserData.js";
import {useParams} from "react-router-dom";
import {useAuthStore} from "../../store/auths.js";
import Cookies from "js-cookie";
import Cookie from "js-cookie";
import Swal from "sweetalert2";
import {formatDistanceToNow} from "date-fns";
import api from "js-cookie";
import students from "../instructor/Students.jsx";

function CourseDetail() {

  const [show, setShow] = useState(false);
  const [variantItem, setVarianItem] = useState(null);
  const [notes, setNotes] = useState([]);

  const lastElementRef = useRef();
  const handleClose = () => setShow(false);
  const [markAsCompletedStatus, setMarkAsCompletedStats] = useState([]);
  const handleShow = (variant_item) => {
    setShow(true);
    setVarianItem(variant_item)
  }
  const [complPercentage, setComplPercentage] = useState(0);
  const [newNote, setNewNote] = useState({title: "", note: ""})
  const [createReview, setCreateReview] = useState({rating:1, review:""})
  const [studentReview, setStudentReview] = useState({rating:1, review:""})

  const [noteShow, setNoteShow] = useState(false);
  const handleNoteClose = () => {
  setNoteShow(false);
  setNewNote({ title: "", note: "" });
};
  const handleNoteShow = (note = null) => {
  if (note) {
    setSelectedNote(note);
    setNewNote({
      title: note.title,
      note: note.note
    });
  } else {
    setSelectedNote(null);
    setNewNote({ title: "", note: "" });
  }

  setNoteShow(true);
};


  const [ConversationShow, setConversationShow] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const handleConversationClose = () => setConversationShow(false);
  const handleConversationShow = (conversation) => {
    setSelectedConversation(conversation)
    setConversationShow(true);
  }

  const [course, setCourse] = useState([]);
  const userId = UserData?.user_id
  const param = useParams();
  const enrollId = param?.enrollment_id
  const [createMessage, setCreateMessage] = useState({title: "", message: ""});
  const [questions, setQuestions] = useState([]);
  const [addQuestionShow, setAddQuestionShow] = useState(false);
  const handleQuestionClose = () => setAddQuestionShow(false);
  const handleQuestionShow = () => setAddQuestionShow(true);
  const [selectedNote, setSelectedNote] = useState(null);

  const fetchCourse = async () => {
    if (!userId || !enrollId) {
      return
    }
    try {
      const res = await apiInstance.get(`student/course-detail/${userId}/${enrollId}/`)
      setCourse(res.data)
      setQuestions(res.data.question_answer);
      setStudentReview(res.data.review);

      const completedCount = res.data.completed_lesson?.length || 0;
      const totalLectures = res.data.lectures?.length || 0;

      const percentage = totalLectures > 0
          ? Math.round((completedCount / totalLectures) * 100)
          : 0;
      setComplPercentage(percentage);
    } catch (error) {
      console.log("error", error.data)
    }
  }
  const fetchNotes = async () => {
    try {
      apiInstance.get(`student/course-note/${UserData?.user_id}/${param?.enrollment_id}/`).then((res) => {
        setNotes((res.data).reverse())
      })
    } catch (error) {
      console.log("Error", error)
    }
  }
  const handleNoteChange = (event) => {
    setNewNote({
      ...newNote,
      [event.target.name]: event.target.value,
    })
  }

  const createNote = async (event, noteId = null) => {
    event.preventDefault();

    const formdata = new FormData();
    formdata.append("user_id", UserData?.user_id);
    formdata.append("enrollment_id", enrollId);
    formdata.append("title", newNote.title)
    formdata.append("note", newNote.note)
    formdata.append("note_id", noteId)

    try {

    if (noteId) {
      await apiInstance.patch(
        `student/course-note-detail/${UserData?.user_id}/${param?.enrollment_id}/${noteId}/`,
        formdata,
          { headers: {
          Authorization: `Bearer ${Cookie.get("access_token")}`
        }}
      );
    } else {

      await apiInstance.post(
        `student/course-note/${UserData?.user_id}/${param?.enrollment_id}/`,
        formdata,
          { headers: {
          Authorization: `Bearer ${Cookie.get("access_token")}`
        }}
      );
    }

    handleNoteClose();
    fetchNotes();
    fetchCourse();

  } catch (error) {
    await Swal.fire({
      icon: "error",
      toast: true,
      title: "Error",
      text: "An error occurred while saving the note",
    });
    console.log("Error", error);
  }
};
  const handleMarkCompleted = (variantItemId) => {
    const key = `lecture_${variantItemId}`;
    setMarkAsCompletedStats({
      ...markAsCompletedStatus,
      [key]: "Updating"
    })

    const formdata = new FormData()
    formdata.append("user_id", UserData?.user_id || 0)
    formdata.append("course_id", course.course?.id || 0)
    formdata.append("variant_item_id", variantItemId)

    apiInstance.post("student/course-completed/", formdata).then((res) => {
      fetchCourse();
      setMarkAsCompletedStats({
        ...markAsCompletedStatus,
        [key]: "Updated"
      })
    })
  }

  const handleDeleteNote = async (noteId) => {
    try{
      const res = await apiInstance.delete(`student/course-note-detail/${UserData?.user_id}/${enrollId}/${noteId}/`, { headers: {
          Authorization: `Bearer ${Cookie.get("access_token")}`
        }})
      fetchNotes()
    } catch (error) {
      console.log(error.data)
    }

  }

  const handleMessageChange = (event) => {
    setCreateMessage(
        {
          ...createMessage,
          [event.target.name]: event.target.value
        }
    )
  }

  const editNote = async (event, noteId) => {
    event.preventDefault();
    const formdata = new FormData();
    formdata.append("user_id", UserData?.user_id);
    formdata.append("enrollment_id", enrollId);
    formdata.append("title", newNote.title);
    formdata.append("note", newNote.note);

    try {
      await apiInstance.post(`student/course-note-detail/${UserData?.user_id}/${param?.enrollment_id}/${noteId}/`, formdata)
        fetchCourse()
        handleNoteClose()

    } catch (error) {
      await Swal.fire({
        icon: "error",
        toast: true,
        title: "Error",
        text: "Error",
      });
      console.log("Error", error)
    }
  }

  const handleSaveQuestion = async (e) => {
    e.preventDefault()

    const formdata = new FormData();
    formdata.append("user_id", userId);
    formdata.append("course_id", course?.id);
    formdata.append("title", createMessage.title);
    formdata.append("message", createMessage.message);
    try {
      await apiInstance.post(`student/question-answer-list-create/${course?.id}/`, formdata)
        fetchCourse()
        setCreateMessage({title: "", message: ""})
        handleQuestionClose()

    } catch (error) {
      await Swal.fire({
        icon: "error",
        toast: true,
        title: "Error",
        text: "Error",
      });
    }

  }

  const sendNewMessage = async (e) => {
    e.preventDefault();
    try {
      const formdata = new FormData();
      formdata.append("user_id", userId);
      formdata.append("course_id", course?.id);
      formdata.append("qa_id", selectedConversation?.qa_id);
      formdata.append("message", createMessage.message);

      const res = await apiInstance.post(
          'student/question-answer-message-create/',
          formdata,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${Cookies.get("access_token")}`
            }
          }
      );
      setCreateMessage({...createMessage, message: ""});
      setSelectedConversation(res.data.question)
    } catch (error) {
    console.log(error.data)
    }
    }

    const handleSearchQuestion = (event) => {
    const query = event.target.value.toLowerCase();

    if (query === "") {
      fetchCourse()
    } else {
      const filtered = questions?.filter((question) => {
        return question.title.toLowerCase().includes(query)
      })
      setQuestions(filtered)
    }
    }

    const handleReviewChange = (e) => {
  const { name, value } = e.target;
  setStudentReview(prev => ({
    ...prev,
    [name]: name === 'rating' ? parseInt(value) : value
  }));
};

  const handleCreateReviewChange = (e) => {
  const { name, value } = e.target;
  setCreateReview(prev => ({
    ...prev,
    [name]: name === 'rating' ? parseInt(value) : value
  }));
};

    const handleCreateReviewSubmit = async (e) => {
    e.preventDefault();

    const formdata = new FormData();

    formdata.append("user_id", userId);
    formdata.append("course_id", course?.course?.id);
    formdata.append("rating", createReview?.rating);
    formdata.append("review", createReview?.review);

    try{
     const res = await apiInstance.post(
        `student/rate-course/`,
        formdata,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${Cookies.get("access_token")}`
            }
          })

      Swal.fire({
              toast: true,
              position: 'top',
              icon: "success",
              title: res?.data?.message,
              showConfirmButton: false,
              timer: 1500
    });
    } catch (error) {
      Swal.fire({
              toast: true,
              position: 'top',
              icon: "error",
              title: error?.data?.message,
              showConfirmButton: false,
              timer: 1500
    });
    }
    };

   const handleUpdateReviewSubmit = async (e) => {
    e.preventDefault();

    const formdata = new FormData();
    formdata.append("user_id", userId);
    formdata.append("course_id", course?.id);
    formdata.append("rating", studentReview?.rating);
    formdata.append("review", studentReview?.review);

    try{
     const res = await apiInstance.patch(
        `student/review-detail/${userId}/${studentReview?.id}/`,
        formdata,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${Cookies.get("access_token")}`
            }
          })
      Swal.fire({
              toast: true,
              position: 'top',
              icon: "success",
              title: res.data.message,
              showConfirmButton: false,
              timer: 1500
    });
    } catch (error) {
      Swal.fire({
              toast: true,
              position: 'top',
              icon: "error",
              title: error?.data?.message,
              showConfirmButton: false,
              timer: 1500
    });
    }
    };

  useEffect(() => {
    fetchCourse();
    if (lastElementRef.current) {
      lastElementRef.current.scrollIntoView({behavior: "smooth"})
    }

  }, [selectedConversation]);

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
              {/* <section className="bg-blue py-7">
                <div className="container">
                  <ReactPlayer url='https://www.youtube.com/watch?v=LXb3EKWsInQ' width={"100%"} height={600} />
                </div>
              </section> */}
              <section className="mt-4">
                <div className="container">
                  <div className="row">
                    <div className="col-12">
                      <div className="card shadow rounded-2 p-0 mt-n5">
                        <div className="card-header border-bottom px-4 pt-3 pb-0">
                          <ul
                            className="nav nav-bottom-line py-0"
                            id="course-pills-tab"
                            role="tablist"
                          >
                            <li
                              className="nav-item me-2 me-sm-4"
                              role="presentation"
                            >
                              <button
                                className="nav-link mb-2 mb-md-0 active"
                                id="course-pills-tab-1"
                                data-bs-toggle="pill"
                                data-bs-target="#course-pills-1"
                                type="button"
                                role="tab"
                                aria-controls="course-pills-1"
                                aria-selected="true"
                              >
                                Course Lectures
                              </button>
                            </li>
                            {/* Tab item */}
                            <li
                              className="nav-item me-2 me-sm-4"
                              role="presentation"
                            >
                              <button
                                className="nav-link mb-2 mb-md-0"
                                id="course-pills-tab-2"
                                data-bs-toggle="pill"
                                data-bs-target="#course-pills-2"
                                type="button"
                                role="tab"
                                aria-controls="course-pills-2"
                                aria-selected="false"
                                onClick={() => fetchNotes()}
                              >
                                Notes
                              </button>
                            </li>
                            {/* Tab item */}
                            <li
                              className="nav-item me-2 me-sm-4"
                              role="presentation"
                            >
                              <button
                                className="nav-link mb-2 mb-md-0"
                                id="course-pills-tab-3"
                                data-bs-toggle="pill"
                                data-bs-target="#course-pills-3"
                                type="button"
                                role="tab"
                                aria-controls="course-pills-3"
                                aria-selected="false"
                                onClick={fetchCourse}
                              >
                                Discussion
                              </button>
                            </li>

                            <li
                              className="nav-item me-2 me-sm-4"
                              role="presentation"
                            >
                              <button
                                className="nav-link mb-2 mb-md-0"
                                id="course-pills-tab-4"
                                data-bs-toggle="pill"
                                data-bs-target="#course-pills-4"
                                type="button"
                                role="tab"
                                aria-controls="course-pills-4"
                                aria-selected="false"
                              >
                                Leave a Review
                              </button>
                            </li>
                          </ul>
                        </div>
                        {/* Tabs END */}
                        {/* Tab contents START */}
                        <div className="card-body p-sm-4">
                          <div
                            className="tab-content"
                            id="course-pills-tabContent"
                          >
                            {/* Content START */}
                            <div
                              className="tab-pane fade show active"
                              id="course-pills-1"
                              role="tabpanel"
                              aria-labelledby="course-pills-tab-1"
                            >
                              {/* Accordion START */}
                              <div
                                className="accordion accordion-icon accordion-border"
                                id="accordionExample2"
                              >
                                <div className="progress mb-3">
                                  <div
                                    className="progress-bar"
                                    role="progressbar"
                                    style={{ width: `${complPercentage}%` }}
                                    aria-valuenow={complPercentage}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                  >
                                    {complPercentage}%
                                  </div>
                                </div>
                                {course?.curriculum?.map((item, index) => (
                                  <div
                                    className="accordion-item mb-3"
                                    key={item.id}
                                  >
                                    <h6
                                      className="accordion-header font-base"
                                      id="heading-1"
                                    >
                                      <button
                                        className="accordion-button fw-bold rounded d-sm-flex d-inline-block collapsed"
                                        type="button"
                                        data-bs-toggle="collapse"
                                        data-bs-target={`#collapse-${item.variant_id}`}
                                        aria-expanded="true"
                                        aria-controls={`collapse-${item.variant_id}`}
                                      >
                                        {item.title}
                                        <span className="small ms-0 ms-sm-2">
                                          ({item.variant_items.length} Lectures)
                                        </span>
                                      </button>
                                    </h6>
                                    <div
                                      id={`collapse-${item.variant_id}`}
                                      className="accordion-collapse collapse show"
                                      aria-labelledby="heading-1"
                                      data-bs-parent="#accordionExample2"
                                    >
                                      <div className="accordion-body mt-3">
                                        {/* Course lecture */}
                                        {item?.variant_items?.map(
                                          (i, index) => (
                                            <React.Fragment key={i.id}>
                                              <div className="d-flex justify-content-between align-items-center">
                                                <div className="position-relative d-flex align-items-center">
                                                  {i.preview === true ? (
                                                    <button
                                                      onClick={() =>
                                                        handleShow(i)
                                                      }
                                                      className="btn btn-danger-soft btn-round btn-sm mb-0 stretched-link position-static"
                                                      aria-label="Play lesson"
                                                    >
                                                      <i className="fas fa-play me-2" />
                                                    </button>
                                                  ) : (
                                                    <span
                                                      className="btn btn-secondary-soft btn-round btn-sm mb-0 position-static"
                                                      aria-label="Locked lesson"
                                                    >
                                                      <i className="fas fa-lock me-2" />
                                                    </span>
                                                  )}

                                                  <span className="d-inline-block text-truncate ms-2 mb-0 h6 fw-light w-100px w-sm-200px w-md-400px">
                                                    {i.title}
                                                  </span>
                                                </div>
                                                <div className="d-flex">
                                                  <p className="mb-0 me-2">
                                                    {i.preview === true &&
                                                      (i.duration || "00:00")}
                                                  </p>
                                                  {i.preview === true && (
                                                    <input
                                                      type="checkbox"
                                                      onChange={() =>
                                                        handleMarkCompleted(
                                                          i.variant_item_id,
                                                        )
                                                      }
                                                      checked={course.completed_lesson?.some(
                                                        (cl) =>
                                                          cl.variant_item ===
                                                          i.id,
                                                      )}
                                                      className="form-check-input"
                                                      name=""
                                                      id=""
                                                    />
                                                  )}
                                                </div>
                                              </div>

                                              <hr />
                                            </React.Fragment>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                {/* Item */}
                              </div>
                              {/* Accordion END */}
                            </div>

                            <div
                              className="tab-pane fade"
                              id="course-pills-2"
                              role="tabpanel"
                              aria-labelledby="course-pills-tab-2"
                            >
                              <div className="card">
                                <div className="card-header border-bottom p-0 pb-3">
                                  <div className="d-sm-flex justify-content-between align-items-center">
                                    <h4 className="mb-0 p-3">All Notes</h4>
                                    {/* Add Note Modal */}
                                    <button
                                      type="button"
                                      className="btn btn-primary me-3"
                                      onClick={() => handleNoteShow()}
                                    >
                                      Add Note <i className="fas fa-pen"></i>
                                    </button>
                                    {/*<div*/}
                                    {/*    className="modal fade"*/}
                                    {/*    id="exampleModal"*/}
                                    {/*    tabIndex={-1}*/}
                                    {/*    aria-labelledby="exampleModalLabel"*/}
                                    {/*    aria-hidden="true"*/}
                                    {/*>*/}
                                    {/*  <div className="modal-dialog modal-dialog-centered">*/}
                                    {/*    <div className="modal-content">*/}
                                    {/*      <div className="modal-header">*/}
                                    {/*        <h5*/}
                                    {/*            className="modal-title"*/}
                                    {/*            id="exampleModalLabel"*/}
                                    {/*        >*/}
                                    {/*          Add New Note{" "}*/}
                                    {/*          <i className="fas fa-pen"></i>*/}
                                    {/*        </h5>*/}
                                    {/*        <button*/}
                                    {/*            type="button"*/}
                                    {/*            className="btn-close"*/}
                                    {/*            data-bs-dismiss="modal"*/}
                                    {/*            aria-label="Close"*/}
                                    {/*        />*/}
                                    {/*      </div>*/}
                                    {/*      /!*<div className="modal-body">*!/*/}
                                    {/*      /!*  <form onSubmit={createNote}>*!/*/}
                                    {/*      /!*    <div className="mb-3">*!/*/}
                                    {/*      /!*      <label*!/*/}
                                    {/*      /!*          htmlFor="exampleInputEmail1"*!/*/}
                                    {/*      /!*          className="form-label"*!/*/}
                                    {/*      /!*      >*!/*/}
                                    {/*      /!*        Note Title*!/*/}
                                    {/*      /!*      </label>*!/*/}
                                    {/*      /!*      <input*!/*/}
                                    {/*      /!*          value={newNote.title}*!/*/}
                                    {/*      /!*          type="text"*!/*/}
                                    {/*      /!*          name="title"*!/*/}
                                    {/*      /!*          onChange={handleNoteChange}*!/*/}
                                    {/*      /!*          className="form-control"*!/*/}
                                    {/*      /!*      />*!/*/}
                                    {/*      /!*    </div>*!/*/}
                                    {/*      /!*    <div className="mb-3">*!/*/}
                                    {/*      /!*      <label*!/*/}
                                    {/*      /!*          htmlFor="exampleInputPassword1"*!/*/}
                                    {/*      /!*          className="form-label"*!/*/}
                                    {/*      /!*      >*!/*/}
                                    {/*      /!*        Note Content*!/*/}
                                    {/*      /!*      </label>*!/*/}
                                    {/*      /!*      <textarea*!/*/}
                                    {/*      /!*          className="form-control"*!/*/}
                                    {/*      /!*          id=""*!/*/}
                                    {/*      /!*          value={newNote.note}*!/*/}
                                    {/*      /!*          name="note"*!/*/}
                                    {/*      /!*          onChange={handleNoteChange}*!/*/}
                                    {/*      /!*          cols="30"*!/*/}
                                    {/*      /!*          rows="10"*!/*/}
                                    {/*      /!*      ></textarea>*!/*/}
                                    {/*      /!*    </div>*!/*/}
                                    {/*      /!*    <button*!/*/}
                                    {/*      /!*        onClick={handleNoteClose}*!/*/}
                                    {/*      /!*        type="button"*!/*/}
                                    {/*      /!*        className="btn btn-secondary me-2"*!/*/}
                                    {/*      /!*        data-bs-dismiss="modal"*!/*/}
                                    {/*      /!*    >*!/*/}
                                    {/*      /!*      <i className="fas fa-arrow-left"></i>{" "}*!/*/}
                                    {/*      /!*      Close*!/*/}
                                    {/*      /!*    </button>*!/*/}
                                    {/*      /!*    <button*!/*/}
                                    {/*      /!*        type="button"*!/*/}
                                    {/*      /!*        onClick={createNote}*!/*/}
                                    {/*      /!*        className="btn btn-primary"*!/*/}
                                    {/*      /!*    >*!/*/}
                                    {/*      /!*      Save Note{" "}*!/*/}
                                    {/*      /!*      <i className="fas fa-check-circle"></i>*!/*/}
                                    {/*      /!*    </button>*!/*/}
                                    {/*      /!*  </form>*!/*/}
                                    {/*      /!*</div>*!/*/}
                                    {/*    </div>*/}
                                    {/*  </div>*/}
                                    {/*</div>*/}
                                  </div>
                                </div>
                                <div className="card-body p-0 pt-3">
                                  {/* Note item start */}
                                  <div className="row g-4 p-3">
                                    {notes?.map((n, index) => (
                                      <div
                                        className="col-sm-11 col-xl-11 shadow p-3 m-3 rounded"
                                        key={n.id}
                                      >
                                        <h5> {n.title || "No Title"}</h5>
                                        <p>{n.note || "No text"}</p>
                                        {/* Buttons */}
                                        <div className="hstack gap-3 flex-wrap">
                                          <a
                                            onClick={() => handleNoteShow(n)}
                                            className="btn btn-success mb-0"
                                          >
                                            <i className="bi bi-pencil-square me-2" />{" "}
                                            Edit
                                          </a>
                                          <button
                                            onClick={() =>
                                              handleDeleteNote(n.id)
                                            }
                                            className="btn btn-danger mb-0"
                                          >
                                            <i className="bi bi-trash me-2" />{" "}
                                            Delete
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  <hr />
                                </div>
                              </div>
                            </div>
                            <div
                              className="tab-pane fade"
                              id="course-pills-3"
                              role="tabpanel"
                              aria-labelledby="course-pills-tab-3"
                            >
                              <div className="card">
                                <div className="card-header border-bottom p-0 pb-3">
                                  <h4 className="mb-3 p-3">Discussion</h4>
                                  <form className="row g-4 p-3">
                                    <div className="col-sm-6 col-lg-9">
                                      <div className="position-relative">
                                        <input
                                          className="form-control pe-5 bg-transparent"
                                          type="search"
                                          placeholder="Search"
                                          aria-label="Search"
                                          onChange={handleSearchQuestion}
                                        />
                                        <button
                                          className="bg-transparent p-2 position-absolute top-50 end-0 translate-middle-y border-0 text-primary-hover text-reset"
                                          type="submit"
                                        >
                                          <i className="fas fa-search fs-6 " />
                                        </button>
                                      </div>
                                    </div>
                                    <div className="col-sm-6 col-lg-3">
                                      <a
                                        onClick={handleQuestionShow}
                                        className="btn btn-primary mb-0 w-100"
                                        data-bs-toggle="modal"
                                        data-bs-target="#modalCreatePost"
                                      >
                                        Ask Question
                                      </a>
                                    </div>
                                  </form>
                                </div>

                                <div className="card-body p-0 pt-3">
                                  <div className="vstack gap-3 p-3">
                                    {questions.map((q, index) => (
                                      <div
                                        className="shadow rounded-3 p-3"
                                        key={index}
                                      >
                                        <div className="d-sm-flex justify-content-sm-between mb-3">
                                          <div className="d-flex align-items-center">
                                            <div className="avatar avatar-sm flex-shrink-0">
                                              <img
                                                src={
                                                  q?.profile?.image?.startsWith(
                                                    "http://127.0.0.1:8000/",
                                                  )
                                                    ? q?.profile?.image
                                                    : `http://127.0.0.1:8000${q?.profile?.image}`
                                                }
                                                className="avatar-img rounded-circle"
                                                alt="avatar"
                                                style={{
                                                  width: "60px",
                                                  height: "60px",
                                                  borderRadius: "50%",
                                                  objectFit: "cover",
                                                }}
                                              />
                                            </div>
                                            <div className="ms-2">
                                              <h6 className="mb-0">
                                                <a
                                                  href="#"
                                                  className="text-decoration-none text-dark"
                                                >
                                                  {q?.profile?.full_name}
                                                </a>
                                              </h6>
                                              <small>
                                                Asked{" "}
                                                {formatDistanceToNow(
                                                  new Date(q?.date),
                                                  { addSuffix: true },
                                                )}
                                              </small>
                                            </div>
                                          </div>
                                        </div>
                                        <h5>{q?.title}</h5>
                                        <button
                                          className="btn btn-primary btn-sm mb-3 mt-3"
                                          onClick={() =>
                                            handleConversationShow(q)
                                          }
                                        >
                                          Join Conversation{" "}
                                          <i className="fas fa-arrow-right"></i>
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div
                              className="tab-pane fade"
                              id="course-pills-4"
                              role="tabpanel"
                              aria-labelledby="course-pills-tab-4"
                            >
                              <div className="card">
                                <div className="card-header border-bottom p-0 pb-3">
                                  <h4 className="mb-3 p-3">Leave a Review</h4>
                                  <div className="mt-2">
                                    {!studentReview && (
                                      <form
                                        className="row g-3 p-3"
                                        onSubmit={handleCreateReviewSubmit}
                                      >
                                        <div className="col-12 bg-light-input">
                                          <select
                                            id="inputState2"
                                            className="form-select js-choice"
                                            onChange={handleCreateReviewChange}
                                            name="rating"
                                            value={createReview?.rating || 0}
                                          >
                                            <option value={1}>
                                              ★☆☆☆☆ (1/5)
                                            </option>
                                            <option value={2}>
                                              ★★☆☆☆ (2/5)
                                            </option>
                                            <option value={3}>
                                              ★★★☆☆ (3/5)
                                            </option>
                                            <option value={4}>
                                              ★★★★☆ (4/5)
                                            </option>
                                            <option value={5}>
                                              ★★★★★ (5/5)
                                            </option>
                                          </select>
                                        </div>
                                        {/* Message */}
                                        <div className="col-12 bg-light-input">
                                          <textarea
                                            className="form-control"
                                            id="exampleFormControlTextarea1"
                                            placeholder="Your review"
                                            rows={3}
                                            value={createReview?.review || ""}
                                            onChange={handleCreateReviewChange}
                                            name="review"
                                          />
                                        </div>
                                        {/* Button */}
                                        <div className="col-12">
                                          <button
                                            type="submit"
                                            className="btn btn-primary mb-0"
                                          >
                                            Post Review
                                          </button>
                                        </div>
                                      </form>
                                    )}
                                    {studentReview && (
                                      <form
                                        className="row g-3 p-3"
                                        onSubmit={handleUpdateReviewSubmit}
                                      >
                                        <div className="col-12 bg-light-input">
                                          <select
                                            id="inputState2"
                                            className="form-select js-choice"
                                            onChange={handleReviewChange}
                                            name="rating"
                                            value={studentReview?.rating}
                                          >
                                            <option value={1}>
                                              ★☆☆☆☆ (1/5)
                                            </option>
                                            <option value={2}>
                                              ★★☆☆☆ (2/5)
                                            </option>
                                            <option value={3}>
                                              ★★★☆☆ (3/5)
                                            </option>
                                            <option value={4}>
                                              ★★★★☆ (4/5)
                                            </option>
                                            <option value={5}>
                                              ★★★★★ (5/5)
                                            </option>
                                          </select>
                                        </div>

                                        <div className="col-12 bg-light-input">
                                          <textarea
                                            className="form-control"
                                            id="exampleFormControlTextarea1"
                                            placeholder="Your review"
                                            rows={3}
                                            onChange={handleReviewChange}
                                            name="review"
                                            value={studentReview?.review}
                                          />
                                        </div>
                                        {/* Button */}
                                        <div className="col-12">
                                          <button
                                            type="submit"
                                            className="btn btn-primary mb-0"
                                          >
                                            Update Review
                                          </button>
                                        </div>
                                      </form>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>

      {/* Lecture Modal */}
      <Modal show={show} size="lg" onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{variantItem?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ReactPlayer
            url={variantItem?.file}
            controls
            playing
            width={"100%"}
            height={"100%"}
          />
        </Modal.Body>
      </Modal>

      {/* Note Edit Modal */}
      {/*<Modal show={noteShow} size="lg" onHide={handleNoteClose}>*/}
      {/*  <Modal.Header closeButton>*/}
      {/*    <Modal.Title>Note: Note Title</Modal.Title>*/}
      {/*  </Modal.Header>*/}
      {/*  <Modal.Body>*/}
      {/*    <form>*/}
      {/*      <div className="mb-3">*/}
      {/*        <label htmlFor="exampleInputEmail1" className="form-label">*/}
      {/*          Note Title*/}
      {/*        </label>*/}
      {/*        <input*/}
      {/*            defaultValue={null}*/}
      {/*            name="title"*/}
      {/*            type="text"*/}
      {/*            className="form-control"*/}
      {/*        />*/}
      {/*      </div>*/}
      {/*      <div className="mb-3">*/}
      {/*        <label htmlFor="exampleInputPassword1" className="form-label">*/}
      {/*          Note Content*/}
      {/*        </label>*/}
      {/*        <textarea*/}
      {/*            onChange={null}*/}
      {/*            defaultValue={null}*/}
      {/*            name="note"*/}
      {/*            className="form-control"*/}
      {/*            cols="30"*/}
      {/*            rows="10"*/}
      {/*        ></textarea>*/}
      {/*      </div>*/}
      {/*      <button*/}
      {/*          type="button"*/}
      {/*          className="btn btn-secondary me-2"*/}
      {/*          onClick={null}*/}
      {/*      >*/}
      {/*        <i className="fas fa-arrow-left"></i> Close*/}
      {/*      </button>*/}
      {/*      <button type="submit" className="btn btn-primary">*/}
      {/*        Save Note <i className="fas fa-check-circle"></i>*/}
      {/*      </button>*/}
      {/*    </form>*/}
      {/*  </Modal.Body>*/}
      {/*</Modal>*/}

      {/* Note Edit Modal */}
      <Modal show={ConversationShow} size="lg" onHide={handleConversationClose}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedConversation?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="border p-2 p-sm-4 rounded-3">
            <ul
              className="list-unstyled mb-0"
              style={{ overflowY: "scroll", height: "500px" }}
            >
              {selectedConversation?.messages?.map((m, index) => (
                <li className="comment-item mb-3" key={index}>
                  <div className="d-flex">
                    <div className="avatar avatar-sm flex-shrink-0">
                      <a href="#">
                        <img
                          className="avatar-img rounded-circle"
                          src={
                            m?.profile?.image?.startsWith(
                              "http://127.0.0.1:8000/",
                            )
                              ? m?.profile?.image
                              : `http://127.0.0.1:8000${m?.profile?.image}`
                          }
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      </a>
                    </div>
                    <div className="ms-2">
                      {/* Comment by */}
                      <div className="bg-light p-3 rounded w-100">
                        <div className="d-flex w-100 justify-content-center">
                          <div className="me-2 ">
                            <h6 className="mb-1 lead fw-bold">
                              <a
                                href="#!"
                                className="text-decoration-none text-dark"
                              >
                                {" "}
                                {m?.profile?.full_name}{" "}
                              </a>
                              <br />
                              <span style={{ fontSize: "12px", color: "gray" }}>
                                {formatDistanceToNow(new Date(m?.date), {
                                  addSuffix: true,
                                })}
                              </span>
                            </h6>
                            <p className="mb-0 mt-3  ">{m?.message}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
              <div ref={lastElementRef}></div>
            </ul>

            <form className="w-100 d-flex" onSubmit={sendNewMessage}>
              <textarea
                name="message"
                className="one form-control pe-4 bg-light w-75"
                id="autoheighttextarea"
                rows="2"
                onChange={handleMessageChange}
                placeholder="What's your question?"
              ></textarea>
              <button className="btn btn-primary ms-2 mb-0 w-25" type="submit">
                Post <i className="fas fa-paper-plane"></i>
              </button>
            </form>

            {/*<form className="w-100">*/}
            {/*  <input*/}
            {/*    name="title"*/}
            {/*    type="text"*/}
            {/*    className="form-control mb-2"*/}
            {/*    placeholder="Question Title"*/}
            {/*  />*/}
            {/*  <textarea*/}
            {/*    name="message"*/}
            {/*    className="one form-control pe-4 mb-2 bg-light"*/}
            {/*    id="autoheighttextarea"*/}
            {/*    rows="5"*/}
            {/*    placeholder="What's your question?"*/}
            {/*  ></textarea>*/}
            {/*  <button className="btn btn-primary mb-0 w-25" type="button">*/}
            {/*    Post <i className="fas fa-paper-plane"></i>*/}
            {/*  </button>*/}
            {/*</form>*/}
          </div>
        </Modal.Body>
      </Modal>

      <Modal show={addQuestionShow} size="lg" onHide={handleQuestionClose}>
        <Modal.Header closeButton>
          <Modal.Title>Ask Question!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSaveQuestion}>
            <div className="mb-3">
              <label htmlFor="exampleInputEmail1" className="form-label">
                Question Title
              </label>
              <input
                onChange={handleMessageChange}
                name="title"
                value={createMessage.title}
                type="text"
                className="form-control"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="exampleInputPassword1" className="form-label">
                Question Message
              </label>
              <textarea
                onChange={handleMessageChange}
                name="message"
                value={createMessage.message}
                className="form-control"
                cols="30"
                rows="10"
              ></textarea>
            </div>
            <button
              type="button"
              className="btn btn-secondary me-2"
              onClick={handleQuestionClose}
            >
              <i className="fas fa-arrow-left"></i> Close
            </button>
            <button type="submit" className="btn btn-primary">
              Save Message <i className="bi bi-chat-right-dots-fill"></i>
            </button>
          </form>
        </Modal.Body>
      </Modal>

      <Modal show={noteShow} size="lg" onHide={handleNoteClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedNote ? "Edit Note" : "Add New Note"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={(e) => createNote(e, selectedNote?.id)}>
            <div className="mb-3">
              <label className="form-label">Note Title</label>
              <input
                type="text"
                name="title"
                value={newNote.title}
                onChange={handleNoteChange}
                className="form-control"
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Note Content</label>
              <textarea
                className="form-control"
                name="note"
                value={newNote.note}
                onChange={handleNoteChange}
                rows="10"
                required
              ></textarea>
            </div>
            <div className="d-flex justify-content-end">
              <button
                type="button"
                className="btn btn-secondary me-2"
                onClick={handleNoteClose}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {selectedNote ? "Update Note" : "Save Note"}
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      <BaseFooter />
    </>
  );
}

export default CourseDetail
