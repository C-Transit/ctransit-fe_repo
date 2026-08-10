import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaIdCard,
  FaUpload,
  FaCheckCircle,
  FaTimes,
  FaCamera,
} from "react-icons/fa";
import { KYC_API_URL } from "../config/api";
import styles from "./KYCModal.module.css";

export default function KYCModal({ onClose }) {
  const [idCardImage, setIdCardImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false); // FIX: Track success state

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    setError("");
    setIdCardImage(file);

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setError('');
    setIdCardImage(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleSubmit = async () => {
    if (!idCardImage) {
      setError("Please upload your school ID card");
      return;
    }

    const token = localStorage.getItem("authToken");
  
    if (!token) {
      setError("Session expired. Please log in again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("idCard", idCardImage);

      const response = await fetch(`${KYC_API_URL}/submit`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to submit ID card");
      }

      // FIX: Store KYC status in localStorage immediately after successful submission
      localStorage.setItem('kycStatus', 'pending');
      
      // FIX: Also store submission timestamp for reference
      localStorage.setItem('kycSubmittedAt', new Date().toISOString());
      
      // FIX: Set success state to show success message before closing
      setSubmissionSuccess(true);
      
      // FIX: Delay closing to show success message
      setTimeout(() => {
        onClose({
          success: true,
          message: "ID card submitted successfully. Your information is under review.",
        });
      }, 2000);
      
    } catch (err) {
      setError(err.message || "Failed to submit. Please try again.");
      setLoading(false); // Only set loading false on error, success will close modal
    }
  };

  // FIX: Handle modal close properly
  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <motion.div
      className={styles.modalOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleClose}
    >
      <motion.div
        className={styles.modal}
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* FIX: Show success state or normal form */}
        {submissionSuccess ? (
          <motion.div 
            className={styles.successContainer}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className={styles.successIcon}>
              <FaCheckCircle size={48} />
            </div>
            <h2>Submission Successful!</h2>
            <p>Your ID card has been submitted for verification.</p>
            <p className={styles.successSubtext}>
              Your status is now <strong>Pending</strong>. We'll notify you once the review is complete.
            </p>
            <div className={styles.successBadge}>
              <FaCheckCircle /> Status: Pending Review
            </div>
          </motion.div>
        ) : (
          <>
            {/* Header */}
            <div className={styles.header}>
              <div>
                <span className={styles.badge}>
                  <FaIdCard /> Upload School ID
                </span>
                <h2>Upload Your School ID Card</h2>
                <p>Upload a clear image of your school ID card for verification</p>
              </div>
              <button className={styles.closeBtn} onClick={handleClose}>
                <FaTimes />
              </button>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className={styles.errorBox}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Content */}
            <div className={styles.content}>
              <div
                className={`${styles.uploadBox} ${dragging ? styles.dragging : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {previewUrl ? (
                  <motion.div
                    className={styles.previewContainer}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                  >
                    <img
                      src={previewUrl}
                      alt="School ID Card"
                      className={styles.previewImage}
                    />
                    <button
                      className={styles.changeBtn}
                      onClick={() => document.getElementById("idCardInput").click()}
                      disabled={loading}
                    >
                      Change Image
                    </button>
                  </motion.div>
                ) : (
                  <motion.label
                    htmlFor="idCardInput"
                    className={styles.uploadLabel}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FaUpload />
                    <span>Click to upload or drag and drop</span>
                    <small>PNG, JPG, GIF up to 5MB</small>

                    {/* 👇 Camera capture button */}
                    <button
                      type="button"
                      className={styles.cameraBtn}
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById('cameraInput').click();
                      }}
                    >
                      <FaCamera /> Take Photo
                    </button>
                  </motion.label>
                )}

                {/* File upload input */}
                <input
                  id="idCardInput"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className={styles.fileInput}
                  disabled={loading}
                />

                {/* Camera capture input */}
                <input
                  id="cameraInput"
                  type="file"
                  accept="image/*"
                  capture="environment" 
                  onChange={handleImageUpload}
                  className={styles.fileInput}
                  disabled={loading}
                />
              </div>
              <div className={styles.instructions}>
                <h4>Guidelines:</h4>
                <ul>
                  <li>Ensure the entire ID card is visible</li>
                  <li>Use good lighting and clear focus</li>
                  <li>Avoid glare and shadows</li>
                  <li>File should be JPG, PNG, or GIF</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className={styles.footer}>
              <motion.button
                className={styles.cancelBtn}
                onClick={handleClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
              >
                Cancel
              </motion.button>

              <motion.button
                className={styles.primaryBtn}
                onClick={handleSubmit}
                disabled={loading || !idCardImage}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  "Submitting..."
                ) : (
                  <>
                    <FaCheckCircle /> Submit ID Card
                  </>
                )}
              </motion.button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}