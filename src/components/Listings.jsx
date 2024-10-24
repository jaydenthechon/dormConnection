import React from 'react'
import jobs from '../jobs.json'
import Listing from './Listing'
import{useState, useEffect} from 'react'


const Listings = ({isHome = false}) => {
    const[listing, setListing] = useState([])
    const[loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchListings = async () => {
            const apiURL = isHome ? '/api/jobs?_limit=3' : '/api/jobs'
            try{
                const res = await fetch(apiURL)
                const data = await res.json()
                setListing(data)
            }catch (error) {
                console.log('Error fetching data', error)
            }finally{
                setLoading(false)
            }
        }
        fetchListings()
    }, [])

    
  return (
    <section className="bg-blue-50 px-4 py-10">
      <div className="container-xl lg:container m-auto">
        <h2 className="text-3xl font-bold text-indigo-500 mb-6 text-center">
          {isHome ? 'Recent Listings' : 'Browse Listings'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? (
                <h2>Loading...</h2>
            ) : (
                <>
            {listing.map((job) => (
                <Listing key={job.id} job={job} />
                ))}
            </>
            ) }
            
          
        </div>
      </div>
    </section>
  )
}

export default Listings
