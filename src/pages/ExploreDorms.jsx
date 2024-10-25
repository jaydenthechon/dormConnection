import React, { useEffect } from 'react';
import Dorms from '../components/Dorms';

const ExploreDorms = () => {
  
  return 
  <>
    <section className="bg-blue-50 px-4 py-6">
      <h1 className="text-2xl font-bold text-center text-indigo-600 mb-6">Available Dorms</h1>
      <Dorms />
    </section>
  </>
};

export default ExploreDorms;
