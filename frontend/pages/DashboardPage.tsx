import React, { useState, useEffect, useContext } from 'react';
import { Sun, Zap, BatteryCharging, Shield, Check, X, Bot, Server } from 'lucide-react';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import { acceptRLSuggestion, rejectRLSuggestion } from '../services/api';
import { AppContext } from '../contexts/AppContext';
import EnergyFlowDiagram from '../components/shared/EnergyFlowDiagram';
import { formatCurrency } from '../utils/currency';
import DiagnosticAssistant from '../components/shared/DiagnosticAssistant';
import RLTuningCard from '../components/shared/RLTuningCard';
import { RLSuggestion } from '../types'; // Import the type if it's not already global
import RLSuggestionsCard from '@/components/shared/RLSuggestionsCard';
import WeatherCard from '@/components/shared/WeatherCard';

const SummaryCard: React.FC<{ title: string; value: string | number; unit: string; icon: React.ReactNode; isLoading: boolean }> = ({ title, value, unit, icon, isLoading }) => (
  <Card className="flex flex-col">
    {isLoading ? (
      <>
        <Skeleton className="h-8 w-3/4 mb-2" />
        <Skeleton className="h-12 w-1/2" />
      </>
    ) : (
      <>
        <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
          <span className="text-sm font-medium">{title}</span>
          {icon}
        </div>
        <div className="mt-2">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">{value}</span>
          <span className="ml-2 text-lg text-gray-600 dark:text-gray-300">{unit}</span>
        </div>
      </>
    )}
  </Card>
);

const HealthBar: React.FC<{ label: string; value: number; icon: React.ReactNode }> = ({ label, value, icon }) => {
  let barColor = 'bg-green-500';
  if (value < 90) barColor = 'bg-yellow-500';
  if (value < 75) barColor = 'bg-red-500';

  return (
    <li className="flex items-center space-x-4">
      <div className="text-blue-500">{icon}</div>
      <div className="flex-1">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
          <span className="font-semibold text-gray-800 dark:text-gray-200">{value.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div className={`${barColor} h-2 rounded-full`} style={{ width: `${value}%` }}></div>
        </div>
      </div>
    </li>
  );
};


const DashboardPage: React.FC = () => {
  // UPDATED: Use the 'suggestions' array and its setter from context
  const { healthStatus, latestTelemetry, suggestions, setSuggestions, currency, selectedSite } = useContext(AppContext)!;
  const isLoading = healthStatus === null;
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isAssistantOpen, setAssistantOpen] = useState(false);

  // This logic for calculating live flows is great
  const liveFlows = {
    grid_to_load: healthStatus?.grid_draw ?? 0,
    pv_to_load: Math.max(0, Math.min(latestTelemetry?.metrics.pv_generation ?? 0, latestTelemetry?.metrics.net_load ?? 0)),
    pv_to_battery: Math.max(0, (latestTelemetry?.metrics.pv_generation ?? 0) - (latestTelemetry?.metrics.net_load ?? 0)),
    battery_to_load: latestTelemetry?.metrics.battery_discharge ?? 0,
    battery_to_grid: 0,
    pv_to_grid: 0,
  };

  // Find the latest suggestion that is still 'pending'
  const latestSuggestion = suggestions.find(s => s.status === 'pending');

  const handleAction = async (suggestion: RLSuggestion, action: 'accept' | 'reject') => {
    if (!selectedSite) return;
    setIsActionLoading(true);

    // Optimistic UI update: remove the suggestion from the list immediately
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));

    try {
      if (action === 'accept') {
        await acceptRLSuggestion(selectedSite.id, suggestion.id);
      } else {
        await rejectRLSuggestion(selectedSite.id, suggestion.id);
      }
    } catch (err) {
      console.error(`Failed to ${action} suggestion.`);
      // If the API call fails, add the suggestion back to the list to show the error
      setSuggestions(prev => [suggestion, ...prev]);
    } finally {
      setIsActionLoading(false);
    }
  };

 return (
    <>
      <div className="space-y-6">
        {/* Row 1: KPIs (This part is correct) */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard title="Site Health" value={healthStatus?.site_health?.toFixed(1) ?? 0} unit="%" icon={<Shield className="w-6 h-6 text-green-500" />} isLoading={isLoading} />
          <SummaryCard title="Grid Draw" value={healthStatus?.grid_draw?.toFixed(1) ?? 0} unit="kW" icon={<Zap className="w-6 h-6 text-yellow-500" />} isLoading={isLoading} />
          <SummaryCard title="Battery SoC" value={healthStatus?.battery_soc?.toFixed(1) ?? 0} unit="%" icon={<BatteryCharging className="w-6 h-6 text-blue-500" />} isLoading={isLoading} />
          <SummaryCard title="Today's PV Gen" value={healthStatus?.pv_generation_today?.toFixed(0) ?? 0} unit="kWh" icon={<Sun className="w-6 h-6 text-orange-400" />} isLoading={isLoading} />
        </div>

        {/* Row 2: Main Content (Corrected Structure) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* Left Column (Spans 2/3 of the width) */}
          <div className="lg:col-span-2 space-y-6">
            <RLSuggestionsCard />
          </div>

          {/* Right Column (Spans 1/3 of the width) */}
          <div className="space-y-6">
            {/* <WeatherCard weather={weather} isLoading={isWeatherLoading} /> */}
            <Card title="Subsystem Health Status">
              {isLoading ? (
                <div className="space-y-6 p-2">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : (
                <ul className="space-y-6">
                  <HealthBar label="PV System" value={healthStatus?.pv_health ?? 0} icon={<Sun className="w-6 h-6" />} />
                  <HealthBar label="Battery SOH" value={healthStatus?.battery_soh ?? 0} icon={<BatteryCharging className="w-6 h-6" />} />
                  <HealthBar label="Inverter" value={healthStatus?.inverter_health ?? 0} icon={<Server className="w-6 h-6" />} />
                  <HealthBar label="EV Charger" value={healthStatus?.ev_charger_health ?? 0} icon={<Zap className="w-6 h-6" />} />
                </ul>
              )}
            </Card>
            <RLTuningCard />
          </div>

        </div>
      </div>

      {/* Floating Action Button and Modal (This part is correct) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setAssistantOpen(true)}
          className="flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-110"
          aria-label="Open AI Diagnostic Assistant"
        >
          <Bot className="w-7 h-7" />
        </button>
      </div>
      <DiagnosticAssistant isOpen={isAssistantOpen} onClose={() => setAssistantOpen(false)} />
    </>
  );
};

export default DashboardPage;