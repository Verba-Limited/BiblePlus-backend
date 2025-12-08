import mongoose, { Schema, Document } from "mongoose";
import slugify from "slugify";

export interface IBlog extends Document {
  title: string;
  slug: string;
  content: string;
  summary: string;
  readingTime: number;
  coverImage: string;
  category: string;
  tags: string[];
  authorId: string;
  featured: boolean;
  status: "draft" | "published";
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const blogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    content: { type: String, required: true },
    summary: { type: String, default: "" },
    readingTime: { type: Number, default: 0 },
    coverImage: { type: String, default: "" },
    category: { type: String, default: "general" },
    tags: [{ type: String }],
    authorId: { type: String, required: true },
    featured: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft"
    },
    views: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// ===========================================================
// 🔥 Optimized search index (title + content)
// ===========================================================
blogSchema.index({ title: "text", content: "text", summary: "text" });

// ===========================================================
// 🔥 Pre-save hook using PROMISE (no next(), no TS errors)
// ===========================================================
blogSchema.pre("save", async function () {
  // Auto-generate slug
  if (this.isModified("title")) {
    let baseSlug = slugify(this.title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    // Collisions → append -1, -2, etc.
    while (await mongoose.models.Blog.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    this.slug = slug;
  }

  // Auto summary + reading time
  if (this.isModified("content")) {
    const words = this.content.split(/\s+/).length;
    this.readingTime = Math.ceil(words / 200); // 200 wpm
    this.summary = this.content.substring(0, 200) + "...";
  }
});

// ===========================================================

export const Blog = mongoose.model<IBlog>("Blog", blogSchema);
