import React from 'react'
import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import HomePage from './pages/HomePage'
import MainLayout from './layouts/MainLayout'
import ListingPage from './pages/ListingPage'
import NotFound from './pages/NotFound'
import SingleListing, { listingLoader } from './pages/singleListing'
import AddListingPage from './pages/AddListingPage'
import LoginPage from './pages/LoginPage'
import ExploreDorms from './pages/ExploreDorms'
import SingleDorm, {dormLoader} from './pages/SingleDorm'
//test

const App = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/listings" element={<ListingPage />} />
        <Route path="/add-listings" element={<AddListingPage />} />
        <Route path="/listings/:id" element={<SingleListing />} loader={listingLoader} />
        <Route path="/Explore-Dorms" element={<ExploreDorms />} />
        <Route path="/Dorms/:id" element={<SingleDorm />} loader={dormLoader} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    )
  );
  

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default App;