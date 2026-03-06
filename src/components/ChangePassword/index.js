import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaCircleCheck } from "react-icons/fa6";
import { MdOutlineSwipeUp } from "react-icons/md";
import "./index.css";

const status = {
  initial: "INITIAL",
  loading: "LOADING",
  loadingCodeSent: "LOADINGCODESENT",
  loadingResetPassword: "LOADINGRESETPASSWORD",
  loadingResendCode: "LOADINGRESENDCODE",
  codeSent: "CODE_SENT",
  resetPassword: "RESETPASSWORD",
  success: "SUCCESS",
};

const loadingArray = ["Sending", "Sending.", "Sending..", "Sending..."];

const loadingCodeArray = [
  "Verifying",
  "Verifying.",
  "Verifying..",
  "Verifying...",
];

const loadingChangePasswordArray = [
  "Changing",
  "Changing.",
  "Changing..",
  "Changing...",
];

const loadingResendCodeArray = [
  "Resending",
  "Resending.",
  "Resending..",
  "Resending...",
];

const ChangePassword = () => {
  const [changePasswordMail, changeChangePasswordMail] = useState("");
  const [changePasswordCode, changeChangePasswordCode] = useState("");
  const [changePasswordNewPassword, changeChangePasswordNewPassword] =
    useState("");
  const [changePasswordConfirmPassword, changeChangePasswordConfirmPassword] =
    useState("");
  const [
    showChangePasswordConfirmPassword,
    setShowChangePasswordConfirmPassword,
  ] = useState(false);
  const [changePasswordStatus, setChangePasswordStatus] = useState(
    status.initial,
  );
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [fadeOut, setFadeOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let intervalId;

    if (
      changePasswordStatus === status.loading ||
      changePasswordStatus === status.loadingCodeSent ||
      changePasswordStatus === status.loadingResetPassword ||
      changePasswordStatus === status.loadingResendCode
    ) {
      intervalId = setInterval(() => {
        setLoadingTextIndex((prev) => (prev + 1) % loadingArray.length);
      }, 500);
    }

    return () => clearInterval(intervalId);
  }, [changePasswordStatus]);

  const clickedLogin = () => {
    setFadeOut(true);
    setTimeout(() => {
      navigate("/login");
    }, 400);
  };

  const changingChangePasswordMail = (e) => {
    changeChangePasswordMail(e.target.value);
    setErrorMsg("");
  };

  const changingChangePasswordCode = (e) => {
    changeChangePasswordCode(e.target.value);
    setErrorMsg("");
  };

  const changingChangePasswordNewPassword = (e) => {
    changeChangePasswordNewPassword(e.target.value);
    setErrorMsg("");
  };

  const changingChangePasswordConfirmPassword = (e) => {
    changeChangePasswordConfirmPassword(e.target.value);
    setErrorMsg("");
  };

  const clickedChangePasswordShowOrHideBtn = () => {
    setShowChangePasswordConfirmPassword((prev) => !prev);
  };

  const clickedChangePasswordResendCodeBtn = async () => {
    setChangePasswordStatus(status.loadingResendCode);
    const userMail = {
      mail: changePasswordMail,
    };
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userMail),
    };
    try {
      const response = await fetch(
        "https://hr-backend-k3e7.onrender.com/send-code",
        options,
      );
      if (response.ok) {
        setChangePasswordStatus(status.codeSent);
        setErrorMsg("");
      } else {
        const data = await response.json();
        setErrorMsg(data.message);
        setChangePasswordStatus(status.codeSent);
      }
    } catch (err) {
      console.log(err);
      setErrorMsg("Something went wrong");
    }
  };

  const submittedResetForm = async (e) => {
    e.preventDefault();
    setChangePasswordStatus(status.loading);
    const userMail = {
      mail: changePasswordMail,
    };
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userMail),
    };
    try {
      const response = await fetch(
        "https://hr-backend-k3e7.onrender.com/send-code",
        options,
      );
      if (response.ok) {
        setChangePasswordStatus(status.codeSent);
        setErrorMsg("");
      } else {
        const data = await response.json();
        setErrorMsg(data.message);
        setChangePasswordStatus(status.initial);
      }
    } catch (err) {
      console.log(err);
      setErrorMsg("Something went wrong");
    }
  };

  const submittedCodeForm = async (e) => {
    e.preventDefault();
    setChangePasswordStatus(status.loadingCodeSent);
    try {
      const response = await fetch(
        `https://hr-backend-k3e7.onrender.com/verify-code/${changePasswordCode}`,
      );
      if (response.ok) {
        setChangePasswordStatus(status.resetPassword);
        setErrorMsg("");
      } else {
        const data = await response.json();
        setErrorMsg(data.message);
        setChangePasswordStatus(status.codeSent);
      }
    } catch (err) {
      console.log(err);
      setErrorMsg("Something went wrong");
    }
  };

  const submittedChangePasswordForm = async (e) => {
    e.preventDefault();
    setChangePasswordStatus(status.loadingResetPassword);
    const details = {
      mail: changePasswordMail,
      newPassword: changePasswordNewPassword,
    };
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(details),
    };
    try {
      const response = await fetch(
        "https://hr-backend-k3e7.onrender.com/change-password",
        options,
      );
      if (response.ok) {
        setChangePasswordStatus(status.success);
        setErrorMsg("");
      } else {
        const data = await response.json();
        setErrorMsg(data.message);
        setChangePasswordStatus(status.resetPassword);
      }
    } catch (err) {
      console.log(err);
      setErrorMsg("Something went wrong");
    }
  };

  const submittedFinalForm = (e) => {
    e.preventDefault();
    setFadeOut(true);
    setTimeout(() => {
      navigate("/login");
    }, 400);
  };

  const renderInitialView = () => (
    <form
      onSubmit={submittedResetForm}
      className="ecoai-changepassword-form-container"
    >
      <h1 className="ecoai-changepassword-heading">RESET</h1>
      <div className="ecoai-changepassword-container">
        <input
          type="email"
          placeholder=" "
          className="ecoai-changepassword-inp"
          id="ecoai-changepassword-inp"
          value={changePasswordMail}
          onChange={changingChangePasswordMail}
        />
        <label
          htmlFor="ecoai-changepassword-inp"
          className="ecoai-changepassword-label"
        >
          Enter your email
        </label>
      </div>
      <div className="ecoai-changepassword-error-msg-container">
        <span className="ecoai-changepassword-error-msg">{errorMsg}</span>
      </div>
      <button
        disabled={
          !changePasswordMail || changePasswordStatus === status.loading
        }
        style={{
          opacity:
            !changePasswordMail || changePasswordStatus === status.loading
              ? 0.5
              : 1,
        }}
        type="submit"
        className="ecoai-changepassword-button"
      >
        {changePasswordStatus === status.loading
          ? loadingArray[loadingTextIndex]
          : "Send code"}
      </button>
      <p className="ecoai-changepassword-remember-password-text">
        Remember your password?{" "}
        <span
          className="ecoai-changepassword-login-text"
          onClick={clickedLogin}
        >
          Login
        </span>
      </p>
    </form>
  );

  const renderCodeSentView = () => (
    <form
      onSubmit={submittedCodeForm}
      className="ecoai-changepassword-form-container"
    >
      <h1 className="ecoai-changepassword-heading">RESET</h1>
      <div className="ecoai-changepassword-container">
        <input
          type="number"
          inputMode="numeric"
          placeholder=" "
          className="ecoai-changepassword-inp"
          id="ecoai-changepassword-inp"
          value={changePasswordCode}
          onChange={changingChangePasswordCode}
        />
        <label
          htmlFor="ecoai-changepassword-inp"
          className="ecoai-changepassword-label"
        >
          Enter 6-digit Code
        </label>
      </div>
      <div className="ecoai-changepassword-codesent-error-msg-container">
        <span className="ecoai-changepassword-error-msg">{errorMsg}</span>
      </div>
      <div className="ecoai-changepassword-code-resend-btn-container">
        <button
          disabled={
            changePasswordStatus === status.loadingResendCode ||
            changePasswordStatus === status.loadingCodeSent
          }
          style={{
            opacity:
              changePasswordStatus === status.loadingResendCode ||
              changePasswordStatus === status.loadingCodeSent
                ? 0.5
                : 1,
          }}
          onClick={clickedChangePasswordResendCodeBtn}
          type="button"
          className="ecoai-changepassword-code-resend-btn"
        >
          {changePasswordStatus === status.loadingResendCode
            ? loadingResendCodeArray[loadingTextIndex]
            : "Resend"}
        </button>
      </div>
      <button
        disabled={
          changePasswordStatus === status.loadingCodeSent ||
          changePasswordCode.length !== 6
        }
        style={{
          opacity:
            changePasswordStatus === status.loadingCodeSent ||
            changePasswordCode.length !== 6
              ? 0.5
              : 1,
        }}
        type="submit"
        className="ecoai-changepassword-button"
      >
        {changePasswordStatus === status.loadingCodeSent
          ? loadingCodeArray[loadingTextIndex]
          : "Verify Code"}
      </button>
      <p className="ecoai-changepassword-remember-password-text">
        Remember your password?{" "}
        <span
          className="ecoai-changepassword-login-text"
          onClick={clickedLogin}
        >
          Login
        </span>
      </p>
    </form>
  );

  const renderResetPasswordView = () => (
    <form
      onSubmit={submittedChangePasswordForm}
      className="ecoai-changepassword-form-container"
    >
      <h1 className="ecoai-changepassword-heading">RESET</h1>
      <div className="ecoai-changepassword-password-container">
        <input
          type="password"
          placeholder=" "
          className="ecoai-changepassword-password-inp"
          id="ecoai-changepassword-password-inp"
          value={changePasswordNewPassword}
          onChange={changingChangePasswordNewPassword}
        />
        <label
          htmlFor="ecoai-changepassword-password-inp"
          className="ecoai-changepassword-password-label"
        >
          New password
        </label>
      </div>
      <div className="ecoai-changepassword-confirm-password-container">
        <input
          type={showChangePasswordConfirmPassword ? "text" : "password"}
          placeholder=" "
          className="ecoai-changepassword-confirm-password-inp"
          id="ecoai-changepassword-confirm-password-inp"
          value={changePasswordConfirmPassword}
          onChange={changingChangePasswordConfirmPassword}
        />
        <label
          htmlFor="ecoai-changepassword-confirm-password-inp"
          className="ecoai-changepassword-confirm-password-label"
        >
          Confirm password
        </label>
        {changePasswordConfirmPassword ? (
          <button
            type="button"
            className="ecoai-changepassword-show-or-hide-button"
            onClick={clickedChangePasswordShowOrHideBtn}
          >
            {showChangePasswordConfirmPassword ? "Hide" : "Show"}
          </button>
        ) : null}
      </div>
      <div className="ecoai-changepassword-error-msg-container">
        <span className="ecoai-changepassword-error-msg">{errorMsg}</span>
      </div>
      <button
        disabled={
          changePasswordStatus === status.loadingResetPassword ||
          changePasswordNewPassword.length < 6 ||
          changePasswordConfirmPassword !== changePasswordNewPassword
        }
        style={{
          opacity:
            changePasswordStatus === status.loadingResetPassword ||
            changePasswordNewPassword.length < 6 ||
            changePasswordConfirmPassword !== changePasswordNewPassword
              ? 0.5
              : 1,
        }}
        type="submit"
        className="ecoai-changepassword-button"
      >
        {changePasswordStatus === status.loadingResetPassword
          ? loadingChangePasswordArray[loadingTextIndex]
          : "Change Password"}
      </button>
      <p className="ecoai-changepassword-remember-password-text">
        Remember your password?{" "}
        <span
          className="ecoai-changepassword-login-text"
          onClick={clickedLogin}
        >
          Login
        </span>
      </p>
    </form>
  );

  const renderSuccessView = () => (
    <form
      onSubmit={submittedFinalForm}
      className="ecoai-changepassword-form-container"
    >
      <h1 className="ecoai-changepassword-heading">RESET</h1>
      <div className="ecoai-changepassword-text-and-go-to-login-page-btn-container">
        <div className="ecoai-changepassword-icon-container">
          <FaCircleCheck className="ecoai-changepassword-success-icon" />
        </div>
        <p className="ecoai-changepassword-text">
          Password changed successfully
        </p>
        <button
          type="submit"
          autoFocus
          className="ecoai-changepassword-go-to-login-page-buttonn"
        >
          Login →
        </button>
      </div>
    </form>
  );

  const renderFinalView = () => {
    switch (changePasswordStatus) {
      case status.initial:
      case status.loading:
        return renderInitialView();
      case status.codeSent:
      case status.loadingCodeSent:
      case status.loadingResendCode:
        return renderCodeSentView();
      case status.resetPassword:
      case status.loadingResetPassword:
        return renderResetPasswordView();
      case status.success:
        return renderSuccessView();
      default:
        return null;
    }
  };

  return (
    <div
      className={`ecoai-changepassword-bg-container ${
        fadeOut ? "fade-out" : "fade-in"
      }`}
    >
      <div className="ecoai-changepassword-info-form-container">
        <div className="ecoai-changepassword-info-container">
          <img
            className="ecoai-changepassword-logo"
            src="https://res.cloudinary.com/dnxaaxcjv/image/upload/v1762517823/LoginLogo_andrdl.png"
            alt="ecoai-changepassword-logo"
          />
          <div className="ecoai-changepassword-info-matter-container">
            <p className="ecoai-changepassword-info-matter1">Reset Password</p>
            <p className="ecoai-changepassword-info-matter2">
              Please enter your registered email address to help us securely
              reset your password.
            </p>
          </div>
          <div className="ecoai-changepassword-info-swipe-container">
            <MdOutlineSwipeUp />
          </div>
        </div>
        {renderFinalView()}
      </div>
    </div>
  );
};

export default ChangePassword;
