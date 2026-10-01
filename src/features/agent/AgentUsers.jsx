import { useState, useEffect, useCallback } from 'react';
import { FaUsers, FaSearch, FaCheckCircle, FaTimesCircle, FaReceipt, FaSpinner, FaFilter, FaTimes } from 'react-icons/fa';
import { fetchAgentUsers, fetchAgentUserTransactions } from '../../api/agentApi';
import { generateStudentDisplayId, generateTerminalDisplayId } from '../../utils/identifierUtils';

export default function AgentUsers() {

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterVerified, setFilterVerified] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userTransactions, setUserTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [txModalOpen, setTxModalOpen] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAgentUsers({
        isVerified: filterVerified,
        page: 1,
        limit: 50,
      });
      const list = data?.students || data?.data || data?.users || (Array.isArray(data) ? data : []);
      setUsers(list);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load students list.');
    } finally {
      setLoading(false);
    }
  }, [filterVerified]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleInspectTransactions = async (user) => {
    setSelectedUser(user);
    setTxModalOpen(true);
    setLoadingTx(true);
    setUserTransactions([]);
    try {
      const matric = user.matricNumber || user.matric || user.id;
      if (matric) {
        const data = await fetchAgentUserTransactions(matric, { page: 1, limit: 30 });
        const list = data?.transactions || data?.data || (Array.isArray(data) ? data : []);
        setUserTransactions(list);
      }
    } catch (err) {
      console.warn('Could not fetch user transactions:', err);
    } finally {
      setLoadingTx(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase().trim();
    const fullName = `${u.firstname || ''} ${u.lastname || ''}`.toLowerCase();
    const matric = (u.matricNumber || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    return fullName.includes(q) || matric.includes(q) || email.includes(q);
  });

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
          Student Accounts & Verification
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px' }}>
          View student registration status, transit records, and verified matriculation profiles
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 12px', flex: 1, minWidth: '240px' }}>
          <FaSearch style={{ color: '#94a3b8', marginRight: '8px' }} />
          <input
            type="text"
            placeholder="Search by name, matric no, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', padding: '10px 0', width: '100%', fontSize: '14px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 12px' }}>
          <FaFilter style={{ color: '#94a3b8', marginRight: '8px' }} />
          <select
            value={filterVerified}
            onChange={(e) => setFilterVerified(e.target.value)}
            style={{ border: 'none', outline: 'none', padding: '10px 0', fontSize: '14px', background: 'transparent' }}
          >
            <option value="">All Verification Statuses</option>
            <option value="true">Verified Students Only</option>
            <option value="false">Unverified Students</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
          <FaSpinner className="animate-spin" style={{ fontSize: '28px', marginBottom: '12px', color: '#3b82f6' }} />
          <p>Loading students directory...</p>
        </div>
      ) : error ? (
        <div style={{ padding: '16px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '16px' }}>
          {error}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <FaUsers style={{ fontSize: '36px', color: '#cbd5e1', marginBottom: '12px' }} />
          <h3 style={{ color: '#334155', fontWeight: 600 }}>No students found</h3>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Try adjusting your search query or verification filter.</p>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                  <th style={{ padding: '14px 16px' }}>Student</th>
                  <th style={{ padding: '14px 16px' }}>Matric Number</th>
                  <th style={{ padding: '14px 16px' }}>Email</th>
                  <th style={{ padding: '14px 16px' }}>Status</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, idx) => {
                  const isVerified = u.isVerified || u.kycStatus === 'APPROVED' || u.status === 'verified';
                  return (
                    <tr key={u.id || u._id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: '#1e293b' }}>
                        {u.firstname} {u.lastname}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#475569' }}>
                        <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '13px' }}>
                          {u.matricNumber || generateStudentDisplayId(u.id || u._id)}
                        </code>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#64748b' }}>{u.email}</td>
                      <td style={{ padding: '14px 16px' }}>
                        {isVerified ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#16a34a', background: '#dcfce7', padding: '3px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                            <FaCheckCircle /> Verified
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#d97706', background: '#fef3c7', padding: '3px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                            <FaTimesCircle /> Pending
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleInspectTransactions(u)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            background: '#f8fafc',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            fontSize: '13px',
                            color: '#334155',
                            cursor: 'pointer',
                            fontWeight: 500,
                          }}
                        >
                          <FaReceipt /> History
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {txModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '640px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>
                  Transactions: {selectedUser?.firstname} {selectedUser?.lastname}
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Matric: {selectedUser?.matricNumber || 'N/A'}
                </span>
              </div>
              <button
                onClick={() => setTxModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}
              >
                <FaTimes />
              </button>
            </div>

            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              {loadingTx ? (
                <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  <FaSpinner className="animate-spin" style={{ fontSize: '24px', marginBottom: '8px', color: '#3b82f6' }} />
                  <p>Loading student transactions...</p>
                </div>
              ) : userTransactions.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#64748b', margin: '24px 0' }}>
                  No trip or wallet transactions recorded for this student.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {userTransactions.map((tx, idx) => (
                    <div key={tx.id || tx._id || idx} style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{tx.type || tx.description || 'Transit Tap'}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : 'Recent'} • Terminal: {tx.terminalId ? generateTerminalDisplayId(tx.terminalId) : 'Bus POS'}
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, color: tx.type === 'TOPUP' || tx.type === 'CREDIT' ? '#16a34a' : '#dc2626' }}>
                        {tx.type === 'TOPUP' || tx.type === 'CREDIT' ? '+' : '-'}₦{(tx.amount || 0).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
