import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Package, TrendingUp, Map, BarChart3, Database, 
  Shield, CheckCircle, Eye, Ban, Award, Activity
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AdminMapView from '../components/AdminMapView';
import './AdminPanel.css';

const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (user?.role !== 'admin') {
      toast.error('Admin access required');
      navigate('/dashboard');
      return;
    }
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeTab]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, listingsRes, volunteersRes, transactionsRes, insightsRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/stats`),
        activeTab === 'users' ? axios.get(`${API_URL}/api/admin/users`) : Promise.resolve({ data: { users: [] } }),
        activeTab === 'listings' ? axios.get(`${API_URL}/api/admin/listings`) : Promise.resolve({ data: { listings: [] } }),
        activeTab === 'volunteers' ? axios.get(`${API_URL}/api/admin/volunteers`) : Promise.resolve({ data: [] }),
        activeTab === 'transactions' ? axios.get(`${API_URL}/api/admin/transactions`) : Promise.resolve({ data: { transactions: [] } }),
        activeTab === 'insights' ? axios.get(`${API_URL}/api/admin/insights`) : Promise.resolve({ data: null })
      ]);

      setStats(statsRes.data);
      if (usersRes.data.users) setUsers(usersRes.data.users);
      if (listingsRes.data.listings) setListings(listingsRes.data.listings);
      if (volunteersRes.data) setVolunteers(volunteersRes.data);
      if (transactionsRes.data.transactions) setTransactions(transactionsRes.data.transactions);
      if (insightsRes.data) setInsights(insightsRes.data);
    } catch (error) {
      console.error('Fetch admin data error:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId, isActive) => {
    try {
      await axios.put(`${API_URL}/api/admin/users/${userId}/ban`, { isActive });
      toast.success(`User ${isActive ? 'activated' : 'banned'} successfully`);
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleVerifyUser = async (userId, status) => {
    try {
      await axios.put(`${API_URL}/api/admin/users/${userId}/verify`, { verificationStatus: status });
      toast.success('User verification status updated');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to update verification status');
    }
  };

  if (user?.role !== 'admin') {
    return null;
  }

  if (loading && !stats) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div className="admin-header-content">
          <div>
            <h1>
              <Shield size={32} />
              Admin Panel
            </h1>
            <p>Manage platform, users, and transactions</p>
          </div>
        </div>
      </div>

      <div className="admin-container">
        <div className="admin-sidebar">
          <nav className="admin-nav">
            <button
              className={activeTab === 'dashboard' ? 'active' : ''}
              onClick={() => setActiveTab('dashboard')}
            >
              <BarChart3 size={20} />
              Dashboard
            </button>
            <button
              className={activeTab === 'map' ? 'active' : ''}
              onClick={() => setActiveTab('map')}
            >
              <Map size={20} />
              Map View
            </button>
            <button
              className={activeTab === 'users' ? 'active' : ''}
              onClick={() => setActiveTab('users')}
            >
              <Users size={20} />
              All Users
            </button>
            <button
              className={activeTab === 'listings' ? 'active' : ''}
              onClick={() => setActiveTab('listings')}
            >
              <Package size={20} />
              Listings
            </button>
            <button
              className={activeTab === 'transactions' ? 'active' : ''}
              onClick={() => setActiveTab('transactions')}
            >
              <Activity size={20} />
              Transactions
            </button>
            <button
              className={activeTab === 'volunteers' ? 'active' : ''}
              onClick={() => setActiveTab('volunteers')}
            >
              <Award size={20} />
              Volunteers
            </button>
            {/* <button
              className={activeTab === 'insights' ? 'active' : ''}
              onClick={() => setActiveTab('insights')}
            >
              <Database size={20} />
              Database Insights
            </button> */}
          </nav>
        </div>

        <div className="admin-content">
          {activeTab === 'dashboard' && stats && (
            <DashboardTab stats={stats} />
          )}

          {activeTab === 'map' && (
            <AdminMapView />
          )}

          {activeTab === 'users' && (
            <UsersTab users={users} onBan={handleBanUser} onVerify={handleVerifyUser} />
          )}

          {activeTab === 'listings' && (
            <ListingsTab listings={listings} />
          )}

          {activeTab === 'transactions' && (
            <TransactionsTab transactions={transactions} />
          )}

          {activeTab === 'volunteers' && (
            <VolunteersTab volunteers={volunteers} />
          )}

          {activeTab === 'insights' && (
            loading ? (
              <div className="admin-loading">
                <div className="spinner"></div>
              </div>
            ) : insights ? (
              <InsightsTab insights={insights} />
            ) : (
              <div className="admin-error">
                <p>Failed to load insights. Please try again.</p>
                <button onClick={fetchDashboardData} className="btn btn-primary">
                  Retry
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

// Dashboard Tab Component
const DashboardTab = ({ stats }) => {
  return (
    <div className="admin-dashboard">
      <h2>Platform Overview</h2>
      
      <div className="stats-grid-admin">
        <motion.div className="stat-card-admin primary">
          <Users size={32} />
          <div>
            <div className="stat-value-admin">{stats.totalUsers}</div>
            <div className="stat-label-admin">Total Users</div>
          </div>
        </motion.div>

        <motion.div className="stat-card-admin success">
          <Package size={32} />
          <div>
            <div className="stat-value-admin">{stats.totalListings}</div>
            <div className="stat-label-admin">Total Listings</div>
          </div>
        </motion.div>

        <motion.div className="stat-card-admin info">
          <TrendingUp size={32} />
          <div>
            <div className="stat-value-admin">{stats.totalImpact.totalFood.toFixed(1)} kg</div>
            <div className="stat-label-admin">Food Saved</div>
          </div>
        </motion.div>

        <motion.div className="stat-card-admin warning">
          <Activity size={32} />
          <div>
            <div className="stat-value-admin">{stats.totalImpact.totalCO2.toFixed(1)} kg</div>
            <div className="stat-label-admin">CO₂ Reduced</div>
          </div>
        </motion.div>

        <motion.div className="stat-card-admin">
          <Package size={32} />
          <div>
            <div className="stat-value-admin">{stats.activeListings}</div>
            <div className="stat-label-admin">Active Listings</div>
          </div>
        </motion.div>

        <motion.div className="stat-card-admin">
          <CheckCircle size={32} />
          <div>
            <div className="stat-value-admin">{stats.pendingApprovals}</div>
            <div className="stat-label-admin">Pending Approvals</div>
          </div>
        </motion.div>
      </div>

      <div className="admin-sections-grid">
        <div className="admin-section-card">
          <h3>Users by Role</h3>
          <div className="role-stats">
            {stats.usersByRole.map((role, index) => (
              <div key={index} className="role-stat-item">
                <span className="role-name">{role._id}</span>
                <span className="role-count">{role.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-section-card">
          <h3>Listings by Status</h3>
          <div className="status-stats">
            {stats.listingsByStatus.map((status, index) => (
              <div key={index} className="status-stat-item">
                <span className="status-name">{status._id}</span>
                <span className="status-count">{status.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-section-card">
          <h3>Recent Activity (7 days)</h3>
          <div className="activity-stats">
            <div className="activity-item">
              <span>New Users</span>
              <strong>{stats.recentActivity.newUsers}</strong>
            </div>
            <div className="activity-item">
              <span>New Listings</span>
              <strong>{stats.recentActivity.newListings}</strong>
            </div>
            <div className="activity-item">
              <span>Completed</span>
              <strong>{stats.recentActivity.completedTransactions}</strong>
            </div>
          </div>
        </div>

        <div className="admin-section-card">
          <h3>Top Cities</h3>
          <div className="city-stats">
            {stats.cityStats.slice(0, 5).map((city, index) => (
              <div key={index} className="city-stat-item">
                <span className="city-name">{city._id || 'Unknown'}</span>
                <span className="city-count">{city.count} listings</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Users Tab Component
const UsersTab = ({ users, onBan, onVerify }) => {
  return (
    <div className="admin-users">
      <h2>All Users ({users.length})</h2>
      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Verification</th>
              <th>Points</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role}`}>{user.role}</span>
                </td>
                <td>
                  <span className={user.isActive ? 'status-active' : 'status-banned'}>
                    {user.isActive ? 'Active' : 'Banned'}
                  </span>
                </td>
                <td>
                  <span className={`verify-status ${user.verificationStatus}`}>
                    {user.verificationStatus}
                  </span>
                </td>
                <td>{user.points || 0}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => onBan(user._id, !user.isActive)}
                      className={`btn-small ${user.isActive ? 'btn-ban' : 'btn-activate'}`}
                    >
                      {user.isActive ? <Ban size={16} /> : <CheckCircle size={16} />}
                    </button>
                    {user.verificationStatus !== 'verified' && (
                      <button
                        onClick={() => onVerify(user._id, 'verified')}
                        className="btn-small btn-verify"
                      >
                        <CheckCircle size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Listings Tab Component
const ListingsTab = ({ listings }) => {
  return (
    <div className="admin-listings">
      <h2>All Listings ({listings.length})</h2>
      <div className="listings-table">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Donor</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Location</th>
              <th>Expires</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing) => (
              <tr key={listing._id}>
                <td>{listing.title}</td>
                <td>{listing.donorId?.name || 'Unknown'}</td>
                <td>{listing.quantity} {listing.unit}</td>
                <td>
                  <span className={`status-badge-table ${listing.status}`}>
                    {listing.status}
                  </span>
                </td>
                <td>{listing.location.city}, {listing.location.state}</td>
                <td>{new Date(listing.expiryTime).toLocaleDateString()}</td>
                <td>
                  <button
                    onClick={() => window.open(`/listings/${listing._id}`, '_blank')}
                    className="btn-small btn-view"
                  >
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Transactions Tab Component
const TransactionsTab = ({ transactions }) => {
  return (
    <div className="admin-transactions">
      <h2>All Food Transactions</h2>
      <div className="transactions-table">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Donor</th>
              <th>Receiver</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Date</th>
              <th>CO₂ Saved</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction._id}>
                <td>{transaction.title}</td>
                <td>{transaction.donorId?.name || 'Unknown'}</td>
                <td>{transaction.claimedBy?.name || 'N/A'}</td>
                <td>{transaction.quantity} {transaction.unit}</td>
                <td>
                  <span className={`status-badge-table ${transaction.status}`}>
                    {transaction.status}
                  </span>
                </td>
                <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
                <td>{transaction.estimatedCO2Reduction?.toFixed(1) || 0} kg</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Volunteers Tab Component
const VolunteersTab = ({ volunteers }) => {
  return (
    <div className="admin-volunteers">
      <h2>All Volunteers ({volunteers.length})</h2>
      <div className="volunteers-grid">
        {volunteers.map((volunteer) => (
          <motion.div key={volunteer._id} className="volunteer-card">
            <div className="volunteer-header">
              <div className="volunteer-avatar">
                {volunteer.profileImage ? (
                  <img src={volunteer.profileImage} alt={volunteer.name} />
                ) : (
                  <div className="avatar-placeholder">{volunteer.name[0]}</div>
                )}
              </div>
              <div>
                <h3>{volunteer.name}</h3>
                <p>{volunteer.email}</p>
              </div>
            </div>
            <div className="volunteer-stats">
              <div className="volunteer-stat">
                <Award size={20} />
                <span>{volunteer.points || 0} Points</span>
              </div>
              <div className="volunteer-stat">
                <Package size={20} />
                <span>Level {volunteer.level || 1}</span>
              </div>
            </div>
            {volunteer.location && (
              <div className="volunteer-location">
                <span>{volunteer.location.city}, {volunteer.location.state}</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Insights Tab Component
const InsightsTab = ({ insights }) => {
  return (
    <div className="admin-insights">
      <h2>Database Insights & Analytics</h2>
      
      <div className="insights-grid">
        <div className="insight-card">
          <h3>Top 10 Donors</h3>
          <div className="insight-list">
            {insights.topDonors.map((donor, index) => (
              <div key={index} className="insight-item">
                <span className="insight-rank">#{index + 1}</span>
                <div className="insight-content">
                  <strong>{donor.name}</strong>
                  <span>{donor.totalFoodDonated?.toFixed(1) || 0} kg donated</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="insight-card">
          <h3>Top 10 Receivers</h3>
          <div className="insight-list">
            {insights.topReceivers.map((receiver, index) => (
              <div key={index} className="insight-item">
                <span className="insight-rank">#{index + 1}</span>
                <div className="insight-content">
                  <strong>{receiver.name}</strong>
                  <span>{receiver.count} transactions</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="insight-card">
          <h3>Food Type Distribution</h3>
          <div className="insight-list">
            {insights.foodTypeDistribution.map((type, index) => (
              <div key={index} className="insight-item">
                <strong>{type._id}</strong>
                <span>{type.count} listings ({type.totalQuantity.toFixed(1)} kg)</span>
              </div>
            ))}
          </div>
        </div>

        <div className="insight-card">
          <h3>Claim Statistics</h3>
          <div className="insight-stats">
            <div className="insight-stat-item">
              <span>Total Claims</span>
              <strong>{insights.claimStats.totalClaims || 0}</strong>
            </div>
            <div className="insight-stat-item">
              <span>Approved</span>
              <strong>{insights.claimStats.approvedClaims || 0}</strong>
            </div>
            <div className="insight-stat-item">
              <span>Approval Rate</span>
              <strong>
                {insights.claimStats.totalClaims > 0
                  ? ((insights.claimStats.approvedClaims / insights.claimStats.totalClaims) * 100).toFixed(1)
                  : 0}%
              </strong>
            </div>
          </div>
        </div>

        <div className="insight-card">
          <h3>Fallback Routing</h3>
          <div className="insight-list">
            {insights.fallbackStats.map((fallback, index) => (
              <div key={index} className="insight-item">
                <strong>{fallback._id || 'none'}</strong>
                <span>{fallback.count} listings ({fallback.totalQuantity.toFixed(1)} kg)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

