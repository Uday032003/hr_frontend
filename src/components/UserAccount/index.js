import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import Modal from "react-modal";
import { ClipLoader } from "react-spinners";
import { FaRegEdit } from "react-icons/fa";
import { FaRegSave } from "react-icons/fa";

import Header from "../Header";
import UserSidebar from "../UserSidebar";
import UserBottombar from "../UserBottombar";
import "./index.css";

const status = {
  initial: "INITIAL",
  loading: "LOADING",
  success: "SUCCESS",
  successEdit: "SUCCESSEDIT",
  failure: "FAILURE",
};

const UserAccount = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [currentStatus, setCurrentStatus] = useState(status.loading);
  const [editStatus, setEditStatus] = useState(status.initial);
  const [logoutModalIsOpen, setLogoutModalIsOpen] = useState(false);
  const [name, changingName] = useState("");
  const [username, changingUsername] = useState("");
  const [fadeOut, setFadeOut] = useState(false);
  const jwtToken = Cookies.get("jwt_Token");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "error",
  });
  const navigate = useNavigate();

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
          "https://hr-backend-k3e7.onrender.com/user-details",
          options,
        );
        if (response.ok) {
          const data = await response.json();
          const updatedData = {
            name: data.name,
            mail: data.mail,
            username: data.username,
            jobType: data.job_type,
          };
          setUserDetails(updatedData);
          setCurrentStatus(status.success);
        } else {
          setCurrentStatus(status.failure);
        }
      } catch (error) {
        console.log(error);
        setCurrentStatus(status.failure);
      }
    };
    userDetails();
  }, [jwtToken]);

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type });
    }, 2500);
  };

  const clickedLogoutBtn = () => {
    setFadeOut(true);
    setTimeout(() => {
      Cookies.remove("jwt_Token");
      navigate("/login");
    }, 400);
  };

  const clickedEditBtn = async () => {
    setEditStatus(status.loading);
    const options = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    };
    try {
      const response = await fetch(
        "https://hr-backend-k3e7.onrender.com/user-details",
        options,
      );
      if (response.ok) {
        const data = await response.json();
        const updatedData = {
          name: data.name,
          mail: data.mail,
          username: data.username,
          jobType: data.job_type,
        };
        changingName(updatedData.name || "");
        changingUsername(updatedData.username || "");
        setUserDetails(updatedData);
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
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify(userUpdatedDetails),
    };
    try {
      const response = await fetch(
        "https://hr-backend-k3e7.onrender.com/update-user-details",
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
          jobType: data.job_type,
        };
        setUserDetails(updatedData);
        setEditStatus(status.initial);
        setCurrentStatus(status.success);
        showToast("Profile updated successfully", "success");
      } else {
        const data = await response.json();
        setEditStatus(status.failure);
        showToast(data.message, "error");
      }
    } catch (error) {
      console.log(error);
      setEditStatus(status.failure);
    }
  };

  const renderFailureView = () => (
    <div className="ecoai-user-account-loading-failed-view-container">
      Failed to load
      <button
        className="ecoai-user-account-failed-logout-btn"
        onClick={() => setLogoutModalIsOpen(true)}
      >
        Logout
      </button>
    </div>
  );

  const renderLoadingView = () => (
    <div className="ecoai-user-account-loading-failed-view-container">
      <ClipLoader size={30} color={"#ffffff"} loading={true} />
    </div>
  );

  const renderSuccessView = () => (
    <div className="ecoai-user-account-container">
      <div className="ecoai-user-account-card">
        <h2 className="ecoai-user-account-title">User Account</h2>
        <div className="ecoai-user-account-row">
          <span className="ecoai-user-account-label">Name:</span>
          <span className="ecoai-user-account-value">{userDetails.name}</span>
        </div>
        <div className="ecoai-user-account-row">
          <span className="ecoai-user-account-label">Username:</span>
          <span className="ecoai-user-account-value">
            {userDetails.username}
          </span>
        </div>
        <div className="ecoai-user-account-row">
          <span className="ecoai-user-account-label">Job Type:</span>
          <span className="ecoai-user-account-value">
            {userDetails.jobType}
          </span>
        </div>
        <div className="ecoai-user-account-row">
          <span className="ecoai-user-account-label">Email:</span>
          <span className="ecoai-user-account-value">{userDetails.mail}</span>
        </div>
        <button
          className="ecoai-user-account-logout-btn"
          onClick={() => setLogoutModalIsOpen(true)}
        >
          Logout
        </button>
        <button
          type="button"
          className="ecoai-user-account-edit-btn"
          onClick={clickedEditBtn}
        >
          {editStatus === status.loading ? (
            <ClipLoader size={15} color="#bdbbbb" />
          ) : (
            <FaRegEdit className="ecoai-user-account-edit-icon" />
          )}
        </button>
      </div>
    </div>
  );

  const renderSuccessEditView = () => (
    <form onSubmit={clickedSaveBtn} className="ecoai-user-account-container">
      <div className="ecoai-user-account-card">
        <h2 className="ecoai-user-account-title">User Account</h2>
        <div className="ecoai-user-account-row">
          <span className="ecoai-user-account-label">Name:</span>
          <input
            className="ecoai-user-account-input-value"
            value={name ?? ""}
            onChange={(e) => changingName(e.target.value)}
            size={name ? Math.max(name.length, 1) : 5}
          />
        </div>
        <div className="ecoai-user-account-row-special">
          <span className="ecoai-user-account-label">Username:</span>
          <input
            className="ecoai-user-account-input-value"
            value={username ?? ""}
            onChange={(e) => changingUsername(e.target.value)}
            size={username ? Math.max(username.length, 1) : 5}
          />
        </div>
        <div className="ecoai-user-account-row">
          <span className="ecoai-user-account-label">Job Type:</span>
          <span className="ecoai-user-account-value">
            {userDetails.jobType}
          </span>
        </div>
        <div className="ecoai-user-account-row">
          <span className="ecoai-user-account-label">Email:</span>
          <span className="ecoai-user-account-value">{userDetails.mail}</span>
        </div>
        <button type="submit" className="ecoai-user-account-edit-btn">
          {editStatus === status.loading ? (
            <ClipLoader size={15} color="#bdbbbb" />
          ) : (
            <FaRegSave className="ecoai-user-account-edit-icon" />
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
      <div className="ecoai-user-account-bg-container">
        <UserSidebar />
        <UserBottombar />
        <div
          className={`ecoai-user-account-right-container ${
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
            <div className="ecoai-user-account-modal">
              <p className="ecoai-user-account-modal-heading">
                Are you sure you want to logout?
              </p>
              <div className="ecoai-user-account-model-btns-container">
                <button
                  type="button"
                  className="ecoai-user-account-model-btn user-account-green"
                  onClick={clickedLogoutBtn}
                >
                  Confirm
                </button>
                <button
                  type="button"
                  className="ecoai-user-account-model-btn user-account-grey"
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

export default UserAccount;
