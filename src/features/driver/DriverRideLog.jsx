import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
} from "lucide-react";
import useDriverAuth from "../../hooks/useDriverAuth";
import { fetchDriverRides } from "../../api/driverApi";
import {
  generateStudentDisplayId,
  generateTransactionDisplayId,
  generateTerminalDisplayId,
} from "../../utils/identifierUtils";
import DriverLayout from "./components/DriverLayout";
import styles from "./DriverRideLog.module.css";

export default function DriverRideLog() {
  const { driver } = useDriverAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rides, setRides] = useState([]);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const limitPerPage = 12;

  const loadRides = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchDriverRides({ page: 1, limit: 100 });
      const rawRides =
        res?.data?.rides ||
        res?.rides ||
        res?.data?.transactions ||
        res?.transactions ||
        (Array.isArray(res?.data) ? res.data : []) ||
        (Array.isArray(res) ? res : []);

      const normalized = (Array.isArray(rawRides) ? rawRides : []).map((r) => {
        const rawStatus = (r.status || (r.type === "RIDE" ? "PAID" : "PENDING")).toUpperCase();
        const cleanStatus = ["PAID", "SUCCESS", "COMPLETED"].includes(rawStatus)
          ? "PAID"
          : ["FAILED", "REJECTED"].includes(rawStatus)
          ? "FAILED"
          : ["DISPUTE", "DISPUTED"].includes(rawStatus)
          ? "DISPUTED"
          : "PENDING";

        return {
          id: r.id || r._id || r.transactionId || r.reference || `TXN-${Date.now()}`,
          amount: Number(r.amount ?? r.fare ?? 0),
          passengerId: r.studentMatric || r.matricNumber || r.studentId || r.passengerId || r.userId || "Passenger",
          passengerName: r.studentName || r.passengerName || "Campus Passenger",
          terminalId: r.terminal_id || r.terminalId || driver?.terminalId || "TRM-01",
          timestamp: r.synced_at || r.createdAt || r.created_at || r.timestamp || r.date || new Date().toISOString(),
          status: cleanStatus,
          reference: r.reference || r.referenceNumber || r.id || "N/A",
        };
      });

      setRides(normalized);
    } catch {
      setError("Unable to load ride history from server. Tap retry to reconnect.");
    } finally {
      setLoading(false);
    }
  }, [driver?.terminalId]);

  useEffect(() => {
    loadRides();
  }, [loadRides]);

  // Client-side filtering
  const filteredRides = useMemo(() => {
    return rides.filter((r) => {
      // Status match
      if (statusFilter !== "ALL" && r.status !== statusFilter) {
        return false;
      }

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const idMatch = String(r.id).toLowerCase().includes(q);
        const passMatch = String(r.passengerId).toLowerCase().includes(q);
        const nameMatch = String(r.passengerName).toLowerCase().includes(q);
        if (!idMatch && !passMatch && !nameMatch) return false;
      }

      // Date match
      if (dateFilter !== "ALL") {
        const rideDate = new Date(r.timestamp);
        const now = new Date();
        if (dateFilter === "TODAY") {
          const isToday =
            rideDate.getDate() === now.getDate() &&
            rideDate.getMonth() === now.getMonth() &&
            rideDate.getFullYear() === now.getFullYear();
          if (!isToday) return false;
        } else if (dateFilter === "WEEK") {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (rideDate < sevenDaysAgo) return false;
        } else if (dateFilter === "MONTH") {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (rideDate < thirtyDaysAgo) return false;
        }
      }

      return true;
    });
  }, [rides, statusFilter, searchQuery, dateFilter]);

  // Pagination slice
  const totalPages = Math.ceil(filteredRides.length / limitPerPage) || 1;
  const paginatedRides = useMemo(() => {
    const start = (currentPage - 1) * limitPerPage;
    return filteredRides.slice(start, start + limitPerPage);
  }, [filteredRides, currentPage]);

  const formatNaira = (val) => {
    return `₦${Number(val || 0).toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatFullDate = (isoStr) => {
    if (!isoStr) return "N/A";
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    return d.toLocaleString("en-NG", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <DriverLayout>
      <div className={styles.pageContainer}>
        {/* Header */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.title}>Ride Transaction Log</h1>
            <p className={styles.subtitle}>
              Historical record of all passenger taps, fares collected & verification audits
            </p>
          </div>
          <button
            type="button"
            className={styles.pageBtn}
            onClick={loadRides}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filter Card */}
        <div className={styles.filterCard}>
          <div className={styles.searchRow}>
            <div className={styles.searchInputWrapper}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by Passenger Matric, Display ID, or Txn Ref..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className={styles.searchInput}
              />
            </div>

            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={styles.dateSelect}
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today Only</option>
              <option value="WEEK">Last 7 Days</option>
              <option value="MONTH">Last 30 Days</option>
            </select>
          </div>

          <div className={styles.filtersRow}>
            <div className={styles.statusTabs}>
              {["ALL", "PAID", "PENDING", "FAILED", "DISPUTED"].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`${styles.statusTab} ${statusFilter === s ? styles.active : ""}`}
                  onClick={() => {
                    setStatusFilter(s);
                    setCurrentPage(1);
                  }}
                >
                  {s === "ALL" ? "All Fares" : s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div style={{ padding: "1rem", background: "#fee2e2", borderRadius: "10px", color: "#b91c1c", display: "flex", justifyContent: "space-between" }}>
            <span>{error}</span>
            <button type="button" onClick={loadRides} style={{ fontWeight: "bold", background: "none", border: "none", color: "#b91c1c", cursor: "pointer" }}>Retry</button>
          </div>
        )}

        {/* Table Card */}
        <div className={styles.tableCard}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Transaction Ref</th>
                  <th className={styles.th}>Date & Time</th>
                  <th className={styles.th}>Passenger</th>
                  <th className={styles.th}>Terminal</th>
                  <th className={styles.th}>Fare Amount</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th} style={{ textAlign: "right" }}>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRides.length > 0 ? (
                  paginatedRides.map((ride) => (
                    <tr
                      key={ride.id}
                      className={styles.tr}
                      onClick={() => setSelectedReceipt(ride)}
                    >
                      <td className={styles.td}>
                        <span className={styles.txnId}>{generateTransactionDisplayId(ride.id)}</span>
                      </td>
                      <td className={styles.td}>{formatFullDate(ride.timestamp)}</td>
                      <td className={styles.td}>
                        <div className={styles.passengerCol}>
                          <span className={styles.passengerName}>
                            {generateStudentDisplayId(ride.passengerId, ride.passengerId)}
                          </span>
                        </div>
                      </td>
                      <td className={styles.td}>{generateTerminalDisplayId(ride.terminalId)}</td>
                      <td className={styles.td}>
                        <span className={styles.fareAmount}>+{formatNaira(ride.amount)}</span>
                      </td>
                      <td className={styles.td}>
                        <span
                          className={`${styles.statusPill} ${
                            ride.status === "PAID"
                              ? styles.statusPaid
                              : ride.status === "FAILED"
                              ? styles.statusFailed
                              : ride.status === "DISPUTED"
                              ? styles.statusDisputed
                              : styles.statusPending
                          }`}
                        >
                          {ride.status}
                        </span>
                      </td>
                      <td className={styles.td} style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          className={styles.pageBtn}
                          style={{ padding: "0.3rem 0.6rem", display: "inline-flex" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReceipt(ride);
                          }}
                        >
                          <Eye size={13} />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className={styles.emptyState}>
                      <AlertCircle size={36} color="#94a3b8" />
                      <p>No ride records match your filters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredRides.length > 0 && (
            <div className={styles.paginationRow}>
              <span className={styles.pageInfo}>
                Showing {(currentPage - 1) * limitPerPage + 1} to{" "}
                {Math.min(currentPage * limitPerPage, filteredRides.length)} of {filteredRides.length} rides
              </span>
              <div className={styles.paginationControls}>
                <button
                  type="button"
                  className={styles.pageBtn}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft size={14} />
                  <span>Prev</span>
                </button>
                <button
                  type="button"
                  className={styles.pageBtn}
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Ride Receipt Modal */}
        {selectedReceipt && (
          <div className={styles.modalOverlay} onClick={() => setSelectedReceipt(null)}>
            <div className={styles.receiptCard} onClick={(e) => e.stopPropagation()}>
              <div className={styles.receiptHeader}>
                <div>
                  <h3 className={styles.receiptTitle}>Ride Verification Receipt</h3>
                  <p style={{ fontSize: "0.78rem", color: "#64748b" }}>
                    Official proof of fare tap & settlement
                  </p>
                </div>
                <button
                  type="button"
                  className={styles.closeBtn}
                  onClick={() => setSelectedReceipt(null)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className={styles.receiptGrid}>
                <div className={styles.receiptField}>
                  <span className={styles.receiptLabel}>Transaction Display ID</span>
                  <span className={styles.receiptValue}>{generateTransactionDisplayId(selectedReceipt.id)}</span>
                </div>
                <div className={styles.receiptField}>
                  <span className={styles.receiptLabel}>Fare Amount</span>
                  <span className={styles.receiptValue} style={{ color: "#15803d", fontSize: "1.1rem" }}>
                    {formatNaira(selectedReceipt.amount)}
                  </span>
                </div>
                <div className={styles.receiptField}>
                  <span className={styles.receiptLabel}>Passenger ID</span>
                  <span className={styles.receiptValue}>
                    {generateStudentDisplayId(selectedReceipt.passengerId, selectedReceipt.passengerId)}
                  </span>
                </div>
                <div className={styles.receiptField}>
                  <span className={styles.receiptLabel}>Payment Status</span>
                  <span
                    className={`${styles.statusPill} ${
                      selectedReceipt.status === "PAID"
                        ? styles.statusPaid
                        : selectedReceipt.status === "FAILED"
                        ? styles.statusFailed
                        : styles.statusPending
                    }`}
                  >
                    {selectedReceipt.status}
                  </span>
                </div>
                <div className={styles.receiptField}>
                  <span className={styles.receiptLabel}>Vehicle Terminal</span>
                  <span className={styles.receiptValue}>{generateTerminalDisplayId(selectedReceipt.terminalId)}</span>
                </div>
                <div className={styles.receiptField}>
                  <span className={styles.receiptLabel}>Tap Timestamp</span>
                  <span className={styles.receiptValue}>{formatFullDate(selectedReceipt.timestamp)}</span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className={styles.pageBtn}
                  onClick={() => setSelectedReceipt(null)}
                >
                  Close Receipt
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DriverLayout>
  );
}
