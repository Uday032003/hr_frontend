import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { ClipLoader } from "react-spinners";
import { FaSort } from "react-icons/fa";
import { FaSortUp } from "react-icons/fa";
import { FaSortDown } from "react-icons/fa";

import Header from "../Header";
import AdminSidebar from "../AdminSidebar";
import AdminBottombar from "../AdminBottombar";
import "./index.css";

const status = {
  initial: "INITIAL",
  loading: "LOADING",
  success: "SUCCESS",
  failure: "FAILURE",
  notFound: "NOT-FOUND",
};

const AdminAttendanceManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentStatus, setCurrentStatus] = useState(status.loading);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sortState, setSortState] = useState({
    sortBy: null,
    order: null,
  });
  const [selectOptionValue, setSelectOptionValue] = useState("ALL");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "error",
  });
  const adminToken = Cookies.get("admin_Token");
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchTodayUsers = async () => {
      const dateToday = {
        selectedDate: currentTime.toISOString(),
      };
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(dateToday),
      };
      try {
        const response = await fetch(
          `https://hr-backend-k3e7.onrender.com/fetching-attendance-details?jobType=${selectOptionValue}`,
          options,
        );
        if (response.ok) {
          const data = await response.json();
          const updatedData = data.map((i) => ({
            attendanceid: i.attendanceid,
            userid: i.userid,
            username: i.username,
            jobType: i.job_type,
            loginTime: i.login_time,
            logoutTime: i.logout_time,
            breakOutTime: i.break_out_time,
            breakInTime: i.break_in_time,
            attendanceType: i.attendance_type,
          }));
          setUsers(updatedData);
          if (data.length === 0) {
            setCurrentStatus(status.notFound);
          } else {
            setCurrentStatus(status.success);
          }
        } else {
          const data = await response.json();
          setCurrentStatus(status.failure);
          showToast(data.message, "error");
        }
      } catch (error) {
        console.log(error);
        setCurrentStatus(status.failure);
        showToast("Server Error", "error");
      }
    };
    fetchTodayUsers();
  }, [adminToken]);

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type });
    }, 2500);
  };

  const formatDate = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
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

  const sortingUsers = async (e) => {
    setCurrentStatus(status.loading);
    const adminSelectedDate = {
      selectedDate: selectedDate.toISOString(),
    };
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(adminSelectedDate),
    };
    const query1 = e.currentTarget.dataset.name;
    let query2;
    if (sortState.sortBy !== query1) {
      setSortState({ sortBy: query1, order: "asc" });
      query2 = "asc";
    } else {
      let nextOrder;
      if (sortState.order === "asc") nextOrder = "desc";
      else if (sortState.order === "desc") nextOrder = null;
      else nextOrder = "asc";
      query2 = nextOrder;
      setSortState({ sortBy: query1, order: nextOrder });
    }
    try {
      const response = await fetch(
        `https://hr-backend-k3e7.onrender.com/sorting-attendance-details?sort=${query1}&order=${query2}&jobType=${selectOptionValue}`,
        options,
      );
      if (response.ok) {
        const data = await response.json();
        const updatedData = data.map((i) => ({
          attendanceid: i.attendanceid,
          userid: i.userid,
          username: i.username,
          jobType: i.job_type,
          loginTime: i.login_time,
          logoutTime: i.logout_time,
          breakOutTime: i.break_out_time,
          breakInTime: i.break_in_time,
          attendanceType: i.attendance_type,
        }));
        setUsers(updatedData);
        setCurrentStatus(status.success);
      } else {
        const data = await response.json();
        setCurrentStatus(status.failure);
        showToast(data.message, "error");
      }
    } catch (error) {
      console.log(error);
      setCurrentStatus(status.failure);
      showToast("Server Error", "error");
    }
  };

  const sortingIcon = (columnName) => {
    if (sortState.sortBy !== columnName) {
      return <FaSort className="ecoai-admin-attendance-management-icon" />;
    }
    switch (sortState.order) {
      case "asc":
        return (
          <FaSortUp className="ecoai-admin-attendance-management-icon up-icon" />
        );
      case "desc":
        return (
          <FaSortDown className="ecoai-admin-attendance-management-icon down-icon" />
        );
      default:
        return <FaSort className="ecoai-admin-attendance-management-icon" />;
    }
  };

  const clickedFetchBtn = async (e) => {
    e.preventDefault();
    setCurrentStatus(status.loading);
    if (!selectedDate) {
      setCurrentStatus(status.initial);
      showToast("Select date", "error");
      return;
    }
    const adminSelectedDate = {
      selectedDate: selectedDate.toISOString(),
    };
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(adminSelectedDate),
    };
    try {
      const response = await fetch(
        `https://hr-backend-k3e7.onrender.com/fetching-attendance-details?jobType=${selectOptionValue}`,
        options,
      );
      if (response.ok) {
        const data = await response.json();
        const updatedData = data.map((i) => ({
          attendanceid: i.attendanceid,
          userid: i.userid,
          username: i.username,
          jobType: i.job_type,
          loginTime: i.login_time,
          logoutTime: i.logout_time,
          breakOutTime: i.break_out_time,
          breakInTime: i.break_in_time,
          attendanceType: i.attendance_type,
        }));
        setUsers(updatedData);
        if (data.length === 0) {
          setCurrentStatus(status.notFound);
        } else {
          setCurrentStatus(status.success);
        }
      } else {
        const data = await response.json();
        setCurrentStatus(status.failure);
        showToast(data.message, "error");
      }
    } catch (error) {
      console.log(error);
      setCurrentStatus(status.failure);
      showToast("Server Error", "error");
    }
  };

  const renderFailureView = () => (
    <div className="ecoai-admin-attendance-management-loading-initial-and-no-data-found-view-container">
      Failed to load
    </div>
  );

  const renderLoadingView = () => (
    <div className="ecoai-admin-attendance-management-loading-view-container">
      <ClipLoader size={30} color={"#ffffff"} loading={true} />
    </div>
  );

  const renderNoDataFoundView = () => (
    <div className="ecoai-admin-attendance-management-loading-initial-and-no-data-found-view-container">
      No user logged in
    </div>
  );

  // const renderInitialView = () => (
  //   <div className="ecoai-admin-attendance-management-initial-and-no-data-found-view-container">
  //     No date or job type selected yet
  //   </div>
  // );

  const renderSuccessView = () => (
    <>
      {users.map((i) => (
        <li
          key={i.attendanceid}
          className="ecoai-admin-attendance-management-item"
          onClick={() => navigate(`/users-calendar/${i.userid}`)}
        >
          <span className="ecoai-admin-attendance-management-username">
            {i.username === null ? "--" : i.username}
          </span>
          <span className="ecoai-admin-attendance-management-login">
            {new Date(i.loginTime)
              .toLocaleTimeString("en-IN", {
                timeZone: "UTC",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
              .toUpperCase()}
          </span>
          <span className="ecoai-admin-attendance-management-breakout">
            {i.breakOutTime === null
              ? "--"
              : new Date(i.breakOutTime)
                  .toLocaleTimeString("en-IN", {
                    timeZone: "UTC",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                  .toUpperCase()}
          </span>
          <span className="ecoai-admin-attendance-management-breakin">
            {i.breakInTime === null
              ? "--"
              : new Date(i.breakInTime)
                  .toLocaleTimeString("en-IN", {
                    timeZone: "UTC",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                  .toUpperCase()}
          </span>
          <span className="ecoai-admin-attendance-management-logout">
            {i.logoutTime === null
              ? "--"
              : new Date(i.logoutTime)
                  .toLocaleTimeString("en-IN", {
                    timeZone: "UTC",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                  .toUpperCase()}
          </span>
          <span className="ecoai-admin-attendance-management-working-hours">
            {new Date().toLocaleDateString("en-IN", {
              timeZone: "Asia/Kolkata",
              month: "short",
              day: "numeric",
              year: "numeric",
            }) ===
              new Date(selectedDate).toLocaleDateString("en-IN", {
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
              new Date(selectedDate).toLocaleDateString("en-IN", {
                timeZone: "Asia/Kolkata",
                month: "short",
                day: "numeric",
                year: "numeric",
              }) &&
              i.logoutTime !== null)
              ? getWorkingDuration(
                  i.loginTime,
                  i.logoutTime,
                  i.breakOutTime,
                  i.breakInTime,
                  currentTime,
                )
              : "--"}
          </span>
          <span className="ecoai-admin-attendance-management-job-type">
            {i.jobType}
          </span>
          <span className="ecoai-admin-attendance-management-status">
            {i.attendanceType}
          </span>
        </li>
      ))}
    </>
  );

  const renderFinalView = () => {
    switch (currentStatus) {
      case status.loading:
        return renderLoadingView();
      case status.success:
        return renderSuccessView();
      case status.notFound:
        return renderNoDataFoundView();
      case status.failure:
        return renderFailureView();
      default:
        return null;
    }
  };

  return (
    <>
      <Header />
      <div className="ecoai-admin-attendance-management-bg-container">
        <AdminSidebar />
        <AdminBottombar />
        <div className="ecoai-admin-attendance-management-right-container">
          <h1 className="ecoai-admin-attendance-management-admin-title">
            Attendance
          </h1>
          <form
            className="ecoai-admin-attendance-management-form"
            onSubmit={clickedFetchBtn}
          >
            <div className="ecoai-admin-attendance-management-inp-select-btn-container">
              <input
                value={
                  selectedDate === null
                    ? formatDate(currentTime)
                    : formatDate(selectedDate)
                }
                type="date"
                className="ecoai-admin-attendance-management-date-input"
                onChange={(e) => {
                  if (e.target.value === "") {
                    setSelectedDate(null);
                  } else {
                    setSelectedDate(new Date(e.target.value));
                  }
                }}
              />
              <select
                value={selectOptionValue}
                onChange={(e) => setSelectOptionValue(e.target.value)}
                className="ecoai-admin-attendance-management-select-container"
              >
                <option
                  className="ecoai-admin-attendance-management-select-option"
                  value="ALL"
                >
                  All
                </option>
                <option
                  className="ecoai-admin-attendance-management-select-option"
                  value="INTERN"
                >
                  Intern
                </option>
                <option
                  className="ecoai-admin-attendance-management-select-option"
                  value="FULL_TIME"
                >
                  Full TIme
                </option>
              </select>
              <button
                type="submit"
                className="ecoai-admin-attendance-management-fetch-btn"
              >
                Fetch
              </button>
            </div>
          </form>
          <div className="ecoai-admin-attendance-management-list-container">
            <ul className="ecoai-admin-attendance-management-list">
              <li
                key="ecoai-admin-attendance-management-heading-row"
                className="ecoai-admin-attendance-management-heading-item"
              >
                <div className="ecoai-admin-attendance-management-username">
                  <button
                    className="ecoai-admin-attendance-management-sorting-btn"
                    data-name="username"
                    onClick={sortingUsers}
                    disabled={currentStatus !== status.success}
                  >
                    Username
                    {sortingIcon("username")}
                  </button>
                </div>
                <div className="ecoai-admin-attendance-management-login">
                  <button
                    className="ecoai-admin-attendance-management-sorting-btn"
                    data-name="login_time"
                    onClick={sortingUsers}
                    disabled={currentStatus !== status.success}
                  >
                    Login
                    {sortingIcon("login_time")}
                  </button>
                </div>
                <div className="ecoai-admin-attendance-management-breakout">
                  <button
                    className="ecoai-admin-attendance-management-sorting-btn"
                    data-name="break_out_time"
                    onClick={sortingUsers}
                    disabled={currentStatus !== status.success}
                  >
                    Took Break
                    {sortingIcon("break_out_time")}
                  </button>
                </div>
                <div className="ecoai-admin-attendance-management-breakin">
                  <button
                    className="ecoai-admin-attendance-management-sorting-btn"
                    data-name="break_in_time"
                    onClick={sortingUsers}
                    disabled={currentStatus !== status.success}
                  >
                    Work Resumed
                    {sortingIcon("break_in_time")}
                  </button>
                </div>
                <div className="ecoai-admin-attendance-management-logout">
                  <button
                    className="ecoai-admin-attendance-management-sorting-btn"
                    data-name="logout_time"
                    onClick={sortingUsers}
                    disabled={currentStatus !== status.success}
                  >
                    Logout
                    {sortingIcon("logout_time")}
                  </button>
                </div>
                <div className="ecoai-admin-attendance-management-working-hours">
                  <button
                    className="ecoai-admin-attendance-management-sorting-btn"
                    data-name="working_hours"
                    onClick={sortingUsers}
                    disabled={currentStatus !== status.success}
                  >
                    Working hours
                    {sortingIcon("working_hours")}
                  </button>
                </div>
                <div className="ecoai-admin-attendance-management-job-type">
                  <button
                    className="ecoai-admin-attendance-management-sorting-btn"
                    data-name="job_type"
                    onClick={sortingUsers}
                    disabled={currentStatus !== status.success}
                  >
                    Job Type
                    {sortingIcon("job_type")}
                  </button>
                </div>
                <div className="ecoai-admin-attendance-management-status">
                  <button
                    className="ecoai-admin-attendance-management-sorting-btn"
                    data-name="attendance_type"
                    onClick={sortingUsers}
                    disabled={currentStatus !== status.success}
                  >
                    Status
                    {sortingIcon("attendance_type")}
                  </button>
                </div>
              </li>
              {renderFinalView()}
            </ul>
          </div>
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

export default AdminAttendanceManagement;
