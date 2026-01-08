# BiblePlus API

## Overview
BiblePlus is a high-performance backend infrastructure built with Node.js, Express, and TypeScript. It provides a modular ecosystem for spiritual growth, featuring multi-version Bible readers, AI-powered faith assistance, real-time community engagement, and comprehensive administrative management.

## Features
- **TypeScript**: Type-safe development and scalable architecture
- **Express.js**: RESTful API design for robust routing and middleware handling
- **Mongoose**: Document modeling for MongoDB with strict schema validation
- **Socket.io**: Real-time notification system and connection management
- **JWT & Bcrypt**: Secure authentication with dual-secret tokenization (User/Admin)
- **OpenAI GPT-4**: Intelligent chatbot integration and automated devotional generation
- **Node-Cron**: Automated system tasks for event reminders and analytics
- **Multer**: Multi-channel file handling for banners, avatars, and attachments

## Getting Started
### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Verba-Limited/bibleplus-backend.git
   ```
2. Navigate to the project directory:
   ```bash
   cd bibleplus-backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up environment variables in a `.env` file.
5. Seed initial data (optional):
   ```bash
   npm run import:bible
   npm run import:books
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```

### Environment Variables
List all required variables in your `.env` file:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/bibleplus
JWT_SECRET=your_user_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_ADMIN_SECRET=your_admin_specific_secret
OPENAI_API_KEY=sk-xxxx-xxxx-xxxx
```

## API Documentation
### Base URL
`http://localhost:5000/api`

## Endpoints

### Authentication Module
#### POST /auth/register
**Request**:
```json
{
  "email": "user@example.com",
  "password": "StrongPassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```
**Response**:
```json
{
  "success": true,
  "message": "OTP sent to email",
  "data": { "email": "user@example.com" }
}
```
**Errors**:
- 400: Email already exists

#### POST /auth/verify-otp
**Request**:
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "token": "access_token_string",
    "refreshToken": "refresh_token_string",
    "user": { "id": "...", "email": "..." }
  }
}
```

#### POST /auth/login
**Request**:
```json
{
  "email": "user@example.com",
  "password": "StrongPassword123"
}
```
**Response**:
```json
{
  "success": true,
  "data": { "token": "...", "user": { ... } }
}
```

### Admin Module
#### POST /admin/login
**Request**:
```json
{
  "username": "bibleplus",
  "password": "adminpassword"
}
```
**Response**:
```json
{
  "success": true,
  "token": "admin_jwt_token"
}
```

#### GET /admin/analytics/overview
**Request**:
`Headers: { Authorization: Bearer <admin_token> }`

**Response**:
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalBlogs": 45,
    "totalEvents": 12
  }
}
```

### Bible Module
#### GET /bible/books
**Request**:
`Query Params: version (kjv, asv, web)`

**Response**:
```json
{
  "success": true,
  "data": [{ "name": "Genesis", "chapters": 50 }]
}
```

#### GET /bible/verses
**Request**:
`Query Params: book, chapter, version`

**Response**:
```json
{
  "success": true,
  "data": {
    "book": "Genesis",
    "chapter": 1,
    "verses": [{ "verse": 1, "text": "In the beginning..." }]
  }
}
```

#### POST /highlights
**Request**:
```json
{
  "book": "John",
  "chapter": 3,
  "verse": 16,
  "version": "kjv"
}
```
**Response**:
```json
{
  "success": true,
  "data": { "id": "...", "text": "For God so loved..." }
}
```

### Quiz Module
#### GET /quiz/questions
**Request**:
`Query Params: amount, category, difficulty`

**Response**:
```json
{
  "success": true,
  "data": { "questions": [...] }
}
```

#### POST /quiz/grade
**Request**:
```json
{
  "answers": [{ "index": 0, "answer": 2 }],
  "difficulty": "easy"
}
```
**Response**:
```json
{
  "success": true,
  "data": { "score": 100, "newDifficulty": "medium" }
}
```

### Blog Module
#### GET /blog
**Request**:
`Query Params: page, limit, category, featured`

**Response**:
```json
{
  "success": true,
  "data": { "blogs": [...], "pagination": {...} }
}
```

#### POST /blog/admin
**Request**:
`Multipart/form-data: title, content, category, coverImage (file)`

**Response**:
```json
{
  "success": true,
  "message": "Blog created successfully"
}
```

### Events Module
#### GET /events/upcoming
**Response**:
```json
{
  "success": true,
  "data": [{ "title": "Sunday Worship", "startDate": "..." }]
}
```

#### POST /events/reminders/add
**Request**:
```json
{ "eventId": "event_id_here" }
```
**Response**:
```json
{ "success": true, "message": "Reminder added" }
```

### Prayer Module
#### POST /prayer
**Request**:
`Multipart/form-data: title, description, visibility, image (file)`

**Response**:
```json
{ "success": true, "data": { ... } }
```

#### POST /prayer/like/pray
**Request**:
```json
{ "prayerId": "..." }
```
**Response**:
```json
{ "success": true, "data": { ... } }
```

### Chatbot Module
#### POST /chatbot/chat
**Request**:
```json
{ "message": "What does the Bible say about peace?" }
```
**Response**:
```json
{
  "success": true,
  "data": "The Bible speaks extensively about peace..."
}
```

### Notifications Module
#### GET /notifications
**Response**:
```json
{
  "success": true,
  "notifications": [...],
  "unread": 5
}
```

## Technologies Used
| Technology | Purpose |
| :--- | :--- |
| Node.js | Runtime Environment |
| TypeScript | Programming Language |
| MongoDB | Database |
| Express.js | Web Framework |
| Socket.io | Real-time Communication |
| OpenAI API | AI Processing |
| Multer | File Management |
| Node-Cron | Task Scheduling |

## Contributing
- **Fork the repository** to your own account.
- **Create a feature branch** for any new additions (`git checkout -b feature/NewFeature`).
- **Commit your changes** with descriptive messages (`git commit -m 'Add NewFeature'`).
- **Push to the branch** (`git push origin feature/NewFeature`).
- **Open a Pull Request** for review.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author Info
- **GitHub**: [Verba-Limited](https://github.com/Verba-Limited)
- **Email**: [placeholder@example.com]
- **Website**: [Your Portfolio Placeholder]

[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)