import React from 'react';
import styles from './HomePage.module.css';
import background from '../assets/hiw.jpg';
import { FaSearch, FaBolt, FaUserShield, FaFileUpload } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="page-container" style={{ backgroundImage: `url(${background})` }}>
      {/* Hero Section */}
      <header className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Unlock The Scene</h1>
          <p className={styles.heroSubtitle}>Intelligent analysis for critical situations. Fast, precise, and reliable.</p>
          <button className={styles.ctaButton} onClick={() => navigate('/upload')}>
            Analyze an Image
          </button>
        </div>
      </header>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <h2 className={styles.sectionTitle}>Why SceneSolver?</h2>
        <div className={styles.featuresGrid}>
          <div className={styles.featureItem}>
            <FaSearch className={styles.featureIcon} />
            <h3>Rapid Insight</h3>
            <p>Instantly identify key elements, threats, and events within any image.</p>
          </div>
          <div className={styles.featureItem}>
            <FaBolt className={styles.featureIcon} />
            <h3>AI-Powered Precision</h3>
            <p>Our algorithms turn complex visuals into clear, actionable data.</p>
          </div>
          <div className={styles.featureItem}>
            <FaFileUpload className={styles.featureIcon} />
            <h3>Simple & Direct</h3>
            <p>Just upload an image or video frame. No technical expertise required.</p>
          </div>
          <div className={styles.featureItem}>
            <FaUserShield className={styles.featureIcon} />
            <h3>For Investigators</h3>
            <p>Designed for law enforcement, security teams, and forensic analysts.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;