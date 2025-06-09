# Apollo Chat

A modern, real-time messaging application built with a full-stack TypeScript architecture, implementing GraphQL, WebSockets, and reactive state management.

![Apollo Chat](https://via.placeholder.com/800x400?text=Apollo+Chat+Screenshot)

## Features

- **Real-time Messaging** - Instant message delivery using GraphQL subscriptions
- **User Authentication** - Secure JWT-based authentication with httpOnly cookies
- **Responsive Design** - Modern UI that works across all device sizes
- **File Uploads** - Share images and files in conversations
- **Pagination** - Efficient loading of chat history and message lists
- **Profile Management** - Customize user profiles with images

## Tech Stack

### Frontend

- React 18 with TypeScript
- Apollo Client for state management
- Material UI component library
- React Router DOM for navigation

### Backend

- NestJS with TypeScript
- GraphQL with Apollo Server
- MongoDB with Mongoose
- JWT Authentication with Passport.js
- AWS S3 for file storage

### Cloud Infrastructure

- AWS Amplify for frontend hosting
- AWS Elastic Beanstalk for backend services
- AWS CloudFront for content delivery
- MongoDB Atlas for database
- Redis for Pub/Sub messaging
- CI/CD with AWS CodePipeline

## Architecture

The application follows a clean architecture with separation of concerns:

- **GraphQL API Layer** - Type-safe operations with code generation
- **Repository Pattern** - Abstraction over database operations
- **JWT Authentication** - Secure user sessions
- **Real-time Communication** - WebSocket-based GraphQL subscriptions
- **Responsive UI** - Material Design principles with adaptive layouts

## Development Approach

- Domain-driven design principles
- Feature-driven development
- Type safety across the entire stack
- Performance-focused implementation
- Comprehensive validation and error handling

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB
- AWS Account (for deployment)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/apollo-chat.git

# Install dependencies for frontend
cd apollo-chat/client
npm install

# Install dependencies for backend
cd ../server
npm install
```

### Environment Setup

Create `.env` files in both client and server directories:

**Client (.env)**

```
REACT_APP_API_URL=http://localhost:3001/graphql
```

**Server (.env)**

```
MONGODB_URI=mongodb://localhost:27017/apollo-chat
JWT_SECRET=your_jwt_secret
PORT=3001
```

### Running Locally

```bash
# Start backend server
cd server
npm run start:dev

# Start frontend application in a new terminal
cd client
npm start
```

## Deployment

The application is configured for deployment to AWS:

- Frontend: AWS Amplify
- Backend: AWS Elastic Beanstalk
- Database: MongoDB Atlas
- Real-time messaging: ElastiCache (Redis)
- File storage: S3 Buckets

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built following the "Real Time Chat App With React + NestJS & GraphQL" course
- Special thanks to the NestJS and Apollo GraphQL communities
