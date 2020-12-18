const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

// @desc      Delete One Document
// @route     Delete (General Route)
// @access    Private
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No document Found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: {}
    });
  });

// @desc      Update One Document
// @route     PATCH (General Route)
// @access    Private
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!doc) {
      return next(new AppError('No document Found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: doc
    });
  });

// @desc      Create New Document
// @route     POST (General Route)
// @access    Private
exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: doc
    });
  });

// @desc      Get One Document
// @route     GET (General Route)
// @access    Private
exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document Found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: doc
    });
  });

// @desc      Get All Documents
// @route     GET (General Route)
// @access    Private / Public
exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    //To Allow for nested GET reviews on tour (hack)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    //Execute the query
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query;
    // const doc = await features.query.explain();

    //Sending Response
    res.status(200).json({
      status: 'success',
      requestTime: req.requestTime,
      reults: doc.length,
      data: doc
    });
  });
