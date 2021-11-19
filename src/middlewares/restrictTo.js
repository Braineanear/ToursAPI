// Utils
import AppError from '../utils/appError';

// @desc      Specify who can access the route (user / admin / publisher)
// @route     No Route
// @access    No Access
const restrictedTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };

export default restrictedTo;
