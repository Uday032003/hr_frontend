import { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { ClipLoader } from "react-spinners";
import { TbHttpDelete } from "react-icons/tb";

import Header from "../Header";
import UserSidebar from "../UserSidebar";
import UserBottombar from "../UserBottombar";
import "./index.css";

const status = {
  initial: "INITIAL",
  loading: "LOADING",
  success: "SUCCESS",
  failure: "FAILURE",
};

const Tasks = () => {
  const [userTasks, setUserTasks] = useState([]);
  const [newTask, changeNewTask] = useState("");
  const [currentStatus, setCurrentStatus] = useState(status.loading);
  const [taskAddedStatus, setTaskAddedStatus] = useState(status.initial);
  const [showDeleteBtnIndex, setShowDeleteBtnIndex] = useState(null);
  const [deletingTaskId, setDeletingTaskId] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "error",
  });
  const jwtToken = Cookies.get("jwt_Token");
  const textareaRef = useRef(null);
  const tasksListRef = useRef(null);

  useEffect(() => {
    if (tasksListRef.current) {
      tasksListRef.current.scrollTo({
        top: tasksListRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [userTasks]);

  useEffect(() => {
    const fetchTasks = async () => {
      const options = {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      };
      try {
        const response = await fetch(
          "https://hr-backend-k3e7.onrender.com/fetch-today-tasks",
          options,
        );
        if (response.ok) {
          const data = await response.json();
          setUserTasks(data.tasks);
          setCurrentStatus(status.success);
        } else {
          setCurrentStatus(status.failure);
        }
      } catch (error) {
        console.log(error);
        setCurrentStatus(status.failure);
      }
    };
    fetchTasks();
  }, [jwtToken]);

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type });
    }, 2500);
  };

  const clickedAddTask = async (event) => {
    event.preventDefault();
    setTaskAddedStatus(status.loading);
    const taskDetails = {
      task: newTask,
    };
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify(taskDetails),
    };
    try {
      const response = await fetch(
        "https://hr-backend-k3e7.onrender.com/add-task",
        options,
      );
      if (response.ok) {
        const data = await response.json();
        setUserTasks(data.tasks);
        changeNewTask("");
        setTaskAddedStatus(status.success);
      } else {
        const data = await response.json();
        showToast(data.message, "error");
        setTaskAddedStatus(status.failure);
      }
    } catch (error) {
      console.log(error);
      setTaskAddedStatus(status.failure);
    }
  };

  const clickedDeleteTask = async (taskid) => {
    setDeletingTaskId(taskid);
    const taskDetails = { taskid };
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify(taskDetails),
    };
    try {
      const response = await fetch(
        "https://hr-backend-k3e7.onrender.com/delete-task",
        options,
      );
      if (response.ok) {
        const data = await response.json();
        setUserTasks(data.tasks);
        setDeletingTaskId(null);
      } else {
        setDeletingTaskId(null);
      }
    } catch (error) {
      console.log(error);
      setDeletingTaskId(null);
    }
  };

  return (
    <>
      <Header />
      <div className="ecoai-user-tasks-bg-container">
        <UserSidebar />
        <UserBottombar />
        <div className="ecoai-user-tasks-right-container">
          <h1 className="ecoai-user-tasks-heading">Today's Tasks</h1>
          <form
            onSubmit={clickedAddTask}
            className="ecoai-user-tasks-add-task-btn-container"
          >
            {currentStatus === status.loading ? (
              <div className="ecoai-user-tasks-loader-container">
                <div className="ecoai-user-tasks-loader-inner-cont">
                  <ClipLoader color="#bdbbbb" size={20} />
                </div>
              </div>
            ) : (
              <div className="ecoai-user-tasks-task-container">
                <ul className="ecoai-user-tasks-list" ref={tasksListRef}>
                  {userTasks.map((item, index) => (
                    <li
                      key={item.taskid}
                      className="ecoai-user-tasks-list-item"
                      onMouseEnter={() => setShowDeleteBtnIndex(index)}
                      onMouseLeave={() => setShowDeleteBtnIndex(null)}
                    >
                      <span className="ecoai-user-tasks-list-item-span">
                        {`${index + 1}. ${item.task}`}
                      </span>
                      <hr className="ecoai-user-tasks-list-item-divider" />
                      <button
                        type="button"
                        className={`ecoai-user-tasks-delete-btn ${showDeleteBtnIndex === index && "ecoai-user-tasks-delete-btn-display"}`}
                        onClick={() => clickedDeleteTask(item.taskid)}
                      >
                        {deletingTaskId === item.taskid ? (
                          <ClipLoader size={12} color="#bdbbbb" />
                        ) : (
                          <TbHttpDelete />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="ecoai-user-tasks-new-item">
                  {userTasks.length + 1}
                  {". "}
                  {taskAddedStatus === status.loading ? (
                    <div className="ecoai-user-tasks-load-cont">
                      <ClipLoader color="#4f99bc" size={15} />
                    </div>
                  ) : (
                    <textarea
                      ref={textareaRef}
                      value={newTask}
                      placeholder="Enter New Task and click enter/add task btn"
                      className="ecoai-user-tasks-new-item-input"
                      rows={1}
                      onChange={(e) => {
                        changeNewTask(e.target.value);
                        const textarea = e.target;
                        const maxHeight = 100;
                        textarea.style.height = "auto";
                        const newHeight = Math.min(
                          textarea.scrollHeight,
                          maxHeight,
                        );
                        textarea.style.height = newHeight + "px";
                        textarea.style.overflowY =
                          textarea.scrollHeight > maxHeight ? "auto" : "hidden";
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          if (newTask.trim()) {
                            clickedAddTask(e);
                          }
                        }
                      }}
                    />
                  )}
                </div>
                {userTasks.length === 0 && (
                  <span className="ecoai-user-tasks-no-tasks-text">
                    No tasks added yet.
                  </span>
                )}
              </div>
            )}
            <div className="ecoai-user-tasks-btn-container">
              <button type="submit" className="ecoai-user-tasks-add-btn">
                {taskAddedStatus === status.loading ? (
                  <ClipLoader color="#4f99bc" size={15} />
                ) : (
                  "Add Task"
                )}
              </button>
            </div>
          </form>
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
export default Tasks;
