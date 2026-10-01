import { useState, useEffect } from 'react';
import { FaArrowLeft, FaEdit, FaCheck, FaTimes, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import styles from './ProfilePage.module.css';

import { USER_API_URL } from '../../../api/api';

export default function ProfilePage({ userData, onBack }) {
  const [editMode, setEditMode] = useState(false);
  
  // Real parameters only: No dummy placeholder parameters
  const [formData, setFormData] = useState({
    firstName: userData?.firstName || userData?.firstname || '',
    lastName: userData?.lastName || userData?.lastname || '',
    email: userData?.email || '',
    matricNumber: userData?.matricNumber || '',
  });
  
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Auto synchronizes values immediately after profile background load completes
  useEffect(() => {
    if (userData) {
      setFormData({
        firstName: userData.firstName || userData.firstname || '',
        lastName: userData.lastName || userData.lastname || '',
        email: userData.email || '',
        matricNumber: userData.matricNumber || '',
      });
    }
  }, [userData]);

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSave = async () => {
    try {
      setSaveLoading(true);
      setSaveError(null);
      const token = localStorage.getItem('authToken');
      
      // Backend uses PATCH /api/users/update-profile with { firstname, lastname } only
      await axios.patch(
        `${USER_API_URL}/users/update-profile`,
        {
          firstname: formData.firstName.trim(),
          lastname: formData.lastName.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setEditMode(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      setSaveError(err.response?.data?.message || 'Failed to save changes. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: userData?.firstName || '',
      lastName: userData?.lastName || '',
      email: userData?.email || '',
      matricNumber: userData?.matricNumber || '',
    });
    setSaveError(null);
    setEditMode(false);
  };

  return (
    <div className={styles.profilePages}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <button className={styles.backBtn} onClick={onBack}>
          <FaArrowLeft size={20} />
        </button>
        <h1 className={styles.pageTitle}>Profile</h1>
        <button
          type="button"
          className={styles.editBtn}
          onClick={() => {
            if (editMode) handleCancel();
            else setEditMode(true);
          }}
        >
          {editMode ? <FaTimes size={20} /> : <FaEdit size={20} />}
        </button>
      </div>

      {/* Profile Avatar Section */}
      <div className={styles.avatarSection}>
        <div className={styles.avatar}>
          {(formData.firstName || '').trim().charAt(0).toUpperCase() || 'U'}
          {(formData.lastName || '').trim().charAt(0).toUpperCase()}
        </div>
        <p className={styles.userInitials}>
          {userData?.fullname || `${formData.firstName} ${formData.lastName}`.trim() || 'C-Transit User'}
        </p>
      </div>

      {/* Profile Info Form */}
      <div className={styles.infoSection}>
        <h3 className={styles.sectionTitle}>Account Registration Data</h3>

        <div className={styles.formGroup}>
          <label className={styles.label}>First Name</label>
          <input
            type="text"
            className={styles.input}
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            disabled={!editMode}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Last Name</label>
          <input
            type="text"
            className={styles.input}
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            disabled={!editMode}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Email Address (Read-only)</label>
          <input
            type="email"
            className={styles.input}
            value={formData.email}
            disabled
            title="Email cannot be modified"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Matric Number (Read-only)</label>
          <input
            type="text"
            className={styles.input}
            value={formData.matricNumber}
            disabled
            title="Matric Number cannot be modified"
          />
        </div>
      </div>

      {/* Save Error Message */}
      {saveError && (
        <p className={styles.errorMessage}>{saveError}</p>
      )}

      {/* Edit Mode Actions */}
      {editMode && (
        <div className={styles.editActions}>
          <button
            type="button"
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={saveLoading}
          >
            <FaCheck size={16} />
            {saveLoading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={handleCancel}
            disabled={saveLoading}
          >
            <FaTimes size={16} />
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}