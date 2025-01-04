import React from "react";
import UserForm from "../components/Form";
import "../styles/Login.css"; // Import file CSS
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook } from '@fortawesome/free-brands-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';

function Login() {
    return (
        <div className="login-container">
            <div className="login-box">
                <UserForm route="token/" method="login" />
                <div className="options">
                    <label>
                        <input type="checkbox" name="remember" />
                        Remember Me
                    </label>
                    <button className="link-button">Forgot Password?</button>
                </div>
                <div className="social-login">
                    <p>Or</p>
                    <button className="btn btn-primary facebook-login">
                        <FontAwesomeIcon icon={faFacebook} className="social-icon" />
                        Login With Facebook
                    </button>
                    <button className="btn btn-danger google-login">
                        <FontAwesomeIcon icon={faGoogle} className="social-icon" />
                        Login With Google
                    </button>
                </div>
                <div className="register">
                    <p>Don't have an account yet? <button className="link-button">Register</button></p>
                </div>
            </div>
        </div>
    );
}

export default Login;
