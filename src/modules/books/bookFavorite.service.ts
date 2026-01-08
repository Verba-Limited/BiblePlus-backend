import { BookFavorite } from "./bookFavorite.model";

export const BookFavoriteService = {
  addFavorite: async (userId: string, bookId: string) => {
    const exists = await BookFavorite.findOne({ userId, bookId });
    if (exists) return exists;

    return await BookFavorite.create({ userId, bookId });
  },

  removeFavorite: async (userId: string, bookId: string) => {
    return await BookFavorite.deleteOne({ userId, bookId });
  },
  

  getFavorites: async (userId: string) => {
    return await BookFavorite.find({ userId }).populate("bookId");
  }
};
