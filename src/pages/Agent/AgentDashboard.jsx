import { useState, useEffect } from 'react';
import AgentLayout from '../../components/Agents/AgentLayout';
import AgentOverview from './AgentOverview';
import KYCManagement from './KYCManagement';
import DriverRegistration from './DriverRegistration';
import LinkCard from './LinkCard';
import ComingSoon from './ComingSoon';
import useAgentAuth from '../../hooks/useAgentAuth';

export default function AgentDashboard() {
  const { agentData } = useAgentAuth();
  const [activeTab, setActiveTab] = useState('overview');

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
        return <ComingSoon title="Users Management" description="Manage all registered users" progress={25} />;
      case 'transactions':
        return <ComingSoon title="Transactions" description="View and manage all transactions" progress={40} />;
      case 'notifications':
        return <ComingSoon title="Notifications" description="Manage notifications and alerts" progress={15} />;
      case 'settings':
        return <ComingSoon title="Settings" description="Configure your account and preferences" progress={35} />;
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