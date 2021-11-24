import { Tour } from '../models';
import APIFeatures from '../utils/apiFeatures';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import { deleteDirectory, deleteObject, uploadObject } from '../utils/s3';

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
  const tour = await Tour.create(req.body);

  return res.status(201).json({
    status: 'success',
    message: 'Tour created successfully.',
    tour
  });
});

// @desc      Upload Tour Image Cover Controller
// @route     POST /tours/:id/image-cover
// @access    Private/Admin/Lead Guide
export const uploadTourImageCover = catchAsync(async (req, res, next) => {
  const { id: tourId } = req.params;

  let tour = await Tour.findById(tourId);

  if (!tour) {
    return next(new AppError('No tour found', 404));
  }

  if (tour.imageCover) {
    return next(
      new AppError('Please use endpoint [PATCH] /tours/:id/image-cover', 401)
    );
  }

  const coverImageName = req.file.originalname.split(' ').join('-');
  const coverImagePath = `Tours/${tourId}/${coverImageName}`;

  const result = await uploadObject(coverImagePath, req.file.buffer);

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

// @desc      Update Tour Image Cover Controller
// @route     PATCH /tours/:id/image-cover
// @access    Private/Admin/Lead Guide
export const updateTourImageCover = catchAsync(async (req, res, next) => {
  const { id: tourId } = req.params;

  let tour = await Tour.findById(tourId);

  if (!tour) {
    return next(new AppError('No tour found', 404));
  }

  if (tour.imageCover) {
    await deleteObject(tour.imageCoverKey);
  }

  const coverImageName = req.file.originalname.split(' ').join('-');
  const coverImagePath = `Tours/${tourId}/${coverImageName}`;

  const result = await uploadObject(coverImagePath, req.file.buffer);

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
    message: 'Image cover updated successfully.',
    tour
  });
});

// @desc      Upload Tour Images Controller
// @route     POST /tours/:id/images
// @access    Private/Admin/Lead Guide
export const uploadTourImages = catchAsync(async (req, res, next) => {
  const { id: tourId } = req.params;

  let tour = await Tour.findById(tourId);

  if (!tour) {
    return next(new AppError('No tour found', 404));
  }

  if (tour.images.length > 0) {
    return next(
      new AppError('Please use endpoint [PATCH] tours/:id/images', 401)
    );
  }

  const images = req.files.filter((file) => file.fieldname === 'images');

  const promises = images.map((image) => {
    const imageName = image.originalname.split(' ').join('-');
    const imagePath = `Tours/${tourId}/${imageName}`;
    return uploadObject(imagePath, image.buffer);
  });

  const results = await Promise.all(promises);

  const imagesResults = [];
  const keysResults = [];

  for (const result of results) {
    imagesResults.push(result.Location);
    keysResults.push(result.Key);
  }

  tour.images = imagesResults;
  tour.imagesKey = keysResults;

  await tour.save();

  return res.status(200).json({
    status: 'success',
    message: 'Tour images uploaded successfully.',
    tour
  });
});

// @desc      Add Image to Tour Images Controller
// @route     PATCH /tours/:id/images
// @access    Private/Admin/Lead Guide
export const addImageTourImages = catchAsync(async (req, res, next) => {
  const { id: tourId } = req.params;

  let tour = await Tour.findById(tourId);

  if (!tour) {
    return next(new AppError('No tour found', 404));
  }

  const images = req.files.filter((file) => file.fieldname === 'images');

  const promises = images.map((image) => {
    const imageName = image.originalname.replace(/[^\d.A-Za-z]/g, '');
    const imagePath = `Tours/${tourId}/${imageName}`;
    return uploadObject(imagePath, image.buffer);
  });

  const results = await Promise.all(promises);

  for (const result of results) {
    tour.images.push(result.Location);
    tour.imagesKey.push(result.Key);
  }

  await tour.save();

  return res.status(200).json({
    status: 'success',
    message: 'Tour image added successfully.',
    tour
  });
});

// @desc      Delete Image Fro Tour Images Controller
// @route     DELETE /tours/:id/images
// @access    Private/Admin/Lead Guide
export const deleteImageFromTourImages = catchAsync(async (req, res, next) => {
  const { id: tourId } = req.params;
  const { imageKey } = req.body;

  let tour = await Tour.findById(tourId);

  if (!tour) {
    return next(new AppError('No tour found', 404));
  }

  await deleteObject(imageKey);

  tour.images = tour.images.filter((image) => !image.includes(imageKey));

  tour.imagesKey = tour.imagesKey.filter((key) => key !== imageKey);

  await tour.save();

  return res.status(200).json({
    status: 'success',
    message: 'Tour image deleted successfully.',
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

  await deleteDirectory(`Tours/${tourId}/`);

  await tour.remove();

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
  const multiplier = unit === 'mi' ? 0.000_621_371 : 0.001;

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
