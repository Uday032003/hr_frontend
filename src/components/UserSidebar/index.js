import { useLocation, useNavigate } from "react-router-dom";
import { PiHouseBold } from "react-icons/pi";
import { HiOutlineViewGrid } from "react-icons/hi";
import { MdOutlineFactCheck } from "react-icons/md";
import { HiMiniCalendarDays } from "react-icons/hi2";
import { RiAccountCircle2Line } from "react-icons/ri";
import { TbSettings } from "react-icons/tb";
import { GrTask } from "react-icons/gr";

import "./index.css";

const UserSidebar = ({ onNavigate }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  return (
    <ul className="ecoai-usersidebar-container">
      <li className="ecoai-usersidebar-item">
        <button
          onClick={() => navigate("/")}
          type="button"
          className={`ecoai-usersidebar-item-btn ${
            path === "/" ? "ecoai-usersidebar-item-btn-selected" : ""
          }`}
        >
          <PiHouseBold
            className={`ecoai-usersidebar-icon ${
              path === "/" ? "selected-icon-color" : ""
            }`}
          />
          <span className="ecoai-usersidebar-item-text">Home</span>
        </button>
      </li>
      {/* <li className="ecoai-usersidebar-item">
        <button
          onClick={() => navigate("/user-dashboard")}
          type="button"
          className={`ecoai-usersidebar-item-btn ${
            path === "/user-dashboard"
              ? "ecoai-usersidebar-item-btn-selected"
              : ""
          }`}
        >
          <HiOutlineViewGrid
            className={`ecoai-usersidebar-icon ${
              path === "/user-dashboard" ? "selected-icon-color" : ""
            }`}
          />
          <span className="ecoai-usersidebar-item-text">Dashboard</span>
        </button>
      </li> */}
      <li className="ecoai-usersidebar-item">
        <button
          onClick={() => navigate("/user-calendar")}
          type="button"
          className={`ecoai-usersidebar-item-btn ${
            path === "/user-calendar"
              ? "ecoai-usersidebar-item-btn-selected"
              : ""
          }`}
        >
          <HiMiniCalendarDays
            className={`ecoai-usersidebar-icon calendar-icon ${
              path === "/user-calendar" ? "selected-icon-color" : ""
            }`}
          />
          <span className="ecoai-usersidebar-item-text">Calendar</span>
        </button>
      </li>
      <li className="ecoai-usersidebar-item">
        <button
          onClick={() => navigate("/my-attendance")}
          type="button"
          className={`ecoai-usersidebar-item-btn ${
            path === "/my-attendance"
              ? "ecoai-usersidebar-item-btn-selected"
              : ""
          }`}
        >
          <MdOutlineFactCheck
            className={`ecoai-usersidebar-icon attendance-icon ${
              path === "/my-attendance" ? "selected-icon-color" : ""
            }`}
          />
          <span className="ecoai-usersidebar-item-text">Attendance</span>
        </button>
      </li>
      <li className="ecoai-usersidebar-item">
        <button
          onClick={() => navigate("/add-tasks")}
          type="button"
          className={`ecoai-usersidebar-item-btn ${
            path === "/add-tasks" ? "ecoai-usersidebar-item-btn-selected" : ""
          }`}
        >
          <GrTask
            className={`ecoai-usersidebar-icon sidebar-task-icon ${
              path === "/add-tasks" ? "selected-icon-color" : ""
            }`}
          />
          <span className="ecoai-usersidebar-item-text">Add Task</span>
        </button>
      </li>
      {/* <li className="ecoai-usersidebar-item">
        <button
          onClick={() => navigate("/user-settings")}
          type="button"
          className={`ecoai-usersidebar-item-btn ${
            path === "/user-settings"
              ? "ecoai-usersidebar-item-btn-selected"
              : ""
          }`}
        >
          <TbSettings
            className={`ecoai-usersidebar-icon ${
              path === "/user-settings" ? "selected-icon-color" : ""
            }`}
          />
          <span className="ecoai-usersidebar-item-text">Settings</span>
        </button>
      </li> */}
      <li className="ecoai-usersidebar-item">
        <button
          onClick={() => navigate("/user-account-details")}
          type="button"
          className={`ecoai-usersidebar-item-btn ${
            path === "/user-account-details"
              ? "ecoai-usersidebar-item-btn-selected"
              : ""
          }`}
        >
          <RiAccountCircle2Line
            className={`ecoai-usersidebar-icon ${
              path === "/user-account-details" ? "selected-icon-color" : ""
            }`}
          />
          <span className="ecoai-usersidebar-item-text">Account</span>
        </button>
      </li>
    </ul>
  );
};

export default UserSidebar;
