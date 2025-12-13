// scenesolver-frontend/src/components/HistoryPage.js

import React, { useState, useEffect } from 'react';
import styles from './HistoryPage.module.css';
import ResultsPage from './ResultsPage';
import { FaArchive, FaSpinner, FaArrowLeft, FaTrash, FaTrashRestore, FaTrashAlt } from 'react-icons/fa';
import api from '../api';
import { Link } from 'react-router-dom';

const HistoryPage = () => {
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAnalysis, setSelectedAnalysis] = useState(null);

    // ⭐ Undo state
    const [undoItem, setUndoItem] = useState(null);

    // --------------------------------------
    // FETCH HISTORY
    // --------------------------------------
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get('/analysis/history');
                console.log("📦 Received history:", res.data);
                setHistory(res.data);

            } catch (err) {
                console.error("Failed to fetch history:", err);
                setError('Could not fetch your analysis history.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, []);

    // --------------------------------------
    // DELETE ONE — Soft Delete
    // --------------------------------------
    const handleDelete = async (id) => {
        const deletedItem = history.find(item => item._id === id);

        // Store for undo option
        setUndoItem(deletedItem);

        // Remove from UI immediately
        setHistory(history.filter(item => item._id !== id));

        // Remove undo message after 5s
        setTimeout(() => setUndoItem(null), 5000);

        try {
            await api.delete(`/analysis/${id}`);
        } catch (err) {
            console.error("❌ Delete failed:", err);
            alert("Delete failed!");
        }
    };

    // --------------------------------------
    // UNDO DELETE — Restore
    // --------------------------------------
    const handleUndo = async () => {
        if (!undoItem) return;

        try {
            await api.put(`/analysis/restore/${undoItem._id}`);

            // Add back to history list
            setHistory([undoItem, ...history]);

        } catch (err) {
            console.error("Undo failed:", err);
        }

        setUndoItem(null);
    };

    // --------------------------------------
    // DELETE ALL — Soft delete all items
    // --------------------------------------
    const handleDeleteAll = async () => {
        if (!window.confirm("⚠ Are you sure you want to delete ALL history?")) return;

        try {
            await api.delete('/analysis/delete-all/all');
            setHistory([]); // Clear UI

        } catch (err) {
            console.error("❌ Failed to delete all:", err);
        }
    };

    // --------------------------------------
    // VIEW SINGLE ANALYSIS
    // --------------------------------------
    if (selectedAnalysis) {
        return (
            <div className={styles.pageContainer}>
                <button 
                    className={styles.backButton} 
                    onClick={() => setSelectedAnalysis(null)}
                >
                    <FaArrowLeft /> Back to History
                </button>
                <ResultsPage analysisData={selectedAnalysis} />
            </div>
        );
    }

    // --------------------------------------
    // MAIN HISTORY PAGE
    // --------------------------------------
    return (
        <div className={styles.pageContainer}>
            
            <h1 className={styles.pageTitle}>Analysis Archives</h1>

            {/* ⭐ Undo Toast */}
            {undoItem && (
                <div className={styles.undoToast}>
                    Deleted — 
                    <button onClick={handleUndo} className={styles.undoButton}>
                        Undo
                    </button>
                </div>
            )}

            {/* ⭐ Top Buttons */}
            <div className={styles.topActions}>
                <button className={styles.deleteAllButton} onClick={handleDeleteAll}>
                    <FaTrashAlt /> Delete ALL
                </button>

                <Link to="/trash" className={styles.trashButton}>
                    <FaTrashRestore /> View Trash
                </Link>
            </div>

            {isLoading ? (
                <div className={styles.statusBox}>
                    <FaSpinner className={styles.spinner} /> Loading Archives...
                </div>

            ) : error ? (
                <div className={`${styles.statusBox} ${styles.errorBox}`}>
                    {error}
                </div>

            ) : history.length === 0 ? (
                <div className={styles.emptyHistory}>
                    <FaArchive className={styles.emptyIcon} />
                    <h2>No History Found</h2>
                    <p>You haven't analyzed any scenes yet. Go to the Upload page to get started!</p>
                </div>

            ) : (
                <div className={styles.historyGrid}>
                    {history.map((analysis) => (
                        <div key={analysis._id} className={styles.historyCard}>

                            {/* Click card to open full report */}
                            <div
                                className={styles.cardClickableArea}
                                onClick={() => setSelectedAnalysis(analysis)}
                            >
                                {analysis.mediaType === 'video' ? (
                                    <video
                                        src={analysis.mediaUrl}
                                        className={styles.cardMedia}
                                        muted
                                        loop
                                        autoPlay
                                        playsInline
                                        preload="metadata"
                                    />
                                ) : (
                                    <img
                                        src={analysis.mediaUrl}
                                        alt="Analyzed scene"
                                        className={styles.cardMedia}
                                    />
                                )}

                                <div className={styles.cardOverlay}>
                                    <h3>{new Date(analysis.createdAt).toLocaleDateString()}</h3>
                                    <p>Click to view report</p>
                                </div>
                            </div>

                            {/* ⭐ Delete button (does NOT open the report) */}
                            <button
                                className={styles.deleteButton}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(analysis._id);
                                }}
                            >
                                <FaTrash /> Delete
                            </button>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HistoryPage;
