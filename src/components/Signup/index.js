import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
// import signupBgVideo from "../../assets/signupBgVideo.mp4";

import "./index.css";

const status = {
  initial: "INITIAL",
  loading: "LOADING",
  success: "SUCCESS",
  failure: "FAILURE",
};

const loadingArray = [
  "Signing up",
  "Signing up.",
  "Signing up..",
  "Signing up...",
];

const Signup = () => {
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupMail, changeSignupMail] = useState("");
  const [signupPassword, changeSignupPassword] = useState("");
  const [signupConfirmPassword, changeSignupConfirmPassword] = useState("");
  const [signUpStatus, setSignUpStatus] = useState(status.initial);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [fadeOut, setFadeOut] = useState(false);
  const navigate = useNavigate();

  const clickedLogin = () => {
    setFadeOut(true);
    setTimeout(() => {
      navigate("/login");
    }, 400);
  };

  useEffect(() => {
    let intervalId;

    if (signUpStatus === status.loading) {
      intervalId = setInterval(() => {
        setLoadingTextIndex((prev) => (prev + 1) % loadingArray.length);
      }, 500);
    }

    return () => clearInterval(intervalId);
  }, [signUpStatus]);

  const submittedSignUpForm = async (e) => {
    e.preventDefault();
    setSignUpStatus(status.loading);
    const userDetails = {
      mail: signupMail,
      password: signupPassword,
    };
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userDetails),
    };
    try {
      const response = await fetch("http://localhost:3001/signup", options);
      if (response.ok) {
        setSignUpStatus(status.success);
      } else {
        const data = await response.json();
        setErrorMsg(data.message);
        setSignUpStatus(status.failure);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const changingSignupMail = (e) => {
    changeSignupMail(e.target.value);
  };

  const changingSignupPassword = (e) => {
    changeSignupPassword(e.target.value);
  };

  const changingSignupConfirmPassword = (e) => {
    setErrorMsg("");
    changeSignupConfirmPassword(e.target.value);
    if (e.target.value !== signupPassword) {
      setTimeout(() => {
        setErrorMsg("Passwords do not match");
      }, 10);
    } else {
      setErrorMsg("");
    }
  };

  const clickedSignupShowOrHideBtn = () => {
    setShowSignupPassword((i) => !i);
  };

  return (
    <div
      className={`ecoai-signup-bg-container ${
        fadeOut ? "fade-out" : "fade-in"
      }`}
    >
      {/* <video autoPlay loop muted playsInline className="ecoai-signup-bg-video">
        <source src={signupBgVideo} type="video/mp4" />
      </video> */}
      <div className="ecoai-signup-info-form-container">
        <div className="ecoai-signup-info-container">
          <img
            className="ecoai-signup-logo"
            src="https://res.cloudinary.com/dnxaaxcjv/image/upload/v1762517823/LoginLogo_andrdl.png"
            alt="ecoai-signup-logo"
          />
          <div className="ecoai-signup-info-matter-container">
            <p className="ecoai-signup-info-matter1">Create Account</p>
            <p className="ecoai-signup-info-matter2">
              To become a part of our community, please sign up using your
              personal information.
            </p>
          </div>
        </div>
        <form
          onSubmit={submittedSignUpForm}
          className="ecoai-signup-form-container"
        >
          <h1 className="ecoai-signup-heading">SIGNUP</h1>
          {signUpStatus === status.success ? (
            <span className="ecoai-signup-success-msg">
              Verification link has been sent to your email. Please verify your
              email to complete the signup process.
            </span>
          ) : (
            <>
              <div className="ecoai-signup-email-container">
                <input
                  type="email"
                  placeholder=" "
                  className="ecoai-signup-email-inp"
                  id="ecoai-signup-email-inp"
                  value={signupMail}
                  onChange={changingSignupMail}
                />
                <label
                  htmlFor="ecoai-signup-email-inp"
                  className="ecoai-signup-email-label"
                >
                  Enter your email
                </label>
              </div>
              <div className="ecoai-signup-password-container">
                <input
                  type="password"
                  placeholder=" "
                  className="ecoai-signup-password-inp"
                  id="ecoai-signup-password-inp"
                  value={signupPassword}
                  onChange={changingSignupPassword}
                />
                <label
                  htmlFor="ecoai-signup-password-inp"
                  className="ecoai-signup-password-label"
                >
                  Create password
                </label>
              </div>
              <div className="ecoai-signup-confirm-password-container">
                <input
                  type={showSignupPassword ? "text" : "password"}
                  placeholder=" "
                  className="ecoai-signup-confirm-password-inp"
                  id="ecoai-signup-confirm-password-inp"
                  value={signupConfirmPassword}
                  onChange={changingSignupConfirmPassword}
                />
                <label
                  htmlFor="ecoai-signup-confirm-password-inp"
                  className="ecoai-signup-confirm-password-label"
                >
                  Confirm password
                </label>
                {signupConfirmPassword ? (
                  <button
                    type="button"
                    className="ecoai-signup-show-or-hide-button"
                    onClick={clickedSignupShowOrHideBtn}
                  >
                    {showSignupPassword ? "Hide" : "Show"}
                  </button>
                ) : null}
              </div>
              <div className="ecoai-signup-error-msg-container">
                <span className="ecoai-signup-error-msg">{errorMsg}</span>
              </div>
              <button
                disabled={
                  !signupMail ||
                  signupPassword.length < 6 ||
                  signupPassword !== signupConfirmPassword ||
                  signUpStatus === status.loading
                }
                style={{
                  opacity:
                    !signupMail ||
                    signupPassword.length < 6 ||
                    signupPassword !== signupConfirmPassword ||
                    signUpStatus === status.loading
                      ? 0.5
                      : 1,
                }}
                type="submit"
                className="ecoai-signup-button"
              >
                {signUpStatus === status.loading
                  ? loadingArray[loadingTextIndex]
                  : "Sign Up"}
              </button>
              <p className="ecoai-signup-no-account-text">
                Already have an account?{" "}
                <span
                  className="ecoai-signup-login-text"
                  onClick={clickedLogin}
                >
                  Login
                </span>
              </p>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default Signup;
