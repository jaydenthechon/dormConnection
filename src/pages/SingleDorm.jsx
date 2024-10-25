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
          <Link to="/dorms" className="text-indigo-500 hover:text-indigo-600 flex items-center">
            <FaArrowLeft className='mr-2' /> Back to Dorms
          </Link>
        </div>
      </section>

      <section className="bg-indigo-50">
        <div className="container m-auto py-10 px-6">
          <div className="grid grid-cols-1 md:grid-cols-70/30 w-full gap-6">
            <main>
              <div className="bg-white p-6 rounded-lg shadow-md text-center md:text-left">
                <div className="text-gray-500 mb-4">{Dorms.building}</div>
                <h1 className="text-3xl font-bold mb-4">{Dorms.DormType} ({Dorms.occupancy})</h1>
                <div className="text-gray-500 mb-4 flex align-middle justify-center md:justify-start">
                  <FaMapMarker className='text-orange-700 mr-1' />
                  <p className="text-orange-700">{Dorms.address}, Floor {Dorms.floorNumber}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                <h3 className="text-indigo-800 text-lg font-bold mb-6">Dorm Description</h3>
                <p className="mb-4">{Dorms.description}</p>
                <h3 className="text-indigo-800 text-lg font-bold mb-2">Yearly Cost</h3>
                <p className="mb-4">{Dorms.cost} / Year</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                <h3 className="text-indigo-800 text-lg font-bold mb-6">Features</h3>
                <p className="mb-4">{Dorms.features.join(', ')}</p>
              </div>
            </main>

            <aside>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-6">Roommate Information</h3>
                <p className="my-2">{Dorms.roommateInfo}</p>
                <hr className="my-4" />
                <h3 className="text-xl">Contact Email:</h3>
                <p className="my-2 bg-indigo-100 p-2 font-bold">{Dorms.contactEmail}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                <h3 className="text-xl font-bold mb-6">Manage Dorm</h3>
                <Link to={`/dorms/edit/${Dorms.id}`} className="bg-indigo-500 hover:bg-indigo-600 text-white text-center font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline mt-4 block">
                  Edit Dorm
                </Link>
                <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline mt-4 block">
                  Delete Dorm
                </button>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
};

const dormLoader = async ({ params }) => {
  const res = await fetch(`/api/dorms/${params.id}`);
  const data = await res.json();
  return data;
};

export { SingleDorm as default, dormLoader};
