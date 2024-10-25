import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const AddListingPage = ({ addListingSubmit }) => {
  // Basic fields
  const [building, setBuilding] = useState('')
  const [TradeDescription, setTradeDescription] = useState('')
  const [DormType, setDormType] = useState('')
  const [DormStyle, setDormStyle] = useState('')
  const [address, setAddress] = useState('')
  const [lookingFor, setLookingFor] = useState('')
  const [roomNumber, setRoomNumber] = useState('')
  const [description, setDescription] = useState('')
  const [currentCost, setCurrentCost] = useState('')
  const [costDifference, setCostDifference] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [featuresAsString, setFeaturesAsString] = useState('')

  // Roommate description
  const [aboutRoommateDescription, setAboutRoommateDescription] = useState('')

  // Features checkboxes
  const [hasLaundryInBuilding, setHasLaundryInBuilding] = useState(false)
  const [hasStudyLounge, setHasStudyLounge] = useState(false)
  const [hasKitchen, setHasKitchen] = useState(false)
  const [hasBikeStorage, setHasBikeStorage] = useState(false)
  const [hasWaterFountain, setHasWaterFountain] = useState(false)
  const [hasDiningHall, setHasDiningHall] = useState(false)
  const [hasElevator, setHasElevator] = useState(false)
  const [hasPrivateBath, setHasPrivateBath] = useState(false)

  const [error, setError] = useState('')
  const [formError, setFormError] =useState('')

  const navigate = useNavigate()

  // Update TradeDescription whenever DormType or DormStyle changes
  useEffect(() => {
    setTradeDescription(`${DormType} in ${DormStyle}`)
  }, [DormType, DormStyle])
  

  // Update featuresAsString whenever any of the features change
  useEffect(() => {
    const featuresList = [
      { label: 'Laundry in Building', checked: hasLaundryInBuilding },
      { label: 'Study Lounge', checked: hasStudyLounge },
      { label: 'Kitchen', checked: hasKitchen },
      { label: 'Bike Storage', checked: hasBikeStorage },
      { label: 'Water Fountain', checked: hasWaterFountain },
      { label: 'Dining Hall', checked: hasDiningHall },
      { label: 'Elevator', checked: hasElevator },
      { label: 'Private Bathroom', checked: hasPrivateBath }
    ]

    const selectedFeatures = featuresList
      .filter(feature => feature.checked)
      .map(feature => `• ${feature.label}`)
      .join('\n')

    setFeaturesAsString(selectedFeatures)
  }, [
    hasLaundryInBuilding,
    hasStudyLounge,
    hasKitchen,
    hasBikeStorage,
    hasWaterFountain,
    hasDiningHall,
    hasElevator,
    hasPrivateBath
  ])

  const handleRoomNumberChange = (e) => {
    const sanitizedValue = e.target.value.replace(/[^0-9]/g, ''); // Sanitize input
    setRoomNumber(sanitizedValue); // Update state
    setError(''); // Reset the error when the input changes
  }

  const handleBlur = () => {
    if (roomNumber < 1 || roomNumber > 27) {
      setError('Floor number must be between 1 and 27')
    }
  }
  const validateForm = () => {
    if (
      DormType !== 'selectOne' &&
      DormStyle !== 'selectOne' &&
      lookingFor !== 'selectOne' &&
      building !== 'selectOne' // Added Building Location validation
    ) {
      return true
    }else{
        setFormError('Please make sure to select a value for all fields.')
        return false
        
    }
  }

  const submitForm = (e) => {
    e.preventDefault()

    if (!validateForm()) {
        return false // Stop form submission if validation fails
    }else{


    const newListing = {
      building,
      TradeDescription,
      DormType,
      DormStyle,
      address,
      lookingFor,
      roomNumber,
      description,
      currentCost,
      costDifference,
      contactEmail,
      aboutRoommate: {
        description: aboutRoommateDescription
      },
      dormFeatures: {
        featuresAsString,
        hasLaundryInBuilding,
        hasStudyLounge,
        hasKitchen,
        hasBikeStorage,
        hasWaterFountain,
        hasDiningHall,
        hasElevator,
        hasPrivateBath
      }
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

              {/* Error Message */}
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

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
                  <option value="selectOne">Select one</option>
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
                  <option value="selectOne">Select one</option>
                  <option value="Dorm">Dorm</option>
                  <option value="Suite">Suite</option>
                  <option value="Studio Apartment">Studio Apartment</option>
                  <option value="2 Person Apartment">2 Person Apartment</option>
                  <option value="3 Person Apartment">3 Person Apartment</option>
                  <option value="4 Person Apartment">4 Person Apartment</option>
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
                  <option value="selectOne">Select one</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-Binary/Other">Non-Binary/Other</option>
                  <option value="Gender Neutral">Doesn't Matter (gender neutral)</option>
                </select>
              </div>

              {/* Building Location */}
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
                  <option value="selectOne">Select one</option> {/* Added default option */}
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
                <label htmlFor="roomNumber" className="block text-gray-700 font-bold mb-2">
                  Please List the Floor Number
                </label>
                <input
                  type="number"
                  id="roomNumber"
                  name="roomNumber"
                  className="border rounded w-full py-2 px-3 mb-2"
                  placeholder="eg. 208"
                  value={roomNumber}
                  onChange={handleRoomNumberChange}
                  onBlur={handleBlur}
                  min="1"
                  max="27"
                />
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              </div>

               {/* Building Number */}
               <div className="mb-4">
                <label htmlFor="address" className="block text-gray-700 font-bold mb-2">
                  Please List the Building Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  className="border rounded w-full py-2 px-3 mb-2"
                  placeholder="eg. 277 Babcock St, 42 Buswell, 33 Harry Agganis Way, etc."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
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

              {/* Dorm Features */}
              <div className="mb-4">
                <h4 className="text-gray-700 font-bold mb-2">Dorm Features</h4>
                <label className="block mb-2">
                  <input
                    type="checkbox"
                    checked={hasLaundryInBuilding}
                    onChange={() => setHasLaundryInBuilding(!hasLaundryInBuilding)}
                  />{' '}
                  Laundry in Building
                </label>
                <label className="block mb-2">
                  <input
                    type="checkbox"
                    checked={hasStudyLounge}
                    onChange={() => setHasStudyLounge(!hasStudyLounge)}
                  />{' '}
                  Study Lounge
                </label>
                <label className="block mb-2">
                  <input
                    type="checkbox"
                    checked={hasKitchen}
                    onChange={() => setHasKitchen(!hasKitchen)}
                  />{' '}
                  Kitchen
                </label>
                <label className="block mb-2">
                  <input
                    type="checkbox"
                    checked={hasBikeStorage}
                    onChange={() => setHasBikeStorage(!hasBikeStorage)}
                  />{' '}
                  Bike Storage
                </label>
                <label className="block mb-2">
                  <input
                    type="checkbox"
                    checked={hasWaterFountain}
                    onChange={() => setHasWaterFountain(!hasWaterFountain)}
                  />{' '}
                  Water Fountain
                </label>
                <label className="block mb-2">
                  <input
                    type="checkbox"
                    checked={hasDiningHall}
                    onChange={() => setHasDiningHall(!hasDiningHall)}
                  />{' '}
                  Dining Hall
                </label>
                <label className="block mb-2">
                  <input
                    type="checkbox"
                    checked={hasElevator}
                    onChange={() => setHasElevator(!hasElevator)}
                  />{' '}
                  Elevator
                </label>
                <label className="block mb-2">
                  <input
                    type="checkbox"
                    checked={hasPrivateBath}
                    onChange={() => setHasPrivateBath(!hasPrivateBath)}
                  />{' '}
                  Private Bathroom
                </label>
              </div>

              <div className="mb-4">
                <label htmlFor="ContactEmail" className="block text-gray-700 font-bold mb-2">
                  Contact Email
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  className="border rounded w-full py-2 px-3 mb-2"
                  placeholder="bu.edu"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                />
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
