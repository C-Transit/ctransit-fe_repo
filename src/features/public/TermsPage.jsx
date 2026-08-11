import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Legal.page.module.css';

export default function TermsPage() {
    const navigate = useNavigate();
    const [progress, setProgress] = useState(0);

useEffect(() => {
  const handleScroll = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
  };
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);

  return (
      <div className={styles.wrapper}>
          <div className={styles.progressBar}>
  <div className={styles.progressFill} style={{ width: `${progress}%` }} />
</div>
      <div className={styles.container}>
        <button onClick={() => navigate(-1)} className={styles.backBtn}>
          ← Back
        </button>

        <div className={styles.header}>
          <h1>Terms of Service</h1>
          <p className={styles.meta}>Campus Pilot Program · Last Updated: June 2026</p>
        </div>

        <div className={styles.content}>
          <p>Welcome to C-Transit. By creating an account, linking a card, funding your wallet, or using any C-Transit service, you agree to these Terms of Service.</p>

          <h2>1. Eligibility</h2>
          <p>The C-Transit pilot is currently intended for registered students, authorized staff members, and approved participants of the pilot program. C-Transit reserves the right to approve, restrict, or remove access to any account participating in the pilot.</p>

          <h2>2. Account Registration</h2>
          <p>To use C-Transit, users must provide accurate registration information, maintain only one personal account unless approved otherwise, and link a valid identification card through an approved C-Transit registration process. Users are responsible for keeping their account information accurate and up to date.</p>

          <h2>3. Student Cards & Account Ownership</h2>
          <p>Cards linked to a C-Transit account remain the responsibility of the account holder. Users must not share their card with another person, attempt to register multiple accounts under false identities, or modify, duplicate, or tamper with any C-Transit card or terminal. Any suspicious activity may result in account restriction or suspension.</p>

          <h2>4. Wallet Funding & Payments</h2>
          <p>Users may add funds to their C-Transit wallet through approved funding channels. Ride fares are deducted from the user's available balance when a ride is successfully validated. All transactions are recorded within the system and may be reviewed for operational, security, or dispute-resolution purposes.</p>

          <h2>5. Offline Transactions</h2>
          <p>C-Transit is designed to operate during temporary internet disruptions. Terminals may temporarily validate rides using synchronized local authorization data. Some transactions may be synchronized after internet connectivity is restored. Wallet balances may not always update instantly during temporary outages. Users acknowledge that temporary synchronization delays may occur.</p>

          <h2>6. Negative Balance Policy</h2>
          <p>In certain situations, a user may be permitted to complete a ride even when their account balance becomes temporarily insufficient. When this occurs, the outstanding amount becomes a negative balance. Future deposits may automatically settle the outstanding amount. Continued negative balances may result in account restrictions. C-Transit reserves the right to recover unpaid balances through approved operational processes.</p>

          <h2>7. User Responsibilities</h2>
          <p>Users agree to use the system honestly, present only their own registered card when boarding, report lost or stolen cards promptly, and follow transportation rules established by participating operators and institutions.</p>

          <h2>8. Prohibited Activities</h2>
          <p>Users must not share accounts or cards, attempt fraud or unauthorized transactions, circumvent system restrictions, interfere with terminal operation, misrepresent their identity, or attempt to gain unauthorized access to platform systems. Violation of these rules may result in suspension or permanent removal from the platform.</p>

          <h2>9. Service Availability</h2>
          <p>C-Transit is provided on a best-effort basis during the pilot phase. While we work to ensure reliable service, temporary interruptions may occur due to network outages, maintenance activities, hardware failures, or operational issues beyond our control.</p>

          <h2>10. Transportation Services</h2>
          <p>C-Transit provides payment and mobility infrastructure. C-Transit does not directly operate transport vehicles. Drivers and transport operators remain responsible for vehicle operation, passenger safety, and compliance with applicable transportation rules.</p>

          <h2>11. Account Suspension & Termination</h2>
          <p>C-Transit may suspend or terminate access where fraud is suspected, terms are violated, outstanding obligations remain unresolved, or participation in the pilot program is discontinued. Where appropriate, users may be notified before restrictions are applied.</p>

          <h2>12. Privacy</h2>
          <p>C-Transit respects user privacy. Information collected through the platform is handled according to the C-Transit Privacy Policy.</p>

          <h2>13. Changes to These Terms</h2>
          <p>As the platform evolves, these Terms may be updated. Continued use of C-Transit after updates means acceptance of the revised Terms.</p>

          <h2>14. Contact Us</h2>
          <p>Questions about these Terms may be directed to C-Transit Support via email or phone listed on the Contact page.</p>
        </div>
      </div>
    </div>
  );
}