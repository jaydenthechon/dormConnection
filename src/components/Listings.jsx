import React, { useState, useEffect } from 'react';
import Listing from './Listing';
import { buildApiUrl } from '../utils/api';

//A page that shows multiple listings 
const Listings = ({ isHome = false, showFilters = false }) => {
  const [listing, setListing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [dormType, setDormType] = useState('');
  const [dormStyle, setDormStyle] = useState('');
  const [sortOption, setSortOption] = useState('newest');

  useEffect(() => {
    const fetchListings = async () => {
      const params = new URLSearchParams();
      if (isHome) {
        params.set('_limit', '3');
      }

      if (!isHome && showFilters) {
        if (searchQuery.trim()) params.set('q', searchQuery.trim());
        if (minPrice.trim()) params.set('min_price', minPrice.trim());
        if (maxPrice.trim()) params.set('max_price', maxPrice.trim());
        if (dormType) params.set('dorm_type', dormType);
        if (dormStyle) params.set('dorm_style', dormStyle);
        if (sortOption) params.set('sort', sortOption);
      }

      const queryString = params.toString();
      const apiUrl = queryString ? `/api/listings?${queryString}` : '/api/listings';

      setLoading(true);
      setError('');
      try {
        const res = await fetch(buildApiUrl(apiUrl));
        if (!res.ok) {
          throw new Error(`Failed to load listings (${res.status})`);
        }
        const data = await res.json();
        setListing(data);
      } catch (error) {
        setError(error.message || 'Error fetching listings');
        console.log('Error fetching data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [isHome, showFilters, searchQuery, minPrice, maxPrice, dormType, dormStyle, sortOption]);

  const clearFilters = () => {
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
    setDormType('');
    setDormStyle('');
    setSortOption('newest');
  };

  return (
    <section className="bg-blue-50 px-4 py-10">
      <div className="container-xl lg:container m-auto">
        <h2 className="text-3xl font-bold text-indigo-500 mb-6 text-center">
          {isHome ? 'Recent Listings' : 'Browse Listings'}
        </h2>

        {!isHome && showFilters && (
          <div className="bg-white border border-indigo-100 rounded-xl p-4 mb-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by building, type, style, address"
                className="border rounded-md px-3 py-2"
              />
              <input
                type="number"
                min="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min price"
                className="border rounded-md px-3 py-2"
              />
              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max price"
                className="border rounded-md px-3 py-2"
              />
              <select
                value={dormType}
                onChange={(e) => setDormType(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                <option value="">All room types</option>
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Triple">Triple</option>
                <option value="Quad">Quad</option>
              </select>
              <select
                value={dormStyle}
                onChange={(e) => setDormStyle(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                <option value="">All property styles</option>
                <option value="Dorm">Dorm</option>
                <option value="Suite">Suite</option>
                <option value="Studio Apartment">Studio Apartment</option>
                <option value="2 Person Apartment">2 Person Apartment</option>
                <option value="3 Person Apartment">3 Person Apartment</option>
                <option value="4 Person Apartment">4 Person Apartment</option>
                <option value="STUVI I/II">STUVI I/II</option>
              </select>
              <div className="flex gap-2">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="border rounded-md px-3 py-2 flex-1"
                >
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="building-asc">Building A-Z</option>
                </select>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            <h2>Loading...</h2>
          ) : error ? (
            <h2 className="text-red-500">{error}</h2>
          ) : listing.length === 0 ? (
            <h2 className="text-gray-600">No listings available yet.</h2>
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
