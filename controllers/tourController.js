const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

// @desc    Upload Tour Photo
// @route   PATCH /api/v1/tours/:id/photo
// @access  Private/Current User
exports.uploadTourImages = catchAsync(async (req, res, next) => {
  // 1) Get tour from database
  const tour = await Tour.findById(req.params.id).lean();

  // 2) Check if user exist
  if (!tour) {
    return next(new AppError(`No tour found with id ${req.params.id}`, 404));
  }

  // 3) Upload photo
  const multerStorage = multer.diskStorage({
    destination: (request, file, cb) => {
      cb(null, process.env.FILE_UPLOAD_PATH_TOUR);
    },
    filename: (request, file, cb) => {
      //user-id-currentsTimeTemp.jpeg
      const ext = file.mimetype.split('/')[1];

      cb(null, `tour-${request.params.id}-${Date.now()}.${ext}`);
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
  }).fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 }
  ]);

  upload(req, res, function () {
    if (req.fileValidationError) {
      return next(
        new AppError('Not an image! Please upload only images.', 400)
      );
    }
    if (!req.files) {
      return next(new AppError('Please select an image to upload', 404));
    }

    res.status(200).json({
      status: 'success',
      link: req.files.path
    });
  });
});

// @desc      Get All Tours
// @route     GET /api/v1/tours
// @access    Public
exports.getAllTours = factory.getAll(Tour);

// @desc      Get Tour
// @route     GET /api/v1/tours/:id
// @access    Public
exports.getTour = factory.getOne(Tour, { path: 'reviews' });

// @desc      Create Tour
// @route     POST /api/v1/tours
// @access    Private/Admin/Lead Guide
exports.createTour = factory.createOne(Tour);

// @desc      Update Tour
// @route     PATCH /api/v1/tours
// @access    Private/Admin/Lead Guide
exports.updateTour = factory.updateOne(Tour);

// @desc      Delete Tour
// @route     DELETE /api/v1/tours
// @access    Private/Admin/Lead Guide
exports.deleteTour = factory.deleteOne(Tour);

// @desc      Get Top 5 Cheap Tours
// @route     GET /api/v1/top-5-cheap
// @access    Public
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// @desc      Get Tour Statistics
// @route     GET /api/v1/tour-stats
// @access    Public
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    },
    {
      $match: { _id: { $ne: 'EASY' } }
    }
  ]);
  res.status(200).json({
    status: 'success',
    data: stats
  });
});

// @desc      Get Monthly Plan
// @route     GET /api/v1/monthly-plan/:year
// @access    Public
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: { _id: 0 }
    },
    {
      $sort: { numTourStarts: -1 }
    },
    {
      $limit: 12
    }
  ]);

  res.status(200).json({
    status: 'success',
    results: plan.length,
    data: plan
  });
});

// /tours-within?distance=233&center=-40,45&unit=mi
// /tours-within/233/center/34.111745,-118.113491/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat, lng.',
        400
      )
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: tours
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat, lng.',
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: distances
  });
});
