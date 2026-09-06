import { useState, useEffect, useCallback } from 'react';
import { FaBroadcastTower, FaSpinner, FaCheckCircle, FaExclamationCircle, FaSyncAlt } from 'react-icons/fa';
import { fetchTerminals } from '../../api/agentApi';

export default function AgentTerminals() {
  const [terminals, setTerminals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTerminals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTerminals();
      const list = data?.terminals || data?.data || (Array.isArray(data) ? data : []);
      setTerminals(list);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load terminals list.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTerminals();
  }, [loadTerminals]);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
            Field POS Terminals
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            Monitor synced RFID bus validators and mobile agent tap devices
          </p>
        </div>
        <button
          onClick={loadTerminals}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: '#fff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#334155',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          <FaSyncAlt /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
          <FaSpinner className="animate-spin" style={{ fontSize: '28px', marginBottom: '12px', color: '#3b82f6' }} />
          <p>Scanning terminal network...</p>
        </div>
      ) : error ? (
        <div style={{ padding: '16px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '16px' }}>
          {error}
        </div>
      ) : terminals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <FaBroadcastTower style={{ fontSize: '36px', color: '#cbd5e1', marginBottom: '12px' }} />
          <h3 style={{ color: '#334155', fontWeight: 600 }}>No POS Terminals Registered</h3>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Terminals registered by campus administrators will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {terminals.map((term, idx) => {
            const terminalId = term.terminal_id || term.terminalId || term.id || `POS-${idx + 1}`;
            const driver = term.active_driver_uid || term.driverUid || term.driverName || 'Unassigned (Idle)';
            const status = (term.status || 'ONLINE').toUpperCase();

            return (
              <div
                key={term.id || term.terminal_id || term.terminalId || idx}
                style={{
                  background: '#fff',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '16px' }}>
                    {terminalId}
                  </span>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: status === 'INACTIVE' ? '#dc2626' : '#16a34a',
                      background: status === 'INACTIVE' ? '#fee2e2' : '#dcfce7',
                      padding: '3px 8px',
                      borderRadius: '12px',
                    }}
                  >
                    {status === 'INACTIVE' ? <FaExclamationCircle /> : <FaCheckCircle />}
                    {status}
                  </span>
                </div>
                <div style={{ color: '#64748b', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div>Active Driver UID: <strong>{driver}</strong></div>
                  <div>Bus Line: <strong>{term.route || term.vehiclePlate || 'Campus Loop Transit'}</strong></div>
                  <div>Last Sync: <strong>{term.lastSync ? new Date(term.lastSync).toLocaleTimeString() : 'Synced'}</strong></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
