import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaExclamationCircle, FaPaperPlane } from 'react-icons/fa';

import styles from './ReportDispute.module.css';
import PageTransition from '../components/PageTransition';

const issueOptions = [
  'Charged but no ride',
  'Wrong amount deducted',
  'Deposit not reflected',
  'Duplicate debit',
  'Card linking issue',
  'Other',
];

export default function ReportDispute() {
  const navigate = useNavigate();
  const [issue, setIssue] = useState(issueOptions[0]);
  const [description, setDescription] = useState('');
  const [otherIssue, setOtherIssue] = useState('');
  const [success, setSuccess] = useState(false);

  const resolvedIssue = useMemo(() => (issue === 'Other' ? otherIssue || 'Other issue' : issue), [issue, otherIssue]);

  const handleSubmit = (event) => {
    event.preventDefault();

    // BACKEND INTEGRATION: POST /api/support/report-dispute
    // Send: { issueType: "issue_category", description: "user_complaint_details" }
    // Response: { success: true, ticketId: "TICKET_12345", message: "Dispute submitted" }
    // TODO: Replace with actual API endpoint when backend is ready
    setSuccess(true);
    sessionStorage.setItem('authSuccessMessage', 'Your report has been submitted. It will be attended to soon.');
    setTimeout(() => navigate('/history'), 2200);
  };

  return (
    <PageTransition>
      <main className={styles.page}>
      <motion.section className={styles.card} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <button className={styles.backBtn} onClick={() => navigate('/history')}>
          <FaArrowLeft /> Back to History
        </button>

        <div className={styles.header}>
          <span className={styles.badge}><FaExclamationCircle /> Support Desk</span>
          <h1>Report a Dispute</h1>
          <p>Choose a common issue, add details, and our team will review it shortly.</p>
        </div>

        {success ? (
          <div className={styles.successBox}>
            <h2>Report submitted successfully</h2>
            <p>Your report will be attended to soon.</p>
            <button className={styles.secondaryBtn} onClick={() => navigate('/history')}>Return to history</button>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.grid}>
              <div>
                <label>Issue Category</label>
                <div className={styles.issueList}>
                  {issueOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`${styles.issueBtn} ${issue === option ? styles.selected : ''}`}
                      onClick={() => setIssue(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {issue === 'Other' && (
              <label>
                Describe the Issue
                <input value={otherIssue} onChange={(event) => setOtherIssue(event.target.value)} placeholder="Tell us what happened" />
              </label>
            )}

            <label>
              Complaint Details
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows="5" placeholder="Explain the situation clearly. Include route, time, and any amount involved." />
            </label>

            <div className={styles.noteBox}>
              <p>Selected issue: <strong>{resolvedIssue}</strong></p>
            </div>
            <button className={styles.submitBtn} type="submit">
              <FaPaperPlane /> Submit Report
            </button>
          </form>
        )}
      </motion.section>
      </main>
    </PageTransition>
  );
}