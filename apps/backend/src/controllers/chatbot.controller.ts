import { Request, Response } from 'express';
import { chatbotService } from '../services/chatbot.service';
import prisma from '../database/prisma';

export const chatbotController = {
  handleChat: async (req: Request, res: Response) => {
    try {
      const { message } = req.body;
      const user = (req as any).user; // Set by auth middleware

      if (!message) {
        return res.status(400).json({ success: false, message: 'Message is required' });
      }

      if (!user || !user.id) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const response = await chatbotService.processQuery(message, user);
      
      // Save User Message
      await prisma.chatMessage.create({
        data: {
          userId: user.id,
          role: 'user',
          content: message,
        }
      });

      // Save Bot Message with Provenance
      await prisma.chatMessage.create({
        data: {
          userId: user.id,
          role: 'bot',
          content: response.reply,
          provenance: {
            generationProvenance: response.generationProvenance,
            badgeType: response.badgeType,
            sources: response.sources
          }
        }
      });
      
      res.json({
        success: true,
        reply: response.reply,
        sources: response.sources,
        badgeType: response.badgeType,
        generationProvenance: response.generationProvenance
      });

    } catch (error: any) {
      console.error('[ChatbotController] Error handling chat:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to process chat query'
      });
    }
  }
};
