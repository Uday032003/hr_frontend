import { useLocation, useNavigate } from "react-router-dom";
import { LuUsersRound } from "react-icons/lu";
import { LuLayoutDashboard } from "react-icons/lu";
import { MdOutlineFactCheck } from "react-icons/md";
import { HiMiniCalendarDays } from "react-icons/hi2";
import { FaRegUser } from "react-icons/fa";
import { TbSettings } from "react-icons/tb";

import "./index.css";

const AdminBottombar = ({ onNavigate }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  return (
    <ul className="ecoai-adminbottombar-container">
      <li className="ecoai-adminbottombar-item">
        <button
          onClick={() => navigate("/admin-dashboard")}
          type="button"
          className={`ecoai-adminbottombar-item-btn ${
            path === "/admin-dashboard"
              ? "ecoai-adminbottombar-item-btn-selected"
              : ""
          }`}
        >
          <LuLayoutDashboard
            className={`ecoai-adminbottombar-icon ${
              path === "/admin-dashboard" ? "bottombar-selected-icon-color" : ""
            }`}
          />
        </button>
      </li>
      <li className="ecoai-adminbottombar-item">
        <button
          onClick={() => navigate("/users")}
          type="button"
          className={`ecoai-adminbottombar-item-btn ${
            path === "/users" ||
            path.startsWith("/users-calendar") ||
            path.startsWith("/user-details")
              ? "ecoai-adminbottombar-item-btn-selected"
              : ""
          }`}
        >
          <LuUsersRound
            className={`ecoai-adminbottombar-icon users-icon ${
              path === "/users" ||
              path.startsWith("/users-calendar") ||
              path.startsWith("/user-details")
                ? "bottombar-selected-icon-color"
                : ""
            }`}
          />
        </button>
      </li>
      <li className="ecoai-adminbottombar-item">
        <button
          onClick={() => navigate("/admin-calendar")}
          type="button"
          className={`ecoai-adminbottombar-item-btn ${
            path === "/admin-calendar"
              ? "ecoai-adminbottombar-item-btn-selected"
              : ""
          }`}
        >
          <HiMiniCalendarDays
            className={`ecoai-adminbottombar-icon calendar-icon ${
              path === "/admin-calendar" ? "bottombar-selected-icon-color" : ""
            }`}
          />
        </button>
      </li>
      <li className="ecoai-adminbottombar-item">
        <button
          onClick={() => navigate("/manage-attendance")}
          type="button"
          className={`ecoai-adminbottombar-item-btn ${
            path === "/manage-attendance"
              ? "ecoai-adminbottombar-item-btn-selected"
              : ""
          }`}
        >
          <MdOutlineFactCheck
            className={`ecoai-adminbottombar-icon attendance-icon ${
              path === "/manage-attendance"
                ? "bottombar-selected-icon-color"
                : ""
            }`}
          />
        </button>
      </li>
      <li className="ecoai-adminbottombar-item">
        <button
          onClick={() => navigate("/admin-settings")}
          type="button"
          className={`ecoai-adminbottombar-item-btn ${
            path === "/admin-settings"
              ? "ecoai-adminbottombar-item-btn-selected"
              : ""
          }`}
        >
          <TbSettings
            className={`ecoai-adminbottombar-icon ${
              path === "/admin-settings" ? "bottombar-selected-icon-color" : ""
            }`}
          />
        </button>
      </li>
      <li className="ecoai-adminbottombar-item">
        <button
          onClick={() => navigate("/admin-profile")}
          type="button"
          className={`ecoai-adminbottombar-item-btn ${
            path === "/admin-profile"
              ? "ecoai-adminbottombar-item-btn-selected"
              : ""
          }`}
        >
          <FaRegUser
            className={`ecoai-adminbottombar-icon profile-icon ${
              path === "/admin-profile" ? "bottombar-selected-icon-color" : ""
            }`}
          />
        </button>
      </li>
    </ul>
  );
};

export default AdminBottombar;
