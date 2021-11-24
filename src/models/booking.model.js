import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour',
      required: [true, 'Booking must belong to a Tour!']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Booking must belong to a User!']
    },
    price: {
      type: Number,
      require: [true, 'Booking must have a price.']
    },
    paid: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({
    path: 'tour',
    select: 'name'
  });
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
