import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minLength: [6, 'Email is too short, must be at least 6 characters'],
    maxLength: [50, 'Email is too long, must be at most 50 characters'],
  },
  password: {
    type: String,
    select: false,
    required: true,
    minLength: [3, 'Password is too short, must be at least 3 characters'],
    maxLength: [100, 'Password is too long, must be at most 100 characters'],
  },
});

userSchema.statics.hashPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};

userSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateJWT = function () {
  return jwt.sign({ email: this.email }, process.env.JWT_SECRET);
};

const User = mongoose.model('User', userSchema);
export default User;
