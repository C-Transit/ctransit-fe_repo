import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { motion } from 'framer-motion';
import Sidebar from '../components/Admin/Sidebar';
import Navbar from '../components/Admin/Navbar';
import Modal from '../components/Admin/Modal';
import PrimaryButton from '../components/Admin/PrimaryButton';
import styles from './AgentDashboard.module.css';
import { MdDownload, MdEdit, MdDelete, MdSearch } from 'react-icons/md';

const AgentDashboard = () => {
  const [activeNav, setActiveNav] = useState('overview');
  const [isDark, setIsDark] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [showCardLinkingModal, setShowCardLinkingModal] = useState(false);
  const [userSearchEmail, setUserSearchEmail] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');

  // Agent Overview Stats
  const agentStats = [
    {
      title: 'Total Commission',
      value: '₦45,230',
      change: '+12.5%',
      trend: 'up',
    },
    {
      title: 'Transactions Today',
      value: '28',
      change: '+5 from yesterday',
      trend: 'up',
    },
    {
      title: 'Users Onboarded',
      value: '156',
      change: '+8 this week',
      trend: 'up',
    },
    {
      title: 'Success Rate',
      value: '98.2%',
      change: '+0.8% this month',
      trend: 'up',
    },
  ];

  // Commission Trend Data
  const commissionTrendData = [
    { time: '08:00', commission: 2400, transactions: 8 },
    { time: '10:00', commission: 3210, transactions: 12 },
    { time: '12:00', commission: 2290, transactions: 10 },
    { time: '14:00', commission: 2000, transactions: 9 },
    { time: '16:00', commission: 2181, transactions: 14 },
    { time: '18:00', commission: 2500, transactions: 15 },
    { time: '20:00', commission: 2100, transactions: 11 },
  ];

  // Recent Transactions
  const recentTransactions = [
    {
      id: 'TXN-001',
      user: 'John Doe',
      amount: '₦5,000',
      commission: '₦250',
      status: 'Completed',
      date: '2 mins ago',
    },
    {
      id: 'TXN-002',
      user: 'Jane Smith',
      amount: '₦3,500',
      commission: '₦175',
      status: 'Completed',
      date: '15 mins ago',
    },
    {
      id: 'TXN-003',
      user: 'Ahmed Hassan',
      amount: '₦8,000',
      commission: '₦400',
      status: 'Pending',
      date: '45 mins ago',
    },
    {
      id: 'TXN-004',
      user: 'Chioma Obi',
      amount: '₦2,500',
      commission: '₦125',
      status: 'Completed',
      date: '1 hour ago',
    },
  ];

  // Registered Users (by this agent)
  const registeredUsers = [
    {
      id: 'USR-001',
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '08012345678',
      status: 'Active',
      cardLinked: true,
      dateRegistered: '2024-05-01',
    },
    {
      id: 'USR-002',
      name: 'Jane Smith',
      email: 'jane.smith@email.com',
      phone: '08098765432',
      status: 'Active',
      cardLinked: true,
      dateRegistered: '2024-04-28',
    },
    {
      id: 'USR-003',
      name: 'Ahmed Hassan',
      email: 'ahmed.hassan@email.com',
      phone: '08055555555',
      status: 'Pending',
      cardLinked: false,
      dateRegistered: '2024-05-05',
    },
    {
      id: 'USR-004',
      name: 'Chioma Obi',
      email: 'chioma.obi@email.com',
      phone: '08077777777',
      status: 'Active',
      cardLinked: true,
      dateRegistered: '2024-04-15',
    },
  ];

  // Terminal Stats
  const terminalStats = [
    { title: 'Active Terminals', value: '12', color: '#10b981', icon: '🟢' },
    { title: 'Inactive Terminals', value: '3', color: '#ef4444', icon: '🔴' },
    { title: 'Total Registered', value: '15', color: '#3b82f6', icon: '📱' },
    { title: 'Online Now', value: '10', color: '#06b6d4', icon: '🌐' },
  ];

  // Terminal List
  const terminalsList = [
    {
      id: 'TRM-001',
      location: 'Main Campus',
      status: 'Online',
      active: true,
      lastSync: '2 mins ago',
    },
    {
      id: 'TRM-002',
      location: 'City Center',
      status: 'Online',
      active: true,
      lastSync: '5 mins ago',
    },
    {
      id: 'TRM-003',
      location: 'North Gate',
      status: 'Offline',
      active: false,
      lastSync: '2 hours ago',
    },
    {
      id: 'TRM-004',
      location: 'East Wing',
      status: 'Online',
      active: true,
      lastSync: '1 min ago',
    },
    {
      id: 'TRM-005',
      location: 'South Block',
      status: 'Inactive',
      active: false,
      lastSync: '1 day ago',
    },
  ];

  // Mock user search function
  const handleSearchUser = () => {
    if (userSearchEmail) {
      const foundUser = registeredUsers.find(u => u.email.toLowerCase() === userSearchEmail.toLowerCase()) || {
        id: 'NEW-USR',
        name: 'New User',
        email: userSearchEmail,
        phone: '',
        status: 'New',
        cardLinked: false,
      };
      setSelectedUser(foundUser);
      setShowUserDetailsModal(true);
    }
  };

  const handleLinkCard = () => {
    if (selectedUser && cardNumber && cardExpiry && cardCVV) {
      setSuccessMessage(`Card linked successfully for ${selectedUser.name}!`);
      setShowCardLinkingModal(false);
      setShowUserDetailsModal(false);
      setCardNumber('');
      setCardExpiry('');
      setCardCVV('');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  // Overview Section
  const OverviewSection = () => (
    <section className={styles.overviewSection}>
      <div className={styles.welcomeSection}>
        <div>
          <h1>Welcome Back, Adekunle! 👋</h1>
          <p>Here's your performance summary for today. Keep up the great work!</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        {agentStats.map((stat, idx) => (
          <motion.div
            key={idx}
            className={styles.statCard}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <h3>{stat.title}</h3>
            <p>{stat.value}</p>
            <span style={{ color: stat.trend === 'up' ? '#10b981' : '#ef4444' }}>
              {stat.change}
            </span>
          </motion.div>
        ))}
      </div>

      <div className={styles.chartGrid}>
        <article className={styles.panel}>
          <div className={styles.panelHead}>
            <h2>Commission Trend</h2>
            <span>Last 7 days</span>
          </div>
          <div className={styles.chartCanvas}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={commissionTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis dataKey="time" stroke="var(--muted)" />
                <YAxis stroke="var(--muted)" />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-alt)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '0.5rem',
                    color: 'var(--text)',
                  }}
                  formatter={(value) => `₦${value.toLocaleString()}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="commission"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ fill: '#10b981', r: 4 }}
                  name="Commission (₦)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHead}>
            <h2>Transaction Volume</h2>
            <span>Hourly breakdown</span>
          </div>
          <div className={styles.chartCanvas}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={commissionTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis dataKey="time" stroke="var(--muted)" />
                <YAxis stroke="var(--muted)" />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-alt)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '0.5rem',
                    color: 'var(--text)',
                  }}
                />
                <Bar dataKey="transactions" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      <section className={styles.tableSection}>
        <div className={styles.tableHead}>
          <h2>Recent Transactions</h2>
          <p>Your latest processed transactions and commissions earned.</p>
        </div>
        <div className={styles.transactionsList}>
          {recentTransactions.map((txn) => (
            <div key={txn.id} className={styles.transactionCard}>
              <div className={styles.txnInfo}>
                <h4>{txn.user}</h4>
                <p className={styles.txnId}>{txn.id}</p>
              </div>
              <div className={styles.txnDetails}>
                <div>
                  <span className={styles.label}>Amount</span>
                  <p className={styles.amount}>{txn.amount}</p>
                </div>
                <div>
                  <span className={styles.label}>Commission</span>
                  <p className={styles.commission}>{txn.commission}</p>
                </div>
                <div>
                  <span className={styles.label}>Status</span>
                  <p className={`${styles.status} ${styles[txn.status.toLowerCase()]}`}>
                    {txn.status}
                  </p>
                </div>
              </div>
              <span className={styles.txnTime}>{txn.date}</span>
            </div>
          ))}
        </div>
      </section>
    </section>
  );

  // User Registration Section
  const UserRegistrationSection = () => (
    <section className={styles.registrationSection}>
      <div className={styles.searchPanel}>
        <h2>Search User & Link Card</h2>
        <p>Input user email to fetch details and link card for transactions</p>

        <div className={styles.searchBox}>
          <div className={styles.searchInput}>
            <MdSearch className={styles.searchIcon} />
            <input
              type="email"
              placeholder="Enter user email..."
              value={userSearchEmail}
              onChange={(e) => setUserSearchEmail(e.target.value)}
            />
          </div>
          <PrimaryButton onClick={handleSearchUser}>Search</PrimaryButton>
        </div>
      </div>

      <div className={styles.registeredUsersPanel}>
        <h2>Users Registered by You</h2>
        <p>Total: {registeredUsers.length} users | Card Linked: {registeredUsers.filter(u => u.cardLinked).length}</p>

        <div className={styles.usersGrid}>
          {registeredUsers.map((user) => (
            <motion.div
              key={user.id}
              className={styles.userCard}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className={styles.userHeader}>
                <h3>{user.name}</h3>
                <span className={`${styles.statusBadge} ${styles[user.status.toLowerCase()]}`}>
                  {user.status}
                </span>
              </div>

              <div className={styles.userInfo}>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Phone:</strong> {user.phone}
                </p>
                <p>
                  <strong>Registered:</strong> {user.dateRegistered}
                </p>
              </div>

              <div className={styles.cardStatus}>
                {user.cardLinked ? (
                  <span className={styles.cardLinked}>✓ Card Linked</span>
                ) : (
                  <span className={styles.cardNotLinked}>✗ No Card</span>
                )}
              </div>

              <button
                className={styles.linkCardBtn}
                onClick={() => {
                  setSelectedUser(user);
                  setShowCardLinkingModal(true);
                }}
              >
                {user.cardLinked ? 'Update Card' : 'Link Card'}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );

  // Terminal Stats Section
  const TerminalStatsSection = () => (
    <section className={styles.terminalSection}>
      <h2>Terminal Management</h2>
      <p>Monitor and manage all terminals assigned to you</p>

      <div className={styles.terminalStatsGrid}>
        {terminalStats.map((stat, idx) => (
          <motion.div
            key={idx}
            className={styles.terminalStatCard}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className={styles.statIcon}>{stat.icon}</div>
            <div>
              <h3>{stat.title}</h3>
              <p style={{ color: stat.color }}>{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className={styles.terminalsListPanel}>
        <h3>Terminal Details</h3>
        <div className={styles.terminalsTable}>
          <div className={styles.tableHeader}>
            <span>Terminal ID</span>
            <span>Location</span>
            <span>Status</span>
            <span>Last Sync</span>
          </div>
          {terminalsList.map((terminal) => (
            <div key={terminal.id} className={styles.tableRow}>
              <span className={styles.terminalId}>{terminal.id}</span>
              <span>{terminal.location}</span>
              <span>
                <span className={`${styles.statusBadge} ${styles[terminal.status.toLowerCase()]}`}>
                  {terminal.status}
                </span>
              </span>
              <span className={styles.lastSync}>{terminal.lastSync}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  // Account Settings Section
  const AccountSettingsSection = () => (
    <section className={styles.settingsSection}>
      <h2>Account Settings</h2>

      <div className={styles.settingsPanels}>
        <article className={styles.settingsPanel}>
          <h3>📋 Profile Information</h3>
          <div className={styles.settingField}>
            <label>Full Name</label>
            <p>Adekunle Johnson</p>
          </div>
          <div className={styles.settingField}>
            <label>Email</label>
            <p>adekunle.johnson@email.com</p>
          </div>
          <div className={styles.settingField}>
            <label>Phone Number</label>
            <p>08012345678</p>
          </div>
          <button className={styles.editBtn}>
            <MdEdit /> Edit Profile
          </button>
        </article>

        <article className={styles.settingsPanel}>
          <h3>🏦 Bank Details</h3>
          <div className={styles.settingField}>
            <label>Bank Name</label>
            <p>First Bank Nigeria</p>
          </div>
          <div className={styles.settingField}>
            <label>Account Number</label>
            <p>2000000000</p>
          </div>
          <div className={styles.settingField}>
            <label>Account Name</label>
            <p>ADEKUNLE JOHNSON</p>
          </div>
          <button className={styles.editBtn}>
            <MdEdit /> Update Bank Details
          </button>
        </article>

        <article className={styles.settingsPanel}>
          <h3>✅ Verification Documents</h3>
          <div className={styles.docItem}>
            <span>National ID (Verified) ✓</span>
            <button className={styles.downloadBtn}>
              <MdDownload /> Download
            </button>
          </div>
          <div className={styles.docItem}>
            <span>Proof of Address (Verified) ✓</span>
            <button className={styles.downloadBtn}>
              <MdDownload /> Download
            </button>
          </div>
        </article>

        <article className={styles.settingsPanel}>
          <h3>🔔 Notification Preferences</h3>
          <div className={styles.notificationPref}>
            <input type="checkbox" id="emailNotif" defaultChecked />
            <label htmlFor="emailNotif">Email Notifications</label>
          </div>
          <div className={styles.notificationPref}>
            <input type="checkbox" id="smsNotif" defaultChecked />
            <label htmlFor="smsNotif">SMS Notifications</label>
          </div>
          <div className={styles.notificationPref}>
            <input type="checkbox" id="pushNotif" defaultChecked />
            <label htmlFor="pushNotif">Push Notifications</label>
          </div>
          <button className={styles.saveBtn}>Save Preferences</button>
        </article>
      </div>
    </section>
  );

  return (
    <div className={`${styles.wrapper} ${isDark ? styles.dark : ''}`}>
      <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />
      <div className={styles.mainContent}>
        <Navbar isDark={isDark} setIsDark={setIsDark} />

        <main className={styles.contentArea}>
          {activeNav === 'overview' && <OverviewSection />}
          {activeNav === 'transactions' && <div>Transactions Section</div>}
          {activeNav === 'users' && <UserRegistrationSection />}
          {activeNav === 'terminals' && <TerminalStatsSection />}
          {activeNav === 'settings' && <AccountSettingsSection />}
        </main>
      </div>

      {successMessage && (
        <motion.div
          className={styles.successToast}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ✓ {successMessage}
        </motion.div>
      )}

      <Modal open={showUserDetailsModal} title="User Details" onClose={() => setShowUserDetailsModal(false)}>
        <div className={styles.modalContent}>
          {selectedUser && (
            <>
              <p>
                <strong>Name:</strong> {selectedUser.name}
              </p>
              <p>
                <strong>Email:</strong> {selectedUser.email}
              </p>
              <p>
                <strong>Phone:</strong> {selectedUser.phone || 'N/A'}
              </p>
              <p>
                <strong>Status:</strong> {selectedUser.status}
              </p>
              <p>
                <strong>Card Status:</strong> {selectedUser.cardLinked ? '✓ Linked' : '✗ Not Linked'}
              </p>
            </>
          )}

          <div className={styles.modalActions}>
            <PrimaryButton variant="ghost" onClick={() => setShowUserDetailsModal(false)}>
              Close
            </PrimaryButton>
            <PrimaryButton
              onClick={() => {
                setShowUserDetailsModal(false);
                setShowCardLinkingModal(true);
              }}
            >
              Link Card
            </PrimaryButton>
          </div>
        </div>
      </Modal>

      <Modal open={showCardLinkingModal} title="Link Card" onClose={() => setShowCardLinkingModal(false)}>
        <div className={styles.modalContent}>
          {selectedUser && <p className={styles.modalSubtitle}>User: {selectedUser.name}</p>}

          <div className={styles.formGroup}>
            <label>Card Number</label>
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, ''))}
              maxLength="16"
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Expiry Date</label>
              <input
                type="text"
                placeholder="MM/YY"
                value={cardExpiry}
                onChange={(e) => setCardExpiry(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label>CVV</label>
              <input
                type="password"
                placeholder="***"
                value={cardCVV}
                onChange={(e) => setCardCVV(e.target.value)}
                maxLength="4"
              />
            </div>
          </div>

          <div className={styles.modalActions}>
            <PrimaryButton variant="ghost" onClick={() => setShowCardLinkingModal(false)}>
              Cancel
            </PrimaryButton>
            <PrimaryButton onClick={handleLinkCard}>Link Card</PrimaryButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AgentDashboard;
