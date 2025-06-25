# Apollo Chat API Reference

## Overview

This document provides a concise reference for all API endpoints and GraphQL operations available in Apollo Chat. The API is primarily GraphQL-based with complementary REST endpoints for specific functionality.

## Authentication

Apollo Chat uses secure HTTP-only cookies for authentication across all protocols:

| Cookie Name    | Purpose              | Lifespan       |
| -------------- | -------------------- | -------------- |
| Authentication | JWT access token     | Short (15 min) |
| Refresh        | Secure refresh token | Long (7 days)  |

## REST API Endpoints

### Application Endpoints

| Endpoint           | Method | Description                                | Auth Required |
| ------------------ | ------ | ------------------------------------------ | ------------- |
| `/`                | GET    | API health check                           | None          |
| `/test-rate-limit` | GET    | Test endpoint with rate limiting (100/min) | None          |

### Authentication Endpoints

| Endpoint                       | Method | Description                              | Auth Required |
| ------------------------------ | ------ | ---------------------------------------- | ------------- |
| `/auth/login`                  | POST   | Authenticate user and set auth cookies   | Local Auth    |
| `/auth/logout`                 | POST   | Clear auth cookies                       | None          |
| `/auth/refresh`                | POST   | Refresh access token using refresh token | None          |
| `/auth/send-otp`               | POST   | Send verification OTP to email           | None          |
| `/auth/verify-otp`             | POST   | Verify OTP code                          | None          |
| `/auth/check-email-verified`   | POST   | Check if email is verified               | None          |
| `/auth/request-password-reset` | POST   | Request password reset OTP               | None          |
| `/auth/verify-reset-otp`       | POST   | Verify password reset OTP                | None          |
| `/auth/reset-password`         | POST   | Reset password after OTP verification    | None          |
| `/auth/google`                 | GET    | Initiate Google OAuth flow               | None          |
| `/auth/google/callback`        | GET    | Handle Google OAuth callback             | None          |
| `/auth/demo-login`             | POST   | Login with demo account                  | None          |
| `/auth/logout-all`             | POST   | Logout from all devices                  | Local Auth    |

### User Endpoints

| Endpoint       | Method | Description                 | Auth Required |
| -------------- | ------ | --------------------------- | ------------- |
| `/users/image` | POST   | Upload user profile picture | JWT           |

### Chat Endpoints

| Endpoint       | Method | Description               | Auth Required |
| -------------- | ------ | ------------------------- | ------------- |
| `/chats/count` | GET    | Get count of user's chats | JWT           |

### Message Endpoints

| Endpoint          | Method | Description                     | Auth Required |
| ----------------- | ------ | ------------------------------- | ------------- |
| `/messages/count` | GET    | Get count of messages in a chat | JWT           |

## GraphQL API

### User Operations

#### Queries

| Operation     | Description                       | Auth Required |
| ------------- | --------------------------------- | ------------- |
| `me`          | Get current authenticated user    | JWT           |
| `user`        | Get user by ID                    | JWT           |
| `users`       | Get all users                     | JWT           |
| `searchUsers` | Search users by username or email | JWT           |

#### Mutations

| Operation          | Description                 | Auth Required |
| ------------------ | --------------------------- | ------------- |
| `createUser`       | Register new user           | None          |
| `updateUser`       | Update user profile         | JWT           |
| `updateUserStatus` | Update user's online status | JWT           |
| `removeUser`       | Delete current user account | JWT           |

#### Subscriptions

| Operation           | Description                   | Auth Required |
| ------------------- | ----------------------------- | ------------- |
| `userStatusChanged` | Real-time user status updates | JWT           |

### Chat Operations

#### Queries

| Operation     | Description                      | Auth Required |
| ------------- | -------------------------------- | ------------- |
| `chats`       | Get user's chats with pagination | JWT           |
| `publicChats` | Get all public chats             | JWT           |
| `chat`        | Get chat by ID                   | JWT           |

#### Mutations

