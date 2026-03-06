import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { ClipLoader } from "react-spinners";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import Header from "../Header";
import AdminSidebar from "../AdminSidebar";
import AdminBottombar from "../AdminBottombar";
import "./index.css";

const status = {
  loading: "LOADING",
  success: "SUCCESS",
  failure: "FAILURE",
};

const COLORS = ["#4CAF50", "#F44336"];

const AdminCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentStatus, setCurrentStatus] = useState(status.loading);
  const [pieChartStatus, setPieChartStatus] = useState(status.loading);
  const [totalUsersCount, setTotalUsersCount] = useState(null);
  const [selectedDateUsersDetails, setSelectedDateUsersDetails] = useState([]);
  const storedDate = localStorage.getItem("admin_calendar_view");
  const [viewDate, setViewDate] = useState(
    storedDate ? new Date(storedDate) : new Date(),
  );
  const adminToken = Cookies.get("admin_Token");
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
    const fetchUsersData = async () => {
      const selectedDateDetails = {
        selectedDate: undefined,
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
          "https://hr-backend-k3e7.onrender.com/selected-date-attendance",
          options,
        );
        if (response.ok) {
          const data = await response.json();
          setTotalUsersCount(data.totalUsersCount);
          setSelectedDate(new Date(data.adminSelectedDate));
          const updatedData = data.usersToday.map((i) => ({
            id: i.attendanceid,
            username: i.username,
            jobType: i.job_type,
            loginTime: i.login_time,
            logoutTime: i.logout_time,
            attendanceType: i.attendance_type,
          }));
          setSelectedDateUsersDetails(updatedData);
          setCurrentStatus(status.success);
          setPieChartStatus(status.success);
        } else {
          setCurrentStatus(status.failure);
          setPieChartStatus(status.failure);
        }
      } catch (err) {
        console.log(err);
        setCurrentStatus(status.failure);
        setPieChartStatus(status.failure);
      }
    };
    fetchUsersData();
  }, [adminToken]);

  const handleMonthChange = (e) => {
    const newMonth = months.indexOf(e.target.value);
    const updatedDate = new Date(viewDate);
    updatedDate.setMonth(newMonth);
    setViewDate(updatedDate);
    localStorage.setItem("admin_calendar_view", updatedDate);
  };

  const handleYearChange = (e) => {
    const updatedDate = new Date(viewDate);
    updatedDate.setFullYear(Number(e.target.value));
    setViewDate(updatedDate);
    localStorage.setItem("admin_calendar_view", updatedDate);
  };

  const handleDateClick = async (date) => {
    setPieChartStatus(status.loading);
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
        "https://hr-backend-k3e7.onrender.com/selected-date-attendance",
        options,
      );
      if (response.ok) {
        const data = await response.json();
        setTotalUsersCount(data.totalUsersCount);
        setSelectedDate(new Date(data.adminSelectedDate));
        const updatedData = data.usersToday.map((i) => ({
          id: i.attendanceid,
          username: i.username,
          jobType: i.job_type,
          loginTime: i.login_time,
          logoutTime: i.logout_time,
          attendanceType: i.attendance_type,
        }));
        setSelectedDateUsersDetails(updatedData);
        setPieChartStatus(status.success);
      } else {
        setPieChartStatus(status.failure);
      }
    } catch (error) {
      console.log(error);
      setPieChartStatus(status.failure);
    }
  };

  const getDataForPieChart = () => {
    const adminSelectedDate = selectedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      year: "numeric",
      month: "short",
    });
    const dateToday = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      year: "numeric",
      month: "short",
    });
    if (new Date(selectedDate) > new Date()) {
      return [
        { name: "Active", value: 0 },
        {
          name: "Offline",
          value: 0,
        },
      ];
    }
    if (adminSelectedDate === dateToday) {
      return [
        { name: "Active", value: selectedDateUsersDetails.length },
        {
          name: "Offline",
          value: parseInt(totalUsersCount) - selectedDateUsersDetails.length,
        },
      ];
    }
    return [
      { name: "Present", value: selectedDateUsersDetails.length },
      {
        name: "Absent",
        value: parseInt(totalUsersCount) - selectedDateUsersDetails.length,
      },
    ];
  };

  const pieChartSuccess = () => (
    <div style={{ width: 200, height: 200, position: "relative" }}>
      <PieChart width={200} height={200}>
        <Pie
          data={getDataForPieChart()}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={25}
          outerRadius={55}
          paddingAngle={2}
          label={(entry) => entry.value}
        >
          {getDataForPieChart().map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend
          verticalAlign="bottom"
          wrapperStyle={{ fontSize: "10px", color: "#ccc" }}
        />
      </PieChart>
      {new Date(selectedDate) > new Date() && (
        <span
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "purple",
            fontSize: "12px",
          }}
        >
          Not yet
        </span>
      )}
    </div>
  );

  const pieChartFinal = () => {
    switch (pieChartStatus) {
      case status.loading:
        return renderLoadingView();
      case status.success:
        return pieChartSuccess();
      case status.failure:
        return renderFailureView();
      default:
        return null;
    }
  };

  const skeletonLoading = () => (
    <>
      <Skeleton
        width={10}
        height={10}
        baseColor="#2a2a2a"
        highlightColor="#3a3a3a"
      />
    </>
  );

  const renderFailureView = () => <div>Failed to load</div>;

  const renderLoadingView = () => (
    <div className="ecoai-admin-calendar-loading-view-container">
      <ClipLoader size={30} color={"#ffffff"} loading={true} />
    </div>
  );

  const renderCalendarSuccessView = () => (
    <div className="ecoai-admin-calendar-container">
      <div className="ecoai-admin-calendar-month-year-selectors-container">
        <select
          value={months[viewDate.getMonth()]}
          onChange={handleMonthChange}
          className="ecoai-admin-calendar-month-selector"
        >
          {months.map((m) => (
            <option key={m} className="ecoai-admin-calendar-select-option">
              {m}
            </option>
          ))}
        </select>
        <select
          value={viewDate.getFullYear()}
          onChange={handleYearChange}
          className="ecoai-admin-calendar-year-selector"
        >
          {years.map((y) => (
            <option key={y} className="ecoai-admin-calendar-select-option">
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
          setViewDate(activeStartDate);
          localStorage.setItem("admin_calendar_view", activeStartDate);
        }}
      />
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
      <div className="ecoai-admin-calendar-bg-container">
        <AdminSidebar />
        <AdminBottombar />
        <div className="ecoai-admin-calendar-right-container">
          <h1 className="ecoai-admin-calendar-title">Calendar</h1>
          <div className="ecoai-admin-calendar-calendar-section">
            {renderCalendarFinalView()}
            <div className="ecoai-admin-calendar-chart-details-cont">
              <div className="ecoai-admin-calendar-tiles-container">
                <div className="ecoai-admin-calendar-tile-container">
                  <span className="ecoai-admin-calendar-tile ecoai-selected-tile-color">
                    {new Date().getDate()}
                  </span>
                  <span className="ecoai-admin-selected-tile-text">
                    Selected
                  </span>
                </div>
                <div className="ecoai-admin-calendar-tile-container">
                  <span className="ecoai-admin-calendar-tile ecoai-today-tile-color">
                    {new Date().getDate()}
                  </span>
                  <span className="ecoai-admin-today-tile-text">Today</span>
                </div>
              </div>
              <div className="ecoai-admin-calendar-pie-chart-container">
                <span className="ecoai-admin-calendar-pie-chart-total">
                  Total:{" "}
                  {pieChartStatus === status.loading && skeletonLoading()}
                  {pieChartStatus === status.failure && "--"}
                  {pieChartStatus === status.success && totalUsersCount}
                </span>
                {pieChartFinal()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminCalendar;
