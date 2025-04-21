
import express from 'express';
import dotenv from 'dotenv';
import { dbConnect } from './dbconnect.js';
import authRouter from './authRoute.js';
import { errorHandler, notFound } from './errorHandler.js';
import productRouter from './routes/productRoute.js';
import categoryRouter from './routes/categoryRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', orderRouter);

// Error Handling
app.use(notFound);
app.use(errorHandler);

// Connect to Database and Start Server
dbConnect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server is running at http://0.0.0.0:${PORT}`);
    });
  })
  .catch(err => {
    console.log(`❌ MongoDB Connection Error: ${err.message}`);
  });
