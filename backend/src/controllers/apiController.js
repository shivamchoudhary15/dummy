import { Connection } from '../models/connection.js';
import { Report } from '../models/report.js';
import { successFactorsService } from '../services/successFactorsService.js';
import { aggregationService } from '../services/aggregationService.js';
import { nlpService } from '../services/nlpService.js';

export const apiController = {
  /**
   * Validate connection details and store them in MongoDB
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
        baseUrl: formattedBaseUrl
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

      // Connection succeeded, save to database
      let connectionDoc;
      try {
        connectionDoc = await Connection.findOneAndUpdate(
          { companyId, username },
          { password, baseUrl: formattedBaseUrl, createdAt: new Date() },
          { upsert: true, new: true }
        );
      } catch (dbError) {
        console.warn('MongoDB not available. Connection validated but not persisted in database:', dbError.message);
        // We can still return success and keep the connection in an in-memory variable for the session
        connectionDoc = { companyId, username, baseUrl: formattedBaseUrl, createdAt: new Date() };
      }

      // Store in global process variable for easy in-memory access if DB is down
      process.env.LAST_COMPANY_ID = companyId;
      process.env.LAST_USERNAME = username;
      // Temporary in-memory connection storage
      global.activeConnection = tempConnection;

      res.status(200).json({
        success: true,
        message: 'Successfully connected and verified SuccessFactors integration!',
        connection: {
          companyId: connectionDoc.companyId,
          username: connectionDoc.username,
          baseUrl: connectionDoc.baseUrl,
          createdAt: connectionDoc.createdAt
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
    // Check if we have one in memory
    if (global.activeConnection) {
      return global.activeConnection;
    }

    // Try finding the most recently updated connection in MongoDB
    try {
      const conn = await Connection.findOne().sort({ createdAt: -1 });
      if (conn) {
        return {
          companyId: conn.companyId,
          username: conn.username,
          password: conn.password,
          baseUrl: conn.baseUrl
        };
      }
    } catch (error) {
      console.error('Failed to read connection from DB:', error.message);
    }
    return null;
  },

  /**
   * Generic API to fetch user or position data from SuccessFactors
   */
  async fetchData(req, res) {
    try {
      const { objectType, filters = {} } = req.body;
      const forceRefresh = req.query.forceRefresh === 'true';

      if (!objectType || !['User', 'Position'].includes(objectType)) {
        return res.status(400).json({ success: false, message: 'Invalid object type. Must be User or Position.' });
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
      } else {
        data = await successFactorsService.fetchPositions(connection, {}, forceRefresh);
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
   * POST /api/aggregate
   */
  async aggregate(req, res) {
    try {
      const { data, groupBy, aggregation, numericField = '' } = req.body;

      if (!data || !Array.isArray(data)) {
        return res.status(400).json({ success: false, message: 'Invalid dataset. It must be an array.' });
      }

      const result = aggregationService.aggregateData(data, groupBy, aggregation, numericField);

      // Save report parameters in history for telemetry (if DB is active)
      try {
        const firstRow = data[0];
        const isUserObj = firstRow && 'userId' in firstRow;
        const objectType = isUserObj ? 'User' : 'Position';

        await Report.create({
          objectType,
          filters: {}, // If needed, can pass down filters
          chartType: req.body.chartType || 'bar',
          groupBy,
          aggregation,
          numericField,
          generatedAt: new Date()
        });
      } catch (dbErr) {
        // Ignore DB save errors to keep engine operational
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
      const { prompt } = req.body;

      if (!prompt) {
        return res.status(400).json({ success: false, message: 'Prompt is required.' });
      }

      const spec = nlpService.parsePrompt(prompt);
      res.status(200).json(spec);

    } catch (error) {
      console.error('NLP processing error:', error);
      res.status(500).json({ success: false, message: error.message });
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
