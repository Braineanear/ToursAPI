// Packages
import jwt from 'jsonwebtoken';
import { promisify } from 'node:util';

// Configs
import config from '../config/config';
// Models
import { User } from '../models';
import AppError from '../utils/appError';
// Utils
import catchAsync from '../utils/catchAsync';

// @desc      Only signed in users can access the route
// @route     No Route
// @access    No Access
const protect = catchAsync(async (req, res, next) => {
  // 1) Getting the token and check if it's there
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(
      new AppError('You are not logged in! Please login to get access.', 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, config.jwt.secret);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.sub);

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

  next();
});

export default protect;
