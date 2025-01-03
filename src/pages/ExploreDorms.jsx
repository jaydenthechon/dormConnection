import React, { useEffect } from 'react';
import Dorms from '../components/Dorms';

{/* Explore the dorms, just returns the Dorms complete listing page for all dorm types on campus */}
const ExploreDorms = () => {
  
  return(
  <>
    <section className="bg-blue-50 px-4 py-6">
      <Dorms />
    </section>
  </>
  )
};

export default ExploreDorms;
