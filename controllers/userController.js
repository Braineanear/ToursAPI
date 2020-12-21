const multer = require('multer');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

// @desc    Upload User Photo
// @route   PATCH /api/v1/user/:id/photo
// @access  Private/Current User
exports.uploadUserPhoto = catchAsync(async (req, res, next) => {
  // 1) Get user from database
  const user = await User.findById(req.user.id).lean();

  // 2) Check if user exist
  if (!user) {
    return next(new AppError(`No user found with id ${req.user.id}`, 404));
  }

  // 3) Upload photo
  const multerStorage = multer.diskStorage({
    destination: (request, file, cb) => {
      cb(null, process.env.FILE_UPLOAD_PATH_USER);
    },
    filename: (request, file, cb) => {
      //user-id-currentsTimeTemp.jpeg
      const ext = file.mimetype.split('/')[1];

      cb(null, `user-${request.user.id}-${Date.now()}.${ext}`);
    }
  });

  const multerFilter = (request, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
      request.fileValidationError = 'Only image files are allowed!';
      return cb(
        new AppError('Not an image! Please upload only images.'),
        false
      );
    }

    cb(null, true);
  };

  const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits: { fileSize: process.env.MAX_FILE_UPLOAD }
  }).single('photo');

  upload(req, res, function () {
    if (req.fileValidationError) {
      return next(
        new AppError('Not an image! Please upload only images.', 400)
      );
    }
    if (!req.file) {
      return next(new AppError('Please select an image to upload', 404));
    }

    res.status(200).json({
      status: 'success',
      link: req.file.path
    });
  });
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// @desc      Get current logged in user
// @route     GET /api/v1/users/me
// @access    Private/Current User
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// @desc      Update user details
// @route     PATCH /api/v1/users/updatedetails
// @access    Private/Current User
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates, please use /updateMyPassword',
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

// @desc      Delete current logged in user data
// @route     DELETE /api/v1/users/deleteMe
// @access    Private/Current User
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.deleteOne({ _id: req.user.id });

  res.status(204).json({
    status: 'success',
    data: {}
  });
});

// @desc      Get all users
// @route     GET /api/v1/users
// @access    Private/Admin
exports.getAllUsers = factory.getAll(User);

// @desc      Get single user
// @route     GET /api/v1/users/:id
// @access    Private/Admin
exports.getUser = factory.getOne(User);

// @desc      Create user
// @route     POST /api/v1/users
// @access    Private/Admin
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    messege: 'This route is not defined! Please use /signup instead'
  });
};

// @desc      Update user
// @route     PUT /api/v1/users/:id
// @access    Private/Admin
exports.updateUser = factory.updateOne(User);

// @desc      Delete user
// @route     DELETE /api/v1/users/:id
// @access    Private/Admin
exports.deleteUser = factory.deleteOne(User);
