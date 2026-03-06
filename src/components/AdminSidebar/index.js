import { useLocation, useNavigate } from "react-router-dom";
import { LuUsersRound } from "react-icons/lu";
import { LuLayoutDashboard } from "react-icons/lu";
import { MdOutlineFactCheck } from "react-icons/md";
import { HiMiniCalendarDays } from "react-icons/hi2";
import { FaRegUser } from "react-icons/fa";
import { TbSettings } from "react-icons/tb";
import { TbDatabaseImport } from "react-icons/tb";

import "./index.css";

const AdminSidebar = ({ onNavigate }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  return (
    <ul className="ecoai-adminsidebar-container">
      <li className="ecoai-adminsidebar-item">
        <button
          onClick={() => navigate("/admin-dashboard")}
          type="button"
          className={`ecoai-adminsidebar-item-btn ${
            path === "/admin-dashboard"
              ? "ecoai-adminsidebar-item-btn-selected"
              : ""
          }`}
        >
          <LuLayoutDashboard
            className={`ecoai-adminsidebar-icon ${
              path === "/admin-dashboard" ? "selected-icon-color" : ""
            }`}
          />
          <span className="ecoai-adminsidebar-item-text">Dashboard</span>
        </button>
      </li>
      <li className="ecoai-adminsidebar-item">
        <button
          onClick={() => navigate("/users")}
          type="button"
          className={`ecoai-adminsidebar-item-btn ${
            path === "/users" ||
            path.startsWith("/users-calendar") ||
            path.startsWith("/user-details")
              ? "ecoai-adminsidebar-item-btn-selected"
              : ""
          }`}
        >
          <LuUsersRound
            className={`ecoai-adminsidebar-icon users-icon ${
              path === "/users" ||
              path.startsWith("/users-calendar") ||
              path.startsWith("/user-details")
                ? "selected-icon-color"
                : ""
            }`}
          />
          <span className="ecoai-adminsidebar-item-text">Users</span>
        </button>
      </li>
      <li className="ecoai-adminsidebar-item">
        <button
          onClick={() => navigate("/admin-calendar")}
          type="button"
          className={`ecoai-adminsidebar-item-btn ${
            path === "/admin-calendar"
              ? "ecoai-adminsidebar-item-btn-selected"
              : ""
          }`}
        >
          <HiMiniCalendarDays
            className={`ecoai-adminsidebar-icon calendar-icon ${
              path === "/admin-calendar" ? "selected-icon-color" : ""
            }`}
          />
          <span className="ecoai-adminsidebar-item-text">Calendar</span>
        </button>
      </li>
      <li className="ecoai-adminsidebar-item">
        <button
          onClick={() => navigate("/manage-attendance")}
          type="button"
          className={`ecoai-adminsidebar-item-btn ${
            path === "/manage-attendance"
              ? "ecoai-adminsidebar-item-btn-selected"
              : ""
          }`}
        >
          <MdOutlineFactCheck
            className={`ecoai-adminsidebar-icon attendance-icon ${
              path === "/manage-attendance" ? "selected-icon-color" : ""
            }`}
          />
          <span className="ecoai-adminsidebar-item-text">Attendance</span>
        </button>
      </li>
      <li className="ecoai-adminsidebar-item">
        <button
          onClick={() => navigate("/admin-settings")}
          type="button"
          className={`ecoai-adminsidebar-item-btn ${
            path === "/admin-settings"
              ? "ecoai-adminsidebar-item-btn-selected"
              : ""
          }`}
        >
          <TbSettings
            className={`ecoai-adminsidebar-icon ${
              path === "/admin-settings" ? "selected-icon-color" : ""
            }`}
          />
          <span className="ecoai-adminsidebar-item-text">Settings</span>
        </button>
      </li>
      <li className="ecoai-adminsidebar-item">
        <button
          onClick={() => navigate("/admin-data-manager")}
          type="button"
          className={`ecoai-adminsidebar-item-btn ${
            path === "/admin-data-manager"
              ? "ecoai-adminsidebar-item-btn-selected"
              : ""
          }`}
        >
          <TbDatabaseImport
            className={`ecoai-adminsidebar-icon ${
              path === "/admin-data-manager" ? "selected-icon-color" : ""
            }`}
          />
          <span className="ecoai-adminsidebar-item-text">Data Manager</span>
        </button>
      </li>
      <li className="ecoai-adminsidebar-item">
        <button
          onClick={() => navigate("/admin-profile")}
          type="button"
          className={`ecoai-adminsidebar-item-btn ${
            path === "/admin-profile"
              ? "ecoai-adminsidebar-item-btn-selected"
              : ""
          }`}
        >
          <FaRegUser
            className={`ecoai-adminsidebar-icon profile-icon ${
              path === "/admin-profile" ? "selected-icon-color" : ""
            }`}
          />
          <span className="ecoai-adminsidebar-item-text">Profile</span>
        </button>
      </li>
    </ul>
  );
};

export default AdminSidebar;
