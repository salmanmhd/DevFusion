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

router.get('/all', authUser, projectController.getAllProject);

router.put(
  '/add-user',
  authUser,
  body('projectId').isString().withMessage('ProjectId is required'),
  body('users')
    .isArray({ min: 1 })
    .withMessage('User must be an array of strings')
    .bail()
    .custom((users) => users.every((user) => typeof user === 'string'))
    .withMessage('each user must be string'),
  projectController.addUserToProject
);

router.get(
  '/get-projects/:projectId',
  authUser,
  projectController.getProjectById
);

export default router;
