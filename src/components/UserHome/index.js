import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { ClipLoader } from "react-spinners";
import Modal from "react-modal";
import { FaCirclePause } from "react-icons/fa6";
import { FaCirclePlay } from "react-icons/fa6";
import { FaCircleXmark } from "react-icons/fa6";

import Header from "../Header";
import UserSidebar from "../UserSidebar";
import UserBottombar from "../UserBottombar";
import ProfileIncompleteBanner from "../ProfileIncompleteBanner";
import "./index.css";

const status = {
  loading: "LOADING",
  success: "SUCCESS",
  failure: "FAILURE",
};

const UserHome = () => {
  const [userTodayDetails, setUserTodayDetails] = useState(null);
  const [currentStatus, setCurrentStatus] = useState(status.loading);
  const jwtToken = Cookies.get("jwt_Token");
  const dateToday = new Date().toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const [pauseTimeStatus, setPauseTimeStatus] = useState(status.initial);
  const [resumeTimeStatus, setResumeTimeStatus] = useState(status.initial);
  const [logoutTimeStatus, setLogoutTimeStatus] = useState(status.initial);
  const [breakInTime, setBreakInTime] = useState(null);
  const [breakOutTime, setBreakOutTime] = useState(null);
  const [logoutTime, setLogoutTime] = useState(null);
  const [logoutModalIsOpen, setLogoutModalIsOpen] = useState(false);
  const [durationPauseModalIsOpen, setDurationPauseModalIsOpen] =
    useState(false);
  const [durationPlayModalIsOpen, setDurationPlayModalIsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isHoverVissible, setIsHoverVisible] = useState(false);
  const [markAttendanceLoading, setMarkAttendanceLoading] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "error",
  });
  const navigate = useNavigate();

  const playpauseicon = () => {
    if (breakOutTime !== null && breakInTime === null) {
      return (
        <FaCirclePlay className="ecoai-user-home-success-playpause-icon" />
      );
    }
    return <FaCirclePause className="ecoai-user-home-success-playpause-icon" />;
  };

  const getWorkingDuration = (val1, val2, val3, val4, nowTime) => {
    const startDate = new Date(val1);
    const endDate = val2 ? new Date(val2) : nowTime;
    let diffMs;
    if (val2 === null) {
      diffMs = (endDate - startDate) / 1000 + 19800;
    } else {
      diffMs = (endDate - startDate) / 1000;
    }
    if (val3 && !val4) {
      const breakOutDate = new Date(val3);
      diffMs -= (endDate - breakOutDate) / 1000 + 19800;
    }
    if (val3 && val4) {
      const breakOutDate = new Date(val3);
      const breakInDate = new Date(val4);
      diffMs -= (breakInDate - breakOutDate) / 1000;
    }
    diffMs = Math.max(diffMs, 0);
    const hours = Math.floor(diffMs / 3600);
    const minutes = Math.floor((diffMs % 3600) / 60);
    const seconds = Math.floor(diffMs % 60);
    return `${hours !== 0 ? `${hours}h ` : ""} ${
      minutes !== 0 ? `${minutes}m` : ""
    } ${seconds !== 0 ? `${seconds}s` : ""}`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const userTodayDetails = async () => {
      const options = {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      };
      try {
        const response = await fetch(
          "http://localhost:3001/user-today-details",
          options,
        );
        if (response.ok) {
          const data = await response.json();
          const updatedData = {
            name: data.name,
            username: data.username,
            jobType: data.job_type,
            loginTime: data.login_time,
            logoutTime: data.logout_time,
            attendanceType: data.attendance_type,
            breakOutTime: data.break_out_time,
            breakInTime: data.break_in_time,
          };
          setUserTodayDetails(updatedData);
          setCurrentStatus(status.success);
          setLogoutTime(updatedData.logoutTime);
          setBreakInTime(updatedData.breakInTime);
          setBreakOutTime(updatedData.breakOutTime);
        } else {
          setCurrentStatus(status.failure);
        }
      } catch (error) {
        console.log(error);
        setCurrentStatus(status.failure);
      }
    };
    userTodayDetails();
  }, [jwtToken]);

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type });
    }, 2500);
  };

  const clickedTimePausePlayBtn = () => {
    if (breakOutTime === null && breakInTime === null && logoutTime === null) {
      setDurationPauseModalIsOpen(true);
    }
    if (breakOutTime !== null && breakInTime === null && logoutTime === null) {
      setDurationPlayModalIsOpen(true);
    }
    if (breakOutTime !== null && breakInTime !== null && logoutTime === null) {
      setLogoutModalIsOpen(true);
    }
  };

  const clickedMarkAttendanceBtn = async () => {
    setMarkAttendanceLoading(true);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDateDetails = {
      selectedDate: today.toISOString(),
    };
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify(selectedDateDetails),
    };
    try {
      const response = await fetch(
        "http://localhost:3001/update-selected-date",
        options,
      );
      if (response.ok) {
        setMarkAttendanceLoading(false);
        navigate("/my-attendance");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const clickedLogoutBtn = async () => {
    setLogoutTimeStatus(status.loading);
    const ipRes = await fetch("https://api.ipify.org?format=json");
    const { ip: publicIP } = await ipRes.json();
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({ detectedIP: publicIP }),
    };
    try {
      const response = await fetch(
        "http://localhost:3001/attendance/logout",
        options,
      );
      console.log(response);
      if (response.ok) {
        const data = await response.json();
        showToast(data.message, "success");
        setLogoutTime(data.userLogoutTime);
        setLogoutTimeStatus(status.success);
        setLogoutModalIsOpen(false);
      } else {
        const data = await response.json();
        showToast(data.message, "error");
        setLogoutTimeStatus(status.failure);
      }
    } catch (error) {
      console.log(error);
      showToast("Logout Failed", "success");
      setLogoutTimeStatus(status.failure);
    }
  };

  const clickedPauseBtn = async () => {
    setPauseTimeStatus(status.loading);
    const options = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    };
    try {
      const response = await fetch(
        "http://localhost:3001/attendance/break-out",
        options,
      );
      console.log(response);
      if (response.ok) {
        const data = await response.json();
        showToast(data.message, "success");
        setBreakOutTime(data.userBreakOutTime);
        setPauseTimeStatus(status.success);
        setDurationPauseModalIsOpen(false);
      } else {
        const data = await response.json();
        showToast(data.message, "error");
        setPauseTimeStatus(status.failure);
      }
    } catch (error) {
      console.log(error);
      showToast("Break Failed", "error");
      setPauseTimeStatus(status.failure);
    }
  };

  const clickedPlayBtn = async () => {
    setResumeTimeStatus(status.loading);
    const options = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    };
    try {
      const response = await fetch(
        "http://localhost:3001/attendance/break-in",
        options,
      );
      console.log(response);
      if (response.ok) {
        const data = await response.json();
        showToast(data.message, "success");
        setBreakInTime(data.userBreakInTime);
        setResumeTimeStatus(status.success);
        setDurationPlayModalIsOpen(false);
      } else {
        const data = await response.json();
        showToast(data.message, "error");
        setResumeTimeStatus(status.failure);
      }
    } catch (error) {
      console.log(error);
      showToast("Resume Failed", "error");
      setResumeTimeStatus(status.failure);
    }
  };

  const renderFailureView = () => (
    <div className="ecoai-user-home-failure-view-container">Failed to load</div>
  );

  const renderLoadingView = () => (
    <div className="ecoai-user-home-loading-view-container">
      <ClipLoader size={30} color={"#bdbbbb"} loading={true} />
    </div>
  );

  const renderSuccessView = () => (
    <div className="ecoai-user-home-success-container">
      <div className="ecoai-user-home-success-header-container">
        <div className="ecoai-user-home-details-container">
          <h1 className="ecoai-user-home-headingtop">
            Hi {userTodayDetails.username}
          </h1>
          <p className="ecoai-user-home-success-role">
            {userTodayDetails.jobType}
          </p>
        </div>
        <p className="ecoai-user-home-success-date">{dateToday}</p>
      </div>
      <div className="ecoai-user-home-success-attendance-card">
        <h2 className="ecoai-user-home-headingbot">Today's Attendance</h2>
        <div className="ecoai-user-home-success-attendance-grid">
          <div>
            <span>Status</span>
            {userTodayDetails.loginTime === null && (
              <p className="ecoai-user-home-success-status not-marked">
                Not Marked
              </p>
            )}
            {((userTodayDetails.loginTime !== null &&
              breakOutTime === null &&
              breakInTime === null &&
              logoutTime === null) ||
              (userTodayDetails.loginTime !== null &&
                breakOutTime !== null &&
                breakInTime !== null &&
                logoutTime === null)) && (
              <p className="ecoai-user-home-success-status present">Active</p>
            )}
            {userTodayDetails.loginTime !== null &&
              breakOutTime !== null &&
              breakInTime === null && (
                <p className="ecoai-user-home-success-status breakout">
                  In Break
                </p>
              )}
            {((userTodayDetails.loginTime !== null &&
              breakOutTime !== null &&
              breakInTime !== null &&
              logoutTime !== null) ||
              (userTodayDetails.loginTime !== null && logoutTime !== null)) && (
              <p className="ecoai-user-home-success-status not-marked">
                Offline
              </p>
            )}
          </div>
          <div>
            <span>Login</span>
            <p className="ecoai-user-home-success-login-logout-time">
              {userTodayDetails.loginTime === null
                ? "  --"
                : new Date(userTodayDetails.loginTime)
                    .toLocaleTimeString("en-IN", {
                      timeZone: "UTC",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                    .toUpperCase()}
            </p>
            <p className="ecoai-user-home-success-resume-play-time">
              {resumeTimeStatus === status.loading ? (
                <ClipLoader size={18} color={"#ffffff"} loading={true} />
              ) : breakInTime === null ? (
                "  --"
              ) : (
                new Date(breakInTime)
                  .toLocaleTimeString("en-IN", {
                    timeZone: "UTC",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                  .toUpperCase()
              )}
            </p>
          </div>
          <div>
            <span>Logout</span>
            <p className="ecoai-user-home-success-resume-play-time">
              {pauseTimeStatus === status.loading ? (
                <ClipLoader size={18} color={"#ffffff"} loading={true} />
              ) : breakOutTime === null ? (
                "  --"
              ) : (
                new Date(breakOutTime)
                  .toLocaleTimeString("en-IN", {
                    timeZone: "UTC",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                  .toUpperCase()
              )}
            </p>
            <p className="ecoai-user-home-success-login-logout-time">
              {logoutTimeStatus === status.loading ? (
                <ClipLoader size={18} color={"#ffffff"} loading={true} />
              ) : logoutTime === null ? (
                "  --"
              ) : (
                new Date(logoutTime)
                  .toLocaleTimeString("en-IN", {
                    timeZone: "UTC",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                  .toUpperCase()
              )}
            </p>
          </div>
          <div>
            <span>Work Mode</span>
            <p>
              {userTodayDetails.attendanceType === null
                ? "  --"
                : userTodayDetails.attendanceType}
            </p>
          </div>
        </div>
      </div>
      <div className="ecoai-user-home-success-action-buttons">
        {userTodayDetails.loginTime === null ? (
          <button
            onClick={clickedMarkAttendanceBtn}
            className="ecoai-user-home-success-btn btn-attendance"
          >
            {markAttendanceLoading ? (
              <ClipLoader size={12} color="#ffffff" />
            ) : (
              "Mark Attendance"
            )}
          </button>
        ) : (
          ""
        )}
        {logoutTime === null &&
        userTodayDetails.loginTime !== null &&
        breakOutTime === null ? (
          <button
            onClick={() => setDurationPauseModalIsOpen(true)}
            className="ecoai-user-home-success-btn btn-break-out"
          >
            {pauseTimeStatus === status.loading ? (
              <ClipLoader size={18} color={"#ffffff"} loading={true} />
            ) : (
              "Take Break"
            )}
          </button>
        ) : (
          ""
        )}
        {logoutTime === null &&
        userTodayDetails.loginTime !== null &&
        breakOutTime !== null &&
        breakInTime === null ? (
          <button
            onClick={() => setDurationPlayModalIsOpen(true)}
            className="ecoai-user-home-success-btn btn-break-out"
          >
            {resumeTimeStatus === status.loading ? (
              <ClipLoader size={18} color={"#ffffff"} loading={true} />
            ) : (
              "Back To Work"
            )}
          </button>
        ) : (
          ""
        )}
        {(logoutTime === null &&
          userTodayDetails.loginTime !== null &&
          breakOutTime === null &&
          breakInTime === null) ||
        (logoutTime === null &&
          userTodayDetails.loginTime !== null &&
          breakOutTime !== null &&
          breakInTime !== null) ? (
          <button
            onClick={() => setLogoutModalIsOpen(true)}
            className="ecoai-user-home-success-btn btn-logout"
          >
            {logoutTimeStatus === status.loading ? (
              <ClipLoader size={18} color={"#ffffff"} loading={true} />
            ) : (
              "Logout"
            )}
          </button>
        ) : (
          ""
        )}
        <button
          onClick={() => navigate("/user-calendar")}
          className="ecoai-user-home-success-btn btn-calendar"
        >
          View Calendar
        </button>
        {/* <button
          onClick={clickedAttendanceOverviewBtn}
          className="ecoai-user-home-success-btn btn-my-attendance"
        >
          Attendance Overview
        </button> */}
      </div>
      {userTodayDetails.loginTime !== null ? (
        <div className="ecoai-user-home-success-summary-card">
          <div className="ecoai-user-home-success-playpause-btn-cont">
            <span>
              {logoutTime === null ? "Working Duration" : "Worked Duration"}
            </span>
            <button
              disabled={logoutTime !== null}
              type="button"
              className="ecoai-user-home-success-playpause-btn"
              onClick={clickedTimePausePlayBtn}
            >
              {logoutTime === null ? (
                playpauseicon()
              ) : (
                <FaCirclePlay className="ecoai-user-home-success-playpause-icon" />
              )}
            </button>
          </div>
          <button
            type="button"
            className="ecoai-user-home-success-duration-btn"
            onMouseEnter={() => {
              setIsHoverVisible(true);
            }}
            onMouseLeave={() => {
              setIsHoverVisible(false);
            }}
            onClick={clickedTimePausePlayBtn}
            disabled={logoutTime !== null}
          >
            {getWorkingDuration(
              userTodayDetails.loginTime,
              logoutTime,
              breakOutTime,
              breakInTime,
              currentTime,
            )}
          </button>
          {isHoverVissible && (
            <span className="ecoai-user-home-success-hover-cont">
              Click to pause/resume the time
            </span>
          )}
        </div>
      ) : (
        ""
      )}
    </div>
  );

  const renderFinalView = () => {
    switch (currentStatus) {
      case status.loading:
        return renderLoadingView();
      case status.success:
        return renderSuccessView();
      case status.failure:
        return renderFailureView();
      default:
        return null;
    }
  };

  return (
    <>
      <Header />
      <div className="ecoai-user-home-bg-container">
        <UserSidebar />
        <UserBottombar />
        <div className="ecoai-user-home-right-container">
          <ProfileIncompleteBanner />
          {renderFinalView()}
          <Modal
            isOpen={logoutModalIsOpen}
            onRequestClose={() => setLogoutModalIsOpen(false)}
            contentLabel="Login confirmation Modal"
            style={{
              overlay: {
                backgroundColor: "rgba(0, 0, 0, 0.5)",
              },

              content: {
                top: "50%",
                left: "50%",
                right: "auto",
                bottom: "auto",
                marginRight: "-50%",
                transform: "translate(-50%, -50%)",
                padding: "20px",
                paddingTop: "0",
                borderRadius: "8px",
                backgroundColor: "rgb(20, 20, 20)",
                border: "1px solid rgb(43, 42, 42)",
                color: "#bdbbbb",
              },
            }}
          >
            <div className="ecoai-user-home-modal">
              <span
                className="ecoai-user-home-alert-text"
                onClick={() => navigate("/add-tasks")}
              >
                ADD TASKS DONE BEFORE LOGOUT
              </span>
              <p className="ecoai-user-home-modal-heading">
                You’ve been logged in for <br />
                <span className="ecoai-user-home-modal-logout-time-color">
                  {userTodayDetails !== null &&
                    getWorkingDuration(
                      userTodayDetails.loginTime,
                      logoutTime,
                      breakOutTime,
                      breakInTime,
                      currentTime,
                    )}
                  . <br />
                </span>
                End your session now?
              </p>
              <div className="ecoai-user-home-model-btns-container">
                <button
                  type="button"
                  className="ecoai-user-home-model-btn user-home-green"
                  onClick={clickedLogoutBtn}
                >
                  {logoutTimeStatus === status.loading ? (
                    <ClipLoader size={18} color={"#ffffff"} loading={true} />
                  ) : (
                    "Yes"
                  )}
                </button>
                <button
                  type="button"
                  className="ecoai-user-home-model-btn user-home-grey"
                  onClick={() => setLogoutModalIsOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </Modal>
          <Modal
            isOpen={durationPauseModalIsOpen}
            onRequestClose={() => setDurationPauseModalIsOpen(false)}
            contentLabel="Duration pause confirmation Modal"
            style={{
              overlay: {
                backgroundColor: "rgba(0, 0, 0, 0.5)",
              },

              content: {
                top: "50%",
                left: "50%",
                right: "auto",
                bottom: "auto",
                marginRight: "-50%",
                transform: "translate(-50%, -50%)",
                padding: "20px",
                paddingTop: "0",
                borderRadius: "8px",
                backgroundColor: "rgb(20, 20, 20)",
                border: "1px solid rgb(43, 42, 42)",
                color: "#bdbbbb",
              },
            }}
          >
            <div className="ecoai-user-home-modal">
              <span
                className="ecoai-user-home-alert-text"
                onClick={() => navigate("/add-tasks")}
              >
                ADD TASKS DONE BEFORE BREAK
              </span>
              <p className="ecoai-user-home-modal-heading">
                Would you like to pause your session for a lunch break?
              </p>
              <div className="ecoai-user-home-model-btns-container">
                <button
                  type="button"
                  className="ecoai-user-home-model-btn user-home-green"
                  onClick={clickedPauseBtn}
                >
                  {pauseTimeStatus === status.loading ? (
                    <ClipLoader size={18} color={"#ffffff"} loading={true} />
                  ) : (
                    <>
                      <FaCirclePause />
                      Pause
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="ecoai-user-home-model-btn user-home-grey"
                  onClick={() => setDurationPauseModalIsOpen(false)}
                >
                  <FaCircleXmark />
                  Cancel
                </button>
              </div>
            </div>
          </Modal>
          <Modal
            isOpen={durationPlayModalIsOpen}
            onRequestClose={() => setDurationPlayModalIsOpen(false)}
            contentLabel="Duration play confirmation Modal"
            style={{
              overlay: {
                backgroundColor: "rgba(0, 0, 0, 0.5)",
              },

              content: {
                top: "50%",
                left: "50%",
                right: "auto",
                bottom: "auto",
                marginRight: "-50%",
                transform: "translate(-50%, -50%)",
                padding: "20px",
                paddingTop: "0",
                borderRadius: "8px",
                backgroundColor: "rgb(20, 20, 20)",
                border: "1px solid rgb(43, 42, 42)",
                color: "#bdbbbb",
              },
            }}
          >
            <div className="ecoai-user-home-modal">
              <p className="ecoai-user-home-modal-heading">
                Would you like to resume your session from lunch break?
              </p>
              <div className="ecoai-user-home-model-btns-container">
                <button
                  type="button"
                  className="ecoai-user-home-model-btn user-home-green"
                  onClick={clickedPlayBtn}
                >
                  {resumeTimeStatus === status.loading ? (
                    <ClipLoader size={18} color={"#ffffff"} loading={true} />
                  ) : (
                    <>
                      <FaCirclePlay />
                      Resume
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="ecoai-user-home-model-btn user-home-grey"
                  onClick={() => setDurationPlayModalIsOpen(false)}
                >
                  <FaCircleXmark />
                  Cancel
                </button>
              </div>
            </div>
          </Modal>
        </div>
      </div>
      {toast.show && (
        <div className={`ecoai-toast ecoai-toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
    </>
  );
};

export default UserHome;
