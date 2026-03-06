import { Server } from "socket.io";

let io: Server;

export const initSocket = (server: any) => {

  io = new Server(server, {
    cors: {
      origin: "*"
    }
  });

  io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

    socket.on("joinVerse", (verseId: string) => {
      socket.join(`verse-${verseId}`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });

  });
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};