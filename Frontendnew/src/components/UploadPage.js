import React, { useState, useRef } from 'react';
// We need the standard 'axios' library for this special file upload case
import axios from 'axios';
import styles from './UploadPage.module.css';
import ResultsPage from './ResultsPage';
import { FaImage, FaVideo, FaFileImport, FaTimes, FaSpinner } from 'react-icons/fa';

const UploadPage = () => {
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [fileType, setFileType] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);

    const fileInputRef = useRef(null);

    // No changes needed in these helper functions
    const processFile = (selectedFile) => {
        if (!selectedFile) return;
        const fileIsImage = selectedFile.type.startsWith('image/');
        const fileIsVideo = selectedFile.type.startsWith('video/');
        if (!fileIsImage && !fileIsVideo) {
            setError('Please upload a valid image or video file.');
            return;
        }
        setFileType(fileIsImage ? 'image' : 'video');
        setError('');
        setFile(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile));
    };
    const handleFileChange = (e) => { processFile(e.target.files[0]); };
    const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); processFile(e.dataTransfer.files[0]); };
    const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
    const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleCancel = () => { setFile(null); setPreviewUrl(null); setFileType(null); setError(''); };

    // --- THIS IS THE CORRECTED FUNCTION ---
    const handleSubmit = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append('media', file);

        setIsLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');

            // For multipart/form-data, we use axios directly to let it set the headers.
            // Our global `api` instance forces 'application/json', which is wrong for file uploads.
            const res = await axios.post(
                'http://localhost:5000/api/analysis', // Use the full, absolute URL
                formData,
                {
                    headers: {
                        // Axios will automatically set 'Content-Type': 'multipart/form-data'
                        'x-auth-token': token // We must manually add the auth token here
                    }
                }
            );

            setAnalysisResult(res.data);
        } catch (err) {
            let errorMessage = 'An unknown error occurred during analysis.';

            if (err.code === 'ERR_NETWORK') {
                errorMessage = 'Cannot connect to Backend (port 5000). Is the server running?';
            } else if (err.response?.data?.msg) {
                errorMessage = err.response.data.msg;
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // No changes needed in the returned JSX
    if (analysisResult) {
        return (
            <div className={styles.pageContainer}>
                <h1 className={styles.resultsHeader}>Analysis Complete!</h1>
                <ResultsPage analysisData={analysisResult} />
                <button className={styles.analyzeAnotherBtn} onClick={() => { setAnalysisResult(null); handleCancel(); }}>
                    Analyze Another Scene
                </button>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            {!previewUrl ? (
                <div
                    className={`${styles.dropZone} ${isDragging ? styles.dragging : ''}`}
                    onClick={() => fileInputRef.current.click()}
                    onDrop={handleDrop} onDragOver={handleDragOver} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave}
                >
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*" style={{ display: 'none' }} />
                    <FaFileImport className={styles.uploadIcon} />
                    <h2>Drag & Drop Your Scene Here</h2>
                    <p>or click to browse files</p>
                    <div className={styles.supportedFiles}>
                        <span><FaImage /> Images</span>
                        <span><FaVideo /> Videos</span>
                    </div>
                </div>
            ) : (
                <div className={styles.previewContainer}>
                    <h2>Ready to Analyze?</h2>
                    <div className={styles.previewBox}>
                        {fileType === 'image' && <img src={previewUrl} alt="Preview" />}
                        {fileType === 'video' && <video src={previewUrl} controls />}
                        {isLoading && (
                            <div className={styles.loadingOverlay}>
                                <FaSpinner className={styles.spinner} />
                                <p>Scanning for clues...</p>
                            </div>
                        )}
                        <button className={styles.cancelButton} onClick={handleCancel} title="Cancel"> <FaTimes /> </button>
                    </div>
                    <p className={styles.fileName}>{file.name}</p>
                    <button className={styles.analyzeButton} onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? 'Analyzing...' : 'Solve This Scene'}
                    </button>
                </div>
            )}
            {error && <p className={styles.errorText}>{error}</p>}
        </div>
    );
};

export default UploadPage;