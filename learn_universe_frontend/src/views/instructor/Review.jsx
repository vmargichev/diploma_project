import React, {useEffect, useState} from 'react';
import Sidebar from './Partials/Sidebar'
import Header from './Partials/Header'

import BaseHeader from '../partials/BaseHeader'
import BaseFooter from '../partials/BaseFooter'
import {apiInstance} from "../../utils/axios.js";
import UserData from "../plugin/UserData.js";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import {Link} from "react-router-dom";
import {formatDistanceToNow} from "date-fns";
import Rater from "react-rater";

function Review() {

    const userId = UserData.user_id

    const [reviews, setReviews] = useState([])
    const [reply, setReply] = useState("")
    const [filterReviews, setFilterReviews] = useState([])


    const fetchReviewsData = () => {
        apiInstance.get(`teacher/review-lists/${userId}/`, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${Cookies.get("access_token")}`
            }
          }).then((res) =>
        {
            setReviews(res.data);
            setFilterReviews(res.data);
        })
    }

    const handleSumbitReply = (e, reviewId) => {
        e.preventDefault()

        const formdata = new FormData();
        formdata.append("reply", reply);

        apiInstance.patch(`teacher/review-detail/${userId}/${reviewId}/`, formdata, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${Cookies.get("access_token")}`
            }
          }).then((res) => {
            Swal.fire({
            toast: true,
            position: "top",
            icon: "success",
            title: res.data.message,
            showConfirmButton: false,
            timer: 1600,
            });
            setReply("")
            fetchReviewsData();
        }).catch((error) => {
            Swal.fire({
            toast: true,
            position: "top",
            icon: "success",
            title: error.data.message,
            showConfirmButton: false,
            timer: 1600,
            });
            setReply("")
        })
    }

    const handleSortByRatingChange = (e) => {
        const sortValue = parseInt(e.target.value)

        if (sortValue === 0) {
            setFilterReviews(reviews)
        } else {
            const filtered = reviews.filter((review) => review.rating === sortValue)
             setFilterReviews(filtered)
        }
    }

    const handleSortByDate = (e) => {
        const sortValue = e.target.value
        const sortedReviews = [...reviews];
       if (sortValue === "Newest") {
            sortedReviews.sort((a, b) => new Date(b.date) - new Date(a.date));

        } else {
            sortedReviews.sort((a, b) => new Date(a.date) - new Date(b.date));
        }
       setFilterReviews(sortedReviews)
    }
    const handleFilterByCourse = (e) => {
        const query = e.target.value.toLowerCase();

        if (query === "") {
            fetchReviewsData();
        } else {
            const filtered = reviews.filter((review) => {
                return review.course.title.toLowerCase().includes(query);
            })
            setFilterReviews(filtered)
        }

    }

    useEffect(() => {
        fetchReviewsData();
    }, []);
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
                            {/* Card */}
                            <div className="card mb-4">
                                {/* Card header */}
                                <div className="card-header d-lg-flex align-items-center justify-content-between">
                                    <div className="mb-3 mb-lg-0">
                                        <h3 className="mb-0">Reviews</h3>
                                        <span>You have full control to manage your own account setting.</span>
                                    </div>
                                </div>
                                {/* Card body */}
                                <div className="card-body">
                                    <form className="row mb-4 gx-2">
                                        <div className="col-xl-7 col-lg-6 col-md-4 col-12 mb-2 mb-lg-0">
                                            <input type="text" className="form-control" placeholder="Search By Course" onChange={handleFilterByCourse}/>
                                        </div>
                                        <div className="col-xl-2 col-lg-2 col-md-4 col-12 mb-2 mb-lg-0">
                                            <select className="form-select" onChange={(e) => handleSortByRatingChange(e)}>
                                                <option value={0}>Rating</option>
                                                <option value={1}>1</option>
                                                <option value={2}>2</option>
                                                <option value={3}>3</option>
                                                <option value={4}>4</option>
                                                <option value={5}>5</option>
                                            </select>
                                        </div>
                                        <div className="col-xl-3 col-lg-3 col-md-4 col-12 mb-2 mb-lg-0">
                                            {/* Custom select */}
                                            <select className="form-select" onChange={(e) => handleSortByDate(e)}>
                                                <option value="">Sort by</option>
                                                <option value="Newest">Newest</option>
                                                <option value="Oldest">Oldest</option>
                                            </select>
                                        </div>
                                    </form>
                                    {/* List group */}
                                    <ul className="list-group list-group-flush">
                                        {filterReviews.map((review, reviewIndex) => (
                                            <li className="list-group-item p-4 shadow rounded-3" key={reviewIndex}>
                                                <div className="d-flex">
                                                    <img
                                                        src={review?.profile?.image}
                                                        alt="avatar"
                                                        className="rounded-circle avatar-lg"
                                                        style={{
                                                            width: "70px",
                                                            height: "70px",
                                                            borderRadius: "50%",
                                                            objectFit: "cover"
                                                        }}
                                                    />
                                                    <div className="ms-3 mt-2">
                                                        <div
                                                            className="d-flex align-items-center justify-content-between">
                                                            <div>
                                                                <h4 className="mb-0">{review?.profile?.full_name}</h4>
                                                                <span>{formatDistanceToNow(
                                                                  new Date(review?.date),
                                                                  { addSuffix: true },
                                                                )}</span>
                                                            </div>
                                                            <div>
                                                                <a
                                                                    href="#"
                                                                    data-bs-toggle="tooltip"
                                                                    data-placement="top"
                                                                    title="Report Abuse"
                                                                >
                                                                    <i className="fe fe-flag"/>
                                                                </a>
                                                            </div>
                                                        </div>
                                                        <div className="mt-2">
                                                        <span className="fs-6 me-1 align-top">
                                                           <Rater
                                                              total={5}
                                                              rating={review?.rating}
                                                            />
                                                        </span>
                                                            <span className="me-1">for</span>
                                                            <span className="h5">
                                                            {review?.course?.title}
                                                        </span>
                                                            <p className="mt-2">
                                                                <span className='fw-bold me-2'>Review <i
                                                                    className='fas fa-arrow-right'></i></span>
                                                                {review?.review}
                                                            </p>
                                                            <p className="mt-2">
                                                                <span className='fw-bold me-2'>Response <i
                                                                    className='fas fa-arrow-right'></i></span>
                                                                {review?.reply || "No reply"}
                                                            </p>
                                                            <p>
                                                                <button className="btn btn-outline-secondary"
                                                                        type="button" data-bs-toggle="collapse"
                                                                        data-bs-target={`#collapse${reviewIndex}`}
                                                                        aria-expanded="false"
                                                                        aria-controls={`collapse${reviewIndex}`}>
                                                                    Send Response
                                                                </button>
                                                            </p>
                                                            <div className="collapse" id={`collapse${reviewIndex}`}>
                                                                <div className="card card-body">
                                                                    <div>
                                                                        <div className="mb-3">
                                                                            <label htmlFor="exampleInputEmail1"
                                                                                   className="form-label">Write
                                                                                Response</label>
                                                                            <textarea name="" id="" cols="30"
                                                                                      className='form-control'
                                                                                      rows="4"
                                                                                      value={reply}
                                                                                    onChange={(e) => setReply(e.target.value)}></textarea>
                                                                        </div>

                                                                        <button type="submit"
                                                                                onClick={(e) => handleSumbitReply(e, review?.id)}
                                                                                className="btn btn-primary">Send
                                                                            Response <i
                                                                                className='fas fa-paper-plane'> </i>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                        {filterReviews.length < 1 && (
                                            <p>No Reviews</p>
                                        )}

                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <BaseFooter/>
        </>
    )
}

export default Review
