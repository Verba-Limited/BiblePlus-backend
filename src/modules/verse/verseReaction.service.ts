import { VerseReaction, VerseReactionType } from "./verseReaction.model";
import { getIO } from "../../socket/socket";

export const VerseReactionService = {

  async react(
    userId: string,
    verseId: string,
    reaction: VerseReactionType
  ) {

    const existing = await VerseReaction.findOne({
      user: userId,
      verse: verseId
    });

    if (existing) {
      existing.reaction = reaction;
      await existing.save();
    } else {
      await VerseReaction.create({
        user: userId,
        verse: verseId,
        reaction
      });
    }

    const stats = await this.stats(verseId);

    const io = getIO();

    io.to(`verse-${verseId}`).emit("verseReactionsUpdated", stats);

    return stats;
  },

  async stats(verseId: string) {

    const reactions = await VerseReaction.aggregate([
      {
        $match: {
          verse: new (require("mongoose")).Types.ObjectId(verseId)
        }
      },
      {
        $group: {
          _id: "$reaction",
          count: { $sum: 1 }
        }
      }
    ]);

    const result: any = {
      like: 0,
      love: 0,
      amen: 0,
      powerful: 0,
      sad: 0
    };

    reactions.forEach((r: any) => {
      result[r._id] = r.count;
    });

    return result;
  }

};