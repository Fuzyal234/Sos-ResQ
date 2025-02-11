import Joi from 'joi';

export const agentValidationSchema = Joi.object({
    first_name: Joi.string()
      .min(2)
      .required()
      .messages({
        "string.base": "First name must be a string.",
        "string.empty": "First name cannot be empty.",
        "string.min": "First name must be at least 2 characters long.",
      }),
    last_name: Joi.string()
      .min(2)
      .required()
      .messages({
        "string.base": "Last name must be a string.",
        "string.empty": "Last name cannot be empty.",
        "string.min": "Last name must be at least 2 characters long.",
      }),
    date_of_birth: Joi.date()
      .iso()
      .required()
      .messages({
        "date.base": "Date of birth must be a valid date.",
      }),
    phone_number: Joi.string()
      .required()
      .messages({
        "string.base": "Phone number must be a string.",
        "string.empty": "Phone number cannot be empty.",
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        "string.base": "Email must be a string.",
        "string.empty": "Email cannot be empty.",
        "string.email": "Please provide a valid email address.",
      })
  });