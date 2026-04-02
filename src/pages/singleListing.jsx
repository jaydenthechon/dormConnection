import React from 'react';
import { useLoaderData } from 'react-router-dom';
import { FaArrowLeft , FaMapMarker} from 'react-icons/fa';
import {Link} from 'react-router-dom'
import { buildApiUrl } from '../utils/api';
{/** Shows the information for a single listing that students input */}
const SingleListing = () => {
  const listing = useLoaderData()
  const priceDisplay = listing.currentCost || listing.costDifference || 'Contact for pricing';

  // Loading state and error handling
  return (
    <>
    <section>
      <div className="container m-auto py-6 px-6">
        <Link
          to="/listings"
         className="text-indigo-500 hover:text-indigo-600 flex items-center"
        >
          <FaArrowLeft className='mr-2'/> Back to Listings
        </Link>
      </div>
    </section>

    <section className="bg-indigo-50">
      <div className="container m-auto py-10 px-6">
        <div className="grid grid-cols-1 md:grid-cols-70/30 w-full gap-6">
          <main>
            <div
             className="bg-white p-6 rounded-lg shadow-md text-center md:text-left"
            >
              <div className="text-gray-500 mb-4">{listing.building}</div>
              <h1 className="text-3xl font-bold mb-4">
                {listing.TradeDescription || listing.DormType || 'Listing'}  ({listing.lookingFor || 'No preference'})
              </h1>
              <div
               className="text-gray-500 mb-4 flex align-middle justify-center md:justify-start"
              >
                <FaMapMarker className='text-orange-700 mr-1' />
                <p className="text-orange-700">{listing.address || 'Address unavailable'}, Floor {listing.floorNumber || 'N/A'}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md mt-6">
              <h3 className="text-indigo-800 text-lg font-bold mb-6">
                Listing Description
              </h3>

              <p className="mb-4">
               {listing.description || 'No listing description provided.'}
              </p>

              <h3 className="text-indigo-800 text-lg font-bold mb-2">Pricing</h3>

              <p className="mb-4">{priceDisplay} / Year</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md mt-6">
              <h3 className="text-indigo-800 text-lg font-bold mb-6">
                Features
              </h3>
              <p className="mb-4 whitespace-pre-line">{listing.dormFeatures?.featuresAsString || 'No additional features listed.'}</p>
            </div>
          </main>

          
          <aside>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-6">New Roommate Info</h3>

              <p className="my-2">
                {listing.aboutRoommate?.description || 'No roommate preferences listed.'}
              </p>

              <hr className="my-4" />

              <h3 className="text-xl">Contact Email:</h3>

              <p className="my-2 bg-indigo-100 p-2 font-bold">
                {listing.contactEmail || 'Not provided'}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
    </>
  )
};

const listingLoader = async ({params}) => {
  const res = await fetch(buildApiUrl(`/api/listings/${params.id}`))
  if (!res.ok) {
    throw new Error('Listing not found');
  }
  const data = await res.json()
  return data
}

export {SingleListing as default, listingLoader};
