import React from "react";
import { Outlet, Link } from "react-router";
import { ToastContainer } from "react-toastify";

const Layout = () => {
  return (
    <div className="bg-linear-to-b from-gray-800 to-gray-950 text-white min-h-screen p-8 flex flex-col">
      <div className="px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <div className="max-w-3xl mx-auto flex flex-col">
          <Outlet />
        </div>
      </div>
      <footer className="max-w-3xl mx-auto text-center py-4">
        <Link to="/" className="text-blue-400 hover:underline">
          Home
        </Link>
      </footer>
      <ToastContainer />
    </div>
  );
};

export default Layout;
