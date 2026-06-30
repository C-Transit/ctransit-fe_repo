import { useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import DashboardLayout from '../components/Dashboard/DashboardLayout';
import DashboardHome from './dashboard/DashboardHome';
import WalletPage from './dashboard/WalletPage';
import TapHistoryPage from './dashboard/TapHistoryPage';
import NotificationsPage from './dashboard/NotificationsPage';
import ProfilePage from './dashboard/ProfilePage';
import SettingsPage from './dashboard/SettingsPage';
import HelpCenter from './HelpPage';
import ContactSupport from './Contact';
import axios from 'axios';

import { USER_API_URL } from './../config/api';

export default function DashboardWrapper() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState('home');
  const [userData, setUserData] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [recentTaps, setRecentTaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //  Defined first so fetchDashboardData can reference it
  const handleLogout = useCallback(() => {
    localStorage.removeItem('authToken');
    logout();
    navigate('/auth/login');
  }, [logout, navigate]);

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

      // 1. Fetch Profile Data (Core requirement)
      const userResponse = await axios.get(
        `${USER_API_URL}/users/myprofile`,
        { headers }
      );
     
      const profile = userResponse.data.data.profile;
  
      setUserData(profile);
      setWalletBalance(profile?.wallet?.balance || 0);
      setError(null); // Profile loaded successfully, clear global error

      // 2. Fetch Trip History (Isolated so a backend 404 won't break the dashboard)
      try {
        const tripsResponse = await axios.get(
          `${USER_API_URL}/transactions/history`,
          { headers }
        );

       const tripsData = tripsResponse.data.data.transactions;
       const normalized = tripsData.map(t => ({
  ...t,
  createdAt: t.synced_at,
  terminal: t.terminal_id,
  status: t.type === 'RIDE' ? 'success' : 'pending',
}));

setRecentTaps(normalized.slice(0, 5));


       
      } catch (tripErr) {
        // Log the 404 warning silently and fallback to an empty array
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

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

const pageProps = {
    userData,
    walletBalance,
    recentTaps,
    onBack: () => handleNavigate('home'),
    onFundWallet: () => handleNavigate('wallet'),
    onTransfer: () => handleNavigate('wallet'),
    onViewAll: () => handleNavigate('history'),
    onContactSupport: () => handleNavigate('contact'),
  };
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
      activeTab={currentPage}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      UserData={userData}
    >
      {renderPage()}
    </DashboardLayout>
  );
}