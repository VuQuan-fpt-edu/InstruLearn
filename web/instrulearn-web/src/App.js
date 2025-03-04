import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "./layout/Layout";
import Login from "./pages/authentication/Login";
import Register from "./pages/authentication/Register";
import Home from "./pages/home/Home";
import Page404 from "./pages/error/404";
import AdminDashboard from "./pages/admin/AdminDashBoard";
import StaffDashboard from "./pages/staff/StaffDashBoard";
import Profile from "./pages/home/profile/Profile";
import TestFireBase from "./pages/TestFireBase";
import InstrumentManagement from "./pages/staff/InstrumentManagement";
import AddCourse from "./pages/staff/AddCourse";
import CourseManagement from "./pages/staff/CourseManagement";
import CourseDetail from "./pages/staff/CourseDetail";
import CourseContentDetail from "./pages/staff/CourseContentDetail";
import ItemTypeManagement from "./pages/staff/ItemTypeManagement";
import CourseHomeDetails from "./pages/home/CourseHomeDetails";
import Search from "./pages/home/Search";
import StaffManagement from "./pages/admin/StaffManagement";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
        </Route>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/staff" element={<StaffDashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/404" element={<Page404 />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/test" element={<TestFireBase />} />
        <Route
          path="/instrument-management"
          element={<InstrumentManagement />}
        />
        <Route path="/add-course" element={<AddCourse />} />
        <Route path="/course-management" element={<CourseManagement />} />
        <Route path="/course-detail/:courseId" element={<CourseDetail />} />
        <Route
          path="/course-content-detail/:contentId"
          element={<CourseContentDetail />}
        />
        <Route path="/item-type" element={<ItemTypeManagement />} />
        <Route path="/course/:id" element={<CourseHomeDetails />} />
        <Route path="/search" element={<Search />} />
        <Route path="/staff-management" element={<StaffManagement />} />
      </Routes>
    </Router>
  );
}
