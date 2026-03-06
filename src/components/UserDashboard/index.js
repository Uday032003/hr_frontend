// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import Calendar from "react-calendar";
// import Cookies from "js-cookie";
// import { ClipLoader } from "react-spinners";
// import "react-calendar/dist/Calendar.css";

// import Header from "../Header";
// import UserSidebar from "../UserSidebar";
// import "./index.css";

// const status = {
//   loading: "LOADING",
//   success: "SUCCESS",
//   failure: "FAILURE",
// };

// const UserDashboard = () => {
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [userAttendedDates, setUserAttendedDates] = useState([]);
//   const [currentStatus, setCurrentStatus] = useState(status.loading);
//   const [viewDate, setViewDate] = useState(new Date());
//   const [fadeOut, setFadeOut] = useState(false);
//   const jwtToken = Cookies.get("jwt_Token");
//   const attendedSet = new Set(userAttendedDates);
//   const navigate = useNavigate();
//   const earliestDateStr = userAttendedDates.reduce(
//     (min, d) => (d < min ? d : min),
//     userAttendedDates[0]
//   );

//   const months = [
//     "January",
//     "February",
//     "March",
//     "April",
//     "May",
//     "June",
//     "July",
//     "August",
//     "September",
//     "October",
//     "November",
//     "December",
//   ];

//   const years = Array.from({ length: 6 }, (_, i) => 2025 + i);

//   useEffect(() => {
//     const fetchUserData = async () => {
//       const options = {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${jwtToken}`,
//         },
//       };
//       try {
//         const attendanceResponse = await fetch(
//           "http://localhost:3001/user-attendance-dates",
//           options
//         );
//         if (attendanceResponse.ok) {
//           const attendanceData = await attendanceResponse.json();
//           if (attendanceData && attendanceData.length > 0) {
//             setUserAttendedDates(attendanceData);
//           } else {
//             setUserAttendedDates([]);
//           }
//         }
//         const response = await fetch(
//           "http://localhost:3001/user-details",
//           options
//         );
//         if (response.ok) {
//           const data = await response.json();
//           setCurrentStatus(status.success);
//           if (data.selected_date) {
//             setSelectedDate(new Date(data.selected_date));
//           }
//         } else {
//           setCurrentStatus(status.failure);
//         }
//       } catch (err) {
//         console.log(err);
//       }
//     };
//     fetchUserData();
//   }, [jwtToken]);

//   const handleMonthChange = (e) => {
//     const newMonth = months.indexOf(e.target.value);
//     const updatedDate = new Date(viewDate);
//     updatedDate.setMonth(newMonth);
//     setViewDate(updatedDate);
//   };

//   const handleYearChange = (e) => {
//     const updatedDate = new Date(viewDate);
//     updatedDate.setFullYear(Number(e.target.value));
//     setViewDate(updatedDate);
//   };

//   const submittedEnterForm = async (e) => {
//     e.preventDefault();
//     const selectedDateDetails = {
//       selectedDate: selectedDate.toISOString(),
//     };
//     const options = {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${jwtToken}`,
//       },
//       body: JSON.stringify(selectedDateDetails),
//     };
//     try {
//       const response = await fetch(
//         "http://localhost:3001/update-selected-date",
//         options
//       );
//       if (response.ok) {
//         setFadeOut(true);
//         setTimeout(() => {
//           navigate("/my-attendance");
//         }, 400);
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const renderFailureView = () => <div>Failed to load</div>;

//   const renderLoadingView = () => (
//     <div className="ecoai-user-calendar-loading-view-container">
//       <ClipLoader size={30} color={"#ffffff"} loading={true} />
//     </div>
//   );

