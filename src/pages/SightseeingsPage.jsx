// SightseeingsPage - displays city attractions from Wikipedia
import React, { useState, useEffect } from 'react'; // React core + hooks
import { useParams, useNavigate } from 'react-router-dom'; // For route params and navigation
import api, { saveTripPlaces } from '../api'; // API utility functions for backend calls
import SEO from '../components/SEO/SEO'; // SEO component for meta tags
import { seoConfig, generateCanonicalUrl } from '../components/SEO/seoConfig'; // SEO config and URL generator

// Helper function to format a Date object as YYYYMMDD
const fmt = d => d.toISOString().slice(0,10).replace(/-/g, '');

export default function SightseeingsPage() {
  const { id } = useParams(); // Extract trip ID from the URL
  const navigate = useNavigate(); // Function to programmatically navigate between pages

  // State to store the trip info loaded from the backend
  const [trip, setTrip] = useState(null);
  // State to store list of tourist places fetched from Wikipedia
  const [places, setPlaces] = useState([]);
  // State to store the set of selected place titles
  const [selectedTitles, setSelTitles] = useState(new Set());
  // State to track the loading phase ("loading", "loadingWiki", "loadingSaved", "ready", "error")
  const [phase, setPhase] = useState('loading');

  // 1) Load trip data from backend
  useEffect(() => {
    api.get(`/trips/${id}`)
      .then(r => {
        setTrip(r.data); // Save trip data
        setPhase('loadingWiki'); // Move to next phase: loading Wikipedia data
      })
      .catch(e => {
        console.error(e);
        setPhase('error'); // Show error state if failed
      });
  }, [id]);

  // 2) Load tourist attractions from Wikipedia API
  useEffect(() => {
    // Only run if we are in the "loadingWiki" phase and trip data is available
    if (phase !== 'loadingWiki' || !trip) return;
    
    (async () => {
      try {
        // Build Wikipedia category name: "Category:Tourist attractions in {city}"
        const cat = encodeURIComponent(`Category:Tourist attractions in ${trip.city}`);
        
        // Fetch the list of category members (tourist attractions) from Wikipedia
        const list = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*` +
          `&list=categorymembers&cmtitle=${cat}&cmtype=page&cmlimit=500`
        ).then(r => r.json());

        // Filter out non-attraction pages (lists, history, outlines, etc.)
        const bad = /^(List of|Outline of|Timeline of|Landmarks in|History of)/i;
        const raw = list.query.categorymembers.filter(p => !bad.test(p.title));

        // Define date range for page view stats (last 60 days)
        const today = new Date();
        const end = fmt(new Date(today - 1*24*3600*1000)); // Yesterday
        const start = fmt(new Date(today - 60*24*3600*1000)); // 60 days ago

        // Function to load detailed info about one attraction
        const loadOne = async p => {
          try {
            // Get summary & coordinates from Wikipedia REST API
            const sum = await fetch(
              `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(p.title)}`
            ).then(r => r.json());
            
            // Get page view stats from Wikimedia API
            const pv = await fetch(
              `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article` +
              `/en.wikipedia.org/all-access/user/${encodeURIComponent(p.title)}` +
              `/daily/${start}/${end}`
            ).then(r => r.ok ? r.json() : {items: []});

            // Return formatted attraction data
            return {
              id: p.pageid, // Wikipedia page ID
              title: p.title, // Attraction name
              desc: sum.extract || '—', // Short description
              imageUrl: sum.thumbnail?.source || null, // Thumbnail image URL
              lat: sum.coordinates?.lat, // Latitude
              lng: sum.coordinates?.lon, // Longitude
              views: (pv.items || []).reduce((t,i) => t + (i.views || 0), 0), // Total views in date range
            };
          } catch { 
            return null; // Skip if failed to load
          }
        };

        // Load all attractions, filter out ones without coordinates, sort by popularity, and take top 20
        const all = (await Promise.all(raw.map(loadOne)))
                        .filter(Boolean)
                        .filter(p => p.lat != null && p.lng != null)
                        .sort((a,b) => b.views - a.views)
                        .slice(0, 20);

        setPlaces(all); // Save places to state
        setPhase('loadingSaved'); // Move to next phase: load saved places
      } catch(e) {
        console.error(e);
        setPhase('error');
      }
    })();
  }, [phase, trip]);

  // 3) Load saved places for this trip from backend
  useEffect(() => {
    if (phase !== 'loadingSaved') return;
    (async () => {
      try {
        // Get saved places (already selected by user)
        const { data } = await api.get(`/trips/${id}/places`);
        setSelTitles(new Set(data.map(p => p.title))); // Save selected titles to state
        setPhase('ready'); // Data is ready for display
      } catch (e) {
        console.error('Could not load saved places:', e);
        setPhase('ready'); // Still move to ready even if loading fails
      }
    })();
  }, [phase, id]);

  // Toggle selection of a place by title
  const toggle = title => {
    setSelTitles(s => {
      const n = new Set(s);
      n.has(title) ? n.delete(title) : n.add(title);
      return n;
    });
  };

  // Save selected places and navigate to the route page
  const goToRoute = async () => {
    const picked = places.filter(p => selectedTitles.has(p.title)); // Get selected places
    if (!picked.length) return; // Do nothing if nothing selected
    
    // Save selected sightseeing titles to backend
    await api.patch(`/trips/${id}/sightseeings`, {
      titles: picked.map(p => p.title),
    }).catch(console.error);
    
    // Save waypoints (title + coordinates) for route generation
    const waypoints = picked.map(p => ({
      title: p.title, lat: p.lat, lng: p.lng
    }));
    await saveTripPlaces(id, waypoints).catch(console.error);

    // Navigate to the trip's route page
    navigate(`/trip/${id}/route`);
  };

  // Conditional rendering based on loading phase
  if (phase === 'loading')        return <p className="p-6">Download...</p>;
  if (phase === 'loadingWiki')    return <p className="p-6">Downloading sights…</p>;
  if (phase === 'loadingSaved')   return <p className="p-6">Downloading marks…</p>;
  if (phase === 'error')          return <p className="p-6 text-red-600">An error occurred</p>;

  return (
    <>
      {/* SEO metadata for search engines */}
      <SEO 
        title={`Que visiter à ${trip?.city} - ${seoConfig.destinations.title}`}
        description={`Découvrez les meilleurs lieux à visiter à ${trip?.city}. Guide touristique complet avec les attractions incontournables et itinéraires recommandés.`}
        keywords={`que visiter à ${trip?.city}, ${trip?.city} tourisme, attractions ${trip?.city}, ${seoConfig.destinations.keywords}`}
        url={generateCanonicalUrl(`/trip/${id}/sightseeings`)}
      />

      {/* Main content container */}
      <div className="p-6 pt-12 md:pt-6 max-w-4xl mx-auto relative">
      
      {/* Page heading */}
      <h1 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Abril Fatface, cursive' }}>
        Top 20 must-see in {trip.city}
      </h1>

      {/* List of attractions */}
      <ul className="space-y-6">
        {places.map(p=>(
          <li key={p.id} className="border rounded-lg p-4 flex flex-col sm:flex-row gap-4 shadow-sm items-center sm:items-start">
            {/* Checkbox for selecting attraction */}
            <input
              type="checkbox"
              className="mt-1 h-5 w-5 self-start"
              checked={selectedTitles.has(p.title)}
              onChange={()=>toggle(p.title)}
            />
            {/* Attraction image */}
            {p.imageUrl && (
              <img src={p.imageUrl} alt={p.title}
                   className="w-40 h-28 object-cover rounded-md" />
            )}
            {/* Attraction details */}
            <div className="w-full">
              <h2 className="text-xl font-semibold mb-1 text-white">{p.title}</h2>
              <p className="text-white">{p.desc}</p>
              <p className="text-xs text-gray-400 mt-1">
                👁 {p.views.toLocaleString()} views / 60 days
              </p>
            </div>
          </li>
        ))}
      </ul>

      {/* Button to build route */}
      <button
        onClick={goToRoute}
        disabled={selectedTitles.size===0} // Disabled if no places selected
        className="mt-8 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
      >
        ➜ Build a route
      </button>
    </div>
    </>
  );
}
