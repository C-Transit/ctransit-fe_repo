import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Legal.page.module.css';


export default function PrivacyPage() {
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
          <h1>Privacy Policy</h1>
          <p className={styles.meta}>Campus Pilot Program · Last Updated: June 2026</p>
        </div>

        <div className={styles.content}>
          <p>C-Transit respects your privacy. This Privacy Policy explains how we collect, use, store, and protect information when you use the C-Transit platform. By registering for or using C-Transit, you agree to the practices described in this policy.</p>

          <h2>1. Information We Collect</h2>
          <p>To provide transportation services, we may collect account information (full name, student identification details, email address, phone number), card information (linked card identifier, account association records), transaction information (wallet deposits, ride payments, account balances, transaction timestamps), and operational information (terminal interaction records, synchronization logs, security and system logs).</p>

          <h2>2. How We Use Information</h2>
          <p>We use collected information to create and manage accounts, link cards to users, process transportation payments, prevent fraud and abuse, improve service reliability, resolve disputes and support requests, and maintain system security. We only use information necessary to operate and improve the platform.</p>

          <h2>3. Information Sharing</h2>
          <p>C-Transit does not sell personal information. Information may only be shared with authorized members of the C-Transit team, when required by participating institutions, when required by law, or to investigate fraud, abuse, or security incidents. We limit information sharing to what is necessary.</p>

          <h2>4. Data Security</h2>
          <p>We take reasonable steps to protect user information through secure authentication systems, access controls, data backups, encrypted communication where technically feasible, and system monitoring and logging. While no system is completely risk-free, we continuously work to improve security.</p>

          <h2>5. Data Retention</h2>
          <p>Information is retained only as long as reasonably necessary for account management, transaction records, security investigations, and operational requirements. Information that is no longer required may be deleted or anonymized.</p>

          <h2>6. User Rights</h2>
          <p>Users may request access to their account information, correction of inaccurate information, and closure of their account where applicable. Certain records may need to be retained for operational or legal reasons.</p>

          <h2>7. Student Privacy</h2>
          <p>C-Transit is designed primarily for university communities. We aim to minimize data collection and only collect information required to provide transportation services.</p>

          <h2>8. Changes to This Policy</h2>
          <p>As C-Transit evolves, this Privacy Policy may be updated. Users will be notified of significant changes through appropriate channels. Continued use of the platform after updates constitutes acceptance of the revised policy.</p>

          <h2>9. Contact Us</h2>
          <p>Questions regarding this Privacy Policy may be directed to C-Transit Support via email or phone listed on the Contact page.</p>
        </div>
      </div>
    </div>
  );
}