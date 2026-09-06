import { useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import DashboardLayout from './components/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import WalletPage from './pages/WalletPage';
import TapHistoryPage from './pages/TapHistoryPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import HelpCenter from '../public/HelpPage';
import ContactSupport from '../public/Contact';
import axios from 'axios';

import { USER_API_URL } from '../../api/api';

export default function DashboardWrapper() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState('home');
  const [userData, setUserData] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [recentTaps, setRecentTaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ─── Handle Logout ──────────────────────────────────────────────────────────
  const handleLogout = useCallback(() => {
    localStorage.removeItem('authToken');
    logout();
    navigate('/auth/login');
  }, [logout, navigate]);

  // ─── Fetch Dashboard Data ──────────────────────────────────────────────────
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem('authToken');

      if (!token) {
        navigate('/auth/login');
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      // 1. Fetch Profile Data
      const userResponse = await axios.get(
        `${USER_API_URL}/users/myprofile`,
        { headers }
      );
     
      const userResData = userResponse.data;
      const profile = userResData?.data?.profile 
        || userResData?.data?.user 
        || userResData?.profile 
        || userResData?.user 
        || userResData?.data 
        || userResData 
        || {};

      const normalizedProfile = {
        ...profile,
        firstName: profile.firstName || profile.firstname || profile.first_name || '',
        lastName: profile.lastName || profile.lastname || profile.last_name || '',
        email: profile.email || '',
        matricNumber: profile.matricNumber || profile.matric_number || '',
        wallet: profile.wallet || { balance: profile.balance || 0 },
      };
  
      setUserData(normalizedProfile);
      setWalletBalance(Number(normalizedProfile?.wallet?.balance || profile?.balance || 0));
      setError(null);

      // 2. Fetch Trip History
      try {
        const tripsResponse = await axios.get(
          `${USER_API_URL}/transactions/history`,
          { headers }
        );

        const tripsResData = tripsResponse.data;
        const tripsData = tripsResData?.data?.transactions 
          || tripsResData?.transactions 
          || (Array.isArray(tripsResData?.data) ? tripsResData.data : null)
          || (Array.isArray(tripsResData) ? tripsResData : []);

        if (Array.isArray(tripsData)) {
          const normalized = tripsData.map(t => ({
            ...t,
            createdAt: t.synced_at || t.createdAt || t.created_at || t.date || new Date().toISOString(),
            terminal: t.terminal_id || t.terminal || 'Terminal',
            status: t.type === 'RIDE' ? 'success' : 'pending',
          }));

          setRecentTaps(normalized.slice(0, 5));
        } else {
          setRecentTaps([]);
        }
       
      } catch (tripErr) {
        console.warn('Trip history endpoint not found/available yet:', tripErr.message);
        setRecentTaps([]); 
      }

    } catch (err) {
      console.error('Error fetching core dashboard data:', err);

      if (err.response?.status === 401) {
        handleLogout();
        return;
      }

      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [navigate, handleLogout]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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
    onBack: () => handleNavigate('home'),
    onFundWallet: () => handleNavigate('wallet'),
    onTransfer: () => handleNavigate('wallet'),
    onViewAll: () => handleNavigate('history'),
    onContactSupport: () => handleNavigate('contact'),
    onBalanceUpdate: handleBalanceUpdate,
  };

  // ─── Render Page ──────────────────────────────────────────────────────────
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <DashboardHome {...pageProps} />;
      case 'wallet':
        return <WalletPage {...pageProps} />;
      case 'history':
        return <TapHistoryPage {...pageProps} />;
      case 'notifications':
        return <NotificationsPage {...pageProps} />;
      case 'profile':
        return <ProfilePage {...pageProps} />;
      case 'settings':
        return <SettingsPage {...pageProps} />;
      case 'help':
        return <HelpCenter {...pageProps} />;
      case 'contact':
        return <ContactSupport {...pageProps} onBack={() => handleNavigate('help')} />;
      default:
        return <DashboardHome {...pageProps} />;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <p>{error}</p>
        <button onClick={fetchDashboardData}>Retry</button>
      </div>
    );
  }

  return (
    <DashboardLayout
      activePage={currentPage}  // ← FIXED: Changed from activeTab to activePage
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      UserData={userData}
    >
      {renderPage()}
    </DashboardLayout>
  );
}