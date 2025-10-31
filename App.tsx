import React, { useState, useEffect } from 'react';
import { ChatInterface } from './components/ChatInterface';
import type { UserLocation } from './components/types';

const App: React.FC = () => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationError(null);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationError(`Error: ${error.message}. Location-based features will be unavailable.`);
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
    }
  }, []);

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-gray-900 to-[#111827] text-gray-100 flex flex-col font-['Inter']">
      <ChatInterface userLocation={userLocation} locationError={locationError} />
    </div>
  );
};

export default App;