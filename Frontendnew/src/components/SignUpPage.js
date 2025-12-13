// scenesolver-frontend/src/components/SignUpPage.js

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Auth.module.css';
import background from '../assets/login.jpg';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

const SignUpPage = () => {
    // --- NEW: Add state for name ---
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage("Passwords do not match.");
            setIsSuccess(false);
            return;
        }
        setLoading(true);
        setMessage('');

        try {
            const response = await fetch("http://localhost:5000/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // --- UPDATED: Send name in the request body ---
                body: JSON.stringify({ name, email, password }),
            });
            const data = await response.json();
            if (response.ok) { // Check for successful HTTP status
                setIsSuccess(true);
                setMessage("Signup successful! Redirecting to login...");
                setTimeout(() => navigate('/'), 2000);
            } else {
                setIsSuccess(false);
                setMessage(data.message || "Signup failed.");
            }
        } catch (err) {
            setIsSuccess(false);
            setMessage("Server error. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.authPage} style={{ backgroundImage: `url(${background})` }}>
            <div className={styles.authContainer}>
                <h1 className={styles.authTitle}>Create Account</h1>
                <form onSubmit={handleSignup} className={styles.authForm}>

                    {/* --- NEW: Input group for Name --- */}
                    <div className={styles.inputGroup}>
                        <label htmlFor="name">Full Name</label>
                        <input
                            id="name"
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="email">Email</label>
                        <input
                            id="email" type="email" placeholder="you@example.com" value={email}
                            onChange={(e) => setEmail(e.target.value)} required
                        />
                    </div>

                    {/* ... other input groups for password and confirm password ... */}
                    <div className={styles.inputGroup}>
                        <label htmlFor="password">Password</label>
                        <div className={styles.passwordWrapper}>
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Minimum 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)} required
                            />
                            <button
                                type="button"
                                className={styles.passwordToggle}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <div className={styles.passwordWrapper}>
                            <input
                                id="confirmPassword"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Repeat password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)} required
                            />
                        </div>
                    </div>

                    {message && (
                        <p className={isSuccess ? styles.successMessage : styles.errorMessage}>{message}</p>
                    )}
                    <button type="submit" className={styles.authButton} disabled={loading}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>
                <p className={styles.redirectLink}>
                    Already have an account? <Link to="/">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default SignUpPage;