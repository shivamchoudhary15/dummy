import express from 'express';
import { apiController } from '../controllers/apiController.js';

const router = express.Router();

router.post('/connect', apiController.connect);
router.post('/fetch-data', apiController.fetchData);
router.get('/users', apiController.getUsers);
router.get('/positions', apiController.getPositions);
router.get('/departments', apiController.getDepartments);
router.get('/locations', apiController.getLocations);
router.get('/divisions', apiController.getDivisions);
router.get('/companies', apiController.getCompanies);
router.post('/aggregate', apiController.aggregate);
router.post('/nlp-chart', apiController.nlpChart);
router.post('/verify-llm-key', apiController.verifyLlmKey);
router.get('/connection-status', apiController.getConnectionStatus);

export default router;
