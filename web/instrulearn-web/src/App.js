import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "./layout/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Page404 from "./pages/404";
import Profile from "./pages/Profile";
import TestFireBase from "./pages/TestFireBase";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/404" element={<Page404 />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/test" element={<TestFireBase />} />
      </Routes>
    </Router>
  );
}
