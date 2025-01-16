import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const UserRoutes = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user ? (
    <>
      <Navbar />
      <Outlet />
    </>
  ) : (
    <Navigate to="/login" />
  );
};

export default UserRoutes;
