import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import APIFeatures from '../utils/apiFeatures';

import { User } from '../models';

/**
 * @desc      Create User Controller
 * @route     CREATE /users/
 * @access    Private
 */
export const createUser = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirmation, role } = req.body;

  if (!name || !email || !password || !passwordConfirmation || !role) {
    return next(new AppError('All fields are required'), 400);
  }

  const isEmailTaken = await User.isEmailTaken(email);

  if (isEmailTaken) {
    return new AppError('Email is already taken, please try another one.');
  }

  const user = await User.create({
    name,
    email,
    password,
    passwordConfirmation,
    role,
    isEmailVerified: true
  });

  return res.status(200).json({
    status: 'success',
    message: 'Account created successfully.',
    user
  });
});

/**
 * @desc      Get All Users Controller
 * @route     GET /users/
 * @access    Public
 */
export const getAllUsers = catchAsync(async (req, res, next) => {
  let { page, sort, limit, select } = req.query;

  if (!page) req.query.page = 1;
  if (!sort) req.query.sort = '';
  if (!limit) req.query.limit = 10;
  if (!select) req.query.select = '';

  const users = await APIFeatures(req, User);

  if (users.length === 0) {
    return next(new AppError('No users data found.', 404));
  }

  return res.status(200).json({
    status: 'success',
    message: 'Found users data successfully.',
    users
  });
});

/**
 * @desc      Get User Data Using It's ID Controller
 * @route     GET /users/:id
 * @access    Public
 */
export const getUser = catchAsync(async (req, res, next) => {
  const { id: userId } = req.params;

  const user = await User.findById(userId);

  if (!user) {
    return next(new AppError('No user data found.', 404));
  }

  return res.status(200).json({
    status: 'success',
    message: 'Found user data successfully.',
    user
  });
});

/**
 * @desc      Update User Controller
 * @route     PATCH /users/:id
 * @access    Private
 */
export const updateUser = catchAsync(async (req, res, next) => {
  const { id: userId } = req.params;

  let user = await User.findById(userId);

  if (!user) {
    return next(new AppError('No user data found.', 404));
  }

  user = await User.findByIdAndUpdate(userId, req.body, {
    new: true,
    runValidators: true
  });

  return res.status(200).json({
    status: 'success',
    message: 'User data updated successfully.',
    user
  });
});

/**
 * @desc      Delete User Controller
 * @route     DELETE /users/:id
 * @access    Private
 */
export const deleteUser = catchAsync(async (req, res, next) => {
  const { id: userId } = req.params;

  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    return next(new AppError('No user data found.', 404));
  }

  return res.status(200).json({
    status: 'success',
    message: 'User data deleted successfully.',
    user
  });
});
