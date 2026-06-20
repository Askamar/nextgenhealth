
import express from 'express';
import { getDrugs, checkInteractions, getDrugInfo } from '../controllers/drugController';

const router = express.Router();

router.get('/search', getDrugs);
router.get('/info', getDrugInfo);
router.post('/check', checkInteractions);

export default router;
