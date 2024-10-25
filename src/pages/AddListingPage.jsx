import React, { useState } from 'react'
import DOMPurify from 'dompurify'
import { useNavigate } from 'react-router-dom'

const AddListingPage = ({ addListingSubmit }) => {
  const [building, setBuilding] = useState('')
  const [DormType, setDormType] = useState('')
  const [DormStyle, setDormStyle] = useState('')
  const [lookingFor, setLookingFor] = useState('')
  const [buildingNumber, setBuildingNumber] = useState('')
  const [description, setDescription] = useState('')
  
  const [error, setError] = useState(''); // Error state to track validation errors

  const handleBuildingNumberChange = (e) => {
    const sanitizedValue = e.target.value.replace(/[^0-9]/g, ''); // Sanitize input
    setBuildingNumber(sanitizedValue); // Update state
    setError(''); // Reset the error when the input changes
  };

  const handleBlur = () => {
    if (!buildingNumber) {
      setError('Building number is required');
    } else if (buildingNumber < 1 || buildingNumber > 1000) {
      setError('Building number must be between 1 and 1000');
    }
  };

  const navigate = useNavigate()

  const submitForm = (e) => {
    e.preventDefault()

    const newListing = {
      building,
      DormType,
      DormStyle,
      lookingFor,
      buildingNumber,
      description,
      aboutRoommate: {
        description
      }
    }

    addListingSubmit(newListing)
    navigate('/listings')
  }

  return (
    <>
      <section className="bg-indigo-50">
        <div className="container m-auto max-w-2xl py-24">
          <div className="bg-white px-6 py-8 mb-4 shadow-md rounded-md border m-4 md:m-0">
            <form onSubmit={submitForm}>
              <h2 className="text-3xl text-center font-semibold mb-6">Listing Form</h2>

              {/* Dorm Type */}
              <div className="mb-4">
                <label htmlFor="dormType" className="block text-gray-700 font-bold mb-2">
                  Dorm Type
                </label>
                <select
                  id="dormType"
                  name="dormType"
                  className="border rounded w-full py-2 px-3"
                  required
                  value={DormType}
                  onChange={(e) => setDormType(e.target.value)}
                >
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                  <option value="Triple">Triple</option>
                  <option value="Quad">Quad</option>
                </select>
              </div>

              {/* Dorm Style */}
              <div className="mb-4">
                <label htmlFor="dormStyle" className="block text-gray-700 font-bold mb-2">
                  Dorm Style
                </label>
                <select
                  id="dormStyle"
                  name="dormStyle"
                  className="border rounded w-full py-2 px-3"
                  required
                  value={DormStyle}
                  onChange={(e) => setDormStyle(e.target.value)}
                >
                  <option value="Dorm">Dorm</option>
                  <option value="Suite">Suite</option>
                  <option value="Apartment">Apartment</option>
                  <option value="STUVI I/II">STUVI I/II</option>
                </select>
              </div>

              {/* Looking For */}
              <div className="mb-4">
                <label htmlFor="lookingFor" className="block text-gray-700 font-bold mb-2">
                  Looking For...
                </label>
                <select
                  id="lookingFor"
                  name="lookingFor"
                  className="border rounded w-full py-2 px-3"
                  required
                  value={lookingFor}
                  onChange={(e) => setLookingFor(e.target.value)}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-Binary/Other">Non-Binary/Other</option>
                  <option value="Gender Neutral">Doesn't Matter (gender neutral)</option>
                </select>
              </div>

              {/* Current Location */}
              <div className="mb-4">
                <label htmlFor="building" className="block text-gray-700 font-bold mb-2">
                  Current Location
                </label>
                <select
                  id="building"
                  name="building"
                  className="border rounded w-full py-2 px-3"
                  required
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                >
                  <option value="1019">1019</option>
                  <option value="10 Buick St (Stuvi 1)">10 Buick St (Stuvi 1)</option>
                  <option value="33 Harry Agganis Way">33 Harry Agganis Way (Stuvi 2)</option>
                  <option value="Baystate Brownstones">Baystate Brownstones</option>
                  <option value="Commonwealth Ave Brownstones">Commonwealth Ave Brownstones</option>
                  <option value="South Campus">South Campus</option>
                  <option value="Whitestones">Whitestones</option>
                  {/* More options... */}
                </select>
              </div>

              {/* Building Number */}
              <div className="mb-4">
                <label htmlFor="buildingNumber" className="block text-gray-700 font-bold mb-2">
                  Please List the Building Number
                </label>
                <input
                  type="number"
                  id="buildingNumber"
                  name="buildingNumber"
                  className="border rounded w-full py-2 px-3 mb-2"
                  placeholder="eg. 208"
                  value={buildingNumber}
                  onChange={handleBuildingNumberChange}
                  onBlur={handleBlur}
                  min="1"
                  max="1000"
                  required={['Baystate', 'Whitestones', 'Commonwealth Ave Brownstones', 'South'].includes(building)}
                />
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              </div>

              {/* Description */}
              <div className="mb-4">
                <label htmlFor="description" className="block text-gray-700 font-bold mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="border rounded w-full py-2 px-3"
                  rows="5"
                  placeholder="Info such as: Faces the Charles, good sunlight, close to CAS, etc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline"
                  type="submit"
                >
                  Add Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}

export default AddListingPage
