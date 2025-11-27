import { body } from "express-validator";

export const registerValidator = [
  body("email").isEmail().withMessage("Invalid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

export const loginValidator = [
  body("email").isEmail().withMessage("Invalid email"),
  body("password").notEmpty().withMessage("Password required"),
];

export const resetPasswordValidator = [
  body("email").isEmail(),
  body("otp").notEmpty(),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];
