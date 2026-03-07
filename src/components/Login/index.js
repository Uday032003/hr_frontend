import { useNavigate, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { MdOutlineSwipeUp } from "react-icons/md";
import "./index.css";

const status = {
  initial: "INITIAL",
  loading: "LOADING",
  success: "SUCCESS",
  failure: "FAILURE",
};

const loadingArray = [
  "Logging in",
  "Logging in.",
  "Logging in..",
  "Logging in...",
];

const Login = () => {
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginMail, changeLoginMail] = useState("");
  const [loginPassword, changeLoginPassword] = useState("");
  const [loginStatus, setLoginStatus] = useState(status.initial);
  const [dummyBtnLoading, setDummyBtnLoading] = useState({
    dummyAdmin: false,
    dummyUser: false,
  });
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [fadeOut, setFadeOut] = useState(false);
  const navigate = useNavigate();

  // const clickedRegister = () => {
  //   setFadeOut(true);
  //   setTimeout(() => {
  //     navigate("/signup");
  //   }, 400);
  // };

  // const clickedVerify = () => {
  //   setFadeOut(true);
  //   setTimeout(() => {
  //     navigate("/verify");
  //   }, 400);
  // };

  useEffect(() => {
    let intervalId;

    if (loginStatus === status.loading) {
      intervalId = setInterval(() => {
        setLoadingTextIndex((prev) => (prev + 1) % loadingArray.length);
      }, 500);
    }

    return () => clearInterval(intervalId);
  }, [loginStatus]);

  const changingLoginMail = (e) => {
    changeLoginMail(e.target.value);
  };

  const changingLoginPassword = (e) => {
    changeLoginPassword(e.target.value);
  };

  const clickedLoginShowOrHideBtn = () => {
    setShowLoginPassword((i) => !i);
  };

  const submittedLoginForm = async (e) => {
    if (e) e.preventDefault();
    setLoginStatus(status.loading);
    const userDetails = {
      mail: loginMail,
      password: loginPassword,
    };
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userDetails),
    };
    try {
      const response = await fetch(
        "https://hr-backend-k3e7.onrender.com/login",
        options,
      );
      if (response.ok) {
        const data = await response.json();
        const jwtToken = data.jwtToken;
        const isUser = data.isUser;
        if (isUser) {
          Cookies.set("jwt_Token", jwtToken, { expires: 30 });
          navigate("/");
        } else {
          Cookies.set("admin_Token", jwtToken, { expires: 30 });
          navigate("/admin-dashboard");
        }
        setLoginStatus(status.success);
        setDummyBtnLoading({ dummyAdmin: false, dummyUser: false });
      } else {
        const data = await response.json();
        setErrorMsg(data.message);
        setLoginStatus(status.failure);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const clickedForgotPassword = () => {
    setFadeOut(true);
    setTimeout(() => {
      navigate("/change-password");
    }, 400);
  };

  const clickedToLoginAsAdmin = () => {
    setDummyBtnLoading({ dummyAdmin: true, dummyUser: false });
    changeLoginMail("professorshastri@gmail.com");
    changeLoginPassword("professorshastri");
  };

  const clickedToLoginAsUser = () => {
    setDummyBtnLoading({ dummyAdmin: false, dummyUser: true });
    changeLoginMail("chotabheem@gmail.com");
    changeLoginPassword("chotabheem");
  };

  const jwtToken = Cookies.get("jwt_Token");
  const adminToken = Cookies.get("admin_Token");
  if (adminToken !== undefined) {
    return <Navigate to="/admin-dashboard" />;
  }
  if (jwtToken !== undefined) {
    return <Navigate to="/" />;
  }

  return (
    <div
      className={`ecoai-login-bg-container ${fadeOut ? "fade-out" : "fade-in"}`}
    >
      <div className="ecoai-login-info-form-container">
        <div className="ecoai-login-info-container">
          <img
            className="ecoai-login-logo"
            src="https://res.cloudinary.com/dnxaaxcjv/image/upload/v1762517823/LoginLogo_andrdl.png"
            alt="ecoai-login-logo"
          />
          <div className="ecoai-login-info-matter-container">
            <p className="ecoai-login-info-matter1">Welcome Back</p>
            <p className="ecoai-login-info-matter2">
              Please log in using your personal infomation to stay connected
              with us.
            </p>
          </div>
          <div className="ecoai-login-info-swipe-container">
            <MdOutlineSwipeUp />
          </div>
        </div>
        <form
          onSubmit={submittedLoginForm}
          className="ecoai-login-form-container"
        >
          <h1 className="ecoai-login-heading">LOGIN</h1>
          <div className="ecoai-login-email-container">
            <input
              type="email"
              placeholder=" "
              className="ecoai-login-email-inp"
              id="ecoai-login-email-inp"
              value={loginMail}
              onChange={changingLoginMail}
            />
            <label
              htmlFor="ecoai-login-email-inp"
              className="ecoai-login-email-label"
            >
              Enter your email
            </label>
          </div>
          <div className="ecoai-login-password-container">
            <input
              type={showLoginPassword ? "text" : "password"}
              placeholder=" "
              className="ecoai-login-password-inp"
              id="ecoai-login-password-inp"
              value={loginPassword}
              onChange={changingLoginPassword}
            />
            <label
              htmlFor="ecoai-login-password-inp"
              className="ecoai-login-password-label"
            >
              Enter your password
            </label>
            {loginPassword ? (
              <button
                type="button"
                className="ecoai-login-show-or-hide-button"
                onClick={clickedLoginShowOrHideBtn}
              >
                {showLoginPassword ? "Hide" : "Show"}
              </button>
            ) : null}
          </div>
          <div className="ecoai-login-error-msg-container">
            <span className="ecoai-login-error-msg">{errorMsg}</span>
          </div>
          <div className="ecoai-login-forgot-password-container">
            <button
              type="button"
              className="ecoai-login-forgot-password-btn"
              onClick={clickedForgotPassword}
            >
              Forgot password?
            </button>
          </div>
          <button
            id="ecoai-login-btn"
            disabled={
              !loginMail ||
              loginPassword.length < 6 ||
              loginStatus === status.loading
            }
            style={{
              opacity:
                !loginMail ||
                loginPassword.length < 6 ||
                loginStatus === status.loading
                  ? 0.5
                  : 1,
            }}
            type="submit"
            className="ecoai-login-button"
          >
            {loginStatus === status.loading
              ? loadingArray[loadingTextIndex]
              : "Login"}
          </button>
          {/* <p className="ecoai-login-verify-email-text">
            Verify your email?{" "}
            <span className="ecoai-login-verify-text" onClick={clickedVerify}>
              Verify
            </span>
          </p>
          <p className="ecoai-login-no-account-text">
            Don't have an account?{" "}
            <span
              className="ecoai-login-register-text"
              onClick={clickedRegister}
            >
              Register
            </span>
          </p> */}
        </form>
        <div className="ecoai-login-dummy-login-btns-container">
          <button
            type="button"
            onClick={clickedToLoginAsAdmin}
            className={`ecoai-login-dummy-login-btn ${dummyBtnLoading.dummyAdmin && loginStatus === status.loading && "dummy-btn-animation"} ${dummyBtnLoading.dummyAdmin && "ecoai-login-dummy-login-btn-selected"}`}
          >
            Click me to login as Admin
          </button>
          <button
            type="button"
            onClick={clickedToLoginAsUser}
            className={`ecoai-login-dummy-login-btn ${dummyBtnLoading.dummyUser && loginStatus === status.loading && "dummy-btn-animation"} ${dummyBtnLoading.dummyUser && "ecoai-login-dummy-login-btn-selected"}`}
          >
            Click me to login as User
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
