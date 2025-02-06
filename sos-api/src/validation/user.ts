import Joi from 'joi';

export const userValidationSchemas = {
  registerUserValidation: Joi.object({
    select_region: Joi.string()
      .required()
      .messages({
        "string.base": "Select region must be a string.",
        "string.empty": "Select region cannot be empty.",
        "any.only": "Select region must be one of the allowed options.",
        "any.required": "Select region is required.",
      }),
    first_name: Joi.string()
      .min(2)
      .required()
      .messages({
        "string.base": "First name must be a string.",
        "string.empty": "First name cannot be empty.",
        "string.min": "First name must be at least 2 characters long.",
        "any.required": "First name is required.",
      }),
    last_name: Joi.string()
      .min(2)
      .required()
      .messages({
        "string.base": "Last name must be a string.",
        "string.empty": "Last name cannot be empty.",
        "string.min": "Last name must be at least 2 characters long.",
        "any.required": "Last name is required.",
      }),
    date_of_birth: Joi.date()
      .iso()
      .required()
      .messages({
        "date.base": "Date of birth must be a valid date.",
        "any.required": "Date of birth is required.",
      }),
    phone_number: Joi.string()
      .pattern(/^\+?[0-9]{10,15}$/)
      .required()
      .messages({
        "string.base": "Phone number must be a string.",
        "string.empty": "Phone number cannot be empty.",
        "string.pattern.base": "Phone number must be between 10 to 15 digits, and can include a leading '+'.",
        "any.required": "Phone number is required.",
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        "string.base": "Email must be a string.",
        "string.empty": "Email cannot be empty.",
        "string.email": "Please provide a valid email address.",
        "any.required": "Email is required.",
      }),
    password: Joi.string()
      .min(6)
      .required()
      .messages({
        "string.base": "Password must be a string.",
        "string.empty": "Password cannot be empty.",
        "string.min": "Password must be at least 6 characters long.",
        "any.required": "Password is required.",
      }),

  }),

  loginUser: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        "string.base": "Email must be a string.",
        "string.empty": "Email cannot be empty.",
        "string.email": "Please provide a valid email address.",
        "any.required": "Email is required.",
      }),
    password: Joi.string()
      .min(6)
      .required()
      .messages({
        "string.base": "Password must be a string.",
        "string.empty": "Password cannot be empty.",
        "string.min": "Password must be at least 6 characters long.",
        "any.required": "Password is required.",
      }),
      // otp: Joi.string().length(6).optional() 
  }),

  verifyOtp: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        "string.base": "Email must be a string.",
        "string.empty": "Email cannot be empty.",
        "string.email": "Please provide a valid email address.",
        "any.required": "Email is required.",
      }),
    otp: Joi.string()
      .length(6)
      .required()
      .messages({
        "string.base": "OTP must be a string.",
        "string.empty": "OTP cannot be empty.",
        "string.length": "OTP must be exactly 6 characters long.",
        "any.required": "OTP is required.",
      }),
  }),
};
