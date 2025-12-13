<div align="center">
✝️ BiblePlus API
A modern Christian community backend with Bible study tools, events, blogs, prayers, quizzes & real-time notifications.

Built with ❤️ using Node.js, Express, TypeScript, MongoDB, Mongoose, Socket.io, and JWT Authentication.

</div>
📑 Table of Contents

🚀 Features

📂 Project Structure

⚙️ Environment Variables

🛠️ Installation & Setup

🔐 Authentication Module

📖 Bible Module

📝 Blog Module

⛪ Prayer Wall Module

📚 Books Library Module

🎉 Events Module

🔔 Notifications Module

🤖 Chatbot Module

🧠 Quiz Module

🛡️ Admin System

📡 WebSockets

⏰ Cron Jobs

📬 Postman Collection

📄 License

🚀 Features
🔐 User + Admin authentication (JWT-based)
📖 Bible search, chapters, verses, highlights
📝 Blog system (CRUD, likes, comments, bookmarks, trending)
⛪ Prayer request system + likes + admin approval
🎙️ Events system + livestream + speakers + reminders
📚 Books module (PDF upload, chapters, favorites, reading progress)
🔔 Notifications (real-time + stored)
🤖 AI Chatbot (OpenAI API + biblical context)
🧠 Quiz module (Daily quiz + streaks + leaderboard)
📡 WebSockets for instant updates
⏰ Cron-based event reminders
📂 Project Structure
src/
 ├── core/
 │    └── AppError.ts
 ├── middleware/
 │    ├── auth.middleware.ts
 │    └── admin.middleware.ts
 ├── modules/
 │    ├── auth/
 │    ├── bible/
 │    ├── blog/
 │    ├── books/
 │    ├── chatbot/
 │    ├── events/
 │    ├── notifications/
 │    ├── prayer/
 │    └── quiz/
 ├── server.ts
 └── app.ts

⚙️ Environment Variables

Create a .env file:

PORT=5000
MONGO_URI=mongodb://localhost:27017/bibleplus

JWT_SECRET=user_token_secret_123
JWT_REFRESH_SECRET=refresh_token_secret_123
JWT_ADMIN_SECRET=admin_token_secret_456

OPENAI_API_KEY=your_key_here

🛠️ Installation & Setup
git clone https://github.com/halxdocs/bibleplus-backend.git
cd bibleplus-backend
npm install
npm run dev


Start server:

http://localhost:5000

🔐 Authentication Module
REGISTER
POST /api/auth/register
{
  "email": "user@mail.com",
  "password": "123456"
}

VERIFY OTP
POST /api/auth/verify-otp
{
  "email": "user@mail.com",
  "otp": "123456"
}

LOGIN
POST /api/auth/login

FORGOT PASSWORD + OTP RESET
POST /api/auth/forgot
POST /api/auth/reset

📖 Bible Module
Get Books
GET /api/bible/books?version=kjv

Get Verses
GET /api/bible/verses?book=Genesis&chapter=1&version=kjv

Search Bible
GET /api/bible/search?q=Moses&version=kjv

Highlight Verse
POST /api/highlights
Headers: Authorization: Bearer <token>

📝 Blog Module
Create Blog (ADMIN)
POST /api/blog
Headers: Authorization: Bearer <admin_token>
form-data:
  title: "Walking in Faith"
  content: "..."
  category: "faith"
  coverImage: <file>

Get Blog
GET /api/blog/:slug

Blog Likes
POST /api/blog/likes/like

Trending
GET /api/blog/trending

⛪ Prayer Wall Module
Create Prayer
POST /api/prayer
Authorization: Bearer <token>
form-data:
  text: "Please pray for me"
  image: <optional>

Admin Approve
PUT /api/prayer/:id/approve
Authorization: Bearer <admin_token>

📚 Books Library Module
Upload PDF
POST /api/books/upload
Authorization: Bearer <token>
file: <pdf>

Chapters & Reading Progress
GET /api/books/:id/chapters
POST /api/books/progress/update

🎉 Events Module
Create Event (Admin)
POST /api/events
Authorization: Bearer <admin_token>

Livestream Update
PUT /api/events/:id/live

Reminders
POST /api/events/reminders/add

🔔 Notifications Module (Real-time + Stored)
Get Notifications
GET /api/notifications
Authorization: Bearer <token>

Mark as Read
PUT /api/notifications/:id/read

🤖 Chatbot Module
Chat
POST /api/chatbot/chat
Authorization: Bearer <token>
{
  "message": "Who was Moses?"
}

History
GET /api/chatbot/history

🧠 Quiz Module
Get Random Questions
GET /api/quiz/questions?amount=10&difficulty=easy

Daily Quiz
GET /api/quiz/daily
POST /api/quiz/daily/submit

Leaderboard
GET /api/quiz/leaderboard

🛡️ Admin System
Admin Login
POST /api/admin/login
{
  "username": "bibleplus",
  "password": "adminbible12"
}

Events, Blogs, Prayers have admin controls using:
Authorization: Bearer <ADMIN_JWT>

📡 WebSockets

Real-time notifications are delivered when:

new event is posted

prayer is approved

user receives notification

livestream updates

Client listens using Socket.io:

socket.emit("register", userId);

socket.on("notification", (data) => {
  console.log("NEW NOTIFICATION:", data);
});

⏰ Cron Jobs
Event Reminder Engine

Runs every minute:

cron.schedule("* * * * *", () => EventReminderService.processReminders());
