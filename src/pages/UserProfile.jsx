import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { FaArrowLeft, FaEdit, FaLock, FaPhone, FaCalendarAlt, FaExclamationTriangle, FaIdCard } from 'react-icons/fa';
import KYCModal from '../components/KYCModal';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import { USER_API_URL } from '../config/api';
import styles from './UserProfile.module.css';

/**
 * UserProfile Component
 * 
 * Shows user's profile information including:
 * - Personal info (name, email, matric number, phone)
 * - Account statistics
 * - Edit profile button
 * - Change password button
 * 
 * BACKEND INTEGRATION:
 * - GET /api/users/myprofile (get current profile data)
 * - PUT /api/users/update-profile (update profile: name, phone)
 * - POST /api/users/change-password (change password)
 */
export default function UserProfile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [kycMessage, setKycMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [profileStats, setProfileStats] = useState({
    totalTrips: 0,
    totalSpent: 0,
    memberSince: '',
    avgSpend: 0,
    lastTrip: '',
  });

  // User data state
  const [userData, setUserData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    matricNumber: '',
    phone: '',
  });

  // Fetch user profile on mount
  // GET /api/users/myprofile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`${USER_API_URL}/users/myprofile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.data?.profile) {
          const profile = response.data.data.profile;
          setUserData({
            firstname: profile.firstname || "",
            lastname: profile.lastname || "",
            email: profile.email || "",
            matricNumber: profile.matricNumber || "",
            phone: profile.kyc?.phoneNumber || "",
          });
        }

        // Set profile stats if available
        if (response.data.stats) {
          setProfileStats({
            totalTrips: response.data.stats.totalTrips || 0,
            totalSpent: response.data.stats.totalSpent || 0,
            memberSince: response.data.stats.memberSince || 'January 2026',
            avgSpend: response.data.stats.avgSpend || 0,
            lastTrip: response.data.stats.lastTrip || '',
          });
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        // Fallback to default data if fetch fails
        setUserData({
          firstname: 'User',
          lastname: '',
          email: '',
          matricNumber: '',
          phone: '',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  // BACKEND: PUT /api/users/update-profile
  // Send: { firstname, lastname, phone }
  // Response: { success: true, user: {...updatedUserData} }
  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.patch(`${USER_API_URL}/users/update-profile`, {
        firstname: userData.firstname,
        lastname: userData.lastname,
        phone: userData.phone,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.user) {
        setUserData(response.data.user);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      // Show error message to user
    }
  };

  // BACKEND: POST /api/users/change-password
  // Send: { currentPassword, newPassword, confirmPassword }
  // Response: { success: true, message: "Password changed" }
  const handleChangePassword = async (currentPass, newPass, confirmPass) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.post(`${USER_API_URL}/users/change-password`, {
        currentPassword: currentPass,
        newPassword: newPass,
        confirmPassword: confirmPass,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setShowPasswordModal(false);
      // Show success message
    } catch (error) {
      console.error('Failed to change password:', error);
      // Show error message to user
    }
  };

  const handleKYCModalClose = (result) => {
    if (result?.success) {
      setKycMessage(result.message);
      setShowKYCModal(false);
      // Auto-dismiss message after 3 seconds
      setTimeout(() => setKycMessage(''), 3000);
    } else {
      setShowKYCModal(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div className={styles.profilePage} initial="hidden" animate="visible" variants={containerVariants}>
      {/* Header */}
      <div className={styles.header}>
        <motion.button className={styles.backBtn} onClick={() => navigate('/dashboard')} whileHover={{ x: -5 }}>
          <FaArrowLeft /> Back
        </motion.button>
        <h1>My Profile</h1>
      </div>

      {loading ? (
        <div className={styles.container}>
          <LoadingState variant="profile" />
        </div>
      ) : !userData.firstname ? (
        <div className={styles.container}>
          <EmptyState 
            variant="default"
            title="Profile Not Found"
            description="Unable to load your profile information. Please try again."
            action={{
              label: 'Go Back',
              onClick: () => navigate('/dashboard'),
            }}
          />
        </div>
      ) : (
        <div className={styles.container}>
          {/* Profile Card */}
          <motion.div className={styles.profileCard} variants={itemVariants}>
          {/* Avatar Section */}
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              <span>{userData.firstname[0]}</span>
            </div>
          </div>

          {/* User Info Section */}
          <div className={styles.infoSection}>
            <h2>
              {userData.firstname} {userData.lastname}
            </h2>

            {/* Info Grid */}
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <label>Email</label>
                <p>{userData.email}</p>
              </div>
              <div className={styles.infoItem}>
                <label>Matric Number</label>
                <p>{userData.matricNumber}</p>
              </div>
              <div className={styles.infoItem}>
                <label>Phone Number</label>
                <p>{userData.phone}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles.actionButtons}>
            <motion.button
              className={styles.primaryBtn}
              onClick={() => setIsEditing(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaEdit /> Edit Profile
            </motion.button>
            <motion.button
              className={styles.secondaryBtn}
              onClick={() => setShowPasswordModal(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaLock /> Change Password
            </motion.button>
          </div>
        </motion.div>

        {/* Statistics Card */}
        <motion.div className={styles.statsCard} variants={itemVariants}>
          <h3>Account Statistics</h3>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{profileStats.totalTrips}</div>
              <div className={styles.statLabel}>Total Trips</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>₦{profileStats.totalSpent.toLocaleString()}</div>
              <div className={styles.statLabel}>Total Spent</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{profileStats.memberSince}</div>
              <div className={styles.statLabel}>Member Since</div>
            </div>
          </div>
        </motion.div>

        {/* Report Dispute Shortcut Card (replaces Emergency Contact) */}
        <motion.div className={styles.emergencyCard} variants={itemVariants}>
          <h3>
            <FaExclamationTriangle /> Report a Dispute
          </h3>
          <p className={styles.placeholder}>Found an incorrect charge? Report it and track resolution.</p>
          <motion.button
            className={styles.addBtn}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/report-dispute')}
          >
            Go to Dispute Form
          </motion.button>
        </motion.div>

        {/* KYC Verification Card */}
        <motion.div className={styles.emergencyCard} variants={itemVariants}>
          <h3>
            <FaIdCard /> KYC Verification
          </h3>
          <p className={styles.placeholder}>Complete identity verification to unlock wallet features and additional payment methods.</p>
          <motion.button
            className={styles.addBtn}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowKYCModal(true)}
          >
            Start KYC Verification
          </motion.button>
        </motion.div>

        {/* KYC Success Message */}
        <AnimatePresence>
          {kycMessage && (
            <motion.div
              className={styles.successToast}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              ✓ {kycMessage}
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditing && <EditProfileModal userData={userData} setUserData={setUserData} onClose={() => setIsEditing(false)} onSave={handleSaveProfile} />}

      {/* Change Password Modal */}
      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} onSubmit={handleChangePassword} />}

      {/* KYC Modal */}
      <AnimatePresence>
        {showKYCModal && <KYCModal onClose={handleKYCModalClose} />}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * EditProfileModal - Modal for editing user profile
 * BACKEND: PUT /api/user/profile
 */
function EditProfileModal({ userData, setUserData, onClose, onSave }) {
  const [formData, setFormData] = useState(userData);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUserData(formData);
    await onSave();
  };

  return (
    <motion.div className={styles.modalOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className={styles.modal} initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
        <h2>Edit Profile</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>First Name</label>
            <input
              type="text"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              placeholder="First name"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Last Name</label>
            <input
              type="text"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              placeholder="Last name"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+234 XXX XXXX XXXX"
            />
          </div>
          <div className={styles.modalActions}>
            <motion.button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              whileHover={{ scale: 1.02 }}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              className={styles.submitBtn}
              whileHover={{ scale: 1.02 }}
            >
              Save Changes
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

/**
 * ChangePasswordModal - Modal for changing password
 * BACKEND: POST /api/user/change-password
 */
function ChangePasswordModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    await onSubmit(formData.currentPassword, formData.newPassword);
  };

  return (
    <motion.div className={styles.modalOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className={styles.modal} initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
        <h2>Change Password</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="Enter current password"
            />
          </div>
          <div className={styles.formGroup}>
            <label>New Password</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter new password (min 8 chars)"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
            />
          </div>
          {error && <div className={styles.errorMessage}>{error}</div>}
          <div className={styles.modalActions}>
            <motion.button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              whileHover={{ scale: 1.02 }}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              className={styles.submitBtn}
              whileHover={{ scale: 1.02 }}
            >
              Update Password
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
