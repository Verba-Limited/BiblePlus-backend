import { Server } from "socket.io";

class SocketNotifyClass {
  private io: Server | null = null;

  // userId → Set(socketIds)
  private userSockets = new Map<string, Set<string>>();

  // ------------------------------
  // INITIALIZE SOCKET SERVER
  // ------------------------------
  init(io: Server) {
    this.io = io;

    io.on("connection", (socket) => {
      console.log("🔥 Socket connected:", socket.id);

      // When frontend registers the userId
      socket.on("register", (userId: string) => {
        if (!userId) return;

        if (!this.userSockets.has(userId)) {
          this.userSockets.set(userId, new Set());
        }

        this.userSockets.get(userId)!.add(socket.id);
        console.log(`📌 User ${userId} registered socket ${socket.id}`);
      });

      // Cleanup on disconnect
      socket.on("disconnect", () => {
        console.log("❌ Socket disconnected:", socket.id);

        this.userSockets.forEach((sockets, userId) => {
          if (sockets.has(socket.id)) {
            sockets.delete(socket.id);

            if (sockets.size === 0) {
              this.userSockets.delete(userId);
            }

            console.log(`🧹 Removed socket ${socket.id} from user ${userId}`);
          }
        });
      });
    });
  }

  // ------------------------------
  // SEND TO ONE USER (MULTI-DEVICE)
  // ------------------------------
  sendToUser(userId: string, payload: any) {
    if (!this.io) return;

    const socketSet = this.userSockets.get(userId);
    if (!socketSet || socketSet.size === 0) return;

    socketSet.forEach((socketId) => {
      this.io!.to(socketId).emit("notification", payload);
    });
  }

  // ------------------------------
  // BROADCAST TO ALL CONNECTED USERS
  // ------------------------------
  sendToAll(payload: any) {
    if (!this.io) return;
    this.io.emit("notification", payload);
  }
}

export const SocketNotify = new SocketNotifyClass();
