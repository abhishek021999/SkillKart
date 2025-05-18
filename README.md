# SkillKart - Curated Learning Roadmap Builder

SkillKart is a full-stack MERN application that helps users build and follow structured learning roadmaps. It provides a platform for content curators to create detailed learning paths and for learners to track their progress while engaging with a community of like-minded individuals.

## Features

### For Learners
- Browse and search learning roadmaps by category and difficulty
- Track progress through interactive roadmaps
- Engage in community discussions
- Earn XP points and badges for completing topics
- Maintain learning streaks
- Customize profile with learning goals and interests

### For Content Curators (Admins)
- Create and manage learning roadmaps
- Structure content into weeks and topics
- Add various types of learning resources (videos, articles, quizzes)
- Monitor user engagement and progress

## Tech Stack

### Frontend
- React with Vite
- Chakra UI for component library
- React Router for navigation
- Axios for API calls
- Context API for state management

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/skillkart.git
cd skillkart
```

2. Install dependencies:
```bash
npm run install-all
```

3. Create a `.env` file in the root directory with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

4. Start the development servers:
```bash
npm run dev
```

This will start both the backend server (port 5000) and frontend development server (port 5173).

## Project Structure

```
skillkart/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Roadmap.js
│   │   └── Discussion.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── roadmaps.js
│   │   └── discussions.js
│   ├── middleware/
│   │   └── auth.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   └── App.jsx
│   └── package.json
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/xp` - Update XP points
- `POST /api/users/badges` - Add badge
- `PUT /api/users/streak` - Update streak

### Roadmaps
- `GET /api/roadmaps` - Get all roadmaps
- `GET /api/roadmaps/:id` - Get roadmap by ID
- `POST /api/roadmaps` - Create new roadmap (admin only)
- `PUT /api/roadmaps/:id` - Update roadmap (admin only)
- `DELETE /api/roadmaps/:id` - Delete roadmap (admin only)
- `GET /api/roadmaps/category/:category` - Get roadmaps by category
- `GET /api/roadmaps/difficulty/:difficulty` - Get roadmaps by difficulty

### Discussions
- `GET /api/discussions/roadmap/:roadmapId` - Get discussions for a roadmap
- `GET /api/discussions/topic/:topicId` - Get discussions for a topic
- `POST /api/discussions` - Create new discussion
- `POST /api/discussions/:id/comments` - Add comment to discussion
- `PUT /api/discussions/:id/like` - Like/Unlike discussion
- `DELETE /api/discussions/:id` - Delete discussion

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Acknowledgments

- Chakra UI for the component library
- MongoDB for the database
- Express.js for the backend framework
- React for the frontend framework 