import mongoose, { Schema, Document } from "mongoose";
import slugify from "slugify";

export interface IBlog extends Document {
  title: string;
  slug: string;
  content: string;
  summary: string;
  excerpt: string;
  readingTime: number;
  coverImage: string;
  category: string;
  tags: string[];
  authorId: string;
  author: string;           // ✅ for devto articles (author name as string)
  featured: boolean;
  status: "draft" | "published";
  views: number;
  source: "admin" | "devto"; // ✅ track where blog came from
  externalId: string;        // ✅ devto article ID
  externalUrl: string;       // ✅ original article URL
  isFetched: boolean;        // ✅ has full content been cached
  createdAt: Date;
  updatedAt: Date;
}

const blogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    content: { type: String, default: "" }, // ✅ not required — devto fetches lazily
    summary: { type: String, default: "" },
    excerpt: { type: String, default: "" },
    readingTime: { type: Number, default: 0 },
    coverImage: { type: String, default: "" },
    category: { type: String, default: "general", index: true },
    tags: [{ type: String, index: true }],

    // ✅ authorId for admin blogs, author string for devto
    authorId: { type: String, default: "" },
    author: { type: String, default: "" },

    featured: { type: Boolean, default: false, index: true },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true
    },
    views: { type: Number, default: 0, index: true },

    // ✅ Source tracking
    source: {
      type: String,
      enum: ["admin", "devto"],
      default: "admin",
      index: true
    },
    externalId: { type: String, index: true, sparse: true },
    externalUrl: { type: String, default: "" },
    isFetched: { type: Boolean, default: false }
  },
  { timestamps: true }
);

/* ===========================================================
   SEARCH INDEX
=========================================================== */
blogSchema.index({ title: "text", content: "text", summary: "text" });

/* ===========================================================
   TRENDING INDEXES
=========================================================== */
blogSchema.index({ createdAt: -1, views: -1 });
blogSchema.index({ category: 1, createdAt: -1, views: -1 });

/* ===========================================================
   SOURCE + STATUS INDEX (fast filtered queries)
=========================================================== */
blogSchema.index({ source: 1, status: 1, isFetched: 1 });

/* ===========================================================
   PRE-SAVE: Slug + Summary + Reading Time
=========================================================== */
blogSchema.pre("save", async function () {
  // ✅ Auto slug
  if (this.isModified("title")) {
    let baseSlug = slugify(this.title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (await mongoose.models.Blog.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    this.slug = slug;
  }

  // ✅ Summary + reading time — only if content exists
  if (this.isModified("content") && this.content) {
    const words = this.content.split(/\s+/).length;
    this.readingTime = Math.ceil(words / 200);

    if (!this.summary) {
      this.summary = this.content.substring(0, 200) + "...";
    }

    if (!this.excerpt) {
      this.excerpt = this.content.substring(0, 150) + "...";
    }
  }
});

export const Blog = mongoose.model<IBlog>("Blog", blogSchema);