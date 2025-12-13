import React from 'react';
import styles from './HowItWorks.module.css';
import background from '../assets/hiw.jpg';
import { FaFileUpload, FaMicroscope, FaFileAlt } from 'react-icons/fa';

const HowItWorks = () => {
  return (
    <div className="page-container" style={{ backgroundImage: `url(${background})` }}>
      <div className={styles.howItWorksContainer}>
        <h1 className={styles.mainTitle}>From Image to Insight in 3 Simple Steps</h1>
        <p className={styles.subtitle}>
          SceneSolver streamlines complex analysis into a clear, straightforward process.
        </p>
        
        <div className={styles.stepsGrid}>
          {/* Step 1 */}
          <div className={styles.stepCard}>
            <div className={styles.stepIconWrapper}>
              <FaFileUpload className={styles.stepIcon} />
            </div>
            <div className={styles.stepNumber}>Step 1</div>
            <h2 className={styles.stepTitle}>Upload Evidence</h2>
            <p className={styles.stepDescription}>
              Securely upload an image or video frame directly from a device or CCTV feed. Our system accepts multiple formats for your convenience.
            </p>
          </div>

          {/* Step 2 */}
          <div className={styles.stepCard}>
            <div className={styles.stepIconWrapper}>
              <FaMicroscope className={styles.stepIcon} />
            </div>
            <div className={styles.stepNumber}>Step 2</div>
            <h2 className={styles.stepTitle}>AI Analysis</h2>
            <p className={styles.stepDescription}>
              Our intelligent engine scans the scene for hundreds of data points, identifying objects, patterns, and potential threats in seconds.
            </p>
          </div>

          {/* Step 3 */}
          <div className={styles.stepCard}>
            <div className={styles.stepIconWrapper}>
              <FaFileAlt className={styles.stepIcon} />
            </div>
            <div className={styles.stepNumber}>Step 3</div>
            <h2 className={styles.stepTitle}>Receive Report</h2>
            <p className={styles.stepDescription}>
              Get a concise, easy-to-understand report detailing all findings, complete with visual markers and confidence scores.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;