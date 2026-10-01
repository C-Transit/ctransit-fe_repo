import { useState, useEffect, useCallback } from 'react';
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
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [registeredDriver, setRegisteredDriver] = useState(null);
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
    const { name, value } = e.target;
    if (name === 'pin') {
      const cleaned = value.replace(/\D/g, '').slice(0, 4);
      setFormData((prev) => ({ ...prev, pin: cleaned }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      setSuccess(true);
      setFormData({
        firstname: '',
        lastname: '',
        phone: '',
        pin: '',
      });
      loadDriversList();
    } catch (err) {
      setError(getDriverRegisterErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.driverRegistration}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Driver Registration</h1>
        <p className={styles.pageSubtitle}>Create a new driver account with 4-digit PIN for campus shuttle operations</p>
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
              <label htmlFor="phone" className={styles.label}>
                <FaPhone className={styles.labelIcon} /> Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
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
            </div>
          </div>

          {error && <div className={styles.errorBox}>{error}</div>}
          {success && (
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
                  phone: '',
                  pin: '',
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
                    Phone: {drv.phone || 'N/A'} {drv.matricNumber ? `• ID: ${drv.matricNumber}` : ''}
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
