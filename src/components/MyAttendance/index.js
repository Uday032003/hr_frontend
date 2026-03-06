import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { ClipLoader } from "react-spinners";
import { IoCheckmarkCircle } from "react-icons/io5";
import { FaCirclePause } from "react-icons/fa6";
import { FaCirclePlay } from "react-icons/fa6";
import { FaCircleXmark } from "react-icons/fa6";
import { FiSlash } from "react-icons/fi";
import Modal from "react-modal";

import Header from "../Header";
import UserSidebar from "../UserSidebar";
import UserBottombar from "../UserBottombar";
import ProfileIncompleteBanner from "../ProfileIncompleteBanner";
import "./index.css";

const status = {
  initial: "INITIAL",
  loading: "LOADING",
  future: "FUTURE",
  present: "PRESENT",
  past: "PAST",
  success: "SUCCESS",
  failure: "FAILURE",
};

const MyAttendance = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [userLoggedinDetails, setUserLoggedinDetails] = useState(null);
  const [tasksDone, changeTasksDone] = useState([]);
  const [pastDetailsStatus, setPastDetailsStatus] = useState(status.initial);
  const [presentDetailsStatus, setPresentDetailsStatus] = useState(
    status.initial,
  );
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceType, setAttendanceType] = useState("WFO");
  const [currentStatus, setCurrentStatus] = useState(status.loading);
  const [verifyLocationStatus, setVerifyLocationStatus] = useState(
    status.initial,
  );
  const [logoutTimeStatus, setLogoutTimeStatus] = useState(status.initial);
  const [pauseTimeStatus, setPauseTimeStatus] = useState(status.initial);
  const [resumeTimeStatus, setResumeTimeStatus] = useState(status.initial);
  const [logoutTime, setLogoutTime] = useState(null);
  const [breakoutTime, setBreakOutTime] = useState(null);
  const [breakinTime, setBreakInTime] = useState(null);
  const [wfoLoginModalIsOpen, setWfoLoginModalIsOpen] = useState(false);
  const [wfhLoginModalIsOpen, setWfhLoginModalIsOpen] = useState(false);
  const [logoutModalIsOpen, setLogoutModalIsOpen] = useState(false);
  const [durationPauseModalIsOpen, setDurationPauseModalIsOpen] =
    useState(false);
  const [durationPlayModalIsOpen, setDurationPlayModalIsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [wfoLoginModalText, setWfoLoginModalText] = useState("");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "error",
  });
  const jwtToken = Cookies.get("jwt_Token");
  const navigate = useNavigate();

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
    const getUserDetails = async () => {
      const options = {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      };
      try {
        const response = await fetch(
          "http://localhost:3001/user-details",
          options,
        );
        if (response.ok) {
          const data = await response.json();
          const updatedData = {
            userId: data.id,
            userName: data.username,
            jobType: data.job_type,
            selectedDate: data.selected_date,
          };
          setUserDetails(updatedData);
          setSelectedDate(new Date(data.selected_date));
        } else {
        }
      } catch (err) {
        console.log(err);
      }
    };
    getUserDetails();
  }, [jwtToken]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (userDetails === null) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const chosenDate = new Date(selectedDate);
    chosenDate.setHours(0, 0, 0, 0);
    if (chosenDate.getTime() === today.getTime()) {
      setCurrentStatus(status.present);
    } else if (chosenDate < today) {
      setCurrentStatus(status.past);
    } else {
      setCurrentStatus(status.future);
    }
  }, [userDetails, selectedDate]);

  useEffect(() => {
    const getUserAttendanceDetails = async () => {
      const options = {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "application/json",
        },
      };
      try {
        const response = await fetch(
          "http://localhost:3001/user-selected-date-attendance-details",
          options,
        );
        if (response.ok) {
          const data = await response.json();
          const updatedData = {
            userId: data.user.userid,
            userLoginId: data.user.user_loginid,
            name: data.user.name,
            jobType: data.user.job_type,
            loginTime: data.user.login_time,
            logoutTime: data.user.logout_time,
            breakoutTime: data.user.break_out_time,
            breakinTime: data.user.break_in_time,
            attendanceType: data.user.attendance_type,
          };
          const updatedTasksDone = data.tasksDone.map((i) => ({
            taskId: i.task_id,
            task: i.task,
            createdAt: i.created_at,
            attendanceid: i.attendanceid,
          }));
          changeTasksDone(updatedTasksDone);
          setPastDetailsStatus(status.success);
          if (updatedData.loginTime !== null) {
            setPresentDetailsStatus(status.success);
            setLogoutTime(updatedData.logoutTime);
            setBreakOutTime(updatedData.breakoutTime);
            setBreakInTime(updatedData.breakinTime);
          }
          setUserLoggedinDetails(updatedData);
        } else {
          setPastDetailsStatus(status.failure);
          setPresentDetailsStatus(status.failure);
        }
      } catch (error) {
        console.log(error);
        setPastDetailsStatus(status.failure);
        setPresentDetailsStatus(status.failure);
      }
    };
    getUserAttendanceDetails();
  }, [jwtToken, selectedDate, presentDetailsStatus]);

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type });
    }, 2500);
  };

  const clickedVerifyLocationBtn = async () => {
    setVerifyLocationStatus(status.loading);
    try {
      const ipRes = await fetch("https://api.ipify.org?format=json");
      const { ip: publicIP } = await ipRes.json();
      const response = await fetch("http://localhost:3001/verify-location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({ detectedIP: publicIP }),
      });
      const data = await response.json();
      if (response.ok) {
        setWfoLoginModalText(data.message);
        setWfoLoginModalIsOpen(true);
        showToast(data.message, "success");
        setVerifyLocationStatus(status.success);
      } else {
        setVerifyLocationStatus(status.failure);
        showToast(data.message, "error");
      }
    } catch (error) {
      setVerifyLocationStatus(status.failure);
      showToast("Network error checking location", "error");
    }
  };

  const clickedMyattendanceLoginBtn = async () => {
    setPresentDetailsStatus(status.loading);
    const attendanceTypeDetails = {
      attendanceType,
    };
    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(attendanceTypeDetails),
    };
    try {
      const response = await fetch(
        "http://localhost:3001/attendance/login",
        options,
      );
      if (response.ok) {
        const data = await response.json();
        showToast(data.message, "success");
        setWfoLoginModalIsOpen(false);
        setWfhLoginModalIsOpen(false);
        setPresentDetailsStatus(status.success);
      } else {
        const data = await response.json();
        showToast(data.message, "error");
        setPresentDetailsStatus(status.failure);
      }
    } catch (error) {
      showToast("Login Failed", "error");
      setPresentDetailsStatus(status.failure);
    }
  };

  const clickedMyattendanceLogoutBtn = async () => {
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
      showToast("Logout Failed", "error");
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

  const wfoView = () => (
    <div className="ecoai-myattendance-present-view-wfo-wfh-container">
      <div className="ecoai-myattendance-present-view-location-container">
        <h2 className="ecoai-myattendance-present-view-heading">Attendance</h2>
        <button
          disabled={
            verifyLocationStatus === status.success ||
            verifyLocationStatus === status.loading
          }
          type="button"
          className={`ecoai-myattendance-present-view-verify-location-btn ${verifyLocationStatus === status.success && "ecoai-myattendance-present-view-verify-location-btn-verified"}`}
          onClick={clickedVerifyLocationBtn}
        >
          {(verifyLocationStatus === status.initial ||
            verifyLocationStatus === status.failure) &&
            "Verify Location"}
          {verifyLocationStatus === status.loading && (
            <ClipLoader size={15} color={"#000000"} />
          )}
          {verifyLocationStatus === status.success && (
            <>
              <IoCheckmarkCircle className="ecoai-myattendance-present-view-location-icon" />
              Location Verified
            </>
          )}
        </button>
      </div>
    </div>
  );

  const wfhView = () => (
    <div className="ecoai-myattendance-present-view-wfo-wfh-container">
      <h2 className="ecoai-myattendance-present-view-heading">Attendance</h2>
      <p
        style={{
          color: "#bdbbbb",
          fontSize: "14px",
        }}
      >
        No need to verify location
      </p>
      <button
        type="button"
        className="ecoai-myattendance-present-view-wfo-wfh-login-btn"
        onClick={() => setWfhLoginModalIsOpen(true)}
      >
        {presentDetailsStatus === status.loading ? (
          <ClipLoader size={15} color={"#000000"} />
        ) : (
          "Login"
        )}
      </button>
    </div>
  );

  const renderLoadingView = () => (
    <div className="ecoai-myattendance-loading-failed-view-container">
      <ClipLoader size={30} color={"#ffffff"} loading={true} />
    </div>
  );

  const renderFailureView = () => (
    <div className="ecoai-myattendance-loading-failed-view-container">
      Failed to fetch data
    </div>
  );

  const renderPastView = () => (
    <div className="ecoai-myattendance-present-past-future-view-container">
      <p className="ecoai-myattendance-present-past-future-view-date">
        {selectedDate.toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </p>
      <h1 className="ecoai-myattendance-present-past-future-view-name">
        Welcome {userDetails.userName}
      </h1>
      <p className="ecoai-myattendance-present-past-future-view-role">
        {userDetails.jobType}
      </p>
      {pastFinalView()}
    </div>
  );

  const renderPresentView = () => (
    <div className="ecoai-myattendance-present-past-future-view-container">
      <p className="ecoai-myattendance-present-past-future-view-date">
        {selectedDate.toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </p>
      <h1 className="ecoai-myattendance-present-past-future-view-name">
        Hi {userDetails.userName}
      </h1>
      <p className="ecoai-myattendance-present-past-future-view-role">
        {userDetails.jobType}
      </p>
      {presentDetailsStatus === status.initial ||
      presentDetailsStatus === status.loading ? (
        <div className="ecoai-myattendance-present-view-btns-container">
          <button
            type="button"
            className={`ecoai-myattendance-present-view-btn wfo-btn ${attendanceType === "WFO" ? "selected-wfo" : ""}`}
            onClick={() => setAttendanceType("WFO")}
          >
            Work From Office
          </button>
          <button
            type="button"
            className={`ecoai-myattendance-present-view-btn wfh-btn ${attendanceType === "WFH" ? "selected-wfh" : ""}`}
            onClick={() => setAttendanceType("WFH")}
          >
            Work From Home
          </button>
        </div>
      ) : null}
      {presentFinalView()}
    </div>
  );

  const renderFutureView = () => (
    <div className="ecoai-myattendance-present-past-future-view-container">
      <p className="ecoai-myattendance-present-past-future-view-date">
        {selectedDate.toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </p>
      <h1 className="ecoai-myattendance-present-past-future-view-name">
        Hello {userDetails.userName}
      </h1>
      <p className="ecoai-myattendance-present-past-future-view-role">
        {userDetails.jobType}
      </p>
      <span className="ecoai-myattendance-future-cannot-mark-text">
        <FiSlash className="ecoai-myattendance-future-cannot-mark-icon" />
        Attendance cannot be marked for future dates.
      </span>
    </div>
  );

  const presentSuccessView = () => (
    <div className="ecoai-myattendance-present-past-success-main-container">
      <div className="ecoai-myattendance-present-past-success-container">
        <div className="ecoai-myattendance-present-past-success-container-inner-cont">
          <label
            className="ecoai-myattendance-present-past-success-container-inner-label"
            htmlFor="ecoai-presentview-name-label"
          >
            Name:
          </label>
          <p
            className="ecoai-myattendance-present-past-success-container-inner-text"
            id="ecoai-presentview-name-label"
          >
            {userLoggedinDetails.name}
          </p>
        </div>
        <div className="ecoai-myattendance-present-past-success-container-inner-cont">
          <label
            className="ecoai-myattendance-present-past-success-container-inner-label"
            htmlFor="ecoai-presentview-jobtype-label"
          >
            Job Type:
          </label>
          <p
            className="ecoai-myattendance-present-past-success-container-inner-text"
            id="ecoai-presentview-jobtype-label"
          >
            {userLoggedinDetails.jobType}
          </p>
        </div>
        <div className="ecoai-myattendance-present-past-success-container-inner-cont">
          <label
            className="ecoai-myattendance-present-past-success-container-inner-label"
            htmlFor="ecoai-presentview-loggedin-label"
          >
            Logged In at:
          </label>
          <p
            className="ecoai-myattendance-present-past-success-container-inner-text"
            id="ecoai-presentview-loggedin-label"
          >
            {userLoggedinDetails.loginTime === null
              ? "--"
              : new Date(userLoggedinDetails.loginTime)
                  .toLocaleTimeString("en-IN", {
                    timeZone: "UTC",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                  .toUpperCase()}
          </p>
        </div>
        <div className="ecoai-myattendance-present-past-success-container-inner-cont">
          <label
            className="ecoai-myattendance-present-past-success-container-inner-label"
            htmlFor="ecoai-presentview-breakout-label"
          >
            Took Break at:
          </label>
          {pauseTimeStatus === status.loading ? (
            <div className="ecoai-myattendance-present-past-success-container-time-loading-cont">
              <ClipLoader color="#bdbbbb" size={10} />
            </div>
          ) : (
            <p
              className="ecoai-myattendance-present-past-success-container-inner-text"
              id="ecoai-presentview-breakout-label"
            >
              {breakoutTime === null
                ? "--"
                : new Date(breakoutTime)
                    .toLocaleTimeString("en-IN", {
                      timeZone: "UTC",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                    .toUpperCase()}
            </p>
          )}
        </div>
        <div className="ecoai-myattendance-present-past-success-container-inner-cont">
          <label
            className="ecoai-myattendance-present-past-success-container-inner-label"
            htmlFor="ecoai-presentview-breakin-label"
          >
            Work Resumed at:
          </label>
          {resumeTimeStatus === status.loading ? (
            <div className="ecoai-myattendance-present-past-success-container-time-loading-cont">
              <ClipLoader color="#bdbbbb" size={10} />
            </div>
          ) : (
            <p
              className="ecoai-myattendance-present-past-success-container-inner-text"
              id="ecoai-presentview-breakin-label"
            >
              {breakinTime === null
                ? "--"
                : new Date(breakinTime)
                    .toLocaleTimeString("en-IN", {
                      timeZone: "UTC",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                    .toUpperCase()}
            </p>
          )}
        </div>
        <div className="ecoai-myattendance-present-past-success-container-inner-cont">
          <label
            className="ecoai-myattendance-present-past-success-container-inner-label"
            htmlFor="ecoai-presentview-loggedout-label"
          >
            Logged Out at:
          </label>
          {logoutTimeStatus === status.loading ? (
            <div className="ecoai-myattendance-present-past-success-container-time-loading-cont">
              <ClipLoader color="#bdbbbb" size={10} />
            </div>
          ) : (
            <p
              className="ecoai-myattendance-present-past-success-container-inner-text"
              id="ecoai-presentview-loggedout-label"
            >
              {logoutTime === null
                ? "--"
                : new Date(logoutTime)
                    .toLocaleTimeString("en-IN", {
                      timeZone: "UTC",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                    .toUpperCase()}
            </p>
          )}
        </div>
        <div className="ecoai-myattendance-present-past-success-container-inner-cont">
          <label
            className="ecoai-myattendance-present-past-success-container-inner-label"
            htmlFor="ecoai-presentview-duration-label"
          >
            {logoutTime === null
              ? "Working Duration:"
              : "Total Worked Duration:"}
          </label>
          <p
            className="ecoai-myattendance-present-past-success-container-worked-duration"
            id="ecoai-presentview-duration-label"
          >
            {getWorkingDuration(
              userLoggedinDetails.loginTime,
              logoutTime,
              breakoutTime,
              breakinTime,
              currentTime,
            )}
          </p>
        </div>
        <div className="ecoai-myattendance-present-success-btns-container">
          {logoutTime === null &&
          userLoggedinDetails.loginTime !== null &&
          breakoutTime === null ? (
            <button
              onClick={() => setDurationPauseModalIsOpen(true)}
              className="ecoai-myattendance-success-btn myattendance-btn-break-out"
            >
              {pauseTimeStatus === status.loading ? (
                <ClipLoader size={18} color={"#ffffff"} loading={true} />
              ) : (
                "Take Break"
              )}
            </button>
          ) : null}
          {logoutTime === null &&
          userLoggedinDetails.loginTime !== null &&
          breakoutTime !== null &&
          breakinTime === null ? (
            <button
              onClick={() => setDurationPlayModalIsOpen(true)}
              className="ecoai-myattendance-success-btn myattendance-btn-break-out"
            >
              {resumeTimeStatus === status.loading ? (
                <ClipLoader size={18} color={"#ffffff"} loading={true} />
              ) : (
                "Back To Work"
              )}
            </button>
          ) : null}
          {(logoutTimeStatus !== status.success &&
            logoutTime === null &&
            breakoutTime === null &&
            breakinTime === null) ||
          (logoutTimeStatus !== status.success &&
            logoutTime === null &&
            breakoutTime !== null &&
            breakinTime !== null) ? (
            <button
              className="ecoai-myattendance-present-success-logout-btn"
              disabled={logoutTimeStatus === status.loading}
              style={{ opacity: logoutTimeStatus === status.loading ? 0.5 : 1 }}
              type="button"
              onClick={() => setLogoutModalIsOpen(true)}
            >
              {logoutTimeStatus === status.loading
                ? renderLoadingView()
                : "Logout"}
            </button>
          ) : null}
        </div>
        <span
          className="ecoai-attendance-present-past-success-span"
          id="ecoai-pastview-attendancetype-text"
        >
          {userLoggedinDetails.attendanceType === null
            ? "---"
            : `• ${userLoggedinDetails.attendanceType}`}
        </span>
      </div>
      <div className="ecoai-myattendance-present-past-success-tasks-container">
        <p className="ecoai-myattendance-present-past-success-tasks-heading">
          Tasks done
        </p>
        {tasksDone.length === 0 ? (
          <div className="ecoai-myattendance-present-past-success-tasks-empty-container">
            No tasks found
          </div>
        ) : (
          <div className="ecoai-myattendance-present-past-success-tasks-list-container">
            <ul className="ecoai-myattendance-present-past-success-tasks-list">
              {tasksDone.map((i, index) => (
                <li
                  key={i.taskId}
                  className="ecoai-myattendance-present-past-success-tasks-item"
                >
                  {`${index + 1}. `}
                  {i.task}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );

  const pastSuccessView = () => (
    <div className="ecoai-myattendance-present-past-success-main-container">
      <div className="ecoai-myattendance-present-past-success-container">
        <div className="ecoai-myattendance-present-past-success-container-inner-cont">
          <label
            className="ecoai-myattendance-present-past-success-container-inner-label"
            htmlFor="ecoai-pastview-name-label"
          >
            Name:
          </label>
          <p
            className="ecoai-myattendance-present-past-success-container-inner-text"
            id="ecoai-pastview-name-label"
          >
            {userLoggedinDetails.name}
          </p>
        </div>
        <div className="ecoai-myattendance-present-past-success-container-inner-cont">
          <label
            className="ecoai-myattendance-present-past-success-container-inner-label"
            htmlFor="ecoai-pastview-jobtype-label"
          >
            Job Type:
          </label>
          <p
            className="ecoai-myattendance-present-past-success-container-inner-text"
            id="ecoai-pastview-jobtype-label"
          >
            {userLoggedinDetails.jobType}
          </p>
        </div>
        <div className="ecoai-myattendance-present-past-success-container-inner-cont">
          <label
            className="ecoai-myattendance-present-past-success-container-inner-label"
            htmlFor="ecoai-pastview-loggedin-label"
          >
            Logged In at:
          </label>
          <p
            className="ecoai-myattendance-present-past-success-container-inner-text"
            id="ecoai-pastview-loggedin-label"
          >
            {userLoggedinDetails.loginTime === null
              ? "--"
              : new Date(userLoggedinDetails.loginTime)
                  .toLocaleTimeString("en-IN", {
                    timeZone: "UTC",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                  .toUpperCase()}
          </p>
        </div>
        <div className="ecoai-myattendance-present-past-success-container-inner-cont">
          <label
            className="ecoai-myattendance-present-past-success-container-inner-label"
            htmlFor="ecoai-pastview-breakout-label"
          >
            Took Break at:
          </label>
          {pauseTimeStatus === status.loading ? (
            renderLoadingView()
          ) : (
            <p
              className="ecoai-myattendance-present-past-success-container-inner-text"
              id="ecoai-pastview-breakout-label"
            >
              {breakoutTime === null
                ? "--"
                : new Date(breakoutTime)
                    .toLocaleTimeString("en-IN", {
                      timeZone: "UTC",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                    .toUpperCase()}
            </p>
          )}
        </div>
        <div className="ecoai-myattendance-present-past-success-container-inner-cont">
          <label
            className="ecoai-myattendance-present-past-success-container-inner-label"
            htmlFor="ecoai-pastview-breakin-label"
          >
            Work Resumed at:
          </label>
          {resumeTimeStatus === status.loading ? (
            renderLoadingView()
          ) : (
            <p
              className="ecoai-myattendance-present-past-success-container-inner-text"
              id="ecoai-pastview-breakin-label"
            >
              {breakinTime === null
                ? "--"
                : new Date(breakinTime)
                    .toLocaleTimeString("en-IN", {
                      timeZone: "UTC",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                    .toUpperCase()}
            </p>
          )}
        </div>
        <div className="ecoai-myattendance-present-past-success-container-inner-cont">
          <label
            className="ecoai-myattendance-present-past-success-container-inner-label"
            htmlFor="ecoai-pastview-loggedout-label"
          >
            Logged Out at:
          </label>
          {logoutTimeStatus === status.loading ? (
            renderLoadingView()
          ) : (
            <p
              className="ecoai-myattendance-present-past-success-container-inner-text"
              id="ecoai-pastview-loggedout-label"
            >
              {logoutTime === null
                ? "--"
                : new Date(logoutTime)
                    .toLocaleTimeString("en-IN", {
                      timeZone: "UTC",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                    .toUpperCase()}
            </p>
          )}
        </div>
        <div className="ecoai-myattendance-present-past-success-container-inner-cont">
          <label
            className="ecoai-myattendance-present-past-success-container-inner-label"
            htmlFor="ecoai-pastview-duration-label"
          >
            Total Worked Duration:
          </label>
          <p
            className="ecoai-myattendance-present-past-success-container-worked-duration"
            id="ecoai-pastview-duration-label"
          >
            {logoutTime === null
              ? "--"
              : getWorkingDuration(
                  userLoggedinDetails.loginTime,
                  logoutTime,
                  breakoutTime,
                  breakinTime,
                  currentTime,
                )}
          </p>
        </div>
        <span
          className="ecoai-attendance-present-past-success-span"
          id="ecoai-pastview-attendancetype-text"
        >
          {userLoggedinDetails.attendanceType === null
            ? "---"
            : `• ${userLoggedinDetails.attendanceType}`}
        </span>
      </div>
      <div className="ecoai-myattendance-present-past-success-tasks-container">
        <p className="ecoai-myattendance-present-past-success-tasks-heading">
          Tasks done
        </p>
        {tasksDone.length === 0 ? (
          <div className="ecoai-myattendance-present-past-success-tasks-empty-container">
            No tasks found
          </div>
        ) : (
          <div className="ecoai-myattendance-present-past-success-tasks-list-container">
            <ul className="ecoai-myattendance-present-past-success-tasks-list">
              {tasksDone.map((i, index) => (
                <li
                  key={i.taskId}
                  className="ecoai-myattendance-present-past-success-tasks-item"
                >
                  {`${index + 1}. `}
                  {i.task}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );

  const presentFinalView = () => {
    switch (presentDetailsStatus) {
      case status.initial:
      case status.loading:
        return attendanceType === "WFO" ? wfoView() : wfhView();
      case status.success:
        return presentSuccessView();
      case status.failure:
        return renderFailureView();
      default:
        return null;
    }
  };

  const pastFinalView = () => {
    switch (pastDetailsStatus) {
      case status.initial:
      case status.loading:
        return renderLoadingView();
      case status.success:
        return pastSuccessView();
      case status.failure:
        return renderFailureView();
      default:
        return null;
    }
  };

  const renderFinalView = () => {
    if (userDetails === null || currentStatus === status.loading) {
      return renderLoadingView();
    }
    switch (currentStatus) {
      case status.future:
        return renderFutureView();
      case status.present:
        return renderPresentView();
      case status.past:
        return renderPastView();
      default:
        return null;
    }
  };

  return (
    <>
      <Header />
      <div className="ecoai-myattendance-bg-container">
        <UserSidebar />
        <UserBottombar />
        <div className="ecoai-myattendance-right-container">
          <ProfileIncompleteBanner />
          {renderFinalView()}
          <Modal
            isOpen={wfoLoginModalIsOpen}
            onRequestClose={() => {}}
            shouldCloseOnOverlayClick={false}
            shouldCloseOnEsc={false}
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
            <div className="ecoai-myattendance-modal">
              {wfoLoginModalText !== "" && (
                <span className="ecoai-myattendance-modal-loc-succ-msg">
                  {wfoLoginModalText}
                </span>
              )}
              <p className="ecoai-myattendance-modal-heading">
                Mark your attendance for today?
              </p>
              <div className="ecoai-myattendance-model-btns-container">
                <button
                  type="button"
                  className="ecoai-myattendance-model-btn login-yes-btn"
                  onClick={clickedMyattendanceLoginBtn}
                >
                  {presentDetailsStatus === status.loading ? (
                    <ClipLoader size={15} color={"#ffffff"} />
                  ) : (
                    "Login"
                  )}
                </button>
                <button
                  type="button"
                  className="ecoai-myattendance-model-btn login-no-btn"
                  onClick={() => {
                    setWfoLoginModalIsOpen(false);
                    setVerifyLocationStatus(status.initial);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </Modal>
          <Modal
            isOpen={wfhLoginModalIsOpen}
            onRequestClose={() => {
              setWfhLoginModalIsOpen(false);
            }}
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
            <div className="ecoai-myattendance-modal">
              <p className="ecoai-myattendance-modal-heading">
                Mark your attendance for today?
              </p>
              <div className="ecoai-myattendance-model-btns-container">
                <button
                  type="button"
                  className="ecoai-myattendance-model-btn login-yes-btn"
                  onClick={clickedMyattendanceLoginBtn}
                >
                  {presentDetailsStatus === status.loading ? (
                    <ClipLoader size={15} color={"#ffffff"} />
                  ) : (
                    "Login"
                  )}
                </button>
                <button
                  type="button"
                  className="ecoai-myattendance-model-btn login-no-btn"
                  onClick={() => {
                    setWfhLoginModalIsOpen(false);
                    setVerifyLocationStatus(status.initial);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </Modal>
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
            <div className="ecoai-myattendance-modal">
              <span
                className="ecoai-myattendance-alert-text"
                onClick={() => navigate("/add-tasks")}
              >
                ADD TASKS DONE BEFORE LOGOUT
              </span>
              <p className="ecoai-myattendance-modal-heading">
                You’ve been logged in for <br />
                <span className="ecoai-myattendance-modal-logout-color">
                  {userLoggedinDetails !== null &&
                    getWorkingDuration(
                      userLoggedinDetails.loginTime,
                      logoutTime,
                      breakoutTime,
                      breakinTime,
                      currentTime,
                    )}
                </span>
                . <br />
                End your session now?
              </p>
              <div className="ecoai-myattendance-model-btns-container">
                <button
                  type="button"
                  className="ecoai-myattendance-model-btn logout-yes-btn"
                  onClick={clickedMyattendanceLogoutBtn}
                >
                  {logoutTimeStatus === status.loading ? (
                    <ClipLoader size={18} color={"#ffffff"} loading={true} />
                  ) : (
                    "Yes"
                  )}
                </button>
                <button
                  type="button"
                  className="ecoai-myattendance-model-btn logout-no-btn"
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
            <div className="ecoai-myattendance-modal">
              <span
                className="ecoai-myattendance-alert-text"
                onClick={() => navigate("/add-tasks")}
              >
                ADD TASKS DONE BEFORE BREAK
              </span>
              <p className="ecoai-myattendance-modal-heading">
                Would you like to pause your session for a lunch break?
              </p>
              <div className="ecoai-myattendance-model-btns-container">
                <button
                  type="button"
                  className="ecoai-myattendance-model-btn myattendance-grey"
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
                  className="ecoai-myattendance-model-btn myattendance-green"
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
            <div className="ecoai-myattendance-modal">
              <p className="ecoai-myattendance-modal-heading">
                Would you like to resume your session from lunch break?
              </p>
              <div className="ecoai-myattendance-model-btns-container">
                <button
                  type="button"
                  className="ecoai-myattendance-model-btn myattendance-green"
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
                  className="ecoai-myattendance-model-btn myattendance-grey"
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

export default MyAttendance;
