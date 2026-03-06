import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Calendar from "react-calendar";
import Cookies from "js-cookie";
import Modal from "react-modal";
import { ClipLoader } from "react-spinners";
import "react-calendar/dist/Calendar.css";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { IoMdArrowRoundBack } from "react-icons/io";
import { MdDeleteOutline } from "react-icons/md";

import Header from "../Header";
import AdminSidebar from "../AdminSidebar";
import AdminBottombar from "../AdminBottombar";
import "./index.css";

const status = {
  loading: "LOADING",
  success: "SUCCESS",
  failure: "FAILURE",
  notFound: "NOT_FOUND",
};

const AdminUserCalendar = () => {
  const [adminSelectedUserDetails, setAdminSelectedUserDetails] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [role, changeRole] = useState(null);
  const [userAttendedDates, setUserAttendedDates] = useState([]);
  const [currentStatus, setCurrentStatus] = useState(status.loading);
  const [isPopDisplay, setIsPopDisplay] = useState(false);
  const storedDate = localStorage.getItem("view");
  const [viewDate, setViewDate] = useState(
    storedDate ? new Date(storedDate) : new Date(),
  );
  const [changeRoleModalIsOpen, setChangeRoleModalIsOpen] = useState(false);
  const [deleteLoading, changeDeleteLoading] = useState(false);
  const [deleteEmployeeModalIsOpen, setDeleteEmployeeModalIsOpen] =
    useState(false);
  const [deleteModalInpText, changeDeleteModalInpText] = useState("");
  const adminToken = Cookies.get("admin_Token");
  const attendanceMap = new Map(
    userAttendedDates.map((item) => [item.date, item]),
  );
  const navigate = useNavigate();
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "error",
  });
  const earliestDateStr = (() => {
    const cutoffDate = new Date(2026, 1, 1);
    const firstDayOfMonth = new Date(
      viewDate.getFullYear(),
      viewDate.getMonth(),
      1,
    );
    if (viewDate >= cutoffDate) {
      return (
        firstDayOfMonth.getFullYear() +
        "-" +
        String(firstDayOfMonth.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(firstDayOfMonth.getDate()).padStart(2, "0")
      );
    }
    if (userAttendedDates.length > 0) {
      return userAttendedDates.reduce(
        (min, obj) => (obj.date < min ? obj.date : min),
        userAttendedDates[0].date,
      );
    }
    return null;
  })();
  const { id } = useParams();

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type });
    }, 3000);
  };

  const isLateLogin = (loginTime) => {
    const loginDate = new Date(loginTime);
    loginDate.setMinutes(loginDate.getMinutes() - 330);
    return loginDate.getHours() > 10;
  };

  const getWorkingDurationSeconds = (val1, val2, val3, val4, nowTime) => {
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
    return diffMs;
  };

  const getAttendanceStatus = (attendance, nowTime) => {
    if (attendance) {
      if (attendance.logoutTime === null) {
        return "half-red-date";
      }
      if (attendance.attendanceType === "WFO") {
        if (
          isLateLogin(attendance.loginTime) ||
          getWorkingDurationSeconds(
            attendance.loginTime,
            attendance.logoutTime,
            attendance.breakOutTime,
            attendance.breakInTime,
            nowTime,
          ) <
            8 * 3600
        ) {
          if (
            isLateLogin(attendance.loginTime) &&
            getWorkingDurationSeconds(
              attendance.loginTime,
              attendance.logoutTime,
              attendance.breakOutTime,
              attendance.breakInTime,
              nowTime,
            ) <
              8 * 3600
          ) {
            return "orange-green-orange-date";
          } else if (isLateLogin(attendance.loginTime)) {
            return "orange-green-date";
          } else {
            return "green-orange-date";
          }
        } else {
          return "green-date";
        }
      } else {
        if (
          isLateLogin(attendance.loginTime) ||
          getWorkingDurationSeconds(
            attendance.loginTime,
            attendance.logoutTime,
            attendance.breakOutTime,
            attendance.breakInTime,
            nowTime,
          ) <
            8 * 3600
        ) {
          if (
            isLateLogin(attendance.loginTime) &&
            getWorkingDurationSeconds(
              attendance.loginTime,
              attendance.logoutTime,
              attendance.breakOutTime,
              attendance.breakInTime,
              nowTime,
            ) <
              8 * 3600
          ) {
            return "orange-purple-orange-date";
          } else if (isLateLogin(attendance.loginTime)) {
            return "orange-purple-date";
          } else {
            return "purple-orange-date";
          }
        } else {
          return "purple-date";
        }
      }
    } else {
      return "red-date";
    }
  };

  const getAttendanceSpecialStatus = (attendance, nowTime) => {
    if (attendance) {
      if (attendance.logoutTime === null) {
        return "half-red-date";
      }
      if (attendance.attendanceType === "WFO") {
        if (
          isLateLogin(attendance.loginTime) ||
          getWorkingDurationSeconds(
            attendance.loginTime,
            attendance.logoutTime,
            attendance.breakOutTime,
            attendance.breakInTime,
            nowTime,
          ) <
            7 * 3600
        ) {
          if (
            isLateLogin(attendance.loginTime) &&
            getWorkingDurationSeconds(
              attendance.loginTime,
              attendance.logoutTime,
              attendance.breakOutTime,
              attendance.breakInTime,
              nowTime,
            ) <
              7 * 3600
          ) {
            return "orange-green-orange-date";
          } else if (isLateLogin(attendance.loginTime)) {
            return "orange-green-date";
          } else {
            return "green-orange-date";
          }
        } else {
          return "green-date";
        }
      } else {
        if (
          isLateLogin(attendance.loginTime) ||
          getWorkingDurationSeconds(
            attendance.loginTime,
            attendance.logoutTime,
            attendance.breakOutTime,
            attendance.breakInTime,
            nowTime,
          ) <
            7 * 3600
        ) {
          if (
            isLateLogin(attendance.loginTime) &&
            getWorkingDurationSeconds(
              attendance.loginTime,
              attendance.logoutTime,
              attendance.breakOutTime,
              attendance.breakInTime,
              nowTime,
            ) <
              7 * 3600
          ) {
            return "orange-purple-orange-date";
          } else if (isLateLogin(attendance.loginTime)) {
            return "orange-purple-date";
          } else {
            return "purple-orange-date";
          }
        } else {
          return "purple-date";
        }
      }
    } else {
      return "red-date";
    }
  };

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = Array.from({ length: 6 }, (_, i) => 2025 + i);

  useEffect(() => {
    setCurrentStatus(status.loading);
    const fetchAdminUserData = async () => {
      const options = {
        method: "GET",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      };
      const month = viewDate.getMonth() + 1;
      const year = viewDate.getFullYear();
      try {
        const response = await fetch(
          `http://localhost:3001/admin-user-attendance-dates/${id}?month=${month}&year=${year}`,
          options,
        );
        if (response.status === 404) {
          setCurrentStatus(status.notFound);
          return;
        }
        if (response.ok) {
          const data = await response.json();
          const updatedData = {
            id: data.user.id,
            name: data.user.name,
            username: data.user.username,
            mail: data.user.mail,
            jobType: data.user.job_type,
          };
          if (data.attendanceDates && data.attendanceDates.length > 0) {
            const updatedAttendance = data.attendanceDates.map((i) => ({
              date: i.date,
              loginTime: i.login_time,
              logoutTime: i.logout_time,
              breakOutTime: i.break_out_time,
              breakInTime: i.break_in_time,
              attendanceType: i.attendance_type,
            }));
            setUserAttendedDates(updatedAttendance);
          }
          setAdminSelectedUserDetails(updatedData);
          changeRole(updatedData.jobType);
          if (data.selectedDate) {
            setSelectedDate(new Date(data.selectedDate));
          }
          setCurrentStatus(status.success);
        } else {
          const data = await response.json();
          showToast(data.message, "error");
          setUserAttendedDates([]);
          setCurrentStatus(status.failure);
        }
      } catch (err) {
        showToast("Server error", "error");
        console.log(err);
        setCurrentStatus(status.failure);
      }
    };
    fetchAdminUserData();
  }, [adminToken, id, deleteLoading, viewDate]);

  const handleDateClick = async (date) => {
    showToast("Loading...", "success");
    const selectedDateDetails = {
      selectedDate: date.toISOString(),
    };
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(selectedDateDetails),
    };
    try {
      const response = await fetch(
        "http://localhost:3001/update-selected-date",
        options,
      );
      if (response.ok) {
        const data = await response.json();
        showToast(data.message, "success");
        navigate(`/user-details/${adminSelectedUserDetails.id}`);
      } else {
        const data = await response.json();
        showToast(data.message, "error");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const clickedYesBtn = async () => {
    changeRole(null);
    setChangeRoleModalIsOpen(false);
    const options = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    };
    try {
      const response = await fetch(
        `http://localhost:3001/change-user-role/${id}`,
        options,
      );
      if (response.ok) {
        const data = await response.json();
        changeRole(data.newJobRole);
      } else {
        setCurrentStatus(status.failure);
      }
    } catch (err) {
      console.log(err);
      setCurrentStatus(status.failure);
    }
  };

  const clickedDeleteBtn = async () => {
    changeDeleteLoading(true);
    const options = {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    };
    try {
      const response = await fetch(
        `http://localhost:3001/delete-employee/${id}`,
        options,
      );
      if (response.ok) {
        const data = await response.json();
        changeDeleteLoading(false);
        setDeleteEmployeeModalIsOpen(false);
        showToast(data.message, "success");
      } else {
        changeDeleteLoading(false);
        const data = await response.json();
        showToast(data.message, "error");
        setCurrentStatus(status.failure);
      }
    } catch (err) {
      console.log(err);
      changeDeleteLoading(false);
      showToast("Server error", "error");
      setCurrentStatus(status.failure);
    }
  };

  const handleMonthChange = (e) => {
    setCurrentStatus(status.loading);
    const newMonth = months.indexOf(e.target.value);
    const updatedDate = new Date(viewDate);
    updatedDate.setMonth(newMonth);
    setUserAttendedDates([]);
    setViewDate(updatedDate);
    localStorage.setItem("view", updatedDate);
  };

  const handleYearChange = (e) => {
    setCurrentStatus(status.loading);
    const updatedDate = new Date(viewDate);
    updatedDate.setFullYear(Number(e.target.value));
    setUserAttendedDates([]);
    setViewDate(updatedDate);
    localStorage.setItem("view", updatedDate);
  };

  const renderFailureView = () => (
    <div className="ecoai-admin-user-calendar-loading-view-container">
      Failed to load
    </div>
  );

  const renderLoadingView = () => (
    <div className="ecoai-admin-user-calendar-loading-view-container">
      <ClipLoader size={30} color={"#ffffff"} loading={true} />
    </div>
  );

  const renderCalendarSuccessView = () => (
    <div className="ecoai-admin-username-calendar-container">
      <div className="ecoai-admin-user-calendar-month-year-selectors-container">
        <select
          value={months[viewDate.getMonth()]}
          onChange={handleMonthChange}
          className="ecoai-admin-user-calendar-month-selector"
        >
          {months.map((m) => (
            <option key={m} className="ecoai-admin-user-calendar-select-option">
              {m}
            </option>
          ))}
        </select>
        <select
          value={viewDate.getFullYear()}
          onChange={handleYearChange}
          className="ecoai-admin-user-calendar-year-selector"
        >
          {years.map((y) => (
            <option key={y} className="ecoai-admin-user-calendar-select-option">
              {y}
            </option>
          ))}
        </select>
      </div>
      <Calendar
        value={new Date(selectedDate)}
        onChange={setSelectedDate}
        onClickDay={(date) => {
          setSelectedDate(date);
          handleDateClick(date);
        }}
        activeStartDate={viewDate}
        next2Label={null}
        prev2Label={null}
        minDetail="month"
        maxDetail="month"
        onActiveStartDateChange={({ activeStartDate }) => {
          const isDifferentMonth =
            activeStartDate.getMonth() !== viewDate.getMonth();
          const isDifferentYear =
            activeStartDate.getFullYear() !== viewDate.getFullYear();

          if (isDifferentMonth || isDifferentYear) {
            setUserAttendedDates([]);
            setCurrentStatus(status.loading);
            setViewDate(activeStartDate);
            localStorage.setItem("view", activeStartDate);
          }
        }}
        tileClassName={({ date, view }) => {
          if (view !== "month") return;
          const dateStr =
            date.getFullYear() +
            "-" +
            String(date.getMonth() + 1).padStart(2, "0") +
            "-" +
            String(date.getDate()).padStart(2, "0");
          const todayStr =
            new Date().getFullYear() +
            "-" +
            String(new Date().getMonth() + 1).padStart(2, "0") +
            "-" +
            String(new Date().getDate()).padStart(2, "0");
          if (currentStatus === status.loading) return;
          if (date.getMonth() !== viewDate.getMonth()) return;
          if (
            !earliestDateStr ||
            dateStr < earliestDateStr ||
            dateStr >= todayStr ||
            date.getDay() === 0
          ) {
            return;
          }
          const attendance = attendanceMap.get(dateStr);
          if (
            adminSelectedUserDetails.id ===
            "95e8e4b8-f499-4691-85df-132932bdd41f"
          ) {
            return getAttendanceSpecialStatus(attendance, new Date());
          } else {
            return getAttendanceStatus(attendance, new Date());
          }
        }}
      />
      <div className="ecoai-admin-user-calendar-tiles-container">
        <div className="ecoai-admin-user-calendar-tile-container">
          <span className="ecoai-admin-user-calendar-tile ecoai-admin-present-wfo-tile-color">
            {new Date().getDate()}
          </span>
          <span className="ecoai-admin-present-wfo-tile-text">Present WFO</span>
        </div>
        <div className="ecoai-admin-user-calendar-tile-container">
          <span className="ecoai-admin-user-calendar-tile ecoai-admin-present-wfo-late-tile-color">
            {new Date().getDate()}
          </span>
          <span className="ecoai-admin-present-wfo-late-tile-text">
            WFO Late Login
          </span>
        </div>
        <div className="ecoai-admin-user-calendar-tile-container">
          <span className="ecoai-admin-user-calendar-tile ecoai-admin-present-wfo-less-tile-color">
            {new Date().getDate()}
          </span>
          <span className="ecoai-admin-present-wfo-less-tile-text">
            WFO Less Duration
          </span>
        </div>
        <div className="ecoai-admin-user-calendar-tile-container">
          <span className="ecoai-admin-user-calendar-tile ecoai-admin-present-wfo-late-less-tile-color">
            {new Date().getDate()}
          </span>
          <span className="ecoai-admin-present-wfo-late-less-tile-text">
            WFO Late & Less
          </span>
        </div>
        <div className="ecoai-admin-user-calendar-tile-container">
          <span className="ecoai-admin-user-calendar-tile ecoai-admin-present-wfh-tile-color">
            {new Date().getDate()}
          </span>
          <span className="ecoai-admin-present-wfh-tile-text">Present WFH</span>
        </div>

        <div className="ecoai-admin-user-calendar-tile-container">
          <span className="ecoai-admin-user-calendar-tile ecoai-admin-present-wfh-late-tile-color">
            {new Date().getDate()}
          </span>
          <span className="ecoai-admin-present-wfh-late-tile-text">
            WFH Late Login
          </span>
        </div>
        <div className="ecoai-admin-user-calendar-tile-container">
          <span className="ecoai-admin-user-calendar-tile ecoai-admin-present-wfh-less-tile-color">
            {new Date().getDate()}
          </span>
          <span className="ecoai-admin-present-wfh-less-tile-text">
            WFH Less Duration
          </span>
        </div>
        <div className="ecoai-admin-user-calendar-tile-container">
          <span className="ecoai-admin-user-calendar-tile ecoai-admin-present-wfh-late-less-tile-color">
            {new Date().getDate()}
          </span>
          <span className="ecoai-admin-present-wfh-late-less-tile-text">
            WFH Late & Less
          </span>
        </div>
        <div className="ecoai-admin-user-calendar-tile-container">
          <span className="ecoai-admin-user-calendar-tile ecoai-admin-selected-tile-color">
            {new Date().getDate()}
          </span>
          <span className="ecoai-admin-selected-tile-text">Selected</span>
        </div>
        <div className="ecoai-admin-user-calendar-tile-container">
          <span className="ecoai-admin-user-calendar-tile ecoai-admin-today-tile-color">
            {new Date().getDate()}
          </span>
          <span className="ecoai-admin-today-tile-text">Today</span>
        </div>
        <div className="ecoai-admin-user-calendar-tile-container">
          <span className="ecoai-admin-user-calendar-tile ecoai-admin-not-logged-out-tile-color">
            {new Date().getDate()}
          </span>
          <span className="ecoai-admin-absent-tile-text">Not logged out</span>
        </div>
        <div className="ecoai-admin-user-calendar-tile-container">
          <span className="ecoai-admin-user-calendar-tile ecoai-admin-absent-tile-color">
            {new Date().getDate()}
          </span>
          <span className="ecoai-admin-absent-tile-text">Absent</span>
        </div>
      </div>
    </div>
  );

  const renderCalendarFinalView = () => {
    switch (currentStatus) {
      case status.loading:
        return renderLoadingView();
      case status.success:
        return renderCalendarSuccessView();
      case status.failure:
        return renderFailureView();
      default:
        return null;
    }
  };

  return (
    <>
      <Header />
      <div className="ecoai-admin-user-calendar-bg-container">
        <AdminSidebar />
        <AdminBottombar />
        {currentStatus === status.notFound ? (
          <div className="ecoai-admin-user-calendar-not-found-right-container">
            <p className="ecoai-admin-user-calendar-not-found-right-container-text">
              User not found
            </p>
            <button
              className="ecoai-admin-user-calendar-not-found-right-container-btn"
              onClick={() => navigate("/users")}
            >
              Back to users
            </button>
          </div>
        ) : (
          <div className="ecoai-admin-user-calendar-right-container">
            <h1 className="ecoai-admin-user-calendar-heading">
              {adminSelectedUserDetails.length === 0 ? (
                <Skeleton
                  width={80}
                  height={20}
                  baseColor="#2a2a2a"
                  highlightColor="#3a3a3a"
                  style={{ marginRight: "15px" }}
                />
              ) : (
                `${adminSelectedUserDetails.name}'s `
              )}
              Calendar
            </h1>
            <div className="ecoai-admin-user-calendar-role-container">
              <button
                type="button"
                className="ecoai-admin-user-calendar-role-btn"
                onMouseEnter={() => setIsPopDisplay(true)}
                onMouseLeave={() => setIsPopDisplay(false)}
                onClick={() => setChangeRoleModalIsOpen(true)}
              >
                {role === null ? (
                  <Skeleton
                    width={60}
                    height={16}
                    baseColor="#2a2a2a"
                    highlightColor="#3a3a3a"
                  />
                ) : (
                  role
                )}
              </button>
              {isPopDisplay && (
                <span className="ecoai-admin-user-calendar-role-pop-desc">
                  Click to toggle employee role
                </span>
              )}
            </div>
            <form className="ecoai-admin-user-calendar-calendar-section">
              {renderCalendarFinalView()}
            </form>
            <Modal
              isOpen={changeRoleModalIsOpen}
              onRequestClose={() => setChangeRoleModalIsOpen(false)}
              contentLabel="Logout confirmation Modal"
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
              <div className="ecoai-user-account-modal">
                <p className="ecoai-user-account-modal-heading">
                  Are you sure you want to change the role?
                </p>
                <div className="ecoai-user-account-model-btns-container">
                  <button
                    type="button"
                    className="ecoai-user-account-model-btn user-account-green"
                    onClick={clickedYesBtn}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    className="ecoai-user-account-model-btn user-account-grey"
                    onClick={() => changeRoleModalIsOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </Modal>
            <Modal
              isOpen={deleteEmployeeModalIsOpen}
              onRequestClose={() => setDeleteEmployeeModalIsOpen(false)}
              contentLabel="Logout confirmation Modal"
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
              <div className="ecoai-admin-user-calendar-modal">
                <label
                  htmlFor="ecoai-admin-user-calendar-modal-heading-label"
                  className="ecoai-admin-user-calendar-modal-heading"
                >
                  To confirm, type{" "}
                  {adminSelectedUserDetails.length === 0
                    ? "--"
                    : `"ecoai/${adminSelectedUserDetails.username}"`}{" "}
                  in the box below
                </label>
                <input
                  value={deleteModalInpText}
                  id="ecoai-admin-user-calendar-modal-heading-label"
                  type="text"
                  placeholder="Enter here"
                  className="ecoai-admin-user-calendar-modal-input"
                  onChange={(e) => changeDeleteModalInpText(e.target.value)}
                />
                <div className="ecoai-admin-user-calendar-modal-alert-container">
                  <span className="ecoai-admin-user-calendar-modal-alert-container-span">
                    *Deleting employee will delete all records belong to that
                    employee*
                  </span>
                </div>
                <div className="ecoai-admin-user-calendar-model-btns-container">
                  <button
                    type="button"
                    className="ecoai-admin-user-calendar-model-btn"
                    onClick={clickedDeleteBtn}
                    style={{
                      opacity: `${`ecoai/${adminSelectedUserDetails.username}` === deleteModalInpText ? "1" : "0.6"}`,
                      cursor: `${`ecoai/${adminSelectedUserDetails.username}` !== deleteModalInpText ? "not-allowed" : "pointer"}`,
                    }}
                    disabled={
                      `ecoai/${adminSelectedUserDetails.username}` !==
                      deleteModalInpText
                    }
                  >
                    {deleteLoading ? (
                      <ClipLoader size={12} color="#ffffff" />
                    ) : (
                      "Delete this employee"
                    )}
                  </button>
                </div>
              </div>
            </Modal>
            <button
              className="ecoai-admin-user-calendar-back-icon-container"
              onClick={() => navigate(-1)}
            >
              <IoMdArrowRoundBack className="ecoai-admin-user-calendar-back-icon" />
              Back
            </button>
          </div>
        )}
      </div>
      {currentStatus !== status.notFound && (
        <button
          className="ecoai-admin-user-calendar-delete-user-btn"
          onClick={() => setDeleteEmployeeModalIsOpen(true)}
        >
          Delete Employee
        </button>
      )}
      {currentStatus !== status.notFound && (
        <button
          className="ecoai-admin-user-calendar-delete-user-icon-btn"
          onClick={() => setDeleteEmployeeModalIsOpen(true)}
        >
          <MdDeleteOutline className="ecoai-admin-user-calendar-delete-user-btn-icon" />
        </button>
      )}
      {toast.show && (
        <div className={`ecoai-toast ecoai-toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
    </>
  );
};

export default AdminUserCalendar;
