import { useState, useEffect, useCallback } from 'react';
import { FaArrowLeft, FaSearch, FaWifi } from 'react-icons/fa';
import axios from 'axios';
import styles from './TapHistoryPage.module.css';
import { USER_API_URL } from '../../config/api';

export default function TapHistoryPage({ onBack }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [taps, setTaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const filters = ['All', 'Today', 'This Week', 'This Month', 'Custom'];

  const fetchHistory = useCallback(async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const headers = { Authorization: `Bearer ${token}` };

      const res = await axios.get(
        `${USER_API_URL}/transactions/history`,
        { headers, params: { page: pageNum, limit: 20 } }
      );

      const tripsData = res.data.data.transactions;
    
      const normalized = tripsData.map(t => ({
        id: t.id,
        terminal: t.terminal_id,
        time: t.synced_at,
        amount: t.amount,
        status: t.type === 'RIDE' ? 'success' : 'pending',
        date: t.synced_at,
      }));

      setTaps(prev => append ? [...prev, ...normalized] : normalized);
      setHasMore(normalized.length === 20);
      setError(null);
    } catch (err) {
      console.error('Failed to load tap history:', err);
      setError('Failed to load history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(1, false);
  }, [fetchHistory]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchHistory(nextPage, true);
  };

  // ── Client-side date filter logic ──────────────────────────────
  const isInFilterRange = (dateStr) => {
    const tapDate = new Date(dateStr);
    const now = new Date();

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay()); // Sunday start
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    switch (activeFilter) {
      case 'today':
        return tapDate >= startOfToday;
      case 'this week':
        return tapDate >= startOfWeek;
      case 'this month':
        return tapDate >= startOfMonth;
      case 'custom':
        // placeholder — wire to a date picker later if needed
        return true;
      case 'all':
      default:
        return true;
    }
  };

  // group by formatted date, applying both filter + search
  const groupedTaps = {};
  taps
    .filter(tap => isInFilterRange(tap.date))
    .filter(tap => tap.terminal?.toLowerCase().includes(searchTerm.toLowerCase()))
    .forEach(tap => {
      const dateLabel = new Date(tap.date).toLocaleDateString('en-NG', {
        day: 'numeric', month: 'long', year: 'numeric'
      });
      if (!groupedTaps[dateLabel]) groupedTaps[dateLabel] = [];
      groupedTaps[dateLabel].push(tap);
    });

  return (
    <div className={styles.historyPage}>
      <div className={styles.pageHeader}>
        <button className={styles.backBtn} onClick={onBack}>
          <FaArrowLeft size={20} />
        </button>
        <h1 className={styles.pageTitle}>Tap History</h1>
      </div>

      <div className={styles.searchBar}>
        <FaSearch size={16} className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search terminal..."
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className={styles.filterChips}>
        {filters.map(filter => (
          <button
            key={filter}
            className={`${styles.chip} ${activeFilter === filter.toLowerCase() ? styles.chipActive : ''}`}
            onClick={() => setActiveFilter(filter.toLowerCase())}
          >
            {filter}
          </button>
        ))}
      </div>

      {loading && taps.length === 0 && <p>Loading...</p>}
      {error && <p>{error}</p>}

      {!loading && !error && Object.keys(groupedTaps).length === 0 && (
        <p className={styles.emptyState}>No tap history found.</p>
      )}

      <div className={styles.tapsList}>
        {Object.entries(groupedTaps).map(([date, group]) => (
          <div key={date}>
            <p className={styles.dateGroup}>{date}</p>
            {group.map(tap => (
              <div key={tap.id} className={styles.tapRow}>
                <div className={styles.tapIcon}>
                  <FaWifi />
                </div>
                <div className={styles.tapInfo}>
                  <p className={styles.tapTerminal}>{tap.terminal || 'Unknown Terminal'}</p>
                  <p className={styles.tapTime}>
                    {new Date(tap.time).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className={styles.tapRight}>
                  <p className={styles.tapAmount}>-₦{tap.amount?.toLocaleString('en-NG')}</p>
                  <span className={styles.statusBadge}>{tap.status === 'success' ? 'Success' : 'Pending'}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {hasMore && !loading && taps.length > 0 && (
        <button className={styles.loadMoreBtn} onClick={handleLoadMore}>
          Load More
        </button>
      )}
    </div>
  );
}