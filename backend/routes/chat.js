import express from 'express';
import { processMessage } from '../controllers/chatController.js';

const router = express.Router();

// POST /api/chat - Process a chat message
router.post('/', processMessage);

export { router as chatRouter };