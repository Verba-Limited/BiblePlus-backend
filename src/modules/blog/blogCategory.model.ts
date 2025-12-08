import mongoose, { Schema, Document } from "mongoose";

export interface IBlogCategory extends Document {
  name: string;
  icon: string;
}

const blogCategorySchema = new Schema<IBlogCategory>(
  {
    name: { type: String, required: true, unique: true },
    icon: { type: String, default: "" }
  },
  { timestamps: true }
);

export const BlogCategory = mongoose.model<IBlogCategory>(
  "BlogCategory",
  blogCategorySchema
);
