// src/features/dashboard/DashboardWrapper.jsx
import { useState, useContext, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import DashboardLayout from "./components/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import WalletPage from "./pages/WalletPage";
import TapHistoryPage from "./pages/TapHistoryPage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import HelpCenter from "../public/HelpPage";
import ContactSupport from "../public/Contact";
import axios from "axios";

import { USER_API_URL } from "../../api/api";

// ─── NEW: Kora top-up integration ────────────────────────────────────────────
import { usePaymentReturn } from "../../hooks/usePaymentReturn";
import PaymentStatusToast from "../../components/PaymentStatusToast";
import TopUpWalletForm from "../../components/TopUpWalletForm";

export default function DashboardWrapper() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState("home");
  const [userData, setUserData] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [recentTaps, setRecentTaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ─── NEW: Top-up form modal state ─────────────────────────────────────────
  const [showTopUpModal, setShowTopUpModal] = useState(false);

  // ─── NEW: Payment return hook (Kora redirect handler) ─────────────────────
  const {
    status: payStatus,
    amount: payAmount,
    newBalance: payNewBalance,
    message: payMessage,
    checkAgain,
    dismiss: dismissPayStatus,
  } = usePaymentReturn();

  // ─── Handle Logout ──────────────────────────────────────────────────────────
  const handleLogout = useCallback(() => {
    localStorage.removeItem("authToken");
    logout();
    navigate("/auth/login");
  }, [logout, navigate]);

  // ─── Fetch Dashboard Data ──────────────────────────────────────────────────
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const token =
        localStorage.getItem("authToken") || localStorage.getItem("token");

      if (!token) {
        navigate("/auth/login");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      // 1. Fetch Profile Data
      const userResponse = await axios.get(`${USER_API_URL}/users/myprofile`, {
        headers,
      });

      const userResData = userResponse.data;
      const profile =
        userResData?.data?.profile ||
        userResData?.data?.user ||
        userResData?.profile ||
        userResData?.user ||
        userResData?.data ||
        userResData ||
        {};

      const normalizedProfile = {
        ...profile,
        firstName:
          profile.firstName || profile.firstname || profile.first_name || "",
        lastName:
          profile.lastName || profile.lastname || profile.last_name || "",
        email: profile.email || "",
        matricNumber: profile.matricNumber || profile.matric_number || "",
        wallet: profile.wallet || { balance: profile.balance || 0 },
      };

      setUserData(normalizedProfile);
      setWalletBalance(
        Number(normalizedProfile?.wallet?.balance || profile?.balance || 0)
      );
      setError(null);

      // 2. Fetch Trip History
      try {
        const tripsResponse = await axios.get(
          `${USER_API_URL}/transactions/history`,
          { headers, params: { limit: 5 } }
        );

        const tripsResData = tripsResponse.data;
        const tripsData =
          tripsResData?.data?.transactions ||
          tripsResData?.transactions ||
          (Array.isArray(tripsResData?.data) ? tripsResData.data : null) ||
          (Array.isArray(tripsResData) ? tripsResData : []);

        if (Array.isArray(tripsData)) {
          const normalized = tripsData.map((t) => ({
            ...t,
            createdAt:
              t.synced_at ||
              t.createdAt ||
              t.created_at ||
              t.date ||
              new Date().toISOString(),
            terminal: t.terminal_id || t.terminal || "Terminal",
            status: t.type === "RIDE" ? "success" : "pending",
          }));

          setRecentTaps(normalized.slice(0, 5));
        } else {
          setRecentTaps([]);
        }
      } catch (tripErr) {
        console.warn(
          "Trip history endpoint not found/available yet:",
          tripErr.message
        );
        setRecentTaps([]);
      }
    } catch (err) {
      console.error("Error fetching core dashboard data:", err);

      if (err.response?.status === 401) {
        handleLogout();
        return;
      }

      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [navigate, handleLogout]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ─── NEW: When Kora payment succeeds, update displayed balance ────────────
  useEffect(() => {
    if (payStatus === "SUCCESS" && payNewBalance != null) {
      setWalletBalance(payNewBalance);
    }
  }, [payStatus, payNewBalance]);

  // ─── Navigation Handlers ──────────────────────────────────────────────────
  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  // ─── Handle Balance Update ────────────────────────────────────────────────
  const handleBalanceUpdate = useCallback(
    (newBalance) => {
      if (newBalance === null) {
        fetchDashboardData();
      } else {
        setWalletBalance(newBalance);
      }
    },
    [fetchDashboardData]
  );

  // ─── Page Props ────────────────────────────────────────────────────────────
  const pageProps = {
    userData,
    walletBalance,
    recentTaps,
    onBack: () => handleNavigate("home"),
    onFundWallet: () => handleNavigate("wallet"),
    onTransfer: () => handleNavigate("wallet"),
    onViewAll: () => handleNavigate("history"),
    onContactSupport: () => handleNavigate("contact"),
    onBalanceUpdate: handleBalanceUpdate,
    // NEW: lets DashboardHome wire the "Top Up" button to this modal
    onTopUp: () => setShowTopUpModal(true),
  };

  // ─── Render Page ──────────────────────────────────────────────────────────
  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <DashboardHome {...pageProps} />;
      case "wallet":
        return <WalletPage {...pageProps} />;
      case "history":
        return <TapHistoryPage {...pageProps} />;
      case "notifications":
        return <NotificationsPage {...pageProps} />;
      case "profile":
        return <ProfilePage {...pageProps} />;
      case "settings":
        return <SettingsPage {...pageProps} />;
      case "help":
        return <HelpCenter {...pageProps} />;
      case "contact":
        return (
          <ContactSupport
            {...pageProps}
            onBack={() => handleNavigate("help")}
          />
        );
      default:
        return <DashboardHome {...pageProps} />;
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <p>{error}</p>
        <button onClick={fetchDashboardData}>Retry</button>
      </div>
    );
  }

  return (
    <DashboardLayout
      activePage={currentPage}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      UserData={userData}
    >
      {/* ── NEW: Payment return status banner ────────────────────────────── */}
      {payStatus !== "IDLE" && (
        <div style={{ padding: "0 16px" }}>
          <PaymentStatusToast
            status={payStatus}
            amount={payAmount}
            newBalance={payNewBalance}
            message={payMessage}
            checkAgain={checkAgain}
            dismiss={dismissPayStatus}
            onTryAgain={() => {
              dismissPayStatus();
              setShowTopUpModal(true);
            }}
          />
        </div>
      )}

      {renderPage()}

      {/* ── NEW: Top-up form modal ────────────────────────────────────────── */}
      {showTopUpModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Top up wallet"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowTopUpModal(false);
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "12px",
              padding: "24px",
              width: "100%",
              maxWidth: "400px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
            }}
          >
            <h3
              style={{
                margin: "0 0 18px",
                fontSize: "17px",
                fontWeight: 700,
                color: "#111827",
              }}
            >
              Top Up Wallet
            </h3>
            <TopUpWalletForm onCancel={() => setShowTopUpModal(false)} />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
