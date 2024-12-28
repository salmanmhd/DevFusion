import mongoose from 'mongoose';
import projectModel from '../models/project.model.js';
export const createProject = async ({ name, userId }) => {
  if (!name) {
    throw new Error('Name is required to create project');
  }

  if (!userId) {
    throw new Error('userId is required to create project');
  }

  let project;
  try {
    project = await projectModel.create({
      name,
      users: [userId],
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new Error('Project already exists');
    }
    throw error;
  }

  return project;
};

export const getAllProjectByUserId = async ({ userId }) => {
  if (!userId) {
    throw new Error('UserId is required');
  }

  try {
    const allUserProjects = await projectModel.find({
      users: userId,
    });
    return allUserProjects;
  } catch (error) {
    throw new Error('fetching project failed', error.message);
  }
};

export const addUserToProject = async ({ projectId, users, userId }) => {
  if (!projectId) {
    throw new Error('projectId is required to add user to project');
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error('Invalid project id');
  }

  if (!userId) {
    throw new Error('userId is required to add user to the project');
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('userId is not valid');
  }

  if (!users) {
    throw new Error('users are required to add user to project');
  }

  if (
    !Array.isArray(users) ||
    users.some((userId) => !mongoose.Types.ObjectId.isValid(userId))
  ) {
    throw new Error('Invalid userId(s) in users array');
  }

  const project = await projectModel.findOne({
    _id: projectId,
    users: { $in: [userId] },
  });

  if (!project) {
    throw new Error(
      'user does not belong to this project, unauthorized access!'
    );
  }

  try {
    const updatedProject = await projectModel.findOneAndUpdate(
      {
        _id: projectId,
      },
      {
        $addToSet: {
          users: {
            $each: users,
          },
        },
      },
      { new: true }
    );
    return updatedProject;
  } catch (error) {
    throw new Error(
      'something went wrong while adding users to the projects. Error: ',
      error.message
    );
  }
};
