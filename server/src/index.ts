import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import routes from './routes';

dotenv.config();

const app = express();

// Middleware
app.use(cors() as express.RequestHandler);
app.use(express.json());

// Database
connectDB();

// Routes
app.use('/api', routes);

app.get('/', (req, res) => {
    res.send('MediCore API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});