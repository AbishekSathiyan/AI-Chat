import React, { useState, useEffect } from 'react';
import { ChatInterface } from './components/ChatInterface';

const App = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

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

          <h1 className="text-2xl font-bold text-center mt-8">Welcome to CareerMate AI</h1>
          
      <ChatInterface userLocation={userLocation} locationError={locationError} />
    </div>


  );
};

export default App;
