import React, { useState } from 'react';
import { FaMapMarker } from 'react-icons/fa';
import { Link } from 'react-router-dom';

//Shows one instance of a listing in formatted form. 
//Arg: Listing
//returns structure for listing page in HTML
const Listing = ({ listing }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);

  let description = listing.description;

  if (!showFullDescription) {
    description = description.substring(0, 90) + '...';
  }

  return (
    <div className="bg-white rounded-xl shadow-md relative">
      <div className="p-4">
        <div className="mb-6">
          <div className="text-gray-600 my-2">{listing.building}</div>
          <h3 className="text-xl font-bold">{listing.DormType}</h3>
        </div>

        <div className="mb-5">{description}</div>

        <button
          onClick={() => setShowFullDescription((prevState) => !prevState)}
          className="text-indigo-500 mb-5 hover:text-indigo-600"
        >
          {showFullDescription ? 'Less' : 'More'}
        </button>

        <h3 className="text-indigo-500 mb-2">{listing.costDifference} / Year</h3>

        <div className="border border-gray-100 mb-5"></div>

        <div className="flex flex-col lg:flex-row justify-between items-center mb-4">
          <div className="text-orange-700 flex items-center mb-3 lg:mb-0 truncate lg:max-w-[150px]">
            <FaMapMarker className="inline text-lg mb-1 mr-1" />
            <span className="truncate">{listing.address}</span>
          </div>
          <Link
            to={`/listings/${listing.id}`}
            className="w-[105px] h-[36px] bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-center text-sm flex items-center justify-center"
          >
            Read More
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Listing;
