// src/layouts/TripLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function TripLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto md:ml-0">
        {/* <Outlet/> — a place where React-Router substitutes a child route*/}
        <Outlet />
      </main>
    </div>
  );
}
