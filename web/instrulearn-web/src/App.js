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
import Search from "./pages/home/Search";
import StaffManagement from "./pages/admin/StaffManagement";
import RequestManagement from "./pages/staff/RequestManagement";
import TeacherCenterSchedule from "./pages/staff/TeacherCenterSchedule";
import StaffProfile from "./pages/staff/Profile";
import Courses from "./pages/home/HomeAllCourses";
import Booking11Management from "./pages/staff/Booking1-1Request";
import TeacherInfo from "./pages/home/teacher/TeacherProfile";
import ClassManagement from "./pages/staff/ClassManagement";
import AddClass from "./pages/staff/AddClass";
import PurchaseHistory from "./pages/home/profile/PurchaseHistory";
import StudentSchedule from "./pages/home/profile/Schedule";
import TeacherClassManagement from "./pages/teacher/TeacherClassManagement";
import RevenueReport from "./pages/manager/Revenue";
import MusicTeachersList from "./pages/home/teacher/TeacherList";
import OpenClasses from "./pages/home/class/OpenClass";
import CenterClassDetail from "./pages/home/CenterClassDetail";
import StudentList from "./pages/teacher/StudentList";
import CenterSchedule from "./pages/teacher/CenterSchedule";
import PrivateSchedule from "./pages/teacher/PrivateSchedule";
import ClassAttendance from "./pages/teacher/ClassAttendance";
import ClassProgress from "./pages/teacher/ClassProgress";
import StudentEvaluation from "./pages/teacher/StudentEvaluation";
import TeacherDashBoard from "./pages/teacher/TeacherDashBoard";
import MakeupClass from "./pages/teacher/MakeupClass";
import TeacherPersonalSchedule from "./pages/staff/TeacherPersonalSchedule";
import StudentCenterSchedule from "./pages/staff/StudentCenterSchedule";
import StudentPersonalSchedule from "./pages/staff/StudentPersonalSchedule";
import MakeupClassRequests from "./pages/staff/MakeupClassRequests";
import CenterClassRegistration from "./pages/staff/CenterClassRegistration";
import CenterClassPayments from "./pages/manager/CenterClassPayments";
import CenterClassPaymentsDetails from "./pages/manager/CenterClassPaymentsDetails";
import OneOnOnePayments from "./pages/manager/OneOnOnePayments";
import OneOnOnePaymentsDetails from "./pages/manager/OneOnOnePaymentsDetails";
import OnlineCoursePayments from "./pages/manager/OnlineCoursePayments";
import HistoryTransaction from "./pages/manager/HistoryTransaction";
import PromotionCodes from "./pages/manager/PromotionCodes";
import ManagerManagement from "./pages/admin/ManagerManagement";
import LearnerManagement from "./pages/admin/LearnerManagement";
import ClassFeedbacks from "./pages/teacher/ClassFeedback";
import TeacherManagement from "./pages/admin/TeacherManagement";
import StudentBookingForm from "./pages/home/Booking1-1/index";
import TopUp from "./pages/home/profile/TopUp";
import PackageDetail from "./pages/home/package/PackageDetail";
import MusicalInstrument from "./pages/staff/MusicalInstrument";
import MajorTest from "./pages/staff/MajorTest";
import TeacherProfiles from "./pages/teacher/Profile";
import TeacherListManagement from "./pages/staff/TeacherListManagement";
import TeacherDetail from "./pages/staff/TeacherDetail";
import ClassDetail from "./pages/staff/ClassDetail";
import AddTeacher from "./pages/staff/AddTeacher";
import ClassDetails from "./pages/home/class/ClassDetail";
import Syllabus from "./pages/staff/Syllabus";
import Dashboard from "./pages/manager/Dashboard";
import LevelManagement from "./pages/manager/LevelManagement";
import ResponseManagement from "./pages/manager/ResponseManagement";
import ResponseTypeManagement from "./pages/manager/ResponseTypeManagement";
import PaymentManagement from "./pages/manager/PaymentManagement";
export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/booking1-1" element={<StudentBookingForm />} />
          <Route path="/open-classes" element={<OpenClasses />} />
          <Route path="/center-class-detail" element={<CenterClassDetail />} />
          <Route path="/home-allcourse" element={<Courses />} />
          <Route path="/teacher-list" element={<MusicTeachersList />} />
          <Route path="/search" element={<Search />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/topup" element={<TopUp />} />
          <Route path="/purchase-history" element={<PurchaseHistory />} />
          <Route path="/student-schedule" element={<StudentSchedule />} />
          <Route path="/teacher-profile/:id" element={<TeacherInfo />} />
          <Route path="/package/:id" element={<PackageDetail />} />
          <Route path="/class-detail/:id" element={<ClassDetails />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="admin/staff-management" element={<StaffManagement />} />
        <Route
          path="admin/manager-management"
          element={<ManagerManagement />}
        />
        <Route
          path="admin/learner-management"
          element={<LearnerManagement />}
        />
        <Route
          path="/admin/teacher-management"
          element={<TeacherManagement />}
        />

        {/* Staff Routes */}
        <Route path="/staff" element={<StaffDashboard />} />
        <Route
          path="staff/instrument-type-management"
          element={<InstrumentManagement />}
        />
        <Route path="staff/add-course" element={<AddCourse />} />
        <Route path="staff/course-management" element={<CourseManagement />} />
        <Route
          path="staff/course-detail/:courseId"
          element={<CourseDetail />}
        />
        <Route
          path="staff/course-content-detail/:contentId"
          element={<CourseContentDetail />}
        />
        <Route path="staff/item-type" element={<ItemTypeManagement />} />
        <Route path="staff/refund-requests" element={<RequestManagement />} />
        <Route
          path="/staff/teacher-center-schedule"
          element={<TeacherCenterSchedule />}
        />
        <Route path="staff/profile" element={<StaffProfile />} />
        <Route
          path="staff/booking1-1-requests"
          element={<Booking11Management />}
        />
        <Route path="staff/class-management" element={<ClassManagement />} />
        <Route path="staff/add-class" element={<AddClass />} />
        <Route
          path="staff/teacher-personal-schedule"
          element={<TeacherPersonalSchedule />}
        />
        <Route
          path="staff/student-center-schedule"
          element={<StudentCenterSchedule />}
        />
        <Route
          path="staff/student-personal-schedule"
          element={<StudentPersonalSchedule />}
        />
        <Route
          path="staff/makeup-class-requests"
          element={<MakeupClassRequests />}
        />
        <Route
          path="staff/center-class-registration"
          element={<CenterClassRegistration />}
        />
        <Route
          path="staff/instrument-management"
          element={<MusicalInstrument />}
        />
        <Route path="staff/major-test" element={<MajorTest />} />
        <Route
          path="staff/teacher-management"
          element={<TeacherListManagement />}
        />
        <Route path="staff/teacher-detail/:id" element={<TeacherDetail />} />
        <Route path="staff/class-detail/:id" element={<ClassDetail />} />
        <Route path="staff/add-teacher" element={<AddTeacher />} />
        <Route path="staff/syllabus" element={<Syllabus />} />

        {/* Teacher Routes */}
        <Route path="/teacher" element={<TeacherDashBoard />} />
        <Route path="/teacher/profile" element={<TeacherProfiles />} />
        <Route path="teacher/students" element={<TeacherClassManagement />} />
        <Route path="/teacher/student-list" element={<StudentList />} />
        <Route path="teacher/center-schedule" element={<CenterSchedule />} />
        <Route path="teacher/private-schedule" element={<PrivateSchedule />} />
        <Route
          path="/teacher/class-attendance/:classId"
          element={<ClassAttendance />}
        />
        <Route path="/teacher/class-progress" element={<ClassProgress />} />
        <Route
          path="/teacher/student-evaluation"
          element={<StudentEvaluation />}
        />
        <Route path="/teacher/makeup-class" element={<MakeupClass />} />
        <Route path="/teacher/student-feedback" element={<ClassFeedbacks />} />

        {/* Manager Routes */}
        <Route path="manager" element={<Dashboard />} />
        <Route path="manager/revenue" element={<RevenueReport />} />
        <Route
          path="manager/revenue/center-class-payments"
          element={<CenterClassPayments />}
        />
        <Route
          path="manager/revenue/center-class-payments/:id"
          element={<CenterClassPaymentsDetails />}
        />
        <Route
          path="manager/revenue/one-on-one-payments"
          element={<OneOnOnePayments />}
        />
        <Route
          path="manager/revenue/one-on-one-payments/:id"
          element={<OneOnOnePaymentsDetails />}
        />
        <Route
          path="manager/revenue/online-course-payments"
          element={<OnlineCoursePayments />}
        />
        <Route
          path="manager/revenue/history-transaction"
          element={<HistoryTransaction />}
        />
        <Route path="manager/promotions" element={<PromotionCodes />} />
        <Route path="manager/level-management" element={<LevelManagement />} />
        <Route
          path="manager/response-management"
          element={<ResponseManagement />}
        />
        <Route
          path="manager/response-type-management"
          element={<ResponseTypeManagement />}
        />
        <Route
          path="manager/payment-management"
          element={<PaymentManagement />}
        />
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/404" element={<Page404 />} />
        <Route path="/test" element={<TestFireBase />} />
      </Routes>
    </Router>
  );
}
