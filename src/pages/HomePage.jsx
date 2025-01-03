import React from 'react'
import Hero from '../components/hero'
import Listings from '../components/Listings'
import Browse from '../components/browse'
import Rooms from '../components/Rooms'

const HomePage = () => {
  return (
    <>
      <Hero />
      <Rooms />
      <Listings isHome={true} /> 
      <Browse />
      
    </>
  )
}

export default HomePage
