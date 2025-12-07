import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';
import apiRoutes from './routes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API Routes
app.use('/api', apiRoutes);

// Basic root route
app.get('/', (req, res) => {
    res.send(`
        <h1>Backend Running 🚀</h1>
        <p>This is the API Server.</p>
        <p>Please access the Frontend at: <a href="http://localhost:5173">http://localhost:5173</a></p>
    `);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/pay`);
});
