import Joi from 'joi';

export const adminLoginValidationSchema = {
  body: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email" },
      password: { type: "string", minLength: 6 },
    },
  },
}
export const registerUserValidationSchema = {
  body: {
    type: "object",
    required: ["email", "phone_number", "password"],
    properties: {
      email: { type: "string", format: "email" },
      full_name: { type: "string" },
      date_of_birth: { type: "string", format: "date-time" },
      phone_number: {
        type: "string",
        pattern: "^\\+?1?[-\\s.]?(\\([2-9][0-9]{2}\\)|[2-9][0-9]{2})[-\\s.]?[0-9]{3}[-\\s.]?[0-9]{4}$",
      },
      password: { type: "string", minLength: 6 },
      address: { type: "string" },
    },
    errorMessage: {
      type: "The request body must be an object.",
      required: {
        email: "The 'email' field is required.",
        phone_number: "The 'phone_number' field is required.",
        password: "The 'password' field is required.",
      },
      properties: {
        email: "The 'email' field must be a string.",
        phone_number: "The 'phone_number' must be a valid phone number.",
        password: "The 'password' field must be a string.",
      },
    },
  }
}
export const userValidationSchemas = {
  registerUserValidation: Joi.object({
    // address: Joi.string()
    //   .required()
    //   .messages({
    //     "string.base": "Select address must be a string.",
    //     "string.empty": "Select address cannot be empty.",
    //   }),
    // full_name: Joi.string()
    //   .min(2)
    //   .required()
    //   .messages({
    //     "string.base": "Name must be a string.",
    //     "string.empty": "Name cannot be empty.",
    //     "string.min": "Name must be at least 2 characters long.",
    //   }),
    // last_name: Joi.string()
    //   .min(2)
    //   .required()
    //   .messages({
    //     "string.base": "Last name must be a string.",
    //     "string.empty": "Last name cannot be empty.",
    //     "string.min": "Last name must be at least 2 characters long.",
    //   }),
    // date_of_birth: Joi.date()
    //   .iso()
    //   .required()
    //   .messages({
    //     "date.base": "Date of birth must be a valid date.",
    //   }),
    phone_number: Joi.string()
      .pattern(/^\+?[0-9]{10,15}$/)
      .required()
      .messages({
        "string.base": "Phone number must be a string.",
        "string.empty": "Phone number cannot be empty.",
        "string.pattern.base": "Phone number must be between 10 to 15 digits, and can include a leading '+'.",
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        "string.base": "Email must be a string.",
        "string.empty": "Email cannot be empty.",
        "string.email": "Please provide a valid email address.",
      }),
    password: Joi.string()
      .min(6)
      .required()
      .messages({
        "string.base": "Password must be a string.",
        "string.empty": "Password cannot be empty.",
        "string.min": "Password must be at least 6 characters long.",
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
      }),
    password: Joi.string()
      .min(6)
      .required()
      .messages({
        "string.base": "Password must be a string.",
        "string.empty": "Password cannot be empty.",
        "string.min": "Password must be at least 6 characters long.",
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
      }),
    otp: Joi.string()
      .length(6)
      .required()
      .messages({
        "string.base": "OTP must be a string.",
        "string.empty": "OTP cannot be empty.",
        "string.length": "OTP must be exactly 6 characters long."
      }),
  }),
};
