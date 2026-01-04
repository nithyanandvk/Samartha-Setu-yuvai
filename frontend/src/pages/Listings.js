import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusCircle, MapPin, Clock, Package, Filter, Users } from 'lucide-react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Listings.css';

const Listings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'active',
    isDisasterRelief: false
  });
  const { socket } = useSocket();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchListings();

    if (socket) {
      socket.on('new-listing', (data) => {
        setListings(prev => [data.listing, ...prev]);
      });
      socket.on('new-claim-request', (data) => {
        setListings(prev =>
          prev.map(listing =>
            listing._id === data.listing._id ? data.listing : listing
          )
        );
      });
      socket.on('claim-approved', (data) => {
        setListings(prev =>
          prev.map(listing =>
            listing._id === data.listing._id ? data.listing : listing
          )
        );
      });
      socket.on('collection-confirmed', (data) => {
        setListings(prev =>
          prev.map(listing =>
            listing._id === data.listing._id ? data.listing : listing
          )
        );
      });
      socket.on('listing-completed', (data) => {
        setListings(prev =>
          prev.map(listing =>
            listing._id === data.listing._id ? data.listing : listing
          )
        );
      });
      socket.on('listing-expired', (data) => {
        setListings(prev =>
          prev.map(listing =>
            listing._id === data.listing._id ? data.listing : listing
          )
        );
      });
    }

    return () => {
      if (socket) {
        socket.off('new-listing');
        socket.off('new-claim-request');
        socket.off('claim-approved');
        socket.off('collection-confirmed');
        socket.off('listing-completed');
        socket.off('listing-expired');
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, filters]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.isDisasterRelief) params.append('isDisasterRelief', 'true');
      
      const response = await axios.get(`${API_URL}/api/listings?${params}`);
      setListings(response.data);
    } catch (error) {
      console.error('Fetch listings error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (listingId) => {
    try {
      await axios.put(`${API_URL}/api/listings/${listingId}/claim`);
      toast.success('Claim request submitted! Waiting for approval.');
      fetchListings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit claim request');
    }
  };

  if (loading) {
    return (
      <div className="listings-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="listings-page">
      <div className="container">
        <div className="listings-header">
          <div>
            <h1>Food Listings</h1>
            <p>Browse available food donations</p>
          </div>
          <Link to="/listings/create" className="btn btn-primary">
            <PlusCircle size={20} />
            Create Listing
          </Link>
        </div>

        <div className="filters">
          <div className="filter-group">
            <Filter size={20} />
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="filter-select"
            >
              <option value="active">Active</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="collected">Collected</option>
              <option value="distributed">Distributed</option>
              <option value="fallback">Fallback</option>
            </select>
          </div>
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={filters.isDisasterRelief}
              onChange={(e) => setFilters({ ...filters, isDisasterRelief: e.target.checked })}
            />
            <span>Disaster Relief Only</span>
          </label>
        </div>

        <div className="listings-grid">
          {listings.length === 0 ? (
            <div className="empty-state">
              <Package size={64} color="#9CA3AF" />
              <h3>No listings found</h3>
              <p>Be the first to create a listing!</p>
              <Link to="/listings/create" className="btn btn-primary">
                Create Listing
              </Link>
            </div>
          ) : (
            listings.map((listing) => {
              const isDonor = user?._id === listing.donorId?._id || user?._id === listing.donorId;
              const pendingRequests = listing.claimRequests?.filter(req => req.status === 'pending') || [];
              
              return (
              <motion.div
                key={listing._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="listing-card"
                onClick={() => navigate(`/listings/${listing._id}`)}
                style={{ cursor: 'pointer' }}
              >
                {listing.isDisasterRelief && (
                  <div className="disaster-badge">🚨 Disaster Relief</div>
                )}
                <div className="listing-header">
                  <h3>{listing.title}</h3>
                  <span className={`status-badge ${listing.status}`}>
                    {listing.status}
                  </span>
                </div>
                <p className="listing-description">{listing.description}</p>
                <div className="listing-details">
                  <div className="detail-item">
                    <Package size={18} />
                    <span>{listing.quantity} {listing.unit}</span>
                  </div>
                  <div className="detail-item">
                    <MapPin size={18} />
                    <span>{listing.location.city || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <Clock size={18} />
                    <span>
                      Expires: {new Date(listing.expiryTime).toLocaleString()}
                    </span>
                  </div>
                </div>
                {listing.donorId && (
                  <div className="listing-donor">
                    <strong>Donor:</strong> {listing.donorId.name}
                    {listing.donorId.organizationName && (
                      <span> ({listing.donorId.organizationName})</span>
                    )}
                  </div>
                )}
                {isDonor && pendingRequests.length > 0 && (
                  <div className="claim-requests-badge">
                    <Users size={16} />
                    <span>{pendingRequests.length} Claim Request{pendingRequests.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
                {!isDonor && listing.status === 'active' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClaim(listing._id);
                    }}
                    className="btn btn-secondary claim-btn"
                  >
                    Request to Claim
                  </button>
                )}
                {listing.status === 'pending_approval' && !isDonor && (
                  <div className="status-info">
                    ⏳ Waiting for donor approval
                  </div>
                )}
                {listing.status === 'approved' && (
                  <div className="status-info approved-info">
                    ✅ Approved - Ready for collection
                  </div>
                )}
                {listing.status === 'collected' && (
                  <div className="status-info collected-info">
                    📦 Collected - Awaiting completion
                  </div>
                )}
                {listing.estimatedCO2Reduction > 0 && (
                  <div className="co2-badge">
                    🌱 Saves {listing.estimatedCO2Reduction.toFixed(1)} kg CO₂
                  </div>
                )}
              </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Listings;

