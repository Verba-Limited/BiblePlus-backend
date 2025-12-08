import { EventComment } from "./eventComment.model";
import AppError from "../../../core/AppError";
import { Event } from "../event.model";

export const EventCommentService = {
  addComment: async (userId: string, eventId: string, text: string) => {
    const event = await Event.findById(eventId);
    if (!event) throw new AppError("Event not found", 404);

    return await EventComment.create({ userId, eventId, text });
  },

  deleteComment: async (commentId: string, userId: string, isAdmin: boolean) => {
    const comment = await EventComment.findById(commentId);
    if (!comment) throw new AppError("Comment not found", 404);

    // Only admin OR owner can delete
    if (!isAdmin && comment.userId !== userId)
      throw new AppError("Not authorized to delete this comment", 403);

    await comment.deleteOne();
    return { message: "Comment deleted" };
  },

  getComments: async (eventId: string) => {
    return await EventComment.find({ eventId }).sort({ createdAt: -1 });
  }
};