//   const renderSuccessView = () => (
//     <form
//       onSubmit={submittedEnterForm}
//       className="ecoai-user-calendar-calendar-section"
//     >
//       <div className="ecoai-username-calendar-container">
//         <div className="ecoai-user-calendar-month-year-selectors-container">
//           <select
//             value={months[viewDate.getMonth()]}
//             onChange={handleMonthChange}
//             className="ecoai-user-calendar-month-selector"
//           >
//             {months.map((m) => (
//               <option key={m} className="ecoai-user-calendar-select-option">
//                 {m}
//               </option>
//             ))}
//           </select>
//           <select
//             value={viewDate.getFullYear()}
//             onChange={handleYearChange}
//             className="ecoai-user-calendar-year-selector"
//           >
//             {years.map((y) => (
//               <option key={y} className="ecoai-user-calendar-select-option">
//                 {y}
//               </option>
//             ))}
//           </select>
//         </div>
//         <Calendar
//           value={new Date(selectedDate)}
//           onChange={setSelectedDate}
//           activeStartDate={viewDate}
//           next2Label={null}
//           prev2Label={null}
//           minDetail="month"
//           maxDetail="month"
//           onActiveStartDateChange={({ activeStartDate }) => {
//             setViewDate(activeStartDate);
//           }}
//           tileClassName={({ date, view }) => {
//             const dateStr =
//               date.getFullYear() +
//               "-" +
//               String(date.getMonth() + 1).padStart(2, "0") +
//               "-" +
//               String(date.getDate()).padStart(2, "0");

//             const todayStr =
//               new Date().getFullYear() +
//               "-" +
//               String(new Date().getMonth() + 1).padStart(2, "0") +
//               "-" +
//               String(new Date().getDate()).padStart(2, "0");

//             if (
//               dateStr < earliestDateStr ||
//               dateStr >= todayStr ||
//               date.getDay() === 0
//             ) {
//               return;
//             }
//             if (attendedSet.has(dateStr)) {
//               return "green-date";
//             } else {
//               return "red-date";
//             }
//           }}
//         />
//         <button type="submit" className="ecoai-user-calendar-button">
//           Enter
//           <span className="ecoai-user-calendar-selected-date-text">
//             {selectedDate.toLocaleDateString("en-IN", {
//               month: "short",
//               day: "numeric",
//               year: "numeric",
//             })}
//           </span>
//         </button>
//       </div>
//       <div className="ecoai-user-calendar-tiles-container">
//         <div className="ecoai-user-calendar-tile-container">
//           <span className="ecoai-user-calendar-tile ecoai-selected-tile-color">
//             {new Date().getDate()}
//           </span>
//           <span className="ecoai-selected-tile-text">Selected</span>
//         </div>
//         <div className="ecoai-user-calendar-tile-container">
//           <span className="ecoai-user-calendar-tile ecoai-today-tile-color">
//             {new Date().getDate()}
//           </span>
//           <span className="ecoai-today-tile-text">Today</span>
//         </div>
//         <div className="ecoai-user-calendar-tile-container">
//           <span className="ecoai-user-calendar-tile ecoai-present-tile-color">
//             {new Date().getDate()}
//           </span>
//           <span className="ecoai-present-tile-text">Present</span>
//         </div>
//         <div className="ecoai-user-calendar-tile-container">
//           <span className="ecoai-user-calendar-tile ecoai-absent-tile-color">
//             {new Date().getDate()}
//           </span>
//           <span className="ecoai-absent-tile-text">Absent</span>
//         </div>
//       </div>
//     </form>
//   );

//   const renderFinalView = () => {
//     switch (currentStatus) {
//       case status.loading:
//         return renderLoadingView();
//       case status.success:
//         return renderSuccessView();
//       case status.failure:
//         return renderFailureView();
//       default:
//         return null;
//     }
//   };

//   return (
//     <>
//       <Header />
//       <div className="ecoai-user-calendar-bg-container">
//         <UserSidebar />
//         <div
//           className={`ecoai-user-calendar-right-container ${
//             fadeOut ? "fade-out" : "fade-in"
//           }`}
//         >
//           {renderFinalView()}
//         </div>
//       </div>
//     </>
//   );
// };

// export default UserDashboard;
