import User from '../models/user.model.js';
import userModel from '../models/user.model.js';

export const createUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const hashedPassword = await userModel.hashPassword(password);

  const user = await userModel.create({
    email,
    password: hashedPassword,
  });
  return user;
};

export const getAllUsers = async ({ userId }) => {
  try {
    const users = await User.find({
      _id: { $ne: userId },
    });
    return users;
  } catch (error) {
    throw new Error(
      'something went wrong while fetching users. Error: ',
      error.message
    );
  }
};
