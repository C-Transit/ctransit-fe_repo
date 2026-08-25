import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaChartLine,
  FaHeadset,
  FaMoneyBillWave,
  FaSignOutAlt,
  FaUserCheck,
  FaSyncAlt,
  FaSpinner,
  FaBell,
  FaUserShield,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import {
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
import { getAdminProfile } from '../../api/adminAuth';
import {
  fetchAdminOverview,
  fetchAdminIncome,
  fetchAdminTerminals,
  fetchAdminAgents,
  fetchAdminAgentById,
  createAdminAgent,
  updateAdminAgentStatus,
  fetchAdminDisputes,
  fetchAdminDisputeById,
  updateAdminDisputeStatus,
  sendAdminStudentNotification,
  syncAdminCardWhitelist,
  logoutAdmin,
} from '../../api/adminApi';

import styles from './AdminDashboard.module.css';

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

// ─── 1. OVERVIEW CHARTS & STATS ────────────────────────────────────────────────
function OverviewSection({ onSyncWhitelist, syncingWhitelist }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginBottom: '16px' }}>
        <button
          onClick={onSyncWhitelist}
          disabled={syncingWhitelist}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: syncingWhitelist ? 'not-allowed' : 'pointer',
            opacity: syncingWhitelist ? 0.7 : 1,
          }}
        >
          {syncingWhitelist ? <FaSpinner className="animate-spin" /> : <FaSyncAlt />}
          {syncingWhitelist ? 'Syncing Whitelist...' : 'Sync Card Whitelist (POS)'}
        </button>
      </div>
    </div>
  );
}

