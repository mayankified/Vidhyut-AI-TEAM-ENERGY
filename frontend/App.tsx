import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SiteDetailPage from './pages/SiteDetailPage';
import AlertsPage from './pages/AlertsPage';
import MaintenancePage from './pages/MaintenancePage';
import SimulatorPage from './pages/SimulatorPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import SiteSelectPage from './pages/SiteSelectPage';
import PredictionsPage from './pages/PredictionsPage';
import ManageSitesPage from './pages/ManageSitesPage';
import ManageAssetsPage from './pages/ManageAssetsPage';
import DigitalTwinPage from './pages/DigitalTwinPage';
import { AppContext } from './contexts/AppContext';
import { Telemetry, Alert, RLSuggestion, HealthStatus, Site, RLStrategy } from './types';
import { useWebSocket } from './hooks/useWebSocket';
import { GoogleGenAI } from '@google/genai';
import { fetchHealthStatus, fetchSites } from './services/api';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('jwt'));
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(false);
  
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  const [theme, setTheme] = useState<'light' | 'dark'>(
    'light'
  );
  
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'INR'>(
    'INR'
  );

  const [rlStrategy, setRlStrategy] = useState<RLStrategy>({
    cost_priority: 70,
    grid_stability_priority: 20,
    battery_longevity_priority: 10,
  });
  
  const [ai] = useState<GoogleGenAI | null>(() => 
    process.env.API_KEY ? new GoogleGenAI({ apiKey: process.env.API_KEY }) : null
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  useEffect(() => {
    const getSites = async () => {
      if (isAuthenticated) {
        try {
            const fetchedSites = await fetchSites();
            setSites(fetchedSites);
        } catch (error) {
            console.error("Failed to fetch sites:", error);
            setSites([]);
        }
      } else {
        setSites([]);
        setSelectedSite(null);
      }
    };
    getSites();
  }, [isAuthenticated]);

  useEffect(() => {
      if (sites.length > 0) {
          const storedSiteId = localStorage.getItem('selectedSiteId');
          if (storedSiteId) {
              const site = sites.find(s => s.id === storedSiteId);
              if(site) setSelectedSite(site);
          }
      }
  }, [sites]);


  const [latestTelemetry, setLatestTelemetry] = useState<Telemetry | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [rlSuggestion, setRlSuggestion] = useState<RLSuggestion | null>(null);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [suggestions, setSuggestions] = useState<RLSuggestion[]>([]);

  useEffect(() => {
    const getHealthStatus = async () => {
      if (isAuthenticated && selectedSite) {
        try {
          const status = await fetchHealthStatus(selectedSite.id);
          setHealthStatus(status);
        } catch (error) {
          console.error('Failed to fetch health status:', error);
        }
      } else {
        setHealthStatus(null);
      }
    };
    
    getHealthStatus();

    if (isAuthenticated && selectedSite) {
      const interval = setInterval(getHealthStatus, 60000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, selectedSite]);

  const login = (token: string) => {
    localStorage.setItem('jwt', token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('selectedSiteId');
    setIsAuthenticated(false);
    setSelectedSite(null);
  };
  
  const selectSite = (site: Site | null) => {
      if (site) {
        localStorage.setItem('selectedSiteId', site.id);
        setSelectedSite(site);
      } else {
        localStorage.removeItem('selectedSiteId');
        setSelectedSite(null);
      }
  };

  const handleWebSocketMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case 'telemetry_update':
          setLatestTelemetry(data.payload);
          break;
        case 'alert':
          setAlerts(prevAlerts => [data.payload, ...prevAlerts]);
          break;
        case 'rl_suggestion':
          setSuggestions(prevSuggestions => [data.payload, ...prevSuggestions]);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  }, []);

  const token = localStorage.getItem('jwt');
  const websocketUrl = selectedSite && token ? `ws://127.0.0.1:8000/ws/site/${selectedSite.id}?token=${token}` : '';
  const { connectionStatus } = useWebSocket(websocketUrl, handleWebSocketMessage, isAuthenticated && !!selectedSite);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const appContextValue = {
    isAuthenticated,
    login,
    logout,
    connectionStatus,
    latestTelemetry,
    alerts,
    rlSuggestion,
    setAlerts,
    setRlSuggestion,
     suggestions,
    setSuggestions,
    theme,
    setTheme,
    currency,
    setCurrency,
    ai,
    healthStatus,
    sites,
    setSites,
    selectedSite,
    selectSite,
    rlStrategy,
    setRlStrategy,
  };

  const renderContent = () => {
      if (!isAuthenticated) {
          return <LoginPage onLogin={login} />;
      }
      if (!selectedSite) {
          return <SiteSelectPage />;
      }
      return (
        <HashRouter>
            <div className="flex h-screen">
                <Sidebar isOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-800 p-4 md:p-6 lg:p-8">
                        <Routes>
                            <Route path="/" element={<Navigate to="/dashboard" />} />
                            <Route path="/dashboard" element={<DashboardPage />} />
                            <Route path="/site-detail" element={<SiteDetailPage />} />
                            <Route path="/digital-twin" element={<DigitalTwinPage />} />
                            <Route path="/alerts" element={<AlertsPage />} />
                            <Route path="/maintenance" element={<MaintenancePage />} />
                            <Route path="/simulator" element={<SimulatorPage />} />
                            <Route path="/predictions" element={<PredictionsPage />} />
                            <Route path="/manage-sites" element={<ManageSitesPage />} />
                            <Route path="/manage-assets" element={<ManageAssetsPage />} />
                            <Route path="/profile" element={<ProfilePage />} />
                            <Route path="/settings" element={<SettingsPage />} />
                        </Routes>
                    </main>
                </div>
            </div>
        </HashRouter>
      );
  }

  return (
    <AppContext.Provider value={appContextValue}>
      <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 min-h-screen">
        {renderContent()}
      </div>
    </AppContext.Provider>
  );
};

export default App;
