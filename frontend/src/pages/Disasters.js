import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, MapPin, Calendar, Users, Package, 
  PlusCircle, Filter, Search, TrendingUp
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Disasters.css';

const Disasters = () => {
  const { user } = useAuth();
  const [disasters, setDisasters] = useState([]);
  const [filteredDisasters, setFilteredDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchDisasters();
  }, []);

  useEffect(() => {
    filterDisasters();
  }, [disasters, searchTerm, filterType, filterSeverity]);

  const fetchDisasters = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/disasters`);
      setDisasters(response.data);
      setFilteredDisasters(response.data);
    } catch (error) {
      console.error('Fetch disasters error:', error);
      toast.error('Failed to load disasters');
    } finally {
      setLoading(false);
    }
  };

  const filterDisasters = () => {
    let filtered = [...disasters];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(disaster =>
        disaster.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        disaster.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        disaster.location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        disaster.location.state.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(disaster => disaster.type === filterType);
    }

    // Severity filter
    if (filterSeverity !== 'all') {
      filtered = filtered.filter(disaster => disaster.severity === filterSeverity);
    }

    setFilteredDisasters(filtered);
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
      <div className="disasters-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="disasters-page">
      <div className="container">
        <div className="disasters-header">
          <div>
            <h1>
              <AlertTriangle size={32} />
              Disaster Management Platform
            </h1>
            <p>Help communities in need across India</p>
          </div>
          {user?.role === 'admin' && (
            <Link to="/disasters/create" className="btn btn-primary">
              <PlusCircle size={20} />
              Report Disaster
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="disasters-filters">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search disasters by location, type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <Filter size={20} />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">All Types</option>
              <option value="flood">Flood</option>
              <option value="cyclone">Cyclone</option>
              <option value="earthquake">Earthquake</option>
              <option value="drought">Drought</option>
              <option value="pandemic">Pandemic</option>
              <option value="fire">Fire</option>
              <option value="other">Other</option>
            </select>
            <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Disasters Grid */}
        {filteredDisasters.length === 0 ? (
          <div className="no-disasters">
            <AlertTriangle size={64} color="#9CA3AF" />
            <h3>No disasters found</h3>
            <p>There are currently no active disasters matching your filters.</p>
          </div>
        ) : (
          <div className="disasters-grid">
            {filteredDisasters.map((disaster) => (
              <motion.div
                key={disaster._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                className="disaster-card"
              >
                <div className="disaster-header">
                  <div className="disaster-type-icon">
                    {getTypeIcon(disaster.type)}
                  </div>
                  <div className="disaster-title-section">
                    <h3>{disaster.title}</h3>
                    <span
                      className="severity-badge"
                      style={{ backgroundColor: getSeverityColor(disaster.severity) }}
                    >
                      {disaster.severity}
                    </span>
                  </div>
                </div>

                <p className="disaster-description">{disaster.description}</p>

                <div className="disaster-info">
                  <div className="info-item">
                    <MapPin size={16} />
                    <span>{disaster.location.city}, {disaster.location.state}</span>
                  </div>
                  <div className="info-item">
                    <Calendar size={16} />
                    <span>{new Date(disaster.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="info-item">
                    <Package size={16} />
                    <span>{disaster.donations.length} donations</span>
                  </div>
                </div>

                {disaster.requiredItems && disaster.requiredItems.length > 0 && (
                  <div className="required-items">
                    <strong>Urgently Needed:</strong>
                    <div className="items-list">
                      {disaster.requiredItems.slice(0, 3).map((item, idx) => (
                        <span key={idx} className="item-tag">
                          {item.item} ({item.quantity} {item.unit})
                        </span>
                      ))}
                      {disaster.requiredItems.length > 3 && (
                        <span className="item-tag">+{disaster.requiredItems.length - 3} more</span>
                      )}
                    </div>
                  </div>
                )}

                <div className="disaster-actions">
                  <Link
                    to={`/disasters/${disaster._id}`}
                    className="btn btn-primary"
                  >
                    View Details & Donate
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Disasters;

