import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import uniqueId from '../utils/uniqueId';
import { uploadObject, deleteObject, deleteDirectory } from '../utils/s3';

import { User } from '../models/index';

/**
 * @desc      Get Logged in User Data Controller
 * @route     GET /profile/
 * @access    Private
 */
export const getMyData = catchAsync(async (req, res, next) =>
  res.status(200).json({
    status: 'success',
    message: 'Account data found successfully.',
    user: req.user
  })
);

/**
 * @desc      Update Logged in User Data Controller
 * @route     PATCH /profile/
 * @access    Private
 */
export const updateMyData = catchAsync(async (req, res, next) => {
  const { id: userId } = req.user;
  const { password, passwordConfirmation, email } = req.body;

  if (password || passwordConfirmation) {
    return next(
      new AppError(
        'Cannot update password from here, please go to update password route.',
        400
      )
    );
  }

  if (email) {
    const isEmailTaken = await User.isEmailTaken(email, userId);

    if (isEmailTaken) {
      return next(
        new AppError('Email already taken, please try another one.', 409)
      );
    }
  }

  const user = await User.findByIdAndUpdate(userId, req.body, {
    new: true,
    runValidators: true
  });

  return res.status(200).json({
    status: 'success',
    message: 'Data updated successfully.',
    user
  });
});

/**
 * @desc      Change Password Controller
 * @route     POST  /profile/change-password
 * @access    Private
 */
export const changeMyPassword = catchAsync(async (req, res, next) => {
  const { currentPassword, password, passwordConfirmation } = req.body;
  const { id: userId } = req.user;

  if (password !== passwordConfirmation) {
    return next(
      new AppError('Password and password confirmation must be the same.', 401)
    );
  }

  const user = await User.findById(userId).select('+password');

  const isMatch = await user.isPasswordMatch(currentPassword);

  if (!isMatch) {
    return next(
      new AppError(
        'This is not your password. Please enter the correct current password.',
        401
      )
    );
  }

  user.password = password;
  user.passwordConfirmation = passwordConfirmation;

  await user.save();

  return res.status(200).json({
    status: 'success',
    message: 'Password changed successfully.'
  });
});

/**
 * @desc      Upload Logged in Profile Image Controller
 * @route     PATCH /profile/profile-image
 * @access    Private
 */
export const updateMyProfileImage = catchAsync(async (req, res, next) => {
  const { id: userId, profileImageKey } = req.user;
  const { originalname, buffer } = req.file;
  const fileId = uniqueId();
  const imageName = originalname.split(' ').join('-');
  const imagePath = `Users/${userId}/avatar/file-${fileId}-${imageName}`;

  const result = await uploadObject(imagePath, buffer);

  await deleteObject(profileImageKey);

  const user = await User.findByIdAndUpdate(
    userId,
    {
      profileImageURL: result.Location,
      profileImageKey: result.Key
    },
    {
      new: true,
      runValidators: true
    }
  );

  return res.status(200).json({
    status: 'success',
    message: 'Profile image updated successfully.',
    user
  });
});

/**
 * @desc      Delete Logged in Account Controller
 * @route     DELETE /profile/
 * @access    Private
 */
export const deleteMyAccount = catchAsync(async (req, res) => {
  const { id: userId } = req.user;

  const user = await User.findByIdAndDelete(userId);

  await deleteDirectory(`Users/${user.id}/`);

  return res.status(200).json({
    status: 'success',
    message: 'Account deleted successfully.'
  });
});
