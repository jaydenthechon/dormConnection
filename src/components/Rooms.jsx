import React from 'react'
import {Link} from 'react-router-dom'


{/* The middle part of the Home Page where people have the option to navigate to browse dorms or add their own listing */}

const Rooms = () => {
  return (
    <section className="py-4">
      <div className="container-xl lg:container m-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg">
          <div className="bg-gray-100 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold">Looking for Swap?</h2>
            <p className="mt-2 mb-4">
              Browse BU dorm listings, use filters, and reach out to residents directly.
            </p>
            <Link
              to="/listings"
              className="inline-block bg-black text-white rounded-lg px-4 py-2 hover:bg-gray-700"
            >
              Browse Listings
            </Link>
          </div>
          <div className="bg-indigo-100 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold">Offer Your BU Dorm</h2>
            <p className="mt-2 mb-4">
              Post your BU room details so the right swap candidate can find you.
            </p>
            <Link
              to="/add-listings"
              className="inline-block bg-indigo-500 text-white rounded-lg px-4 py-2 hover:bg-indigo-600"
            >
              Add Listing
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Rooms
