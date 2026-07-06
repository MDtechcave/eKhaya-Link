import React, { useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { initialMockProperties } from '../data/mockData';

// Safely load the Map component on the client-side to prevent SSR crashes
const Map = dynamic(() => import('../components/Map'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-100 flex items-center justify-center text-xs text-slate-400">Loading Khayelitsha Map Engine...</div>
});

export default function Home() {
  const [properties, setProperties] = useState(initialMockProperties || []);
  const [filterArea, setFilterArea] = useState('All');

  const filteredListings = properties.filter(item => 
    filterArea === 'All' || item.area_section === filterArea
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col h-screen">
      <Head>
        <title>eKhaya Link | Safe Township Property</title>
      </Head>

      <header className="bg-white border-b border-slate-200 p-4 shrink-0">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-black text-blue-600">🏡 eKhaya Link</h1>
          <span className="text-xs bg-green-100 text-green-800 font-bold px-3 py-1 rounded-full">
            🛡️ Scam-Protected Marketplace
          </span>
        </div>
      </header>

      {/* Control Filter Bar */}
      <div className="bg-white border-b border-slate-200 p-4 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Select Sector</label>
            <select 
              onChange={(e) => setFilterArea(e.target.value)} 
              className="bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-xs font-bold"
            >
              <option value="All">All Khayelitsha</option>
              <option value="Ilitha Park">Ilitha Park</option>
              <option value="Site C">Site C</option>
            </select>
          </div>
          <p className="text-[11px] text-slate-400 italic">Next.js v13 Mock Workspace</p>
        </div>
      </div>

      {/* Main Content Split View Screen */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden max-w-7xl w-full mx-auto p-4 gap-4">
        
        {/* Left Side: Sticky Visual Map Interface */}
        <div className="w-full md:w-1/2 h-[300px] md:h-full relative shrink-0 md:shrink">
          <Map properties={filteredListings} />
        </div>

        {/* Right Side: Scrollable Listing Feed Cards */}
        <div className="w-full md:w-1/2 h-full overflow-y-auto space-y-4 pr-1 pb-10">
          {filteredListings.map((house) => (
            <div key={house.property_id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col sm:flex-row">
              <div className="relative w-full sm:w-40 h-40 bg-slate-100 shrink-0">
                <img src={house.image} alt={house.title} className="w-full h-full object-cover" />
                <span className={`absolute top-2 left-2 text-[9px] font-black px-2 py-0.5 rounded shadow ${
                  house.verification_status === 'verified' ? 'bg-green-600 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {house.verification_status === 'verified' ? '🛡️ SECURE' : '⏳ VETTING'}
                </span>
              </div>
              <div className="p-4 flex flex-col justify-between flex-1">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{house.area_section}</span>
                  <h3 className="text-sm font-bold text-slate-800 leading-tight mt-0.5">{house.title}</h3>
                  <p className="text-lg font-black text-slate-900 mt-1">R {house.price.toLocaleString('en-ZA')}</p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 mt-2">
                  <span>Erf: {house.erf_number}</span>
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded font-bold">Agent: {house.agent}</span>
                </div>
              </div>
            </div>
          ))}
          {filteredListings.length === 0 && (
            <div className="p-8 text-center text-sm text-slate-400">No properties found in this location sector.</div>
          )}
        </div>
        
      </main>
    </div>
  );
}
