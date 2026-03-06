import { useLocation, useNavigate } from "react-router-dom";
import { PiHouseBold } from "react-icons/pi";
import { HiOutlineViewGrid } from "react-icons/hi";
import { MdOutlineFactCheck } from "react-icons/md";
import { HiMiniCalendarDays } from "react-icons/hi2";
import { RiAccountCircle2Line } from "react-icons/ri";
import { TbSettings } from "react-icons/tb";
import { GrTask } from "react-icons/gr";

import "./index.css";

const UserBottombar = ({ onNavigate }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  return (
    <ul className="ecoai-userbottombar-container">
      <li className="ecoai-userbottombar-item">
        <button
          onClick={() => navigate("/")}
          type="button"
          className={`ecoai-userbottombar-item-btn ${
            path === "/" ? "ecoai-userbottombar-item-btn-selected" : ""
          }`}
        >
          <PiHouseBold
            className={`ecoai-userbottombar-icon ${
              path === "/" ? "bottombar-selected-icon-color" : ""
            }`}
          />
        </button>
      </li>
      {/* <li className="ecoai-userbottombar-item">
        <button
          onClick={() => navigate("/user-dashboard")}
          type="button"
          className={`ecoai-userbottombar-item-btn ${
            path === "/user-dashboard"
              ? "ecoai-userbottombar-item-btn-selected"
              : ""
          }`}
        >
          <HiOutlineViewGrid
            className={`ecoai-userbottombar-icon ${
              path === "/user-dashboard" ? "bottombar-selected-icon-color" : ""
            }`}
          />
        </button>
      </li> */}
      <li className="ecoai-userbottombar-item">
        <button
          onClick={() => navigate("/user-calendar")}
          type="button"
          className={`ecoai-userbottombar-item-btn ${
            path === "/user-calendar"
              ? "ecoai-userbottombar-item-btn-selected"
              : ""
          }`}
        >
          <HiMiniCalendarDays
            className={`ecoai-userbottombar-icon calendar-icon ${
              path === "/user-calendar" ? "bottombar-selected-icon-color" : ""
            }`}
          />
        </button>
      </li>
      <li className="ecoai-userbottombar-item">
        <button
          onClick={() => navigate("/my-attendance")}
          type="button"
          className={`ecoai-userbottombar-item-btn ${
            path === "/my-attendance"
              ? "ecoai-userbottombar-item-btn-selected"
              : ""
          }`}
        >
          <MdOutlineFactCheck
            className={`ecoai-userbottombar-icon attendance-icon ${
              path === "/my-attendance" ? "bottombar-selected-icon-color" : ""
            }`}
          />
        </button>
      </li>
      <li className="ecoai-userbottombar-item">
        <button
          onClick={() => navigate("/add-tasks")}
          type="button"
          className={`ecoai-userbottombar-item-btn ${
            path === "/add-tasks" ? "ecoai-userbottombar-item-btn-selected" : ""
          }`}
        >
          <GrTask
            className={`ecoai-userbottombar-icon task-icon ${
              path === "/add-tasks" ? "bottombar-selected-icon-color" : ""
            }`}
          />
        </button>
      </li>
      {/* <li className="ecoai-userbottombar-item">
        <button
          onClick={() => navigate("/user-settings")}
          type="button"
          className={`ecoai-userbottombar-item-btn ${
            path === "/user-settings"
              ? "ecoai-userbottombar-item-btn-selected"
              : ""
          }`}
        >
          <TbSettings
            className={`ecoai-userbottombar-icon ${
              path === "/user-settings" ? "bottombar-selected-icon-color" : ""
            }`}
          />
        </button>
      </li> */}
      <li className="ecoai-userbottombar-item">
        <button
          onClick={() => navigate("/user-account-details")}
          type="button"
          className={`ecoai-userbottombar-item-btn ${
            path === "/user-account-details"
              ? "ecoai-userbottombar-item-btn-selected"
              : ""
          }`}
        >
          <RiAccountCircle2Line
            className={`ecoai-userbottombar-icon account-icon ${
              path === "/user-account-details"
                ? "bottombar-selected-icon-color"
                : ""
            }`}
          />
        </button>
      </li>
    </ul>
  );
};

export default UserBottombar;
