import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaChartBar, FaClock, FaCalendarAlt, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import PageTransition from '../components/PageTransition';
import EmptyState from '../components/EmptyState';
import styles from './TransferHistory.module.css';

const historyRows = [
  { id: 1, day: 'Mon', date: '2026-04-29', route: 'Engineering Block', status: 'Success', amount: '₦500' },
  { id: 2, day: 'Tue', date: '2026-04-28', route: 'Library', status: 'Success', amount: '₦500' },
  { id: 3, day: 'Wed', date: '2026-04-27', route: 'Medical Center', status: 'Pending', amount: '₦1000' },
  { id: 4, day: 'Thu', date: '2026-04-26', route: 'Main Gate', status: 'Failed', amount: '₦500' },
  { id: 5, day: 'Fri', date: '2026-04-25', route: 'Hostel Park', status: 'Success', amount: '₦500' },
  { id: 6, day: 'Sat', date: '2026-04-10', route: 'Exam Hall', status: 'Success', amount: '₦500' },
  { id: 7, day: 'Sun', date: '2026-03-21', route: 'Sports Complex', status: 'Success', amount: '₦1000' },
];

export default function TransferHistory() {
  const navigate = useNavigate();
  const [activeRange, setActiveRange] = useState('last5');

  const filteredRows = useMemo(() => {
    if (activeRange === 'last5') return historyRows.slice(0, 5);
    if (activeRange === 'last30') return historyRows.slice(0, 6);
    return historyRows;
  }, [activeRange]);

  return (
    <PageTransition>
      <main className={styles.page}>
        <motion.section className={styles.card} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>
            <FaArrowLeft /> Back to Dashboard
          </button>

          <div className={styles.header}>
            <span className={styles.badge}><FaChartBar /> Transfer Records</span>
            <h1>Transfer History</h1>
            <p>Review your rides by day, date, and payment status. If something looks off, report a dispute from the last column.</p>
          </div>

          {filteredRows.length === 0 ? (
            <EmptyState
              variant="history"
              title="No Transfers Yet"
              description="You don't have any transfers in the selected time period. Start booking trips to see your history."
              action={{
                label: 'Back to Dashboard',
                onClick: () => navigate('/dashboard'),
              }}
            />
          ) : (
            <>
              <div className={styles.summaryGrid}>
                <div className={styles.summaryCard}><FaCheckCircle /> <strong>3</strong><span>Successful</span></div>
                <div className={styles.summaryCard}><FaClock /> <strong>1</strong><span>Pending</span></div>
                <div className={styles.summaryCard}><FaExclamationTriangle /> <strong>1</strong><span>Needs Review</span></div>
              </div>

              <div className={styles.tabs}>
                <button className={activeRange === 'last5' ? styles.active : ''} onClick={() => setActiveRange('last5')}>Last 5 Days</button>
                <button className={activeRange === 'last30' ? styles.active : ''} onClick={() => setActiveRange('last30')}>Last Month</button>
                <button className={activeRange === 'all' ? styles.active : ''} onClick={() => setActiveRange('all')}>All Time</button>
              </div>

              <div className={styles.tableWrap}>
                <table>
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Date</th>
                      <th>Route</th>
                      <th>Status</th>
                      <th>Amount</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row) => (
                      <tr key={row.id}>
                        <td>{row.day}</td>
                        <td>{row.date}</td>
                        <td>{row.route}</td>
                        <td><span className={`${styles.status} ${styles[row.status.toLowerCase()]}`}>{row.status}</span></td>
                        <td>{row.amount}</td>
                        <td><Link to={`/report-dispute?ref=TX-${row.id}${row.date.replaceAll('-', '')}`} className={styles.disputeLink}>Report dispute</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </motion.section>
      </main>
    </PageTransition>
  );
}