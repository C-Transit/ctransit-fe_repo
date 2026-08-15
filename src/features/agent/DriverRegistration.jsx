import { useState, useEffect, useCallback } from 'react';
import { FaUser, FaPhone, FaIdCard, FaCar, FaSave, FaTimes, FaList, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { registerDriver, fetchDrivers } from '../../api/agentApi';
import styles from './DriverRegistration.module.css';

export default function DriverRegistration() {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    matricNumber: '',
    phone: '',
    vehicleType: 'bus',
    vehiclePlate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);

  const loadDriversList = useCallback(async () => {
    setLoadingDrivers(true);
    try {
      const data = await fetchDrivers();
      const list = data?.drivers || data?.data || (Array.isArray(data) ? data : []);
      setDrivers(list);
    } catch (err) {
      console.warn('Could not load drivers list:', err);
    } finally {
      setLoadingDrivers(false);
    }
  }, []);

  useEffect(() => {
    loadDriversList();
  }, [loadDriversList]);

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
      await registerDriver({
        firstname: formData.firstname,
        lastname: formData.lastname,
        matricNumber: formData.matricNumber,
        phone: formData.phone,
        vehicleType: formData.vehicleType,
        vehiclePlate: formData.vehiclePlate,
      });

      setSuccess(true);
      setFormData({
        firstname: '',
        lastname: '',
        matricNumber: '',
        phone: '',
        vehicleType: 'bus',
        vehiclePlate: '',
      });
      loadDriversList();
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register driver. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.driverRegistration}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Driver Registration</h1>
        <p className={styles.pageSubtitle}>Register new campus shuttle drivers to the C-Transit transport system</p>
      </div>

      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="firstname" className={styles.label}>
                <FaUser className={styles.labelIcon} /> First Name
              </label>
              <input
                id="firstname"
                name="firstname"
                type="text"
                placeholder="e.g. Michael"
                value={formData.firstname}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="lastname" className={styles.label}>
                <FaUser className={styles.labelIcon} /> Last Name
              </label>
              <input
                id="lastname"
                name="lastname"
                type="text"
                placeholder="e.g. Okafor"
                value={formData.lastname}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="matricNumber" className={styles.label}>
                <FaIdCard className={styles.labelIcon} /> Driver Staff / Matric ID
              </label>
              <input
                id="matricNumber"
                name="matricNumber"
                type="text"
                placeholder="e.g. DRV-2024-001 or Staff ID"
                value={formData.matricNumber}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>

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
                <option value="bus">Campus Bus / Coaster</option>
                <option value="minibus">Mini Bus / Keke</option>
                <option value="van">Shuttle Van</option>
                <option value="sedan">Sedan</option>
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
                placeholder="e.g. ABC-123-NG"
                value={formData.vehiclePlate}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
          </div>

          {error && <div className={styles.errorBox}>{error}</div>}
          {success && (
            <div className={styles.successBox}>
              <FaCheckCircle style={{ marginRight: '8px' }} /> Driver registered successfully!
            </div>
          )}

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => {
                setFormData({
                  firstname: '',
                  lastname: '',
                  matricNumber: '',
                  phone: '',
                  vehicleType: 'bus',
                  vehiclePlate: '',
                });
                setError(null);
                setSuccess(false);
              }}
            >
              <FaTimes /> Clear
            </button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              <FaSave /> {loading ? 'Registering...' : 'Register Driver'}
            </button>
          </div>
        </form>

        <div className={styles.infoBox}>
          <h3><FaList style={{ marginRight: '8px' }} /> Registered Fleet ({drivers.length})</h3>
          {loadingDrivers ? (
            <p style={{ color: '#64748b', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FaSpinner className="animate-spin" /> Loading drivers...
            </p>
          ) : drivers.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '13px' }}>No drivers registered yet.</p>
          ) : (
            <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {drivers.map((drv, idx) => (
                <div key={drv.id || drv._id || idx} style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>
                    {drv.firstname} {drv.lastname}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '12px' }}>
                    ID: {drv.matricNumber || drv.driverUid || 'N/A'} • {drv.vehicleType || 'Bus'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
