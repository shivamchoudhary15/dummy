import { successFactorsService } from '../services/successFactorsService.js';
import { aggregationService } from '../services/aggregationService.js';
import { nlpService } from '../services/nlpService.js';
import { llmService } from '../services/llmService.js';

// In-memory data store for connection details and telemetry report history
global.activeConnection = null;
global.reportHistory = [];

export const apiController = {
  /**
   * Validate connection details and store them in-memory
   */
  async connect(req, res) {
    try {
      const { companyId, username, password, baseUrl } = req.body;

      if (!companyId || !username || !password || !baseUrl) {
        return res.status(400).json({ 
          success: false, 
          message: 'All fields (companyId, username, password, baseUrl) are required.' 
        });
      }

      // Format URL to ensure it has https and no trailing slash
      const formattedBaseUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;
      
      const tempConnection = {
        companyId,
        username,
        password,
        baseUrl: formattedBaseUrl,
        createdAt: new Date()
      };

      console.log(`Validating connection for user ${username}@${companyId}...`);
      
      // Test the connection by making a quick OData request (top 1 user)
      try {
        await successFactorsService.makeODataRequest(tempConnection, '/odata/v2/User', { $top: 1 });
      } catch (apiError) {
        console.error('SAP SuccessFactors test connection failed:', apiError.message);
        return res.status(401).json({
          success: false,
          message: `Authentication or connection failed: ${apiError.response?.data?.error?.message?.value || apiError.message}`
        });
      }

      // Save connection in-memory globally
      global.activeConnection = tempConnection;

      res.status(200).json({
        success: true,
        message: 'Successfully connected and verified SuccessFactors integration!',
        connection: {
          companyId: tempConnection.companyId,
          username: tempConnection.username,
          baseUrl: tempConnection.baseUrl,
          createdAt: tempConnection.createdAt
        }
      });

    } catch (error) {
      console.error('Connect endpoint error:', error);
      res.status(500).json({ success: false, message: 'Server error during connection validation.' });
    }
  },

  /**
   * Helper to retrieve active connection credentials
   */
  async getActiveConnection() {
    return global.activeConnection;
  },

  /**
   * Generic API to fetch user, position, department, location, division, or company data from SuccessFactors
   */
  async fetchData(req, res) {
    try {
      const { objectType, filters = {} } = req.body;
      const forceRefresh = req.query.forceRefresh === 'true';

      const validObjects = ['User', 'Position', 'Department', 'Location', 'Division', 'Company'];
      if (!objectType || !validObjects.includes(objectType)) {
        return res.status(400).json({ 
          success: false, 
          message: `Invalid object type. Must be one of: ${validObjects.join(', ')}.` 
        });
      }

      const connection = await apiController.getActiveConnection();
      if (!connection) {
        return res.status(400).json({ 
          success: false, 
          message: 'No active connection found. Please connect to SAP SuccessFactors first.' 
        });
      }

      let data = [];
      if (objectType === 'User') {
        data = await successFactorsService.fetchUsers(connection, {}, forceRefresh);
      } else if (objectType === 'Position') {
        data = await successFactorsService.fetchPositions(connection, {}, forceRefresh);
      } else if (objectType === 'Department') {
        data = await successFactorsService.fetchDepartments(connection, {}, forceRefresh);
      } else if (objectType === 'Location') {
        data = await successFactorsService.fetchLocations(connection, {}, forceRefresh);
      } else if (objectType === 'Division') {
        data = await successFactorsService.fetchDivisions(connection, {}, forceRefresh);
      } else if (objectType === 'Company') {
        data = await successFactorsService.fetchCompanies(connection, {}, forceRefresh);
      }

      // Apply filtering
      const filteredData = successFactorsService.applyFilters(data, filters);

      res.status(200).json({
        success: true,
        objectType,
        totalCount: data.length,
        filteredCount: filteredData.length,
        data: filteredData
      });

    } catch (error) {
      console.error('Fetch data error:', error);
      res.status(500).json({ 
        success: false, 
        message: `Error fetching data from SuccessFactors: ${error.response?.data?.error?.message?.value || error.message}` 
      });
    }
  },

  /**
   * GET /api/users
   */
  async getUsers(req, res) {
    req.body = { objectType: 'User', filters: req.query.filters ? JSON.parse(req.query.filters) : {} };
    return apiController.fetchData(req, res);
  },

  /**
   * GET /api/positions
   */
  async getPositions(req, res) {
    req.body = { objectType: 'Position', filters: req.query.filters ? JSON.parse(req.query.filters) : {} };
    return apiController.fetchData(req, res);
  },

  /**
   * GET /api/departments
   */
  async getDepartments(req, res) {
    req.body = { objectType: 'Department', filters: req.query.filters ? JSON.parse(req.query.filters) : {} };
    return apiController.fetchData(req, res);
  },

  /**
   * GET /api/locations
   */
  async getLocations(req, res) {
    req.body = { objectType: 'Location', filters: req.query.filters ? JSON.parse(req.query.filters) : {} };
    return apiController.fetchData(req, res);
  },

  /**
   * GET /api/divisions
   */
  async getDivisions(req, res) {
    req.body = { objectType: 'Division', filters: req.query.filters ? JSON.parse(req.query.filters) : {} };
    return apiController.fetchData(req, res);
  },

  /**
   * GET /api/companies
   */
  async getCompanies(req, res) {
    req.body = { objectType: 'Company', filters: req.query.filters ? JSON.parse(req.query.filters) : {} };
    return apiController.fetchData(req, res);
  },

  /**
   * POST /api/aggregate
   */
  async aggregate(req, res) {
    try {
      const { data, groupBy, aggregation, numericField = '' } = req.body;

      if (!data || !Array.isArray(data)) {
        return res.status(400).json({ success: false, message: 'Invalid dataset. It must be an array.' });
      }

      const result = aggregationService.aggregateData(data, groupBy, aggregation, numericField);

      // Save report parameters in-memory for session tracking
      try {
        const firstRow = data[0];
        const isUserObj = firstRow && 'userId' in firstRow;
        const objectType = isUserObj ? 'User' : 'Position';

        global.reportHistory.push({
          objectType,
          filters: {},
          chartType: req.body.chartType || 'bar',
          groupBy,
          aggregation,
          numericField,
          generatedAt: new Date()
        });
      } catch (err) {
        // Safe catch
      }

      res.status(200).json(result);

    } catch (error) {
      console.error('Aggregation error:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  },

  /**
   * POST /api/nlp-chart
   */
  async nlpChart(req, res) {
    try {
      const { prompt, provider = 'local', apiKey = '' } = req.body;

      if (!prompt) {
        return res.status(400).json({ success: false, message: 'Prompt is required.' });
      }

      if (provider === 'local') {
        const spec = nlpService.parsePrompt(prompt);
        return res.status(200).json(spec);
      }

      // If user selected an LLM provider, parse using LLM
      try {
        console.log(`Routing NLP parse request to ${provider}...`);
        const spec = await llmService.parsePromptWithLlm(prompt, provider, apiKey);
        return res.status(200).json(spec);
      } catch (llmError) {
        console.warn(`LLM parsing failed, falling back to local NLP heuristics:`, llmError.message);
        
        // Local fallback
        const spec = nlpService.parsePrompt(prompt);
        return res.status(200).json({
          ...spec,
          fallbackReason: llmError.message
        });
      }

    } catch (error) {
      console.error('NLP processing error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * POST /api/verify-llm-key
   */
  async verifyLlmKey(req, res) {
    try {
      const { provider, apiKey } = req.body;
      if (!provider || !apiKey) {
        return res.status(400).json({ success: false, message: 'Provider and API Key are required.' });
      }
      await llmService.verifyKey(provider, apiKey);
      res.status(200).json({ success: true, message: 'API key is valid.' });
    } catch (error) {
      console.error('LLM Key Verification Error:', error.message);
      res.status(400).json({ success: false, message: error.message });
    }
  },

  /**
   * GET /api/connection-status
   */
  async getConnectionStatus(req, res) {
    try {
      const connection = await apiController.getActiveConnection();
      if (connection) {
        res.status(200).json({
          connected: true,
          connection: {
            companyId: connection.companyId,
            username: connection.username,
            baseUrl: connection.baseUrl
          }
        });
      } else {
        res.status(200).json({ connected: false });
      }
    } catch (error) {
      res.status(200).json({ connected: false });
    }
  }
};
