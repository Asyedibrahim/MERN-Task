import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import userRoutes from './routes/user.route.js';
import productRoutes from './routes/product.route.js';

dotenv.config();

const __dirname = path.resolve();

mongoose.connect(process.env.MONGO).then(() => {
    console.log("Connected to MongoDB!!");
}).catch((err) => {
    console.log(err);
});

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.use(cookieParser());

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

// app.use(express.static(path.join(__dirname, '/frontend/dist')));

// app.all('/*splat', (req, res) => {
//     res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
// });

const PORT = 4100;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}!!`);
});

// Middleware handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
    });
});