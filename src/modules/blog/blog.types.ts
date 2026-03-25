export interface IBlog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  thumbnail?: string;
  category?: string;
  authorId?: string;
  status: "draft" | "published";
  views: number;
  source?: "devto" | "admin";
  isFetched?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
