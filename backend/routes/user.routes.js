import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import * as authMiddleware from '../middleware/auth.middleware.js';
import { body } from 'express-validator';
const router = Router();

router.post(
  '/register',
  body('email').isEmail().withMessage('Email must be a valid email address'),
  body('password')
    .isLength({ min: 3 })
    .withMessage('password must be at least 3 letters long'),
  userController.createUserController
);

router.post(
  '/login',
  body('email').isEmail().withMessage('Email must be a valid email address'),
  body('password')
    .isLength({ min: 3 })
    .withMessage('password must be at least 3 letters long'),
  userController.loginController
);

router.get(
  '/profile',
  authMiddleware.authUser,
  userController.profileController
);

router.post(
  '/logout',
  authMiddleware.authUser,
  userController.logoutController
);

export default router;
