import { HealthStatus, Alert, MaintenanceAsset, Site, RLStrategy, DigitalTwinDataPoint, Anomaly, AIQuery, RLSuggestion } from '../types';
const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

// --- Helper for Auth Headers ---
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('jwt');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

// --- Authentication ---
export const apiLogin = async (email: string, password: string): Promise<{ token: string }> => {
  console.log(`Logging in with ${email}`);
  const params = new URLSearchParams();
  params.append('username', email);
  params.append('password', password);

  const response = await fetch(`${API_BASE_URL}/auth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });

  if (!response.ok) {
    throw new Error('Invalid credentials');
  }
  const data = await response.json();
  return { token: data.access_token };
};

// --- Site Management ---
export const fetchSites = async (): Promise<Site[]> => {
  const response = await fetch(`${API_BASE_URL}/sites`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch sites');
  return response.json();
};

export const createSite = async (siteData: Omit<Site, 'id'>): Promise<Site> => {
  const response = await fetch(`${API_BASE_URL}/sites`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(siteData),
  });
  if (!response.ok) throw new Error('Failed to create site');
  return response.json();
};

export const updateSite = async (siteData: Site): Promise<Site> => {
  const response = await fetch(`${API_BASE_URL}/sites/${siteData.id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(siteData),
  });
  if (!response.ok) throw new Error('Failed to update site');
  return response.json();
};

export const deleteSite = async (siteId: string): Promise<{ success: boolean }> => {
  const response = await fetch(`${API_BASE_URL}/sites/${siteId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete site');
  return response.json();
};

// --- Core Data Fetching ---
export const fetchHealthStatus = async (siteId: string): Promise<HealthStatus> => {
  const response = await fetch(`${API_BASE_URL}/sites/${siteId}/health-status`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch health status');
  return response.json();
};

export const fetchAlerts = async (siteId: string): Promise<Alert[]> => {
  const response = await fetch(`${API_BASE_URL}/sites/${siteId}/alerts`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch alerts');
  return response.json();
};

export const acknowledgeAlert = async (siteId: string, alertId: string): Promise<{ success: boolean }> => {
  const response = await fetch(`${API_BASE_URL}/sites/${siteId}/alerts/${alertId}/acknowledge`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to acknowledge alert');
  return response.json();
};

export const acceptRLSuggestion = async (siteId: string, suggestionId: string): Promise<{ success: boolean, schedule: string }> => {
  const response = await fetch(`${API_BASE_URL}/sites/${siteId}/suggestions/${suggestionId}/accept`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to accept suggestion');
  return response.json();
};

export const rejectRLSuggestion = async (siteId: string, suggestionId: string): Promise<{ success: boolean }> => {
  const response = await fetch(`${API_BASE_URL}/sites/${siteId}/suggestions/${suggestionId}/reject`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to reject suggestion');
  return response.json();
};

// --- Asset Management ---
export const fetchAssetsForSite = async (siteId: string): Promise<MaintenanceAsset[]> => {
  const response = await fetch(`${API_BASE_URL}/sites/${siteId}/assets`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch assets');
  return response.json();
};

export const createAsset = async (assetData: Omit<MaintenanceAsset, 'id' | 'failure_probability' | 'rank'>): Promise<MaintenanceAsset> => {
  const response = await fetch(`${API_BASE_URL}/assets`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(assetData)
  });
  if (!response.ok) throw new Error('Failed to create asset');
  return response.json();
};

export const updateAsset = async (assetData: MaintenanceAsset): Promise<MaintenanceAsset> => {
  const response = await fetch(`${API_BASE_URL}/assets/${assetData.id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(assetData)
  });
  if (!response.ok) throw new Error('Failed to update asset');
  return response.json();
};

export const deleteAsset = async (assetId: string): Promise<{ success: boolean }> => {
  const response = await fetch(`${API_BASE_URL}/assets/${assetId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to delete asset');
  return response.json();
};

export const scheduleMaintenance = async (siteId: string, assetId: string): Promise<{ success: boolean }> => {
  const response = await fetch(`${API_BASE_URL}/sites/${siteId}/maintenance/${assetId}/schedule`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to schedule maintenance');
  return response.json();
};

// --- Simulator & Timeseries ---
export const runSimulation = async (params: { pvCurtail: number, batteryTarget: number, gridPrice: number }): Promise<{ cost: number[], emissions: number[] }> => {
  const response = await fetch(`${API_BASE_URL}/simulate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(params)
  });
  if (!response.ok) throw new Error('Simulation failed');
  return response.json();
};

export const fetchTimeseriesData = async (siteId: string, range: string) => {
  const response = await fetch(`${API_BASE_URL}/sites/${siteId}/timeseries?range=${range}`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch timeseries data');
  return response.json();
}

// --- Prediction Model Calls ---
export const runVibrationDiagnosis = async (): Promise<{ prediction: string; confidence: number }> => {
  const response = await fetch(`${API_BASE_URL}/predict/vibration`, { method: 'POST', headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Vibration diagnosis failed');
  return response.json();
};

export const runSolarForecast = async (): Promise<{ prediction: number[] }> => {
  const response = await fetch(`${API_BASE_URL}/predict/solar`, { method: 'POST', headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Solar forecast failed');
  return response.json();
};

export const runMotorFaultDiagnosis = async (): Promise<{ prediction: string; confidence: number }> => {
  const response = await fetch(`${API_BASE_URL}/predict/motor-fault`, { method: 'POST', headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Motor fault diagnosis failed');
  return response.json();
};

// --- Hackathon Features ---
export const updateRLStrategy = async (siteId: string, strategy: RLStrategy): Promise<{ success: boolean }> => {
  const response = await fetch(`${API_BASE_URL}/sites/${siteId}/rl-strategy`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(strategy)
  });
  if (!response.ok) throw new Error('Failed to update RL strategy');
  return response.json();
};

export const fetchDigitalTwinData = async (assetId: string): Promise<{ dataPoints: DigitalTwinDataPoint[], anomalies: Anomaly[] }> => {
  const response = await fetch(`${API_BASE_URL}/assets/${assetId}/digital-twin`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch digital twin data');
  return response.json();
};

export const runRootCauseAnalysis = async (alert: Alert): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/alerts/analyze-root-cause`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(alert)
  });
  if (!response.ok) throw new Error('Root cause analysis failed');
  return response.json();
};


export const askAI = async (question: string): Promise<string> => {
  const body: AIQuery = { question };
  const response = await fetch(`${API_BASE_URL}/actions/ask-ai`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error('AI assistant is currently unavailable.');
  // The backend for this endpoint also returns a raw string
  return response.text();
};


export const fetchRLSuggestions = async (siteId: string): Promise<RLSuggestion[]> => {
    const response = await fetch(`${API_BASE_URL}/sites/${siteId}/suggestions`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch RL suggestions');
    return response.json();
};