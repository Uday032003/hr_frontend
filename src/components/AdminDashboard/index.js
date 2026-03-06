import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import Modal from "react-modal";
import { ClipLoader } from "react-spinners";
import { HiOutlineOfficeBuilding } from "react-icons/hi";
import { PiHouseBold } from "react-icons/pi";
import { LuClock3 } from "react-icons/lu";
import { GiDuration } from "react-icons/gi";

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import Header from "../Header";
import AdminSidebar from "../AdminSidebar";
import AdminBottombar from "../AdminBottombar";
import "./index.css";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const status = {
  initial: "INITIAL",
  loading: "LOADING",
  success: "SUCCESS",
  failure: "FAILURE",
  notFound: "NOT-FOUND",
};

const AdminDashboard = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [usersTodayDetails, setUsersTodayDetails] = useState([]);
  const [totalUsersCount, setTotalUsersCount] = useState(null);
  const [currentStatus, setCurrentStatus] = useState(status.loading);
  const [isOfflineUsersModelOpen, setIsOfflineUsersModelOpen] = useState(false);
  const [offlineModalStatus, setOfflineModalStatus] = useState(status.initial);
  const [offlineUsersDetails, setOfflineUsersDetails] = useState([]);
  const adminToken = Cookies.get("admin_Token");
  const navigate = useNavigate();

  const isLateLogin = (loginTime) => {
    const loginDate = new Date(loginTime);
    loginDate.setMinutes(loginDate.getMinutes() - 330);
    return loginDate.getHours() > 10;
  };

  const data = {
    labels: ["Total Users", "Present Users", "Absent Users"],
    datasets: [
      {
        label: "Count",
        data: [
          totalUsersCount,
          usersTodayDetails.length,
          parseInt(totalUsersCount) - parseInt(usersTodayDetails.length),
        ],
        backgroundColor: ["#4f99bc"],
      },
    ],
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

  const getBreakWorkingDuration = (val1, val2) => {
    const startDate = new Date(val1);
    const endDate = val2 ? new Date(val2) : new Date();
    let diffMs;
    if (val2 === null) {
      diffMs = (endDate - startDate) / 1000 + 19800;
    } else {
      diffMs = (endDate - startDate) / 1000;
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
    const usersTodayDetails = async () => {
      const options = {
        method: "GET",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      };
      try {
        const response = await fetch(
          "http://localhost:3001/users-today-details",
          options,
        );
        if (response.ok) {
          const data = await response.json();
          const updatedData = data.usersToday.map((i) => ({
            userid: i.userid,
            id: i.attendanceid,
            username: i.username,
            jobType: i.job_type,
            loginTime: i.login_time,
            logoutTime: i.logout_time,
            breakOutTime: i.break_out_time,
            breakInTime: i.break_in_time,
            attendanceType: i.attendance_type,
          }));
          if (data.usersToday.length === 0) {
            setCurrentStatus(status.notFound);
          } else {
            setCurrentStatus(status.success);
          }
          setUsersTodayDetails(updatedData);
          setTotalUsersCount(data.totalUsersCount);
        } else {
          setCurrentStatus(status.failure);
        }
      } catch (error) {
        console.log(error);
        setCurrentStatus(status.failure);
      }
    };
    usersTodayDetails();
  }, [adminToken]);

  const renderFailureView = () => (
    <div className="ecoai-admin-dashboard-failure-view-container">
      Failed to load
    </div>
  );

  const renderLoadingView = () => (
    <div className="ecoai-admin-dashboard-loading-view-container">
      <ClipLoader size={30} color={"#ffffff"} loading={true} />
    </div>
  );

  const skeletonLoading = () => (
    <>
      <Skeleton
        width={20}
        height={20}
        baseColor="#2a2a2a"
        highlightColor="#3a3a3a"
      />
    </>
  );

  const renderNotFoundView = () => (
    <div className="ecoai-admin-dashboard-not-found-view-container">
      No active users
    </div>
  );

  const renderOfflineNotFoundView = () => (
    <div className="ecoai-admin-dashboard-not-found-view-container">
      No absent users
    </div>
  );

  const renderSuccessView = () => (
    <ul className="ecoai-admin-dashboard-success-attendance-feed-inner-container">
      {usersTodayDetails.map((i, index) => (
        <li
          key={i.id}
          className="ecoai-admin-dashboard-success-attendance-feed-item"
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          onClick={() => navigate(`/users-calendar/${i.userid}`)}
        >
          <div className="ecoai-admin-dashboard-success-attendance-feed-item-cont1">
            <p className="ecoai-admin-dashboard-success-attendance-feed-item-username">
              {i.username === null ? "--" : i.username}
            </p>
            <div className="ecoai-admin-dashboard-success-attendance-feed-item-login-details-container">
              <div className="ecoai-admin-dashboard-success-attendance-feed-item-loc-cont">
                {i.attendanceType === "WFO" ? (
                  <HiOutlineOfficeBuilding className="ecoai-admin-dashboard-success-attendance-feed-icon" />
                ) : (
                  <PiHouseBold className="ecoai-admin-dashboard-success-attendance-feed-icon ellu" />
                )}
                {i.attendanceType}
              </div>
              <div
                className={`ecoai-admin-dashboard-success-attendance-feed-item-time-cont ${isLateLogin(i.loginTime) && "late-login"}`}
              >
                <LuClock3
                  className={`ecoai-admin-dashboard-success-attendance-feed-icon gadiyaaram ${
                    ((i.loginTime !== null &&
                      i.breakOutTime === null &&
                      i.breakInTime === null &&
                      i.logoutTime === null) ||
                      (i.loginTime !== null &&
                        i.breakOutTime !== null &&
                        i.breakInTime !== null &&
                        i.logoutTime === null)) &&
                    "gadiyaaram-animation"
                  }`}
                />
                {new Date(i.loginTime)
                  .toLocaleTimeString("en-IN", {
                    timeZone: "UTC",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                  .toUpperCase()}
              </div>
              <div className="ecoai-admin-dashboard-success-attendance-feed-item-duration-cont">
                <GiDuration
                  className={`ecoai-admin-dashboard-success-attendance-feed-icon counter ${i.breakOutTime !== null && i.breakInTime === null && "counter-animation"}`}
                />
                {i.breakOutTime === null
                  ? "--"
                  : getBreakWorkingDuration(i.breakOutTime, i.breakInTime)}
              </div>
            </div>
            {((i.loginTime !== null &&
              i.breakOutTime === null &&
              i.breakInTime === null &&
              i.logoutTime === null) ||
              (i.loginTime !== null &&
                i.breakOutTime !== null &&
                i.breakInTime !== null &&
                i.logoutTime === null)) && (
              <p className="ecoai-admin-dashboard-success-attendance-feed-active-status">
                Active
              </p>
            )}
            {i.loginTime !== null &&
              i.breakOutTime !== null &&
              i.breakInTime === null && (
                <p className="ecoai-admin-dashboard-attendance-feed-in-break-status">
                  In Break
                </p>
              )}
            {((i.loginTime !== null &&
              i.breakOutTime !== null &&
              i.breakInTime !== null &&
              i.logoutTime !== null) ||
              (i.loginTime !== null && i.logoutTime !== null)) && (
              <p className="ecoai-admin-dashboard-success-attendance-feed-offline-status">
                Offline
              </p>
            )}
          </div>
          <p className="ecoai-admin-dashboard-success-attendance-feed-item-cont2">
            {getWorkingDuration(
              i.loginTime,
              i.logoutTime,
              i.breakOutTime,
              i.breakInTime,
              currentTime,
            )}
          </p>
          {hoveredIndex === index && (
            <div className="ecoai-admin-dashboard-success-attendance-hover-info">
              <span className="arrow" />
              {i.jobType}
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  const renderOfflineModalSuccessView = () => (
    <>
      {offlineUsersDetails.map((i) => (
        <li
          key={i.id}
          className="ecoai-admin-dashboard-item"
          onClick={() => navigate(`/users-calendar/${i.id}`)}
        >
          <span className="ecoai-admin-dashboard-name">
            {i.name ? i.name : "--"}
          </span>
          <span className="ecoai-admin-dashboard-username">
            {i.username ? i.username : "--"}
          </span>
          <span className="ecoai-admin-dashboard-job-type">
            {i.jobType ? i.jobType : "--"}
          </span>
        </li>
      ))}
    </>
  );

  const usersCountFinal = (val) => {
    switch (currentStatus) {
      case status.loading:
        return skeletonLoading();
      case status.failure:
        return "--";
      case status.notFound:
      case status.success:
        return val;
      default:
        return null;
    }
  };

  const activeUsersCountFinal = (val) => {
    switch (currentStatus) {
      case status.loading:
        return skeletonLoading();
      case status.notFound:
      case status.failure:
        return "--";
      case status.success:
        return val;
      default:
        return null;
    }
  };

  const clickedOfflineCard = async () => {
    setOfflineModalStatus(status.loading);
    setIsOfflineUsersModelOpen(true);
    const options = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    };
    try {
      const response = await fetch(
        "http://localhost:3001/offline-users-today",
        options,
      );
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        const updatedData = data.offlineUsersToday.map((i) => ({
          id: i.id,
          name: i.name,
          username: i.username,
          jobType: i.job_type,
        }));
        console.log(updatedData);
        if (data.offlineUsersToday.length === 0) {
          setOfflineModalStatus(status.notFound);
        } else {
          setOfflineModalStatus(status.success);
        }
        setOfflineUsersDetails(updatedData);
      } else {
        setOfflineModalStatus(status.failure);
      }
    } catch (error) {
      console.log(error);
      setOfflineModalStatus(status.failure);
    }
  };

  const renderOfflineModalFinalView = () => {
    switch (offlineModalStatus) {
      case status.loading:
        return renderLoadingView();
      case status.notFound:
        return renderOfflineNotFoundView();
      case status.success:
        return renderOfflineModalSuccessView();
      case status.failure:
        return renderFailureView();
      default:
        return null;
    }
  };

  const renderFinalView = () => {
    switch (currentStatus) {
      case status.loading:
        return renderLoadingView();
      case status.notFound:
        return renderNotFoundView();
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
      <div className="ecoai-admin-dashboard-bg-container">
        <AdminSidebar />
        <AdminBottombar />
        <div className="ecoai-admin-dashboard-right-container">
          <h1 className="ecoai-admin-dashboard-admin-title">Admin Dashboard</h1>
          <span className="ecoai-admin-dashboard-time">
            {currentTime
              .toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
              })
              .toUpperCase()}
          </span>
          <div className="ecoai-admin-dashboard-container">
            <div className="ecoai-admin-dashboard-stats">
              <div className="ecoai-admin-dashboard-cards-container">
                <div
                  className="ecoai-admin-dashboard-card"
                  onClick={() => navigate("/users")}
                >
                  <p className="ecoai-admin-dashboard-card-title">
                    Total Users
                  </p>
                  <h2 className="ecoai-admin-dashboard-card-count">
                    {usersCountFinal(totalUsersCount)}
                  </h2>
                </div>
                <div
                  className="ecoai-admin-dashboard-card"
                  onClick={() => navigate("/manage-attendance")}
                >
                  <p className="ecoai-admin-dashboard-card-title">
                    Present Users
                  </p>
                  <h2 className="ecoai-admin-dashboard-card-count">
                    {activeUsersCountFinal(usersTodayDetails.length)}
                  </h2>
                </div>
                <div
                  className="ecoai-admin-dashboard-card"
                  onClick={clickedOfflineCard}
                >
                  <p className="ecoai-admin-dashboard-card-title">
                    Absent Users
                  </p>
                  <h2 className="ecoai-admin-dashboard-card-count">
                    {usersCountFinal(
                      parseInt(totalUsersCount) -
                        parseInt(usersTodayDetails.length),
                    )}
                  </h2>
                </div>
              </div>
              <div className="ecoai-admin-dashboard-bar-big-container">
                <div className="ecoai-admin-dashboard-bar-container">
                  <Bar
                    data={data}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { position: "top" },
                        labels: {
                          color: "#bdbbbb",
                        },
                      },
                      scales: {
                        x: {
                          ticks: {
                            color: "#bdbbbb",
                          },
                          border: {
                            color: "#bdbbbb",
                          },
                        },
                        y: {
                          beginAtZero: true,
                          ticks: {
                            stepSize: 1,
                            callback: function (value) {
                              return Number.isInteger(value) ? value : null;
                            },
                          },
                          border: {
                            color: "#bdbbbb",
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="ecoai-admin-dashboard-attendance-feed-container">
              <p className="ecoai-admin-dashboard-attendance-feed-heading">
                Attendance Feed
              </p>
              {renderFinalView()}
            </div>
          </div>
          <Modal
            isOpen={isOfflineUsersModelOpen}
            onRequestClose={() => setIsOfflineUsersModelOpen(false)}
            contentLabel="Offline users Modal"
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
            <div className="ecoai-admin-dashboard-modal">
              <h1 className="ecoai-admin-dashboard-modal-heading">
                Offline Users
              </h1>
              <div className="ecoai-admin-dashboard-list-container">
                <ul className="ecoai-admin-dashboard-list">
                  <li
                    key="ecoai-dashboard-heading-row"
                    className="ecoai-admin-dashboard-heading-item"
                  >
                    <div className="ecoai-admin-dashboard-name">
                      <button
                        className="ecoai-admin-dashboard-sorting-btn"
                        // data-name="name"
                        // onClick={sortingUsers}
                        // disabled={currentStatus !== status.success}
                      >
                        Name
                        {/* {sortingIcon("name")} */}
                      </button>
                    </div>
                    <div className="ecoai-admin-dashboard-username">
                      <button
                        className="ecoai-admin-dashboard-sorting-btn"
                        // data-name="username"
                        // onClick={sortingUsers}
                        // disabled={currentStatus !== status.success}
                      >
                        Username
                        {/* {sortingIcon("username")} */}
                      </button>
                    </div>
                    <div className="ecoai-admin-dashboard-job-type">
                      <button
                        className="ecoai-admin-dashboard-sorting-btn"
                        // data-name="job_type"
                        // onClick={sortingUsers}
                        // disabled={currentStatus !== status.success}
                      >
                        Job Type
                        {/* {sortingIcon("job_type")} */}
                      </button>
                    </div>
                  </li>
                  {renderOfflineModalFinalView()}
                </ul>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
