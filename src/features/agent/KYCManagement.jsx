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
  FaCheckCircle,
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
  
  // Rejection modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectSubmitting, setRejectSubmitting] = useState(false);
  const [rejectError, setRejectError] = useState(null);

  // In-app Toast notifications
  const [toast, setToast] = useState(null);

  const showInAppToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

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
        rawQueue = d?.queue || d?.data || d?.kyc || d?.requests || d?.pending || d?.items || (Array.isArray(d) ? d : []);
      } else {
        throw kycRes.reason;
      }

      const studentsMap = new Map();
      if (usersRes.status === 'fulfilled') {
        const uData = usersRes.value;
        const studentsList = uData?.students || uData?.data || uData?.users || (Array.isArray(uData) ? uData : []);
        studentsList.forEach((s) => {
          if (s.id) studentsMap.set(String(s.id), s);
          if (s._id) studentsMap.set(String(s._id), s);
          if (s.userId) studentsMap.set(String(s.userId), s);
          if (s.user_id) studentsMap.set(String(s.user_id), s);
          if (s.studentId) studentsMap.set(String(s.studentId), s);
          if (s.student_id) studentsMap.set(String(s.student_id), s);
          if (s.matricNumber) studentsMap.set(String(s.matricNumber).toLowerCase(), s);
          if (s.matric_number) studentsMap.set(String(s.matric_number).toLowerCase(), s);
          if (s.email) studentsMap.set(String(s.email).toLowerCase(), s);
        });
      }

      // Merge and resolve complete user details for each KYC record
      const enrichedQueue = rawQueue.map((item) => {
        const userId = item.userId || item.user_id || item.studentId || item.student_id || item.studentUid || item.student_uid || item.user?.id || item.user?._id || item.student?.id || item.student?._id || item.id || item._id;
        
        // Multi-strategy student lookup
        const matchedStudent =
          (userId ? studentsMap.get(String(userId)) : null) ||
          (item.matricNumber ? studentsMap.get(String(item.matricNumber).toLowerCase()) : null) ||
          (item.user?.matricNumber ? studentsMap.get(String(item.user.matricNumber).toLowerCase()) : null) ||
          (item.matric_number ? studentsMap.get(String(item.matric_number).toLowerCase()) : null) ||
          (item.email ? studentsMap.get(String(item.email).toLowerCase()) : null) ||
          (item.user?.email ? studentsMap.get(String(item.user.email).toLowerCase()) : null) ||
          null;

        // Resolve Name
        const rawFirstname = item.user?.firstname || item.user?.firstName || item.student?.firstname || item.student?.firstName || item.firstname || item.firstName || matchedStudent?.firstname || matchedStudent?.firstName || '';
        const rawLastname = item.user?.lastname || item.user?.lastName || item.student?.lastname || item.student?.lastName || item.lastname || item.lastName || matchedStudent?.lastname || matchedStudent?.lastName || '';
        const combinedName = (rawFirstname || rawLastname) ? `${rawFirstname} ${rawLastname}`.trim() : '';
        const resolvedName = combinedName || item.user?.name || item.student?.name || item.name || item.studentName || item.student_name || item.userName || item.user_name || matchedStudent?.name || 'N/A';

        // Resolve Email
        const resolvedEmail = item.user?.email || item.student?.email || item.email || item.userEmail || item.user_email || item.studentEmail || item.student_email || matchedStudent?.email || 'N/A';

        // Resolve Matriculation Number
        const matricNumber = item.user?.matricNumber || item.user?.matric_number || item.student?.matricNumber || item.student?.matric_number || item.matricNumber || item.matric_number || item.matric || item.studentMatric || item.student_matric || matchedStudent?.matricNumber || matchedStudent?.matric_number || '';

        // Resolve Submission Timestamp
        const submittedAt = item.submittedAt || item.submitted_at || item.createdAt || item.created_at || item.updatedAt || item.updated_at || item.date || item.timestamp || matchedStudent?.kyc?.submittedAt || matchedStudent?.kyc?.submitted_at || matchedStudent?.kyc?.createdAt || matchedStudent?.createdAt || matchedStudent?.created_at || null;

        // Resolve Cloudinary Document Image URL
        const idCardImageUrl = item.idCardImageUrl || item.id_card_image_url || item.idCardUrl || item.id_card_url || item.documentUrl || item.document_url || item.imageUrl || item.image_url || item.url || item.cloudinaryUrl || item.cloudinary_url || item.idCard || item.id_card || item.document || item.image || item.user?.idCardImageUrl || item.user?.id_card_image_url || item.user?.documentUrl || item.student?.idCardImageUrl || item.student?.documentUrl || item.user?.kyc?.idCardImageUrl || matchedStudent?.kyc?.idCardImageUrl || matchedStudent?.kyc?.id_card_image_url || matchedStudent?.idCardImageUrl || '';

        const resolvedStatus = (item.status || item.kycStatus || item.kyc_status || 'pending').toLowerCase();

        return {
          ...item,
          userId: String(userId),
          rawRecordId: item.id || item._id || String(userId),
          user: {
            name: resolvedName,
            email: resolvedEmail,
            matricNumber: matricNumber,
          },
          matricNumber,
          submittedAt,
          idCardImageUrl,
          status: resolvedStatus,
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

      showInAppToast('success', `KYC for ${requestRecord?.user?.name || 'student'} approved successfully!`);

      // Re-fetch backend queue to synchronize pending counts
      await fetchKYCRequests();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to approve KYC. Please try again.';
      showInAppToast('error', errorMsg);
    } finally {
      setProcessingId(null);
    }
  };

  const handleOpenRejectModal = (requestRecord) => {
    setRejectTarget(requestRecord);
    setRejectReason('');
    setRejectError(null);
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectTarget) return;
    const reason = rejectReason.trim();
    if (!reason) {
      setRejectError('Please provide a reason for rejecting this KYC submission.');
      return;
    }

    const userId = rejectTarget.userId || rejectTarget.user_id || rejectTarget.studentId || rejectTarget.id;
    setRejectSubmitting(true);
    setRejectError(null);

    try {
      await rejectAgentKYC(userId, reason);

      // Update session history
      setSessionHistory((prev) => ({
        ...prev,
        rejected: [
          { ...rejectTarget, status: 'rejected', rejectionReason: reason, processedAt: new Date().toISOString() },
          ...prev.rejected.filter((r) => (r.userId || r.id) !== userId),
        ],
        approved: prev.approved.filter((r) => (r.userId || r.id) !== userId),
      }));

      showInAppToast('success', `KYC for ${rejectTarget.user?.name || 'student'} rejected.`);
      setRejectModalOpen(false);
      setRejectTarget(null);
      setRejectReason('');

      // Re-fetch backend queue to synchronize pending counts
      await fetchKYCRequests();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to reject KYC. Please try again.';
      setRejectError(errorMsg);
    } finally {
      setRejectSubmitting(false);
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
      {/* In-app Toast Banner */}
      {toast && (
        <div className={`${styles.toastBanner} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError}`}>
          {toast.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
          <span>{toast.message}</span>
        </div>
      )}

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
                          Submitted: {request.submittedAt ? new Date(request.submittedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className={styles.kycActions}>
                      <button className={styles.viewBtn} onClick={() => handleViewDetails(request)}>
                        <FaEye /> View Details
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
                            onClick={() => handleOpenRejectModal(request)}
                            disabled={processingId === request.userId}
                          >
                            <FaTimes /> Reject
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
                  <span className={styles.modalLabel}>Submitted Time:</span>
                  <span>{selectedRequest.submittedAt ? new Date(selectedRequest.submittedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
                </div>
                <div className={styles.modalDetailRow}>
                  <span className={styles.modalLabel}>Status:</span>
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
                      setShowDetailsModal(false);
                      handleOpenRejectModal(selectedRequest);
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

      {/* KYC Rejection In-App Modal (Issue 4) */}
      {rejectModalOpen && rejectTarget && (
        <div className={styles.rejectModalOverlay} onClick={() => !rejectSubmitting && setRejectModalOpen(false)}>
          <div className={styles.rejectModalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.rejectModalHeader}>
              <h3>
                <FaExclamationTriangle style={{ color: '#dc2626' }} /> Reject KYC Submission
              </h3>
              <button
                className={styles.modalClose}
                onClick={() => !rejectSubmitting && setRejectModalOpen(false)}
                disabled={rejectSubmitting}
              >
                <FaTimes />
              </button>
            </div>
            <div className={styles.rejectModalBody}>
              <div className={styles.rejectStudentInfo}>
                <div>
                  <strong style={{ display: 'block', color: '#0f172a' }}>{rejectTarget.user?.name}</strong>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{rejectTarget.user?.email}</span>
                </div>
                <code className={styles.studentCode}>
                  {generateStudentDisplayId(rejectTarget.userId, rejectTarget.matricNumber)}
                </code>
              </div>

              <label className={styles.rejectLabel} htmlFor="rejectReasonInput">
                Reason for Rejection <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <textarea
                id="rejectReasonInput"
                className={styles.rejectTextarea}
                placeholder="Enter rejection reason (e.g. ID card image is blurred, expiration date unreadable, or invalid student credentials)..."
                value={rejectReason}
                onChange={(e) => {
                  setRejectReason(e.target.value);
                  setRejectError(null);
                }}
                disabled={rejectSubmitting}
                autoFocus
              />

              {rejectError && (
                <div className={styles.rejectErrorBanner}>
                  <FaExclamationTriangle />
                  <span>{rejectError}</span>
                </div>
              )}
            </div>
            <div className={styles.rejectModalFooter}>
              <button
                type="button"
                className={styles.rejectCancelBtn}
                onClick={() => setRejectModalOpen(false)}
                disabled={rejectSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.rejectConfirmBtn}
                onClick={handleConfirmReject}
                disabled={rejectSubmitting || !rejectReason.trim()}
              >
                {rejectSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin" /> Rejecting...
                  </>
                ) : (
                  <>
                    <FaTimes /> Reject KYC
                  </>
                )}
              </button>
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