| Operation          | Description                            | Auth Required |
| ------------------ | -------------------------------------- | ------------- |
| `createChat`       | Create new chat                        | JWT           |
| `joinChat`         | Join an existing chat                  | JWT           |
| `addChatMember`    | Add user to chat                       | JWT           |
| `removeChatMember` | Remove user from chat                  | JWT           |
| `updateChatType`   | Change chat type (private/public/open) | JWT           |
| `pinChat`          | Pin chat for current user              | JWT           |
| `unpinChat`        | Unpin chat for current user            | JWT           |
| `updateChat`       | Update chat name                       | JWT           |
| `removeChat`       | Delete chat                            | JWT           |

#### Subscriptions

| Operation     | Description                             | Auth Required |
| ------------- | --------------------------------------- | ------------- |
| `chatAdded`   | Real-time notification of new chats     | JWT           |
| `chatDeleted` | Real-time notification of deleted chats | JWT           |

### Message Operations

#### Queries

| Operation  | Description                            | Auth Required |
| ---------- | -------------------------------------- | ------------- |
| `messages` | Get messages from chat with pagination | JWT           |

#### Mutations

| Operation       | Description          | Auth Required |
| --------------- | -------------------- | ------------- |
| `createMessage` | Send message to chat | JWT           |

#### Subscriptions

| Operation        | Description                     | Auth Required |
| ---------------- | ------------------------------- | ------------- |
| `messageCreated` | Real-time message notifications | JWT           |

## Data Models

### Core Models

| Model           | Key Fields                                                    |
| --------------- | ------------------------------------------------------------- |
| User            | \_id, email, username, password, imageUrl, status             |
| Chat            | \_id, name, type, creatorId, members, pinnedBy                |
| Message         | \_id, content, userId, chatId, createdAt                      |
| OtpVerification | \_id, email, otp, expiresAt, verified                         |
| RefreshToken    | \_id, userId, token, expiresAt, revoked, userAgent, ipAddress |

### Input Types

| Input Type            | Purpose                                              |
| --------------------- | ---------------------------------------------------- |
| CreateUserInput       | Register new user (email, username, password)        |
| UpdateUserInput       | Update user profile (username, etc.)                 |
| UpdateStatusInput     | Change user status (ONLINE, AWAY, DND, OFFLINE)      |
| CreateChatInput       | Create new chat (name, type, memberIds)              |
| ChatMemberInput       | Add/remove chat members (chatId, userId)             |
| ChatTypeInput         | Change chat type (chatId, type)                      |
| ChatPinInput          | Pin/unpin chat (chatId)                              |
| UpdateChatInput       | Update chat details (chatId, name)                   |
| CreateMessageInput    | Send message (content, chatId)                       |
| GetMessagesArgs       | Fetch messages with pagination (chatId, limit, skip) |
| PaginationArgs        | Common pagination parameters (limit, skip)           |
| MessageCreatedArgs    | Subscribe to messages (chatIds)                      |
| UserStatusChangedArgs | Subscribe to user status changes (userIds)           |

## Error Handling

| Status Code | Description                             |
| ----------- | --------------------------------------- |
| 400         | Bad Request - Invalid input             |
| 401         | Unauthorized - Authentication required  |
| 403         | Forbidden - Insufficient permissions    |
| 404         | Not Found - Resource not found          |
| 429         | Too Many Requests - Rate limit exceeded |
| 500         | Internal Server Error                   |

## Rate Limiting

| Endpoint                       | Limit                   |
| ------------------------------ | ----------------------- |
| `/test-rate-limit`             | 100 requests per minute |
| `/auth/send-otp`               | 1 request per minute    |
| `/auth/verify-otp`             | 5 attempts per minute   |
| `/auth/check-email-verified`   | 10 checks per minute    |
| `/auth/request-password-reset` | 1 request per minute    |
| `/auth/verify-reset-otp`       | 5 attempts per minute   |
| `/auth/reset-password`         | 5 attempts per minute   |
