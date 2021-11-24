export const objectId = (value, helpers) => {
  if (!/^[\dA-Fa-f]{24}$/.test(value)) {
    return helpers.message('"{{#label}}" must be a valid mongo id');
  }
  return value;
};

export const string = (value, helpers) => {
  if (typeof value !== 'string') {
    return helpers.message('"{{#label}}" must be a string');
  }
};

export const password = (value, helpers) => {
  if (value.length < 8) {
    return helpers.message('password must be at least 8 characters');
  }
  if (!/\d/.test(value) || !/[A-Za-z]/.test(value)) {
    return helpers.message(
      'password must contain at least 1 letter and 1 number'
    );
  }
  return value;
};
