import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Map, Zap, Users, Leaf, ArrowRight,
  TrendingUp, Heart, Award, CheckCircle
} from 'lucide-react';
import './Hero.css';

const Hero = ({ stats }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const features = [
    { icon: <Zap size={24} />, label: 'AI-Powered', color: '#FF9933' },
    { icon: <Leaf size={24} />, label: 'Sustainable', color: '#138808' },
    { icon: <Map size={24} />, label: 'Map-First', color: '#000080' },
    { icon: <Users size={24} />, label: 'Community Bridge', color: '#FF9933' }
  ];

  const impactScaling = [
    { label: 'Local', level: 1 },
    { label: 'National', level: 2 },
    { label: 'Global', level: 3 }
  ];

  return (
    <section className="hero-new">
      {/* Animated Background */}
      <div className="hero-background">
        <div className="hero-gradient-orb orb-1"></div>
        <div className="hero-gradient-orb orb-2"></div>
        <div className="hero-gradient-orb orb-3"></div>
      </div>

      <div className="hero-container">
        {/* Top Badge Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="hero-top-badge"
        >
          <Award size={20} />
          <span>YUVAi – Global Youth Challenge</span>
        </motion.div>

        {/* Main Content */}
        <div className="hero-main-content">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hero-left"
          >
            {/* Title Section */}
            <div className="hero-title-section">
              <h1 className="hero-main-title">
                <span className="hero-title-primary">Samartha Setu</span>
                <span className="hero-title-tagline">
                  Connect surplus food to need — instantly.
                </span>
              </h1>
              <p className="hero-subtitle">
                Maps + AI + Community for real-time food rescue and crisis support
              </p>
            </div>

            {/* Description */}
            <p className="hero-description-new">
              A national-scale AI powered platform that connects food donors to receivers instantly, 
              using intelligent fallback routing to ensure <strong>zero food waste</strong>.
            </p>

            {/* Features Grid */}
            <div className="hero-features-grid">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="hero-feature-item"
                >
                  <div className="hero-feature-icon" style={{ color: feature.color }}>
                    {feature.icon}
                  </div>
                  <span className="hero-feature-label">{feature.label}</span>
                </motion.div>
              ))}
            </div>

            {/* Bottom Section - Team Left, Other Content Right */}
            <div className="hero-bottom-section">
              {/* Team Section - Left */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="hero-team-section"
              >
                <div className="team-label">Team</div>
                <div className="team-members">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="team-member-btn"
                  >
                    <div className="team-member-content">
                      <div className="team-member-name">V K Nithyanand</div>
                      <div className="team-member-role">
                        MERN Developer, AI Integration, Software Engineer @ JMAN Group
                      </div>
                    </div>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="team-member-btn"
                  >
                    <div className="team-member-content">
                      <div className="team-member-name">Guggila HemaSundar Reddy</div>
                      <div className="team-member-role">
                        Frontend & UI/UX Developer, Vice Chair, Coding Club MBU
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Right Side - Impact, Deployment, CTA */}
              <div className="hero-right-content">
                {/* Impact Scaling */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1 }}
                  className="hero-impact-scaling"
                >
                  <div className="impact-label">Impact Scaling</div>
                  <div className="impact-steps">
                    {impactScaling.map((step, index) => (
                      <div key={index} className="impact-step">
                        <span className="impact-step-label">{step.label}</span>
                        {index < impactScaling.length - 1 && (
                          <ArrowRight size={16} className="impact-arrow" />
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Deployment Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                  className="hero-deployment"
                >
                  <CheckCircle size={18} />
                  <div>
                    <div className="deployment-label">Real-time Working Application</div>
                    <div className="deployment-location">India (Nationwide Prototype Testing)</div>
                  </div>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.4 }}
                  className="hero-actions-new"
                >
                  {!isAuthenticated ? (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/register')}
                        className="btn-hero-primary"
                      >
                        Get Started <ArrowRight size={20} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/login')}
                        className="btn-hero-secondary"
                      >
                        Login
                      </motion.button>
                    </>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/dashboard')}
                      className="btn-hero-primary"
                    >
                      Go to Dashboard <ArrowRight size={20} />
                    </motion.button>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Stats */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hero-right"
          >
            <div className="hero-stats-container">
              <div className="stats-header">
                <TrendingUp size={24} />
                <span>Live Impact Metrics</span>
              </div>
              <div className="stats-grid-new">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="stat-card-new"
                >
                  <div className="stat-icon-wrapper" style={{ background: 'rgba(19, 136, 8, 0.1)' }}>
                    <Leaf size={28} color="#138808" />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value-new">{stats?.foodSaved || '12,450'} kg</div>
                    <div className="stat-label-new">Food Saved</div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="stat-card-new"
                >
                  <div className="stat-icon-wrapper" style={{ background: 'rgba(255, 153, 51, 0.1)' }}>
                    <TrendingUp size={28} color="#FF9933" />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value-new">{stats?.co2Reduced || '31,125'} kg</div>
                    <div className="stat-label-new">CO₂ Reduced</div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="stat-card-new"
                >
                  <div className="stat-icon-wrapper" style={{ background: 'rgba(0, 0, 128, 0.1)' }}>
                    <Heart size={28} color="#000080" />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value-new">{stats?.mealsServed || '24,900'}</div>
                    <div className="stat-label-new">Meals Served</div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="stat-card-new"
                >
                  <div className="stat-icon-wrapper" style={{ background: 'rgba(19, 136, 8, 0.1)' }}>
                    <Users size={28} color="#138808" />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value-new">{stats?.activeUsers || '1,250'}</div>
                    <div className="stat-label-new">Active Users</div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

