'use client';

import React from 'react';
import MapView from '@/components/MapView';

type Pin = {
  id: string;
  title: string;
  lat: number;
  lng: number;
  address: string;
  category: 'Vote Centers' | 'City Facility';
  url?: string;
  source?: string;
};

const IRVINE_LOCATIONS: Pin[] = [
  // --- Vote Centers ---
  {
    id: 'heritage-park-library',
    title: 'Vote Center – Heritage Park Library',
    lat: 33.6855,
    lng: -117.7802,
    address: '14361 Yale Ave, Irvine, CA 92604',
    category: 'Vote Centers',
  },
  {
    id: 'university-community-center',
    title: 'Vote Center – University Community Center',
    lat: 33.6606,
    lng: -117.824,
    address: '1 Beech Tree Ln, Irvine, CA 92612',
    category: 'Vote Centers',
  },
  {
    id: 'las-lomas-community-center',
    title: 'Vote Center – Las Lomas Community Center',
    lat: 33.6475,
    lng: -117.8269,
    address: '10 Federation Way, Irvine, CA 92603',
    category: 'Vote Centers',
  },
  {
    id: 'quail-hill-community-center',
    title: 'Vote Center – Quail Hill Community Center',
    lat: 33.6466,
    lng: -117.7763,
    address: '39 Shady Canyon Dr, Irvine, CA 92603',
    category: 'Vote Centers',
  },
  {
    id: 'portola-springs-community-center',
    title: 'Vote Center – Portola Springs Community Center',
    lat: 33.701,
    lng: -117.717,
    address: '900 Tomato Springs, Irvine, CA 92618',
    category: 'Vote Centers',
  },
  {
    id: 'woodbury-community-park',
    title: 'Vote Center – Woodbury Community Park',
    lat: 33.698,
    lng: -117.754,
    address: '130 Sanctuary, Irvine, CA 92620',
    category: 'Vote Centers',
  },
  {
    id: 'great-park-sports-complex',
    title: 'Vote Center – Great Park (Sports Complex)',
    lat: 33.674,
    lng: -117.743,
    address: '8272 Great Park Blvd, Irvine, CA 92618',
    category: 'Vote Centers',
  },
  {
    id: 'turtle-rock-community-park',
    title: 'Vote Center – Turtle Rock Community Park',
    lat: 33.6366,
    lng: -117.8173,
    address: '1 Sunnyhill, Irvine, CA 92603',
    category: 'Vote Centers',
  },
  {
    id: 'lakeview-senior-center',
    title: 'Vote Center – Lakeview Senior Center',
    lat: 33.6837,
    lng: -117.8007,
    address: '20 Lake Rd, Irvine, CA 92604',
    category: 'Vote Centers',
  },

  // --- City Facility (Civic Center) ---
  {
    id: 'irvine-civic-center',
    title: 'Irvine Civic Center',
    lat: 33.686,
    lng: -117.825,
    address: '1 Civic Center Plaza, Irvine, CA 92606',
    category: 'City Facility',
  },
];

export default function MapPage() {
  const categories = ['All', 'Vote Centers', 'City Facility'] as const;
  const [selected, setSelected] = React.useState<(typeof categories)[number]>('All');

  const pins = React.useMemo(() => {
    if (selected === 'All') return IRVINE_LOCATIONS;
    return IRVINE_LOCATIONS.filter((p) => p.category === selected);
  }, [selected]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white">
      <header className="border-b border-slate-200 bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Irvine Vote Centers & Civic Center
          </h1>
          <p className="mt-2 text-slate-600">
            Explore vote center locations and the Irvine Civic Center on the interactive map.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Filter Bar */}
        <div className="mb-6 flex flex-wrap gap-3">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelected(c)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                selected === c
                  ? 'bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 text-white shadow'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Map */}
        <MapView pins={pins} center={[33.6846, -117.8265]} zoom={12} />

        
      </main>

    
    </div>
  );
}
