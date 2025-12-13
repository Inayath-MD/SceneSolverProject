// scenesolver-frontend/src/components/TrashPage.js

import React, { useEffect, useState } from "react";
import { FaTrashRestore, FaTrashAlt, FaSpinner, FaArrowLeft } from "react-icons/fa";
import styles from "./TrashPage.module.css";
import api from "../api";
import { Link } from "react-router-dom";

const TrashPage = () => {
    const [trash, setTrash] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch trash list
    useEffect(() => {
        async function fetchTrash() {
            try {
                const res = await api.get("/analysis/trash/all");
                setTrash(res.data);
            } catch (err) {
                console.error("Failed to load trash:", err);
                setError("Could not load trash items.");
            } finally {
                setIsLoading(false);
            }
        }

        fetchTrash();
    }, []);

    // Restore item
    const restoreItem = async (id) => {
        try {
            await api.put(`/analysis/restore/${id}`);
            setTrash(trash.filter((item) => item._id !== id));
        } catch (err) {
            console.error("Restore failed:", err);
        }
    };

    // Permanent delete
    const permanentlyDelete = async (id) => {
        if (!window.confirm("⚠ Permanently delete this item? This cannot be undone.")) return;

        try {
            await api.delete(`/analysis/permanent/${id}`);
            setTrash(trash.filter((item) => item._id !== id));
        } catch (err) {
            console.error("Permanent delete failed:", err);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <Link className={styles.backButton} to="/history">
                <FaArrowLeft /> Back to History
            </Link>

            <h1 className={styles.pageTitle}>Trash Bin</h1>

            {isLoading ? (
                <div className={styles.statusBox}>
                    <FaSpinner className={styles.spinner} /> Loading Trash...
                </div>
            ) : error ? (
                <div className={`${styles.statusBox} ${styles.errorBox}`}>
                    {error}
                </div>
            ) : trash.length === 0 ? (
                <div className={styles.emptyTrash}>
                    <FaTrashAlt className={styles.emptyIcon} />
                    <h2>Trash is Empty</h2>
                    <p>No deleted items found.</p>
                </div>
            ) : (
                <div className={styles.trashGrid}>
                    {trash.map((item) => (
                        <div key={item._id} className={styles.trashCard}>
                            
                            {/* Media preview */}
                            {item.mediaType === "video" ? (
                                <video
                                    src={item.mediaUrl}
                                    className={styles.cardMedia}
                                    muted
                                    loop
                                    autoPlay
                                />
                            ) : (
                                <img
                                    src={item.mediaUrl}
                                    alt="Deleted item"
                                    className={styles.cardMedia}
                                />
                            )}

                            <div className={styles.cardOverlay}>
                                <h3>{new Date(item.deletedAt).toLocaleDateString()}</h3>
                                <p>Deleted Item</p>
                            </div>

                            {/* Actions */}
                            <div className={styles.actionRow}>
                                <button
                                    className={styles.restoreButton}
                                    onClick={() => restoreItem(item._id)}
                                >
                                    <FaTrashRestore /> Restore
                                </button>

                                <button
                                    className={styles.permanentDeleteButton}
                                    onClick={() => permanentlyDelete(item._id)}
                                >
                                    <FaTrashAlt /> Delete Forever
                                </button>
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TrashPage;
