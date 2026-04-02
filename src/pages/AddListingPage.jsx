import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { buildApiUrl } from '../utils/api';

const BUILDING_OPTIONS = [
  '1019 Commonwealth Ave',
  '10 Buick St',
  '33 Harry Agganis Way',
  '575 Commonwealth Ave',
  '610 Beacon St',
  'Baystate Brownstones',
  'Commonwealth Ave Brownstones',
  'Danielson Hall',
  'Fenway Campus',
  'Kilachand Hall',
  'South Campus',
  'Towers',
  'Warren Towers',
  'West Campus',
  'Off-Campus',
  'Other',
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AddListingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [building, setBuilding] = useState('');
  const [tradeDescription, setTradeDescription] = useState('');
  const [dormType, setDormType] = useState('');
  const [dormStyle, setDormStyle] = useState('');
  const [address, setAddress] = useState('');
  const [lookingFor, setLookingFor] = useState('');
  const [floorNumber, setFloorNumber] = useState('');
  const [description, setDescription] = useState('');
  const [currentCost, setCurrentCost] = useState('');
  const [costDifference, setCostDifference] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [aboutRoommateDescription, setAboutRoommateDescription] = useState('');

  const [hasLaundryInBuilding, setHasLaundryInBuilding] = useState(false);
  const [hasStudyLounge, setHasStudyLounge] = useState(false);
  const [hasKitchen, setHasKitchen] = useState(false);
  const [hasBikeStorage, setHasBikeStorage] = useState(false);
  const [hasWaterFountain, setHasWaterFountain] = useState(false);
  const [hasDiningHall, setHasDiningHall] = useState(false);
  const [hasElevator, setHasElevator] = useState(false);
  const [hasPrivateBath, setHasPrivateBath] = useState(false);

  const [buildingError, setBuildingError] = useState('');
  const [dormTypeError, setDormTypeError] = useState('');
  const [dormStyleError, setDormStyleError] = useState('');
  const [lookingForError, setLookingForError] = useState('');
  const [floorNumberError, setFloorNumberError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [contactEmailError, setContactEmailError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setLoading(false);
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const typeText = dormType.trim();
    const styleText = dormStyle.trim();

    if (typeText && styleText) {
      setTradeDescription(`${typeText} in a ${styleText}`);
    } else if (typeText) {
      setTradeDescription(typeText);
    } else {
      setTradeDescription('');
    }
  }, [dormType, dormStyle]);

  const getFeaturesAsString = () => {
    const selectedFeatures = [
      { label: 'Laundry in Building', checked: hasLaundryInBuilding },
      { label: 'Study Lounge', checked: hasStudyLounge },
      { label: 'Kitchen', checked: hasKitchen },
      { label: 'Bike Storage', checked: hasBikeStorage },
      { label: 'Water Fountain', checked: hasWaterFountain },
      { label: 'Dining Hall', checked: hasDiningHall },
      { label: 'Elevator', checked: hasElevator },
      { label: 'Private Bathroom', checked: hasPrivateBath },
    ]
      .filter((feature) => feature.checked)
      .map((feature) => `• ${feature.label}`)
      .join('\n');

    return selectedFeatures;
  };

  const validateForm = () => {
    let isValid = true;

    setBuildingError('');
    setDormTypeError('');
    setDormStyleError('');
    setLookingForError('');
    setFloorNumberError('');
    setAddressError('');
    setContactEmailError('');

    if (!building || building === 'selectOne') {
      setBuildingError('Please select a location.');
      isValid = false;
    }

    if (!dormType || dormType === 'selectOne') {
      setDormTypeError('Please select a room type.');
      isValid = false;
    }

    if (!dormStyle || dormStyle === 'selectOne') {
      setDormStyleError('Please select a property style.');
      isValid = false;
    }

    if (!lookingFor || lookingFor === 'selectOne') {
      setLookingForError('Please choose your preference for roommate matching.');
      isValid = false;
    }

    const floorValue = Number(floorNumber);
    if (!floorNumber || Number.isNaN(floorValue) || floorValue < 0 || floorValue > 120) {
      setFloorNumberError('Floor number must be between 0 and 120.');
      isValid = false;
    }

    if (!address || address.trim().length < 6) {
      setAddressError('Please enter a valid address.');
      isValid = false;
    }

    if (!contactEmail || !EMAIL_REGEX.test(contactEmail.trim())) {
      setContactEmailError('Please enter a valid contact email.');
      isValid = false;
    }

    return isValid;
  };

  const submitForm = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const newListing = {
      building,
      TradeDescription: tradeDescription,
      DormType: dormType,
      DormStyle: dormStyle,
      address,
      lookingFor,
      floorNumber,
      description,
      currentCost,
      costDifference,
      contactEmail: contactEmail.trim(),
      aboutRoommate: {
        description: aboutRoommateDescription,
      },
      dormFeatures: {
        featuresAsString: getFeaturesAsString(),
        hasLaundryInBuilding,
        hasStudyLounge,
        hasKitchen,
        hasBikeStorage,
        hasWaterFountain,
        hasDiningHall,
        hasElevator,
        hasPrivateBath,
      },
    };

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(buildApiUrl('/api/listings'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newListing),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to create listing');
      }

      navigate('/listings');
    } catch (err) {
      setError(err.message || 'Error creating listing');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="bg-indigo-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-indigo-700">Loading...</h2>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-indigo-50">
      <div className="container m-auto max-w-2xl py-24">
        <div className="bg-white px-6 py-8 mb-4 shadow-md rounded-md border m-4 md:m-0">
          <form onSubmit={submitForm}>
            <h2 className="text-3xl text-center font-semibold mb-3">Post a Listing</h2>
            <p className="text-center text-sm text-gray-600 mb-5">Create as many listings as you need and manage them from your account.</p>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="dormType" className="block text-gray-700 font-bold mb-2">Room Type</label>
              <select
                id="dormType"
                className="border rounded w-full py-2 px-3"
                required
                value={dormType}
                onChange={(e) => setDormType(e.target.value)}
              >
                <option value="selectOne">Select one</option>
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Triple">Triple</option>
                <option value="Quad">Quad</option>
              </select>
              {dormTypeError && <p className="text-red-500 text-sm">{dormTypeError}</p>}
            </div>

            <div className="mb-4">
              <label htmlFor="dormStyle" className="block text-gray-700 font-bold mb-2">Property Style</label>
              <select
                id="dormStyle"
                className="border rounded w-full py-2 px-3"
                required
                value={dormStyle}
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
              {dormStyleError && <p className="text-red-500 text-sm">{dormStyleError}</p>}
            </div>

            <div className="mb-4">
              <label htmlFor="lookingFor" className="block text-gray-700 font-bold mb-2">Looking For</label>
              <select
                id="lookingFor"
                className="border rounded w-full py-2 px-3"
                required
                value={lookingFor}
                onChange={(e) => setLookingFor(e.target.value)}
              >
                <option value="selectOne">Select one</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-Binary/Other">Non-Binary/Other</option>
                <option value="Gender Neutral">No Preference</option>
              </select>
              {lookingForError && <p className="text-red-500 text-sm">{lookingForError}</p>}
            </div>

            <div className="mb-4">
              <label htmlFor="building" className="block text-gray-700 font-bold mb-2">Current Location</label>
              <select
                id="building"
                className="border rounded w-full py-2 px-3"
                required
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
              >
                <option value="selectOne">Select one</option>
                {BUILDING_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              {buildingError && <p className="text-red-500 text-sm">{buildingError}</p>}
            </div>

            <div className="mb-4">
              <label htmlFor="floorNumber" className="block text-gray-700 font-bold mb-2">Floor Number</label>
              <input
                type="number"
                id="floorNumber"
                className="border rounded w-full py-2 px-3 mb-2"
                placeholder="e.g. 12"
                value={floorNumber}
                onChange={(e) => setFloorNumber(e.target.value)}
                min="0"
                max="120"
                required
              />
              {floorNumberError && <p className="text-red-500 text-sm mt-1">{floorNumberError}</p>}
            </div>

            <div className="mb-4">
              <label htmlFor="address" className="block text-gray-700 font-bold mb-2">Address</label>
              <input
                type="text"
                id="address"
                className="border rounded w-full py-2 px-3 mb-2"
                placeholder="Street address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
              {addressError && <p className="text-red-500 text-sm">{addressError}</p>}
            </div>

            <div className="mb-4">
              <label htmlFor="currentCost" className="block text-gray-700 font-bold mb-2">Estimated Yearly Cost</label>
              <input
                type="text"
                id="currentCost"
                className="border rounded w-full py-2 px-3"
                placeholder="e.g. 18000"
                value={currentCost}
                onChange={(e) => setCurrentCost(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="costDifference" className="block text-gray-700 font-bold mb-2">Cost Difference Notes</label>
              <input
                type="text"
                id="costDifference"
                className="border rounded w-full py-2 px-3"
                placeholder="e.g. +1200 compared to current lease"
                value={costDifference}
                onChange={(e) => setCostDifference(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="block text-gray-700 font-bold mb-2">Description</label>
              <textarea
                id="description"
                className="border rounded w-full py-2 px-3"
                rows="5"
                placeholder="Amenities, sunlight, neighborhood, commute, etc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            <div className="mb-4">
              <label htmlFor="aboutRoommate" className="block text-gray-700 font-bold mb-2">About Current Roommate(s)</label>
              <textarea
                id="aboutRoommate"
                className="border rounded w-full py-2 px-3"
                rows="3"
                placeholder="Optional"
                value={aboutRoommateDescription}
                onChange={(e) => setAboutRoommateDescription(e.target.value)}
              ></textarea>
            </div>

            <div className="mb-4">
              <h4 className="text-gray-700 font-bold mb-2">Property Features</h4>
              <label className="block mb-2"><input type="checkbox" checked={hasLaundryInBuilding} onChange={() => setHasLaundryInBuilding(!hasLaundryInBuilding)} /> Laundry in Building</label>
              <label className="block mb-2"><input type="checkbox" checked={hasStudyLounge} onChange={() => setHasStudyLounge(!hasStudyLounge)} /> Study Lounge</label>
              <label className="block mb-2"><input type="checkbox" checked={hasKitchen} onChange={() => setHasKitchen(!hasKitchen)} /> Kitchen</label>
              <label className="block mb-2"><input type="checkbox" checked={hasBikeStorage} onChange={() => setHasBikeStorage(!hasBikeStorage)} /> Bike Storage</label>
              <label className="block mb-2"><input type="checkbox" checked={hasWaterFountain} onChange={() => setHasWaterFountain(!hasWaterFountain)} /> Water Fountain</label>
              <label className="block mb-2"><input type="checkbox" checked={hasDiningHall} onChange={() => setHasDiningHall(!hasDiningHall)} /> Dining Hall</label>
              <label className="block mb-2"><input type="checkbox" checked={hasElevator} onChange={() => setHasElevator(!hasElevator)} /> Elevator</label>
              <label className="block mb-2"><input type="checkbox" checked={hasPrivateBath} onChange={() => setHasPrivateBath(!hasPrivateBath)} /> Private Bathroom</label>
            </div>

            <div className="mb-4">
              <label htmlFor="contactEmail" className="block text-gray-700 font-bold mb-2">Contact Email</label>
              <input
                type="email"
                id="contactEmail"
                className="border rounded w-full py-2 px-3 mb-2"
                placeholder="name@example.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
              />
              {contactEmailError && <p className="text-red-500 text-sm">{contactEmailError}</p>}
            </div>

            <div>
              <button
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline disabled:opacity-60"
                type="submit"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Publish Listing'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default AddListingPage;
