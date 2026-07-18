import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function useAgentAuth() {
  const navigate = useNavigate();
  const [agentData, setAgentData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('agentToken');
    const data = localStorage.getItem('agentData');
    
    if (token && data) {
      setAgentData(JSON.parse(data));
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    setLoading(false);
  }, []);

  const login = (token, agent) => {
    localStorage.setItem('agentToken', token);
    localStorage.setItem('agentData', JSON.stringify(agent));
    localStorage.setItem('agentSession', 'true');
    setAgentData(agent);
    setIsAuthenticated(true);
    navigate('/agent/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('agentToken');
    localStorage.removeItem('agentData');
    localStorage.removeItem('agentSession');
    setAgentData(null);
    setIsAuthenticated(false);
    navigate('/agent/login');
  };

  return { agentData, isAuthenticated, loading, login, logout };
}