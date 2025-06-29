// validationSchemas.js
const Joi = require('joi');
const i18next = require('../helpers/i18n.helper'); // Your i18n configuration

// Function to get translated error messages
const getLocalizedMessage = (key, lng) => i18next.t(key, { lng });

const createLogInSchema = lng =>
  Joi.object({
    email_username: Joi.string()
      .required()
      .messages({
        'any.required': getLocalizedMessage('email', lng),
        'string.empty': getLocalizedMessage('credentials_empty', lng),
      }),
    password: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9]{6,30}$'))
      .messages({
        'string.base': getLocalizedMessage('password_string_base', lng),
        'string.pattern.base': getLocalizedMessage('password', lng),
        'string.empty': getLocalizedMessage('password_empty', lng),
      }),
  });

const createSignUpSchema = lng =>
  Joi.object({
    username: Joi.string()
      .min(6)
      .required()
      .empty('')
      .messages({
        'string.min': getLocalizedMessage('username_min', lng),
        'any.required': getLocalizedMessage('username', lng),
        'string.empty': getLocalizedMessage('username_empty', lng),
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': getLocalizedMessage('email', lng),
        'any.required': getLocalizedMessage('email', lng),
        'string.empty': getLocalizedMessage('email_empty', lng),
      }),
    password: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9]{6,30}$'))
      .messages({
        'string.base': getLocalizedMessage('password_string_base', lng),
        'string.pattern.base': getLocalizedMessage('password', lng),
        'string.empty': getLocalizedMessage('password_empty', lng),
      }),
  });

  

module.exports = { createLogInSchema, createSignUpSchema };
