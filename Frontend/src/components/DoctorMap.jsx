import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { GoogleMap, LoadScript, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';

const MotionDiv = motion.div;
const MotionButton = motion.button;

// Static doctor data (in a real app, this would come from an API)
const doctors = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialty: "Primary Care",
    address: "123 Main St, San Francisco, CA",
    coordinates: { lat: 37.7749, lng: -122.4194 },
    rating: 4.8,
    isOpen: true,
    phone: "(415) 555-1234",
    distance: "0.5 miles",
    availableTimes: ["9:00 AM", "11:30 AM", "3:45 PM"]
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    specialty: "Cardiologist",
    address: "456 Market St, San Francisco, CA",
    coordinates: { lat: 37.7897, lng: -122.3972 },
    rating: 4.9,
    isOpen: true,
    phone: "(415) 555-2345",
    distance: "1.2 miles",
    availableTimes: ["10:15 AM", "2:00 PM"]
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    specialty: "Pediatrician",
    address: "789 Mission St, San Francisco, CA",
    coordinates: { lat: 37.7833, lng: -122.4167 },
    rating: 4.7,
    isOpen: false,
    phone: "(415) 555-3456",
    distance: "0.8 miles",
    availableTimes: ["Tomorrow: 9:30 AM", "Tomorrow: 1:15 PM"]
  },
  {
    id: 4,
    name: "Dr. James Wilson",
    specialty: "Dermatologist",
    address: "321 Howard St, San Francisco, CA",
    coordinates: { lat: 37.7895, lng: -122.4013 },
    rating: 4.6,
    isOpen: true,
    phone: "(415) 555-4567",
    distance: "1.5 miles",
    availableTimes: ["11:00 AM", "4:30 PM"]
  },
  {
    id: 5,
    name: "Dr. Lisa Park",
    specialty: "Orthopedic Surgeon",
    address: "555 Bryant St, San Francisco, CA",
    coordinates: { lat: 37.7816, lng: -122.3970 },
    rating: 4.9,
    isOpen: true,
    phone: "(415) 555-5678",
    distance: "0.9 miles",
    availableTimes: ["2:45 PM", "4:15 PM"]
  }
];

// Map center coordinates (San Francisco)
const center = {
  lat: 37.7749,
  lng: -122.4194
};

// Map options
const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: true,
  fullscreenControl: true,
  styles: [
    {
      featureType: "poi.business",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    }
  ]
};

const containerStyle = {
  width: '100%',
  height: '400px'
};

// Google Maps API key
const googleMapsApiKey = "AIzaSyA8VMlkMFcCwNZQYWkyjMtT_Cktt20nHnQ";

