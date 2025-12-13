import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaUserCircle } from 'react-icons/fa';
import styles from './Navbar.module.css';

const Navbar = ({ isLoggedIn, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // User state
  const [user, setUser] = useState(null);

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, [isLoggedIn]);

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const closeAllMenus = () => {
    setMenuOpen(false);
    setDropdownOpen(false);
  };

  // Close dropdown on clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className={styles.navbar}>
      <div className={styles.navbarContainer}>
        
        <NavLink 
          to={isLoggedIn ? '/home' : '/'} 
          className={styles.navLogo}
          onClick={closeAllMenus}
        >
          SceneSolver
        </NavLink>

        {isLoggedIn && (
          <>
            {/* Mobile toggle */}
            <div className={styles.menuIcon} onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <FaTimes /> : <FaBars />}
            </div>

            {/* NAV MENU */}
            <nav className={menuOpen ? `${styles.navMenu} ${styles.active}` : styles.navMenu}>
              
              <li className={styles.navItem}>
                <NavLink to="/home" className={styles.navLink} onClick={closeAllMenus}>
                  Home
                </NavLink>
              </li>

              <li className={styles.navItem}>
                <NavLink to="/how-it-works" className={styles.navLink} onClick={closeAllMenus}>
                  How It Works
                </NavLink>
              </li>

              <li className={styles.navItem}>
                <NavLink to="/history" className={styles.navLink} onClick={closeAllMenus}>
                  History
                </NavLink>
              </li>

              

              <li className={styles.navItem}>
                <NavLink to="/upload" className={styles.navLink} onClick={closeAllMenus}>
                  Analyze
                </NavLink>
              </li>

              {/* Mobile Logout */}
              <li className={`${styles.navItem} ${styles.logoutButtonMobile}`}>
                <button onClick={handleLogout}>Logout</button>
              </li>

            </nav>

            {/* Profile Dropdown */}
            <div className={styles.profileContainer} ref={dropdownRef}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)} 
                className={styles.profileButton}
              >
                <FaUserCircle className={styles.profileIcon} />
                {user && <span className={styles.userName}>{user.name}</span>}
              </button>

              {dropdownOpen && (
                <div className={styles.profileDropdown}>
                  <div className={styles.dropdownHeader}>
                    Signed in as <br />
                    <strong>{user ? user.name : "User"}</strong>
                  </div>

                  <NavLink
                    to="/history"
                    className={styles.dropdownItem}
                    onClick={() => setDropdownOpen(false)}
                  >
                    Analysis History
                  </NavLink>

                  
                  

                  <div
                    className={`${styles.dropdownItem} ${styles.logoutItem}`}
                    onClick={handleLogout}
                  >
                    Logout
                  </div>
                </div>
              )}
            </div>

          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
