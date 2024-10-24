import React from 'react'
import {Route, createBrowserRouter, createRoutesFromElements, RouterProvider} from 'react-router-dom'
import HomePage from './pages/HomePage'
import MainLayout from './layouts/MainLayout'
import ListingPage from './pages/ListingPage'
import NotFound from './pages/NotFound'
import SingleListing from './pages/singleListing'


const router = createBrowserRouter(
  createRoutesFromElements(
  <Route path='/' element={<MainLayout />}>
    <Route index element={<HomePage />} />
    <Route path='/listings' element={<ListingPage/>} />
    <Route path='/listings/:id' element={<SingleListing/>} />
    <Route path='*' element={<NotFound />} />
  </Route>
  )
)


const App = () => {
  return <RouterProvider router={router} />
}

export default App
