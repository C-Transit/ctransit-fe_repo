import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaPhone, FaIdCard, FaCar, FaSave, FaTimes } from 'react-icons/fa';
import agentApi from '../../config/agentApi';
import styles from './DriverRegistration.module.css';

export default function DriverRegistration() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    licenseNumber: '',
    vehicleType: '',
    vehiclePlate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Placeholder endpoint - replace when backend is ready
      console.log('Registering driver:', formData);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        licenseNumber: '',
        vehicleType: '',
        vehiclePlate: '',
      });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError('Failed to register driver. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.driverRegistration}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Driver Registration</h1>
        <p className={styles.pageSubtitle}>Register new drivers to the C-Transit platform</p>
      </div>

      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>
                <FaUser className={styles.labelIcon} /> Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter driver's full name"
                value={formData.name}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                <FaEnvelope className={styles.labelIcon} /> Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="driver@email.com"
                value={formData.email}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="phone" className={styles.label}>
                <FaPhone className={styles.labelIcon} /> Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="08012345678"
                value={formData.phone}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="licenseNumber" className={styles.label}>
                <FaIdCard className={styles.labelIcon} /> License Number
              </label>
              <input
                id="licenseNumber"
                name="licenseNumber"
                type="text"
                placeholder="DL-123456789"
                value={formData.licenseNumber}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="vehicleType" className={styles.label}>
                <FaCar className={styles.labelIcon} /> Vehicle Type
              </label>
              <select
                id="vehicleType"
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                className={styles.select}
                required
              >
                <option value="">Select vehicle type</option>
                <option value="sedan">Sedan</option>
                <option value="suv">SUV</option>
                <option value="van">Van</option>
                <option value="bus">Bus</option>
                <option value="truck">Truck</option>
                <option value="motorcycle">Motorcycle</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="vehiclePlate" className={styles.label}>
                <FaCar className={styles.labelIcon} /> Vehicle Plate Number
              </label>
              <input
                id="vehiclePlate"
                name="vehiclePlate"
                type="text"
                placeholder="ABC-123DE"
                value={formData.vehiclePlate}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>
          </div>

          {error && <div className={styles.errorBox}>{error}</div>}
          {success && <div className={styles.successBox}>Driver registered successfully!</div>}

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => {
                setFormData({
                  name: '',
                  email: '',
                  phone: '',
                  licenseNumber: '',
                  vehicleType: '',
                  vehiclePlate: '',
                });
                setError(null);
                setSuccess(false);
              }}
            >
              <FaTimes /> Clear All
            </button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              <FaSave /> {loading ? 'Registering...' : 'Register Driver'}
            </button>
          </div>
        </form>

        <div className={styles.infoBox}>
          <h3>Driver Registration Guide</h3>
          <ul>
            <li>Ensure all fields are filled correctly</li>
            <li>License number should be valid and verifiable</li>
            <li>Vehicle details must match the license</li>
            <li>Driver will receive a confirmation email</li>
          </ul>
          <p className={styles.note}>
            Note: This is a placeholder endpoint. Integration with backend will be added soon.
          </p>
        </div>
      </div>
    </div>
  );
}