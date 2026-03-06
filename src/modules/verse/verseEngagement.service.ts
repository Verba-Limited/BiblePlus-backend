import AppError from "../../core/AppError";
import { VerseLike } from "./verseLike.model";
import { VerseComment } from "./verseComment.model";
import { VerseShare } from "./verseShare.model";
import { VerseOfDay } from "./verseOFDay.model";
import { getIO } from "../../socket/socket";

export const VerseEngagementService = {

  /* ============================================
     LIKE / UNLIKE VERSE
  ============================================ */
  async like(userId: string, verseId: string) {

    const existing = await VerseLike.findOne({
      user: userId,
      verse: verseId
    });

    let liked = true;

    if (existing) {
      await existing.deleteOne();
      liked = false;
    } else {
      await VerseLike.create({
        user: userId,
        verse: verseId
      });
    }

    const stats = await this.stats(verseId);

    // 🔥 Real-time update
    const io = getIO();
    io.to(`verse-${verseId}`).emit("verseStatsUpdated", stats);

    return {
      liked,
      stats
    };
  },


  /* ============================================
     COMMENT ON VERSE (REALTIME)
  ============================================ */
  async comment(userId: string, verseId: string, text: string) {

    if (!text || text.trim().length === 0) {
      throw new AppError("Comment cannot be empty", 400);
    }

    const comment = await VerseComment.create({
      user: userId,
      verse: verseId,
      comment: text
    });

    const populated = await comment.populate("user", "username avatar");

    const stats = await this.stats(verseId);

    const io = getIO();

    // 🔥 Send comment live
    io.to(`verse-${verseId}`).emit("newVerseComment", populated);

    // 🔥 Update stats live
    io.to(`verse-${verseId}`).emit("verseStatsUpdated", stats);

    return populated;
  },


  /* ============================================
     GET VERSE COMMENTS
  ============================================ */
  async getComments(verseId: string) {

    return VerseComment.find({ verse: verseId })
      .populate("user", "username avatar")
      .sort({ createdAt: -1 });
  },


  /* ============================================
     SHARE VERSE
  ============================================ */
  async share(userId: string, verseId: string) {

    await VerseShare.create({
      user: userId,
      verse: verseId
    });

    const stats = await this.stats(verseId);

    // 🔥 realtime stats
    const io = getIO();
    io.to(`verse-${verseId}`).emit("verseStatsUpdated", stats);

    return {
      shared: true,
      stats
    };
  },


  /* ============================================
     VERSE STATS
  ============================================ */
  async stats(verseId: string) {

    const [likes, comments, shares] = await Promise.all([
      VerseLike.countDocuments({ verse: verseId }),
      VerseComment.countDocuments({ verse: verseId }),
      VerseShare.countDocuments({ verse: verseId })
    ]);

    return {
      likes,
      comments,
      shares
    };
  },


  /* ============================================
     USER VERSE HISTORY
  ============================================ */
  async userHistory(userId: string) {

    const liked = await VerseLike.find({
      user: userId
    }).populate("verse");

    const commented = await VerseComment.find({
      user: userId
    })
      .populate("verse")
      .sort({ createdAt: -1 });

    const shared = await VerseShare.find({
      user: userId
    })
      .populate("verse")
      .sort({ createdAt: -1 });

    return {
      liked,
      commented,
      shared
    };
  }
};