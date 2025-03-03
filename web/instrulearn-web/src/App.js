import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "./layout/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Page404 from "./pages/404";
import AdminDashboard from "./pages/AdminDashBoard";
import StaffDashboard from "./pages/StaffDashBoard";
import Profile from "./pages/Profile";
import TestFireBase from "./pages/TestFireBase";
import InstrumentManagement from "./pages/InstrumentManagement";
import AddCourse from "./pages/AddCourse";
import CourseManagement from "./pages/CourseManagement";
import CourseDetail from "./pages/CourseDetail";
import CourseContentDetail from "./pages/CourseContentDetail";
import ItemTypeManagement from "./pages/ItemTypeManagement";
import CourseHomeDetails from "./pages/CourseHomeDetails";
import Search from "./pages/Search";

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
      </Routes>
    </Router>
  );
}
