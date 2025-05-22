import React from "react";
import { Outlet } from "react-router";
import { ToastContainer } from "react-toastify";

const Layout = () => {
  return (
    <div className="bg-linear-to-b from-gray-800 to-gray-950 text-white min-h-screen p-8">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto flex flex-col">
          <Outlet />
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Layout;
