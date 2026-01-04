import React from 'react';
import SharedMapView from '../components/SharedMapView';
import './MapView.css';

const MapView = () => {
  return (
    <div className="map-view">
      <SharedMapView isAdmin={false} />
    </div>
  );
};

export default MapView;
