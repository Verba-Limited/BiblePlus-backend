import { BlogCategory } from "./blogCategory.model";
import AppError from "../../core/AppError";

export const BlogCategoryService = {
  create: async (data: any) => BlogCategory.create(data),
  list: async () => BlogCategory.find({}),
  update: async (id: string, data: any) =>
    BlogCategory.findByIdAndUpdate(id, data, { returnDocument: "after" }),
  delete: async (id: string) => BlogCategory.findByIdAndDelete(id)
};
