import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapContainer, TileLayer, Polyline, Marker, Popup
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import openrouteservice from 'openrouteservice-js';
import { fetchTripPlaces } from '../api';

const MODES = [
  { id: 'driving-car', label: '🚗', title: 'Car' },
  { id: 'foot-walking', label: '🚶', title: 'Walk' },
  { id: 'cycling-regular', label: '🚲', title: 'Bike' },
];

export default function TripRoutePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [waypoints,  setWaypoints]  = useState([]);
  const [coordinates, setCoordinates] = useState([]);
  const [mode,       setMode]       = useState('foot-walking');
  const [loading,    setLoading]    = useState(true);

  /* 1️⃣  Завантажуємо збережені пам’ятки */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await fetchTripPlaces(id);
        if (!data.length) throw new Error();
        setWaypoints(data);
      } catch {
        alert('Маршрут не знайдено');
        navigate(-1);
      }
    })();
  }, [id]);

  /* 2️⃣  Будуємо маршрут коли є waypoints або міняється mode */
  useEffect(() => {
    if (!waypoints.length) return;
    let canceled = false;
    setLoading(true);

    (async () => {
      const ors    = new openrouteservice.Directions({
        api_key: import.meta.env.VITE_ORS_API_KEY,
      });
      const coords = waypoints.map(w => [w.lng, w.lat]);
      const base   = { coordinates: coords, profile: mode, format: 'geojson' };

      const tryCalc = p => ors.calculate(p)
        .then(r => r.features[0].geometry.coordinates
                        .map(([lng, lat]) => [lat, lng]));

      let line = null;
      try { line = await tryCalc(base); }
      catch {
        try { line = await tryCalc(base); } catch {}
      }

      if (!canceled) {
        if (line) setCoordinates(line);
        setLoading(false);
      }
    })();

    return () => { canceled = true; };
  }, [waypoints, mode]);

  if (loading) return <p className="p-6">Завантаження маршруту…</p>;
  if (!waypoints.length)
    return <p className="p-6 text-red-600">Маршрут не знайдено</p>;

  const center = [waypoints[0].lat, waypoints[0].lng];

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Маршрут поїздки</h1>

      {/* transport buttons */}
      <div className="flex gap-2">
        {MODES.map(m => (
          <button
            key={m.id}
            title={m.title}
            className={`px-3 py-1 border rounded ${
              mode === m.id ? 'bg-blue-600 text-white' : 'bg-gray-100'
            } hover:bg-gray-200`}
            onClick={() => setMode(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* map */}
      <MapContainer center={center} zoom={13} style={{height:'60vh'}}>
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline positions={coordinates} />
        {waypoints.map((wp,i) => (
          <Marker key={i} position={[wp.lat, wp.lng]}>
            <Popup>{wp.title}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
