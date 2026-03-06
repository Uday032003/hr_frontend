import { useState, useRef } from "react";
import Cookies from "js-cookie";
import Modal from "react-modal";
import { ClipLoader } from "react-spinners";
import { BiImport } from "react-icons/bi";
import { BiExport } from "react-icons/bi";
import { IoClose } from "react-icons/io5";
import { MdDelete } from "react-icons/md";

import Header from "../Header";
import AdminSidebar from "../AdminSidebar";
import AdminBottombar from "../AdminBottombar";
import "./index.css";

const AdminDataManager = () => {
  const [tableName, setTableName] = useState("Select");
  const [importModalIsOpen, setImportModalIsOpen] = useState(false);
  const [exportModalIsOpen, setExportModalIsOpen] = useState(false);
  const [secretCodeModalIsOpen, setSecretCodeModalIsOpen] = useState(false);
  const [exportBtnLoading, setExportBtnLoading] = useState(false);
  const [secretCode, changeSecretCode] = useState("");
  const [radioBtnSelected, setRadioBtnSelected] = useState("users");
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredSelectedFile, setHoveredSelectedFile] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [secretCodeBtnClicked, setSecretCodeBtnClicked] = useState(false);
  const adminToken = Cookies.get("admin_Token");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "error",
  });
  const fileInputRef = useRef(null);

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type });
    }, 2500);
  };

  const clickedDownloadBtn = async (e) => {
    e.preventDefault();
    setExportBtnLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3001/download?table=${tableName}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        },
      );
      if (!response.ok) {
        const data = await response.json();
        showToast(data.message, "error");
        return;
      }
      setExportBtnLoading(false);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${tableName}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setExportBtnLoading(false);
      console.error("Download error:", error.message);
      showToast("Download Failed", "error");
    }
  };

  const uploadCSV = async (e) => {
    e.preventDefault();
    if (!file) {
      showToast("Please select a file first", "error");
      return;
    }
    if (!secretCode) {
      showToast("Enter secret code", "error");
      return;
    }
    setImportLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("secretCode", secretCode);
      const response = await fetch(
        `http://localhost:3001/import-${radioBtnSelected}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
          body: formData,
        },
      );
      if (!response.ok) {
        const errorData = await response.json();
        showToast(errorData.message || "Import failed", "error");
        changeSecretCode("");
        setImportLoading(false);
        return;
      }
      if (response.ok) {
        setSecretCodeModalIsOpen(false);
        setImportModalIsOpen(false);
        setRadioBtnSelected("users");
        setImportLoading(false);
        setFile(null);
        changeSecretCode("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
      showToast("Import successful", "success");
    } catch (error) {
      changeSecretCode("");
      setImportLoading(false);
      console.error(error);
      showToast("Something went wrong", "error");
    }
  };

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.name.endsWith(".csv")) {
      showToast("Only CSV files allowed", "error");
      return;
    }
    showToast("File selected", "success");
    setFile(selectedFile);
    setSecretCodeBtnClicked(true);
  };

  const selectedView = () => {
    if (radioBtnSelected === "users") {
      return (
        <div
          className={`ecoai-admin-data-manager-modal-user-drag-zone-cont ${
            file ? "success" : ""
          } ${isDragging ? "dragging" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const droppedFile = e.dataTransfer.files[0];
            handleFile(droppedFile);
          }}
          onClick={() => document.getElementById("ecoai-file-input").click()}
        >
          <input
            ref={fileInputRef}
            id="ecoai-file-input"
            type="file"
            accept=".csv"
            className="ecoai-admin-data-manager-modal-inp"
            onChange={(e) => handleFile(e.target.files[0])}
          />
          <p className="ecoai-admin-data-manager-modal-upload-text">
            {file ? (
              "File Selected Successfully ✅"
            ) : (
              <>
                Drag & Drop{" "}
                <span className="ecoai-admin-data-manager-modal-highlight-text">
                  users
                </span>{" "}
                CSV here or Click to Upload
              </>
            )}
          </p>
          {file && (
            <div
              className="ecoai-admin-data-manager-modal-file-info"
              onMouseEnter={() => setHoveredSelectedFile(true)}
              onMouseLeave={() => setHoveredSelectedFile(false)}
            >
              <span>{file.name}</span>
              <span>{(file.size / 1024).toFixed(2)} KB</span>
              <button
                type="button"
                className={`ecoai-admin-data-manager-modal-file-remove-btn ${hoveredSelectedFile ? "ecoai-admin-data-manager-hovered" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                  setSecretCodeBtnClicked(false);
                  showToast("File Removed", "error");
                }}
              >
                <MdDelete className="ecoai-admin-data-manager-modal-file-remove-icon" />
              </button>
            </div>
          )}
        </div>
      );
    } else if (radioBtnSelected === "attendance") {
      return (
        <div
          className={`ecoai-admin-data-manager-modal-user-drag-zone-cont ${
            file ? "success" : ""
          } ${isDragging ? "dragging" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const droppedFile = e.dataTransfer.files[0];
            handleFile(droppedFile);
          }}
          onClick={() => document.getElementById("ecoai-file-input").click()}
        >
          <input
            ref={fileInputRef}
            id="ecoai-file-input"
            type="file"
            accept=".csv"
            className="ecoai-admin-data-manager-modal-inp"
            onChange={(e) => handleFile(e.target.files[0])}
          />
          <p className="ecoai-admin-data-manager-modal-upload-text">
            {file ? (
              "File Selected Successfully ✅"
            ) : (
              <>
                Drag & Drop{" "}
                <span className="ecoai-admin-data-manager-modal-highlight-text">
                  attendance
                </span>{" "}
                CSV here or Click to Upload
              </>
            )}
          </p>
          {file && (
            <div
              className="ecoai-admin-data-manager-modal-file-info"
              onMouseEnter={() => setHoveredSelectedFile(true)}
              onMouseLeave={() => setHoveredSelectedFile(false)}
            >
              <span>{file.name}</span>
              <span>{(file.size / 1024).toFixed(2)} KB</span>
              <button
                type="button"
                className={`ecoai-admin-data-manager-modal-file-remove-btn ${hoveredSelectedFile ? "ecoai-admin-data-manager-hovered" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                  setSecretCodeBtnClicked(false);
                  showToast("File Removed", "error");
                }}
              >
                <MdDelete className="ecoai-admin-data-manager-modal-file-remove-icon" />
              </button>
            </div>
          )}
        </div>
      );
    } else if (radioBtnSelected === "tasks") {
      return (
        <div
          className={`ecoai-admin-data-manager-modal-user-drag-zone-cont ${
            file ? "success" : ""
          } ${isDragging ? "dragging" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const droppedFile = e.dataTransfer.files[0];
            handleFile(droppedFile);
          }}
          onClick={() => document.getElementById("ecoai-file-input").click()}
        >
          <input
            ref={fileInputRef}
            id="ecoai-file-input"
            type="file"
            accept=".csv"
            className="ecoai-admin-data-manager-modal-inp"
            onChange={(e) => handleFile(e.target.files[0])}
          />
          <p className="ecoai-admin-data-manager-modal-upload-text">
            {file ? (
              "File Selected Successfully ✅"
            ) : (
              <>
                Drag & Drop{" "}
                <span className="ecoai-admin-data-manager-modal-highlight-text">
                  tasks
                </span>{" "}
                CSV here or Click to Upload
              </>
            )}
          </p>
          {file && (
            <div
              className="ecoai-admin-data-manager-modal-file-info"
              onMouseEnter={() => setHoveredSelectedFile(true)}
              onMouseLeave={() => setHoveredSelectedFile(false)}
            >
              <span>{file.name}</span>
              <span>{(file.size / 1024).toFixed(2)} KB</span>
              <button
                type="button"
                className={`ecoai-admin-data-manager-modal-file-remove-btn ${hoveredSelectedFile ? "ecoai-admin-data-manager-hovered" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                  setSecretCodeBtnClicked(false);
                  showToast("File Removed", "error");
                }}
              >
                <MdDelete className="ecoai-admin-data-manager-modal-file-remove-icon" />
              </button>
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <>
      <Header />
      <div className="ecoai-admin-data-manager-bg-container">
        <AdminSidebar />
        <AdminBottombar />
        <div className="ecoai-admin-data-manager-right-container">
          <h1 className="ecoai-admin-data-manager-title">Data Manager</h1>
          <div className="ecoai-admin-data-manager-btns-container">
            <div className="ecoai-admin-data-manager-btn-cont">
              <button
                type="button"
                className="ecoai-admin-data-manager-btn"
                onClick={() => setImportModalIsOpen(true)}
              >
                <BiImport />
                Import
              </button>
            </div>
            <div className="ecoai-admin-data-manager-btn-cont">
              <button
                type="button"
                className="ecoai-admin-data-manager-btn"
                onClick={() => setExportModalIsOpen(true)}
              >
                <BiExport />
                Export
              </button>
            </div>
          </div>
          <Modal
            isOpen={importModalIsOpen}
            onRequestClose={() => {}}
            shouldCloseOnOverlayClick={false}
            shouldCloseOnEsc={false}
            contentLabel="Import Modal"
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
              className="ecoai-admin-data-manager-modal-close-icon-btn"
              onClick={() => {
                setImportModalIsOpen(false);
                setRadioBtnSelected("users");
                setFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
            >
              <IoClose className="ecoai-admin-data-manager-modal-close-icon" />
            </button>
            <form className="ecoai-admin-data-manager-modal-form">
              <h4 className="ecoai-admin-data-manager-modal-heading">
                Import Tables
              </h4>
              <div className="ecoai-admin-data-manager-modal-radio-boxs-inp-container">
                <div className="ecoai-admin-data-manager-modal-radio-boxs-container">
                  <div className="ecoai-admin-data-manager-modal-radio-box">
                    <input
                      type="radio"
                      value="users"
                      name="table"
                      checked={radioBtnSelected === "users"}
                      id="ecoai-admin-data-manager-modal-user"
                      className="ecoai-admin-data-manager-modal-radio"
                      onChange={(e) => {
                        setRadioBtnSelected(e.target.value);
                        setFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                        setSecretCodeBtnClicked(false);
                      }}
                    />
                    <label
                      htmlFor="ecoai-admin-data-manager-modal-user"
                      className="ecoai-admin-data-manager-modal-radio-label"
                    >
                      Users
                    </label>
                  </div>
                  <div className="ecoai-admin-data-manager-modal-radio-box">
                    <input
                      type="radio"
                      value="attendance"
                      name="table"
                      checked={radioBtnSelected === "attendance"}
                      id="ecoai-admin-data-manager-modal-attendance"
                      className="ecoai-admin-data-manager-modal-radio"
                      onChange={(e) => {
                        setRadioBtnSelected(e.target.value);
                        setFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                        setSecretCodeBtnClicked(false);
                      }}
                    />
                    <label
                      htmlFor="ecoai-admin-data-manager-modal-attendance"
                      className="ecoai-admin-data-manager-modal-radio-label"
                    >
                      Attendance
                    </label>
                  </div>
                  <div className="ecoai-admin-data-manager-modal-radio-box">
                    <input
                      type="radio"
                      value="tasks"
                      name="table"
                      checked={radioBtnSelected === "tasks"}
                      id="ecoai-admin-data-manager-modal-tasks"
                      className="ecoai-admin-data-manager-modal-radio"
                      onChange={(e) => {
                        setRadioBtnSelected(e.target.value);
                        setFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                        setSecretCodeBtnClicked(false);
                      }}
                    />
                    <label
                      htmlFor="ecoai-admin-data-manager-modal-tasks"
                      className="ecoai-admin-data-manager-modal-radio-label"
                    >
                      Tasks
                    </label>
                  </div>
                </div>
                <div className="ecoai-admin-data-manager-modal-inp-container">
                  {selectedView()}
                </div>
                {secretCodeBtnClicked && (
                  <div className="ecoai-admin-data-manager-modal-secret-code-btn-container">
                    <button
                      type="button"
                      className="ecoai-admin-data-manager-modal-secret-code-btn"
                      onClick={() => {
                        setSecretCodeModalIsOpen(true);
                        setSecretCodeBtnClicked(false);
                      }}
                    >
                      Enter Secret Code
                    </button>
                  </div>
                )}
                <span className="ecoai-admin-data-manager-modal-description">
                  ⚠ Please import Users → then Attendance → then Tasks
                </span>
              </div>
            </form>
          </Modal>
          <Modal
            isOpen={exportModalIsOpen}
            onRequestClose={() => {}}
            shouldCloseOnOverlayClick={false}
            shouldCloseOnEsc={false}
            contentLabel="Export Modal"
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
              className="ecoai-admin-data-manager-modal-close-icon-btn"
              onClick={() => {
                setExportModalIsOpen(false);
                setTableName("Select");
              }}
            >
              <IoClose className="ecoai-admin-data-manager-modal-close-icon" />
            </button>
            <form
              onSubmit={clickedDownloadBtn}
              className="ecoai-admin-data-manager-modal-form"
            >
              <h4 className="ecoai-admin-data-manager-modal-heading">
                Export Tables
              </h4>
              <div className="ecoai-admin-data-manager-modal-inps-select-container">
                <div className="ecoai-admin-data-manager-modal-select-add-btn-container">
                  <select
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    className="ecoai-admin-data-manager-modal-select-container"
                  >
                    <option
                      className="ecoai-admin-data-manager-modal-select-option"
                      key="ecoai-table-select"
                      value={"Select"}
                    >
                      Select
                    </option>
                    <option
                      className="ecoai-admin-data-manager-modal-select-option"
                      key="ecoai-users"
                      value={"users"}
                    >
                      Users
                    </option>
                    <option
                      className="ecoai-admin-data-manager-modal-select-option"
                      value={"attendance"}
                      key="ecoai-attendance"
                    >
                      Attendance
                    </option>
                    <option
                      className="ecoai-admin-data-manager-modal-select-option"
                      value={"attendance_tasks"}
                      key="ecoai-attendance_tasks"
                    >
                      Tasks
                    </option>
                  </select>
                  <button
                    type="submit"
                    className="ecoai-admin-data-manager-modal-add-btn"
                    disabled={tableName === "Select"}
                    style={{
                      cursor:
                        tableName === "Select" ? "not-allowed" : "pointer",
                      opacity: tableName === "Select" ? 0.7 : 1,
                    }}
                  >
                    {exportBtnLoading ? (
                      <ClipLoader color="#bdbbbb" size={14} />
                    ) : (
                      <>
                        {tableName === "Select" ? (
                          "Select Table"
                        ) : (
                          <>
                            Download <br />
                            {tableName} Table
                          </>
                        )}
                      </>
                    )}
                    <span className="ecoai-admin-data-manager-modal-add-btn-absolute">
                      *csv file
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </Modal>
          <Modal
            isOpen={secretCodeModalIsOpen}
            onRequestClose={() => {}}
            shouldCloseOnOverlayClick={false}
            shouldCloseOnEsc={false}
            contentLabel="Secret Code Modal"
            style={{
              overlay: {
                backgroundColor: "rgba(0, 0, 0, 0.9)",
              },
              content: {
                top: "auto",
                left: "auto",
                right: "20px",
                bottom: "50px",
                padding: "20px",
                paddingTop: "0",
                borderRadius: "8px",
                backgroundColor: "rgb(20, 20, 20)",
                border: "1px solid rgb(43, 42, 42)",
                color: "#bdbbbb",
              },
            }}
          >
            <form
              onSubmit={uploadCSV}
              className="ecoai-admin-data-manager-modal-secret-code-form"
            >
              <label
                htmlFor="ecoai-admin-data-manager-modal-heading-secret-code-label"
                className="ecoai-admin-data-manager-modal-secret-code-heading"
              >
                To import enter secret code in the box below
              </label>
              <input
                value={secretCode}
                id="ecoai-admin-data-manager-modal-heading-secret-code-label"
                type="password"
                placeholder="Enter here"
                className="ecoai-admin-data-manager-modal-secret-code-input"
                onChange={(e) => changeSecretCode(e.target.value)}
              />
              <div className="ecoai-admin-data-manager-model-btns-secret-code-container">
                <button
                  type="button"
                  className="ecoai-admin-data-manager-model-secret-code-btn cancel"
                  onClick={() => {
                    setSecretCodeModalIsOpen(false);
                    setSecretCodeBtnClicked(true);
                    changeSecretCode("");
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ecoai-admin-data-manager-model-secret-code-btn import"
                  style={{
                    opacity: `${importLoading ? "0.6" : "1"}`,
                    cursor: `${importLoading ? "not-allowed" : "pointer"}`,
                  }}
                  disabled={importLoading}
                >
                  {importLoading ? (
                    <ClipLoader size={12} color="#ffffff" />
                  ) : (
                    "Import"
                  )}
                </button>
              </div>
            </form>
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

export default AdminDataManager;
