import React from 'react'

const Listings = () => {
  return (
    <section className="bg-blue-50 px-4 py-10">
      <div className="container-xl lg:container m-auto">
        <h2 className="text-3xl font-bold text-indigo-500 mb-6 text-center">
          Browse Listings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/*<!-- Dorm Listing 1 --> */}
          <div className="bg-white rounded-xl shadow-md relative">
            <div className="p-4">
              <div className="mb-6">
                <div className="text-gray-600 my-2">West Campus</div>
                <h3 className="text-xl font-bold">Double in Sleeper Hall (Dorm Style)</h3>
              </div>

              <div className="mb-5">
               Placeholder
              </div>

              <h3 className="text-indigo-500 mb-2">Cost Difference: _____</h3>

              <div className="border border-gray-100 mb-5"></div>

              <div className="flex flex-col lg:flex-row justify-between mb-4">
                <div className="text-orange-700 mb-3">
                  <i className="fa-solid fa-location-dot text-lg"></i>
                  277 Babcock St, Charles River Campus
                </div>
                <a
                  href="job.html"
                  className="h-[36px] bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-center text-sm"
                >
                 Contact
                </a>
              </div>
            </div>
          </div>
          {/* <!-- Dorm Listing 2 --> */}
          <div className="bg-white rounded-xl shadow-md relative">
            <div className="p-4">
              <div className="mb-6">
                <div className="text-gray-600 my-2">Baystate Rd</div>
                <h3 className="text-xl font-bold">Single in Baystate Rd (Dorm Style)</h3>
              </div>

              <div className="mb-5">
               Placeholder
              </div>

              <h3 className="text-indigo-500 mb-2">Cost Difference: ____</h3>

              <div className="border border-gray-100 mb-5"></div>

              <div className="flex flex-col lg:flex-row justify-between mb-4">
                <div className="text-orange-700 mb-3">
                  <i className="fa-solid fa-location-dot text-lg"></i>
                  200 - 70 BSR, Charles River Campus
                </div>
                <a
                  href="job.html"
                  className="h-[36px] bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-center text-sm"
                >
                 Contact
                </a>
              </div>
            </div>
          </div>
          {/* <!-- Dorm Listing 3 --> */}
          <div className="bg-white rounded-xl shadow-md relative">
            <div className="p-4">
              <div className="mb-6">
                <div className="text-gray-600 my-2">Fenway Campus</div>
                <h3 className="text-xl font-bold">Single in 4 Person Apt</h3>
              </div>

              <div className="mb-5">
                Placeholder
              </div>

              <h3 className="text-indigo-500 mb-2">Cost Difference: ___</h3>

              <div className="border border-gray-100 mb-5"></div>

              <div className="flex flex-col lg:flex-row justify-between mb-4">
                <div className="text-orange-700 mb-3">
                  <i className="fa-solid fa-location-dot text-lg"></i>
                  Pilgrim House, Fenway Campus
                </div>
                <a
                  href="job.html"
                  className="h-[36px] bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-center text-sm"
                >
                 Read More
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Listings
