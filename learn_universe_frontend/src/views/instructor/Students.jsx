import MediaImage from "../../components/MediaImage.jsx";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import {apiInstance} from "../../utils/axios.js";
import UserData from "../plugin/UserData.js";
import {useEffect, useState} from "react";
import Cookies from "js-cookie";
import {format} from "date-fns";

function Students() {
  const [students, setStudents] = useState([])

  const fetchStudents = () => {
    apiInstance.get(`teacher/student-lists/${UserData?.user_id}/`, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${Cookies.get("access_token")}`
            }
          }).then((res) => {
      setStudents(res.data)
    })
  }

  useEffect(() => {
    fetchStudents()
  }, []);

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
                <div className="p-4 d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="mb-0">Students</h3>
                    <span>Meet people taking your course.</span>
                  </div>
                </div>
              </div>
              {students.map((student, studentIndex) => (
                <div className="row" key={studentIndex}>
                  <div className="col-lg-4 col-md-6 col-12">
                    <div className="card mb-4">
                      <div className="card-body">
                        <div className="text-center">
                          <MediaImage kind="avatar"
                            src={student?.image}
                            className="rounded-circle avatar-xl mb-3"
                            style={{
                              width: "70px",
                              height: "70px",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                            alt="avatar"
                          />
                          <h4 className="mb-1">{student?.full_name}</h4>
                          <p className="mb-0">
                            {" "}
                            <i className="fas fa-map-pin me-1" />{" "}
                            {student?.country || "Country not specified"}{" "}
                          </p>
                          <p className="mb-0">
                            {" "}
                            Enrolled{" "}{format(student?.date, "M/d/yyyy")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <BaseFooter />
    </>
  );
}

export default Students;
