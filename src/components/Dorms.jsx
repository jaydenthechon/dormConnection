import React, { useState, useEffect } from 'react';
import Dorm from './Dorm';

const Dorms = () => {
  const [dorms, setDorms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDorms = async () => {
      const apiUrl = '/api/Dorms';
      try {
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error('Error fetching dorm data');
        const data = await res.json();
        setDorms(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDorms();
  }, []);

  return (
    <section className="bg-blue-50 px-4 py-10">
      <div className="container-xl lg:container m-auto">
        <h2 className="text-3xl font-bold text-indigo-500 mb-6 text-center">
          Browse Dorms
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            <h2>Loading...</h2>
          ) : error ? (
            <h2 className="text-red-500">{error}</h2>
          ) : (
            dorms.map((Dorms) => <Dorm key={Dorms.id} dorm={Dorms} />)
          )}
        </div>
      </div>
    </section>
  );
};

export default Dorms;
