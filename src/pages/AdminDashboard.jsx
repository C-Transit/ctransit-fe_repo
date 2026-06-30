import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBroadcastTower,
  FaChartLine,
  FaHeadset,
  FaMoneyBillWave,
  FaSignOutAlt,
  FaUserCheck,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Area,
  AreaChart,
  Bar,
  Line,
  LineChart,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';



import Sidebar from '../components/Admin/Sidebar';
import Navbar from '../components/Admin/Navbar';
import StatCard from '../components/Admin/StatCard';
import ActivityTable from '../components/Admin/ActivityTable';
import PrimaryButton from '../components/Admin/PrimaryButton';
import Modal from '../components/Admin/Modal';
import { clearAdminSession, getAdminProfile } from '../config/adminAuth';

import styles from './AdminDashboard.module.css';

const statCards = [
  {
    id: 'revenue',
    title: 'Total Revenue (This Month)',
    value: '₦12,450,000',
    trend: '+14.2% from last month',
    icon: FaMoneyBillWave,
  },
  {
    id: 'activeUsers',
    title: 'Active Users',
    value: '8,942',
    trend: '+380 this week',
    icon: FaUserCheck,
  },
  {
    id: 'activeTerminals',
    title: 'Active Terminals',
    value: '450',
    trend: '+25 this week',
    icon: FaBroadcastTower,
  },
  {
    id: 'paymentSuccess',
    title: 'Payment Success Rate',
    value: '98.4%',
    trend: '+0.6% this week',
    icon: FaChartLine,
  },
];

// Demand data points for the heat-like bar chart.
const demandHeatData = [
  { slot: '08:00', demand: 72 },
  { slot: '09:00', demand: 55 },
  { slot: '10:00', demand: 43 },
  { slot: '11:00', demand: 86 },
  { slot: '12:00', demand: 63 },
  { slot: '13:00', demand: 40 },
  { slot: '14:00', demand: 79 },
  { slot: '15:00', demand: 61 },
  { slot: '16:00', demand: 57 },
  { slot: '17:00', demand: 75 },
  { slot: '18:00', demand: 91 },
  { slot: '19:00', demand: 68 },
];

// Revenue and Commission curve points in Naira for the line chart.
const revenueTrendData = [
  { hour: '08:00', revenue: 280000, commission: 56000 },
  { hour: '09:00', revenue: 310000, commission: 62000 },
  { hour: '10:00', revenue: 295000, commission: 59000 },
  { hour: '11:00', revenue: 360000, commission: 72000 },
  { hour: '12:00', revenue: 335000, commission: 67000 },
  { hour: '13:00', revenue: 390000, commission: 78000 },
  { hour: '14:00', revenue: 420000, commission: 84000 },
  { hour: '15:00', revenue: 402000, commission: 80400 },
];

const recentActivityData = [
  {
    id: 1,
    type: 'Terminal Online',
    description: 'New terminal activated at Main Campus',
    terminal: 'TRM-2026-145',
    time: '2 mins ago',
    icon: '🟢',
  },
  {
    id: 2,
    type: 'Dispute Resolved',
    description: 'Payment dispute case #DIS-5421 resolved',
    user: 'Amina Hassan',
    time: '15 mins ago',
    icon: '✓',
  },
  {
    id: 3,
    type: 'OTA Upgrade',
    description: 'System firmware v2.3.1 ready for deployment',
    version: 'v2.3.1',
    time: '1 hour ago',
    icon: '📦',
  },
];

const nairaFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
});

function getHeatColor(demand, isDarkMode) {
  if (isDarkMode) {
    if (demand >= 85) return '#38bdf8';
    if (demand >= 70) return '#22d3ee';
    if (demand >= 55) return '#60a5fa';
    return '#93c5fd';
  }

  if (demand >= 85) return '#1d4ed8';
  if (demand >= 70) return '#2563eb';
  if (demand >= 55) return '#3b82f6';
  return '#60a5fa';
}

const recentActivityRows = [
  {
    id: 1,
    type: 'Wallet Top-up',
    reference: 'TRX-778102',
    user: 'Ibrahim Musa',
    amount: 6500,
    status: 'Success',
    time: '4 mins ago',
  },
  {
    id: 2,
    type: 'Support Escalation',
    reference: 'SUP-00931',
    user: 'Support Queue',
    amount: 0,
    status: 'Pending',
    time: '12 mins ago',
  },
  {
    id: 3,
    type: 'Settlement Batch',
    reference: 'SET-22014',
    user: 'Finance Engine',
    amount: 320000,
    status: 'Success',
    time: '28 mins ago',
  },
  {
    id: 4,
    type: 'Refund Attempt',
    reference: 'RFD-10082',
    user: 'Amina Bello',
    amount: 1200,
    status: 'Failed',
    time: '37 mins ago',
  },
];

