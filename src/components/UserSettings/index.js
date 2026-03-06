import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import Cookies from "js-cookie";
import { ClipLoader } from "react-spinners";
import "react-calendar/dist/Calendar.css";

import Header from "../Header";
import UserSidebar from "../UserSidebar";
import "./index.css";

const status = {
  loading: "LOADING",
  success: "SUCCESS",
  failure: "FAILURE",
};

const UserSettings = () => {
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [fadeOut, setFadeOut] = useState(false);
  const jwtToken = Cookies.get("jwt_Token");

  useEffect(() => {
    const userDetails = async () => {
      const options = {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      };
      try {
        const response = await fetch(
          "http://localhost:3001/user-details",
          options,
        );
        if (response.ok) {
          const data = await response.json();
          setSelectedTheme(data.theme);
        }
      } catch (error) {
        console.log(error);
      }
    };
    userDetails();
  }, [jwtToken]);

  const renderLoadingView = () => (
    <div className="ecoai-user-settings-loading-view-container">
      <ClipLoader size={30} color={"#ffffff"} loading={true} />
    </div>
  );

  const clickedThemeBtn = async (e) => {
    const btnClicked = e.currentTarget.dataset.name;
    if (btnClicked === selectedTheme) return;
    const themeSelectedDetails = {
      btnClicked,
    };
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify(themeSelectedDetails),
    };
    try {
      const response = await fetch(
        "http://localhost:3001/update-theme",
        options,
      );
      if (response.ok) {
        const data = await response.json();
        setSelectedTheme(data.theme);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <Header />
      <div className="ecoai-user-settings-bg-container">
        <UserSidebar />
        <div
          className={`ecoai-user-settings-right-container ${
            fadeOut ? "fade-out" : "fade-in"
          }`}
        >
          <h1 className="ecoai-user-settings-heading">Settings</h1>
          <div className="ecoai-user-settings-theme-container">
            <div className="ecoai-user-settings-theme-text">
              <span>Theme</span>
            </div>
            <div className="ecoai-user-settings-theme-buttons-container">
              <button
                type="button"
                data-name="LIGHT"
                className={`ecoai-user-settings-theme-btn ${
                  selectedTheme === "LIGHT" &&
                  "ecoai-user-settings-theme-selected-btn"
                }`}
                onClick={clickedThemeBtn}
              >
                Light
              </button>
              <button
                type="button"
                data-name="DARK"
                className={`ecoai-user-settings-theme-btn dark-btn ${
                  selectedTheme === "DARK" &&
                  "ecoai-user-settings-theme-selected-btn"
                }`}
                onClick={clickedThemeBtn}
              >
                Dark
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserSettings;
