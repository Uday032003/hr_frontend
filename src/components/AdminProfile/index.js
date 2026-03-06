import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import Modal from "react-modal";
import { ClipLoader } from "react-spinners";
import { FaRegEdit } from "react-icons/fa";
import { FaRegSave } from "react-icons/fa";

import Header from "../Header";
import AdminSidebar from "../AdminSidebar";
import AdminBottombar from "../AdminBottombar";
import "./index.css";

const status = {
  initial: "INITIAL",
  loading: "LOADING",
  success: "SUCCESS",
  successEdit: "SUCCESSEDIT",
  failure: "FAILURE",
};

const AdminProfile = () => {
  const [adminDetails, setAdminDetails] = useState([]);
  const [currentStatus, setCurrentStatus] = useState(status.loading);
  const [editStatus, setEditStatus] = useState(status.initial);
  const [logoutModalIsOpen, setLogoutModalIsOpen] = useState(false);
  const [name, changingName] = useState("");
  const [username, changingUsername] = useState("");
  const [fadeOut, setFadeOut] = useState(false);
  const adminToken = Cookies.get("admin_Token");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "error",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const adminDetails = async () => {
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
          const updatedData = {
            name: data.name,
            mail: data.mail,
            username: data.username,
          };
          setAdminDetails(updatedData);
          setCurrentStatus(status.success);
        } else {
          setCurrentStatus(status.failure);
        }
      } catch (error) {
        console.log(error);
        setCurrentStatus(status.failure);
      }
    };
    adminDetails();
  }, [adminToken]);

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type });
    }, 2500);
  };

  const clickedEditBtn = async () => {
    setEditStatus(status.loading);
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
        const updatedData = {
          name: data.name,
          mail: data.mail,
          username: data.username,
        };
        changingName(updatedData.name || "");
        changingUsername(updatedData.username || "");
        setAdminDetails(updatedData);
        setEditStatus(status.successEdit);
        setCurrentStatus(status.successEdit);
      } else {
        setEditStatus(status.failure);
      }
    } catch (error) {
      console.log(error);
      setEditStatus(status.failure);
    }
  };

  const clickedSaveBtn = async (e) => {
    e.preventDefault();
    setEditStatus(status.loading);
    const userUpdatedDetails = { name, username };
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(userUpdatedDetails),
    };
    try {
      const response = await fetch(
        "http://localhost:3001/update-user-details",
        options,
      );
      if (response.status === 409) {
        const data = await response.json();
        showToast(data.message, "error");
        setEditStatus(status.failure);
        return;
      }
      if (response.ok) {
        const data = await response.json();
        const updatedData = {
          name: data.name,
          mail: data.mail,
          username: data.username,
        };
        setAdminDetails(updatedData);
        setEditStatus(status.initial);
        setCurrentStatus(status.success);
        showToast("Profile updated successfully", "success");
      } else {
        setEditStatus(status.failure);
      }
    } catch (error) {
      console.log(error);
      setEditStatus(status.failure);
    }
  };

  const renderFailureView = () => (
    <div className="ecoai-admin-profile-loading-failed-view-container">
      Failed to load
      <button
        className="ecoai-admin-profile-failed-logout-btn"
        onClick={() => setLogoutModalIsOpen(true)}
      >
        Logout
      </button>
    </div>
  );

  const renderLoadingView = () => (
    <div className="ecoai-admin-profile-loading-failed-view-container">
      <ClipLoader size={30} color={"#ffffff"} loading={true} />
    </div>
  );

  const clickedLogoutBtn = () => {
    setFadeOut(true);
    setTimeout(() => {
      Cookies.remove("admin_Token");
      navigate("/login");
    }, 400);
  };

  const renderSuccessView = () => (
    <div className="ecoai-admin-profile-container">
      <div className="ecoai-admin-profile-card">
        <h2 className="ecoai-admin-profile-title">Admin Profile</h2>
        <div className="ecoai-admin-profile-row">
          <span className="ecoai-admin-profile-label">Name:</span>
          <span className="ecoai-admin-profile-value">{adminDetails.name}</span>
        </div>
        <div className="ecoai-admin-profile-row">
          <span className="ecoai-admin-profile-label">Username:</span>
          <span className="ecoai-admin-profile-value">
            {adminDetails.username}
          </span>
        </div>
        <div className="ecoai-admin-profile-row">
          <span className="ecoai-admin-profile-label">Email:</span>
          <span className="ecoai-admin-profile-value">{adminDetails.mail}</span>
        </div>
        <button
          className="ecoai-admin-profile-logout-btn"
          onClick={() => setLogoutModalIsOpen(true)}
        >
          Logout
        </button>
        <button
          type="button"
          className="ecoai-admin-profile-edit-btn"
          onClick={clickedEditBtn}
        >
          {editStatus === status.loading ? (
            <ClipLoader size={15} color="#bdbbbb" />
          ) : (
            <FaRegEdit className="ecoai-admin-profile-edit-icon" />
          )}
        </button>
      </div>
    </div>
  );

  const renderSuccessEditView = () => (
    <form onSubmit={clickedSaveBtn} className="ecoai-admin-profile-container">
      <div className="ecoai-admin-profile-card">
        <h2 className="ecoai-admin-profile-title">Admin Profile</h2>
        <div className="ecoai-admin-profile-row">
          <span className="ecoai-admin-profile-label">Name:</span>
          <input
            className="ecoai-user-account-input-value"
            value={name ?? ""}
            onChange={(e) => changingName(e.target.value)}
            size={Math.max(name.length, 1)}
          />{" "}
        </div>
        <div className="ecoai-admin-profile-row">
          <span className="ecoai-admin-profile-label">Username:</span>
          <input
            className="ecoai-user-account-input-value"
            value={username ?? ""}
            onChange={(e) => changingUsername(e.target.value)}
            size={Math.max(username.length, 1)}
          />
        </div>
        <div className="ecoai-admin-profile-row">
          <span className="ecoai-admin-profile-label">Email:</span>
          <span className="ecoai-admin-profile-value">{adminDetails.mail}</span>
        </div>
        <button type="submit" className="ecoai-admin-profile-edit-btn">
          {editStatus === status.loading ? (
            <ClipLoader size={15} color="#bdbbbb" />
          ) : (
            <FaRegSave className="ecoai-admin-profile-edit-icon" />
          )}
        </button>
      </div>
    </form>
  );

  const renderFinalView = () => {
    switch (currentStatus) {
      case status.loading:
        return renderLoadingView();
      case status.success:
        return renderSuccessView();
      case status.successEdit:
        return renderSuccessEditView();
      case status.failure:
        return renderFailureView();
      default:
        return null;
    }
  };

  return (
    <>
      <Header />
      <div className="ecoai-admin-profile-bg-container">
        <AdminSidebar />
        <AdminBottombar />
        <div
          className={`ecoai-admin-profile-right-container ${
            fadeOut ? "fade-out" : "fade-in"
          }`}
        >
          {renderFinalView()}
          <Modal
            isOpen={logoutModalIsOpen}
            onRequestClose={() => setLogoutModalIsOpen(false)}
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
            <div className="ecoai-admin-profile-modal">
              <p className="ecoai-admin-profile-modal-heading">
                Are you sure you want to logout?
              </p>
              <div className="ecoai-admin-profile-model-btns-container">
                <button
                  type="button"
                  className="ecoai-admin-profile-model-btn user-account-green"
                  onClick={clickedLogoutBtn}
                >
                  Confirm
                </button>
                <button
                  type="button"
                  className="ecoai-admin-profile-model-btn user-account-grey"
                  onClick={() => setLogoutModalIsOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </Modal>
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

export default AdminProfile;
