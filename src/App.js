import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/register/Register";
import Login from "./pages/login/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LandingPage from "./pages/landing/LandingPage";
import MyFriend from "./pages/myfriendlist/MyFriend";
import MyProfile from "./pages/myprofile/MyProfile";
import FriendSuggestion from "./pages/friendsuggestion/FriendSuggestion";
import FriendRequest from "./pages/friendrequest/FriendRequest";
import MySocialProfile from "./pages/socialprofile/MySocialProfile";
import Dashboard from "./pages/dashboard/Dashboard";
import Navbar from "./components/Navbar";
import UserRoutes from "./protected_routes/UserRoutes";
import Chat from "./pages/chat/Chat";
import AdminRoutes from "./protected_routes/AdminRoutes";
import CreateGame from "./pages/admin/game/CreateGame.jsx";
import PlayGame from "./pages/playgame/PlayGame.jsx";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";
import CreateStory from "./components/CreateStory.jsx";
import Help from "./pages/help/Help.jsx";
import Blocking from "./pages/blocking/Blocking.jsx";

function App() {
  return (
    <Router>
      <ToastContainer />
      {/* <Navbar /> */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* User Routes */}
        <Route element={<UserRoutes />}>
          <Route path="/myfriend" element={<MyFriend />} />
          <Route path="/myprofile" element={<MyProfile />} />
          <Route path="/friendsuggestion" element={<FriendSuggestion />} />
          <Route path="/friendrequest" element={<FriendRequest />} />
          <Route path="/socialprofile" element={<MySocialProfile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/messages" element={<Chat />} />
          <Route path="/games" element={<PlayGame />} />
          <Route path="/story" element={<CreateStory />} />
          <Route path="/help" element={<Help />} />
          <Route path="/blocking" element={<Blocking />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminRoutes />}>
          <Route path="/creategame" element={<CreateGame />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