// ─── 2. AGENTS MANAGEMENT SECTION ──────────────────────────────────────────────
function AgentsSection() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAgents, setTotalAgents] = useState(0);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusAction, setStatusAction] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [creating, setCreating] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    password: '',
  });

  const loadAgents = useCallback(async (pageNum = 1, status = statusFilter) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminAgents({
        page: pageNum,
        limit: 20,
        status: status === 'ALL' ? undefined : status,
      });

      const list = data?.agents || data?.data?.agents || data?.data || (Array.isArray(data) ? data : []);
      setAgents(list);
      setPage(data?.page || pageNum);
      setTotalPages(data?.totalPages || 1);
      setTotalAgents(data?.total || list.length);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to load agents list.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadAgents(page, statusFilter);
  }, [loadAgents, page, statusFilter]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleCreateAgentSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstname || !formData.lastname || !formData.email || !formData.password) {
      alert('Please fill in all required fields');
      return;
    }

    setCreating(true);
    try {
      await createAdminAgent(formData);
      showToast(`Agent ${formData.firstname} ${formData.lastname} created successfully!`);
      setShowCreateModal(false);
      setFormData({ firstname: '', lastname: '', email: '', phone: '', password: '' });
      loadAgents(1, statusFilter);
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || 'Failed to create agent');
    } finally {
      setCreating(false);
    }
  };

  const handleOpenStatusModal = (agent, newStatus) => {
    setStatusAction({ agent, newStatus });
    setShowStatusModal(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!statusAction) return;
    const { agent, newStatus } = statusAction;
    setUpdatingStatus(true);
    try {
      await updateAdminAgentStatus(agent.id || agent._id, newStatus);
      showToast(`Agent status updated to ${newStatus}`);
      setShowStatusModal(false);
      setStatusAction(null);
      loadAgents(page, statusFilter);
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || 'Failed to update agent status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleViewAgent = async (agentId) => {
    setShowViewModal(true);
    setLoadingDetails(true);
    try {
      const data = await fetchAdminAgentById(agentId);
      setSelectedAgent(data?.agent || data?.data || data);
    } catch (err) {
      const local = agents.find((a) => (a.id || a._id) === agentId);
      setSelectedAgent(local || null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const filteredAgents = agents.filter((a) => {
    const q = searchTerm.toLowerCase().trim();
    const name = `${a.firstname || a.firstName || ''} ${a.lastname || a.lastName || ''}`.toLowerCase();
    const email = (a.email || '').toLowerCase();
    const phone = (a.phone || '').toLowerCase();
    return name.includes(q) || email.includes(q) || phone.includes(q);
  });

  return (
    <section className={styles.agentsSection}>
      {toastMessage && (
        <motion.div
          className={styles.successToast}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          ✓ {toastMessage}
        </motion.div>
      )}

      <div className={styles.sectionHeader}>
        <div>
          <h2>Authorized Field Agents</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>
            Manage campus registration agents, POS station operators, and access credentials
          </p>
        </div>

        <div className={styles.filterContainer}>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className={styles.filterSelect}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="DEACTIVATED">Deactivated</option>
          </select>

          <input
            type="text"
            placeholder="Search agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />

          <button className={styles.refreshBtn} onClick={() => loadAgents(page, statusFilter)}>
            <FaSyncAlt /> Refresh
          </button>

          <button
            className={styles.submitBtn}
            style={{ width: 'auto', padding: '0 16px', height: '40px', fontSize: '13px' }}
            onClick={() => setShowCreateModal(true)}
          >
            + Register New Agent
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loadingState}>
            <FaSpinner className="animate-spin" style={{ marginRight: '8px' }} /> Loading agents from server...
          </div>
        ) : filteredAgents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            <FaUserShield style={{ fontSize: '36px', color: '#cbd5e1', marginBottom: '12px' }} />
            <p>No agents found matching your query or filter.</p>
          </div>
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
                    <th>Registered</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAgents.map((agent) => {
                    const agentId = agent.id || agent._id;
                    const fullName = `${agent.firstname || agent.firstName || ''} ${agent.lastname || agent.lastName || ''}`.trim() || 'Agent';
                    const status = (agent.status || 'ACTIVE').toUpperCase();

                    return (
                      <tr key={agentId}>
                        <td><strong>{fullName}</strong></td>
                        <td>{agent.email}</td>
                        <td>{agent.phone || 'N/A'}</td>
                        <td>
                          <span
                            className={`${styles.statusBadge}`}
                            style={{
                              background: status === 'ACTIVE' ? '#dcfce7' : status === 'SUSPENDED' ? '#fef3c7' : '#fee2e2',
                              color: status === 'ACTIVE' ? '#166534' : status === 'SUSPENDED' ? '#92400e' : '#991b1b',
                            }}
                          >
                            {status}
                          </span>
                        </td>
                        <td>{agent.createdAt ? new Date(agent.createdAt).toLocaleDateString() : 'N/A'}</td>
                        <td>
                          <div className={styles.actionButtons}>
                            <button
                              className={`${styles.actionBtn} ${styles.viewBtn}`}
                              onClick={() => handleViewAgent(agentId)}
                              title="View details"
                            >
                              View
                            </button>
                            {status !== 'ACTIVE' && (
                              <button
                                className={`${styles.actionBtn} ${styles.activateBtn}`}
                                onClick={() => handleOpenStatusModal(agent, 'ACTIVE')}
                                title="Activate agent"
                              >
                                Activate
                              </button>
                            )}
                            {status === 'ACTIVE' && (
                              <button
                                className={`${styles.actionBtn} ${styles.suspendBtn}`}
                                onClick={() => handleOpenStatusModal(agent, 'SUSPENDED')}
                                title="Suspend agent"
                              >
                                Suspend
                              </button>
                            )}
                            {status !== 'DEACTIVATED' && (
                              <button
                                className={`${styles.actionBtn} ${styles.deactivateBtn}`}
                                onClick={() => handleOpenStatusModal(agent, 'DEACTIVATED')}
                                title="Deactivate agent"
                              >
                                Deactivate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className={styles.pageBtn}
                >
                  Previous
                </button>
                <span className={styles.pageInfo}>
                  Page {page} of {totalPages} ({totalAgents} agents)
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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

      {/* ─── Create Agent Modal ───────────────────────────────────────────── */}
      {showCreateModal && (
        <Modal open={showCreateModal} title="Register New Field Agent" onClose={() => setShowCreateModal(false)}>
          <form onSubmit={handleCreateAgentSubmit} className={styles.modalContent}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>First Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Ibrahim"
                  value={formData.firstname}
                  onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Last Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Bello"
                  value={formData.lastname}
                  onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Agent Email *</label>
                <input
                  type="email"
                  placeholder="agent@ctransit.ng"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Phone Number *</label>
                <input
                  type="tel"
                  placeholder="08012345678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Initial Login Password *</label>
              <input
                type="password"
                placeholder="Min 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength="6"
              />
            </div>

            <div className={styles.modalActions}>
              <PrimaryButton variant="ghost" type="button" onClick={() => setShowCreateModal(false)}>
                Cancel
              </PrimaryButton>
              <PrimaryButton type="submit" disabled={creating}>
                {creating ? 'Registering Agent...' : 'Create Agent Account'}
              </PrimaryButton>
            </div>
          </form>
        </Modal>
      )}

      {/* ─── View Agent Details Modal ─────────────────────────────────────── */}
      {showViewModal && (
        <Modal open={showViewModal} title="Agent Profile & Details" onClose={() => setShowViewModal(false)}>
          <div className={styles.modalContent}>
            {loadingDetails ? (
              <div style={{ textAlign: 'center', padding: '24px' }}>
                <FaSpinner className="animate-spin" /> Loading agent details...
              </div>
            ) : selectedAgent ? (
              <div>
                <div className={styles.agentDetailRow}>
                  <span className={styles.detailLabel}>Agent ID:</span>
                  <span><strong>{selectedAgent.id || selectedAgent._id}</strong></span>
                </div>
                <div className={styles.agentDetailRow}>
                  <span className={styles.detailLabel}>Full Name:</span>
                  <span>{selectedAgent.firstname || selectedAgent.firstName} {selectedAgent.lastname || selectedAgent.lastName}</span>
                </div>
                <div className={styles.agentDetailRow}>
                  <span className={styles.detailLabel}>Email:</span>
                  <span>{selectedAgent.email}</span>
                </div>
                <div className={styles.agentDetailRow}>
                  <span className={styles.detailLabel}>Phone:</span>
                  <span>{selectedAgent.phone || 'N/A'}</span>
                </div>
                <div className={styles.agentDetailRow}>
                  <span className={styles.detailLabel}>Status:</span>
                  <span style={{ fontWeight: 700, color: selectedAgent.status === 'ACTIVE' ? '#16a34a' : '#dc2626' }}>
                    {selectedAgent.status || 'ACTIVE'}
                  </span>
                </div>
                {selectedAgent.resolvedDisputeCount !== undefined && (
                  <div className={styles.agentDetailRow}>
                    <span className={styles.detailLabel}>Resolved Disputes:</span>
                    <span>{selectedAgent.resolvedDisputeCount}</span>
                  </div>
                )}
                <div className={styles.agentDetailRow}>
                  <span className={styles.detailLabel}>Created At:</span>
                  <span>{selectedAgent.createdAt ? new Date(selectedAgent.createdAt).toLocaleString() : 'N/A'}</span>
                </div>
              </div>
            ) : (
              <p>No agent information available.</p>
            )}
            <div className={styles.modalActions}>
              <PrimaryButton variant="ghost" onClick={() => setShowViewModal(false)}>
                Close
              </PrimaryButton>
            </div>
          </div>
        </Modal>
      )}

      {/* ─── Status Confirmation Modal ────────────────────────────────────── */}
      {showStatusModal && statusAction && (
        <Modal open={showStatusModal} title="Confirm Status Change" onClose={() => setShowStatusModal(false)}>
          <div className={styles.modalContent}>
            <p style={{ fontSize: '15px' }}>
              Are you sure you want to change status of agent{' '}
              <strong>{statusAction.agent.firstname} {statusAction.agent.lastname}</strong> to{' '}
              <strong>{statusAction.newStatus}</strong>?
            </p>
            <div className={styles.modalActions}>
              <PrimaryButton variant="ghost" onClick={() => setShowStatusModal(false)}>
                Cancel
              </PrimaryButton>
              <PrimaryButton onClick={handleConfirmStatusChange} disabled={updatingStatus}>
                {updatingStatus ? 'Updating...' : `Confirm ${statusAction.newStatus}`}
              </PrimaryButton>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}

// ─── 3. DISPUTES & SUPPORT MANAGEMENT SECTION ──────────────────────────────────
function DisputesSection() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [showInspectModal, setShowInspectModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [resolutionText, setResolutionText] = useState('');
  const [newStatus, setNewStatus] = useState('RESOLVED');
  const [updating, setUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const loadDisputes = useCallback(async (pageNum = 1, status = statusFilter) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminDisputes({
        page: pageNum,
        limit: 20,
        status: status === 'ALL' ? undefined : status,
      });

      const list = data?.disputes || data?.data?.disputes || data?.data || (Array.isArray(data) ? data : []);
      setDisputes(list);
      setPage(data?.page || pageNum);
      setTotalPages(data?.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to load disputes list.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadDisputes(page, statusFilter);
  }, [loadDisputes, page, statusFilter]);

  const handleInspect = async (disputeId) => {
    setShowInspectModal(true);
    try {
      const data = await fetchAdminDisputeById(disputeId);
      setSelectedDispute(data?.dispute || data?.data || data);
    } catch {
      const local = disputes.find((d) => (d.id || d._id) === disputeId);
      setSelectedDispute(local || null);
    }
  };

  const handleOpenStatusModal = (dispute) => {
    setSelectedDispute(dispute);
    setNewStatus(dispute.status === 'OPEN' ? 'UNDER_REVIEW' : 'RESOLVED');
    setResolutionText(dispute.resolution || '');
    setShowStatusModal(true);
  };

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDispute) return;

    setUpdating(true);
    try {
      await updateAdminDisputeStatus(selectedDispute.id || selectedDispute._id, {
        status: newStatus,
        resolution: resolutionText,
      });

      setToastMessage(`Dispute status updated to ${newStatus}`);
      setShowStatusModal(false);
      loadDisputes(page, statusFilter);
      setTimeout(() => setToastMessage(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || 'Failed to update dispute status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <section className={styles.supportSection}>
      {toastMessage && (
        <div style={{ padding: '12px', background: '#dcfce7', color: '#166534', borderRadius: '8px', marginBottom: '16px' }}>
          ✓ {toastMessage}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px' }}>Dispute Resolution Desk</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Review, investigate, and resolve transit fare complaints</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className={styles.filterSelect}
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open Disputes</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <button className={styles.refreshBtn} onClick={() => loadDisputes(page, statusFilter)}>
            <FaSyncAlt /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loadingState}>
            <FaSpinner className="animate-spin" style={{ marginRight: '8px' }} /> Loading disputes...
          </div>
        ) : disputes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            <FaHeadset style={{ fontSize: '36px', color: '#cbd5e1', marginBottom: '12px' }} />
            <p>No disputes found in this category.</p>
          </div>
        ) : (
          <div className={styles.agentsListWrapper}>
            <table className={styles.agentsTable}>
              <thead>
                <tr>
                  <th>Case ID</th>
                  <th>Student / Matric</th>
                  <th>Description</th>
                  <th>Transaction ID</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {disputes.map((disp) => {
                  const id = disp.id || disp._id;
                  const status = (disp.status || 'OPEN').toUpperCase();
                  const student = disp.user?.matricNumber || disp.student_uid || disp.studentMatric || disp.user_email || 'Student';

                  return (
                    <tr key={id}>
                      <td><strong>#{id.substring ? id.substring(0, 8) : id}</strong></td>
                      <td>{student}</td>
                      <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {disp.description || disp.reason || 'Transit fare discrepancy'}
                      </td>
                      <td>{disp.transaction_id || disp.transactionId || 'N/A'}</td>
                      <td>
                        <span
                          className={styles.statusBadge}
                          style={{
                            background:
                              status === 'RESOLVED' ? '#dcfce7' : status === 'OPEN' ? '#fee2e2' : status === 'UNDER_REVIEW' ? '#fef3c7' : '#f1f5f9',
                            color:
                              status === 'RESOLVED' ? '#166534' : status === 'OPEN' ? '#991b1b' : status === 'UNDER_REVIEW' ? '#92400e' : '#475569',
                          }}
                        >
                          {status}
                        </span>
                      </td>
                      <td>{disp.createdAt ? new Date(disp.createdAt).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button
                            className={`${styles.actionBtn} ${styles.viewBtn}`}
                            onClick={() => handleInspect(id)}
                          >
                            Inspect
                          </button>
                          <button
                            className={`${styles.actionBtn} ${styles.activateBtn}`}
                            onClick={() => handleOpenStatusModal(disp)}
                          >
                            Update
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Inspect Dispute Modal ────────────────────────────────────────── */}
      {showInspectModal && selectedDispute && (
        <Modal open={showInspectModal} title="Dispute Case Investigation" onClose={() => setShowInspectModal(false)}>
          <div className={styles.modalContent}>
            <div className={styles.agentDetailRow}>
              <span className={styles.detailLabel}>Dispute ID:</span>
              <span><strong>{selectedDispute.id || selectedDispute._id}</strong></span>
            </div>
            <div className={styles.agentDetailRow}>
              <span className={styles.detailLabel}>Student:</span>
              <span>{selectedDispute.user?.name || selectedDispute.student_uid || selectedDispute.studentMatric || 'Campus Student'}</span>
            </div>
            <div className={styles.agentDetailRow}>
              <span className={styles.detailLabel}>Status:</span>
              <span style={{ fontWeight: 700 }}>{selectedDispute.status || 'OPEN'}</span>
            </div>
            <div className={styles.agentDetailRow}>
              <span className={styles.detailLabel}>Transaction ID:</span>
              <span>{selectedDispute.transaction_id || selectedDispute.transactionId || 'None referenced'}</span>
            </div>
            <div style={{ marginTop: '12px' }}>
              <strong style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#475569' }}>Dispute Details:</strong>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }}>
                {selectedDispute.description || selectedDispute.reason || 'No description provided.'}
              </div>
            </div>
            {selectedDispute.resolution && (
              <div style={{ marginTop: '12px' }}>
                <strong style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#166534' }}>Official Resolution Note:</strong>
                <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '8px', border: '1px solid #bbf7d0', fontSize: '14px', color: '#166534' }}>
                  {selectedDispute.resolution}
                </div>
              </div>
            )}
            <div className={styles.modalActions}>
              <PrimaryButton variant="ghost" onClick={() => setShowInspectModal(false)}>
                Close
              </PrimaryButton>
              <PrimaryButton onClick={() => { setShowInspectModal(false); handleOpenStatusModal(selectedDispute); }}>
                Update Status
              </PrimaryButton>
            </div>
          </div>
        </Modal>
      )}

      {/* ─── Update Dispute Status Modal ──────────────────────────────────── */}
      {showStatusModal && selectedDispute && (
        <Modal open={showStatusModal} title="Update Dispute Status & Resolution" onClose={() => setShowStatusModal(false)}>
          <form onSubmit={handleUpdateStatusSubmit} className={styles.modalContent}>
            <div className={styles.formGroup}>
              <label>Set Dispute Status *</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className={styles.filterSelect}
                style={{ width: '100%' }}
                required
              >
                <option value="OPEN">OPEN</option>
                <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Resolution / Investigation Notes</label>
              <textarea
                rows="4"
                placeholder="e.g. Card charge reversed to student wallet following POS log audit."
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div className={styles.modalActions}>
              <PrimaryButton variant="ghost" type="button" onClick={() => setShowStatusModal(false)}>
                Cancel
              </PrimaryButton>
              <PrimaryButton type="submit" disabled={updating}>
                {updating ? 'Saving Status...' : 'Apply Status Update'}
              </PrimaryButton>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}

// ─── 4. PAYMENTS, INCOME & TERMINALS SECTION ──────────────────────────────────
function PaymentsAndIncomeSection() {
  const [incomeData, setIncomeData] = useState(null);
  const [terminals, setTerminals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    terminalId: '',
    driverUid: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [incRes, termRes] = await Promise.allSettled([
        fetchAdminIncome(filters),
        fetchAdminTerminals(),
      ]);

      if (incRes.status === 'fulfilled') {
        setIncomeData(incRes.value?.stats || incRes.value?.data || incRes.value);
      }
      if (termRes.status === 'fulfilled') {
        const list = termRes.value?.terminals || termRes.value?.data || (Array.isArray(termRes.value) ? termRes.value : []);
        setTerminals(list);
      }
    } catch (err) {
      console.warn('Income report error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalRevenue = incomeData?.total?.revenue || incomeData?.total || 0;
  const totalTx = incomeData?.total?.count || 0;

  return (
    <section className={styles.paymentsSection}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2>Campus Revenue & Terminal Income</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Realtime revenue auditing by date, terminal ID, and driver UID</p>
        </div>

        <button className={styles.refreshBtn} onClick={loadData}>
          <FaSyncAlt /> Refresh Report
        </button>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>From Date</label>
          <input
            type="date"
            value={filters.from}
            onChange={(e) => setFilters({ ...filters, from: e.target.value })}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>To Date</label>
          <input
            type="date"
            value={filters.to}
            onChange={(e) => setFilters({ ...filters, to: e.target.value })}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Filter Terminal ID</label>
          <input
            type="text"
            placeholder="e.g. TRM-001"
            value={filters.terminalId}
            onChange={(e) => setFilters({ ...filters, terminalId: e.target.value })}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Filter Driver UID</label>
          <input
            type="text"
            placeholder="e.g. DRV-102"
            value={filters.driverUid}
            onChange={(e) => setFilters({ ...filters, driverUid: e.target.value })}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          <FaSpinner className="animate-spin" style={{ fontSize: '24px', marginBottom: '8px', color: '#3b82f6' }} />
          <p>Auditing revenue figures...</p>
        </div>
      ) : (
        <>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <h3>Filtered Period Revenue</h3>
              <p>{nairaFormatter.format(Number(totalRevenue) || 0)}</p>
              <small>{totalTx} successful fare taps</small>
            </div>
            <div className={styles.statCard}>
              <h3>Active POS Terminals</h3>
              <p>{terminals.length}</p>
              <small>Synced across campus</small>
            </div>
          </div>

          <div style={{ marginTop: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Registered POS Terminals</h3>
            <div className={styles.agentsListWrapper}>
              <table className={styles.agentsTable}>
                <thead>
                  <tr>
                    <th>Terminal ID</th>
                    <th>Status</th>
                    <th>Active Driver UID</th>
                  </tr>
                </thead>
                <tbody>
                  {terminals.map((term, idx) => (
                    <tr key={term.terminal_id || term.id || idx}>
                      <td><strong>{term.terminal_id || term.id || `POS-${idx + 1}`}</strong></td>
                      <td>
                        <span
                          className={styles.statusBadge}
                          style={{
                            background: term.status === 'INACTIVE' ? '#fee2e2' : '#dcfce7',
                            color: term.status === 'INACTIVE' ? '#991b1b' : '#166534',
                          }}
                        >
                          {term.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td>{term.active_driver_uid || 'None (Stationary / Idle)'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

// ─── 5. NOTIFICATIONS & TARGETED STUDENT BROADCAST SECTION ─────────────────────
function NotificationsSection({ onSyncWhitelist, syncingWhitelist }) {
  const [studentMatric, setStudentMatric] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!studentMatric.trim() || !title.trim() || !body.trim()) {
      alert('Please fill out all fields');
      return;
    }

    setSending(true);
    setError(null);
    setSuccess(false);

    try {
      await sendAdminStudentNotification({
        studentMatric: studentMatric.trim(),
        title: title.trim(),
        body: body.trim(),
      });
      setSuccess(true);
      setStudentMatric('');
      setTitle('');
      setBody('');
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to dispatch notification to student.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section className={styles.notificationsSection}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2>Student Push Notifications & Broadcasts</h2>
          <p className={styles.notifDescription}>Dispatch urgent transit announcements and card status updates</p>
        </div>

        <button
          onClick={onSyncWhitelist}
          disabled={syncingWhitelist}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: syncingWhitelist ? 'not-allowed' : 'pointer',
          }}
        >
          {syncingWhitelist ? <FaSpinner className="animate-spin" /> : <FaSyncAlt />}
          {syncingWhitelist ? 'Syncing...' : 'Sync Card Whitelist'}
        </button>
      </div>

      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', maxWidth: '700px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: '#1e293b' }}>
          Send Notification to Student
        </h3>

        {success && (
          <div style={{ padding: '12px', background: '#dcfce7', color: '#166534', borderRadius: '8px', marginBottom: '16px' }}>
            ✓ Notification dispatched successfully to student device!
          </div>
        )}

        {error && (
          <div style={{ padding: '12px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSendNotification} style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
              Student Matriculation Number *
            </label>
            <input
              type="text"
              placeholder="e.g. 2021/1/12345CT"
              value={studentMatric}
              onChange={(e) => setStudentMatric(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
              Notification Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Transit Card Bound & Active"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
              Message Body *
            </label>
            <textarea
              rows="4"
              placeholder="e.g. Your physical RFID Transit Card has been linked and validated for campus shuttles."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            style={{
              padding: '12px 24px',
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: sending ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {sending && <FaSpinner className="animate-spin" />}
            {sending ? 'Sending...' : 'Send Push Notification'}
          </button>
        </form>
      </div>
    </section>
  );
}

// ─── MAIN ADMIN DASHBOARD COMPONENT ──────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const adminProfile = useMemo(() => getAdminProfile(), []);

  const [activeNav, setActiveNav] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('admin_dark_mode') === 'true');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [overviewError, setOverviewError] = useState(null);
  const [overview, setOverview] = useState(null);
  const [incomeOverview, setIncomeOverview] = useState(null);
  const [disputesList, setDisputesList] = useState([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [syncingWhitelist, setSyncingWhitelist] = useState(false);
  const [syncToast, setSyncToast] = useState('');

  const fetchDashboardMetrics = async () => {
    setLoadingOverview(true);
    setOverviewError(null);
    try {
      const [overviewRes, incomeRes, disputesRes] = await Promise.allSettled([
        fetchAdminOverview(),
        fetchAdminIncome(),
        fetchAdminDisputes({ page: 1, limit: 10, status: 'OPEN' }),
      ]);

      if (overviewRes.status === 'fulfilled') {
        const data = overviewRes.value;
        setOverview(data?.overview || data?.data || data);
      }

      if (incomeRes.status === 'fulfilled') {
        const data = incomeRes.value;
        setIncomeOverview(data?.stats || data?.data || data);
      }

      if (disputesRes.status === 'fulfilled') {
        const data = disputesRes.value;
        setDisputesList(data?.disputes || data?.data || []);
      }
    } catch (err) {
      console.error('Failed to load admin metrics:', err);
      setOverviewError('Failed to load live metrics. Please verify backend connection.');
    } finally {
      setLoadingOverview(false);
    }
  };

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const handleSyncWhitelist = async () => {
    setSyncingWhitelist(true);
    try {
      const res = await syncAdminCardWhitelist();
      setSyncToast(res?.message || 'Card whitelist synced across all campus POS terminals successfully!');
      setTimeout(() => setSyncToast(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || 'Failed to sync whitelist');
    } finally {
      setSyncingWhitelist(false);
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    navigate('/admin/login', { replace: true });
  };

  const dynamicStatCards = useMemo(() => {
    const monthlyIncome = overview?.income?.thisMonth ?? incomeOverview?.thisMonth ?? incomeOverview?.total?.revenue ?? 0;
    const todayIncome = overview?.income?.today ?? incomeOverview?.today ?? 0;
    const studentsCount = overview?.counts?.students ?? 0;
    const activeAgentsCount = overview?.counts?.activeAgents ?? 0;
    const driversCount = overview?.counts?.drivers ?? 0;
    const openDisputesCount = overview?.counts?.openDisputes ?? disputesList.length ?? 0;

    return [
      {
        id: 'revenue',
        title: 'Total Revenue (This Month)',
        value: nairaFormatter.format(monthlyIncome),
        trend: `Today: ${nairaFormatter.format(todayIncome)}`,
        icon: FaMoneyBillWave,
      },
      {
        id: 'activeUsers',
        title: 'Enrolled Students',
        value: studentsCount.toLocaleString('en-NG'),
        trend: 'Active transit accounts',
        icon: FaUserCheck,
      },
      {
        id: 'activeAgents',
        title: 'Active Agents',
        value: activeAgentsCount.toLocaleString('en-NG'),
        trend: 'Operational field agents',
        icon: FaUserShield,
      },
      {
        id: 'disputes',
        title: 'Drivers & Open Disputes',
        value: `${driversCount} Drivers / ${openDisputesCount} Disputes`,
        trend: `${openDisputesCount} disputes open`,
        icon: FaChartLine,
      },
    ];
  }, [overview, incomeOverview, disputesList]);

  const dynamicTerminalData = useMemo(() => {
    if (overview?.topTerminals && Array.isArray(overview.topTerminals) && overview.topTerminals.length > 0) {
      return overview.topTerminals.map((t, idx) => ({
        slot: t.terminal_id || t.id || `TRM-${idx + 1}`,
        demand: Math.min(100, Math.max(0, Math.round(Number(t.revenue || t.taps || 0) / 1000))),
      }));
    }
    return [];
  }, [overview]);

  const dynamicRevenueData = useMemo(() => {
    if (incomeOverview?.hourly && Array.isArray(incomeOverview.hourly) && incomeOverview.hourly.length > 0) {
      return incomeOverview.hourly;
    }
    if (overview?.income) {
      return [
        { hour: 'Today', revenue: Number(overview.income.today || 0), commission: Number(overview.income.today || 0) * 0.1 },
        { hour: 'This Week', revenue: Number(overview.income.thisWeek || 0), commission: Number(overview.income.thisWeek || 0) * 0.1 },
        { hour: 'This Month', revenue: Number(overview.income.thisMonth || 0), commission: Number(overview.income.thisMonth || 0) * 0.1 },
        { hour: 'All Time', revenue: Number(overview.income.allTime || 0), commission: Number(overview.income.allTime || 0) * 0.1 },
      ];
    }
    return [];
  }, [incomeOverview, overview]);

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
          onToggleDarkMode={() => setDarkMode((d) => !d)}
          notificationCount={disputesList.length || 0}
          adminName={adminProfile?.name || 'Administrator'}
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
            <h1>C-Transit Command Center</h1>
            <p>Live operational oversight, fare validation audit, and agent management</p>
          </div>
          {activeNav === 'overview' && (
            <div className={styles.actionGroup}>
              <PrimaryButton onClick={() => setShowBroadcastModal(true)}>
                <FaBell /> Send Notification
              </PrimaryButton>
              <PrimaryButton variant="ghost" onClick={fetchDashboardMetrics} disabled={loadingOverview}>
                {loadingOverview ? 'Refreshing...' : 'Refresh Metrics'}
              </PrimaryButton>
            </div>
          )}
        </section>

        {syncToast && (
          <div style={{ margin: '16px 0', padding: '12px 16px', background: '#dcfce7', color: '#166534', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
            ✓ {syncToast}
          </div>
        )}

        {overviewError && (
          <div style={{ margin: '16px 0', padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{overviewError}</span>
            <button onClick={fetchDashboardMetrics} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer' }}>Retry</button>
          </div>
        )}

        {/* TAB ROUTING */}
        {activeNav === 'overview' && (
          <>
            <OverviewSection
              onSyncWhitelist={handleSyncWhitelist}
              syncingWhitelist={syncingWhitelist}
            />

            <section className={styles.cardGrid}>
              {dynamicStatCards.map((card) => (
                <StatCard key={card.id} {...card} loading={loadingOverview} />
              ))}
            </section>

            <section className={styles.chartGrid}>
              <article className={styles.panel}>
                <div className={styles.panelHead}>
                  <h2>Live Terminal Activity</h2>
                  <span>POS terminal demand & validation</span>
                </div>
                <div className={styles.chartCanvas}>
                  {dynamicTerminalData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dynamicTerminalData} barCategoryGap={8}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="slot" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
                        <Tooltip
                          formatter={(value) => [`${value}`, 'Utilization Index']}
                          contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff' }}
                        />
                        <Bar dataKey="demand" radius={[7, 7, 0, 0]}>
                          {dynamicTerminalData.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={getHeatColor(entry.demand, darkMode)} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '13px' }}>
                      No terminal activity data available for this period.
                    </div>
                  )}
                </div>
              </article>

              <article className={styles.panel}>
                <div className={styles.panelHead}>
                  <h2>Campus Revenue & Commission</h2>
                  <span>Live NGN collections</span>
                </div>
                <div className={styles.chartCanvas}>
                  {dynamicRevenueData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dynamicRevenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis
                          tick={{ fill: '#64748b', fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(value) => `${Math.round(value / 1000)}k`}
                          width={36}
                        />
                        <Tooltip
                          formatter={(value) => [nairaFormatter.format(value), '']}
                          contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#2563eb"
                          strokeWidth={2.5}
                          dot={{ fill: '#2563eb', r: 4 }}
                          name="Revenue"
                        />
                        <Line
                          type="monotone"
                          dataKey="commission"
                          stroke="#f59e0b"
                          strokeWidth={2.5}
                          dot={{ fill: '#f59e0b', r: 4 }}
                          name="Commission"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '13px' }}>
                      No revenue trend data available for this period.
                    </div>
                  )}
                </div>
              </article>
            </section>
          </>
        )}

        {activeNav === 'agents' && <AgentsSection />}
        {activeNav === 'support' && <DisputesSection />}
        {activeNav === 'payments' && <PaymentsAndIncomeSection />}
        {activeNav === 'reports' && <PaymentsAndIncomeSection />}
        {activeNav === 'notifications' && (
          <NotificationsSection
            onSyncWhitelist={handleSyncWhitelist}
            syncingWhitelist={syncingWhitelist}
          />
        )}
        {activeNav === 'users' && (
          <section className={styles.usersSection}>
            <h2>Enrolled Students & Commuters</h2>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <h3>Total Students</h3>
                <p>{Number(overview?.counts?.students || 0).toLocaleString('en-NG')}</p>
                <small>Campus registered</small>
              </div>
              <div className={styles.statCard}>
                <h3>Active Cards Bound</h3>
                <p>{Number(overview?.wallets?.active || 0).toLocaleString('en-NG')}</p>
                <small>RFID contactless cards</small>
              </div>
            </div>
          </section>
        )}
        {activeNav === 'roles' && (
          <section className={styles.rolesSection}>
            <h2>Administrative Roles & System Boundaries</h2>
            <p>Access control boundaries enforced via authenticated Bearer JWT tokens.</p>
          </section>
        )}
      </div>

      {/* Broadcast / Send Notification Quick Modal */}
      {showBroadcastModal && (
        <Modal open={showBroadcastModal} title="Send Student Notification" onClose={() => setShowBroadcastModal(false)}>
          <div className={styles.modalContent}>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>
              Switch to the <strong>Notifications</strong> tab in the sidebar to send targeted student push notices and sync terminal whitelists.
            </p>
            <div className={styles.modalActions}>
              <PrimaryButton variant="ghost" onClick={() => setShowBroadcastModal(false)}>
                Close
              </PrimaryButton>
              <PrimaryButton onClick={() => { setShowBroadcastModal(false); setActiveNav('notifications'); }}>
                Go to Notifications
              </PrimaryButton>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
