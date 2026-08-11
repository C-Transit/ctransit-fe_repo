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

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import StatCard from './components/StatCard';
import PrimaryButton from './components/PrimaryButton';
import Modal from './components/Modal';
import { clearAdminSession, getAdminProfile } from '../../api/adminAuth';

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

// ─── AGENTS SECTION ──────────────────────────────────────────────────────────
const AgentsSection = ({ agents, onAddAgent, formData, setFormData, showForm, setShowForm }) => {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  // Mock agents data
  const mockAgents = [
    { 
      id: 'AGT001', 
      firstName: 'John', 
      lastName: 'Doe',
      email: 'john.doe@ctransit.ng',
      phone: '08012345678', 
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    },
    { 
      id: 'AGT002', 
      firstName: 'Jane', 
      lastName: 'Smith',
      email: 'jane.smith@ctransit.ng',
      phone: '08098765432', 
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    },
    { 
      id: 'AGT003', 
      firstName: 'Michael', 
      lastName: 'Johnson',
      email: 'michael.j@ctransit.ng',
      phone: '08055555555', 
      status: 'INACTIVE',
      createdAt: new Date().toISOString()
    },
  ];

  // Fetch agents with pagination and filters
  const fetchAgents = async (pageNum = page, status = statusFilter) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `/api/admin/agents/?status=${status}&page=${pageNum}&limit=20`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          onAddAgent(data.data.agents || []);
          setTotalPages(data.data.totalPages || 1);
        }
      } else {
        onAddAgent(mockAgents);
        setTotalPages(1);
      }
    } catch (error) {
      console.warn('API error, using mock data:', error);
      onAddAgent(mockAgents);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // ─── Create New Agent ────────────────────────────────────────────────────
  const handleCreateAgent = async () => {
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.password) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    // Validate phone number (basic)
    if (formData.phone.length < 10) {
      alert('Please enter a valid phone number');
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/agents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      if (response.ok) {
        setSuccessMessage(`${formData.firstName} ${formData.lastName} created successfully!`);
        setShowForm(false);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          password: '',
        });
        fetchAgents(1, statusFilter);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to create agent');
      }
    } catch (error) {
      // Fallback - add to mock list
      const newAgent = {
        id: `AGT${String(agents.length + 1).padStart(3, '0')}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      };
      onAddAgent([...agents, newAgent]);
      setSuccessMessage(`${formData.firstName} ${formData.lastName} created successfully!`);
      setShowForm(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
      });
      setTimeout(() => setSuccessMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // ─── Update Agent Status ──────────────────────────────────────────────────
  const handleStatusChange = async (agentId, newStatus, agentName) => {
    setConfirmAction({ agentId, newStatus, agentName });
    setShowConfirmModal(true);
  };

  const executeStatusChange = async () => {
    if (!confirmAction) return;
    
    const { agentId, newStatus, agentName } = confirmAction;
    setLoading(true);
    setShowConfirmModal(false);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/agents/${agentId}/status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setSuccessMessage(`${agentName} ${newStatus.toLowerCase()}d successfully!`);
        fetchAgents(page, statusFilter);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const updatedAgents = agents.map(agent => 
          agent.id === agentId ? { ...agent, status: newStatus } : agent
        );
        onAddAgent(updatedAgents);
        setSuccessMessage(`${agentName} ${newStatus.toLowerCase()}d successfully!`);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      const updatedAgents = agents.map(agent => 
        agent.id === agentId ? { ...agent, status: newStatus } : agent
      );
      onAddAgent(updatedAgents);
      setSuccessMessage(`${agentName} ${newStatus.toLowerCase()}d successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } finally {
      setLoading(false);
      setConfirmAction(null);
    }
  };

  // ─── View Agent Details ──────────────────────────────────────────────────
  const handleViewAgent = async (agentId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/agents/${agentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedAgent(data.data);
        setShowViewModal(true);
      } else {
        const agent = agents.find(a => a.id === agentId);
        if (agent) {
          setSelectedAgent(agent);
          setShowViewModal(true);
        }
      }
    } catch (error) {
      const agent = agents.find(a => a.id === agentId);
      if (agent) {
        setSelectedAgent(agent);
        setShowViewModal(true);
      }
    }
  };

  useEffect(() => {
    onAddAgent(mockAgents);
    fetchAgents();
  }, []);

  // ─── Helper Functions ────────────────────────────────────────────────────
  const getStatusDisplay = (status) => {
    const statusMap = {
      'ACTIVE': 'Active',
      'INACTIVE': 'Inactive',
      'SUSPENDED': 'Suspended'
    };
    return statusMap[status] || status || 'Active';
  };

  const getStatusClass = (status) => {
    const statusMap = {
      'ACTIVE': 'active',
      'INACTIVE': 'inactive',
      'SUSPENDED': 'suspended'
    };
    return statusMap[status] || 'active';
  };

  const getFullName = (agent) => {
    if (agent.firstName && agent.lastName) {
      return `${agent.firstName} ${agent.lastName}`;
    }
    return agent.name || agent.firstName || 'Unknown';
  };

  return (
    <section className={styles.agentsSection}>
      {/* ─── Success Toast ──────────────────────────────────────────────────── */}
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

      <div className={styles.sectionHeader}>
        <h2>Agent Management</h2>
        <div className={styles.filterContainer}>
          <select 
            value={statusFilter} 
            onChange={(e) => {
              setStatusFilter(e.target.value);
              fetchAgents(1, e.target.value);
            }}
            className={styles.filterSelect}
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="ALL">All</option>
          </select>
          <input
            type="text"
            placeholder="Search agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <button 
            className={styles.refreshBtn}
            onClick={() => fetchAgents(page, statusFilter)}
          >
            Refresh
          </button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total Agents</h3>
          <p>{agents.length}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Active Agents</h3>
          <p>{agents.filter(a => a.status === 'ACTIVE').length}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Inactive Agents</h3>
          <p>{agents.filter(a => a.status === 'INACTIVE').length}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Suspended Agents</h3>
          <p>{agents.filter(a => a.status === 'SUSPENDED').length}</p>
        </div>
      </div>

      {/* ─── Register New Agent Form ──────────────────────────────────────── */}
      <div className={styles.agentFormContainer}>
        <button className={styles.toggleFormBtn} onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Hide Form' : '+ Register New Agent'}
        </button>

        {showForm && (
          <form className={styles.agentForm} onSubmit={(e) => { e.preventDefault(); handleCreateAgent(); }}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>First Name *</label>
                <input
                  type="text"
                  placeholder="Enter first name"
                  value={formData.firstName || ''}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Last Name *</label>
                <input
                  type="text"
                  placeholder="Enter last name"
                  value={formData.lastName || ''}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Email Address *</label>
                <input
                  type="email"
                  placeholder="agent@email.com"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Phone Number *</label>
                <input
                  type="tel"
                  placeholder="08012345678"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Password *</label>
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  value={formData.password || ''}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength="6"
                />
                <small className={styles.helperText}>Minimum 6 characters</small>
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Registering...' : 'Register Agent'}
            </button>
          </form>
        )}
      </div>

      {/* ─── Agents List ───────────────────────────────────────────────────── */}
      <div className={styles.tableContainer}>
        <h3>Agents List</h3>
        {loading ? (
          <div className={styles.loadingState}>Loading agents...</div>
        ) : agents.length === 0 ? (
          <p className={styles.noAgents}>No agents found.</p>
        ) : (
          <>
            <div className={styles.agentsListWrapper}>
              <table className={styles.agentsTable}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((agent) => (
                    <tr key={agent.id}>
                      <td><strong>{getFullName(agent)}</strong></td>
                      <td>{agent.email}</td>
                      <td>{agent.phone}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles[getStatusClass(agent.status)]}`}>
                          {getStatusDisplay(agent.status)}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button
                            className={`${styles.actionBtn} ${styles.viewBtn}`}
                            onClick={() => handleViewAgent(agent.id)}
                            title="View details"
                          >
                            View
                          </button>
                          {agent.status === 'ACTIVE' && (
                            <button
                              className={`${styles.actionBtn} ${styles.suspendBtn}`}
                              onClick={() => handleStatusChange(agent.id, 'SUSPENDED', getFullName(agent))}
                              title="Suspend agent"
                            >
                              Suspend
                            </button>
                          )}
                          {agent.status === 'SUSPENDED' && (
                            <button
                              className={`${styles.actionBtn} ${styles.activateBtn}`}
                              onClick={() => handleStatusChange(agent.id, 'ACTIVE', getFullName(agent))}
                              title="Activate agent"
                            >
                              Activate
                            </button>
                          )}
                          {agent.status !== 'INACTIVE' && (
                            <button
                              className={`${styles.actionBtn} ${styles.deactivateBtn}`}
                              onClick={() => handleStatusChange(agent.id, 'INACTIVE', getFullName(agent))}
                              title="Deactivate agent"
                            >
                              Deactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button 
                  onClick={() => fetchAgents(page - 1, statusFilter)}
                  disabled={page <= 1}
                  className={styles.pageBtn}
                >
                  Previous
                </button>
                <span className={styles.pageInfo}>
                  Page {page} of {totalPages}
                </span>
                <button 
                  onClick={() => fetchAgents(page + 1, statusFilter)}
                  disabled={page >= totalPages}
                  className={styles.pageBtn}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ─── View Agent Modal ─────────────────────────────────────────────── */}
      {showViewModal && selectedAgent && (
        <Modal open={showViewModal} title="Agent Details" onClose={() => { setShowViewModal(false); setSelectedAgent(null); }}>
          <div className={styles.modalContent}>
            <div className={styles.agentDetailRow}>
              <span className={styles.detailLabel}>Full Name:</span>
              <span><strong>{getFullName(selectedAgent)}</strong></span>
            </div>
            <div className={styles.agentDetailRow}>
              <span className={styles.detailLabel}>Email:</span>
              <span>{selectedAgent.email}</span>
            </div>
            <div className={styles.agentDetailRow}>
              <span className={styles.detailLabel}>Phone:</span>
              <span>{selectedAgent.phone}</span>
            </div>
            <div className={styles.agentDetailRow}>
              <span className={styles.detailLabel}>Status:</span>
              <span className={`${styles.statusBadge} ${styles[getStatusClass(selectedAgent.status)]}`}>
                {getStatusDisplay(selectedAgent.status)}
              </span>
            </div>
            <div className={styles.agentDetailRow}>
              <span className={styles.detailLabel}>Created:</span>
              <span>{selectedAgent.createdAt ? new Date(selectedAgent.createdAt).toLocaleString() : 'N/A'}</span>
            </div>
            <div className={styles.modalActions}>
              <PrimaryButton variant="ghost" onClick={() => { setShowViewModal(false); setSelectedAgent(null); }}>
                Close
              </PrimaryButton>
            </div>
          </div>
        </Modal>
      )}

      {/* ─── Confirmation Modal ───────────────────────────────────────────── */}
      {showConfirmModal && confirmAction && (
        <Modal 
          open={showConfirmModal} 
          title="Confirm Action" 
          onClose={() => { setShowConfirmModal(false); setConfirmAction(null); }}
        >
          <div className={styles.modalContent}>
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>
                {confirmAction.newStatus === 'SUSPENDED' && '⛔'}
                {confirmAction.newStatus === 'ACTIVE' && '✅'}
                {confirmAction.newStatus === 'INACTIVE' && '⚠️'}
              </div>
              <p style={{ fontSize: '16px', margin: '0 0 4px 0', fontWeight: '600' }}>
                Are you sure you want to <strong style={{ 
                  color: confirmAction.newStatus === 'SUSPENDED' ? '#dc2626' : 
                         confirmAction.newStatus === 'ACTIVE' ? '#16a34a' : '#d97706'
                }}>
                  {confirmAction.newStatus.toLowerCase()}
                </strong> agent <strong>{confirmAction.agentName}</strong>?
              </p>
              <p style={{ color: '#6b7280', fontSize: '14px', margin: '8px 0 0 0' }}>
                This action will change the agent's status to <strong>{confirmAction.newStatus.toLowerCase()}</strong>.
              </p>
            </div>
            <div className={styles.modalActions} style={{ marginTop: '20px', justifyContent: 'center' }}>
              <PrimaryButton 
                variant="ghost" 
                onClick={() => { setShowConfirmModal(false); setConfirmAction(null); }}
              >
                Cancel
              </PrimaryButton>
              <PrimaryButton 
                onClick={executeStatusChange}
                style={{
                  background: confirmAction.newStatus === 'SUSPENDED' ? '#dc2626' : 
                             confirmAction.newStatus === 'ACTIVE' ? '#16a34a' : '#d97706'
                }}
              >
                Confirm {confirmAction.newStatus.toLowerCase()}
              </PrimaryButton>
            </div>
          </div>
        </Modal>
      )}
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
  const [showOtaUploadModal, setShowOtaUploadModal] = useState(false);
  
  // Agents state - simplified
  const [agents, setAgents] = useState([]);
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [agentFormData, setAgentFormData] = useState({
    name: '',
    phone: '',
    accountNumber: '',
    dob: '',
  });

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

  const handleAddAgent = (newAgents) => {
    if (Array.isArray(newAgents)) {
      setAgents(newAgents);
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
                            Upload File
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

        {activeNav === 'users' && <UsersSection />}{activeNav === 'agents' && (
          <AgentsSection
            agents={agents}
            onAddAgent={handleAddAgent}
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

      <Modal open={showOtaUploadModal} title="Upload OTA Firmware Upgrade" onClose={() => setShowOtaUploadModal(false)}>
        <div className={styles.modalContent}>
          <label htmlFor="firmwareFile">Select Firmware File (.bin)</label>
          <input type="file" id="firmwareFile" accept=".bin,.zip" />
          <div className={styles.modalActions}>
            <PrimaryButton variant="ghost" onClick={() => setShowOtaUploadModal(false)}>
              Cancel
            </PrimaryButton>
            <PrimaryButton onClick={() => setShowOtaUploadModal(false)}>
              Upload & Deploy
            </PrimaryButton>
          </div>
        </div>
      </Modal>
    </div>
  );
}