import React, {useState} from 'react'
import BaseHeader from '../partials/BaseHeader'
import BaseFooter from '../partials/BaseFooter'
import {useNavigate, useSearchParams} from "react-router-dom";
import {apiInstance} from "../../utils/axios.js";


function CreateNewPassword() {
  const[password, setPassword] = useState("");
  const[confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();
  const [searchParam] = useSearchParams();

  const otp = searchParam.get('otp')
  const uidb64 = searchParam.get('uidb64')
  const refresh_token = searchParam.get('refresh_token')

  const handleSubmit = async (e) => {
      e.preventDefault();
      if (password !== confirmPassword) {
        console.log("Passwords do not match");
        return;
      }
      try {
        const formData = {
          'password': password,
          'confirm_password': confirmPassword,
          "otp": otp,
          "uidb64": uidb64,
          "refresh_token": refresh_token,
      };

        await apiInstance.post('user/change-pass/', formData)
        navigate('/login/')
      } catch (e) {
        console.log(e);
      }
  }
  return (
    <>
      <BaseHeader />

      <section className="container d-flex flex-column vh-100" style={{ marginTop: "150px" }}>
        <div className="row align-items-center justify-content-center g-0 h-lg-100 py-8">
          <div className="col-lg-5 col-md-8 py-8 py-xl-0">
            <div className="card shadow">
              <div className="card-body p-6">
                <div className="mb-4">
                  <h1 className="mb-1 fw-bold">Create New Password</h1>
                  <span>
                    Choose a new password for your account
                  </span>
                </div>
                <form className="needs-validation" noValidate="" onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Enter New Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      className="form-control"
                      name="password"
                      placeholder="**************"
                      required=""
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <div className="invalid-feedback">
                      Please enter valid password.
                    </div>
                  </div>


                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      className="form-control"
                      name="password"
                      placeholder="**************"
                      required=""
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <div className="invalid-feedback">
                      Please enter valid password.
                    </div>
                  </div>



                  <div>
                    <div className="d-grid">
                      <button type="submit" className="btn btn-primary">
                        Save New Password <i className='fas fa-check-circle'></i>
                      </button>
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

export default CreateNewPassword