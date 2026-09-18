import WebApp from './apps/web/App';
import AdminApp from './apps/admin/App';
import AgentApp from './apps/agent/App';
import DriverApp from './apps/driver/App';

const target = (import.meta.env.VITE_APP_TARGET || '').toLowerCase().trim();

export default function App() {
  switch (target) {
    case 'admin':
      return <AdminApp />;
    case 'agent':
      return <AgentApp />;
    case 'driver':
      return <DriverApp />;
    case 'web':
    default:
      return <WebApp />;
  }
}


