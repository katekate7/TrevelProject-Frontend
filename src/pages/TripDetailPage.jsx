import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

export default function TripDetailPage() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [trip, setTrip]    = useState(null);
  const [loading, setLoad] = useState(true);

  useEffect(() => {
    api.get(`/trips/${id}`)
       .then(r => setTrip(r.data))
       .catch(console.error)
       .finally(() => setLoad(false));
  }, [id]);

  if (loading) return <p>Завантаження…</p>;
  if (!trip)   return <p>Поїздка не знайдена</p>;

  /* ---------- контент сторінки ---------- */
  return (
    <div className="p-6 overflow-auto">

      <h1 className="text-3xl font-bold mb-4">
        {trip.city}, {trip.country}
      </h1>

      {trip.imageUrl && (
        <img
          src={trip.imageUrl}
          alt={`${trip.city} thumbnail`}
          className="mb-4 w-full max-w-md object-cover rounded-lg shadow"
        />
      )}

      <p className="text-lg leading-relaxed whitespace-pre-wrap mb-6">
        {trip.description}
      </p>

      {trip.weather && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow w-fit">
          <h3 className="text-xl font-semibold mb-2">Weather</h3>
          <p>Температура: {trip.weather.temperature}°C</p>
          <p>Опис: {trip.weather.weatherDescription}</p>
        </div>
      )}
    </div>
  );
}
