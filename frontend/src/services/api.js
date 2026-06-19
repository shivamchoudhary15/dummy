import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  /**
   * Validate SAP connection credentials and save
   */
  async connect(credentials) {
    const response = await api.post('/connect', credentials);
    return response.data;
  },

  /**
   * Check if backend already has an active connection stored
   */
  async getConnectionStatus() {
    const response = await api.get('/connection-status');
    return response.data;
  },

  /**
   * Fetch User or Position data from SAP API (through Express caching controller)
   */
  async fetchData(objectType, filters = {}, forceRefresh = false) {
    const response = await api.post(`/fetch-data?forceRefresh=${forceRefresh}`, {
      objectType,
      filters,
    });
    return response.data;
  },

  /**
   * Request data aggregation from the backend aggregation engine
   */
  async aggregate(data, groupBy, aggregation, numericField = '') {
    const response = await api.post('/aggregate', {
      data,
      groupBy,
      aggregation,
      numericField,
    });
    return response.data;
  },

  /**
   * Send NLP query to extract chart spec parameters
   */
  async parseNlp(prompt, provider = 'local', apiKey = '') {
    const response = await api.post('/nlp-chart', { prompt, provider, apiKey });
    return response.data;
  },

  /**
   * Verify LLM provider API key
   */
  async verifyLlmKey(provider, apiKey) {
    const response = await api.post('/verify-llm-key', { provider, apiKey });
    return response.data;
  },
};
