import React from 'react'
import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom'
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
  // Function to handle adding a listing
  const addListing = async (newListing) => {
    await fetch('/api/listings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newListing),
    });
  };

  // Function to handle login submission
  const handleLogin = async (loginData) => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    if (res.ok) {
      // Handle successful login (e.g., redirect or store token)
      console.log("Login successful");
    } else {
      // Handle failed login (e.g., show error)
      console.log("Login failed");
    }
  };

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/listings" element={<ListingPage />} />
        <Route path="/add-listings" element={<AddListingPage addListingSubmit={addListing} />} />
        <Route path="/listings/:id" element={<SingleListing />} loader={listingLoader} />
        <Route path="/Explore-Dorms" element={<ExploreDorms />} />
        <Route path="/Dorms/:id" element={<SingleDorm />} loader={dormLoader} />
        <Route path="/login" element={<LoginPage onLoginSubmit={handleLogin} />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    )
  );
  

  return <RouterProvider router={router} />;
};

export default App;
