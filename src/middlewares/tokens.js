import jwt from 'jsonwebtoken';
import moment from 'moment';

import config from '../config/config';
import tokenTypes from '../config/tokens';
import { Token } from '../models';
import catchAsync from '../utils/catchAsync';

/**
 * Generate token
 * @param   { ObjectId }  userId
 * @param   { Date }      expires
 * @param   { String }    type
 * @returns { String }
 */
export const generateToken = (
  userId,
  expires,
  type,
  secret = config.jwt.secret
) => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type
  };
  return jwt.sign(payload, secret);
};

/**
 * Save a token
 * @param   { String }    token
 * @param   { ObjectId }  userId
 * @param   { Date }      expires
 * @param   { String }    type
 * @returns { Promise <Token> }
 */
export const saveToken = catchAsync(
  async (token, userId, expires, type) =>
    await Token.create({
      token,
      user: userId,
      expires: expires.toDate(),
      type
    })
);

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param   { String } token
 * @param   { String } type
 * @returns { Promise <Token> }
 */
export const verifyToken = catchAsync(async (token, type) => {
  const payload = jwt.verify(token, config.jwt.secret);

  const tokenDoc = await Token.findOne({
    token,
    type,
    user: payload.sub
  });

  if (!tokenDoc) {
    return {
      type: 'Error',
      statusCode: 404,
      message: 'Token not found.'
    };
  }

  return tokenDoc;
});

/**
 * Generate auth tokens
 * @param   { String } id
 * @returns { Promise <Tokens> }
 */
export const generateAuthTokens = catchAsync(async (id) => {
  const accessTokenExpires = moment().add(
    config.jwt.accessToken.expire,
    'minutes'
  );

  const accessToken = generateToken(id, accessTokenExpires, tokenTypes.ACCESS);

  const refreshTokenExpires = moment().add(
    config.jwt.refreshToken.expire,
    'days'
  );

  const refreshToken = generateToken(
    id,
    refreshTokenExpires,
    tokenTypes.REFRESH
  );

  await saveToken(refreshToken, id, refreshTokenExpires, tokenTypes.REFRESH);

  return {
    accessToken,
    refreshToken
  };
});

/**
 * Generate reset password token
 * @param   { String } email
 * @param   { String } id
 * @returns { Promise <Token> }
 */
export const generateResetPasswordToken = catchAsync(async (id) => {
  const expires = moment().add(config.jwt.resetPasswordToken.expire, 'minutes');

  const resetPasswordToken = generateToken(
    id,
    expires,
    tokenTypes.RESET_PASSWORD
  );

  await saveToken(resetPasswordToken, id, expires, tokenTypes.RESET_PASSWORD);

  return resetPasswordToken;
});

/**
 * Generate verify email token
 * @param   { Object } user
 * @returns { Promise <Token> }
 */
export const generateVerifyEmailToken = catchAsync(async (id) => {
  const expires = moment().add(config.jwt.verifyEmailToken.expire, 'minutes');

  const verifyEmailToken = generateToken(id, expires, tokenTypes.VERIFY_EMAIL);

  await saveToken(verifyEmailToken, id, expires, tokenTypes.VERIFY_EMAIL);

  return verifyEmailToken;
});
