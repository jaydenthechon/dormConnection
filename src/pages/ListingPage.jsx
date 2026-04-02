import React from 'react'
import Listings from '../components/Listings'

const ListingPage = () => {
  return <section className="bg-blue-50 px-4 py-6">
    <Listings showFilters={true} />
  </section>
}

export default ListingPage
