import React, { ReactNode } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { FaHome, FaUsers, FaBoxOpen, FaShoppingCart, FaCheckSquare  } from 'react-icons/fa'; // Import icons from react-icons

interface LayoutProps {
  children?: ReactNode;
}

let Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <div className="min-h-screen flex">
        <aside className="bg-gray-800 text-white w-64 p-4">
          <img
            className="mx-auto h-12 w-auto mb-4"
            src="/logo2.svg"
            alt="Logo"
            style={{ marginTop: 15, marginBottom: 50 }}
          />
          <h2 className="text-lg font-bold mb-4">Admin Panel</h2>
          <ul>
            <li className="mb-2">
              <Link
                to="/dashboard"
                className="flex items-center px-4 py-2 rounded-md bg-gray-900 hover:bg-gray-700 transition duration-200"
              >
                <FaHome className="mr-2" />
                Dashboard
              </Link>
            </li>
            <li className="mb-2">
              <Link
                to="/requests"
                className="flex items-center px-4 py-2 rounded-md bg-gray-900 hover:bg-gray-700 transition duration-200"
              >
                <FaCheckSquare className="mr-2" />
                Approval Requests
              </Link>
            </li>
            <li className="mb-2">
              <Link
                to="/users"
                className="flex items-center px-4 py-2 rounded-md bg-gray-900 hover:bg-gray-700 transition duration-200"
              >
                <FaUsers className="mr-2" />
                Users
              </Link>
            </li>
            <li className="mb-2">
              <Link
                to="/products"
                className="flex items-center px-4 py-2 rounded-md bg-gray-900 hover:bg-gray-700 transition duration-200"
              >
                <FaBoxOpen className="mr-2" />
                Products
              </Link>
            </li>
            <li>
              <Link
                to="/orders"
                className="flex items-center px-4 py-2 rounded-md bg-gray-900 hover:bg-gray-700 transition duration-200"
              >
                <FaShoppingCart className="mr-2" />
                Orders
              </Link>
            </li>
          </ul>
        </aside>
        <main className="flex-1 p-4">
          {children || <Outlet />}
        </main>
      </div>
    </>
  );
};

export default Layout;