import React, { useState } from 'react';
import logo from '../assets/images/logo.png';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

//Navigation Bar
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false); // State to track menu toggle
  const { isAuthenticated, user, logout } = useAuth();

  const toggleMenu = () => {
    setIsOpen(!isOpen); // Toggle the menu open/close state
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const navLinks = ['/', '/Listings', '/Add-listings', '/Explore-Dorms'];
  
  return (
    <nav className="bg-indigo-700 border-b border-indigo-500 fixed top-0 left-0 w-full z-50">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-5">
        <div className="flex h-20 items-center justify-end">
          {/* Logo */}
          <div className="flex items-center">
            <NavLink className="flex items-center mr-4" to="/">
              <img className="h-10 w-auto" src={logo} alt="Dorm Connection" />
              <span className="hidden md:block text-white text-2xl font-bold ml-2">
                BU Swaps
              </span>
            </NavLink>
          </div>

          {/* Menu toggle button (for mobile view) */}
          <div className="md:hidden ml-auto">
            <button
              type="button"
              className="text-white hover:bg-gray-900 p-2 rounded-md"
              onClick={toggleMenu}
            >
              {/* Icon for the button */}
              {isOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex justify-end md:ml-auto items-center">
            <div className="flex space-x-2 items-center">
              {navLinks.map((path, index) => (
                <NavLink
                  key={index}
                  to={path}
                  className={({ isActive }) =>
                    isActive
                      ? 'text-white bg-black hover:bg-gray-900 hover:text-white rounded-md px-3 py-2'
                      : 'text-white hover:bg-gray-900 hover:text-white rounded-md px-3 py-2'
                  }
                >
                  {path === '/' ? 'Home' : path.replace('/', '').replace('-', ' ')}
                </NavLink>
              ))}
              {isAuthenticated ? (
                <div className="flex items-center space-x-3 ml-2">
                  <span className="text-white text-sm">{user?.email}</span>
                  <button
                    onClick={handleLogout}
                    className="text-white bg-red-600 hover:bg-red-700 rounded-md px-3 py-2"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    isActive
                      ? 'text-white bg-black hover:bg-gray-900 hover:text-white rounded-md px-3 py-2'
                      : 'text-white hover:bg-gray-900 hover:text-white rounded-md px-3 py-2'
                  }
                >
                  Login
                </NavLink>
              )}
            </div>
          </div>

          {/* Mobile menu with rounded border */}
          <div
            className={`md:hidden absolute top-16 left-0 w-full bg-red-700 border-t border-indigo-500 overflow-hidden transition-all duration-500 ease-in-out transform rounded-sm z-50 ${
              isOpen ? 'max-h-96 opacity-100 translate-y-0 mb-8' : 'max-h-0 opacity-0 translate-y-[-20px]'
            }`}
          >
            <div className="flex flex-col space-y-2 p-4">
              {navLinks.map((path, index) => (
                <NavLink
                  key={index}
                  to={path}
                  className={({ isActive }) =>
                    isActive
                      ? 'text-white bg-black hover:bg-gray-900 hover:text-white rounded-md px-3 py-2'
                      : 'text-white hover:bg-gray-900 hover:text-white rounded-md px-3 py-2'
                  }
                  onClick={toggleMenu}
                >
                  {path === '/' ? 'Home' : path.replace('/', '').replace('-', ' ')}
                </NavLink>
              ))}
              {isAuthenticated ? (
                <>
                  <div className="text-white text-sm px-3 py-2">{user?.email}</div>
                  <button
                    onClick={() => {
                      toggleMenu();
                      handleLogout();
                    }}
                    className="text-white bg-red-600 hover:bg-red-700 rounded-md px-3 py-2 text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    isActive
                      ? 'text-white bg-black hover:bg-gray-900 hover:text-white rounded-md px-3 py-2'
                      : 'text-white hover:bg-gray-900 hover:text-white rounded-md px-3 py-2'
                  }
                  onClick={toggleMenu}
                >
                  Login
                </NavLink>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
