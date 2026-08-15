import { useState, useEffect } from 'react';
import AgentLayout from './components/AgentLayout';
import AgentOverview from './AgentOverview';
import KYCManagement from './KYCManagement';
import DriverRegistration from './DriverRegistration';
import LinkCard from './LinkCard';
import AgentUsers from './AgentUsers';
import AgentTerminals from './AgentTerminals';
import { DriverTrips, DriverEarnings, DriverVehicle } from '../driver';
import useAgentAuth from '../../hooks/useAgentAuth';

export default function AgentDashboard() {
  const { agentData } = useAgentAuth();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const handleTabChange = (e) => {
      if (e.detail?.tab) setActiveTab(e.detail.tab);
    };
    document.addEventListener('tabChange', handleTabChange);
    return () => document.removeEventListener('tabChange', handleTabChange);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AgentOverview agentData={agentData} />;
      case 'kyc':
        return <KYCManagement />;
      case 'drivers':
        return <DriverRegistration />;
      case 'link-card':
        return <LinkCard />;
      case 'users':
        return <AgentUsers />;
      case 'terminals':
        return <AgentTerminals />;
      case 'driver-trips':
        return <DriverTrips />;
      case 'driver-vehicle':
        return <DriverVehicle />;
      case 'driver-earnings':
        return <DriverEarnings />;
      case 'settings':
        return (
          <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>Agent Profile</h1>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>Logged in agent station credentials and permissions</p>
            <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <p><strong>Agent Name:</strong> {agentData?.firstname} {agentData?.lastname || agentData?.name || 'Authorized Field Agent'}</p>
              <p><strong>Email:</strong> {agentData?.email || 'agent@c-transit.ng'}</p>
              <p><strong>Role:</strong> Campus Operations Field Agent</p>
              <p><strong>Assigned Zone:</strong> Bosso & Gidan Kwano Campuses</p>
            </div>
          </div>
        );
      default:
        return <AgentOverview agentData={agentData} />;
    }
  };

  return (
    <AgentLayout activeTab={activeTab} onTabChange={setActiveTab} agentData={agentData}>
      {renderContent()}
    </AgentLayout>
  );
}
