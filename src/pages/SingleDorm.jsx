import React from 'react';
import { useParams, useLoaderData } from 'react-router-dom';
import { FaArrowLeft, FaMapMarker } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const SingleDorm = () => {
  const { id } = useParams();
  const Dorms = useLoaderData();

  return (
    <>
      <section>
        <div className="container m-auto py-6 px-6">
          <Link to="/Explore-Dorms" className="text-indigo-500 hover:text-indigo-600 flex items-center">
            <FaArrowLeft className='mr-2' /> Back to Dorms
          </Link>
        </div>
      </section>

      <section className="bg-indigo-50">
        <div className="container m-auto py-10 px-6">
          <div className="grid grid-cols-1 md:grid-cols-70/30 w-full gap-6">
            <main>
              <div className="bg-white p-6 rounded-lg shadow-md text-center md:text-left">
                <div className="text-gray-500 mb-4">{Dorms.location}</div>
                <h1 className="text-3xl font-bold mb-4">{Dorms.building}</h1>
                <div className="text-gray-500 mb-4 flex align-middle justify-center md:justify-start">
                  <FaMapMarker className='text-orange-700 mr-1' />
                  <p className="text-orange-700">{Dorms.address}, Boston MA, 02215</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                <h3 className="text-indigo-800 text-lg font-bold mb-6">Dorm Description</h3>
                <p className="mb-4">{Dorms.description}</p>
                <h3 className="text-indigo-800 text-lg font-bold mb-2">Yearly Cost</h3>
                <p className="mb-4">{Dorms.currentCost} / Year</p>
                <h3 className="text-indigo-800 text-lg font-bold mb-2">Dining Plan Required?</h3>
                <p className="mb-4">{Dorms.diningPlanRequired}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                <h3 className="text-indigo-800 text-lg font-bold mb-6">T-Stop and Dining Hall</h3>
                <p className="mb-4">Closest T-Stop: {Dorms.tStop}</p>
                <p className="mb-4">Closest Dining Hall: {Dorms.diningHall}</p>
              </div>
            </main>

            <aside>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-6">Pictures</h3>
                <p className="my-2">{Dorms.roommateInfo}</p>
                <hr className="my-4" />
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
};

const dormLoader = async ({ params }) => {
  const res = await fetch(`/api/Dorms/${params.id}`);
  const data = await res.json();
  return data;
};

export { SingleDorm as default, dormLoader};
