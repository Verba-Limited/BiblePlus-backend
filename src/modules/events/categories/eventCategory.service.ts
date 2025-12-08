import { EventCategory } from "./eventCategory.model";
import AppError from "../../../core/AppError";

export const EventCategoryService = {
  create: async (data: any) => {
    return await EventCategory.create(data);
  },

  update: async (id: string, data: any) => {
    const updated = await EventCategory.findByIdAndUpdate(id, data, { new: true });
    if (!updated) throw new AppError("Category not found", 404);
    return updated;
  },

  delete: async (id: string) => {
    const deleted = await EventCategory.findByIdAndDelete(id);
    if (!deleted) throw new AppError("Category not found", 404);
    return deleted;
  },

  list: async () => {
    return await EventCategory.find({});
  }
};
