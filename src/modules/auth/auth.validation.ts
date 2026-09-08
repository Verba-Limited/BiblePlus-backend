import { body } from "express-validator";

export const registerValidator = [
  body("email").isEmail().withMessage("Invalid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("firstName").notEmpty().withMessage("First name is required"),
  body("lastName").notEmpty().withMessage("Last name is required"),
];

export const loginValidator = [
  body("email").isEmail().withMessage("Invalid email"),
  body("password").notEmpty().withMessage("Password required"),
];

export const resetPasswordValidator = [
  body("email").isEmail().withMessage("A valid email is required"),

  // The handler accepts `otp` or `code`; the validator has to allow
  // both or it rejects the alias before the handler ever runs.
  body("otp")
    .custom((value, { req }) => {
      const code = value ?? req.body?.code;
      return typeof code === "string" ? code.trim().length > 0 : code != null;
    })
    .withMessage("OTP is required"),

  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];
