import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix for default Leaflet icon paths in Next.js environment
// Fix for default Leaflet icon paths in Next.js environment
const icon = L.icon({
  iconUrl: 'https://unpkg.com',
  shadowUrl: 'https://unpkg.com',
  iconSize:[25, 41],     
  iconAnchor:[12, 41],   
});

// Center map around Khayelitsha, Cape Town coordinates
const KHAYELITSHA_CENTER = [-34.0378, 18.6750];

export default function Map({ properties }) {
  return (
    <div className="w-full h-full rounded-xl overflow-hidden shadow-sm border border-slate-200">
      <MapContainer 
        center={KHAYELITSHA_CENTER} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {properties.map((house) => (
          house.latitude && house.longitude && (
            <Marker 
              key={house.property_id} 
              position={[house.latitude, house.longitude]} 
              icon={icon}
            >
              <Popup>
                <div className="p-1 font-sans">
                  <h4 className="font-bold text-slate-900 text-sm leading-tight">{house.title}</h4>
                  <p className="text-xs text-blue-600 font-semibold mt-0.5">{house.area_section}</p>
                  <p className="text-sm font-black text-slate-900 mt-1">
                    R {house.price.toLocaleString('en-ZA')}
                  </p>
                  <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded mt-1 ${
                    house.verification_status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {house.verification_status === 'verified' ? '🛡️ Verified Safe' : '⏳ Vetting'}
                  </span>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
}
