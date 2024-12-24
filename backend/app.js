import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './db/db.js';
import userRouter from './routes/user.routes.js';

connectDB();

const app = express();

app.use(cors());
app.use(morgan('dev')); // to log the routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/user', userRouter);
app.get('/', (req, res) => {
  res.send('Hello World!');
});

export default app;
