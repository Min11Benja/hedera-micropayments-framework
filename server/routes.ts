import express, { Request, Response, NextFunction } from 'express';
import { createTopic, submitMessage } from './hcs/hcsService';

const router = express.Router();

// In-memory store for demo purposes
let topicId: string | null = process.env.TOPIC_ID || null;

// Middleware to ensure a topic exists
async function ensureTopic(req: Request, res: Response, next: NextFunction) {
    if (!topicId) {
        try {
            console.log('Creating new HCS Topic...');
            topicId = await createTopic();
            console.log('Topic created:', topicId);
        } catch (error) {
            console.error('Failed to create topic:', error);
            res.status(500).json({ error: 'Failed to initialize HCS topic' });
            return;
        }
    }
    next();
}

// POST /api/event
router.post('/event', ensureTopic, async (req: Request, res: Response) => {
    try {
        const { eventType, contentId, timestamp } = req.body;

        if (!eventType || !contentId) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        const message = JSON.stringify({
            type: eventType,
            contentId,
            user: 'anonymous-viewer',
            timestamp: timestamp || Date.now()
        });

        const status = await submitMessage(topicId!, message);

        res.json({
            success: true,
            status,
            topicId
        });

    } catch (error: any) {
        console.error('Error submitting event:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/pay
router.get('/pay', (req: Request, res: Response) => {
    res.status(402).json({
        error: "Payment Required",
        challenge: {
            amount: 1000000,
            currency: "HBAR",
            recipient: process.env.HEDERA_ACCOUNT_ID
        }
    });
});

// POST /api/pay
router.post('/pay', (req: Request, res: Response) => {
    const { proof } = req.body;

    if (proof === 'simulated-proof') {
        res.json({
            success: true,
            access_token: 'valid-token-123',
            message: 'Payment verified! Here is your premium content.'
        });
        return;
    }

    res.status(400).json({ error: 'Invalid payment proof' });
});

export default router;
