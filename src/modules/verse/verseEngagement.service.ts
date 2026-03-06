import AppError from "../../core/AppError";
import { VerseLike } from "./verseLike.model";
import { VerseComment } from "./verseComment.model";
import { VerseShare } from "./verseShare.model";
import { VerseOfDay } from "./verseOFDay.model";

export const VerseEngagementService = {

  async like(userId: string, verseId: string) {

    const existing = await VerseLike.findOne({
      user: userId,
      verse: verseId
    });

    if (existing) {
      await existing.deleteOne();
      return { liked: false };
    }

    await VerseLike.create({
      user: userId,
      verse: verseId
    });

    return { liked: true };
  },

  async comment(userId: string, verseId: string, text: string) {

    if (!text) {
      throw new AppError("Comment cannot be empty", 400);
    }

    return VerseComment.create({
      user: userId,
      verse: verseId,
      comment: text
    });
  },

  async getComments(verseId: string) {

    return VerseComment.find({ verse: verseId })
      .populate("user", "username avatar")
      .sort({ createdAt: -1 });
  },

  async share(userId: string, verseId: string) {

    await VerseShare.create({
      user: userId,
      verse: verseId
    });

    return { shared: true };
  },

  async stats(verseId: string) {

    const likes = await VerseLike.countDocuments({ verse: verseId });
    const comments = await VerseComment.countDocuments({ verse: verseId });
    const shares = await VerseShare.countDocuments({ verse: verseId });

    return { likes, comments, shares };
  },

  async userHistory(userId: string) {

    const liked = await VerseLike.find({ user: userId }).populate("verse");

    const commented = await VerseComment.find({
      user: userId
    }).populate("verse");

    const shared = await VerseShare.find({
      user: userId
    }).populate("verse");

    return { liked, commented, shared };
  }
};