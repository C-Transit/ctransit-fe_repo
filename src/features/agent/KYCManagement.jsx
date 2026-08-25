import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FaCheck,
  FaTimes,
  FaIdCard,
  FaCalendar,
  FaSearch,
  FaEye,
  FaSpinner,
  FaExclamationTriangle,
  FaClipboardList,
  FaEnvelope,
  FaSyncAlt,
} from 'react-icons/fa';
import { fetchPendingKYC, approveAgentKYC, rejectAgentKYC, fetchAgentUsers } from '../../api/agentApi';
import { generateStudentDisplayId } from '../../utils/identifierUtils';
import styles from './KYCManagement.module.css';

export default function KYCManagement() {
  const [kycRequests, setKycRequests] = useState([]);
  const [sessionHistory, setSessionHistory] = useState({ approved: [], rejected: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [imageLoadingState, setImageLoadingState] = useState({});
  const [imageErrorState, setImageErrorState] = useState({});

  const fetchKYCRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Concurrent fetch of pending KYC queue and student registry for complete user details
      const [kycRes, usersRes] = await Promise.allSettled([
        fetchPendingKYC(),
        fetchAgentUsers({ page: 1, limit: 100 }),
      ]);

      let rawQueue = [];
      if (kycRes.status === 'fulfilled') {
        const d = kycRes.value;
        rawQueue = d?.queue || d?.data || (Array.isArray(d) ? d : []);
      } else {
        throw kycRes.reason;
      }

      let studentsMap = new Map();
      if (usersRes.status === 'fulfilled') {
        const uData = usersRes.value;
        const studentsList = uData?.students || uData?.data || uData?.users || (Array.isArray(uData) ? uData : []);
        studentsList.forEach((s) => {
          if (s.id) studentsMap.set(String(s.id), s);
          if (s._id) studentsMap.set(String(s._id), s);
          if (s.matricNumber) studentsMap.set(String(s.matricNumber).toLowerCase(), s);
        });
      }

      // Merge and resolve user details for each pending KYC record
      const enrichedQueue = rawQueue.map((item) => {
        const userId = item.userId || item.studentId || item.student_id || item.user?._id || item.user?.id || item.id;
        const matchedStudent = studentsMap.get(String(userId)) ||
          (item.matricNumber ? studentsMap.get(String(item.matricNumber).toLowerCase()) : null);

        const firstname = item.firstname || item.user?.firstname || matchedStudent?.firstname || '';
        const lastname = item.lastname || item.user?.lastname || matchedStudent?.lastname || '';
        const resolvedName = (firstname || lastname)
          ? `${firstname} ${lastname}`.trim()
          : (item.user?.name || item.name || matchedStudent?.name || 'Student');

        const resolvedEmail = item.email || item.user?.email || matchedStudent?.email || 'N/A';
        const matricNumber = item.matricNumber || item.user?.matricNumber || matchedStudent?.matricNumber || '';
        const submittedAt = item.submittedAt || item.createdAt || item.updatedAt || matchedStudent?.kyc?.submittedAt;
        const idCardImageUrl = item.idCardImageUrl || item.id_card_image_url || item.documentUrl || item.imageUrl || item.idCardUrl || '';

        return {
          ...item,
          userId: String(userId),
          rawRecordId: item.id || item._id,
          user: {
            name: resolvedName,
            email: resolvedEmail,
            matricNumber: matricNumber,
          },
          matricNumber,
          submittedAt,
          idCardImageUrl,
          status: item.status || 'pending',
        };
      });

      setKycRequests(enrichedQueue);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view KYC requests.');
      } else {
        setError('Failed to load KYC requests. Please check your connection.');
      }
      setKycRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleApprove = async (userId, requestRecord) => {
    if (!userId) return;
    setProcessingId(userId);
    try {
      await approveAgentKYC(userId);
      
      // Update session history
      if (requestRecord) {
        setSessionHistory((prev) => ({
          ...prev,
          approved: [
            { ...requestRecord, status: 'approved', processedAt: new Date().toISOString() },
            ...prev.approved.filter((r) => (r.userId || r.id) !== userId),
          ],
          rejected: prev.rejected.filter((r) => (r.userId || r.id) !== userId),
        }));
      }

      // Re-fetch backend queue to synchronize pending counts
      await fetchKYCRequests();
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || 'Failed to approve KYC. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (userId, requestRecord) => {
    if (!userId) return;
    const reason = window.prompt('Please provide a reason for rejection:');
    if (reason === null) return;
    setProcessingId(userId);
    try {
      await rejectAgentKYC(userId, reason || 'Incomplete or unreadable document');

      // Update session history
      if (requestRecord) {
        setSessionHistory((prev) => ({
          ...prev,
          rejected: [
            { ...requestRecord, status: 'rejected', rejectionReason: reason, processedAt: new Date().toISOString() },
            ...prev.rejected.filter((r) => (r.userId || r.id) !== userId),
          ],
          approved: prev.approved.filter((r) => (r.userId || r.id) !== userId),
        }));
      }

      // Re-fetch backend queue to synchronize pending counts
      await fetchKYCRequests();
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || 'Failed to reject KYC. Please try again.');
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
  }, [fetchKYCRequests]);

  // Derive consolidated list based on active tab
  const allRequests = useMemo(() => {
    if (filter === 'pending') {
      return kycRequests.filter((r) => r.status === 'pending' || !r.status);
    }
    if (filter === 'approved') {
      return sessionHistory.approved;
    }
    if (filter === 'rejected') {
      return sessionHistory.rejected;
    }
    return [
      ...kycRequests.filter((r) => r.status === 'pending' || !r.status),
      ...sessionHistory.approved,
      ...sessionHistory.rejected,
    ];
  }, [filter, kycRequests, sessionHistory]);

  const filteredRequests = useMemo(() => {
    if (!searchTerm.trim()) return allRequests;
    const term = searchTerm.toLowerCase().trim();
    return allRequests.filter((req) => {
      const name = (req.user?.name || '').toLowerCase();
      const email = (req.user?.email || '').toLowerCase();
      const matric = (req.matricNumber || '').toLowerCase();
      const displayId = generateStudentDisplayId(req.userId, req.matricNumber).toLowerCase();
      return name.includes(term) || email.includes(term) || matric.includes(term) || displayId.includes(term);
    });
  }, [allRequests, searchTerm]);

  const pendingCount = kycRequests.filter((r) => r.status === 'pending' || !r.status).length;
  const approvedCount = sessionHistory.approved.length;
  const rejectedCount = sessionHistory.rejected.length;
  const totalCount = pendingCount + approvedCount + rejectedCount;

  return (
    <div className={styles.kycManagement}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>KYC Verification Management</h1>
          <p className={styles.pageSubtitle}>Review submitted student identification cards and verify accounts</p>
        </div>
        <button className={styles.refreshBtn} onClick={fetchKYCRequests} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaSyncAlt className={loading ? 'animate-spin' : ''} /> Refresh Queue
        </button>
      </div>

      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.pendingStat}`}>
          <span className={styles.statNumber}>{pendingCount}</span>
          <span className={styles.statLabel}>Pending Queue</span>
        </div>
        <div className={`${styles.statCard} ${styles.approvedStat}`}>
          <span className={styles.statNumber}>{approvedCount}</span>
          <span className={styles.statLabel}>Approved</span>
        </div>
        <div className={`${styles.statCard} ${styles.rejectedStat}`}>
          <span className={styles.statNumber}>{rejectedCount}</span>
          <span className={styles.statLabel}>Rejected</span>
        </div>
        <div className={`${styles.statCard} ${styles.totalStat}`}>
          <span className={styles.statNumber}>{totalCount}</span>
          <span className={styles.statLabel}>Total Reviewed</span>
        </div>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.filterTabs}>
          <button
            className={`${styles.filterTab} ${filter === 'pending' ? styles.activeFilter : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({pendingCount})
          </button>
          <button
            className={`${styles.filterTab} ${filter === 'approved' ? styles.activeFilter : ''}`}
            onClick={() => setFilter('approved')}
          >
            Approved ({approvedCount})
          </button>
          <button
            className={`${styles.filterTab} ${filter === 'rejected' ? styles.activeFilter : ''}`}
            onClick={() => setFilter('rejected')}
          >
            Rejected ({rejectedCount})
          </button>
        </div>
        <div className={styles.searchBox}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by student name, matric, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {error && (
        <div className={styles.errorBox}>
          <span>{error}</span>
          <button onClick={fetchKYCRequests} className={styles.retryBtn}>Retry</button>
        </div>
      )}

      {loading && (
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Synchronizing KYC verification queue...</p>
        </div>
      )}

      {!loading && !error && (
        <div className={styles.kycList}>
          {filteredRequests.length === 0 ? (
            <div className={styles.emptyState}>
              <FaClipboardList style={{ fontSize: '48px', color: '#94a3b8', marginBottom: '16px' }} />
              <h3>No KYC records found</h3>
              <p>
                {searchTerm
                  ? 'No submissions match your search query.'
                  : filter === 'pending'
                  ? 'All clear! No student KYC verifications pending review.'
                  : `No ${filter} verifications recorded in this session.`}
              </p>
            </div>
          ) : (
            filteredRequests.map((request) => {
              const displayStudentId = generateStudentDisplayId(request.userId, request.matricNumber);
              const cardKey = request.rawRecordId || request.userId || request.id;
              const hasImageUrl = Boolean(request.idCardImageUrl);

              return (
                <div key={cardKey} className={styles.kycCard}>
                  <div className={styles.kycCardHeader}>
                    <div className={styles.userInfo}>
                      <div className={styles.userAvatar}>
                        {request.user?.name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <h3 className={styles.userName}>{request.user?.name}</h3>
                        <p className={styles.userEmail}>{request.user?.email}</p>
                      </div>
                    </div>
                    <div className={styles.kycStatus}>
                      <span className={`${styles.statusBadge} ${styles[request.status || 'pending']}`}>
                        {(request.status || 'pending').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className={styles.kycCardBody}>
                    <div className={styles.kycDetails}>
                      <div className={styles.detailItem}>
                        <FaIdCard />
                        <span>ID: <strong className={styles.studentCode}>{displayStudentId}</strong></span>
                      </div>
                      <div className={styles.detailItem}>
                        <FaCalendar />
                        <span>
                          Submitted: {request.submittedAt ? new Date(request.submittedAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                        </span>
                      </div>
                    </div>

                    <div className={styles.kycActions}>
                      <button className={styles.viewBtn} onClick={() => handleViewDetails(request)}>
                        <FaEye /> View Document
                      </button>
                      {(!request.status || request.status === 'pending') && (
                        <>
                          <button
                            className={styles.approveBtn}
                            onClick={() => handleApprove(request.userId, request)}
                            disabled={processingId === request.userId}
                          >
                            <FaCheck /> {processingId === request.userId ? 'Processing...' : 'Approve'}
                          </button>
                          <button
                            className={styles.rejectBtn}
                            onClick={() => handleReject(request.userId, request)}
                            disabled={processingId === request.userId}
                          >
                            <FaTimes /> {processingId === request.userId ? 'Processing...' : 'Reject'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* ID Document Preview Section */}
                  <div className={styles.documentSection}>
                    <div className={styles.documentTitle}>
                      <FaIdCard /> Submitted Student ID Document
                    </div>
                    <div className={styles.documentViewerCard}>
                      {hasImageUrl ? (
                        <>
                          {imageLoadingState[cardKey] && (
                            <div className={styles.documentLoading}>
                              <FaSpinner className="animate-spin" />
                              <span>Loading ID document from Cloudinary...</span>
                            </div>
                          )}
                          {!imageErrorState[cardKey] ? (
                            <img
                              src={request.idCardImageUrl}
                              alt="Student ID Verification Card"
                              className={styles.documentImage}
                              referrerPolicy="no-referrer"
                              onLoad={() => setImageLoadingState((prev) => ({ ...prev, [cardKey]: false }))}
                              onError={() => {
                                setImageLoadingState((prev) => ({ ...prev, [cardKey]: false }));
                                setImageErrorState((prev) => ({ ...prev, [cardKey]: true }));
                              }}
                              onClick={() => setLightboxImage({ url: request.idCardImageUrl, name: request.user?.name })}
                              title="Click to enlarge student ID card"
                            />
                          ) : (
                            <div className={styles.documentFallback}>
                              <FaExclamationTriangle style={{ fontSize: '24px', color: '#f59e0b' }} />
                              <p>Unable to load document image preview from Cloudinary.</p>
                              <a
                                href={request.idCardImageUrl}
                                target="_blank"
                                rel="noreferrer noopener"
                                style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'underline' }}
                              >
                                Open document in new tab
                              </a>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className={styles.documentFallback}>
                          <FaExclamationTriangle style={{ fontSize: '24px', color: '#94a3b8' }} />
                          <p>No document image attached to this verification record.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Details & Document Modal */}
      {showDetailsModal && selectedRequest && (
        <div className={styles.modalOverlay} onClick={() => setShowDetailsModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Student KYC Verification Details</h2>
              <button className={styles.modalClose} onClick={() => setShowDetailsModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalUserSection}>
                <div className={styles.modalAvatar}>
                  {selectedRequest.user?.name?.charAt(0) || 'S'}
                </div>
                <div>
                  <h3>{selectedRequest.user?.name}</h3>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <FaEnvelope style={{ color: '#94a3b8' }} /> {selectedRequest.user?.email}
                  </p>
                </div>
              </div>
              <div className={styles.modalDetails}>
                <div className={styles.modalDetailRow}>
                  <span className={styles.modalLabel}>Student Display ID:</span>
                  <span><strong className={styles.studentCode}>{generateStudentDisplayId(selectedRequest.userId, selectedRequest.matricNumber)}</strong></span>
                </div>
                {selectedRequest.matricNumber && (
                  <div className={styles.modalDetailRow}>
                    <span className={styles.modalLabel}>Matriculation Number:</span>
                    <span><strong>{selectedRequest.matricNumber}</strong></span>
                  </div>
                )}
                <div className={styles.modalDetailRow}>
                  <span className={styles.modalLabel}>Date Submitted:</span>
                  <span>{selectedRequest.submittedAt ? new Date(selectedRequest.submittedAt).toLocaleString('en-NG') : 'Recent'}</span>
                </div>
                <div className={styles.modalDetailRow}>
                  <span className={styles.modalLabel}>Verification Status:</span>
                  <span className={`${styles.statusBadge} ${styles[selectedRequest.status || 'pending']}`}>
                    {(selectedRequest.status || 'pending').toUpperCase()}
                  </span>
                </div>
              </div>

              {/* ID Document Visual Viewer */}
              <div className={styles.documentSection}>
                <div className={styles.documentTitle}>
                  <FaIdCard /> Official ID Card Image
                </div>
                <div className={styles.documentViewerCard}>
                  {selectedRequest.idCardImageUrl ? (
                    <img
                      src={selectedRequest.idCardImageUrl}
                      alt="Student ID Card"
                      className={styles.documentImage}
                      referrerPolicy="no-referrer"
                      onClick={() => setLightboxImage({ url: selectedRequest.idCardImageUrl, name: selectedRequest.user?.name })}
                      title="Click to view full size"
                    />
                  ) : (
                    <div className={styles.documentFallback}>
                      <FaExclamationTriangle style={{ fontSize: '24px', color: '#94a3b8' }} />
                      <p>No document image provided.</p>
                    </div>
                  )}
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
                      handleApprove(selectedRequest.userId, selectedRequest);
                      setShowDetailsModal(false);
                    }}
                    disabled={processingId === selectedRequest.userId}
                  >
                    <FaCheck /> Approve Student
                  </button>
                  <button
                    className={styles.rejectBtn}
                    onClick={() => {
                      handleReject(selectedRequest.userId, selectedRequest);
                      setShowDetailsModal(false);
                    }}
                    disabled={processingId === selectedRequest.userId}
                  >
                    <FaTimes /> Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cloudinary Lightbox / Fullscreen Image Viewer */}
      {lightboxImage && (
        <div className={styles.lightboxOverlay} onClick={() => setLightboxImage(null)}>
          <div className={styles.lightboxHeader} onClick={(e) => e.stopPropagation()}>
            <div className={styles.lightboxTitle}>
              Document Preview: {lightboxImage.name}
            </div>
            <button className={styles.lightboxCloseBtn} onClick={() => setLightboxImage(null)}>
              <FaTimes /> Close Fullscreen
            </button>
          </div>
          <div className={styles.lightboxImageContainer} onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxImage.url}
              alt="Fullscreen Student ID Document"
              className={styles.lightboxImg}
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}
    </div>
  );
}
