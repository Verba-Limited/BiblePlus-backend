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
    category: { type: String, default: "general", index: true },
    tags: [{ type: String, index: true }],
    authorId: { type: String, required: true, index: true },
    featured: { type: Boolean, default: false, index: true },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true
    },
    views: { type: Number, default: 0, index: true }
  },
  { timestamps: true }
);

/* ===========================================================
   🔥 SEARCH INDEX (title + content + summary)
=========================================================== */
blogSchema.index({ title: "text", content: "text", summary: "text" });

/* ===========================================================
   🔥 TRENDING INDEXES
   Used for fast trending retrieval:
   - CreatedAt sorting
   - Views sorting
=========================================================== */
blogSchema.index({ createdAt: -1, views: -1 });

/* ===========================================================
   🔥 OPTIONAL: Composite index for category trending
=========================================================== */
blogSchema.index({ category: 1, createdAt: -1, views: -1 });

/* ===========================================================
   PRE-SAVE: Slug + Summary + Reading Time
=========================================================== */
blogSchema.pre("save", async function () {
  // Auto slug
  if (this.isModified("title")) {
    let baseSlug = slugify(this.title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (await mongoose.models.Blog.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    this.slug = slug;
  }

  // Summary & reading time
  if (this.isModified("content")) {
    const words = this.content.split(/\s+/).length;
    this.readingTime = Math.ceil(words / 200);
    this.summary = this.content.substring(0, 200) + "...";
  }
});

export const Blog = mongoose.model<IBlog>("Blog", blogSchema);
