import { io } from "../../server";

export const SocketNotify = {
  sendToUser: (userId: string, payload: any) => {
    io.to(userId).emit("notification", payload);
  }
};
