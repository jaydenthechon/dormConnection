import React, { createContext, useState, useContext } from 'react';
import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MainLayout from './layouts/MainLayout';
import ListingPage from './pages/ListingPage';
import NotFound from './pages/NotFound';
import SingleListing, { listingLoader } from './pages/singleListing';
import AddListingPage from './pages/AddListingPage';
import LoginPage from './pages/LoginPage';
import ExploreDorms from './pages/ExploreDorms';
import SingleDorm, { dormLoader } from './pages/SingleDorm';

// Create an AuthContext to manage authentication state
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = () => setIsAuthenticated(true);
  const logout = () => setIsAuthenticated(false);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const ProtectedRoute = ({ element }) => {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? element : <Navigate to="/login" />;
};

const App = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/listings" element={<ListingPage />} />
        <Route path="/add-listings" element={<ProtectedRoute element={<AddListingPage addListingSubmit={addListing} />} />} />
        <Route path="/listings/:id" element={<SingleListing />} loader={listingLoader} />
        <Route path="/Explore-Dorms" element={<ExploreDorms />} />
        <Route path="/Dorms/:id" element={<SingleDorm />} loader={dormLoader} />
        <Route path="/login" element={<LoginPage onLoginSubmit={handleLogin} />} />
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
