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
