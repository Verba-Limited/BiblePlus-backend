import AppError from "../../core/AppError";
import { VerseLike } from "./verseLike.model";
import { VerseComment } from "./verseComment.model";
import { VerseShare } from "./verseShare.model";
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

    const io = getIO();
    io.to(`verse-${verseId}`).emit("verseStatsUpdated", stats);

    return {
      liked,
      stats
    };
  },


  /* ============================================
     COMMENT / REPLY (REALTIME)
  ============================================ */
  async comment(
    userId: string,
    verseId: string,
    text: string,
    parentComment?: string
  ) {

    if (!text || text.trim().length === 0) {
      throw new AppError("Comment cannot be empty", 400);
    }

    const comment = await VerseComment.create({
      user: userId,
      verse: verseId,
      comment: text,
      parentComment: parentComment || null
    });

    const populated = await comment.populate("user", "username avatar");

    const stats = await this.stats(verseId);

    const io = getIO();

    // 🔥 Real-time comment
    io.to(`verse-${verseId}`).emit("newVerseComment", populated);

    // 🔥 Real-time stats update
    io.to(`verse-${verseId}`).emit("verseStatsUpdated", stats);

    return populated;
  },


  /* ============================================
     GET THREADED COMMENTS
  ============================================ */
  async getComments(verseId: string) {

    const comments = await VerseComment.find({
      verse: verseId
    })
      .populate("user", "username avatar")
      .sort({ createdAt: 1 });

    const commentMap: any = {};
    const roots: any[] = [];

    comments.forEach(c => {
      commentMap[c._id.toString()] = {
        ...c.toObject(),
        replies: []
      };
    });

    comments.forEach(c => {

      if (c.parentComment) {
        commentMap[c.parentComment.toString()]?.replies.push(
          commentMap[c._id.toString()]
        );
      } else {
        roots.push(commentMap[c._id.toString()]);
      }

    });

    return roots;
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