import { useState, useEffect, useCallback } from 'react';
<<<<<<< HEAD
import { useNavigate } from 'react-router-dom';
import { FaUser, FaPhone, FaLock, FaSave, FaTimes, FaList, FaCheckCircle, FaSpinner, FaArrowRight } from 'react-icons/fa';
import { registerDriver, fetchDrivers, getDriverRegisterErrorMessage } from '../../api/agentApi';
import styles from './DriverRegistration.module.css';

export default function DriverRegistration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    phone: '',
    pin: '',
=======
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
>>>>>>> 72cdc132266f78ca8234e380e965306a1cda93a1
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
<<<<<<< HEAD
  const [registeredDriver, setRegisteredDriver] = useState(null);
=======
>>>>>>> 72cdc132266f78ca8234e380e965306a1cda93a1
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
<<<<<<< HEAD
    const { name, value } = e.target;
    if (name === 'pin') {
      const cleaned = value.replace(/\D/g, '').slice(0, 4);
      setFormData((prev) => ({ ...prev, pin: cleaned }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
=======
    setFormData({ ...formData, [e.target.name]: e.target.value });
>>>>>>> 72cdc132266f78ca8234e380e965306a1cda93a1
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
<<<<<<< HEAD
    setError(null);
    setSuccess(false);
    setRegisteredDriver(null);

    if (!formData.firstname.trim() || !formData.lastname.trim()) {
      setError('First name and last name are required.');
      return;
    }

    const phoneDigits = formData.phone.replace(/[^0-9+]/g, '');
    const digitCount = phoneDigits.replace(/\+/g, '').length;
    if (digitCount < 7 || digitCount > 15) {
      setError('Invalid phone format. Please enter a valid phone number (7–15 digits).');
      return;
    }

    if (formData.pin.length !== 4) {
      setError('PIN must be exactly 4 digits.');
      return;
    }

    setLoading(true);

    try {
      const res = await registerDriver({
        firstname: formData.firstname.trim(),
        lastname: formData.lastname.trim(),
        phone: formData.phone.trim(),
        pin: formData.pin.trim(),
      });

      const driverObj = res?.driver || res?.data?.driver || res?.data || res;
      setRegisteredDriver(driverObj);
=======
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

>>>>>>> 72cdc132266f78ca8234e380e965306a1cda93a1
      setSuccess(true);
      setFormData({
        firstname: '',
        lastname: '',
<<<<<<< HEAD
        phone: '',
        pin: '',
      });
      loadDriversList();
    } catch (err) {
      setError(getDriverRegisterErrorMessage(err));
=======
        matricNumber: '',
        phone: '',
        vehicleType: 'bus',
        vehiclePlate: '',
      });
      loadDriversList();
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register driver. Please try again.');
>>>>>>> 72cdc132266f78ca8234e380e965306a1cda93a1
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.driverRegistration}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Driver Registration</h1>
<<<<<<< HEAD
        <p className={styles.pageSubtitle}>Create a new driver account with 4-digit PIN for campus shuttle operations</p>
=======
        <p className={styles.pageSubtitle}>Register new campus shuttle drivers to the C-Transit transport system</p>
>>>>>>> 72cdc132266f78ca8234e380e965306a1cda93a1
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
<<<<<<< HEAD
=======
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
>>>>>>> 72cdc132266f78ca8234e380e965306a1cda93a1
              <label htmlFor="phone" className={styles.label}>
                <FaPhone className={styles.labelIcon} /> Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
<<<<<<< HEAD
                placeholder="e.g. 08012345678 or +2348012345678"
                value={formData.phone}
                onChange={handleChange}
                className={styles.input}
                required
              />
              <span style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
                7–15 digits, optional leading +
              </span>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="pin" className={styles.label}>
                <FaLock className={styles.labelIcon} /> Driver 4-Digit PIN
              </label>
              <input
                id="pin"
                name="pin"
                type="password"
                maxLength={4}
                inputMode="numeric"
                placeholder="•••• (4 digits)"
                value={formData.pin}
                onChange={handleChange}
                className={styles.input}
                required
              />
              <span style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
                Driver security PIN used for terminal and mobile login
              </span>
=======
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
>>>>>>> 72cdc132266f78ca8234e380e965306a1cda93a1
            </div>
          </div>

          {error && <div className={styles.errorBox}>{error}</div>}
          {success && (
<<<<<<< HEAD
            <div className={styles.successBox} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaCheckCircle /> Driver account created successfully!
              </div>
              {registeredDriver && (
                <div style={{ fontSize: '13px', color: '#166534', background: '#dcfce7', padding: '8px 12px', borderRadius: '6px' }}>
                  <strong>{registeredDriver.firstname} {registeredDriver.lastname}</strong> ({registeredDriver.phone})
                  {registeredDriver.matricNumber ? ` — ID: ${registeredDriver.matricNumber}` : ''}
                </div>
              )}
              <div style={{ marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => navigate('/driver/login')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    background: '#15803d',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  <span>Proceed to Step 2: Driver Login</span>
                  <FaArrowRight size={11} />
                </button>
              </div>
=======
            <div className={styles.successBox}>
              <FaCheckCircle style={{ marginRight: '8px' }} /> Driver registered successfully!
>>>>>>> 72cdc132266f78ca8234e380e965306a1cda93a1
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
<<<<<<< HEAD
                  phone: '',
                  pin: '',
=======
                  matricNumber: '',
                  phone: '',
                  vehicleType: 'bus',
                  vehiclePlate: '',
>>>>>>> 72cdc132266f78ca8234e380e965306a1cda93a1
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
<<<<<<< HEAD
                    Phone: {drv.phone || 'N/A'} {drv.matricNumber ? `• ID: ${drv.matricNumber}` : ''}
=======
                    ID: {drv.matricNumber || drv.driverUid || 'N/A'} • {drv.vehicleType || 'Bus'}
>>>>>>> 72cdc132266f78ca8234e380e965306a1cda93a1
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
