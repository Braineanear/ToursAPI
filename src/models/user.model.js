import { hash, verify } from 'argon2';
import crypto from 'crypto';
import mongoose from 'mongoose';
import validator from 'validator';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please tell us your name!']
    },
    email: {
      type: String,
      required: [true, 'Please provide your email!'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email']
    },
    profileImage: {
      type: String,
      default:
        'https://tours-api-1.s3.eu-central-1.amazonaws.com/profile-image.png'
    },
    profileImageKey: {
      type: String,
      default: 'profile-image.png'
    },
    role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user'
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false
    },
    passwordConfirmation: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        // This only works with CREATE & SAVE!!!!!
        validator: function (el) {
          return el === this.password;
        },
        messege: 'Passwords are not the same'
      }
    },
    passwordChangedAt: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    confirmEmailToken: String,
    isEmailConfirmed: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email) {
  const user = await this.findOne({ email });
  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
  return await verify(this.password, password);
};

// Encrypt Password Using Argon2
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = crypto.randomBytes(32);
  this.password = await hash(this.password, { salt });

  this.passwordConfirmation = undefined;
  next();
});

// Set passwordChangedAt field to the current time when the user change the password
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Check if user changed password after the token was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

/**
 * @typedef User
 */
const User = mongoose.model('User', userSchema);

export default User;
