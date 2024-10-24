import React from 'react'
import logo from '../assets/images/logo.png'
import {NavLink} from 'react-router-dom'



const Navbar = () => {
  return (
      <nav className="bg-indigo-700 border-b border-indigo-500">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div
            className="flex flex-1 items-center justify-center md:items-stretch md:justify-start"
          >
            {/*<!-- Logo -->*/}
            <NavLink className="flex flex-shrink-0 items-center mr-4" to="/index.html">
              <img
                className="h-10 w-auto"
                src= {logo}
                alt="Dorm Connection"
              />
              <span className="hidden md:block text-white text-2xl font-bold ml-2"
                >BU Swaps</span
              >
            </NavLink>
            <div className="md:ml-auto">
              <div className="flex space-x-2">
                <NavLink
                  to="/"

                  className={({ isActive}) => isActive ?'text-white bg-black hover:bg-gray-900 hover:text-white rounded-md px-3 py-2' : 'text-white hover:bg-gray-900 hover:text-white rounded-md px-3 py-2'}
                  
                  >Home
                </NavLink>
                <NavLink
                  to="/listings"
                  className={({ isActive}) => isActive ?'text-white bg-black hover:bg-gray-900 hover:text-white rounded-md px-3 py-2' : 'text-white hover:bg-gray-900 hover:text-white rounded-md px-3 py-2'}
                  >Browse Listings</NavLink
                >
                <NavLink
                  to="/add-listings"
                  className={({ isActive}) => isActive ?'text-white bg-black hover:bg-gray-900 hover:text-white rounded-md px-3 py-2' : 'text-white hover:bg-gray-900 hover:text-white rounded-md px-3 py-2'}
                  >Add Listing
                  </NavLink>
                <NavLink
                  to="/dorms"
                  className={({ isActive}) => isActive ?'text-white bg-black hover:bg-gray-900 hover:text-white rounded-md px-3 py-2' : 'text-white hover:bg-gray-900 hover:text-white rounded-md px-3 py-2'}
                  >Dorms
                  </NavLink>
                <NavLink
                  to="/login"
                  className={({ isActive}) => isActive ?'text-white bg-black hover:bg-gray-900 hover:text-white rounded-md px-3 py-2' : 'text-white hover:bg-gray-900 hover:text-white rounded-md px-3 py-2'}
                  >Login
                  </NavLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
