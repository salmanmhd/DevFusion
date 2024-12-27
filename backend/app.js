import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './db/db.js';
import userRouter from './routes/user.routes.js';
import cookieParser from 'cookie-parser';
import projectRouter from './routes/project.routes.js';

connectDB();

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(morgan('dev')); // to log the routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/user', userRouter);
app.use('/projects', projectRouter);
app.get('/', (req, res) => {
  res.send('Hello World!');
});

export default app;
