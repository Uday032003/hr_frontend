import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import Cookies from "js-cookie";
import { ClipLoader } from "react-spinners";
import "react-calendar/dist/Calendar.css";
import { IoMdArrowRoundBack } from "react-icons/io";

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

const UserCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [specialUserId, setSpecialUserId] = useState("");
  const [userAttendedDates, setUserAttendedDates] = useState([]);
  const [currentStatus, setCurrentStatus] = useState(status.loading);
  const storedDate = localStorage.getItem("user_calendar_view");
  const [viewDate, setViewDate] = useState(
    storedDate ? new Date(storedDate) : new Date(),
  );
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "error",
  });
  const jwtToken = Cookies.get("jwt_Token");
  const attendanceMap = new Map(
    userAttendedDates.map((item) => [item.date, item]),
  );
  const navigate = useNavigate();
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

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type });
    }, 2500);
  };

  const years = Array.from({ length: 6 }, (_, i) => 2025 + i);

  useEffect(() => {
    setCurrentStatus(status.loading);
    const fetchUserData = async () => {
      const options = {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      };
      const month = viewDate.getMonth() + 1;
      const year = viewDate.getFullYear();
      try {
        const attendanceResponse = await fetch(
          `https://hr-backend-k3e7.onrender.com/user-attendance-dates?month=${month}&year=${year}`,
          options,
        );
        if (attendanceResponse.ok) {
          const attendanceData = await attendanceResponse.json();
          console.log(attendanceData);
          if (attendanceData && attendanceData.length > 0) {
            const updatedAttendance = attendanceData.map((i) => ({
              date: i.date,
              loginTime: i.login_time,
              logoutTime: i.logout_time,
              breakOutTime: i.break_out_time,
              breakInTime: i.break_in_time,
              attendanceType: i.attendance_type,
            }));
            setUserAttendedDates(updatedAttendance);
          } else {
            setUserAttendedDates([]);
          }
        }
        const response = await fetch(
          "https://hr-backend-k3e7.onrender.com/user-details",
          options,
        );
        if (response.ok) {
          const data = await response.json();
          setCurrentStatus(status.success);
          if (data.selected_date) {
            setSelectedDate(new Date(data.selected_date));
          }
          if (data.id) {
            setSpecialUserId(data.id);
          }
        } else {
          setCurrentStatus(status.failure);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchUserData();
  }, [jwtToken, viewDate]);

  const handleMonthChange = (e) => {
    setCurrentStatus(status.loading);
    const newMonth = months.indexOf(e.target.value);
    const updatedDate = new Date(viewDate);
    updatedDate.setMonth(newMonth);
    setUserAttendedDates([]);
    setViewDate(updatedDate);
    localStorage.setItem("user_calendar_view", updatedDate);
  };

  const handleYearChange = (e) => {
    setCurrentStatus(status.loading);
    const updatedDate = new Date(viewDate);
    updatedDate.setFullYear(Number(e.target.value));
    setUserAttendedDates([]);
    setViewDate(updatedDate);
    localStorage.setItem("user_calendar_view", updatedDate);
  };

  const handleDateClick = async (date) => {
    showToast("Loading...", "success");
    const selectedDateDetails = {
      selectedDate: date.toISOString(),
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
        "https://hr-backend-k3e7.onrender.com/update-selected-date",
        options,
      );
      if (response.ok) {
        navigate("/my-attendance");
      } else {
        setToast("Failed", "error");
      }
    } catch (error) {
      setToast("Failed", "error");
      console.log(error);
    }
  };

  const renderFailureView = () => (
    <div className="ecoai-user-calendar-loading-view-container">
      Failed to load
    </div>
  );

  const renderLoadingView = () => (
    <div className="ecoai-user-calendar-loading-view-container">
      <ClipLoader size={30} color={"#ffffff"} loading={true} />
    </div>
  );

  const renderCalendarSuccessView = () => (
    <div className="ecoai-username-calendar-container">
      <div className="ecoai-user-calendar-month-year-selectors-container">
        <select
          value={months[viewDate.getMonth()]}
          onChange={handleMonthChange}
          className="ecoai-user-calendar-month-selector"
        >
          {months.map((m) => (
            <option key={m} className="ecoai-user-calendar-select-option">
              {m}
            </option>
          ))}
        </select>
        <select
          value={viewDate.getFullYear()}
          onChange={handleYearChange}
          className="ecoai-user-calendar-year-selector"
        >
          {years.map((y) => (
            <option key={y} className="ecoai-user-calendar-select-option">
              {y}
            </option>
          ))}
        </select>
      </div>
      <Calendar
        value={new Date(selectedDate)}
        onChange={setSelectedDate}
        activeStartDate={viewDate}
        onClickDay={(date) => {
          setSelectedDate(date);
          handleDateClick(date);
        }}
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
            localStorage.setItem("user_calendar_view", activeStartDate);
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
          if (specialUserId === "95e8e4b8-f499-4691-85df-132932bdd41f") {
            return getAttendanceSpecialStatus(attendance, new Date());
          } else {
            return getAttendanceStatus(attendance, new Date());
          }
        }}
      />
      <div className="ecoai-user-calendar-tiles-container">
        <div className="ecoai-user-calendar-tile-container">
          <span className="ecoai-user-calendar-tile ecoai-admin-present-wfo-tile-color">
            {new Date().getDate()}
          </span>
          <span className="ecoai-admin-present-wfo-tile-text">Present WFO</span>
        </div>
        <div className="ecoai-user-calendar-tile-container">
          <span className="ecoai-user-calendar-tile ecoai-admin-present-wfo-late-tile-color">
            {new Date().getDate()}
          </span>
          <span className="ecoai-admin-present-wfo-late-tile-text">
            WFO Late Login
          </span>
        </div>
        <div className="ecoai-user-calendar-tile-container">
          <span className="ecoai-user-calendar-tile ecoai-admin-present-wfo-less-tile-color">
            {new Date().getDate()}
          </span>
          <span className="ecoai-admin-present-wfo-less-tile-text">
            WFO Less Duration
          </span>
        </div>
        <div className="ecoai-user-calendar-tile-container">
          <span className="ecoai-user-calendar-tile ecoai-admin-present-wfo-late-less-tile-color">
            {new Date().getDate()}
          </span>
          <span className="ecoai-admin-present-wfo-late-less-tile-text">
            WFO Late & Less
          </span>
        </div>
        <div className="ecoai-user-calendar-tile-container">
          <span className="ecoai-user-calendar-tile ecoai-admin-present-wfh-tile-color">
            {new Date().getDate()}
          </span>
          <span className="ecoai-admin-present-wfh-tile-text">Present WFH</span>
        </div>

        <div className="ecoai-user-calendar-tile-container">
          <span className="ecoai-user-calendar-tile ecoai-admin-present-wfh-late-tile-color">
            {new Date().getDate()}
          </span>
          <span className="ecoai-admin-present-wfh-late-tile-text">
            WFH Late Login
          </span>
        </div>
        <div className="ecoai-user-calendar-tile-container">
          <span className="ecoai-user-calendar-tile ecoai-admin-present-wfh-less-tile-color">
            {new Date().getDate()}
          </span>
          <span className="ecoai-admin-present-wfh-less-tile-text">
            WFH Less Duration
          </span>
        </div>
        <div className="ecoai-user-calendar-tile-container">
          <span className="ecoai-user-calendar-tile ecoai-admin-present-wfh-late-less-tile-color">
            {new Date().getDate()}
          </span>
          <span className="ecoai-admin-present-wfh-late-less-tile-text">
            WFH Late & Less
          </span>
        </div>
        <div className="ecoai-user-calendar-tile-container">
          <span className="ecoai-user-calendar-tile ecoai-admin-selected-tile-color">
            {new Date().getDate()}
          </span>
          <span className="ecoai-admin-selected-tile-text">Selected</span>
        </div>
        <div className="ecoai-user-calendar-tile-container">
          <span className="ecoai-user-calendar-tile ecoai-admin-today-tile-color">
            {new Date().getDate()}
          </span>
          <span className="ecoai-admin-today-tile-text">Today</span>
        </div>
        <div className="ecoai-user-calendar-tile-container">
          <span className="ecoai-user-calendar-tile ecoai-admin-not-logged-out-tile-color">
            {new Date().getDate()}
          </span>
          <span className="ecoai-admin-absent-tile-text">Not Logged out</span>
        </div>
        <div className="ecoai-user-calendar-tile-container">
          <span className="ecoai-user-calendar-tile ecoai-admin-absent-tile-color">
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
      <div className="ecoai-user-calendar-bg-container">
        <UserSidebar />
        <UserBottombar />
        <div className="ecoai-user-calendar-right-container">
          <ProfileIncompleteBanner />
          <h1 className="ecoai-user-calendar-heading">Calendar</h1>
          <div className="ecoai-user-calendar-calendar-section">
            {renderCalendarFinalView()}
            {/* <button type="submit" className="ecoai-user-calendar-button">
              {enterBtnLoading ? (
                <ClipLoader size={15} color="#bdbbbb" />
              ) : (
                <>
                  Enter
                  <span className="ecoai-user-calendar-selected-date-text">
                    {selectedDate.toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </>
              )}
            </button> */}
          </div>
          <button
            className="ecoai-user-calendar-back-icon-container"
            onClick={() => navigate(-1)}
          >
            <IoMdArrowRoundBack className="ecoai-user-calendar-back-icon" />
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

export default UserCalendar;
