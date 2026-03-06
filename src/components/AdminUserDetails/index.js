import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { ClipLoader } from "react-spinners";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { IoMdArrowRoundBack } from "react-icons/io";

import Header from "../Header";
import AdminSidebar from "../AdminSidebar";
import AdminBottombar from "../AdminBottombar";
import "./index.css";

const status = {
  initial: "INITIAL",
  loading: "LOADING",
  success: "SUCCESS",
  failure: "FAILURE",
};

const AdminUserDetails = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [userLoggedinDetails, setUserLoggedinDetails] = useState(null);
  const [tasksDone, changeTasksDone] = useState([]);
  const [currentStatus, setCurrentStatus] = useState(status.loading);
  const [adminSelectedDate, setAdminSelectedDate] = useState(null);
  const [logoutTime, setLogoutTime] = useState(null);
  const [breakoutTime, setBreakOutTime] = useState(null);
  const [breakinTime, setBreakInTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "error",
  });
  const adminToken = Cookies.get("admin_Token");
  const { id } = useParams();
  const navigate = useNavigate();

  const getWorkingDuration = (val1, val2, val3, val4, nowTime) => {
    if (!val1 && !val2 && !val3 && !val4) {
      return "--";
    }
    if (val1 && val2 && val3 && !val4) {
      return "--";
    }
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
          Authorization: `Bearer ${adminToken}`,
        },
      };
      try {
        const response = await fetch(
          `http://localhost:3001/admin-user-details/${id}`,
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
        } else {
        }
      } catch (err) {
        console.log(err);
      }
    };
    getUserDetails();
  }, [adminToken, id]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const getUserAttendanceDetails = async () => {
      const options = {
        method: "GET",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
      };
      try {
        const response = await fetch(
          `http://localhost:3001/admin-selected-date-user-attendance-details/${id}`,
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
          console.log(updatedData.userLoginId);
          const updatedTasksDone = data.tasksDone.map((i) => ({
            taskId: i.task_id,
            task: i.task,
            createdAt: i.created_at,
            attendanceid: i.attendanceid,
          }));
          changeTasksDone(updatedTasksDone);
          if (updatedData.loginTime !== null) {
            setLogoutTime(updatedData.logoutTime);
            setBreakOutTime(updatedData.breakoutTime);
            setBreakInTime(updatedData.breakinTime);
          }
          setUserLoggedinDetails(updatedData);
          setAdminSelectedDate(data.adminSelectedDate);
          setCurrentStatus(status.success);
        } else {
          setCurrentStatus(status.failure);
        }
      } catch (error) {
        console.log(error);
        setCurrentStatus(status.failure);
      }
    };
    getUserAttendanceDetails();
  }, [adminToken, id]);

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type });
    }, 2500);
  };

  const renderLoadingView = () => (
    <div className="ecoai-admin-user-details-loading-failed-view-container">
      <ClipLoader size={30} color="#bdbbbb" />
    </div>
  );

  const renderFailedView = () => (
    <div className="ecoai-admin-user-details-loading-failed-view-container">
      Failed to fetch
    </div>
  );

  const renderSuccessView = () => (
    <div className="ecoai-admin-user-details-present-past-success-main-container">
      <div className="ecoai-admin-user-details-present-past-success-container">
        <div className="ecoai-admin-user-details-present-past-success-container-inner-cont">
          <label
            className="ecoai-admin-user-details-present-past-success-container-inner-label"
            htmlFor="ecoai-pastview-name-label"
          >
            Name:
          </label>
          <p
            className="ecoai-admin-user-details-present-past-success-container-inner-text"
            id="ecoai-pastview-name-label"
          >
            {userLoggedinDetails.name}
          </p>
        </div>
        <div className="ecoai-admin-user-details-present-past-success-container-inner-cont">
          <label
            className="ecoai-admin-user-details-present-past-success-container-inner-label"
            htmlFor="ecoai-pastview-jobtype-label"
          >
            Job Type:
          </label>
          <p
            className="ecoai-admin-user-details-present-past-success-container-inner-text"
            id="ecoai-pastview-jobtype-label"
          >
            {userLoggedinDetails.jobType}
          </p>
        </div>
        <div className="ecoai-admin-user-details-present-past-success-container-inner-cont">
          <label
            className="ecoai-admin-user-details-present-past-success-container-inner-label"
            htmlFor="ecoai-pastview-loggedin-label"
          >
            Logged In at:
          </label>
          <p
            className="ecoai-admin-user-details-present-past-success-container-inner-text"
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
        <div className="ecoai-admin-user-details-present-past-success-container-inner-cont">
          <label
            className="ecoai-admin-user-details-present-past-success-container-inner-label"
            htmlFor="ecoai-pastview-breakout-label"
          >
            Took Break at:
          </label>
          <p
            className="ecoai-admin-user-details-present-past-success-container-inner-text"
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
        </div>
        <div className="ecoai-admin-user-details-present-past-success-container-inner-cont">
          <label
            className="ecoai-admin-user-details-present-past-success-container-inner-label"
            htmlFor="ecoai-pastview-breakin-label"
          >
            Work Resumed at:
          </label>
          <p
            className="ecoai-admin-user-details-present-past-success-container-inner-text"
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
        </div>
        <div className="ecoai-admin-user-details-present-past-success-container-inner-cont">
          <label
            className="ecoai-admin-user-details-present-past-success-container-inner-label"
            htmlFor="ecoai-pastview-loggedout-label"
          >
            Logged Out at:
          </label>
          <p
            className="ecoai-admin-user-details-present-past-success-container-inner-text"
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
        </div>
        <div className="ecoai-admin-user-details-present-past-success-container-inner-cont">
          <label
            className="ecoai-admin-user-details-present-past-success-container-inner-label"
            htmlFor="ecoai-pastview-duration-label"
          >
            Total Worked Duration:
          </label>
          <p
            className="ecoai-admin-user-details-present-past-success-container-worked-duration"
            id="ecoai-pastview-duration-label"
          >
            {new Date().toLocaleDateString("en-IN", {
              timeZone: "Asia/Kolkata",
              month: "short",
              day: "numeric",
              year: "numeric",
            }) ===
              new Date(adminSelectedDate).toLocaleDateString("en-IN", {
                timeZone: "Asia/Kolkata",
                month: "short",
                day: "numeric",
                year: "numeric",
              }) ||
            (new Date().toLocaleDateString("en-IN", {
              timeZone: "Asia/Kolkata",
              month: "short",
              day: "numeric",
              year: "numeric",
            }) !==
              new Date(adminSelectedDate).toLocaleDateString("en-IN", {
                timeZone: "Asia/Kolkata",
                month: "short",
                day: "numeric",
                year: "numeric",
              }) &&
              logoutTime !== null)
              ? getWorkingDuration(
                  userLoggedinDetails.loginTime,
                  logoutTime,
                  breakoutTime,
                  breakinTime,
                  currentTime,
                )
              : "--"}
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
      <div className="ecoai-admin-user-details-present-past-success-tasks-container">
        <p className="ecoai-admin-user-details-present-past-success-tasks-heading">
          Tasks done
        </p>
        {tasksDone.length === 0 ? (
          <div className="ecoai-admin-user-details-present-past-success-tasks-empty-container">
            No tasks found
          </div>
        ) : (
          <div className="ecoai-admin-user-details-present-past-success-tasks-list-container">
            <ul className="ecoai-admin-user-details-present-past-success-tasks-list">
              {tasksDone.map((i, index) => (
                <li
                  key={i.taskId}
                  className="ecoai-admin-user-details-present-past-success-tasks-item"
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

  const renderFinalView = () => {
    if (userDetails === null || currentStatus === status.loading) {
      return renderLoadingView();
    }
    switch (currentStatus) {
      case status.failure:
        return renderFailedView();
      case status.success:
        return renderSuccessView();
      default:
        return null;
    }
  };

  return (
    <>
      <Header />
      <div className="ecoai-admin-user-details-bg-container">
        <AdminSidebar />
        <AdminBottombar />
        <div className="ecoai-admin-user-details-right-container">
          <span className="ecoai-admin-user-details-selected-date">
            {adminSelectedDate === null ? (
              <Skeleton
                width={60}
                height={16}
                baseColor="#2a2a2a"
                highlightColor="#3a3a3a"
                style={{ marginRight: "15px" }}
              />
            ) : (
              `${new Date(adminSelectedDate).toLocaleDateString("en-IN", {
                timeZone: "Asia/Kolkata",
                month: "short",
                day: "numeric",
                year: "numeric",
              })} `
            )}
          </span>
          <h1 className="ecoai-admin-user-details-heading">
            {userDetails === null ? (
              <Skeleton
                width={80}
                height={20}
                baseColor="#2a2a2a"
                highlightColor="#3a3a3a"
                style={{ marginRight: "15px" }}
              />
            ) : (
              `${userDetails.userName} `
            )}
            Details
          </h1>
          {renderFinalView()}
          <button
            className="ecoai-admin-user-details-back-icon-container"
            onClick={() => navigate(-1)}
          >
            <IoMdArrowRoundBack className="ecoai-admin-user-details-back-icon" />
            Back
          </button>
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

export default AdminUserDetails;
