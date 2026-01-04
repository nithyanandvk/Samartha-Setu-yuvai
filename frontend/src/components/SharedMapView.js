import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './SharedMapView.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const SharedMapView = ({ isAdmin = false }) => {
  const { user } = useAuth();
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState([20.5937, 78.9629]); // India center
  const [filters, setFilters] = useState({
    showListings: true,
    showUsers: false, // Default to false for regular users
    showFridges: true,
    listingStatus: 'active' // Default to active for regular users
  });
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation([lat, lng]);
        },
        () => {
          setUserLocation([20.5937, 78.9629]);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }
  }, []);

  const fetchMapData = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = isAdmin 
        ? `${API_URL}/api/admin/map-data`
        : `${API_URL}/api/listings/map-data`;
      
      const params = {};
      if (filters.listingStatus && filters.listingStatus !== 'all') {
        params.status = filters.listingStatus;
      }

      const response = await axios.get(endpoint, { params });
      
      if (isAdmin) {
        setMapData(response.data);
      } else {
        // For regular users, structure the data similarly
        const listingsResponse = await axios.get(`${API_URL}/api/listings`, { 
          params: { status: filters.listingStatus || 'active' } 
        });
        const fridgesResponse = await axios.get(`${API_URL}/api/fridges`);
        setMapData({
          listings: listingsResponse.data,
          users: [],
          fridges: fridgesResponse.data
        });
      }
    } catch (error) {
      console.error('Fetch map data error:', error);
    } finally {
      setLoading(false);
    }
  }, [filters.listingStatus, filters.showListings, filters.showFridges, isAdmin, API_URL]);

  useEffect(() => {
    fetchMapData();
  }, [fetchMapData]);

  const createCustomIcon = (color, emoji) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="background: ${color}; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); font-size: 20px;">${emoji}</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });
  };

  if (loading) {
    return (
      <div className="shared-map-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!mapData) return null;

  return (
    <div className="shared-map-container">
      <div className="shared-map-controls">
        <h2>{isAdmin ? 'Admin Map View' : 'Live Map'}</h2>
        <div className="map-filters">
          <label>
            <input
              type="checkbox"
              checked={filters.showListings}
              onChange={(e) => setFilters({ ...filters, showListings: e.target.checked })}
            />
            Show Listings
          </label>
          {isAdmin && (
            <label>
              <input
                type="checkbox"
                checked={filters.showUsers}
                onChange={(e) => setFilters({ ...filters, showUsers: e.target.checked })}
              />
              Show Users
            </label>
          )}
          <label>
            <input
              type="checkbox"
              checked={filters.showFridges}
              onChange={(e) => setFilters({ ...filters, showFridges: e.target.checked })}
            />
            Show Hubs/Fridges
          </label>
          <select
            value={filters.listingStatus}
            onChange={(e) => setFilters({ ...filters, listingStatus: e.target.value })}
          >
            {isAdmin ? (
              <>
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="collected">Collected</option>
                <option value="distributed">Distributed</option>
              </>
            ) : (
              <>
                <option value="active">Active</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="approved">Approved</option>
              </>
            )}
          </select>
        </div>
      </div>

      <MapContainer
        center={userLocation}
        zoom={isAdmin ? 5 : 13}
        style={{ height: 'calc(100vh - 200px)', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Location Circle */}
        {!isAdmin && (
          <Circle
            center={userLocation}
            radius={1000}
            pathOptions={{ color: '#000080', fillColor: '#000080', fillOpacity: 0.1 }}
          />
        )}

        {/* Listings */}
        {filters.showListings && mapData.listings && mapData.listings.map((listing) => {
          let color = '#FF9933';
          let emoji = '🍽️';
          if (listing.status === 'approved') { color = '#000080'; emoji = '✅'; }
          else if (listing.status === 'collected') { color = '#138808'; emoji = '📦'; }
          else if (listing.status === 'distributed') { color = '#138808'; emoji = '✓'; }
          else if (listing.status === 'fallback') { color = '#DC2626'; emoji = '♻️'; }

          return (
            <Marker
              key={`listing-${listing._id}`}
              position={[listing.location.coordinates[1], listing.location.coordinates[0]]}
              icon={createCustomIcon(color, emoji)}
            >
              <Popup>
                <div className="popup-content">
                  <h4>{listing.title}</h4>
                  <p>Status: {listing.status}</p>
                  <p>Quantity: {listing.quantity} {listing.unit}</p>
                  <p>Donor: {listing.donorId?.name || 'Unknown'}</p>
                  <p>Location: {listing.location.city}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

          {/* Users (Admin only) */}
        {isAdmin && filters.showUsers && mapData.users && mapData.users.map((user) => {
          let color = '#6B7280';
          let emoji = '👤';
          if (user.role === 'user') { color = '#FF9933'; emoji = '👤'; }
          else if (user.role === 'organization') { color = '#000080'; emoji = '🏢'; }
          else if (user.role === 'volunteer') { color = '#138808'; emoji = '⭐'; }

          return (
            <Marker
              key={`user-${user._id}`}
              position={[user.location.coordinates[1], user.location.coordinates[0]]}
              icon={createCustomIcon(color, emoji)}
            >
              <Popup>
                <div className="popup-content">
                  <h4>{user.name}</h4>
                  <p>Role: {user.role}</p>
                  <p>Location: {user.location.city || 'N/A'}</p>
                  {user.organizationName && <p>Org: {user.organizationName}</p>}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Fridges/Hubs */}
        {filters.showFridges && mapData.fridges && mapData.fridges.map((fridge) => {
          let emoji = '❄️';
          let color = '#000080';
          if (fridge.type === 'animal-farm') { emoji = '🐄'; color = '#138808'; }
          else if (fridge.type === 'compost-center') { emoji = '♻️'; color = '#059669'; }

          return (
            <Marker
              key={`fridge-${fridge._id}`}
              position={[fridge.location.coordinates[1], fridge.location.coordinates[0]]}
              icon={createCustomIcon(color, emoji)}
            >
              <Popup>
                <div className="popup-content">
                  <h4>{fridge.name}</h4>
                  <p>Type: {fridge.type}</p>
                  <p>Capacity: {fridge.capacity} kg</p>
                  <p>Current: {fridge.currentInventory} kg</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default SharedMapView;

