import express, { Request, Response, NextFunction } from 'express';
import { Client, PrivateKey, AccountId, AccountBalanceQuery } from "@hashgraph/sdk";
import { createTopic, submitMessage } from './hcs/hcsService';

const router = express.Router();

// POST /api/verify
// Verifies Hedera credentials
router.post('/verify', async (req: Request, res: Response) => {
    try {
        console.log("Received /api/verify request");
        const { accountId, privateKey } = req.body;
        console.log("Payload:", { accountId, hasKey: !!privateKey });

        if (!accountId || !privateKey) {
            console.log("Missing credentials");
            res.status(400).json({ error: "Missing Account ID or Private Key" });
            return;
        }

        console.log("Initializing Client...");
        const client = Client.forTestnet();
        client.setOperator(AccountId.fromString(accountId), PrivateKey.fromString(privateKey));

        console.log("Querying balance...");
        const balance = await new AccountBalanceQuery()
            .setAccountId(AccountId.fromString(accountId))
            .execute(client);

        console.log("Balance received:", balance.hbars.toString());

        res.json({ success: true, balance: balance.hbars.toString() });
    } catch (error: any) {
        console.error("Verification failed:", error.message);
        res.status(401).json({ success: false, error: error.message || "Invalid Credentials" });
    }
});

// In-memory store for demo purposes
let topicId: string | null = process.env.TOPIC_ID || null;

// Middleware to ensure a topic exists
async function ensureTopic(req: Request, res: Response, next: NextFunction) {
    if (!topicId) {
        try {
            console.log('Creating new HCS Topic...');
            topicId = await createTopic();
            console.log('Topic created:', topicId);
        } catch (error: any) {
            console.error('Failed to create topic:', error);
            const msg = error.message.includes('HEDERA_ACCOUNT_ID')
                ? "Server Missing Credentials: The server needs its own Account ID/Key in .env to create HCS Topics (which costs HBAR). Please configure .env."
                : 'Failed to initialize HCS topic';
            res.status(500).json({ error: msg });
            return;
        }
    }
    next();
}

// Middleware to check for access token
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        res.status(401).json({ error: "Unauthorized: Missing Access Token. Please 'Pay & Unlock' first." });
        return;
    }

    if (token !== 'valid-token-123') { // Simple demo validation
        res.status(403).json({ error: "Forbidden: Invalid Access Token" });
        return;
    }

    next();
};

// POST /api/event
router.post('/event', authenticateToken, ensureTopic, async (req: Request, res: Response) => {
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
