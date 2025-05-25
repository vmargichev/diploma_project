import React, {useState} from 'react'
import BaseHeader from '../partials/BaseHeader'
import BaseFooter from '../partials/BaseFooter'
import {Link, useNavigate} from 'react-router-dom'
import {apiInstance} from "../../utils/axios.js";
import {login} from "../../utils/auth.js";


function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const FORM_MARGIN_TOP = "150px"; // Constant extracted for better maintainability

    const renderButton = () => (
        <button disabled={isLoading} type="submit" className="btn btn-primary">
            {isLoading ? (
                <>
                    Processing <i className="fas fa-spinner fa-spin"></i>
                </>
            ) : (
                <>
                    Sign in <i className="fas fa-sign-in-alt"></i>
                </>
            )}
        </button>
    );

    const handleLogin = async () => {
        setIsLoading(true);
        try {
            const result = await login(email, password);
            if (result && !result.error) {
                navigate('/');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        await handleLogin()
    };

    return (
        <>
            <BaseHeader/>
            <section
                className="container d-flex flex-column vh-100"
                style={{marginTop: FORM_MARGIN_TOP}}
            >
                <div className="row align-items-center justify-content-center g-0 h-lg-100 py-8">
                    <div className="col-lg-5 col-md-8 py-8 py-xl-0">
                        <div className="card shadow">
                            <div className="card-body p-6">
                                <div className="mb-4">
                                    <h1 className="mb-1 fw-bold">Sign in</h1>
                                    <span>
                    Don’t have an account?
                    <Link to="/register/" className="ms-1">
                      Sign up
                    </Link>
                  </span>
                                </div>
                                <form className="needs-validation" noValidate onSubmit={handleFormSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            className="form-control"
                                            name="email"
                                            placeholder="johndoe@gmail.com"
                                            required
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                        <div className="invalid-feedback">Please enter valid email.</div>
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="password" className="form-label">
                                            Password
                                        </label>
                                        <input
                                            type="password"
                                            id="password"
                                            className="form-control"
                                            name="password"
                                            placeholder="**************"
                                            required
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <div className="invalid-feedback">Please enter valid password.</div>
                                    </div>

                                    <div className="d-lg-flex justify-content-between align-items-center mb-4">
                                        <div className="form-check">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id="rememberme"
                                                required
                                            />
                                            <label className="form-check-label" htmlFor="rememberme">
                                                Remember me
                                            </label>
                                            <div className="invalid-feedback">
                                                You must agree before submitting.
                                            </div>
                                        </div>
                                        <div>
                                            <Link to="/forgot-password/">Forgot your password?</Link>
                                        </div>
                                    </div>

                                    <div className="d-grid">{renderButton()}</div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <BaseFooter/>
        </>
    );
}

export default Login