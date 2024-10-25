import React from 'react'
import {Route, createBrowserRouter, createRoutesFromElements, RouterProvider} from 'react-router-dom'
import HomePage from './pages/HomePage'
import MainLayout from './layouts/MainLayout'
import ListingPage from './pages/ListingPage'
import NotFound from './pages/NotFound'
import SingleListing, {listingLoader} from './pages/singleListing'
import AddListingPage from './pages/AddListingPage'




const App = () => {
  const addListing = async (newListing) => {
    const res = await fetch('/api/jobs',{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newListing),
    })
    return
  }
  const router = createBrowserRouter(
    createRoutesFromElements(
    <Route path='/' element={<MainLayout />}>
      <Route index element={<HomePage />} />
      <Route path='/listings' element={<ListingPage/>} />
      <Route path='/add-listings' element={<AddListingPage addListingSubmit={addListing}/>} />
      <Route path='/listings/:id' element={<SingleListing/>} loader={listingLoader}/>
      <Route path='*' element={<NotFound />} />
    </Route>
    )
  )
  return <RouterProvider router={router} />
}

export default App
