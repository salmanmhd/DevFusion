import { Router } from 'express';
import { authUser } from '../middleware/auth.middleware.js';
import * as projectController from '../controllers/project.controller.js';
import { body } from 'express-validator';

const router = Router();

router.post(
  '/create',
  authUser,
  body('name').isString().withMessage('Name is required'),
  projectController.createProject
);

export default router;
