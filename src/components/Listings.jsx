import React, { useState, useEffect } from 'react';
import Listing from './Listing';

//A page that shows multiple listings 
const Listings = ({ isHome = false }) => {
  const [listing, setListing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState(''); // For sorting options (not yet implemented)

  useEffect(() => {
    const fetchListings = async () => {
      const apiUrl = isHome ? '/api/listings?_limit=3' : '/api/listings';
      try {
        const res = await fetch(apiUrl);
        const data = await res.json();
        setListing(data);
      } catch (error) {
        console.log('Error fetching data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [isHome]);

  // Handle sorting based on the selected option
  useEffect(() => {
    if (sortOption) {
      const sortedListings = [...listing];
      if (sortOption === 'price-low-high') {
        sortedListings.sort((a, b) => a.price - b.price);
      } else if (sortOption === 'price-high-low') {
        sortedListings.sort((a, b) => b.price - a.price);
      } else if (sortOption === 'location') {
        sortedListings.sort((a, b) => a.location.localeCompare(b.location));
      }
      setListing(sortedListings);
    }
  }, [sortOption]);

  const handleSortChange = (e) => {
    setSortOption(e.target.value); // Update sort option
  };

  return (
    <section className="bg-blue-50 px-4 py-10">
      <div className="container-xl lg:container m-auto">
        <h2 className="text-3xl font-bold text-indigo-500 mb-6 text-center">
          {isHome ? 'Recent Listings' : 'Browse Listings'}
        </h2>

        {/* Filter Dropdown */}
        <div className="flex justify-end mb-6">
          <select
            className="px-4 py-2 border border-indigo-300 rounded-md"
            value={sortOption}
            onChange={handleSortChange}
          >
            <option value="">Sort By</option>
            <option value="price-low-high">Price: Low to High</option>
            <option value="price-high-low">Price: High to Low</option>
            <option value="location">Location</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            <h2>Loading...</h2>
          ) : (
            <>
              {listing.map((listings) => (
                <Listing key={listings.id} listing={listings} />
              ))}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Listings;
