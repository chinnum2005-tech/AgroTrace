import express from 'express';
import { chatbotController } from '../controllers/chatbot.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// POST /api/chat - Protected route
router.post('/', authenticate, chatbotController.handleChat);

export default router;
