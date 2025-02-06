import Joi from 'joi';

export const rentalValidationSchemas = {
  addRentalValidation: Joi.object({
    property: Joi.string()
      .required()
      .messages({
        "string.base": "Property must be a string.",
        "string.empty": "Property cannot be empty.",
        "any.only": "Property must be one of the allowed options.",
        "any.required": "Property is required.",
      }),
      street_address: Joi.string()
      .min(2)
      .required()
      .messages({
        "string.base": "Street Address must be a string.",
        "string.empty": "Street Address cannot be empty.",
        "string.min": "Street Address must be at least 2 characters long.",
        "any.required": "Street Address is required.",
      }),
      appartment: Joi.string()
      .min(2)
      .required()
      .messages({
        "string.base": "Appartment must be a string.",
        "string.empty": "Appartment cannot be empty.",
        "string.min": "Appartment must be at least 2 characters long.",
        "any.required": "Appartment is required.",
      }),

      rent_amount: Joi.string()
    
      .required()
      .messages({
        "string.base": "Rent Amount must be a string.",
        "string.empty": "Rent Amount cannot be empty.",
        "string.min": "Rent Amount must be at least 2 characters long.",
        "any.required": "Rent Amount is required.",
      }),
      due_date: Joi.string()
      .required()
      .messages({
        "date.base": "Due Date must be a valid date.",
        "any.required": "Due Date is required.",
      }),
      month_to_month: Joi.boolean()
    
      .required()
      .messages({
        "string.base": "Month To Month must be a string.",
        "string.empty": "Month To Month cannot be empty.",
        "any.required": "Month To Month is required.",
      }),
      lease_start_date: Joi.date()
  .timestamp('javascript') 
  .required()
  .messages({
    "date.base": "Lease Start Date must be a valid timestamp.",
    "date.format": "Lease Start Date must be a valid Unix timestamp in milliseconds.",
    "any.required": "Lease Start Date is required.",
  }),
  lease_end_date: Joi.date()
  .timestamp('javascript') 
  .required()
  .messages({
    "date.base": "Lease End Date must be a valid timestamp.",
    "date.format": "Lease End Date must be a valid Unix timestamp in milliseconds.",
    "any.required": "Lease End Date is required.",
  }),
  lease_type: Joi.string()
      .required()
      .messages({
        "string.base": "Lease Type must be a string.",
        "string.empty": "Lease Type cannot be empty.",
        "string.pattern.base": "Lease Type must be between 10 to 15 digits, and can include a leading '+'.",
        "any.required": "Lease Type is required.",
      }),
      lease_co_signers: Joi.string()
      .email()
      .required()
      .messages({
        "string.base": "Lease co signers must be a string.",
        "string.empty": "Lease co signers cannot be empty.",
        "any.required": "Lease co signer is required.",
      }),
    lease_source: Joi.string()
      .required()
      .messages({
        "string.base": "Lease Source must be a string.",
        "string.empty": "Lease Source cannot be empty.",
        "any.required": "Lease Source is required.",
      }),

  }),

};