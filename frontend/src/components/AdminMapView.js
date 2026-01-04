import React from 'react';
import SharedMapView from './SharedMapView';
import './AdminMapView.css';

const AdminMapView = () => {
  return <SharedMapView isAdmin={true} />;
};

export default AdminMapView;

