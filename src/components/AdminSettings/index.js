import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { ClipLoader } from "react-spinners";

import Header from "../Header";
import AdminSidebar from "../AdminSidebar";
import AdminBottombar from "../AdminBottombar";
import "./index.css";

const AdminSettings = () => {
  const [settingOptions, setSettingOptions] = useState({
    theme: Cookies.get("theme") || "DARK",
    isWifiRequired: null,
  });
  const [loading, setLoading] = useState({
    theme: { dark: true, light: true },
    isWifiRequired: { yes: true, no: true },
  });
  const adminToken = Cookies.get("admin_Token");

  useEffect(() => {
    if (!settingOptions.theme) return;
    const themeValue = settingOptions.theme.toLowerCase();
    document.documentElement.setAttribute("data-theme", themeValue);
    Cookies.set("theme", settingOptions.theme, { expires: 30 });
  }, [settingOptions.theme]);

  useEffect(() => {
    const userDetails = async () => {
      const options = {
        method: "GET",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      };
      try {
        const response = await fetch(
          "http://localhost:3001/user-details",
          options,
        );
        if (response.ok) {
          const data = await response.json();
          setSettingOptions({
            theme: data.theme,
            isWifiRequired: data.is_wifi_required,
          });
          setLoading({
            theme: { dark: false, light: false },
            isWifiRequired: { yes: false, no: false },
          });
        }
      } catch (error) {
        console.log(error);
      }
    };
    userDetails();
  }, [adminToken]);

  const clickedThemeBtn = async (e) => {
    const btnClicked = e.currentTarget.dataset.name;
    if (btnClicked === settingOptions.theme) return;
    if (btnClicked === "DARK") {
      setLoading((i) => ({
        theme: { dark: true, light: false },
        isWifiRequired: i.isWifiRequired,
      }));
    } else {
      setLoading((i) => ({
        theme: { dark: false, light: true },
        isWifiRequired: i.isWifiRequired,
      }));
    }
    const themeSelectedDetails = {
      btnClicked,
    };
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
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
        setSettingOptions((i) => ({
          theme: data.theme,
          isWifiRequired: i.isWifiRequired,
        }));
        setLoading({
          theme: { dark: false, light: false },
          isWifiRequired: { yes: false, no: false },
        });
      }
    } catch (err) {
      console.log(err);
      setLoading({
        theme: { dark: false, light: false },
        isWifiRequired: { yes: false, no: false },
      });
    }
  };

  const clickedWifiBtn = async (e) => {
    const btnClicked = e.currentTarget.dataset.name;
    if (btnClicked === settingOptions.isWifiRequired) return;
    if (btnClicked === "YES") {
      setLoading((i) => ({
        theme: i.theme,
        isWifiRequired: { yes: true, no: false },
      }));
    } else {
      setLoading((i) => ({
        theme: i.theme,
        isWifiRequired: { yes: false, no: true },
      }));
    }
    const themeSelectedDetails = {
      btnClicked,
    };
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(themeSelectedDetails),
    };
    try {
      const response = await fetch(
        "http://localhost:3001/update-wifi-requirement",
        options,
      );
      if (response.ok) {
        const data = await response.json();
        setSettingOptions((i) => ({
          theme: i.theme,
          isWifiRequired: data.is_wifi_required,
        }));
        setLoading({
          theme: { dark: false, light: false },
          isWifiRequired: { yes: false, no: false },
        });
      }
    } catch (err) {
      console.log(err);
      setLoading({
        theme: { dark: false, light: false },
        isWifiRequired: { yes: false, no: false },
      });
    }
  };

  return (
    <>
      <Header />
      <div className="ecoai-admin-settings-bg-container">
        <AdminSidebar />
        <AdminBottombar />
        <div className="ecoai-admin-settings-right-container">
          <h1 className="ecoai-admin-settings-heading">Settings</h1>
          {/* <div className="ecoai-admin-settings-theme-container">
            <div className="ecoai-admin-settings-theme-text">
              <span>Theme</span>
            </div>
            <div className="ecoai-admin-settings-theme-buttons-container">
              <button
                type="button"
                data-name="LIGHT"
                className={`ecoai-admin-settings-theme-btn ${
                  settingOptions.theme === "LIGHT" &&
                  "ecoai-admin-settings-theme-selected-btn"
                }`}
                onClick={clickedThemeBtn}
                disabled={loading.theme.light === true}
              >
                {loading.theme.light === true ? (
                  <ClipLoader
                    size={10}
                    color={`${settingOptions.theme === "DARK" ? "#bdbbbb" : "rgb(23,23,23)"}`}
                  />
                ) : (
                  "Light"
                )}
              </button>
              <button
                type="button"
                data-name="DARK"
                className={`ecoai-admin-settings-theme-btn dark-btn ${
                  settingOptions.theme === "DARK" &&
                  "ecoai-admin-settings-theme-selected-btn"
                }`}
                onClick={clickedThemeBtn}
                disabled={loading.theme.dark === true}
              >
                {loading.theme.dark === true ? (
                  <ClipLoader
                    size={10}
                    color={`${settingOptions.theme === "DARK" ? "#bdbbbb" : "rgb(23,23,23)"}`}
                  />
                ) : (
                  "Dark"
                )}
              </button>
            </div>
          </div> */}
          <div className="ecoai-admin-settings-theme-container">
            <div className="ecoai-admin-settings-theme-text">
              <span>WiFi Restriction</span>
            </div>
            <div className="ecoai-admin-settings-theme-buttons-container">
              <button
                type="button"
                data-name="YES"
                className={`ecoai-admin-settings-theme-btn ${
                  settingOptions.isWifiRequired === "YES" &&
                  "ecoai-admin-settings-theme-selected-btn"
                }`}
                onClick={clickedWifiBtn}
                disabled={loading.isWifiRequired.yes === true}
              >
                {loading.isWifiRequired.yes === true ? (
                  <ClipLoader
                    size={10}
                    color={`${settingOptions.theme === "DARK" ? "#bdbbbb" : "rgb(23,23,23)"}`}
                  />
                ) : (
                  "Yes"
                )}
              </button>
              <button
                type="button"
                data-name="NO"
                className={`ecoai-admin-settings-theme-btn ${
                  settingOptions.isWifiRequired === "NO" &&
                  "ecoai-admin-settings-theme-selected-btn"
                }`}
                onClick={clickedWifiBtn}
                disabled={loading.isWifiRequired.no === true}
              >
                {loading.isWifiRequired.no === true ? (
                  <ClipLoader
                    size={10}
                    color={`${settingOptions.theme === "DARK" ? "#bdbbbb" : "rgb(23,23,23)"}`}
                  />
                ) : (
                  "No"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSettings;
