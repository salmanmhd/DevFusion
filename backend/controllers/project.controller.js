import { validationResult } from 'express-validator';
// import projectModel from '../models/project.model.js';
import * as projectService from '../services/project.service.js';
import User from '../models/user.model.js';

export const createProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  try {
    const { name } = req.body;
    const loggedinUser = await User.findOne({ email: req.user.email });
    console.log(loggedinUser, 'email: ', req.user.email);
    const userId = loggedinUser._id;

    const newProject = await projectService.createProject({
      name,
      userId,
    });

    res.status(201).json(newProject);
  } catch (error) {
    res.status(400).json({
      msg: 'something went wrong while creating project',
      error: error.message,
    });
  }
};
