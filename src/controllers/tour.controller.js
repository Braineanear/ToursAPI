import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import APIFeatures from '../utils/apiFeatures';
import { uploadObject } from '../utils/s3';

import { Tour } from '../models';

// @desc      Get All Tours Controller
// @route     GET /tours
// @access    Public
export const getAllTours = catchAsync(async (req, res, next) => {
  const tours = await APIFeatures(req, Tour);

  if (tours.length === 0) {
    return next(new AppError('No tours data found.', 404));
  }

  return res.status(200).json({
    status: 'success',
    message: 'Found tours data successfully.',
    tours
  });
});

// @desc      Get Tour Using It's ID Controller
// @route     GET /tours/:id
// @access    Public
export const getTour = catchAsync(async (req, res, next) => {
  const { id: tourId } = req.params;

  const tour = await Tour.findById(tourId).populate('reviews');

  if (!tour) {
    return next(new AppError('No tour found.', 404));
  }

  return res.status(200).json({
    status: 'success',
    message: 'Found tour data successfully.',
    tour
  });
});

// @desc      Create Tour Controller
// @route     POST /tours
// @access    Private/Admin/Lead Guide
export const createTour = catchAsync(async (req, res, next) => {
  const {
    name,
    duration,
    maxGroupSize,
    difficulty,
    price,
    summary,
    guides,
    locations
  } = req.body;

  if (
    !name ||
    !duration ||
    !maxGroupSize ||
    !difficulty ||
    !price ||
    !summary ||
    !guides ||
    !locations
  ) {
    return next(new AppError('All fields are required', 400));
  }

  if (req.user.role === 'user') {
    return next(
      new AppError('You are not authorized to perform this action', 401)
    );
  }

  const tour = await Tour.create(req.body);

  return res.status(201).json({
    status: 'success',
    message: 'Tour created successfully.',
    tour
  });
});

export const uploadTourImageCover = catchAsync(async (req, res, next) => {
  const { id: tourId } = req.params;

  let tour = await Tour.findById(tourId);

  if (!tour) {
    return next(new AppError('No tour found', 404));
  }

  const coverImage = req.files.filter(
    (file) => file.fieldname === 'coverImage'
  )[0];
  const coverImageName = coverImage.originalname.split(' ').join('-');
  const coverImagePath = `Tours/${tourId}/coverImage-${coverImageName}`;

  const result = await uploadObject(coverImagePath, coverImage);

  tour = await Tour.findByIdAndUpdate(
    tourId,
    {
      imageCover: result.Location,
      imageCoverKey: result.Key
    },
    {
      new: true,
      runValidators: true
    }
  );

  return res.status(200).json({
    status: 'success',
    message: 'Image cover uploaded successfully.',
    tour
  });
});

// @desc      Update Tour Controller
// @route     PATCH /tours/:id
// @access    Private/Admin/Lead Guide
export const updateTour = catchAsync(async (req, res, next) => {
  const { id: tourId } = req.params;

  let tour = await Tour.findById(tourId);

  if (!tour) {
    return next(new AppError('No tour found', 404));
  }

  tour = await Tour.findByIdAndUpdate(tourId, req.body, {
    new: true,
    runValidators: true
  });

  return res.status(200).json({
    status: 'success',
    message: 'Tour updated successfully.',
    tour
  });
});

// @desc      Delete Tour Controller
// @route     DELETE /tours/:id
// @access    Private/Admin/Lead Guide
export const deleteTour = catchAsync(async (req, res, next) => {
  const { id: tourId } = req.params;

  const tour = await Tour.findById(tourId);

  if (!tour) {
    return next(new AppError('No tour found', 404));
  }

  await Tour.findByIdAndDelete(tourId);

  res.status(200).json({
    status: 'success',
    message: 'Tour deleted successfully.'
  });
});

// @desc      Get Top 5 Cheap Tours Controller
// @route     GET /tours/top-5-cheap
// @access    Public
export const aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// @desc      Get Tour Statistics Controller
// @route     GET /tours/tour-stats
// @access    Public
export const getTourStats = catchAsync(async (req, res, next) => {
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

// @desc      Get Monthly Plan Controller
// @route     GET /tours/monthly-plan/:year
// @access    Public
export const getMonthlyPlan = catchAsync(async (req, res, next) => {
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

  return res.status(200).json({
    status: 'success',
    results: plan.length,
    plan
  });
});

// /tours-within?distance=233&center=-40,45&unit=mi
// /tours-within/233/center/34.111745,-118.113491/unit/mi
// @desc      Get Tours Within Controller
// @route     GET /tours/tours-within/:distance/center/:lantlng/unit/:unit
// @access    Public
export const getToursWithin = catchAsync(async (req, res, next) => {
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

  return res.status(200).json({
    status: 'success',
    results: tours.length,
    tours
  });
});

// @desc      Get Distances Controller
// @route     GET /tours/tours-within/:distance/center/:lantlng/unit/:unit
// @access    Public
export const getDistances = catchAsync(async (req, res, next) => {
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

  return res.status(200).json({
    status: 'success',
    distances
  });
});
