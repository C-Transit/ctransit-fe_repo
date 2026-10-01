import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaUser, FaEnvelope, FaCreditCard, FaCalendar, FaLock, FaLink } from 'react-icons/fa';
import styles from './LinkCard.module.css';

export default function LinkCard() {
  const [searchEmail, setSearchEmail] = useState('');
  const [user, setUser] = useState(null);
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleSearchUser = async () => {
    if (!searchEmail) return;
    setSearching(true);
    setError(null);
    setUser(null);

    try {
      // Placeholder - replace with real endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockUser = {
        id: 'USR-001',
        name: 'John Doe',
        email: searchEmail,
        phone: '08012345678',
        cardLinked: false,
      };
      setUser(mockUser);
      if (mockUser.cardLinked) {
        setError('This user already has a card linked.');
      }
    } catch (err) {
      setError('User not found. Please check the email address.');
    } finally {
      setSearching(false);
    }
  };

  const handleLinkCard = async () => {
    if (!user) return;
    if (!cardData.cardNumber || !cardData.expiryDate || !cardData.cvv) {
      setError('Please fill in all card details.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Placeholder - replace with real endpoint
      console.log('Linking card for user:', user.id, cardData);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess(true);
      setCardData({ cardNumber: '', expiryDate: '', cvv: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError('Failed to link card. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.linkCard}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Link Card</h1>
        <p className={styles.pageSubtitle}>Link a card to a user for seamless payments</p>
      </div>

      <div className={styles.container}>
        <div className={styles.searchSection}>
          <h2 className={styles.sectionTitle}>Find User</h2>
          <div className={styles.searchBox}>
            <div className={styles.searchInput}>
              <FaEnvelope className={styles.searchIcon} />
              <input
                type="email"
                placeholder="Enter user email address"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchUser()}
                className={styles.input}
              />
            </div>
            <button className={styles.searchBtn} onClick={handleSearchUser} disabled={searching}>
              <FaSearch /> {searching ? 'Searching...' : 'Search'}
            </button>
          </div>

          {error && !user && <div className={styles.errorBox}>{error}</div>}

          {user && (
            <motion.div
              className={styles.userCard}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className={styles.userHeader}>
                <div className={styles.userAvatar}>
                  {user.name?.charAt(0) || 'U'}
                </div>
                <div className={styles.userInfo}>
                  <h3>{user.name}</h3>
                  <p>{user.email}</p>
                  <p className={styles.userPhone}>{user.phone}</p>
                </div>
                <div className={styles.cardStatus}>
                  {user.cardLinked ? (
                    <span className={styles.cardLinked}>Card Linked</span>
                  ) : (
                    <span className={styles.cardNotLinked}>No Card</span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {user && !user.cardLinked && (
          <motion.div
            className={styles.cardSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className={styles.sectionTitle}>Card Details</h2>
            <div className={styles.cardForm}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <FaCreditCard className={styles.labelIcon} /> Card Number
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardData.cardNumber}
                  onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value.replace(/\s/g, '') })}
                  maxLength="16"
                  className={styles.input}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <FaCalendar className={styles.labelIcon} /> Expiry Date
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={cardData.expiryDate}
                    onChange={(e) => setCardData({ ...cardData, expiryDate: e.target.value })}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <FaLock className={styles.labelIcon} /> CVV
                  </label>
                  <input
                    type="password"
                    placeholder="***"
                    value={cardData.cvv}
                    onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                    maxLength="4"
                    className={styles.input}
                  />
                </div>
              </div>

              {error && <div className={styles.errorBox}>{error}</div>}
              {success && <div className={styles.successBox}>Card linked successfully!</div>}

              <button className={styles.linkBtn} onClick={handleLinkCard} disabled={loading}>
                <FaLink /> {loading ? 'Linking...' : 'Link Card'}
              </button>
            </div>
          </motion.div>
        )}

        {user && user.cardLinked && (
          <div className={styles.alreadyLinked}>
            <span className={styles.alreadyIcon}>✓</span>
            <div>
              <h3>Card Already Linked</h3>
              <p>This user already has a card linked to their account.</p>
            </div>
          </div>
        )}

        <div className={styles.infoBox}>
          <h3>Card Linking Guide</h3>
          <ul>
            <li>Search for the user using their email address</li>
            <li>Enter the card details accurately</li>
            <li>Card number should be 16 digits</li>
            <li>Expiry date format: MM/YY</li>
            <li>CVV is required for verification</li>
          </ul>
          <p className={styles.note}>
            Note: This is a placeholder endpoint. Integration with backend will be added soon.
          </p>
        </div>
      </div>
    </div>
  );
}