const OverviewSection = () => {
  return (
    <section className={styles.overviewSection}>
      <p>Overview section is displayed in the charts above.</p>
    </section>
  );
};

const UsersSection = () => {
  const userOnboardingData = [
    { month: 'January', users: 50 },
    { month: 'February', users: 100 },
    { month: 'March', users: 150 },
    { month: 'April', users: 200 },
    { month: 'May', users: 250 },
    { month: 'June', users: 300 },
  ];

  return (
    <section className={styles.usersSection}>
      <h2>Users</h2>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total Users / Active Users</h3>
          <p>10,000 / 8,000</p>
        </div>
        <div className={styles.statCard}>
          <h3>Total Terminals Deployed / Active Terminals</h3>
          <p>500 / 450</p>
        </div>
        <div className={styles.statCard}>
          <h3>Total Drivers / Active Drivers</h3>
          <p>1,200 / 1,000</p>
        </div>
      </div>
      <div className={styles.chartContainer}>
        <h3>User Onboarding Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={userOnboardingData}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="users" stroke="#8884d8" fillOpacity={1} fill="url(#colorUsers)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

const AgentsSection = ({ agents, onAddAgent, onAgentAction, formData, setFormData, showForm, setShowForm }) => {
  return (
    <section className={styles.agentsSection}>
      <h2>Agents</h2>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total Agents / Active Agents</h3>
          <p>{agents.length} / {agents.filter(a => a.role === 'Supervisor').length}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Monnify Pool Stats</h3>
          <p>Total Funds: ₦5,000,000</p>
          <p>Total Revenue: ₦1,000,000</p>
        </div>
      </div>

      {/* Register New Agent Form */}
      <div className={styles.agentFormContainer}>
        <button className={styles.toggleFormBtn} onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Hide Form' : '+ Register New Agent'}
        </button>

        {showForm && (
          <form className={styles.agentForm}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Enter agent name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Date of Birth</label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>ID Verification</label>
                <input
                  type="text"
                  placeholder="Enter ID number"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Role</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                  <option>Field Agent</option>
                  <option>Supervisor</option>
                  <option>Manager</option>
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Account Details</label>
                <input
                  type="text"
                  placeholder="Enter account number"
                  value={formData.account}
                  onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Affiliate</label>
                <input
                  type="text"
                  placeholder="Enter affiliate contact"
                  value={formData.affiliate}
                  onChange={(e) => setFormData({ ...formData, affiliate: e.target.value })}
                />
              </div>
            </div>

            <button type="button" className={styles.submitBtn} onClick={onAddAgent}>
              Register Agent
            </button>
          </form>
        )}
      </div>

      {/* Agents List */}
      <div className={styles.tableContainer}>
        <h3>Agents List</h3>
        <div className={styles.agentsListWrapper}>
          {agents.length === 0 ? (
            <p className={styles.noAgents}>No agents registered yet.</p>
          ) : (
            <table className={styles.agentsTable}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>DOB</th>
                  <th>ID</th>
                  <th>Role</th>
                  <th>Account</th>
                  <th>Affiliate</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent, index) => (
                  <tr key={index}>
                    <td>{agent.name}</td>
                    <td>{agent.dob}</td>
                    <td>{agent.id}</td>
                    <td><span className={styles.roleBadge}>{agent.role}</span></td>
                    <td>{agent.account}</td>
                    <td>{agent.affiliate}</td>
                    <td>
                      <div className={styles.actionButtons}>
                        {agent.role !== 'Supervisor' && (
                          <button
                            className={`${styles.actionBtn} ${styles.promoteBtn}`}
                            onClick={() => onAgentAction(agent, 'promote')}
                            title="Promote agent"
                          >
                            ↑ Promote
                          </button>
                        )}
                        <button
                          className={`${styles.actionBtn} ${styles.complaintBtn}`}
                          onClick={() => onAgentAction(agent, 'complaint')}
                          title="File complaint"
                        >
                          ⚠ Complaint
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.removeBtn}`}
                          onClick={() => onAgentAction(agent, 'remove')}
                          title="Remove agent"
                        >
                          ✕ Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
};

const NotificationsSection = () => {
  const notifications = [
    {
      id: 1,
      type: 'Unresolved Disputes',
      severity: 'high',
      count: 12,
      description: 'There are 12 pending disputes awaiting resolution',
      action: 'Review & Resolve',
      icon: '⚠️',
    },
    {
      id: 2,
      type: 'Monnify Issues',
      severity: 'critical',
      count: 5,
      description: 'Payment gateway experiencing intermittent failures',
      action: 'Check Status',
      icon: '🔴',
    },
    {
      id: 3,
      type: 'Damaged Terminals',
      severity: 'medium',
      count: 8,
      description: '8 terminals reported as damaged and need maintenance',
      action: 'Schedule Repair',
      icon: '🛠️',
    },
    {
      id: 4,
      type: 'Non-Active Users',
      severity: 'low',
      count: 245,
      description: '245 users have been inactive for more than 30 days',
      action: 'Send Reminder',
      icon: '👤',
    },
    {
      id: 5,
      type: 'Monnify Deposits',
      severity: 'medium',
      count: 3,
      description: '3 pending deposit verifications from Monnify',
      action: 'Verify Deposits',
      icon: '💳',
    },
    {
      id: 6,
      type: 'Agent Disputes',
      severity: 'high',
      count: 7,
      description: '7 agents have filed complaints requiring review',
      action: 'Investigate',
      icon: '🔍',
    },
    {
      id: 7,
      type: 'Bulk User Disputes',
      severity: 'high',
      count: 18,
      description: 'Bulk dispute filed by 18 users regarding charges',
      action: 'Review Case',
      icon: '📋',
    },
    {
      id: 8,
      type: 'Backend Crash Alert',
      severity: 'critical',
      count: 2,
      description: 'Backend service crashed 2 times in the last 24 hours',
      action: 'View Logs',
      icon: '💥',
    },
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return styles.criticalNotif;
      case 'high':
        return styles.highNotif;
      case 'medium':
        return styles.mediumNotif;
      case 'low':
        return styles.lowNotif;
      default:
        return styles.lowNotif;
    }
  };

  return (
    <section className={styles.notificationsSection}>
      <h2>System Notifications</h2>
      <p className={styles.notifDescription}>Critical alerts and issues requiring immediate attention</p>
      <div className={styles.notificationsGrid}>
        {notifications.map((notification) => (
          <div key={notification.id} className={`${styles.notificationCard} ${getSeverityColor(notification.severity)}`}>
            <div className={styles.notifHeader}>
              <span className={styles.notifIcon}>{notification.icon}</span>
              <div className={styles.notifTitleGroup}>
                <h3>{notification.type}</h3>
                <span className={styles.notifSeverity}>{notification.severity.toUpperCase()}</span>
              </div>
              <span className={styles.notifCount}>{notification.count}</span>
            </div>
            <p className={styles.notifDescription}>{notification.description}</p>
            <button className={styles.notifActionBtn}>{notification.action} →</button>
          </div>
        ))}
      </div>
    </section>
  );
};

const PaymentsSection = () => {
  const [monnifyQuery, setMonnifyQuery] = useState('');

  return (
    <section className={styles.paymentsSection}>
      <h2>Payments & Monnify</h2>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total Funds in Account</h3>
          <p>₦5,000,000</p>
          <small>Monnify Wallet</small>
        </div>
        <div className={styles.statCard}>
          <h3>Account Details</h3>
          <p>Monnify Business</p>
          <small>Account ID: MNF-2026-001</small>
        </div>
      </div>

      {/* Monnify Pool Stats */}
      <div className={styles.monnifyStatsContainer}>
        <h3>Monnify Pool Stats</h3>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3>Total Revenue</h3>
            <p>₦1,000,000</p>
            <small>This Month</small>
          </div>
          <div className={styles.statCard}>
            <h3>Total Transactions</h3>
            <p>1,245</p>
            <small>Successful Transfers</small>
          </div>
          <div className={styles.statCard}>
            <h3>Success Rate</h3>
            <p>98.7%</p>
            <small>Payment Success</small>
          </div>
        </div>
      </div>

      {/* Monnify Query */}
      <div className={styles.queryContainer}>
        <h3>Monnify Query</h3>
        <div className={styles.queryBox}>
          <input
            type="text"
            placeholder="Search transaction ID, account number, or reference..."
            value={monnifyQuery}
            onChange={(e) => setMonnifyQuery(e.target.value)}
            className={styles.queryInput}
          />
          <button className={styles.queryBtn}>Search Transaction</button>
        </div>
        <div className={styles.queryResults}>
          <p className={styles.queryPlaceholder}>Enter a query to view transaction details</p>
        </div>
      </div>
    </section>
  );
};

const SupportSection = () => {
  return (
    <section className={styles.supportSection}>
      <h2>Support</h2>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Reports</h3>
          <p>View and manage system reports.</p>
        </div>
        <div className={styles.statCard}>
          <h3>Role Permissions</h3>
          <p>Manage user roles and permissions.</p>
        </div>
      </div>
    </section>
  );
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const adminProfile = useMemo(() => getAdminProfile(), []);

  const [activeNav, setActiveNav] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('admin_dark_mode') === 'true');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingCards, setLoadingCards] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  
  // Agents state
  const [agents, setAgents] = useState([
    { name: 'John Doe', dob: '1990-01-01', id: 'AGT001', role: 'Supervisor', account: '1234567890', affiliate: 'Company A' },
    { name: 'Jane Smith', dob: '1985-05-15', id: 'AGT002', role: 'Field Agent', account: '0987654321', affiliate: 'Company B' },
    { name: 'Michael Johnson', dob: '1992-03-22', id: 'AGT003', role: 'Supervisor', account: '1122334455', affiliate: 'Company C' },
  ]);
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [agentFormData, setAgentFormData] = useState({
    name: '',
    dob: '',
    id: '',
    role: 'Field Agent',
    account: '',
    affiliate: '',
  });
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(null); // 'promote', 'remove', 'complaint'
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [complaintText, setComplaintText] = useState('');
  const [showOtaUploadModal, setShowOtaUploadModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoadingCards(false), 1100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('admin_dark_mode', darkMode ? 'true' : 'false');
  }, [darkMode]);

  const handleLogout = () => {
    clearAdminSession();
    navigate('/admin/login', { replace: true });
  };

  const handleToggleDarkMode = () => {
    setDarkMode((previousValue) => !previousValue);
  };

  // Agent handlers
  const handleAddAgent = () => {
    if (!agentFormData.name || !agentFormData.dob || !agentFormData.id || !agentFormData.account || !agentFormData.affiliate) {
      alert('Please fill in all fields');
      return;
    }

    const newAgent = {
      ...agentFormData,
      id: `AGT${String(agents.length + 1).padStart(3, '0')}`,
    };

    setAgents([...agents, newAgent]);
    setAgentFormData({
      name: '',
      dob: '',
      id: '',
      role: 'Field Agent',
      account: '',
      affiliate: '',
    });
    setShowAgentForm(false);
    setSuccessMessage('Agent registered successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleAgentAction = (agent, type) => {
    setSelectedAgent(agent);
    setActionType(type);
    setShowActionModal(true);
  };

  const confirmAgentAction = () => {
    if (actionType === 'promote') {
      const updatedAgents = agents.map((agent) =>
        agent.id === selectedAgent.id ? { ...agent, role: 'Supervisor' } : agent
      );
      setAgents(updatedAgents);
      setSuccessMessage(`${selectedAgent.name} promoted to Supervisor!`);
    } else if (actionType === 'remove') {
      setAgents(agents.filter((agent) => agent.id !== selectedAgent.id));
      setSuccessMessage(`${selectedAgent.name} has been removed!`);
    } else if (actionType === 'complaint') {
      setSuccessMessage(`Complaint against ${selectedAgent.name} submitted successfully!`);
      setComplaintText('');
    }

    setShowActionModal(false);
    setSelectedAgent(null);
    setActionType(null);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleOtaFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setSuccessMessage(`OTA upgrade file "${file.name}" uploaded successfully!`);
      setTimeout(() => setShowOtaUploadModal(false), 1500);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const chartColors = darkMode
    ? {
        grid: 'rgba(148, 163, 184, 0.24)',
        tick: '#cbd5e1',
        tooltipBg: '#17213d',
        tooltipBorder: '#334155',
        tooltipText: '#e2e8f0',
        revenueStroke: '#38bdf8',
        revenueFillStart: '#38bdf8',
      }
    : {
        grid: 'rgba(148, 163, 184, 0.25)',
        tick: '#64748b',
        tooltipBg: '#ffffff',
        tooltipBorder: '#dbe7ff',
        tooltipText: '#0f172a',
        revenueStroke: '#2563eb',
        revenueFillStart: '#2563eb',
      };

  return (
    <div className={`${styles.wrapper} ${darkMode ? styles.dark : ''}`.trim()}>
      {successMessage && (
        <motion.div
          className={styles.successToast}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          ✓ {successMessage}
        </motion.div>
      )}
      <Sidebar
        activeNav={activeNav}
        onNavSelect={(id) => {
          setActiveNav(id);
          setMobileSidebarOpen(false);
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className={`${styles.main} ${sidebarCollapsed ? styles.mainExpanded : ''}`.trim()}>
        <Navbar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          darkMode={darkMode}
          onToggleDarkMode={handleToggleDarkMode}
          notificationCount={5}
          adminName={adminProfile?.name || 'Admin'}
          onToggleProfileMenu={() => setShowProfileMenu((prev) => !prev)}
          onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        <AnimatePresence>
          {showProfileMenu && (
            <motion.div
              className={styles.profileMenu}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <p>{adminProfile?.email || 'admin@ctransit.ng'}</p>
              <span>{adminProfile?.role || 'Super Admin'}</span>
              <button onClick={handleLogout}>
                <FaSignOutAlt /> Sign out
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <section className={styles.welcomeSection}>
          <div>
            <h1>Welcome back, {adminProfile?.name || 'Operations Admin'}</h1>
            <p>
              You are viewing the operational command center for C-Transit with live placeholders and
              dashboard-ready widgets.
            </p>
          </div>
          {activeNav === 'overview' && (
            <div className={styles.actionGroup}>
              <PrimaryButton onClick={() => setShowBroadcastModal(true)}>
                <FaBroadcastTower /> Broadcast Notice
              </PrimaryButton>
              <PrimaryButton variant="ghost" onClick={() => setActiveNav('reports')}>
                View Reports
              </PrimaryButton>
            </div>
          )}
        </section>

        {activeNav === 'overview' && (
          <>
            <OverviewSection />

            <section className={styles.cardGrid}>
              {statCards.map((card) => (
                <StatCard key={card.id} {...card} loading={loadingCards} />
              ))}
            </section>

            <section className={styles.chartGrid}>
              <article className={styles.panel}>
                <div className={styles.panelHead}>
                  <h2>Realtime Demand Heat Trend</h2>
                  <span>Last 12 intervals</span>
                </div>

                {/* Recharts BarChart styled to behave like a demand heat panel. */}
                <div className={styles.chartCanvas}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={demandHeatData} barCategoryGap={8}>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                      <XAxis dataKey="slot" tick={{ fill: chartColors.tick, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: chartColors.tick, fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
                      <Tooltip
                        formatter={(value) => [`${value}%`, 'Demand']}
                        contentStyle={{
                          borderRadius: '12px',
                          border: `1px solid ${chartColors.tooltipBorder}`,
                          background: chartColors.tooltipBg,
                          color: chartColors.tooltipText,
                        }}
                        labelStyle={{ color: chartColors.tooltipText }}
                      />
                      <Bar dataKey="demand" radius={[7, 7, 0, 0]}>
                        {demandHeatData.map((entry) => (
                          <Cell key={entry.slot} fill={getHeatColor(entry.demand, darkMode)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </article>

              <article className={styles.panel}>
                <div className={styles.panelHead}>
                  <h2>Revenue / Commission Stats</h2>
                  <span>NGN hourly trend</span>
                </div>

                {/* Recharts LineChart with dual lines for Revenue and Commission */}
                <div className={styles.chartCanvas}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                      <XAxis dataKey="hour" tick={{ fill: chartColors.tick, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis
                        tick={{ fill: chartColors.tick, fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `${Math.round(value / 1000)}k`}
                        width={36}
                      />
                      <Tooltip
                        formatter={(value) => [nairaFormatter.format(value), '']}
                        contentStyle={{
                          borderRadius: '12px',
                          border: `1px solid ${chartColors.tooltipBorder}`,
                          background: chartColors.tooltipBg,
                          color: chartColors.tooltipText,
                        }}
                        labelStyle={{ color: chartColors.tooltipText }}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#2563eb"
                        strokeWidth={2.5}
                        dot={{ fill: '#2563eb', r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Revenue"
                      />
                      <Line
                        type="monotone"
                        dataKey="commission"
                        stroke="#f59e0b"
                        strokeWidth={2.5}
                        dot={{ fill: '#f59e0b', r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Commission"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </article>
            </section>

            <section className={styles.tableSection}>
              <div className={styles.tableHead}>
                <h2>Recent Activity</h2>
                <p>New terminal online, freshly resolved disputes, and OTA system upgrades.</p>
              </div>
              <div className={styles.recentActivityGrid}>
                {recentActivityData.map((activity) => (
                  <div key={activity.id} className={styles.activityCard}>
                    <div className={styles.activityIcon}>{activity.icon}</div>
                    <div className={styles.activityContent}>
                      <h4>{activity.type}</h4>
                      <p>{activity.description}</p>
                      {activity.type === 'Terminal Online' && <small>Terminal ID: {activity.terminal}</small>}
                      {activity.type === 'Dispute Resolved' && <small>User: {activity.user}</small>}
                      {activity.type === 'OTA Upgrade' && (
                        <>
                          <small>Version: {activity.version}</small>
                          <button className={styles.uploadBtn} onClick={() => setShowOtaUploadModal(true)}>
                            📁 Upload File
                          </button>
                        </>
                      )}
                    </div>
                    <span className={styles.activityTime}>{activity.time}</span>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {activeNav === 'users' && <UsersSection />}
        {activeNav === 'agents' && (
          <AgentsSection
            agents={agents}
            onAddAgent={handleAddAgent}
            onAgentAction={handleAgentAction}
            formData={agentFormData}
            setFormData={setAgentFormData}
            showForm={showAgentForm}
            setShowForm={setShowAgentForm}
          />
        )}
        {activeNav === 'notifications' && <NotificationsSection />}
        {activeNav === 'support' && <SupportSection />}
        {activeNav === 'payments' && <PaymentsSection />}
        {activeNav === 'reports' && (
          <section className={styles.reportsSection}>
            <h2>Reports</h2>
            <p>System reports and analytics coming soon.</p>
          </section>
        )}
        {activeNav === 'roles' && (
          <section className={styles.rolesSection}>
            <h2>Roles & Permissions</h2>
            <p>User roles and permissions management coming soon.</p>
          </section>
        )}
      </div>

      <Modal open={showBroadcastModal} title="Broadcast Notification" onClose={() => setShowBroadcastModal(false)}>
        <div className={styles.modalContent}>
          <label htmlFor="broadcastMessage">Message</label>
          <textarea
            id="broadcastMessage"
            rows="4"
            placeholder="Service update: Route A buses delayed by 10 minutes due to campus gate checks."
          />
          <div className={styles.modalActions}>
            <PrimaryButton variant="ghost" onClick={() => setShowBroadcastModal(false)}>
              Cancel
            </PrimaryButton>
            <PrimaryButton>
              Send Broadcast
            </PrimaryButton>
          </div>
          <small>
            Backend integration: connect this modal to POST /api/admin/notifications/broadcast with audience filters.
          </small>
        </div>
      </Modal>

      <Modal open={showActionModal} title={`${actionType === 'promote' ? 'Promote Agent' : actionType === 'remove' ? 'Remove Agent' : 'File Complaint'}`} onClose={() => setShowActionModal(false)}>
        <div className={styles.modalContent}>
          {selectedAgent && (
            <>
              <p><strong>Agent:</strong> {selectedAgent.name}</p>
              <p><strong>ID:</strong> {selectedAgent.id}</p>
              
              {actionType === 'complaint' && (
                <>
                  <label htmlFor="complaintText">Complaint Details</label>
                  <textarea
                    id="complaintText"
                    rows="4"
                    placeholder="Describe the complaint details..."
                    value={complaintText}
                    onChange={(e) => setComplaintText(e.target.value)}
                  />
                </>
              )}

              {actionType === 'remove' && (
                <p className={styles.warningText}>⚠ Are you sure you want to remove this agent?</p>
              )}

              {actionType === 'promote' && (
                <p className={styles.infoText}>✓ This agent will be promoted to Supervisor role.</p>
              )}
            </>
          )}

          <div className={styles.modalActions}>
            <PrimaryButton variant="ghost" onClick={() => setShowActionModal(false)}>
              Cancel
            </PrimaryButton>
            <PrimaryButton onClick={confirmAgentAction}>
              {actionType === 'promote' ? 'Promote' : actionType === 'remove' ? 'Remove' : 'Submit Complaint'}
            </PrimaryButton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
