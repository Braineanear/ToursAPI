import tokenTypes from '../config/tokens';
import { tokens } from '../middlewares';
import { Token, User } from '../models';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import {
  sendAfterResetPasswordMessage,
  sendResetPasswordEmail,
  sendVerificationEmail
} from '../utils/sendEmail';

const {
  verifyToken,
  generateAuthTokens,
  generateVerifyEmailToken,
  generateResetPasswordToken
} = tokens;

const createSendToken = catchAsync(async (user, statusCode, res) => {
  const authTokens = await generateAuthTokens(user._id);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    tokens: authTokens,
    user
  });
});

// @desc      Signup user
// @route     POST /users/register
// @access    Public
export const register = catchAsync(async (req, res, next) => {
  const { email, role } = req.body;

  if (!['user', 'publisher'].includes(role)) {
    return next(
      new AppError(
        'You cannot use this role, please choose another role [user, publisher]!',
        400
      )
    );
  }

  const isEmailTaken = await User.isEmailTaken(email);

  if (isEmailTaken) {
    return next(new AppError('Email already exist.', 409));
  }

  const user = await User.create(req.body);

  const confirmEmailToken = await generateVerifyEmailToken(user);

  await sendVerificationEmail(user.email, confirmEmailToken);

  createSendToken(user, 201, res);
});

// @desc      Login User Controller
// @route     POST /users/login
// @access    Public
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new AppError('Incorrect email or password', 401));
  }

  const isMatch = await user.isPasswordMatch(password);

  if (!isMatch) {
    return next(new AppError('Incorrect email or password', 401));
  }

  createSendToken(user, 200, res);
});

// @desc      Logout User Controller
// @route     POST /users/logout
// @access    Private/Current User
export const logout = catchAsync(async (req, res, next) => {
  const refreshTokenDoc = await Token.findOneAndDelete({
    token: req.body.refreshToken,
    type: tokenTypes.REFRESH
  });

  if (!refreshTokenDoc) {
    return next(new AppError('Please login again!', 401));
  }

  res.status(200).json({
    status: 'success',
    message: 'You have been successfully logged out!'
  });
});

// @desc      Generate Tokens(access/refresh) Controller
// @route     POST /users/tokens
// @access    Public
export const generateTokens = catchAsync(async (req, res, next) => {
  const refreshTokenDoc = await verifyToken(
    req.body.refreshToken,
    tokenTypes.REFRESH
  );

  if (!refreshTokenDoc) {
    return next(new AppError('No token found.', 404));
  }

  const user = await User.findById(refreshTokenDoc.user);

  if (!user) {
    return next(new AppError('No user found.', 404));
  }

  const authTokens = await generateAuthTokens(user);

  res.status(200).json({
    status: 'success',
    message: 'Tokens have been successfully generated.',
    tokens: authTokens
  });
});

// @desc      Forgot Password Controller
// @route     POST /users/forgot-password
// @access    Public
export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError('There is no user with email address', 404));
  }

  const resetPasswordToken = await generateResetPasswordToken(user.id);

  await sendResetPasswordEmail(email, resetPasswordToken);

  res.status(200).json({
    status: 'success',
    message: 'Reset password link sent to you email.'
  });
});

// @desc      Reset Password Controller
// @route     PATCH /users/reset-password/:token
// @access    Public
export const resetPassword = catchAsync(async (req, res, next) => {
  const { password, passwordConfirmation } = req.body;
  const { token: resetPasswordToken } = req.query;

  if (password !== passwordConfirmation) {
    return next(
      new AppError("Password and password confirmation doesn't match.", 400)
    );
  }

  const resetPasswordTokenDocument = await verifyToken(
    resetPasswordToken,
    tokenTypes.RESET_PASSWORD
  );

  if (!resetPasswordTokenDocument) {
    return next(new AppError('Invalid link or expired.', 400));
  }

  const user = await User.findById(resetPasswordTokenDocument.user);

  if (!user) {
    return next(new AppError('No user found.', 404));
  }

  user.password = password;
  user.passwordConfirmation = passwordConfirmation;

  await user.save();

  await sendAfterResetPasswordMessage(user.email);

  await Token.findByIdAndDelete(user.id, {
    type: tokenTypes.RESET_PASSWORD
  });

  res.status(200).json({
    type: 'Success',
    message: 'Password changed successfully'
  });
});

// @desc    Confirm Email Controller
// @route   POST /users/confirm-email
// @access  Public
export const verifyEmail = catchAsync(async (req, res, next) => {
  const { token: verifyEmailToken } = req.query;

  const verifyEmailTokenDocument = await verifyToken(
    verifyEmailToken,
    tokenTypes.VERIFY_EMAIL
  );

  if (!verifyEmailTokenDocument) {
    return next(new AppError('Invalid Token', 400));
  }
  const user = await User.findById(verifyEmailTokenDocument.user);

  if (!user) {
    return next(new AppError('No user found.', 404));
  }

  const { id: userId } = user;

  await Token.findByIdAndDelete(userId, { type: tokenTypes.VERIFY_EMAIL });

  await User.findByIdAndUpdate(userId, { isEmailVerified: true });

  res.status(200).json({
    type: 'Success',
    message: 'Email verified successfully'
  });
});
