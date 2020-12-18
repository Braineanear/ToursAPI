const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/sendEmail');

// Generate Token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Get token, create cookie and send response
const createSendToken = (user, statusCode, res) => {
  // 1) Create token
  const token = signToken(user._id);

  // 2) Set the httpOnly cookie Options
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    secure: false,
    httpOnly: true // Cookie cannot be accessed or modified in any way by the browser
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  // 3) Remove the password from the output
  user.password = undefined;

  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: user
  });
};

// @desc      Signup user
// @route     POST /api/v1/users/signup
// @access    Public
exports.signup = catchAsync(async (req, res, next) => {
  // 1) Create user
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt
  });
  // 2) Grab token and send to email
  const confirmEmailToken = user.generateEmailConfirmToken();

  // 3) Create reset url
  const confirmEmailURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/confirmEmail?token=${confirmEmailToken}`;

  const message = `You are receiving this email because you need to confirm your email address. Please make a GET request to: \n\n ${confirmEmailURL}`;

  user.save({ validateBeforeSave: false });

  await sendEmail({
    email: user.email,
    subject: 'Email confirmation token',
    messege: message
  });

  // 4) If everything ok, send token to client
  createSendToken(user, 201, res);
});

// @desc      Signin user
// @route     POST /api/v1/users/signin
// @access    Public
exports.signin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new AppError('Incorrect email or password', 401));
  }
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, res);
});

// @desc      Log user out / clear cookie
// @route     GET /api/v1/users/logout
// @access    Private/Current User
exports.logout = catchAsync(async (req, res, next) => {
  res.cookie('jwt', '', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({
    status: 'success',
    messege: 'You have been successfully logged out!'
  });
});

// @desc      Only signed in users can access the route
// @route     No Route
// @access    No Access
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting the token and check if it's there
  let token = '';

  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please login to get access.', 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please login again!', 401)
    );
  }

  //GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// @desc      Specify who can access the route (user / admin / publisher)
// @route     No Route
// @access    No Access
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

// @desc      Forgot password
// @route     POST /api/v1/users/forgotpassword
// @access    Public
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user with email address', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  // 3) Create reset url
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const messege = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forgot your password, please ignore this email!`;

  // 4) Send reset url to user's email
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      messege
    });

    res.status(200).json({
      status: 'success',
      messege: 'Token sent to the email!'
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
});

// @desc      Reset password
// @route     PATCH /api/v1/users/resetpassword/:resettoken
// @access    Public
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get hashed token
  const hasedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hasedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // 3) If everything ok, send token to client
  createSendToken(user, 200, res);
});

// @desc      Update password
// @route     PATCH /api/v1/users/updatepassword
// @access    Private/Current User
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed password is correct
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new AppError('Your current password is wrong', 401));
  }

  // 3) If so, update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) If everything ok, send token to client
  createSendToken(user, 200, res);
});

// @desc    Confirm Email
// @route   GET /api/v1/users/confirmemail
// @access  Public
exports.confirmEmail = catchAsync(async (req, res, next) => {
  // 1) Grab token from email
  const { token } = req.query;

  if (!token) {
    return next(new AppError('Invalid Token', 400));
  }

  const splitToken = token.split('.')[0];
  const confirmEmailToken = crypto
    .createHash('sha256')
    .update(splitToken)
    .digest('hex');

  // 2) Get user by token
  const user = await User.findOne({
    confirmEmailToken,
    isEmailConfirmed: false
  });

  if (!user) {
    return next(new AppError('Invalid Token', 400));
  }

  // 3) Update confirmed to true
  user.confirmEmailToken = undefined;
  user.isEmailConfirmed = true;

  // 4) Save
  await user.save({ validateBeforeSave: false });

  // 5) eturn token
  createSendToken(user, 200, res);
});
