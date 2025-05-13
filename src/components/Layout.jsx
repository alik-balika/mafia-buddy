import React from "react";
import { Outlet } from "react-router";
import { ToastContainer } from "react-toastify";

const Layout = () => {
  return (
    <div className="bg-linear-to-b from-gray-800 to-gray-950 text-white min-h-screen p-8">
      <Outlet />
      <ToastContainer />
    </div>
  );
};

export default Layout;
