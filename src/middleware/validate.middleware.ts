import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

const validate = (validations: any[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    for (let validation of validations) {
      const result = await validation.run(req);
      if (!result.isEmpty()) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) return next();

    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: errors.array(),
    });
  };
};

export default validate;
