import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import Modal from "react-modal";
import { ClipLoader } from "react-spinners";
import { IoClose } from "react-icons/io5";
import { FaSort } from "react-icons/fa";
import { FaSortUp } from "react-icons/fa";
import { FaSortDown } from "react-icons/fa";

import Header from "../Header";
import AdminSidebar from "../AdminSidebar";
import AdminBottombar from "../AdminBottombar";
import "./index.css";

Modal.setAppElement("#root");

const status = {
  initial: "INITIAL",
  loading: "LOADING",
  success: "SUCCESS",
  notFound: "NOT-FOUND",
  failure: "FAILURE",
};

const loadingArray = ["Adding", "Adding.", "Adding..", "Adding..."];

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [currentStatus, setCurrentStatus] = useState(status.loading);
  const [sortState, setSortState] = useState({
    sortBy: null,
    order: null,
  });
  const [formCurrentStatus, setFormCurrentStatus] = useState(status.initial);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [newUserName, changingNewUserName] = useState("");
  const [newUserMail, changingNewUserMail] = useState("");
  const [newUserPassword, changingNewUserPassword] = useState("");
  const [newUserJobType, changingNewUserJobType] = useState("SELECT");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "error",
  });
  const adminToken = Cookies.get("admin_Token");
  const navigate = useNavigate();

  useEffect(() => {
    const userTodayDetails = async () => {
      const options = {
        method: "GET",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      };
      try {
        const response = await fetch(
          "https://hr-backend-k3e7.onrender.com/users",
          options,
        );
        if (response.ok) {
          const data = await response.json();
          const updatedData = data.map((i) => ({
            name: i.name,
            username: i.username,
            jobType: i.job_type,
            mail: i.mail,
            id: i.id,
            createdTime: i.user_created_time,
          }));
          setUsers(updatedData);
          if (updatedData.length === 0) {
            setCurrentStatus(status.notFound);
          } else {
            setCurrentStatus(status.success);
          }
        } else {
          setCurrentStatus(status.failure);
        }
      } catch (error) {
        console.log(error);
        setCurrentStatus(status.failure);
      }
    };
    userTodayDetails();
  }, [adminToken, formCurrentStatus]);

  useEffect(() => {
    let intervalId;
    if (formCurrentStatus === status.loading) {
      intervalId = setInterval(() => {
        setLoadingTextIndex((prev) => (prev + 1) % loadingArray.length);
      }, 500);
    }
    return () => clearInterval(intervalId);
  }, [formCurrentStatus]);

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type });
    }, 2500);
  };

  const sortingUsers = async (e) => {
    setCurrentStatus(status.loading);
    const options = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    };
    const query1 = e.currentTarget.dataset.name;
    let query2;
    if (sortState.sortBy !== query1) {
      setSortState({ sortBy: query1, order: "asc" });
      query2 = "asc";
    } else {
      let nextOrder;
      if (sortState.order === "asc") nextOrder = "desc";
      else if (sortState.order === "desc") nextOrder = null;
      else nextOrder = "asc";
      query2 = nextOrder;
      setSortState({ sortBy: query1, order: nextOrder });
    }
    try {
      const response = await fetch(
        `https://hr-backend-k3e7.onrender.com/sort-users?sort=${query1}&order=${query2}`,
        options,
      );
      if (response.ok) {
        const data = await response.json();
        const updatedData = data.map((i) => ({
          name: i.name,
          username: i.username,
          jobType: i.job_type,
          mail: i.mail,
          id: i.id,
          createdTime: i.user_created_time,
        }));
        setUsers(updatedData);
        setCurrentStatus(status.success);
      } else {
        setCurrentStatus(status.failure);
      }
    } catch (error) {
      console.log(error);
      setCurrentStatus(status.failure);
    }
  };

  const renderFailureView = () => (
    <div className="ecoai-admin-users-failure-view-container">
      Failed to load
    </div>
  );

  const renderNotFoundView = () => (
    <div className="ecoai-admin-users-not-found-view-container">
      No users found
    </div>
  );

  const renderLoadingView = () => (
    <div className="ecoai-admin-users-loading-view-container">
      <ClipLoader size={30} color={"#ffffff"} loading={true} />
    </div>
  );

  const submittingAddUserModalForm = async (e) => {
    e.preventDefault();
    if (newUserJobType === "SELECT") {
      showToast("Select employee job type", "error");
      return;
    }
    if (newUserPassword.length < 6) {
      showToast("Password must be greater than 6 digits", "error");
      return;
    }
    setFormCurrentStatus(status.loading);
    const newUserDetails = {
      newUserName,
      newUserMail,
      newUserPassword,
      newUserJobType,
    };
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(newUserDetails),
    };
    try {
      const response = await fetch(
        "https://hr-backend-k3e7.onrender.com/add-user",
        options,
      );
      if (response.ok) {
        const data = await response.json();
        setFormCurrentStatus(status.success);
        changingNewUserJobType("SELECT");
        changingNewUserMail("");
        changingNewUserName("");
        changingNewUserPassword("");
        showToast(data.message, "success");
        setModalIsOpen(false);
      } else {
        const data = await response.json();
        setFormCurrentStatus(status.failure);
        showToast(data.message, "error");
      }
    } catch (error) {
      setFormCurrentStatus(status.failure);
      showToast("Server Error", "error");
    }
  };

  const renderSuccessView = () => (
    <>
      {users.map((i) => (
        <li
          key={i.id}
          className="ecoai-admin-users-item"
          onClick={() => navigate(`/users-calendar/${i.id}`)}
        >
          <span className="ecoai-admin-users-name">
            {i.name ? i.name : "--"}
          </span>
          <span className="ecoai-admin-users-username">
            {i.username ? i.username : "--"}
          </span>
          <span className="ecoai-admin-users-email">
            {i.mail ? i.mail : "--"}
          </span>
          <span className="ecoai-admin-users-job-type">
            {i.jobType ? i.jobType : "--"}
          </span>
          <span className="ecoai-admin-users-created-time">
            {i.createdTime
              ? new Date(i.createdTime).toLocaleDateString("en-IN", {
                  timeZone: "UTC",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "--"}
          </span>
        </li>
      ))}
    </>
  );

  const sortingIcon = (columnName) => {
    if (sortState.sortBy !== columnName) {
      return <FaSort className="ecoai-admin-users-icon" />;
    }
    switch (sortState.order) {
      case "asc":
        return <FaSortUp className="ecoai-admin-users-icon up-icon" />;
      case "desc":
        return <FaSortDown className="ecoai-admin-users-icon down-icon" />;
      default:
        return <FaSort className="ecoai-admin-users-icon" />;
    }
  };

  const renderFinalView = () => {
    switch (currentStatus) {
      case status.loading:
        return renderLoadingView();
      case status.success:
        return renderSuccessView();
      case status.notFound:
        return renderNotFoundView();
      case status.failure:
        return renderFailureView();
      default:
        return null;
    }
  };

  return (
    <>
      <Header />
      <div className="ecoai-admin-users-bg-container">
        <AdminSidebar />
        <AdminBottombar />
        <div className="ecoai-admin-users-right-container">
          <div className="ecoai-admin-users-container">
            <h1 className="ecoai-admin-users-heading">Users</h1>
            <button
              type="button"
              className="ecoai-admin-users-add-new-employee-btn"
              onClick={() => {
                setModalIsOpen(true);
                setFormCurrentStatus(status.initial);
              }}
            >
              Add New Employee
            </button>
            <Modal
              isOpen={modalIsOpen}
              onRequestClose={() => setModalIsOpen(false)}
              contentLabel="Add User Modal"
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
              <button
                type="button"
                className="ecoai-admin-users-modal-close-icon-btn"
                onClick={() => setModalIsOpen(false)}
              >
                <IoClose className="ecoai-admin-users-modal-close-icon" />
              </button>
              <form
                onSubmit={submittingAddUserModalForm}
                className="ecoai-admin-users-modal-form"
              >
                <h4 className="ecoai-admin-users-modal-heading">
                  Employee Details
                </h4>
                <div className="ecoai-admin-users-modal-inps-select-container">
                  <div className="ecoai-admin-users-modal-name-container">
                    <input
                      type="text"
                      placeholder=" "
                      id="ecoai-admin-users-modal-name-inp"
                      className="ecoai-admin-users-modal-name-inp"
                      value={newUserName}
                      onChange={(e) => {
                        changingNewUserName(e.target.value);
                      }}
                    />
                    <label
                      className="ecoai-admin-users-modal-name-label"
                      htmlFor="ecoai-admin-users-modal-name-inp"
                    >
                      Enter employee name
                    </label>
                  </div>
                  <div className="ecoai-admin-users-modal-email-container">
                    <input
                      type="email"
                      placeholder=" "
                      id="ecoai-admin-users-modal-email-inp"
                      className="ecoai-admin-users-modal-email-inp"
                      value={newUserMail}
                      onChange={(e) => {
                        changingNewUserMail(e.target.value);
                      }}
                    />
                    <label
                      className="ecoai-admin-users-modal-email-label"
                      htmlFor="ecoai-admin-users-modal-email-inp"
                    >
                      Enter employee email
                    </label>
                  </div>
                  <div className="ecoai-admin-users-modal-password-container">
                    <input
                      type="password"
                      placeholder=" "
                      id="ecoai-admin-users-modal-password-inp"
                      className="ecoai-admin-users-modal-password-inp"
                      value={newUserPassword}
                      onChange={(e) => {
                        changingNewUserPassword(e.target.value);
                      }}
                    />
                    <label
                      className="ecoai-admin-users-modal-password-label"
                      htmlFor="ecoai-admin-users-modal-password-inp"
                    >
                      Set password
                    </label>
                  </div>
                  <div className="ecoai-admin-users-modal-select-add-btn-container">
                    <select
                      value={newUserJobType}
                      onChange={(e) => changingNewUserJobType(e.target.value)}
                      className="ecoai-admin-users-modal-select-container"
                    >
                      <option
                        className="ecoai-admin-users-modal-select-option"
                        key="ecoai-select"
                        value={"SELECT"}
                      >
                        Select
                      </option>
                      <option
                        className="ecoai-admin-users-modal-select-option"
                        key="ecoai-intern"
                        value={"INTERN"}
                      >
                        Intern
                      </option>
                      <option
                        className="ecoai-admin-users-modal-select-option"
                        value={"FULL_TIME"}
                        key="ecoai-full-time"
                      >
                        Full Time
                      </option>
                    </select>
                    <button
                      type="submit"
                      className="ecoai-admin-users-modal-add-btn"
                      disabled={
                        !newUserMail || formCurrentStatus === status.loading
                      }
                    >
                      {formCurrentStatus === status.loading
                        ? loadingArray[loadingTextIndex]
                        : "Add"}
                    </button>
                  </div>
                </div>
              </form>
            </Modal>
            <div className="ecoai-admin-users-list-container">
              <ul className="ecoai-admin-users-list">
                <li
                  key="ecoai-users-heading-row"
                  className="ecoai-admin-users-heading-item"
                >
                  <div className="ecoai-admin-users-name">
                    <button
                      className="ecoai-admin-users-sorting-btn"
                      data-name="name"
                      onClick={sortingUsers}
                      disabled={currentStatus !== status.success}
                    >
                      Name
                      {sortingIcon("name")}
                    </button>
                  </div>
                  <div className="ecoai-admin-users-username">
                    <button
                      className="ecoai-admin-users-sorting-btn"
                      data-name="username"
                      onClick={sortingUsers}
                      disabled={currentStatus !== status.success}
                    >
                      Username
                      {sortingIcon("username")}
                    </button>
                  </div>
                  <div className="ecoai-admin-users-email">
                    <button
                      className="ecoai-admin-users-sorting-btn"
                      data-name="mail"
                      onClick={sortingUsers}
                      disabled={currentStatus !== status.success}
                    >
                      Email
                      {sortingIcon("mail")}
                    </button>
                  </div>
                  <div className="ecoai-admin-users-job-type">
                    <button
                      className="ecoai-admin-users-sorting-btn"
                      data-name="job_type"
                      onClick={sortingUsers}
                      disabled={currentStatus !== status.success}
                    >
                      Job Type
                      {sortingIcon("job_type")}
                    </button>
                  </div>
                  <div className="ecoai-admin-users-created-time">
                    <button
                      className="ecoai-admin-users-sorting-btn"
                      data-name="user_created_time"
                      onClick={sortingUsers}
                      disabled={currentStatus !== status.success}
                    >
                      Created at
                      {sortingIcon("user_created_time")}
                    </button>
                  </div>
                </li>
                {renderFinalView()}
              </ul>
            </div>
          </div>
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

export default AdminUsers;
