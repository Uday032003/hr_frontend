import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import "./index.css";

const status = {
  initial: "INITIAL",
  loading: "LOADING",
  success: "SUCCESS",
  failure: "FAILURE",
};

const loadingArray = ["Verifying", "Verifying.", "Verifying..", "Verifying..."];

const Verify = () => {
  const [verifyMail, changeVerifyMail] = useState("");
  const [verifyStatus, setVerifyStatus] = useState(status.initial);
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
    if (verifyStatus === status.loading) {
      intervalId = setInterval(() => {
        setLoadingTextIndex((prev) => (prev + 1) % loadingArray.length);
      }, 500);
    }
    return () => clearInterval(intervalId);
  }, [verifyStatus]);

  const submittedVerifyForm = async (e) => {
    e.preventDefault();
    setVerifyStatus(status.loading);
    const mailDetails = {
      mail: verifyMail,
    };
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mailDetails),
    };
    try {
      const response = await fetch(
        "http://localhost:3001/resend-verification",
        options,
      );
      if (response.ok) {
        setVerifyStatus(status.success);
      } else {
        const data = await response.json();
        setErrorMsg(data.message);
        setVerifyStatus(status.failure);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const changingVerifyMail = (e) => {
    changeVerifyMail(e.target.value);
  };

  return (
    <div
      className={`ecoai-verify-bg-container ${
        fadeOut ? "fade-out" : "fade-in"
      }`}
    >
      <div className="ecoai-verify-info-form-container">
        <div className="ecoai-verify-info-container">
          <img
            className="ecoai-verify-logo"
            src="https://res.cloudinary.com/dnxaaxcjv/image/upload/v1762517823/LoginLogo_andrdl.png"
            alt="ecoai-verify-logo"
          />
          <div className="ecoai-verify-info-matter-container">
            <p className="ecoai-verify-info-matter1">Create Account</p>
            <p className="ecoai-verify-info-matter2">
              To become a part of our community, please sign up using your
              personal information.
            </p>
          </div>
        </div>
        <form
          onSubmit={submittedVerifyForm}
          className="ecoai-verify-form-container"
        >
          <h1 className="ecoai-verify-heading">VERIFY</h1>
          {verifyStatus === status.success ? (
            <span className="ecoai-verify-success-msg">
              Verification link has been sent to your email. Please verify your
              email to complete the signup process.
            </span>
          ) : (
            <>
              <div className="ecoai-verify-email-container">
                <input
                  type="email"
                  placeholder=" "
                  className="ecoai-verify-email-inp"
                  id="ecoai-verify-email-inp"
                  value={verifyMail}
                  onChange={changingVerifyMail}
                />
                <label
                  htmlFor="ecoai-verify-email-inp"
                  className="ecoai-verify-email-label"
                >
                  Enter your email
                </label>
              </div>
              <div className="ecoai-verify-error-msg-container">
                <span className="ecoai-verify-error-msg">{errorMsg}</span>
              </div>
              <button
                disabled={!verifyMail || verifyStatus === status.loading}
                style={{
                  opacity:
                    !verifyMail || verifyStatus === status.loading ? 0.5 : 1,
                }}
                type="submit"
                className="ecoai-verify-button"
              >
                {verifyStatus === status.loading
                  ? loadingArray[loadingTextIndex]
                  : "Verify"}
              </button>
              <p className="ecoai-verify-no-account-text">
                Already have an account?{" "}
                <span
                  className="ecoai-verify-login-text"
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

export default Verify;
