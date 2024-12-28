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

export const getAllProject = async (req, res) => {
  try {
    const loggedinUser = await User.findOne({ email: req.user.email });
    const allUserProjects = await projectService.getAllProjectByUserId({
      userId: loggedinUser._id,
    });
    res.status(200).json({ projects: allUserProjects });
  } catch (error) {
    console.log(error.message);
    res.status(400).josn({
      msg: 'fetching projects failed',
      error: error.message,
    });
  }
};

export const addUserToProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: errors.array,
    });
  }

  try {
    const { projectId, users } = req.body;
    const loggedinUser = await User.findOne({
      email: req.user.email,
    });
    const project = await projectService.addUserToProject({
      projectId,
      users,
      userId: loggedinUser._id,
    });
    res.status(200).json({
      msg: 'user added successfully',
      project,
    });
  } catch (error) {
    res.status(400).json({
      msg: 'something went wrong while adding user to project',
      error: error.message,
    });
  }
};

export const getProjectById = async (req, res) => {
  const { projectId } = req.params;

  try {
    const project = await projectService.getProjectById({ projectId });
    res.status(200).json({
      project,
    });
  } catch (error) {
    res.status(400).json({
      msg: 'something went wrong while fetching projects by id',
      error: error.message,
    });
  }
};
