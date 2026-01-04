import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, MapPin, Calendar, Package, Users, 
  PlusCircle, ArrowLeft, CheckCircle, Clock
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './DisasterDetail.css';

const DisasterDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [disaster, setDisaster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [donating, setDonating] = useState(false);
  const [donationItems, setDonationItems] = useState([{ item: '', quantity: '', unit: 'kg' }]);
  const [notes, setNotes] = useState('');
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchDisaster();
  }, [id]);

  const fetchDisaster = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/disasters/${id}`);
      setDisaster(response.data);
    } catch (error) {
      console.error('Fetch disaster error:', error);
      toast.error('Failed to load disaster details');
      navigate('/disasters');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setDonationItems([...donationItems, { item: '', quantity: '', unit: 'kg' }]);
  };

  const handleRemoveItem = (index) => {
    setDonationItems(donationItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...donationItems];
    updated[index][field] = value;
    setDonationItems(updated);
  };

  const handleDonate = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to donate');
      navigate('/login');
      return;
    }

    const items = donationItems.filter(item => item.item && item.quantity);
    if (items.length === 0) {
      toast.error('Please add at least one item to donate');
      return;
    }

    setDonating(true);
    try {
      await axios.post(`${API_URL}/api/disasters/${id}/donate`, {
        items: items.map(item => ({
          item: item.item,
          quantity: parseFloat(item.quantity),
          unit: item.unit
        })),
        notes
      });
      toast.success('Donation submitted successfully! Admin will review and approve.');
      setDonationItems([{ item: '', quantity: '', unit: 'kg' }]);
      setNotes('');
      fetchDisaster();
    } catch (error) {
      console.error('Donate error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit donation');
    } finally {
      setDonating(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'medium': return '#3B82F6';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'flood': return '🌊';
      case 'cyclone': return '🌀';
      case 'earthquake': return '🌍';
      case 'drought': return '☀️';
      case 'pandemic': return '🦠';
      case 'fire': return '🔥';
      default: return '⚠️';
    }
  };

  if (loading) {
    return (
      <div className="disaster-detail-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!disaster) {
    return null;
  }

  return (
    <div className="disaster-detail-page">
      <div className="container">
        <Link to="/disasters" className="back-link">
          <ArrowLeft size={20} />
          Back to Disasters
        </Link>

        <div className="disaster-detail-header">
          <div className="disaster-type-icon-large">
            {getTypeIcon(disaster.type)}
          </div>
          <div>
            <h1>{disaster.title}</h1>
            <div className="disaster-meta">
              <span
                className="severity-badge-large"
                style={{ backgroundColor: getSeverityColor(disaster.severity) }}
              >
                {disaster.severity}
              </span>
              <span className="status-badge">{disaster.status}</span>
            </div>
          </div>
        </div>

        <div className="disaster-detail-grid">
          <div className="disaster-detail-main">
            <div className="detail-section">
              <h2>Description</h2>
              <p>{disaster.description}</p>
            </div>

            <div className="detail-section">
              <h2>Location</h2>
              <div className="location-info">
                <MapPin size={20} />
                <div>
                  <strong>{disaster.location.city}, {disaster.location.state}</strong>
                  {disaster.location.address && <p>{disaster.location.address}</p>}
                </div>
              </div>
              {disaster.affectedAreas && disaster.affectedAreas.length > 0 && (
                <div className="affected-areas">
                  <strong>Affected Areas:</strong>
                  <div className="areas-list">
                    {disaster.affectedAreas.map((area, idx) => (
                      <span key={idx} className="area-tag">
                        {area.city}, {area.state}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {disaster.requiredItems && disaster.requiredItems.length > 0 && (
              <div className="detail-section">
                <h2>Urgently Needed Items</h2>
                <div className="required-items-list">
                  {disaster.requiredItems.map((item, idx) => (
                    <div key={idx} className="required-item-card">
                      <Package size={20} />
                      <div>
                        <strong>{item.item}</strong>
                        <p>{item.quantity} {item.unit} - Priority: {item.priority}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="detail-section">
              <h2>Donations ({disaster.donations.length})</h2>
              {disaster.donations.length === 0 ? (
                <p className="no-donations">No donations yet. Be the first to help!</p>
              ) : (
                <div className="donations-list">
                  {disaster.donations.map((donation, idx) => (
                    <div key={idx} className="donation-card">
                      <div className="donation-header">
                        <strong>{donation.donorId?.name || 'Anonymous'}</strong>
                        <span className={`donation-status ${donation.status}`}>
                          {donation.status === 'approved' && <CheckCircle size={16} />}
                          {donation.status === 'pending' && <Clock size={16} />}
                          {donation.status}
                        </span>
                      </div>
                      <div className="donation-items">
                        {donation.items.map((item, itemIdx) => (
                          <span key={itemIdx} className="donation-item-tag">
                            {item.item} ({item.quantity} {item.unit})
                          </span>
                        ))}
                      </div>
                      {donation.notes && <p className="donation-notes">{donation.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="disaster-detail-sidebar">
            <div className="donate-section">
              <h2>Donate to Help</h2>
              <form onSubmit={handleDonate}>
                {donationItems.map((item, index) => (
                  <div key={index} className="donation-item-input">
                    <input
                      type="text"
                      placeholder="Item name (e.g., Rice, Water, Blankets)"
                      value={item.item}
                      onChange={(e) => handleItemChange(index, 'item', e.target.value)}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Quantity"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      required
                      min="1"
                      step="0.1"
                    />
                    <select
                      value={item.unit}
                      onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                    >
                      <option value="kg">kg</option>
                      <option value="liters">liters</option>
                      <option value="pieces">pieces</option>
                      <option value="packets">packets</option>
                      <option value="boxes">boxes</option>
                    </select>
                    {donationItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="remove-item-btn"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="add-item-btn"
                >
                  <PlusCircle size={16} />
                  Add Another Item
                </button>
                <textarea
                  placeholder="Additional notes (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="3"
                />
                <button
                  type="submit"
                  disabled={donating}
                  className="btn btn-primary btn-block"
                >
                  {donating ? 'Submitting...' : 'Submit Donation'}
                </button>
              </form>
            </div>

            <div className="info-card">
              <h3>Disaster Information</h3>
              <div className="info-item">
                <Calendar size={16} />
                <div>
                  <strong>Started:</strong>
                  <p>{new Date(disaster.startDate).toLocaleDateString()}</p>
                </div>
              </div>
              {disaster.endDate && (
                <div className="info-item">
                  <Calendar size={16} />
                  <div>
                    <strong>Ended:</strong>
                    <p>{new Date(disaster.endDate).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
              <div className="info-item">
                <Users size={16} />
                <div>
                  <strong>Total Donations:</strong>
                  <p>{disaster.donations.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisasterDetail;

