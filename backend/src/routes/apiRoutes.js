import express from 'express';
import { apiController } from '../controllers/apiController.js';

const router = express.Router();

router.post('/connect', apiController.connect);
router.post('/fetch-data', apiController.fetchData);
router.get('/users', apiController.getUsers);
router.get('/positions', apiController.getPositions);
router.post('/aggregate', apiController.aggregate);
router.post('/nlp-chart', apiController.nlpChart);
router.get('/connection-status', apiController.getConnectionStatus);

export default router;