const DoctorMap = () => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [map, setMap] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [specialty, setSpecialty] = useState("");
  const [filteredDoctors, setFilteredDoctors] = useState(doctors);

  // Load the Google Maps API
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: googleMapsApiKey
  });

  // Get user's location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    }
  }, []);

  // Filter doctors by specialty
  useEffect(() => {
    if (specialty === "") {
      setFilteredDoctors(doctors);
    } else {
      setFilteredDoctors(
        doctors.filter(doctor => 
          doctor.specialty.toLowerCase().includes(specialty.toLowerCase())
        )
      );
    }
  }, [specialty]);

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Handle booking appointment
  const handleBookAppointment = (doctorId, time) => {
    alert(`Appointment booked with ${doctors.find(d => d.id === doctorId).name} at ${time}`);
    // In a real app, this would send a request to an API
  };

  // Marker icons
  const getMarkerIcon = (isOpen) => {
    return {
      url: isOpen 
        ? 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2322c55e"><circle cx="12" cy="12" r="10" stroke="%23ffffff" stroke-width="2"/></svg>'
        : 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ef4444"><circle cx="12" cy="12" r="10" stroke="%23ffffff" stroke-width="2"/></svg>',
      scaledSize: isLoaded ? new window.google.maps.Size(24, 24) : null
    };
  };

  const getUserLocationIcon = () => {
    return {
      url: 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234b5563"><circle cx="12" cy="12" r="10" stroke="%23ffffff" stroke-width="2"/></svg>',
      scaledSize: isLoaded ? new window.google.maps.Size(30, 30) : null
    };
  };

  if (!isLoaded) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Find Doctors Near You</h2>
        <div className="h-96 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Google Maps...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Find Doctors Near You</h2>
        
        {/* Filter Options */}
        <div className="mb-4">
          <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Specialty
          </label>
          <select
            id="specialty"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="">All Specialties</option>
            <option value="Primary Care">Primary Care</option>
            <option value="Cardiologist">Cardiologist</option>
            <option value="Pediatrician">Pediatrician</option>
            <option value="Dermatologist">Dermatologist</option>
            <option value="Orthopedic">Orthopedic</option>
          </select>
        </div>
        
        {/* Map */}
        <div className="rounded-lg overflow-hidden mb-6 shadow-md">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={userLocation || center}
            zoom={14}
            options={mapOptions}
            onLoad={onLoad}
            onUnmount={onUnmount}
          >
            {/* User Location Marker */}
            {userLocation && isLoaded && (
              <Marker
                position={userLocation}
                icon={getUserLocationIcon()}
              />
            )}
            
            {/* Doctor Markers */}
            {filteredDoctors.map((doctor) => (
              <Marker
                key={doctor.id}
                position={doctor.coordinates}
                onClick={() => setSelectedDoctor(doctor)}
                icon={getMarkerIcon(doctor.isOpen)}
              />
            ))}

            {/* Info Window for selected doctor */}
            {selectedDoctor && (
              <InfoWindow
                position={selectedDoctor.coordinates}
                onCloseClick={() => setSelectedDoctor(null)}
              >
                <div className="p-2 w-64">
                  <h4 className="font-medium text-lg">{selectedDoctor.name}</h4>
                  <div className="flex items-center mt-1">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm font-medium ml-1">{selectedDoctor.rating}</span>
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      selectedDoctor.isOpen 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedDoctor.isOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{selectedDoctor.specialty}</p>
                  <p className="text-xs text-gray-500 mt-1">{selectedDoctor.address}</p>
                  <p className="text-xs text-gray-500 mt-1">{selectedDoctor.phone}</p>
                  <p className="text-xs font-medium text-indigo-600 mt-1">Distance: {selectedDoctor.distance}</p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>
      </div>
      
      {/* Doctor List */}
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h3 className="font-semibold text-lg mb-4">Recommended Doctors</h3>
        <div className="space-y-4">
          {filteredDoctors.map((doctor) => (
            <MotionDiv
              key={doctor.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              whileHover={{ x: 5 }}
              onClick={() => {
                setSelectedDoctor(doctor);
                if (map) {
                  map.panTo(doctor.coordinates);
                  map.setZoom(16);
                }
              }}
            >
              <div className="flex justify-between">
                <div>
                  <div className="flex items-center">
                    <h4 className="font-medium text-lg">{doctor.name}</h4>
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      doctor.isOpen 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {doctor.isOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{doctor.specialty}</p>
                  <p className="text-xs text-gray-500 mt-1">{doctor.address}</p>
                  <p className="text-xs font-medium text-indigo-600 mt-1">Distance: {doctor.distance}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm font-medium ml-1">{doctor.rating}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{doctor.phone}</p>
                </div>
              </div>
              
              {/* Available appointment times */}
              {doctor.isOpen && doctor.availableTimes.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-700 mb-1">Available Today:</p>
                  <div className="flex flex-wrap gap-2">
                    {doctor.availableTimes.map((time, index) => (
                      <MotionButton
                        key={index}
                        className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-medium hover:bg-indigo-100"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookAppointment(doctor.id, time);
                        }}
                      >
                        {time}
                      </MotionButton>
                    ))}
                  </div>
                </div>
              )}
            </MotionDiv>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoctorMap; 