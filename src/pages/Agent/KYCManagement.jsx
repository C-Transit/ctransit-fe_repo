import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCheck, FaTimes, FaClock, FaUser, FaIdCard, FaCalendar, FaSearch, FaEye } from 'react-icons/fa';
import agentApi from '../../config/AgentApi';
import styles from './KYCManagement.module.css';

export default function KYCManagement() {
  const [kycRequests, setKycRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const fetchKYCRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await agentApi.get('/agents/kyc/pending');
      if (response.data && response.data.data) {
        setKycRequests(response.data.data);
      } else {
        setKycRequests([]);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view KYC requests.');
      } else {
        setError('Failed to load KYC requests. Please try again.');
      }
      setKycRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    if (!window.confirm('Are you sure you want to approve this KYC?')) return;
    setProcessingId(userId);
    try {
      await agentApi.post(`/agents/kyc/${userId}/approve`);
      await fetchKYCRequests();
    } catch (err) {
      alert('Failed to approve KYC. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (userId) => {
    const reason = window.prompt('Please provide a reason for rejection:');
    if (reason === null) return;
    setProcessingId(userId);
    try {
      await agentApi.post(`/agents/kyc/${userId}/reject`, { reason });
      await fetchKYCRequests();
    } catch (err) {
      alert('Failed to reject KYC. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  useEffect(() => {
    fetchKYCRequests();
  }, []);

  const getFilteredRequests = () => {
    let filtered = kycRequests;
    if (filter === 'pending') {
      filtered = filtered.filter(req => req.status === 'pending' || !req.status);
    } else if (filter === 'approved') {
      filtered = filtered.filter(req => req.status === 'approved');
    } else if (filter === 'rejected') {
      filtered = filtered.filter(req => req.status === 'rejected');
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(req =>
        req.user?.name?.toLowerCase().includes(term) ||
        req.user?.email?.toLowerCase().includes(term) ||
        req.user?.phone?.includes(term)
      );
    }
    return filtered;
  };

  const filteredRequests = getFilteredRequests();

  return (
    <div className={styles.kycManagement}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>KYC Management</h1>
          <p className={styles.pageSubtitle}>Review and manage user KYC verifications</p>
        </div>
        <button className={styles.refreshBtn} onClick={fetchKYCRequests}>
          Refresh
        </button>
      </div>

      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.pendingStat}`}>
          <span className={styles.statNumber}>{kycRequests.filter(r => r.status === 'pending' || !r.status).length}</span>
          <span className={styles.statLabel}>Pending</span>
        </div>
        <div className={`${styles.statCard} ${styles.approvedStat}`}>
          <span className={styles.statNumber}>{kycRequests.filter(r => r.status === 'approved').length}</span>
          <span className={styles.statLabel}>Approved</span>
        </div>
        <div className={`${styles.statCard} ${styles.rejectedStat}`}>
          <span className={styles.statNumber}>{kycRequests.filter(r => r.status === 'rejected').length}</span>
          <span className={styles.statLabel}>Rejected</span>
        </div>
        <div className={`${styles.statCard} ${styles.totalStat}`}>
          <span className={styles.statNumber}>{kycRequests.length}</span>
          <span className={styles.statLabel}>Total</span>
        </div>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.filterTabs}>
          <button
            className={`${styles.filterTab} ${filter === 'pending' ? styles.activeFilter : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button
            className={`${styles.filterTab} ${filter === 'approved' ? styles.activeFilter : ''}`}
            onClick={() => setFilter('approved')}
          >
            Approved
          </button>
          <button
            className={`${styles.filterTab} ${filter === 'rejected' ? styles.activeFilter : ''}`}
            onClick={() => setFilter('rejected')}
          >
            Rejected
          </button>
        </div>
        <div className={styles.searchBox}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {error && (
        <div className={styles.errorBox}>
          {error}
          <button onClick={fetchKYCRequests} className={styles.retryBtn}>Retry</button>
        </div>
      )}

      {loading && (
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Loading KYC requests...</p>
        </div>
      )}

      {!loading && !error && (
        <div className={styles.kycList}>
          {filteredRequests.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>📋</span>
              <h3>No KYC requests found</h3>
              <p>{searchTerm ? 'Try adjusting your search' : 'All clear. No pending verifications.'}</p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div key={request._id || request.id} className={styles.kycCard}>
                <div className={styles.kycCardHeader}>
                  <div className={styles.userInfo}>
                    <div className={styles.userAvatar}>
                      {request.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h3 className={styles.userName}>{request.user?.name || 'Unknown User'}</h3>
                      <p className={styles.userEmail}>{request.user?.email || 'No email'}</p>
                    </div>
                  </div>
                  <div className={styles.kycStatus}>
                    <span className={`${styles.statusBadge} ${styles[request.status || 'pending']}`}>
                      {request.status || 'Pending'}
                    </span>
                  </div>
                </div>

                <div className={styles.kycCardBody}>
                  <div className={styles.kycDetails}>
                    <div className={styles.detailItem}>
                      <FaIdCard />
                      <span>ID: {request.idType || 'N/A'}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <FaCalendar />
                      <span>Submitted: {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <FaUser />
                      <span>Phone: {request.user?.phone || 'N/A'}</span>
                    </div>
                  </div>
                  <div className={styles.kycActions}>
                    <button className={styles.viewBtn} onClick={() => handleViewDetails(request)}>
                      <FaEye /> View
                    </button>
                    {(!request.status || request.status === 'pending') && (
                      <>
                        <button
                          className={styles.approveBtn}
                          onClick={() => handleApprove(request.userId || request.user?._id)}
                          disabled={processingId === (request.userId || request.user?._id)}
                        >
                          <FaCheck /> {processingId === (request.userId || request.user?._id) ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          className={styles.rejectBtn}
                          onClick={() => handleReject(request.userId || request.user?._id)}
                          disabled={processingId === (request.userId || request.user?._id)}
                        >
                          <FaTimes /> {processingId === (request.userId || request.user?._id) ? 'Processing...' : 'Reject'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showDetailsModal && selectedRequest && (
        <div className={styles.modalOverlay} onClick={() => setShowDetailsModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>KYC Details</h2>
              <button className={styles.modalClose} onClick={() => setShowDetailsModal(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalUserSection}>
                <div className={styles.modalAvatar}>
                  {selectedRequest.user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3>{selectedRequest.user?.name || 'Unknown User'}</h3>
                  <p>{selectedRequest.user?.email || 'No email'}</p>
                  <p>Phone: {selectedRequest.user?.phone || 'N/A'}</p>
                </div>
              </div>
              <div className={styles.modalDetails}>
                <div className={styles.modalDetailRow}>
                  <span className={styles.modalLabel}>ID Type:</span>
                  <span>{selectedRequest.idType || 'N/A'}</span>
                </div>
                <div className={styles.modalDetailRow}>
                  <span className={styles.modalLabel}>ID Number:</span>
                  <span>{selectedRequest.idNumber || 'N/A'}</span>
                </div>
                <div className={styles.modalDetailRow}>
                  <span className={styles.modalLabel}>Date Submitted:</span>
                  <span>{selectedRequest.createdAt ? new Date(selectedRequest.createdAt).toLocaleString() : 'N/A'}</span>
                </div>
                <div className={styles.modalDetailRow}>
                  <span className={styles.modalLabel}>Status:</span>
                  <span className={`${styles.statusBadge} ${styles[selectedRequest.status || 'pending']}`}>
                    {selectedRequest.status || 'Pending'}
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.modalCloseBtn} onClick={() => setShowDetailsModal(false)}>
                Close
              </button>
              {(!selectedRequest.status || selectedRequest.status === 'pending') && (
                <>
                  <button
                    className={styles.approveBtn}
                    onClick={() => {
                      handleApprove(selectedRequest.userId || selectedRequest.user?._id);
                      setShowDetailsModal(false);
                    }}
                  >
                    <FaCheck /> Approve
                  </button>
                  <button
                    className={styles.rejectBtn}
                    onClick={() => {
                      handleReject(selectedRequest.userId || selectedRequest.user?._id);
                      setShowDetailsModal(false);
                    }}
                  >
                    <FaTimes /> Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}