import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, MapPin, Clock, Package, CheckCircle, XCircle, 
  User, Users, Check, X, Truck, Award
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';
import './ListingDetail.css';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claimMessage, setClaimMessage] = useState('');
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchListing();

    if (socket) {
      socket.on('new-claim-request', (data) => {
        if (data.listing._id === id) {
          setListing(data.listing);
          toast.success('New claim request received!');
        }
      });
      socket.on('claim-approved', (data) => {
        if (data.listing._id === id) {
          setListing(data.listing);
        }
      });
      socket.on('collection-confirmed', (data) => {
        if (data.listing._id === id) {
          setListing(data.listing);
        }
      });
      socket.on('listing-completed', (data) => {
        if (data.listing._id === id) {
          setListing(data.listing);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('new-claim-request');
        socket.off('claim-approved');
        socket.off('collection-confirmed');
        socket.off('listing-completed');
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, socket]);

  const fetchListing = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/listings/${id}`);
      setListing(response.data);
    } catch (error) {
      console.error('Fetch listing error:', error);
      toast.error('Failed to load listing');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    try {
      await axios.put(`${API_URL}/api/listings/${id}/claim`, { message: claimMessage });
      toast.success('Claim request submitted! Waiting for donor approval.');
      fetchListing();
      setClaimMessage('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit claim request');
    }
  };

  const handleApproveClaim = async (requestId) => {
    try {
      await axios.put(`${API_URL}/api/listings/${id}/approve-claim/${requestId}`);
      toast.success('Claim approved successfully!');
      fetchListing();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve claim');
    }
  };

  const handleConfirmCollection = async () => {
    try {
      await axios.put(`${API_URL}/api/listings/${id}/confirm-collection`);
      toast.success('Collection confirmed!');
      fetchListing();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to confirm collection');
    }
  };

  const handleMarkDone = async () => {
    try {
      await axios.put(`${API_URL}/api/listings/${id}/complete`);
      toast.success('Listing marked as completed!');
      fetchListing();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark as done');
    }
  };

  if (loading) {
    return (
      <div className="listing-detail-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="listing-detail-page">
        <div className="container">
          <div className="listing-not-found">
            <h2>Listing not found</h2>
            <button onClick={() => navigate('/listings')} className="btn btn-primary">
              <ArrowLeft size={20} /> Back to Listings
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isDonor = user?._id === listing.donorId?._id || user?._id === listing.donorId;
  const isApprovedReceiver = listing.claimedBy && (user?._id === listing.claimedBy._id || user?._id === listing.claimedBy);
  const hasPendingRequest = listing.claimRequests?.some(
    req => (req.receiverId._id === user?._id || req.receiverId === user?._id) && req.status === 'pending'
  );
  const pendingRequests = listing.claimRequests?.filter(req => req.status === 'pending') || [];
  const sortedPendingRequests = [...pendingRequests].sort((a, b) => 
    new Date(a.requestedAt) - new Date(b.requestedAt)
  );

  return (
    <div className="listing-detail-page">
      <div className="container">
        <button onClick={() => navigate('/listings')} className="back-btn">
          <ArrowLeft size={20} /> Back to Listings
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="listing-detail-card"
        >
          <div className="listing-detail-header">
            <div>
              <h1>{listing.title}</h1>
              <div className="listing-meta">
                <span className={`status-badge-large ${listing.status}`}>
                  {listing.status.replace('_', ' ')}
                </span>
                {listing.isDisasterRelief && (
                  <span className="disaster-badge-large">🚨 Disaster Relief</span>
                )}
              </div>
            </div>
            {listing.donorId && (
              <div className="donor-info">
                <User size={20} />
                <div>
                  <strong>{listing.donorId.name}</strong>
                  {listing.donorId.organizationName && (
                    <span> - {listing.donorId.organizationName}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="listing-detail-content">
            <div className="detail-section">
              <h3>Description</h3>
              <p>{listing.description}</p>
            </div>

            <div className="detail-grid">
              <div className="detail-item-large">
                <Package size={24} />
                <div>
                  <label>Quantity</label>
                  <p>{listing.quantity} {listing.unit}</p>
                </div>
              </div>
              <div className="detail-item-large">
                <MapPin size={24} />
                <div>
                  <label>Location</label>
                  <p>{listing.location.address || listing.location.city}, {listing.location.state}</p>
                </div>
              </div>
              <div className="detail-item-large">
                <Clock size={24} />
                <div>
                  <label>Expires</label>
                  <p>{new Date(listing.expiryTime).toLocaleString()}</p>
                </div>
              </div>
              {listing.estimatedCO2Reduction > 0 && (
                <div className="detail-item-large">
                  <Award size={24} />
                  <div>
                    <label>CO₂ Saved</label>
                    <p>{listing.estimatedCO2Reduction.toFixed(1)} kg</p>
                  </div>
                </div>
              )}
            </div>

            {/* Claim Requests Queue (Donor View) */}
            {isDonor && (
              <>
                {pendingRequests.length > 0 ? (
                  <div className="claim-requests-section">
                    <h3>
                      <Users size={24} />
                      Claim Requests ({pendingRequests.length})
                    </h3>
                    <p className="section-subtitle">First come, first serve - Click Approve to accept a request</p>
                    <div className="claim-requests-list">
                      {sortedPendingRequests.map((request, index) => (
                        <motion.div
                          key={request._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`claim-request-item ${index === 0 ? 'first-request' : ''}`}
                        >
                          <div className="request-header">
                            <div className="request-info">
                              {index === 0 && (
                                <span className="first-badge">🥇 First Request</span>
                              )}
                              <div className="receiver-info">
                                <User size={20} />
                                <div>
                                  <strong>{request.receiverId?.name || 'Unknown'}</strong>
                                  <span className="request-time">
                                    Requested: {new Date(request.requestedAt).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {request.status === 'pending' && (
                              <button
                                onClick={() => handleApproveClaim(request._id)}
                                className={`btn ${index === 0 ? 'btn-primary' : 'btn-secondary'} approve-btn`}
                                title={index === 0 ? 'Approve first request (recommended)' : 'Approve this request'}
                              >
                                <Check size={20} />
                                Approve
                              </button>
                            )}
                            {request.status === 'approved' && (
                              <span className="approved-badge">✅ Approved</span>
                            )}
                            {request.status === 'rejected' && (
                              <span className="rejected-badge">❌ Rejected</span>
                            )}
                          </div>
                          {request.message && (
                            <p className="request-message">"{request.message}"</p>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : listing.status === 'active' ? (
                  <div className="action-section">
                    <h3>📋 Your Listing is Active</h3>
                    <p>Waiting for claim requests. Users will be able to request to claim this listing.</p>
                  </div>
                ) : null}
              </>
            )}

            {/* Donor View - No pending requests but listing is active */}
            {isDonor && pendingRequests.length === 0 && listing.status === 'active' && (
              <div className="action-section">
                <h3>📋 Your Listing is Active</h3>
                <p>Waiting for claim requests. Users will be able to request to claim this listing.</p>
              </div>
            )}

            {/* Approved Receiver View */}
            {isApprovedReceiver && listing.status === 'approved' && (
              <div className="action-section approved-section">
                <h3>✅ Your Claim Was Approved!</h3>
                <p>Please collect the food and confirm collection when done.</p>
                <button
                  onClick={handleConfirmCollection}
                  className="btn btn-secondary large-btn"
                >
                  <Truck size={20} />
                  Confirm Collection
                </button>
              </div>
            )}

            {/* Donor - Collection Confirmed View */}
            {isDonor && listing.status === 'collected' && (
              <div className="action-section collected-section">
                <h3>✅ Food Collected by Receiver</h3>
                <p>Receiver has confirmed collection. Mark as done to complete the transaction.</p>
                <button
                  onClick={handleMarkDone}
                  className="btn btn-primary large-btn"
                >
                  <CheckCircle size={20} />
                  Mark as Done
                </button>
              </div>
            )}

            {/* Receiver - Claim Button */}
            {!isDonor && !isApprovedReceiver && listing.status === 'active' && !hasPendingRequest && (
              <div className="action-section">
                <h3>Claim This Listing</h3>
                <textarea
                  value={claimMessage}
                  onChange={(e) => setClaimMessage(e.target.value)}
                  placeholder="Optional: Add a message for the donor..."
                  className="claim-message-input"
                  rows={3}
                />
                <button
                  onClick={handleClaim}
                  className="btn btn-secondary large-btn"
                  disabled={!user}
                >
                  <Check size={20} />
                  Request to Claim
                </button>
                {hasPendingRequest && (
                  <p className="info-text">You have a pending claim request</p>
                )}
              </div>
            )}

            {/* Pending Request Status */}
            {hasPendingRequest && listing.status === 'pending_approval' && (
              <div className="action-section pending-section">
                <h3>⏳ Claim Request Pending</h3>
                <p>Your claim request has been submitted. Waiting for donor approval...</p>
                <p className="queue-info">
                  Your position in queue: #{sortedPendingRequests.findIndex(
                    req => (req.receiverId._id === user?._id || req.receiverId === user?._id)
                  ) + 1} of {pendingRequests.length}
                </p>
              </div>
            )}

            {/* Fallback Status */}
            {listing.status === 'fallback' && (
              <div className="action-section fallback-section">
                <h3>🔄 Routed to Fallback</h3>
                <p>
                  This listing expired and was automatically routed to: <strong>{listing.fallbackRoute?.replace('-', ' ') || 'Fallback'}</strong>
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ListingDetail;

