import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import "./App.css";

import UserHome from "./components/UserHome";
import UserCalendar from "./components/UserCalendar";
// import UserDashboard from "./components/UserDashboard";
import UserSettings from "./components/UserSettings";
import Login from "./components/Login";
// import Signup from "./components/Signup";
// import Verify from "./components/Verify";
import Tasks from "./components/Tasks";
import MailVerificationSuccess from "./components/MailVerificationSuccess";
import ChangePassword from "./components/ChangePassword";
import MyAttendance from "./components/MyAttendance";
import UserAccount from "./components/UserAccount";
import UserProtectedRoute from "./components/UserProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminDashboard from "./components/AdminDashboard";
import AdminUsers from "./components/AdminUsers";
import AdminAttendanceManagement from "./components/AdminAttendanceManagement";
import AdminCalendar from "./components/AdminCalendar";
import AdminSettings from "./components/AdminSettings";
import AdminProfile from "./components/AdminProfile";
import AdminUserCalendar from "./components/AdminUserCalendar";
import AdminUserDetails from "./components/AdminUserDetails";
import AdminDataManager from "./components/AdminDataManager";
import NotFound from "./components/NotFound";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          exact
          path="/"
          element={
            <UserProtectedRoute>
              <UserHome />
            </UserProtectedRoute>
          }
        />
        <Route exact path="/login" element={<Login />} />
        {/* <Route exact path="/signup" element={<Signup />} /> */}
        {/* <Route exact path="/verify" element={<Verify />} /> */}
        <Route
          exact
          path="/verification"
          element={<MailVerificationSuccess />}
        />
        <Route exact path="/change-password" element={<ChangePassword />} />
        <Route
          exact
          path="/add-tasks"
          element={
            <UserProtectedRoute>
              <Tasks />
            </UserProtectedRoute>
          }
        />
        <Route
          exact
          path="/user-calendar"
          element={
            <UserProtectedRoute>
              <UserCalendar />
            </UserProtectedRoute>
          }
        />
        {/* <Route
          exact
          path="/user-dashboard"
          element={
            <UserProtectedRoute>
              <UserDashboard />
            </UserProtectedRoute>
          }
        /> */}
        <Route
          exact
          path="/user-settings"
          element={
            <UserProtectedRoute>
              <UserSettings />
            </UserProtectedRoute>
          }
        />
        <Route
          exact
          path="/my-attendance"
          element={
            <UserProtectedRoute>
              <MyAttendance />
            </UserProtectedRoute>
          }
        />
        <Route
          exact
          path="/user-account-details"
          element={
            <UserProtectedRoute>
              <UserAccount />
            </UserProtectedRoute>
          }
        />
        <Route
          exact
          path="/admin-dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />
        <Route
          exact
          path="/users"
          element={
            <AdminProtectedRoute>
              <AdminUsers />
            </AdminProtectedRoute>
          }
        />
        <Route
          exact
          path="/manage-attendance"
          element={
            <AdminProtectedRoute>
              <AdminAttendanceManagement />
            </AdminProtectedRoute>
          }
        />
        <Route
          exact
          path="/admin-calendar"
          element={
            <AdminProtectedRoute>
              <AdminCalendar />
            </AdminProtectedRoute>
          }
        />
        <Route
          exact
          path="/admin-settings"
          element={
            <AdminProtectedRoute>
              <AdminSettings />
            </AdminProtectedRoute>
          }
        />
        <Route
          exact
          path="/admin-profile"
          element={
            <AdminProtectedRoute>
              <AdminProfile />
            </AdminProtectedRoute>
          }
        />
        <Route
          exact
          path="/users-calendar/:id"
          element={
            <AdminProtectedRoute>
              <AdminUserCalendar />
            </AdminProtectedRoute>
          }
        />
        <Route
          exact
          path="/admin-data-manager"
          element={
            <AdminProtectedRoute>
              <AdminDataManager />
            </AdminProtectedRoute>
          }
        />
        <Route
          exact
          path="/user-details/:id"
          element={
            <AdminProtectedRoute>
              <AdminUserDetails />
            </AdminProtectedRoute>
          }
        />
        <Route path="/not-found" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/not-found" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
