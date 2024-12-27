import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import redisClient from '../services/redis.service.js';
dotenv.config();

export const authUser = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization.split(' ')[1];
    console.log(token);
    if (!token) {
      return res.status(401).json({
        msg: 'Unauthorized User, no token found',
      });
    }

    const isBlacklisted = await redisClient.get(token);
    if (isBlacklisted) {
      res.cookie('token', '');
      return res.status(401).json({
        msg: 'Unauthorized User, token expired',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      msg: 'Unauthorized User',
      error: error.message,
    });
  }
};
