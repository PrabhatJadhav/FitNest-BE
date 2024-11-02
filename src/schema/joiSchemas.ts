const Joi = require("joi");

const emailSchema = Joi.object({
  email: Joi.string().email().required(),
});
// const registerSchema = Joi.object({
//   email: Joi.string().email().required(),
// });

// const loginSchema = Joi.object({
//   email: Joi.string().email().required(),
//   password: Joi.number().required(),
// });

export { emailSchema };
