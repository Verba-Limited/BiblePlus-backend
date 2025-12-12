export interface TrendingBlogDTO {
  id: string;
  title: string;
  summary: string;
  coverImage: string;
  category: string;
  views: number;
  createdAt: string;
}

export interface TrendingResponseDTO {
  success: boolean;
  data: TrendingBlogDTO[];
}
