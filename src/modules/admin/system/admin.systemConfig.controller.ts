import { Request, Response, NextFunction } from "express";
import { SystemConfig } from "./systemConfig.model";
import AppError from "../../../core/AppError";

export const SystemConfigController = {
  /* =====================================================
     GET ALL CONFIGS
  ===================================================== */
  getAll: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const configs = await SystemConfig.find()
        .sort({ category: 1, key: 1 })
        .populate("updatedBy", "username");

      res.status(200).json({
        success: true,
        data: configs
      });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
     GET CONFIG BY KEY
  ===================================================== */
  getByKey: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const config = await SystemConfig.findOne({ key: req.params.key });
      if (!config) {
        throw new AppError("Config not found", 404);
      }
      res.status(200).json({ success: true, data: config });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
     UPDATE CONFIG VALUE
  ===================================================== */
  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { value } = req.body;
      if (value === undefined || value === null) {
        throw new AppError("value is required", 400);
      }

      const config = await SystemConfig.findOneAndUpdate(
        { key: req.params.key },
        {
          value: String(value),
          updatedBy: req.userId
        },
        { new: true }
      );

      if (!config) {
        throw new AppError("Config not found", 404);
      }

      res.status(200).json({
        success: true,
        message: `Config "${config.label}" updated to "${value}"`,
        data: config
      });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
     CREATE NEW CONFIG (superadmin power-user feature)
  ===================================================== */
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { key, value, type, label, description, category } = req.body;

      if (!key || !label) {
        throw new AppError("key and label are required", 400);
      }

      const existing = await SystemConfig.findOne({ key });
      if (existing) {
        throw new AppError(`Config with key "${key}" already exists`, 409);
      }

      const config = await SystemConfig.create({
        key,
        value: String(value ?? "false"),
        type: type || "boolean",
        label,
        description: description || "",
        category: category || "feature_flags",
        updatedBy: req.userId
      });

      res.status(201).json({
        success: true,
        message: "Config created",
        data: config
      });
    } catch (err) {
      next(err);
    }
  }
};
