import React from 'react'
import Navbar from './components/Navbar' 
import Hero from './components/hero'
import Rooms from './components/Rooms'
import Listings from './components/Listings'
import browse from './components/browse'

const App = () => {


  return (
    <>
    <Navbar />
    <Hero title='Dorm Connection' subtitle='A way to see which dorms are avaliable for Direct Swap'/>
    <Rooms />  
    <Listings />
    <browse />
  

    </>
  
  )
}

export default App
