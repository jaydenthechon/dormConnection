import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'

const MainLayout = () => {
  return (
    <>
        <Navbar />
        <div className="pt-20"></div>
        <Outlet />
    </>

  )
}

export default MainLayout
